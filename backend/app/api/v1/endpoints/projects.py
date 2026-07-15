from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.v1.endpoints.project_router_factory import create_project_router
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectSingleResponse, ProjectListResponse,
    SprintCreate, SprintUpdate, SprintSingleResponse, SprintListResponse,
    ProjectTaskCreate, ProjectTaskUpdate, ProjectTaskSingleResponse, ProjectTaskListResponse,
    ProjectRoleCreate, ProjectRoleUpdate, ProjectRoleSingleResponse, ProjectRoleListResponse
)
from app.services.project_service import ProjectService, SprintService, ProjectTaskService, ProjectRoleService

# 1. Base Routers from factory
project_crud_router = create_project_router(
    service=ProjectService,
    create_schema=ProjectCreate,
    update_schema=ProjectUpdate,
    single_response=ProjectSingleResponse,
    list_response=ProjectListResponse,
    permission_prefix="project",
    entity_label="Project",
    extra_filters=("organization_id", "company_id", "customer_id", "owner_id"),
)

sprint_crud_router = create_project_router(
    service=SprintService,
    create_schema=SprintCreate,
    update_schema=SprintUpdate,
    single_response=SprintSingleResponse,
    list_response=SprintListResponse,
    permission_prefix="sprint",
    entity_label="Sprint",
    extra_filters=("project_id",),
)

task_crud_router = create_project_router(
    service=ProjectTaskService,
    create_schema=ProjectTaskCreate,
    update_schema=ProjectTaskUpdate,
    single_response=ProjectTaskSingleResponse,
    list_response=ProjectTaskListResponse,
    permission_prefix="task",
    entity_label="Project Task",
    extra_filters=("project_id", "sprint_id", "story_id", "phase_id", "assignee_id"),
)

role_crud_router = create_project_router(
    service=ProjectRoleService,
    create_schema=ProjectRoleCreate,
    update_schema=ProjectRoleUpdate,
    single_response=ProjectRoleSingleResponse,
    list_response=ProjectRoleListResponse,
    permission_prefix="role",
    entity_label="Project Role",
    extra_filters=("organization_id",),
)

# 2. Custom Endpoints
@project_crud_router.get("/{project_id}/gantt", summary="Get Project Gantt Data")
def get_project_gantt(project_id: int, db: Session = Depends(get_db)):
    return {"success": True, "message": "Gantt data retrieved", "data": ProjectService.get_gantt_data(db, project_id)}

@project_crud_router.get("/{project_id}/progress", summary="Get Project Progress")
def get_project_progress(project_id: int, db: Session = Depends(get_db)):
    return {"success": True, "message": "Project progress retrieved", "data": ProjectService.get_project_progress(db, project_id)}

@sprint_crud_router.get("/{sprint_id}/burndown", summary="Get Sprint Burndown Data")
def get_sprint_burndown(sprint_id: int, db: Session = Depends(get_db)):
    return {"success": True, "message": "Burndown data retrieved", "data": SprintService.get_burndown_data(db, sprint_id)}

@task_crud_router.post("/{task_id}/transition", summary="Transition Task Status")
def transition_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    task = ProjectTaskService.transition_status(db, task_id, status)
    # Using CRMTaskResponse for consistency, but returning simple dict here to avoid schema mismatch
    return {"success": True, "message": "Task transitioned successfully", "data": {"id": task.id, "status": task.status}}

# 3. Combine routers
router = APIRouter()
router.include_router(project_crud_router, prefix="", tags=["Projects"])
router.include_router(sprint_crud_router, prefix="/sprints", tags=["Sprints"])
router.include_router(task_crud_router, prefix="/tasks", tags=["Project Tasks"])
router.include_router(role_crud_router, prefix="/roles", tags=["Project Roles"])

PROJECTS_ROUTERS = [
    (router, "/projects", ["Projects"]),
]
