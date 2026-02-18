from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.certificate import CertificateCreate, CertificateOut
from app.models.certificate import Certificate
from app.models.organization import Organization
from app.services.certificate_service import generate_certificate_pdf, get_file_hash
from app.services.blockchain_service import blockchain_service

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.post("/issue", response_model=CertificateOut)
def issue_certificate(data: CertificateCreate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == data.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # 1. Generate PDF
    try:
        pdf_path = generate_certificate_pdf(data.owner_name, data.course_name, org.name)
        
        # 2. Get Hash
        cert_hash = get_file_hash(pdf_path)

        # 3. Store on Blockchain
        tx_hash = blockchain_service.issue_on_chain(cert_hash)

        # 4. Save to DB
        new_cert = Certificate(
            cert_hash=cert_hash,
            owner_name=data.owner_name,
            course_name=data.course_name,
            issued_by=org.id,
            storage_url=pdf_path,
            tx_hash=tx_hash
        )
        db.add(new_cert)
        db.commit()
        db.refresh(new_cert)
        return new_cert
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to issue certificate: {str(e)}")

@router.get("/verify/{cert_hash}")
def verify_certificate(cert_hash: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.cert_hash == cert_hash).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found in local records")
    
    # Optional blockchain check
    on_chain_data = blockchain_service.verify_on_chain(cert_hash)
    
    status = {
        "local_record": cert,
        "on_chain_status": on_chain_data if on_chain_data else "Not checked or not found on-chain"
    }
    
    return status
