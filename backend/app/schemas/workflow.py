from typing import Any
from pydantic import BaseModel, Field
from app.schemas.crm_common import CRMBaseModel, AuditResponseMixin

class WorkflowCategoryBase(CRMBaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = None

class WorkflowCategoryCreate(WorkflowCategoryBase):
    pass

class WorkflowCategoryResponse(WorkflowCategoryBase, AuditResponseMixin):
    id: int

class WorkflowBase(CRMBaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = None
    category_id: int | None = None
    is_active: bool = True

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase, AuditResponseMixin):
    id: int

class WorkflowVersionBase(CRMBaseModel):
    workflow_id: int
    version_number: int = 1
    definition: dict[str, Any] | None = None
    is_published: bool = False

class WorkflowVersionCreate(WorkflowVersionBase):
    pass

class WorkflowVersionResponse(WorkflowVersionBase, AuditResponseMixin):
    id: int

class WorkflowStepBase(CRMBaseModel):
    workflow_version_id: int
    name: str = Field(..., max_length=255)
    step_type: str = Field(..., max_length=50)
    configuration: dict[str, Any] | None = None

class WorkflowStepCreate(WorkflowStepBase):
    pass

class WorkflowStepResponse(WorkflowStepBase, AuditResponseMixin):
    id: int

class WorkflowTransitionBase(CRMBaseModel):
    workflow_version_id: int
    source_step_id: int | None = None
    target_step_id: int
    name: str | None = Field(None, max_length=255)

class WorkflowTransitionCreate(WorkflowTransitionBase):
    pass

class WorkflowTransitionResponse(WorkflowTransitionBase, AuditResponseMixin):
    id: int

class WorkflowConditionBase(CRMBaseModel):
    transition_id: int
    rule: dict[str, Any]

class WorkflowConditionCreate(WorkflowConditionBase):
    pass

class WorkflowConditionResponse(WorkflowConditionBase, AuditResponseMixin):
    id: int

class WorkflowActionBase(CRMBaseModel):
    step_id: int
    action_type: str = Field(..., max_length=50)
    configuration: dict[str, Any] | None = None

class WorkflowActionCreate(WorkflowActionBase):
    pass

class WorkflowActionResponse(WorkflowActionBase, AuditResponseMixin):
    id: int

class WorkflowTriggerBase(CRMBaseModel):
    workflow_id: int
    trigger_type: str = Field(..., max_length=50)
    configuration: dict[str, Any] | None = None

class WorkflowTriggerCreate(WorkflowTriggerBase):
    pass

class WorkflowTriggerResponse(WorkflowTriggerBase, AuditResponseMixin):
    id: int

class WorkflowExecutionBase(CRMBaseModel):
    workflow_version_id: int
    status: str = Field(default="running", max_length=50)
    current_step_id: int | None = None
    context_data: dict[str, Any] | None = None

class WorkflowExecutionCreate(WorkflowExecutionBase):
    pass

class WorkflowExecutionResponse(WorkflowExecutionBase, AuditResponseMixin):
    id: int

class WorkflowTaskBase(CRMBaseModel):
    execution_id: int
    step_id: int
    assigned_to: int | None = None
    status: str = Field(default="pending", max_length=50)

class WorkflowTaskCreate(WorkflowTaskBase):
    pass

class WorkflowTaskResponse(WorkflowTaskBase, AuditResponseMixin):
    id: int

class WorkflowApprovalBase(CRMBaseModel):
    task_id: int
    status: str = Field(default="pending", max_length=50)
    comments: str | None = None

class WorkflowApprovalCreate(WorkflowApprovalBase):
    pass

class WorkflowApprovalResponse(WorkflowApprovalBase, AuditResponseMixin):
    id: int

class WorkflowExecutionLogResponse(CRMBaseModel, AuditResponseMixin):
    id: int
    execution_id: int
    step_id: int | None
    action: str
    status: str
    message: str | None
