from datetime import date
from decimal import Decimal

from pydantic import Field, field_validator

from app.schemas.crm_common import (
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    CRM_STAGE_VALUES,
    OPPORTUNITY_STATUS_VALUES,
    PaginatedResponse,
    validate_choice,
)


class OpportunityBase(CRMBaseModel):
    customer_id: int
    title: str = Field(min_length=1, max_length=200)
    pipeline: str = Field(default="default", min_length=1, max_length=100)
    stage: str = "New Lead"
    probability: int = Field(default=0, ge=0, le=100)
    expected_revenue: Decimal | None = Field(default=None, ge=0)
    expected_close_date: date | None = None
    owner: int | None = None
    status: str = "open"

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, value: str) -> str:
        return validate_choice(value, CRM_STAGE_VALUES, "stage") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, OPPORTUNITY_STATUS_VALUES, "status") or value


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(CRMBaseModel):
    customer_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    pipeline: str | None = Field(default=None, min_length=1, max_length=100)
    stage: str | None = None
    probability: int | None = Field(default=None, ge=0, le=100)
    expected_revenue: Decimal | None = Field(default=None, ge=0)
    expected_close_date: date | None = None
    owner: int | None = None
    status: str | None = None

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, value: str | None) -> str | None:
        return validate_choice(value, CRM_STAGE_VALUES, "stage")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, OPPORTUNITY_STATUS_VALUES, "status")


class OpportunityResponse(OpportunityBase, AuditResponseMixin):
    id: int


OpportunitySingleResponse = APIResponse[OpportunityResponse]
OpportunityListResponse = APIResponse[PaginatedResponse[OpportunityResponse]]
