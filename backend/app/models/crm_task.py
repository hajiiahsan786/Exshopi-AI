from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class CRMTask(UUIDMixin, AuditMixin, Base):
    __tablename__ = "crm_tasks"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    reminder_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="open", index=True)
    priority = Column(String(50), nullable=False, default="medium", index=True)

    organization = relationship("Organization")
    customer = relationship("Customer", back_populates="tasks")
    lead = relationship("Lead", back_populates="tasks")
    contact = relationship("Contact", back_populates="tasks")
    opportunity = relationship("Opportunity", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
