from pydantic import BaseModel
from typing import Optional

class OrganizationCreate(BaseModel):
    name: str
    wallet_address: Optional[str] = None

class OrganizationOut(BaseModel):
    id: int
    name: str
    wallet_address: Optional[str]

    model_config = {"from_attributes": True}
