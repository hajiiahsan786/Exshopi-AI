from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.ai import (
    AIProvider, AIModel, AIConversation, AIConversationMessage,
    AIAgent, AIAgentConfiguration, AIAgentMemory, AIKnowledgeBase,
    AIKnowledgeDocument, AIEmbedding, AIPromptTemplate, AIWorkflow,
    AIWorkflowExecution, AITool, AIToolExecution, AIJob, AIJobHistory,
    AIReasoningLog, AIContext, AISession, AIUsage, AITokenUsage, AIAuditLog
)
from app.repositories.ai_repository import (
    AIProviderRepository, AIModelRepository, AIConversationRepository,
    AIConversationMessageRepository, AIAgentRepository, AIAgentConfigurationRepository,
    AIAgentMemoryRepository, AIKnowledgeBaseRepository, AIKnowledgeDocumentRepository,
    AIEmbeddingRepository, AIPromptTemplateRepository, AIWorkflowRepository,
    AIWorkflowExecutionRepository, AIToolRepository, AIToolExecutionRepository,
    AIJobRepository, AIJobHistoryRepository, AIReasoningLogRepository,
    AIContextRepository, AISessionRepository, AIUsageRepository, AITokenUsageRepository,
    AIAuditLogRepository
)

class AIService:

    # --- AI Provider ---
    @staticmethod
    def get_providers(db: Session, include_deleted: bool = False, skip: int = 0, limit: int = 100) -> List[AIProvider]:
        providers, _ = AIProviderRepository.list(db, include_deleted=include_deleted, page=(skip//limit)+1 if limit > 0 else 1, page_size=limit if limit > 0 else 100)
        return providers

    @staticmethod
    def get_provider(db: Session, provider_id: int) -> Optional[AIProvider]:
        return AIProviderRepository.get_by_id(db, provider_id)

    @staticmethod
    def create_provider(db: Session, data: dict, user_id: int) -> AIProvider:
        return AIProviderRepository.create(db, data, user_id)

    # --- AI Model ---
    @staticmethod
    def get_models(db: Session, include_deleted: bool = False, skip: int = 0, limit: int = 100) -> List[AIModel]:
        models, _ = AIModelRepository.list(db, include_deleted=include_deleted, page=(skip//limit)+1 if limit > 0 else 1, page_size=limit if limit > 0 else 100)
        return models

    @staticmethod
    def get_model(db: Session, model_id: int) -> Optional[AIModel]:
        return AIModelRepository.get_by_id(db, model_id)

    @staticmethod
    def create_model(db: Session, data: dict, user_id: int) -> AIModel:
        return AIModelRepository.create(db, data, user_id)

    # --- Conversations ---
    @staticmethod
    def create_conversation(db: Session, data: dict, user_id: int) -> AIConversation:
        return AIConversationRepository.create(db, data, user_id)

    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: int) -> List[AIConversationMessage]:
        messages, _ = AIConversationMessageRepository.list(db, filters={"conversation_id": conversation_id}, sort_by="created_at", sort_order="asc", page=1, page_size=1000)
        return messages

    @staticmethod
    def add_message(db: Session, conversation_id: int, role: str, content: str, meta_data: dict = None, user_id: int = None) -> AIConversationMessage:
        data = {
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "meta_data": meta_data
        }
        return AIConversationMessageRepository.create(db, data, user_id)

    # --- Agents ---
    @staticmethod
    def create_agent(db: Session, data: dict, user_id: int) -> AIAgent:
        return AIAgentRepository.create(db, data, user_id)

    @staticmethod
    def get_agent(db: Session, agent_id: int) -> Optional[AIAgent]:
        return AIAgentRepository.get_by_id(db, agent_id)

    @staticmethod
    def add_agent_memory(db: Session, agent_id: int, memory_type: str, content: dict, user_id: int = None) -> AIAgentMemory:
        data = {
            "agent_id": agent_id,
            "memory_type": memory_type,
            "content": content
        }
        return AIAgentMemoryRepository.create(db, data, user_id)

    # --- Usage & Audit ---
    @staticmethod
    def record_usage(db: Session, model_id: int, user_id: int, prompt_tokens: int, completion_tokens: int, cost: float) -> AITokenUsage:
        data = {
            "model_id": model_id,
            "user_id": user_id,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "cost": cost
        }
        return AITokenUsageRepository.create(db, data, user_id)

    @staticmethod
    def log_audit(db: Session, user_id: int, action: str, details: dict) -> AIAuditLog:
        data = {
            "user_id": user_id,
            "action": action,
            "details": details
        }
        return AIAuditLogRepository.create(db, data, user_id)
