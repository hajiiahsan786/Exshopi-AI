import uuid as uuid_lib

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func


class UUIDMixin:
    uuid = Column(
        String(36),
        unique=True,
        nullable=False,
        default=lambda: str(uuid_lib.uuid4()),
    )


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


class AuditMixin(TimestampMixin):
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)

    def restore(self) -> None:
        self.deleted_at = None
        self.deleted_by = None
