from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.schemas.contact import (
    ContactCreate,
    ContactListResponse,
    ContactSingleResponse,
    ContactUpdate,
)
from app.services.contact_service import ContactService

router = create_crm_router(
    service=ContactService,
    create_schema=ContactCreate,
    update_schema=ContactUpdate,
    single_response=ContactSingleResponse,
    list_response=ContactListResponse,
    permission_prefix="contacts",
    entity_label="Contacts",
    extra_filters=("customer_id",),
)
