from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CertificateCreate(BaseModel):
    owner_name: str
    course_name: str
    organization_id: int

class CertificateOut(BaseModel):
    id: int
    cert_hash: str
    owner_name: str
    course_name: str
    storage_url: str
    tx_hash: Optional[str]
    created_at: datetime
    revoked: bool

    model_config = {"from_attributes": True}
