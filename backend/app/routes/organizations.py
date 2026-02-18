from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.organization import OrganizationCreate, OrganizationOut
from app.models.organization import Organization

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("/", response_model=OrganizationOut)
def create_organization(data: OrganizationCreate, db: Session = Depends(get_db)):
    existing = db.query(Organization).filter(Organization.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization already exists")
    
    org = Organization(name=data.name, wallet_address=data.wallet_address)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org
