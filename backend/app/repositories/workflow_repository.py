from __future__ import annotations

from app.models.workflow import (
    WorkflowCategory,
    Workflow,
    WorkflowVersion,
    WorkflowStep,
    WorkflowTransition,
    WorkflowCondition,
    WorkflowAction,
    WorkflowTrigger,
    WorkflowExecution,
    WorkflowExecutionLog,
    WorkflowTask,
    WorkflowApproval,
    WorkflowApprover,
    WorkflowApprovalHistory,
    WorkflowSchedule,
    WorkflowTimer,
    WorkflowVariable,
    WorkflowTemplate,
    WorkflowNotification,
    WorkflowAuditLog,
)
from app.repositories.crm_repository import CRMRepository

class WorkflowCategoryRepository(CRMRepository[WorkflowCategory]):
    model = WorkflowCategory
    search_fields = ("name", "description")

class WorkflowRepository(CRMRepository[Workflow]):
    model = Workflow
    search_fields = ("name", "description")

class WorkflowVersionRepository(CRMRepository[WorkflowVersion]):
    model = WorkflowVersion

class WorkflowStepRepository(CRMRepository[WorkflowStep]):
    model = WorkflowStep
    search_fields = ("name", "step_type")

class WorkflowTransitionRepository(CRMRepository[WorkflowTransition]):
    model = WorkflowTransition
    search_fields = ("name",)

class WorkflowConditionRepository(CRMRepository[WorkflowCondition]):
    model = WorkflowCondition

class WorkflowActionRepository(CRMRepository[WorkflowAction]):
    model = WorkflowAction
    search_fields = ("action_type",)

class WorkflowTriggerRepository(CRMRepository[WorkflowTrigger]):
    model = WorkflowTrigger
    search_fields = ("trigger_type",)

class WorkflowExecutionRepository(CRMRepository[WorkflowExecution]):
    model = WorkflowExecution
    search_fields = ("status",)

class WorkflowExecutionLogRepository(CRMRepository[WorkflowExecutionLog]):
    model = WorkflowExecutionLog
    search_fields = ("action", "status", "message")

class WorkflowTaskRepository(CRMRepository[WorkflowTask]):
    model = WorkflowTask
    search_fields = ("status",)

class WorkflowApprovalRepository(CRMRepository[WorkflowApproval]):
    model = WorkflowApproval
    search_fields = ("status", "comments")

class WorkflowApproverRepository(CRMRepository[WorkflowApprover]):
    model = WorkflowApprover
    search_fields = ("status",)

class WorkflowApprovalHistoryRepository(CRMRepository[WorkflowApprovalHistory]):
    model = WorkflowApprovalHistory
    search_fields = ("action", "comments")

class WorkflowScheduleRepository(CRMRepository[WorkflowSchedule]):
    model = WorkflowSchedule
    search_fields = ("cron_expression",)

class WorkflowTimerRepository(CRMRepository[WorkflowTimer]):
    model = WorkflowTimer
    search_fields = ("status",)

class WorkflowVariableRepository(CRMRepository[WorkflowVariable]):
    model = WorkflowVariable
    search_fields = ("name", "data_type")

class WorkflowTemplateRepository(CRMRepository[WorkflowTemplate]):
    model = WorkflowTemplate
    search_fields = ("name", "description")

class WorkflowNotificationRepository(CRMRepository[WorkflowNotification]):
    model = WorkflowNotification
    search_fields = ("message",)

class WorkflowAuditLogRepository(CRMRepository[WorkflowAuditLog]):
    model = WorkflowAuditLog
    search_fields = ("action",)
