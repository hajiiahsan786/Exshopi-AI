from typing import Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.security.dependencies import get_current_user
from app.models.user import User
from app.schemas.crm_common import PaginatedResponse
from app.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse,
    AgentRoleCreate, AgentRoleUpdate, AgentRoleResponse,
    AgentToolCreate, AgentToolUpdate, AgentToolResponse
)
from app.services.agent_service import AgentService, AgentRoleService, AgentToolService

router = APIRouter()

# Agents
@router.get("/", response_model=PaginatedResponse)
def list_agents(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    current_user: User = Depends(get_current_user),
) -> Any:
    return AgentService.list(
        db,
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )

@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(
    data: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return AgentService.create(db, data, user_id=current_user.id)

@router.get("/{id}", response_model=AgentResponse)
def get_agent(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return AgentService.get(db, id)

@router.put("/{id}", response_model=AgentResponse)
def update_agent(
    id: int,
    data: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return AgentService.update(db, id, data, user_id=current_user.id)

@router.delete("/{id}", response_model=AgentResponse)
def delete_agent(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    return AgentService.delete(db, id, user_id=current_user.id)
