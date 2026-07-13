from datetime import datetime

from pydantic import Field, field_validator, model_validator

from app.schemas.crm_common import (
    ACTIVITY_STATUS_VALUES,
    ACTIVITY_TYPE_VALUES,
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    PaginatedResponse,
    validate_choice,
)


class ActivityBase(CRMBaseModel):
    organization_id: int
    customer_id: int | None = None
    lead_id: int | None = None
    contact_id: int | None = None
    opportunity_id: int | None = None
    activity_type: str
    subject: str = Field(min_length=1, max_length=200)
    description: str | None = None
    activity_at: datetime
    owner: int | None = None
    status: str = "planned"

    @field_validator("activity_type")
    @classmethod
    def validate_activity_type(cls, value: str) -> str:
        return validate_choice(value, ACTIVITY_TYPE_VALUES, "activity_type") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, ACTIVITY_STATUS_VALUES, "status") or value

    @model_validator(mode="after")
    def validate_parent(self) -> "ActivityBase":
        parent_ids = [self.customer_id, self.lead_id, self.contact_id, self.opportunity_id]
        if not any(parent_ids):
            raise ValueError("At least one CRM parent reference is required")
        return self


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(CRMBaseModel):
    organization_id: int | None = None
    customer_id: int | None = None
    lead_id: int | None = None
    contact_id: int | None = None
    opportunity_id: int | None = None
    activity_type: str | None = None
    subject: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    activity_at: datetime | None = None
    owner: int | None = None
    status: str | None = None

    @field_validator("activity_type")
    @classmethod
    def validate_activity_type(cls, value: str | None) -> str | None:
        return validate_choice(value, ACTIVITY_TYPE_VALUES, "activity_type")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, ACTIVITY_STATUS_VALUES, "status")


class ActivityResponse(ActivityBase, AuditResponseMixin):
    id: int


ActivitySingleResponse = APIResponse[ActivityResponse]
ActivityListResponse = APIResponse[PaginatedResponse[ActivityResponse]]
