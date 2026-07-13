from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Contact(UUIDMixin, AuditMixin, Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), index=True)
    phone = Column(String(50), index=True)
    department = Column(String(150))
    position = Column(String(150))
    is_primary = Column(Boolean, nullable=False, default=False)

    customer = relationship("Customer", back_populates="contacts")
    activities = relationship("Activity", back_populates="contact")
    tasks = relationship("CRMTask", back_populates="contact")
