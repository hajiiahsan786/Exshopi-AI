from sqlalchemy import JSON, Boolean, Column, Float, ForeignKey, Integer, String, Text, DateTime, Enum, Table
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin
import enum


class AgentStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class AgentRole(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    agents = relationship("Agent", back_populates="role")
    permissions = relationship("AgentPermission", back_populates="role")


class AgentCapability(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_capabilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)


class AgentPermission(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("agent_roles.id"), nullable=False)
    resource = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)

    role = relationship("AgentRole", back_populates="permissions")


class AgentMemoryProfile(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_memory_profiles"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    memory_type = Column(String(50), nullable=False)
    config_data = Column(JSON, nullable=True)

    agent = relationship("Agent", back_populates="memory_profile")


class AgentConfiguration(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_configurations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    settings = Column(JSON, nullable=False)
    version = Column(String(50), nullable=False)

    agent = relationship("Agent", back_populates="configurations")


class Agent(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("agent_roles.id"), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(AgentStatus), default=AgentStatus.INACTIVE, nullable=False)
    metadata_data = Column(JSON, nullable=True)

    role = relationship("AgentRole", back_populates="agents")
    memory_profile = relationship("AgentMemoryProfile", back_populates="agent")
    configurations = relationship("AgentConfiguration", back_populates="agent")
    sessions = relationship("AgentSession", back_populates="agent")
    tasks = relationship("AgentTask", back_populates="agent")
    conversations = relationship("AgentConversation", back_populates="agent")


class AgentConversation(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_conversations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="active")

    agent = relationship("Agent", back_populates="conversations")
    user = relationship("User", foreign_keys=[user_id])


class AgentSession(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_sessions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("agent_conversations.id"), nullable=True)
    status = Column(String(50), nullable=False, default="active")

    agent = relationship("Agent", back_populates="sessions")


class AgentTask(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    priority = Column(Integer, default=0)

    agent = relationship("Agent", back_populates="tasks")


class AgentTaskQueue(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_task_queues"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("agent_tasks.id"), nullable=False)
    status = Column(String(50), nullable=False, default="queued")


class AgentExecution(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_executions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("agent_tasks.id"), nullable=False)
    status = Column(String(50), nullable=False, default="running")
    result = Column(JSON, nullable=True)


class AgentExecutionStep(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_execution_steps"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("agent_executions.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    action = Column(String(255), nullable=False)
    result = Column(JSON, nullable=True)


class AgentWorkflow(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    definition = Column(JSON, nullable=False)


class AgentDecision(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_decisions"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("agent_executions.id"), nullable=False)
    decision_type = Column(String(50), nullable=False)
    context_data = Column(JSON, nullable=True)
    outcome = Column(JSON, nullable=True)


class AgentReasoningLog(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_reasoning_logs"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("agent_executions.id"), nullable=False)
    log_content = Column(Text, nullable=False)


class AgentObservation(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_observations"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("agent_executions.id"), nullable=False)
    observation_data = Column(JSON, nullable=False)


class AgentPlan(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_plans"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("agent_tasks.id"), nullable=False)
    plan_steps = Column(JSON, nullable=False)


class AgentGoal(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_goals"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="active")


class AgentSkill(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)


class AgentTool(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    integration_config = Column(JSON, nullable=True)


class AgentToolPermission(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_tool_permissions"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("agent_tools.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("agent_roles.id"), nullable=False)
    permission_level = Column(String(50), nullable=False, default="read")


class AgentEvent(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_events"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_data = Column(JSON, nullable=True)


class AgentNotification(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_notifications"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)


class AgentAuditLog(Base, UUIDMixin, AuditMixin):
    __tablename__ = "agent_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(JSON, nullable=True)
