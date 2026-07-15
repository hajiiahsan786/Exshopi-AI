from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UUIDSchema(BaseModel):
    uuid: str

    class Config:
        from_attributes = True

# --- AI Provider ---
class AIProviderBase(BaseModel):
    name: str
    description: Optional[str] = None
    api_key_secret_name: Optional[str] = None
    base_url: Optional[str] = None
    is_active: bool = True

class AIProviderCreate(AIProviderBase):
    pass

class AIProviderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    api_key_secret_name: Optional[str] = None
    base_url: Optional[str] = None
    is_active: Optional[bool] = None

class AIProviderResponse(AIProviderBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Model ---
class AIModelBase(BaseModel):
    provider_id: int
    name: str
    model_identifier: str
    description: Optional[str] = None
    capabilities: Optional[Dict[str, Any]] = None
    is_active: bool = True

class AIModelCreate(AIModelBase):
    pass

class AIModelUpdate(BaseModel):
    provider_id: Optional[int] = None
    name: Optional[str] = None
    model_identifier: Optional[str] = None
    description: Optional[str] = None
    capabilities: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AIModelResponse(AIModelBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Session ---
class AISessionBase(BaseModel):
    user_id: Optional[int] = None
    title: Optional[str] = None
    is_active: bool = True

class AISessionCreate(AISessionBase):
    pass

class AISessionUpdate(BaseModel):
    user_id: Optional[int] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None

class AISessionResponse(AISessionBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Conversation ---
class AIConversationBase(BaseModel):
    session_id: Optional[int] = None
    title: Optional[str] = None
    status: str = "active"

class AIConversationCreate(AIConversationBase):
    pass

class AIConversationUpdate(BaseModel):
    session_id: Optional[int] = None
    title: Optional[str] = None
    status: Optional[str] = None

class AIConversationResponse(AIConversationBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Conversation Message ---
class AIConversationMessageBase(BaseModel):
    conversation_id: int
    role: str
    content: str
    meta_data: Optional[Dict[str, Any]] = None

class AIConversationMessageCreate(AIConversationMessageBase):
    pass

class AIConversationMessageUpdate(BaseModel):
    role: Optional[str] = None
    content: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None

class AIConversationMessageResponse(AIConversationMessageBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Agent ---
class AIAgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    model_id: Optional[int] = None
    status: str = "active"

class AIAgentCreate(AIAgentBase):
    pass

class AIAgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model_id: Optional[int] = None
    status: Optional[str] = None

class AIAgentResponse(AIAgentBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Agent Configuration ---
class AIAgentConfigurationBase(BaseModel):
    agent_id: int
    key: str
    value: Dict[str, Any]

class AIAgentConfigurationCreate(AIAgentConfigurationBase):
    pass

class AIAgentConfigurationUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[Dict[str, Any]] = None

class AIAgentConfigurationResponse(AIAgentConfigurationBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Agent Memory ---
class AIAgentMemoryBase(BaseModel):
    agent_id: int
    memory_type: str
    content: Dict[str, Any]

class AIAgentMemoryCreate(AIAgentMemoryBase):
    pass

class AIAgentMemoryUpdate(BaseModel):
    memory_type: Optional[str] = None
    content: Optional[Dict[str, Any]] = None

class AIAgentMemoryResponse(AIAgentMemoryBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Knowledge Base ---
class AIKnowledgeBaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class AIKnowledgeBaseCreate(AIKnowledgeBaseBase):
    pass

class AIKnowledgeBaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AIKnowledgeBaseResponse(AIKnowledgeBaseBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Knowledge Document ---
class AIKnowledgeDocumentBase(BaseModel):
    knowledge_base_id: int
    title: str
    content: str
    source_url: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None

class AIKnowledgeDocumentCreate(AIKnowledgeDocumentBase):
    pass

class AIKnowledgeDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_url: Optional[str] = None
    metadata_: Optional[Dict[str, Any]] = None

class AIKnowledgeDocumentResponse(AIKnowledgeDocumentBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Embedding ---
class AIEmbeddingBase(BaseModel):
    document_id: Optional[int] = None
    content_hash: Optional[str] = None
    embedding: Dict[str, Any]

class AIEmbeddingCreate(AIEmbeddingBase):
    pass

class AIEmbeddingUpdate(BaseModel):
    embedding: Optional[Dict[str, Any]] = None

class AIEmbeddingResponse(AIEmbeddingBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Prompt Template ---
class AIPromptTemplateBase(BaseModel):
    name: str
    template: str
    description: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None

class AIPromptTemplateCreate(AIPromptTemplateBase):
    pass

class AIPromptTemplateUpdate(BaseModel):
    name: Optional[str] = None
    template: Optional[str] = None
    description: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None

class AIPromptTemplateResponse(AIPromptTemplateBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Workflow ---
class AIWorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    definition: Dict[str, Any]

class AIWorkflowCreate(AIWorkflowBase):
    pass

class AIWorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    definition: Optional[Dict[str, Any]] = None

class AIWorkflowResponse(AIWorkflowBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Workflow Execution ---
class AIWorkflowExecutionBase(BaseModel):
    workflow_id: int
    status: str
    result: Optional[Dict[str, Any]] = None

class AIWorkflowExecutionCreate(AIWorkflowExecutionBase):
    pass

class AIWorkflowExecutionUpdate(BaseModel):
    status: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class AIWorkflowExecutionResponse(AIWorkflowExecutionBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Tool ---
class AIToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    parameters_schema: Optional[Dict[str, Any]] = None
    is_active: bool = True

class AIToolCreate(AIToolBase):
    pass

class AIToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parameters_schema: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AIToolResponse(AIToolBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Tool Execution ---
class AIToolExecutionBase(BaseModel):
    tool_id: int
    agent_id: Optional[int] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    status: str

class AIToolExecutionCreate(AIToolExecutionBase):
    pass

class AIToolExecutionUpdate(BaseModel):
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class AIToolExecutionResponse(AIToolExecutionBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Job ---
class AIJobBase(BaseModel):
    name: str
    status: str
    result: Optional[Dict[str, Any]] = None

class AIJobCreate(AIJobBase):
    pass

class AIJobUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class AIJobResponse(AIJobBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Job History ---
class AIJobHistoryBase(BaseModel):
    job_id: int
    status: str
    details: Optional[Dict[str, Any]] = None

class AIJobHistoryCreate(AIJobHistoryBase):
    pass

class AIJobHistoryUpdate(BaseModel):
    status: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AIJobHistoryResponse(AIJobHistoryBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Reasoning Log ---
class AIReasoningLogBase(BaseModel):
    agent_id: Optional[int] = None
    step: str
    content: str

class AIReasoningLogCreate(AIReasoningLogBase):
    pass

class AIReasoningLogUpdate(BaseModel):
    step: Optional[str] = None
    content: Optional[str] = None

class AIReasoningLogResponse(AIReasoningLogBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Context ---
class AIContextBase(BaseModel):
    session_id: Optional[int] = None
    context_data: Dict[str, Any]

class AIContextCreate(AIContextBase):
    pass

class AIContextUpdate(BaseModel):
    context_data: Optional[Dict[str, Any]] = None

class AIContextResponse(AIContextBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Usage ---
class AIUsageBase(BaseModel):
    user_id: Optional[int] = None
    total_tokens: int = 0
    total_cost: float = 0.0

class AIUsageCreate(AIUsageBase):
    pass

class AIUsageUpdate(BaseModel):
    total_tokens: Optional[int] = None
    total_cost: Optional[float] = None

class AIUsageResponse(AIUsageBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Token Usage ---
class AITokenUsageBase(BaseModel):
    model_id: int
    user_id: Optional[int] = None
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    cost: float = 0.0

class AITokenUsageCreate(AITokenUsageBase):
    pass

class AITokenUsageUpdate(BaseModel):
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    cost: Optional[float] = None

class AITokenUsageResponse(AITokenUsageBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# --- AI Audit Log ---
class AIAuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    details: Optional[Dict[str, Any]] = None

class AIAuditLogCreate(AIAuditLogBase):
    pass

class AIAuditLogUpdate(BaseModel):
    action: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AIAuditLogResponse(AIAuditLogBase, UUIDSchema):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
