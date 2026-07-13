from datetime import datetime
from decimal import Decimal

from pydantic import Field, field_validator

from app.schemas.crm_common import (
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    LEAD_STATUS_VALUES,
    PRIORITY_VALUES,
    PaginatedResponse,
    validate_choice,
)


class LeadBase(CRMBaseModel):
    organization_id: int
    lead_number: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1, max_length=150)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    company: str | None = Field(default=None, max_length=150)
    position: str | None = Field(default=None, max_length=150)
    source: str | None = Field(default=None, max_length=100)
    status: str = "new"
    priority: str = "medium"
    estimated_value: Decimal | None = Field(default=None, ge=0)
    assigned_to: int | None = None
    next_followup: datetime | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, LEAD_STATUS_VALUES, "status") or value

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        return validate_choice(value, PRIORITY_VALUES, "priority") or value


class LeadCreate(LeadBase):
    pass


class LeadUpdate(CRMBaseModel):
    organization_id: int | None = None
    lead_number: str | None = Field(default=None, min_length=1, max_length=50)
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    company: str | None = Field(default=None, max_length=150)
    position: str | None = Field(default=None, max_length=150)
    source: str | None = Field(default=None, max_length=100)
    status: str | None = None
    priority: str | None = None
    estimated_value: Decimal | None = Field(default=None, ge=0)
    assigned_to: int | None = None
    next_followup: datetime | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, LEAD_STATUS_VALUES, "status")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str | None) -> str | None:
        return validate_choice(value, PRIORITY_VALUES, "priority")


class LeadResponse(LeadBase, AuditResponseMixin):
    id: int


LeadSingleResponse = APIResponse[LeadResponse]
LeadListResponse = APIResponse[PaginatedResponse[LeadResponse]]
