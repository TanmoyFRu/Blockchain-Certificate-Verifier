from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.organization import OrganizationCreate, OrganizationOut, OrganizationUpdate
from app.models.organization import Organization

from app.services.auth_service import get_current_user

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("/me", response_model=OrganizationOut)
def get_my_organization(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    from app.services.auth_service import get_user_by_id
    user = get_user_by_id(db, current_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or not authenticated")
        
    if not user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User is not associated with an organization")
        
    org = db.query(Organization).filter(Organization.id == user.organization_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org

@router.post("/", response_model=OrganizationOut)
def create_organization(data: OrganizationCreate, db: Session = Depends(get_db)):
    existing = db.query(Organization).filter(Organization.name == data.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization already exists")
    
    org = Organization(name=data.name, wallet_address=data.wallet_address, domain=data.domain)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org

@router.put("/{org_id}", response_model=OrganizationOut)
def update_organization(org_id: int, data: OrganizationUpdate, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user)):
    from app.services.auth_service import get_user_by_id
    user = get_user_by_id(db, current_user_id)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or not authenticated")

    if int(org_id) != user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this organization")

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    
    if data.name:
        org.name = data.name
    if data.wallet_address:
        org.wallet_address = data.wallet_address
    if data.domain:
        org.domain = data.domain
        
    db.commit()
    db.refresh(org)
    return org
