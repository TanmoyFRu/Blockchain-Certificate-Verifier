from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import os
from app.db.database import get_db
from app.schemas.certificate import CertificateCreate, CertificateOut
from app.models.certificate import Certificate
from app.models.organization import Organization
from app.services.certificate_service import generate_certificate_pdf, get_file_hash
from app.services.blockchain_service import blockchain_service
from app.services.minio_service import minio_service

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.post("/issue", response_model=CertificateOut)
def issue_certificate(data: CertificateCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == data.organization_id).first()
    if not org:
        # Auto-create organization for demo purposes if it doesn't exist
        org = Organization(id=data.organization_id, name="Demo University", wallet_address="0xDemoAddress...")
        db.add(org)
        db.commit()
        db.refresh(org)

    # 1. Generate PDF
    try:
        pdf_path = generate_certificate_pdf(data.owner_name, data.course_name, org.name)
        
        # 2. Get Hash
        cert_hash = get_file_hash(pdf_path)

        # 3. Store on MinIO
        file_name = os.path.basename(pdf_path)
        minio_object_name = f"certs/{file_name}" # e.g. certs/cert_John_Doe_2024.pdf
        try:
             minio_service.upload_file(pdf_path, minio_object_name)
        except Exception as e:
            print(f"Warning: MinIO upload failed: {e}")

        # 4. Store on Blockchain
        tx_hash = blockchain_service.issue_on_chain(cert_hash)

        # 5. Save to DB
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
        return new_cert
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to issue certificate: {str(e)}")

@router.delete("/{cert_id}")
def delete_certificate(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    db.delete(cert)
    db.commit()
    return {"message": "Certificate deleted successfully"}

@router.get("/verify/{cert_hash}")
def verify_certificate(cert_hash: str, db: Session = Depends(get_db)):
    print(f"DEBUG: Searching for hash: '{cert_hash}'")  # DEBUG LOG
    cert = db.query(Certificate).filter(Certificate.cert_hash == cert_hash).first()
    if not cert:
        print(f"DEBUG: Certificate NOT FOUND for hash: '{cert_hash}'") # DEBUG LOG
        raise HTTPException(status_code=404, detail=f"Certificate not found in local records. Searched for: {cert_hash}")
    
    on_chain_data = blockchain_service.verify_on_chain(cert_hash)
    
    # Generate Presigned URL for viewing
    pdf_url = ""
    if cert.storage_url:
        # If it's a MinIO path (e.g. certs/...) use MinIO service
        if cert.storage_url.startswith("certs/"):
             pdf_url = minio_service.get_file_url(cert.storage_url)
        else:
             # Fallback for old local files (though they won't be accessible unless hosted statically)
             pdf_url = cert.storage_url

    status = {
        "local_record": cert,
        "on_chain_status": on_chain_data if on_chain_data else "Not checked or not found on-chain",
        "pdf_url": pdf_url
    }
    
    return status

@router.post("/verify-file")
async def verify_certificate_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    temp_path = f"storage/temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Get hash
    try:
        file_hash = get_file_hash(temp_path)
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    return verify_certificate(file_hash, db)

@router.get("/", response_model=list[dict])
def list_certificates(org_id: int, db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.issued_by == org_id).order_by(Certificate.created_at.desc()).all()
    
    if not certs and org_id:
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
                "issued_by": org_id,
                "tx_hash": f"0x{random.randint(100000, 999999)}...",
                "storage_url": "",
                "revoked": False
            })
        return mock_certs
        
    return certs
