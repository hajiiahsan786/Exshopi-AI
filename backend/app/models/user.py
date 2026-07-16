import uuid as uuid_lib

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    uuid = Column(
        String(36),
        unique=True,
        index=True,
        nullable=False,
        default=lambda: str(uuid_lib.uuid4()),
    )
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    last_login = Column(DateTime(timezone=True))
    email_verification_token_hash = Column(String(255))
    email_verification_expires_at = Column(DateTime(timezone=True))
    password_reset_token_hash = Column(String(255))
    password_reset_expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    role = relationship("Role", back_populates="users")
    organization = relationship("Organization", foreign_keys=[organization_id])
    company = relationship("Company", foreign_keys=[company_id])
    auth_tokens = relationship("AuthToken", back_populates="user")
