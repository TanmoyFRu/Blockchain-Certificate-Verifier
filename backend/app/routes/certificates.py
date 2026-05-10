from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os
from app.db.database import get_db
from app.schemas.certificate import CertificateCreate, CertificateOut
from app.models.certificate import Certificate
from app.models.organization import Organization
from app.services.certificate_service import generate_certificate_pdf, get_file_hash, get_content_hash
from app.services.blockchain_service import blockchain_service
from app.services.storage_service import storage_service
from app.services.auth_service import get_current_user, get_user_by_id

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.post("/issue", response_model=CertificateOut)
def issue_certificate(data: CertificateCreate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    user = get_user_by_id(db, current_user_id)
    if not user.organization_id:
        raise HTTPException(status_code=400, detail="User is not associated with an organization")

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    cert_hash = get_content_hash(data.owner_name, data.course_name, org.name)

    try:
        pdf_path = generate_certificate_pdf(data.owner_name, data.course_name, org.name, cert_hash)

        file_hash = get_file_hash(pdf_path)

        file_name = os.path.basename(pdf_path)
        minio_object_name = f"certs/{file_name}"
        stored_path = storage_service.upload_file(pdf_path, minio_object_name)

        tx_hash = blockchain_service.issue_on_chain(cert_hash)

        new_cert = Certificate(
            cert_hash=cert_hash,
            owner_name=data.owner_name,
            course_name=data.course_name,
            issued_by=org.id,
            storage_url=stored_path,
            file_hash=file_hash,
            tx_hash=tx_hash
        )
        db.add(new_cert)
        db.commit()
        db.refresh(new_cert)

        if os.path.exists(pdf_path):
            os.remove(pdf_path)

        return new_cert
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to issue certificate: {str(e)}")

@router.post("/{cert_id}/revoke")
def revoke_certificate(cert_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    user = get_user_by_id(db, current_user_id)
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert.issued_by != user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized to revoke this certificate")

    if cert.revoked:
        raise HTTPException(status_code=400, detail="Certificate already revoked")

    try:
        blockchain_service.revoke_on_chain(cert.cert_hash)
        cert.revoked = True
        db.commit()
        return {"message": "Certificate revoked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke on blockchain: {str(e)}")

@router.delete("/{cert_id}")
def delete_certificate(cert_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    user = get_user_by_id(db, current_user_id)
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert.issued_by != user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this certificate")

    db.delete(cert)
    db.commit()
    return {"message": "Certificate deleted successfully"}

@router.get("/verify/{cert_hash}")
def verify_certificate(cert_hash: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.cert_hash == cert_hash).first()
    if not cert:
        raise HTTPException(status_code=404, detail=f"Certificate not found. Hash: {cert_hash}")

    on_chain_data = blockchain_service.verify_on_chain(cert_hash)

    pdf_url = ""
    if cert.storage_url:
        pdf_url = storage_service.get_file_url(cert.storage_url)

    return {
        "local_record": CertificateOut.model_validate(cert).model_dump(),
        "on_chain": on_chain_data if on_chain_data else {"exists": False, "revoked": False, "issuer": "None", "timestamp": 0},
        "pdf_url": pdf_url
    }

@router.post("/verify-file")
async def verify_certificate_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    temp_path = f"storage/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        file_hash = get_file_hash(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    cert = db.query(Certificate).filter(Certificate.file_hash == file_hash).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No certificate matches this file")

    return verify_certificate(cert.cert_hash, db)

@router.get("/", response_model=list[CertificateOut])
def list_certificates(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    user = get_user_by_id(db, current_user_id)
    if not user.organization_id:
        return []

    certs = db.query(Certificate).filter(Certificate.issued_by == user.organization_id).order_by(Certificate.created_at.desc()).all()
    return certs
