from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(String(1000))
    logo = Column(String(500))
    website = Column(String(255))
    phone = Column(String(50))
    email = Column(String(255))
    country = Column(String(100))
    city = Column(String(100))
    timezone = Column(String(100))
    language = Column(String(50))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner = relationship("User", foreign_keys=[owner_id])
    companies = relationship("Company", back_populates="organization")
