from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerSingleResponse,
    CustomerUpdate,
)
from app.services.customer_service import CustomerService

router = create_crm_router(
    service=CustomerService,
    create_schema=CustomerCreate,
    update_schema=CustomerUpdate,
    single_response=CustomerSingleResponse,
    list_response=CustomerListResponse,
    permission_prefix="customers",
    entity_label="Customers",
    extra_filters=("organization_id", "company_id", "assigned_to"),
)
