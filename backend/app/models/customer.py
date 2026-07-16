from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Customer(UUIDMixin, AuditMixin, Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_code = Column(String(50), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), index=True)
    phone = Column(String(50), index=True)
    mobile = Column(String(50), index=True)
    country = Column(String(100))
    city = Column(String(100))
    address = Column(Text)
    website = Column(String(255))
    industry = Column(String(150))
    customer_type = Column(String(50), nullable=False, default="individual")
    status = Column(String(50), nullable=False, default="active", index=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    source = Column(String(100))
    tags = Column(JSON, nullable=False, default=list)
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company", foreign_keys=[company_id])
    owner = relationship("User", foreign_keys=[assigned_to])
    contacts = relationship("Contact", back_populates="customer")
    opportunities = relationship("Opportunity", back_populates="customer")
    activities = relationship("Activity", back_populates="customer")
    tasks = relationship("CRMTask", back_populates="customer")
