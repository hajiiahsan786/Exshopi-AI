from typing import Any
from sqlalchemy.orm import Session
from app.services.crm_service import CRMService
from app.models.agent import (
    Agent, AgentRole, AgentCapability, AgentPermission, AgentMemoryProfile, AgentConfiguration,
    AgentConversation, AgentSession, AgentTask, AgentTaskQueue, AgentExecution, AgentExecutionStep,
    AgentWorkflow, AgentDecision, AgentReasoningLog, AgentObservation, AgentPlan, AgentGoal,
    AgentSkill, AgentTool, AgentToolPermission, AgentEvent, AgentNotification, AgentAuditLog
)
from app.repositories.agent_repository import (
    AgentRepository, AgentRoleRepository, AgentCapabilityRepository, AgentPermissionRepository,
    AgentMemoryProfileRepository, AgentConfigurationRepository, AgentConversationRepository,
    AgentSessionRepository, AgentTaskRepository, AgentTaskQueueRepository, AgentExecutionRepository,
    AgentExecutionStepRepository, AgentWorkflowRepository, AgentDecisionRepository,
    AgentReasoningLogRepository, AgentObservationRepository, AgentPlanRepository, AgentGoalRepository,
    AgentSkillRepository, AgentToolRepository, AgentToolPermissionRepository, AgentEventRepository,
    AgentNotificationRepository, AgentAuditLogRepository
)

class AgentService(CRMService[Agent]):
    repository = AgentRepository
    entity_name = "Agent"
    duplicate_fields = ("name",)

class AgentRoleService(CRMService[AgentRole]):
    repository = AgentRoleRepository
    entity_name = "Agent Role"
    duplicate_fields = ("name",)

class AgentCapabilityService(CRMService[AgentCapability]):
    repository = AgentCapabilityRepository
    entity_name = "Agent Capability"
    duplicate_fields = ("name",)

class AgentPermissionService(CRMService[AgentPermission]):
    repository = AgentPermissionRepository
    entity_name = "Agent Permission"

class AgentMemoryProfileService(CRMService[AgentMemoryProfile]):
    repository = AgentMemoryProfileRepository
    entity_name = "Agent Memory Profile"

class AgentConfigurationService(CRMService[AgentConfiguration]):
    repository = AgentConfigurationRepository
    entity_name = "Agent Configuration"

class AgentConversationService(CRMService[AgentConversation]):
    repository = AgentConversationRepository
    entity_name = "Agent Conversation"

class AgentSessionService(CRMService[AgentSession]):
    repository = AgentSessionRepository
    entity_name = "Agent Session"

class AgentTaskService(CRMService[AgentTask]):
    repository = AgentTaskRepository
    entity_name = "Agent Task"

class AgentTaskQueueService(CRMService[AgentTaskQueue]):
    repository = AgentTaskQueueRepository
    entity_name = "Agent Task Queue"

class AgentExecutionService(CRMService[AgentExecution]):
    repository = AgentExecutionRepository
    entity_name = "Agent Execution"

class AgentExecutionStepService(CRMService[AgentExecutionStep]):
    repository = AgentExecutionStepRepository
    entity_name = "Agent Execution Step"

class AgentWorkflowService(CRMService[AgentWorkflow]):
    repository = AgentWorkflowRepository
    entity_name = "Agent Workflow"
    duplicate_fields = ("name",)

class AgentDecisionService(CRMService[AgentDecision]):
    repository = AgentDecisionRepository
    entity_name = "Agent Decision"

class AgentReasoningLogService(CRMService[AgentReasoningLog]):
    repository = AgentReasoningLogRepository
    entity_name = "Agent Reasoning Log"

class AgentObservationService(CRMService[AgentObservation]):
    repository = AgentObservationRepository
    entity_name = "Agent Observation"

class AgentPlanService(CRMService[AgentPlan]):
    repository = AgentPlanRepository
    entity_name = "Agent Plan"

class AgentGoalService(CRMService[AgentGoal]):
    repository = AgentGoalRepository
    entity_name = "Agent Goal"

class AgentSkillService(CRMService[AgentSkill]):
    repository = AgentSkillRepository
    entity_name = "Agent Skill"
    duplicate_fields = ("name",)

class AgentToolService(CRMService[AgentTool]):
    repository = AgentToolRepository
    entity_name = "Agent Tool"
    duplicate_fields = ("name",)

class AgentToolPermissionService(CRMService[AgentToolPermission]):
    repository = AgentToolPermissionRepository
    entity_name = "Agent Tool Permission"

class AgentEventService(CRMService[AgentEvent]):
    repository = AgentEventRepository
    entity_name = "Agent Event"

class AgentNotificationService(CRMService[AgentNotification]):
    repository = AgentNotificationRepository
    entity_name = "Agent Notification"

class AgentAuditLogService(CRMService[AgentAuditLog]):
    repository = AgentAuditLogRepository
    entity_name = "Agent Audit Log"
