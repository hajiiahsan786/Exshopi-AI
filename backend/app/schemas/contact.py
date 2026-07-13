from pydantic import Field

from app.schemas.crm_common import (
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    PaginatedResponse,
)


class ContactBase(CRMBaseModel):
    customer_id: int
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    department: str | None = Field(default=None, max_length=150)
    position: str | None = Field(default=None, max_length=150)
    is_primary: bool = False


class ContactCreate(ContactBase):
    pass


class ContactUpdate(CRMBaseModel):
    customer_id: int | None = None
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    department: str | None = Field(default=None, max_length=150)
    position: str | None = Field(default=None, max_length=150)
    is_primary: bool | None = None


class ContactResponse(ContactBase, AuditResponseMixin):
    id: int


ContactSingleResponse = APIResponse[ContactResponse]
ContactListResponse = APIResponse[PaginatedResponse[ContactResponse]]
