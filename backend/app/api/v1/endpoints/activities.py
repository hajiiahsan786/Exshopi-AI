from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.schemas.activity import (
    ActivityCreate,
    ActivityListResponse,
    ActivitySingleResponse,
    ActivityUpdate,
)
from app.services.activity_service import ActivityService

router = create_crm_router(
    service=ActivityService,
    create_schema=ActivityCreate,
    update_schema=ActivityUpdate,
    single_response=ActivitySingleResponse,
    list_response=ActivityListResponse,
    permission_prefix="activities",
    entity_label="Activities",
    extra_filters=("organization_id", "customer_id", "lead_id", "owner"),
)
