from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.ai import (
    AIProviderCreate, AIProviderResponse,
    AIModelCreate, AIModelResponse,
    AIConversationCreate, AIConversationResponse,
    AIConversationMessageCreate, AIConversationMessageResponse
)
from app.services.ai_service import AIService
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_active_user

router = APIRouter()

@router.get("/providers", response_model=List[AIProviderResponse])
def get_providers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return AIService.get_providers(db, skip=skip, limit=limit)

@router.post("/providers", response_model=AIProviderResponse)
def create_provider(
    *,
    db: Session = Depends(get_db),
    provider_in: AIProviderCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return AIService.create_provider(db, data=provider_in.model_dump(), user_id=current_user.id)

@router.get("/models", response_model=List[AIModelResponse])
def get_models(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return AIService.get_models(db, skip=skip, limit=limit)

@router.post("/models", response_model=AIModelResponse)
def create_model(
    *,
    db: Session = Depends(get_db),
    model_in: AIModelCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return AIService.create_model(db, data=model_in.model_dump(), user_id=current_user.id)

@router.post("/conversations", response_model=AIConversationResponse)
def create_conversation(
    *,
    db: Session = Depends(get_db),
    conversation_in: AIConversationCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return AIService.create_conversation(db, data=conversation_in.model_dump(), user_id=current_user.id)

@router.get("/conversations/{conversation_id}/messages", response_model=List[AIConversationMessageResponse])
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return AIService.get_conversation_messages(db, conversation_id=conversation_id)

@router.post("/conversations/{conversation_id}/messages", response_model=AIConversationMessageResponse)
def add_message(
    conversation_id: int,
    *,
    db: Session = Depends(get_db),
    message_in: AIConversationMessageCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    if message_in.conversation_id != conversation_id:
        raise HTTPException(status_code=400, detail="Conversation ID mismatch")
    return AIService.add_message(
        db,
        conversation_id=conversation_id,
        role=message_in.role,
        content=message_in.content,
        meta_data=message_in.meta_data,
        user_id=current_user.id
    )
