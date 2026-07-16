from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.api.v1.endpoints.crm_router_factory import create_crm_router
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.crm_common import APIResponse, PaginatedResponse
from app.security.crm_permissions import require_crm_permission

from app.schemas.workflow import (
    WorkflowCreate, WorkflowResponse,
    WorkflowExecutionCreate, WorkflowExecutionResponse,
    WorkflowTaskCreate, WorkflowTaskResponse
)
from app.services.workflow_service import (
    WorkflowService,
    WorkflowExecutionService,
    WorkflowTaskService
)

workflows_router = create_crm_router(
    service=WorkflowService,
    create_schema=WorkflowCreate,
    update_schema=WorkflowCreate,
    single_response=WorkflowResponse,
    list_response=PaginatedResponse[WorkflowResponse],
    permission_prefix="workflow",
    entity_label="Workflow",
)

executions_router = create_crm_router(
    service=WorkflowExecutionService,
    create_schema=WorkflowExecutionCreate,
    update_schema=WorkflowExecutionCreate,
    single_response=WorkflowExecutionResponse,
    list_response=PaginatedResponse[WorkflowExecutionResponse],
    permission_prefix="workflow_execution",
    entity_label="Workflow Execution",
)

tasks_router = create_crm_router(
    service=WorkflowTaskService,
    create_schema=WorkflowTaskCreate,
    update_schema=WorkflowTaskCreate,
    single_response=WorkflowTaskResponse,
    list_response=PaginatedResponse[WorkflowTaskResponse],
    permission_prefix="workflow_task",
    entity_label="Workflow Task",
)

router = APIRouter()
router.include_router(workflows_router, tags=["Workflows"])
router.include_router(executions_router, prefix="/executions", tags=["Workflow Executions"])
router.include_router(tasks_router, prefix="/tasks", tags=["Workflow Tasks"])

@executions_router.post("/{item_id}/execute", response_model=APIResponse[WorkflowExecutionResponse])
def execute_workflow_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_execution.execute")),
):
    execution = WorkflowExecutionService.execute_workflow(db, item_id, current_user.id)
    return APIResponse(message="Execution started", data=execution)

@executions_router.post("/{item_id}/pause", response_model=APIResponse[WorkflowExecutionResponse])
def pause_workflow_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_execution.execute")),
):
    execution = WorkflowExecutionService.pause_workflow(db, item_id, current_user.id)
    return APIResponse(message="Execution paused", data=execution)

@executions_router.post("/{item_id}/resume", response_model=APIResponse[WorkflowExecutionResponse])
def resume_workflow_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_execution.execute")),
):
    execution = WorkflowExecutionService.resume_workflow(db, item_id, current_user.id)
    return APIResponse(message="Execution resumed", data=execution)

@executions_router.post("/{item_id}/cancel", response_model=APIResponse[WorkflowExecutionResponse])
def cancel_workflow_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_execution.execute")),
):
    execution = WorkflowExecutionService.cancel_workflow(db, item_id, current_user.id)
    return APIResponse(message="Execution cancelled", data=execution)

@executions_router.post("/{item_id}/retry", response_model=APIResponse[WorkflowExecutionResponse])
def retry_workflow_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_execution.execute")),
):
    execution = WorkflowExecutionService.retry_workflow(db, item_id, current_user.id)
    return APIResponse(message="Execution retried", data=execution)

@tasks_router.post("/{item_id}/approve", response_model=APIResponse[WorkflowTaskResponse])
def approve_task_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_task.approve")),
):
    task = WorkflowTaskService.approve_task(db, item_id, current_user.id)
    return APIResponse(message="Task approved", data=task)

@tasks_router.post("/{item_id}/reject", response_model=APIResponse[WorkflowTaskResponse])
def reject_task_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_task.approve")),
):
    task = WorkflowTaskService.reject_task(db, item_id, current_user.id)
    return APIResponse(message="Task rejected", data=task)

@tasks_router.post("/{item_id}/delegate", response_model=APIResponse[WorkflowTaskResponse])
def delegate_task_api(
    target_user_id: int,
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_task.approve")),
):
    task = WorkflowTaskService.delegate_task(db, item_id, target_user_id, current_user.id)
    return APIResponse(message="Task delegated", data=task)

@tasks_router.post("/{item_id}/escalate", response_model=APIResponse[WorkflowTaskResponse])
def escalate_task_api(
    item_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_crm_permission("workflow_task.approve")),
):
    task = WorkflowTaskService.escalate_task(db, item_id, current_user.id)
    return APIResponse(message="Task escalated", data=task)
