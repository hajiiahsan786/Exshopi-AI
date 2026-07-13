from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityListResponse,
    OpportunitySingleResponse,
    OpportunityUpdate,
)
from app.services.opportunity_service import OpportunityService

router = create_crm_router(
    service=OpportunityService,
    create_schema=OpportunityCreate,
    update_schema=OpportunityUpdate,
    single_response=OpportunitySingleResponse,
    list_response=OpportunityListResponse,
    permission_prefix="opportunities",
    entity_label="Opportunities",
    extra_filters=("customer_id", "owner"),
)
