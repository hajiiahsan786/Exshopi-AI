from sqlalchemy import Column, Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Opportunity(UUIDMixin, AuditMixin, Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    pipeline = Column(String(100), nullable=False, default="default", index=True)
    stage = Column(String(50), nullable=False, default="New Lead", index=True)
    probability = Column(Integer, nullable=False, default=0)
    expected_revenue = Column(Numeric(14, 2))
    expected_close_date = Column(Date)
    owner = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="open", index=True)

    customer = relationship("Customer", back_populates="opportunities")
    owner_user = relationship("User", foreign_keys=[owner])
    activities = relationship("Activity", back_populates="opportunity")
    tasks = relationship("CRMTask", back_populates="opportunity")
