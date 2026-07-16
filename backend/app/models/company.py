from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, synonym
from sqlalchemy.sql import func

from app.database.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    company_name = Column(String(255), nullable=False)
    legal_name = Column(String(255))
    industry = Column(String(150))
    business_type = Column(String(150))
    email = Column(String(255))
    phone = Column(String(50))
    country = Column(String(100))
    city = Column(String(100))
    address = Column(String(255))
    website = Column(String(255))
    currency = Column(String(20))
    timezone = Column(String(100))
    language = Column(String(50))
    tax_number = Column(String(100))
    registration_number = Column(String(100))
    logo = Column(String(500))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    name = synonym("company_name")

    organization = relationship("Organization", back_populates="companies")
    owner = relationship("User", foreign_keys=[owner_id])
    departments = relationship("Department", back_populates="company")
