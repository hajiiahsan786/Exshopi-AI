from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Activity(UUIDMixin, AuditMixin, Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True, index=True)
    activity_type = Column(String(50), nullable=False, index=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text)
    activity_at = Column(DateTime(timezone=True), nullable=False, index=True)
    owner = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="planned", index=True)

    organization = relationship("Organization")
    customer = relationship("Customer", back_populates="activities")
    lead = relationship("Lead", back_populates="activities")
    contact = relationship("Contact", back_populates="activities")
    opportunity = relationship("Opportunity", back_populates="activities")
    owner_user = relationship("User", foreign_keys=[owner])
