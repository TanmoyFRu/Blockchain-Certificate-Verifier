from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "admin"
    organization_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    organization_id: Optional[int]

    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
