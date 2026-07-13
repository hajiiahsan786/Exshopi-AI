from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Lead(UUIDMixin, AuditMixin, Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    lead_number = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), index=True)
    phone = Column(String(50), index=True)
    company = Column(String(150), index=True)
    position = Column(String(150))
    source = Column(String(100))
    status = Column(String(50), nullable=False, default="new", index=True)
    priority = Column(String(50), nullable=False, default="medium", index=True)
    estimated_value = Column(Numeric(14, 2))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    next_followup = Column(DateTime(timezone=True))
    notes = Column(Text)

    organization = relationship("Organization")
    owner = relationship("User", foreign_keys=[assigned_to])
    activities = relationship("Activity", back_populates="lead")
    tasks = relationship("CRMTask", back_populates="lead")
