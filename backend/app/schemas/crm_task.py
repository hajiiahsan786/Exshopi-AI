from datetime import datetime

from pydantic import Field, field_validator, model_validator

from app.schemas.crm_common import (
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    PRIORITY_VALUES,
    PaginatedResponse,
    TASK_STATUS_VALUES,
    validate_choice,
)


class CRMTaskBase(CRMBaseModel):
    organization_id: int
    customer_id: int | None = None
    lead_id: int | None = None
    contact_id: int | None = None
    opportunity_id: int | None = None
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    assigned_to: int
    due_date: datetime | None = None
    reminder_at: datetime | None = None
    status: str = "open"
    priority: str = "medium"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, TASK_STATUS_VALUES, "status") or value

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        return validate_choice(value, PRIORITY_VALUES, "priority") or value

    @model_validator(mode="after")
    def validate_parent(self) -> "CRMTaskBase":
        parent_ids = [self.customer_id, self.lead_id, self.contact_id, self.opportunity_id]
        if not any(parent_ids):
            raise ValueError("At least one CRM parent reference is required")
        return self


class CRMTaskCreate(CRMTaskBase):
    pass


class CRMTaskUpdate(CRMBaseModel):
    organization_id: int | None = None
    customer_id: int | None = None
    lead_id: int | None = None
    contact_id: int | None = None
    opportunity_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    assigned_to: int | None = None
    due_date: datetime | None = None
    reminder_at: datetime | None = None
    status: str | None = None
    priority: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, TASK_STATUS_VALUES, "status")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str | None) -> str | None:
        return validate_choice(value, PRIORITY_VALUES, "priority")


class CRMTaskResponse(CRMTaskBase, AuditResponseMixin):
    id: int


CRMTaskSingleResponse = APIResponse[CRMTaskResponse]
CRMTaskListResponse = APIResponse[PaginatedResponse[CRMTaskResponse]]
