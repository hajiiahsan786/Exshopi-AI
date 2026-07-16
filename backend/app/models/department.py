from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    company_id = Column(
        Integer,
        ForeignKey("companies.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    name = Column(String(150), nullable=True)
    description = Column(String)

    organization = relationship("Organization")
    company = relationship("Company", back_populates="departments")
    employees = relationship("Employee", back_populates="department")
