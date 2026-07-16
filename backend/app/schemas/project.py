from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.crm_common import (
    APIResponse,
    AuditResponseMixin,
    CRMBaseModel,
    PaginatedResponse,
)


class ProjectRoleBase(CRMBaseModel):
    organization_id: int
    name: str = Field(min_length=1, max_length=150)
    description: Optional[str] = None
    permissions: Dict[str, Any] = Field(default_factory=dict)


class ProjectRoleCreate(ProjectRoleBase):
    pass


class ProjectRoleUpdate(CRMBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None


class ProjectRoleResponse(ProjectRoleBase, AuditResponseMixin):
    id: int


class ProjectBase(CRMBaseModel):
    organization_id: int
    company_id: Optional[int] = None
    customer_id: Optional[int] = None
    name: str = Field(min_length=1, max_length=200)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    status: str = "planning"
    type: Optional[str] = Field(None, max_length=50)
    priority: str = "medium"
    owner_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: float = 0.0
    currency_code: str = "USD"
    progress: float = 0.0
    is_template: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(CRMBaseModel):
    company_id: Optional[int] = None
    customer_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    code: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = None
    owner_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None
    currency_code: Optional[str] = None
    progress: Optional[float] = None
    is_template: Optional[bool] = None


class ProjectResponse(ProjectBase, AuditResponseMixin):
    id: int


class SprintBase(CRMBaseModel):
    project_id: int
    name: str = Field(min_length=1, max_length=150)
    goal: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "planning"


class SprintCreate(SprintBase):
    pass


class SprintUpdate(CRMBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    goal: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None


class SprintResponse(SprintBase, AuditResponseMixin):
    id: int


class ProjectTaskBase(CRMBaseModel):
    project_id: int
    story_id: Optional[int] = None
    sprint_id: Optional[int] = None
    phase_id: Optional[int] = None
    parent_id: Optional[int] = None
    assignee_id: Optional[int] = None
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    type: str = "task"
    estimated_hours: float = 0.0
    actual_hours: float = 0.0
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    progress: float = 0.0


class ProjectTaskCreate(ProjectTaskBase):
    pass


class ProjectTaskUpdate(CRMBaseModel):
    story_id: Optional[int] = None
    sprint_id: Optional[int] = None
    phase_id: Optional[int] = None
    parent_id: Optional[int] = None
    assignee_id: Optional[int] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    progress: Optional[float] = None


class ProjectTaskResponse(ProjectTaskBase, AuditResponseMixin):
    id: int


ProjectSingleResponse = APIResponse[ProjectResponse]
ProjectListResponse = APIResponse[PaginatedResponse[ProjectResponse]]

SprintSingleResponse = APIResponse[SprintResponse]
SprintListResponse = APIResponse[PaginatedResponse[SprintResponse]]

ProjectTaskSingleResponse = APIResponse[ProjectTaskResponse]
ProjectTaskListResponse = APIResponse[PaginatedResponse[ProjectTaskResponse]]

ProjectRoleSingleResponse = APIResponse[ProjectRoleResponse]
ProjectRoleListResponse = APIResponse[PaginatedResponse[ProjectRoleResponse]]
