from datetime import date, datetime
from decimal import Decimal
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator


CRM_STAGE_VALUES = {
    "New Lead",
    "Qualified",
    "Meeting",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
}
LEAD_STATUS_VALUES = {"new", "contacted", "qualified", "converted", "lost"}
CUSTOMER_STATUS_VALUES = {"active", "inactive", "prospect", "blocked"}
OPPORTUNITY_STATUS_VALUES = {"open", "won", "lost", "cancelled"}
ACTIVITY_STATUS_VALUES = {"planned", "completed", "cancelled"}
TASK_STATUS_VALUES = {"open", "in_progress", "completed", "cancelled", "overdue"}
PRIORITY_VALUES = {"low", "medium", "high", "urgent"}
ACTIVITY_TYPE_VALUES = {"Call", "Meeting", "WhatsApp", "Email", "Visit", "Demo", "Task"}
CUSTOMER_TYPE_VALUES = {"individual", "company", "partner", "reseller"}

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: T | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


class CRMBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AuditResponseMixin(BaseModel):
    uuid: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    created_by: int | None = None
    updated_by: int | None = None
    deleted_by: int | None = None
    deleted_at: datetime | None = None


def validate_choice(value: str | None, allowed: set[str], field_name: str) -> str | None:
    if value is not None and value not in allowed:
        allowed_values = ", ".join(sorted(allowed))
        raise ValueError(f"Invalid {field_name}. Allowed values: {allowed_values}")
    return value


class SearchParams(BaseModel):
    search: str | None = Field(default=None, max_length=255)
    status: str | None = Field(default=None, max_length=50)
    tags: str | None = Field(default=None, max_length=255)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="created_at", max_length=50)
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    include_deleted: bool = False


class DateRangeParams(BaseModel):
    date_from: date | None = None
    date_to: date | None = None


class DecimalModelMixin(BaseModel):
    @field_validator("*", mode="before")
    @classmethod
    def normalize_decimal(cls, value: Any) -> Any:
        if isinstance(value, float):
            return Decimal(str(value))
        return value
