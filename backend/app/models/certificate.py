from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    cert_hash = Column(String, unique=True, index=True, nullable=False)
    owner_name = Column(String, nullable=False)
    course_name = Column(String, nullable=False)
    issued_by = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    storage_url = Column(String, nullable=False)
    tx_hash = Column(String, nullable=True)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    issuer = relationship("Organization")
