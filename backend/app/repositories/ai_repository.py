from __future__ import annotations

from app.models.ai import (
    AIAgent,
    AIAgentConfiguration,
    AIAgentMemory,
    AIAuditLog,
    AIContext,
    AIConversation,
    AIConversationMessage,
    AIEmbedding,
    AIJob,
    AIJobHistory,
    AIKnowledgeBase,
    AIKnowledgeDocument,
    AIModel,
    AIPromptTemplate,
    AIProvider,
    AIReasoningLog,
    AISession,
    AITokenUsage,
    AITool,
    AIToolExecution,
    AIUsage,
    AIWorkflow,
    AIWorkflowExecution,
)
from app.repositories.crm_repository import CRMRepository


class AIProviderRepository(CRMRepository[AIProvider]):
    model = AIProvider


class AIModelRepository(CRMRepository[AIModel]):
    model = AIModel


class AIConversationRepository(CRMRepository[AIConversation]):
    model = AIConversation


class AIConversationMessageRepository(CRMRepository[AIConversationMessage]):
    model = AIConversationMessage


class AIAgentRepository(CRMRepository[AIAgent]):
    model = AIAgent


class AIAgentConfigurationRepository(CRMRepository[AIAgentConfiguration]):
    model = AIAgentConfiguration


class AIAgentMemoryRepository(CRMRepository[AIAgentMemory]):
    model = AIAgentMemory


class AIKnowledgeBaseRepository(CRMRepository[AIKnowledgeBase]):
    model = AIKnowledgeBase


class AIKnowledgeDocumentRepository(CRMRepository[AIKnowledgeDocument]):
    model = AIKnowledgeDocument


class AIEmbeddingRepository(CRMRepository[AIEmbedding]):
    model = AIEmbedding


class AIPromptTemplateRepository(CRMRepository[AIPromptTemplate]):
    model = AIPromptTemplate


class AIWorkflowRepository(CRMRepository[AIWorkflow]):
    model = AIWorkflow


class AIWorkflowExecutionRepository(CRMRepository[AIWorkflowExecution]):
    model = AIWorkflowExecution


class AIToolRepository(CRMRepository[AITool]):
    model = AITool


class AIToolExecutionRepository(CRMRepository[AIToolExecution]):
    model = AIToolExecution


class AIJobRepository(CRMRepository[AIJob]):
    model = AIJob


class AIJobHistoryRepository(CRMRepository[AIJobHistory]):
    model = AIJobHistory


class AIReasoningLogRepository(CRMRepository[AIReasoningLog]):
    model = AIReasoningLog


class AIContextRepository(CRMRepository[AIContext]):
    model = AIContext


class AISessionRepository(CRMRepository[AISession]):
    model = AISession


class AIUsageRepository(CRMRepository[AIUsage]):
    model = AIUsage


class AITokenUsageRepository(CRMRepository[AITokenUsage]):
    model = AITokenUsage


class AIAuditLogRepository(CRMRepository[AIAuditLog]):
    model = AIAuditLog
