from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.schemas.crm_task import (
    CRMTaskCreate,
    CRMTaskListResponse,
    CRMTaskSingleResponse,
    CRMTaskUpdate,
)
from app.services.crm_task_service import CRMTaskService

router = create_crm_router(
    service=CRMTaskService,
    create_schema=CRMTaskCreate,
    update_schema=CRMTaskUpdate,
    single_response=CRMTaskSingleResponse,
    list_response=CRMTaskListResponse,
    permission_prefix="tasks",
    entity_label="Tasks",
    extra_filters=("organization_id", "customer_id", "lead_id", "assigned_to"),
)
