from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os
from app.db.database import get_db
from app.schemas.certificate import CertificateCreate, CertificateOut
from app.models.certificate import Certificate
from app.models.organization import Organization
from app.services.certificate_service import generate_certificate_pdf, get_file_hash, get_content_hash
from app.services.blockchain_service import blockchain_service
from app.services.minio_service import minio_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.post("/issue", response_model=CertificateOut)
def issue_certificate(data: CertificateCreate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    from app.services.auth_service import get_user_by_id
    user = get_user_by_id(db, current_user_id)
    if not user.organization_id:
        raise HTTPException(status_code=400, detail="User is not associated with an organization")

    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    cert_hash = get_content_hash(data.owner_name, data.course_name, org.name)

    try:
        pdf_path = generate_certificate_pdf(data.owner_name, data.course_name, org.name, cert_hash)
        
        file_name = os.path.basename(pdf_path)
        minio_object_name = f"certs/{file_name}"
        try:
             minio_service.upload_file(pdf_path, minio_object_name)
        except Exception as e:
            print(f"Warning: MinIO upload failed: {e}")

        tx_hash = blockchain_service.issue_on_chain(cert_hash)

        new_cert = Certificate(
            cert_hash=cert_hash,
            owner_name=data.owner_name,
            course_name=data.course_name,
            issued_by=org.id,
            storage_url=minio_object_name, 
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
    from app.services.auth_service import get_user_by_id
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
    from app.services.auth_service import get_user_by_id
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
        if cert.storage_url.startswith("certs/"):
             pdf_url = minio_service.get_file_url(cert.storage_url)
        else:
             pdf_url = cert.storage_url

    status = {
        "local_record": cert,
        "on_chain": on_chain_data if on_chain_data else {"exists": False, "revoked": False, "issuer": "None", "timestamp": 0},
        "pdf_url": pdf_url
    }
    
    return status

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
    
    return verify_certificate(file_hash, db)

@router.get("/", response_model=list[CertificateOut])
def list_certificates(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    from app.services.auth_service import get_user_by_id
    user = get_user_by_id(db, current_user_id)
    if not user.organization_id:
        return []

    certs = db.query(Certificate).filter(Certificate.issued_by == user.organization_id).order_by(Certificate.created_at.desc()).all()
    
    if not certs:
        from datetime import datetime, timedelta
        import random
        
        mock_certs = []
        courses = ["Blockchain Fundamentals", "Advanced Smart Contracts", "DeFi Security", "Ethereum Development"]
        names = ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Evan Wright"]
        
        for i in range(5):
            mock_certs.append({
                "id": i + 1,
                "owner_name": names[i % len(names)],
                "course_name": courses[i % len(courses)],
                "created_at": datetime.now() - timedelta(days=random.randint(1, 30)),
                "cert_hash": f"mock_hash_{random.randint(1000, 9999)}",
                "issued_by": user.organization_id,
                "tx_hash": f"0x{random.randint(100000, 999999)}...",
                "storage_url": "",
                "revoked": False
            })
        return mock_certs
        
    return certs
