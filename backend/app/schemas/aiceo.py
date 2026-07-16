from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, ConfigDict

from app.schemas.crm_common import AuditResponseMixin

class CRMBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class ExecutiveDashboardBase(CRMBaseModel):
    name: str = Field(..., max_length=150)
    config: dict[str, Any] = Field(default_factory=dict)
    is_default: bool = False

class ExecutiveDashboardCreate(ExecutiveDashboardBase):
    pass

class ExecutiveDashboardUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=150)
    config: dict[str, Any] | None = None
    is_default: bool | None = None

class ExecutiveDashboardResponse(ExecutiveDashboardBase, AuditResponseMixin):
    id: int
    user_id: int

class AICeoGoalBase(CRMBaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    status: str = Field(default="active", max_length=50)
    target_date: datetime | None = None
    metrics: dict[str, Any] = Field(default_factory=dict)

class AICeoGoalCreate(AICeoGoalBase):
    pass

class AICeoGoalUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    status: str | None = Field(default=None, max_length=50)
    target_date: datetime | None = None
    metrics: dict[str, Any] | None = None

class AICeoGoalResponse(AICeoGoalBase, AuditResponseMixin):
    id: int
    created_by_id: int | None = None

class AICeoRecommendationBase(CRMBaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    priority: str | None = Field(default=None, max_length=50)
    status: str = Field(default="pending", max_length=50)
    impact_analysis: dict[str, Any] = Field(default_factory=dict)
    suggested_actions: dict[str, Any] = Field(default_factory=dict)

class AICeoRecommendationCreate(AICeoRecommendationBase):
    pass

class AICeoRecommendationUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    priority: str | None = Field(default=None, max_length=50)
    status: str | None = Field(default=None, max_length=50)
    impact_analysis: dict[str, Any] | None = None
    suggested_actions: dict[str, Any] | None = None

class AICeoRecommendationResponse(AICeoRecommendationBase, AuditResponseMixin):
    id: int

class AICeoTaskDelegationBase(CRMBaseModel):
    title: str = Field(..., max_length=255)
    description: str | None = None
    recommendation_id: int | None = None
    department_id: int | None = None
    assigned_agent: str | None = Field(default=None, max_length=100)
    status: str = Field(default="pending", max_length=50)
    priority: str | None = Field(default=None, max_length=50)
    result_data: dict[str, Any] = Field(default_factory=dict)

class AICeoTaskDelegationCreate(AICeoTaskDelegationBase):
    pass

class AICeoTaskDelegationUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    description: str | None = None
    department_id: int | None = None
    assigned_agent: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, max_length=50)
    priority: str | None = Field(default=None, max_length=50)
    result_data: dict[str, Any] | None = None

class AICeoTaskDelegationResponse(AICeoTaskDelegationBase, AuditResponseMixin):
    id: int

class AICeoChatHistoryBase(CRMBaseModel):
    session_id: str = Field(..., max_length=100)
    message_role: str = Field(..., max_length=50)
    content: str
    context_data: dict[str, Any] = Field(default_factory=dict)

class AICeoChatHistoryCreate(AICeoChatHistoryBase):
    user_id: int

class AICeoChatHistoryResponse(AICeoChatHistoryBase):
    id: int
    uuid: str
    user_id: int
    created_at: datetime | None = None

class AICeoReportBase(CRMBaseModel):
    title: str = Field(..., max_length=255)
    report_type: str = Field(..., max_length=100)
    content: dict[str, Any]

class AICeoReportCreate(AICeoReportBase):
    user_id: int | None = None

class AICeoReportResponse(AICeoReportBase):
    id: int
    uuid: str
    user_id: int | None = None
    generated_at: datetime | None = None

class AIChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    context: dict[str, Any] | None = None
