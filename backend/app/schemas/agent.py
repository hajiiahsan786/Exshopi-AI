from datetime import datetime
from typing import Any, Optional, Dict, List
from pydantic import BaseModel, ConfigDict, Field

class AgentRoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class AgentRoleCreate(AgentRoleBase):
    pass

class AgentRoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class AgentRoleResponse(AgentRoleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AgentBase(BaseModel):
    name: str
    role_id: Optional[int] = None
    description: Optional[str] = None
    status: str = "inactive"
    metadata_data: Optional[Dict[str, Any]] = None

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    metadata_data: Optional[Dict[str, Any]] = None

class AgentResponse(AgentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    role: Optional[AgentRoleResponse] = None
    model_config = ConfigDict(from_attributes=True)

class AgentToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    integration_config: Optional[Dict[str, Any]] = None

class AgentToolCreate(AgentToolBase):
    pass

class AgentToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    integration_config: Optional[Dict[str, Any]] = None

class AgentToolResponse(AgentToolBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AgentCapabilityCreate(BaseModel): pass
class AgentCapabilityUpdate(BaseModel): pass
class AgentCapabilityResponse(BaseModel): pass
class AgentPermissionCreate(BaseModel): pass
class AgentPermissionUpdate(BaseModel): pass
class AgentPermissionResponse(BaseModel): pass
class AgentMemoryProfileCreate(BaseModel): pass
class AgentMemoryProfileUpdate(BaseModel): pass
class AgentMemoryProfileResponse(BaseModel): pass
class AgentConfigurationCreate(BaseModel): pass
class AgentConfigurationUpdate(BaseModel): pass
class AgentConfigurationResponse(BaseModel): pass
class AgentConversationCreate(BaseModel): pass
class AgentConversationUpdate(BaseModel): pass
class AgentConversationResponse(BaseModel): pass
class AgentSessionCreate(BaseModel): pass
class AgentSessionUpdate(BaseModel): pass
class AgentSessionResponse(BaseModel): pass
class AgentTaskCreate(BaseModel): pass
class AgentTaskUpdate(BaseModel): pass
class AgentTaskResponse(BaseModel): pass
class AgentTaskQueueCreate(BaseModel): pass
class AgentTaskQueueUpdate(BaseModel): pass
class AgentTaskQueueResponse(BaseModel): pass
class AgentExecutionCreate(BaseModel): pass
class AgentExecutionUpdate(BaseModel): pass
class AgentExecutionResponse(BaseModel): pass
class AgentExecutionStepCreate(BaseModel): pass
class AgentExecutionStepUpdate(BaseModel): pass
class AgentExecutionStepResponse(BaseModel): pass
class AgentWorkflowCreate(BaseModel): pass
class AgentWorkflowUpdate(BaseModel): pass
class AgentWorkflowResponse(BaseModel): pass
class AgentDecisionCreate(BaseModel): pass
class AgentDecisionUpdate(BaseModel): pass
class AgentDecisionResponse(BaseModel): pass
class AgentReasoningLogCreate(BaseModel): pass
class AgentReasoningLogUpdate(BaseModel): pass
class AgentReasoningLogResponse(BaseModel): pass
class AgentObservationCreate(BaseModel): pass
class AgentObservationUpdate(BaseModel): pass
class AgentObservationResponse(BaseModel): pass
class AgentPlanCreate(BaseModel): pass
class AgentPlanUpdate(BaseModel): pass
class AgentPlanResponse(BaseModel): pass
class AgentGoalCreate(BaseModel): pass
class AgentGoalUpdate(BaseModel): pass
class AgentGoalResponse(BaseModel): pass
class AgentSkillCreate(BaseModel): pass
class AgentSkillUpdate(BaseModel): pass
class AgentSkillResponse(BaseModel): pass
class AgentToolPermissionCreate(BaseModel): pass
class AgentToolPermissionUpdate(BaseModel): pass
class AgentToolPermissionResponse(BaseModel): pass
class AgentEventCreate(BaseModel): pass
class AgentEventUpdate(BaseModel): pass
class AgentEventResponse(BaseModel): pass
class AgentNotificationCreate(BaseModel): pass
class AgentNotificationUpdate(BaseModel): pass
class AgentNotificationResponse(BaseModel): pass
class AgentAuditLogCreate(BaseModel): pass
class AgentAuditLogUpdate(BaseModel): pass
class AgentAuditLogResponse(BaseModel): pass
