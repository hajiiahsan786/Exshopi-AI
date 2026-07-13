from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Employee(Base):
    __tablename__ = "employees"

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
    department_id = Column(
        Integer,
        ForeignKey("departments.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
    )
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(30))
    position = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    organization = relationship("Organization")
    company = relationship("Company")
    department = relationship("Department", back_populates="employees")
    user = relationship("User", foreign_keys=[user_id])
