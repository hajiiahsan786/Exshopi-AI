from __future__ import annotations
from app.repositories.crm_repository import CRMRepository
from app.models.agent import (
    Agent, AgentRole, AgentCapability, AgentPermission, AgentMemoryProfile, AgentConfiguration,
    AgentConversation, AgentSession, AgentTask, AgentTaskQueue, AgentExecution, AgentExecutionStep,
    AgentWorkflow, AgentDecision, AgentReasoningLog, AgentObservation, AgentPlan, AgentGoal,
    AgentSkill, AgentTool, AgentToolPermission, AgentEvent, AgentNotification, AgentAuditLog
)

class AgentRepository(CRMRepository[Agent]):
    model = Agent
    search_fields = ("name", "description", "status")

class AgentRoleRepository(CRMRepository[AgentRole]):
    model = AgentRole
    search_fields = ("name", "description")

class AgentCapabilityRepository(CRMRepository[AgentCapability]):
    model = AgentCapability
    search_fields = ("name", "description")

class AgentPermissionRepository(CRMRepository[AgentPermission]):
    model = AgentPermission
    search_fields = ("resource", "action")

class AgentMemoryProfileRepository(CRMRepository[AgentMemoryProfile]):
    model = AgentMemoryProfile
    search_fields = ("memory_type",)

class AgentConfigurationRepository(CRMRepository[AgentConfiguration]):
    model = AgentConfiguration
    search_fields = ("version",)

class AgentConversationRepository(CRMRepository[AgentConversation]):
    model = AgentConversation
    search_fields = ("title", "status")

class AgentSessionRepository(CRMRepository[AgentSession]):
    model = AgentSession
    search_fields = ("status",)

class AgentTaskRepository(CRMRepository[AgentTask]):
    model = AgentTask
    search_fields = ("description", "status")

class AgentTaskQueueRepository(CRMRepository[AgentTaskQueue]):
    model = AgentTaskQueue
    search_fields = ("status",)

class AgentExecutionRepository(CRMRepository[AgentExecution]):
    model = AgentExecution
    search_fields = ("status",)

class AgentExecutionStepRepository(CRMRepository[AgentExecutionStep]):
    model = AgentExecutionStep
    search_fields = ("action",)

class AgentWorkflowRepository(CRMRepository[AgentWorkflow]):
    model = AgentWorkflow
    search_fields = ("name", "description")

class AgentDecisionRepository(CRMRepository[AgentDecision]):
    model = AgentDecision
    search_fields = ("decision_type",)

class AgentReasoningLogRepository(CRMRepository[AgentReasoningLog]):
    model = AgentReasoningLog
    search_fields = ("log_content",)

class AgentObservationRepository(CRMRepository[AgentObservation]):
    model = AgentObservation

class AgentPlanRepository(CRMRepository[AgentPlan]):
    model = AgentPlan

class AgentGoalRepository(CRMRepository[AgentGoal]):
    model = AgentGoal
    search_fields = ("description", "status")

class AgentSkillRepository(CRMRepository[AgentSkill]):
    model = AgentSkill
    search_fields = ("name", "description")

class AgentToolRepository(CRMRepository[AgentTool]):
    model = AgentTool
    search_fields = ("name", "description")

class AgentToolPermissionRepository(CRMRepository[AgentToolPermission]):
    model = AgentToolPermission
    search_fields = ("permission_level",)

class AgentEventRepository(CRMRepository[AgentEvent]):
    model = AgentEvent
    search_fields = ("event_type",)

class AgentNotificationRepository(CRMRepository[AgentNotification]):
    model = AgentNotification
    search_fields = ("message",)

class AgentAuditLogRepository(CRMRepository[AgentAuditLog]):
    model = AgentAuditLog
    search_fields = ("action",)
