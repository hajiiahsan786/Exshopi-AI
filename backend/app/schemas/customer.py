from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.crm_common import (
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    CUSTOMER_STATUS_VALUES,
    CUSTOMER_TYPE_VALUES,
    PaginatedResponse,
    validate_choice,
)


class CustomerBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    customer_code: str = Field(min_length=1, max_length=50)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    mobile: str | None = Field(default=None, max_length=50)
    country: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = None
    website: str | None = Field(default=None, max_length=255)
    industry: str | None = Field(default=None, max_length=150)
    customer_type: str = "individual"
    status: str = "active"
    assigned_to: int | None = None
    source: str | None = Field(default=None, max_length=100)
    tags: list[str] = Field(default_factory=list)
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, CUSTOMER_STATUS_VALUES, "status") or value

    @field_validator("customer_type")
    @classmethod
    def validate_customer_type(cls, value: str) -> str:
        return validate_choice(value, CUSTOMER_TYPE_VALUES, "customer_type") or value


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    customer_code: str | None = Field(default=None, min_length=1, max_length=50)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    mobile: str | None = Field(default=None, max_length=50)
    country: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = None
    website: str | None = Field(default=None, max_length=255)
    industry: str | None = Field(default=None, max_length=150)
    customer_type: str | None = None
    status: str | None = None
    assigned_to: int | None = None
    source: str | None = Field(default=None, max_length=100)
    tags: list[str] | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, CUSTOMER_STATUS_VALUES, "status")

    @field_validator("customer_type")
    @classmethod
    def validate_customer_type(cls, value: str | None) -> str | None:
        return validate_choice(value, CUSTOMER_TYPE_VALUES, "customer_type")


class CustomerResponse(CustomerBase, AuditResponseMixin):
    id: int
    created_at: datetime | None = None


CustomerSingleResponse = APIResponse[CustomerResponse]
CustomerListResponse = APIResponse[PaginatedResponse[CustomerResponse]]
