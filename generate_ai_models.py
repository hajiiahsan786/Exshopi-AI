import os

models_content = """from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, JSON, Text, Float
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.crm_mixins import UUIDMixin, AuditMixin

class AIProvider(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    api_key_secret_name = Column(String(255), nullable=True)
    base_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)

class AIModel(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_models"
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("ai_providers.id"), nullable=False)
    name = Column(String(255), nullable=False)
    model_identifier = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    capabilities = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

class AISession(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    user = relationship("User", foreign_keys=[user_id])

class AIConversation(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_conversations"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_sessions.id"), nullable=True)
    title = Column(String(255), nullable=True)
    status = Column(String(50), default="active")

class AIConversationMessage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_conversation_messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id"), nullable=False)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    meta_data = Column(JSON, nullable=True) # e.g. token usage, tool calls

class AIAgent(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=True)
    status = Column(String(50), default="active")

class AIAgentConfiguration(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_agent_configurations"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("ai_agents.id"), nullable=False)
    key = Column(String(255), nullable=False)
    value = Column(JSON, nullable=False)

class AIAgentMemory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_agent_memories"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("ai_agents.id"), nullable=False)
    memory_type = Column(String(50), nullable=False) # e.g. short_term, long_term
    content = Column(JSON, nullable=False)

class AIKnowledgeBase(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_knowledge_bases"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

class AIKnowledgeDocument(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_knowledge_documents"
    id = Column(Integer, primary_key=True, index=True)
    knowledge_base_id = Column(Integer, ForeignKey("ai_knowledge_bases.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source_url = Column(String(2048), nullable=True)
    metadata_ = Column(JSON, nullable=True)

class AIEmbedding(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_embeddings"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("ai_knowledge_documents.id"), nullable=True)
    content_hash = Column(String(64), nullable=True)
    embedding = Column(JSON, nullable=False) # Use JSON for vector data initially or specific pgvector if available

class AIPromptTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_prompt_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    template = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    variables = Column(JSON, nullable=True)

class AIWorkflow(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    definition = Column(JSON, nullable=False)

class AIWorkflowExecution(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_workflow_executions"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("ai_workflows.id"), nullable=False)
    status = Column(String(50), nullable=False)
    result = Column(JSON, nullable=True)

class AITool(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_tools"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    parameters_schema = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

class AIToolExecution(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_tool_executions"
    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("ai_tools.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("ai_agents.id"), nullable=True)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False)

class AIJob(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_jobs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    result = Column(JSON, nullable=True)

class AIJobHistory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_job_history"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("ai_jobs.id"), nullable=False)
    status = Column(String(50), nullable=False)
    details = Column(JSON, nullable=True)

class AIReasoningLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_reasoning_logs"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("ai_agents.id"), nullable=True)
    step = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

class AIContext(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_contexts"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_sessions.id"), nullable=True)
    context_data = Column(JSON, nullable=False)

class AIUsage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_usages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    user = relationship("User", foreign_keys=[user_id])

class AITokenUsage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_token_usages"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ai_models.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    user = relationship("User", foreign_keys=[user_id])

class AIAuditLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "ai_audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(JSON, nullable=True)
    user = relationship("User", foreign_keys=[user_id])
"""

with open("backend/app/models/ai.py", "w") as f:
    f.write(models_content)

print("AI models generated successfully.")
