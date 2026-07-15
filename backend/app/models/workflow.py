from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

class WorkflowCategory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

class Workflow(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("workflow_categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    category = relationship("WorkflowCategory")

class WorkflowVersion(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_versions"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    version_number = Column(Integer, nullable=False, default=1)
    definition = Column(JSON, nullable=True)
    is_published = Column(Boolean, default=False)

    workflow = relationship("Workflow")

class WorkflowStep(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_steps"
    id = Column(Integer, primary_key=True, index=True)
    workflow_version_id = Column(Integer, ForeignKey("workflow_versions.id"), nullable=False)
    name = Column(String(255), nullable=False)
    step_type = Column(String(50), nullable=False)
    configuration = Column(JSON, nullable=True)

    workflow_version = relationship("WorkflowVersion")

class WorkflowTransition(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_transitions"
    id = Column(Integer, primary_key=True, index=True)
    workflow_version_id = Column(Integer, ForeignKey("workflow_versions.id"), nullable=False)
    source_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    target_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=False)
    name = Column(String(255), nullable=True)

    workflow_version = relationship("WorkflowVersion")
    source_step = relationship("WorkflowStep", foreign_keys=[source_step_id])
    target_step = relationship("WorkflowStep", foreign_keys=[target_step_id])

class WorkflowCondition(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_conditions"
    id = Column(Integer, primary_key=True, index=True)
    transition_id = Column(Integer, ForeignKey("workflow_transitions.id"), nullable=False)
    rule = Column(JSON, nullable=False)

    transition = relationship("WorkflowTransition")

class WorkflowAction(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_actions"
    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=False)
    action_type = Column(String(50), nullable=False)
    configuration = Column(JSON, nullable=True)

    step = relationship("WorkflowStep")

class WorkflowTrigger(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_triggers"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    trigger_type = Column(String(50), nullable=False)
    configuration = Column(JSON, nullable=True)

    workflow = relationship("Workflow")

class WorkflowExecution(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_executions"
    id = Column(Integer, primary_key=True, index=True)
    workflow_version_id = Column(Integer, ForeignKey("workflow_versions.id"), nullable=False)
    status = Column(String(50), nullable=False, default="running")
    current_step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    context_data = Column(JSON, nullable=True)

    workflow_version = relationship("WorkflowVersion")
    current_step = relationship("WorkflowStep")

class WorkflowExecutionLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_execution_logs"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=False)
    step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=True)
    action = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)

    execution = relationship("WorkflowExecution")
    step = relationship("WorkflowStep")

class WorkflowTask(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_tasks"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=False)
    step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), nullable=False, default="pending")

    execution = relationship("WorkflowExecution")
    step = relationship("WorkflowStep")
    assignee = relationship("User", foreign_keys=[assigned_to])

class WorkflowApproval(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_approvals"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("workflow_tasks.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    comments = Column(Text, nullable=True)

    task = relationship("WorkflowTask")

class WorkflowApprover(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_approvers"
    id = Column(Integer, primary_key=True, index=True)
    approval_id = Column(Integer, ForeignKey("workflow_approvals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")

    approval = relationship("WorkflowApproval")
    user = relationship("User", foreign_keys=[user_id])

class WorkflowApprovalHistory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_approval_histories"
    id = Column(Integer, primary_key=True, index=True)
    approval_id = Column(Integer, ForeignKey("workflow_approvals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)

    approval = relationship("WorkflowApproval")
    user = relationship("User", foreign_keys=[user_id])

from sqlalchemy import DateTime

class WorkflowSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_schedules"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    cron_expression = Column(String(100), nullable=False)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    workflow = relationship("Workflow")

class WorkflowTimer(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_timers"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=False)
    step_id = Column(Integer, ForeignKey("workflow_steps.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False, default="pending")

    execution = relationship("WorkflowExecution")
    step = relationship("WorkflowStep")

class WorkflowVariable(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_variables"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    name = Column(String(255), nullable=False)
    data_type = Column(String(50), nullable=False)
    default_value = Column(String(255), nullable=True)

    workflow = relationship("Workflow")

class WorkflowTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    definition = Column(JSON, nullable=False)

class WorkflowNotification(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_notifications"
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)

    execution = relationship("WorkflowExecution")
    user = relationship("User", foreign_keys=[user_id])

class WorkflowAuditLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "workflow_audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    execution_id = Column(Integer, ForeignKey("workflow_executions.id"), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(JSON, nullable=True)

    workflow = relationship("Workflow")
    execution = relationship("WorkflowExecution")
