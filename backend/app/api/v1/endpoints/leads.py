from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.schemas.lead import LeadCreate, LeadListResponse, LeadSingleResponse, LeadUpdate
from app.services.lead_service import LeadService

router = create_crm_router(
    service=LeadService,
    create_schema=LeadCreate,
    update_schema=LeadUpdate,
    single_response=LeadSingleResponse,
    list_response=LeadListResponse,
    permission_prefix="leads",
    entity_label="Leads",
    extra_filters=("organization_id", "assigned_to"),
)
