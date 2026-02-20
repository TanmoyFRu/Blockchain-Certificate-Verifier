from pydantic import BaseModel
from typing import Optional

class OrganizationCreate(BaseModel):
    name: str
    wallet_address: Optional[str] = None
    domain: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    wallet_address: Optional[str] = None
    domain: Optional[str] = None

class OrganizationOut(BaseModel):
    id: int
    name: str
    wallet_address: Optional[str]
    domain: Optional[str]

    model_config = {"from_attributes": True}
