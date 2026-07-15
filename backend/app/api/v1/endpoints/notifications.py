from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.models.notification import Notification, UserNotification, Broadcast
from app.security.dependencies import get_current_user, require_permission
from app.services.notification_service import NotificationService
from app.schemas.notification import (
    NotificationResponse, NotificationCreate, BroadcastCreate, BroadcastResponse,
    UserNotificationResponse
)
from app.schemas.crm_common import APIResponse, PaginatedResponse

router = APIRouter()

class SendNotificationRequest(BaseModel):
    title: str
    content: str
    user_ids: List[int]
    category_id: int | None = None
    priority: str = "normal"

@router.post("/send", response_model=APIResponse[NotificationResponse])
def send_notification(
    req: SendNotificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("notifications.send")),
) -> Any:
    service = NotificationService(db)
    notif = service.send_notification(
        title=req.title,
        content=req.content,
        user_ids=req.user_ids,
        category_id=req.category_id,
        priority=req.priority,
        sender_id=current_user.id
    )
    background_tasks.add_task(service.process_delivery_queues)
    return APIResponse(success=True, message="Notification sent successfully", data=notif)

@router.post("/broadcast", response_model=APIResponse[BroadcastResponse])
def send_broadcast(
    req: BroadcastCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("notifications.broadcast")),
) -> Any:
    service = NotificationService(db)
    broadcast = service.send_broadcast(
        title=req.title,
        content=req.content,
        target_audience=req.target_audience,
        sender_id=current_user.id
    )
    return APIResponse(success=True, message="Broadcast scheduled successfully", data=broadcast)

@router.get("/user-notifications", response_model=APIResponse[PaginatedResponse[UserNotificationResponse]])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = Query(None)
) -> Any:
    query = select(UserNotification).where(UserNotification.user_id == current_user.id, UserNotification.deleted_at.is_(None))
    if is_read is not None:
        query = query.where(UserNotification.is_read == is_read)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.execute(query.offset((page - 1) * page_size).limit(page_size)).scalars().all()

    pages = (total + page_size - 1) // page_size

    return APIResponse(
        success=True,
        message="User notifications retrieved",
        data=PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)
    )

@router.post("/user-notifications/{id}/read", response_model=APIResponse[UserNotificationResponse])
def mark_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = NotificationService(db)
    un = service.mark_read(id, current_user.id)
    if not un:
        raise HTTPException(status_code=404, detail="User notification not found")
    return APIResponse(success=True, message="Marked as read", data=un)

@router.post("/user-notifications/{id}/unread", response_model=APIResponse[UserNotificationResponse])
def mark_unread(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = NotificationService(db)
    un = service.mark_unread(id, current_user.id)
    if not un:
        raise HTTPException(status_code=404, detail="User notification not found")
    return APIResponse(success=True, message="Marked as unread", data=un)

@router.delete("/user-notifications/{id}", response_model=APIResponse[None])
def archive_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    service = NotificationService(db)
    success = service.archive_notification(id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="User notification not found")
    return APIResponse(success=True, message="Notification archived", data=None)


from app.schemas.notification import (
    NotificationTemplateResponse, NotificationTemplateCreate, NotificationTemplateUpdate,
    NotificationChannelResponse, NotificationChannelCreate, NotificationChannelUpdate
)
from app.repositories.notification_repository import (
    notification_template_repo, notification_channel_repo
)

@router.get("/templates", response_model=APIResponse[PaginatedResponse[NotificationTemplateResponse]])
def get_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
) -> Any:
    items = notification_template_repo.get_all(db, skip=(page-1)*page_size, limit=page_size)
    total = db.scalar(select(func.count()).select_from(notification_template_repo.model)) or 0
    return APIResponse(
        success=True, message="Templates retrieved",
        data=PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=(total+page_size-1)//page_size)
    )

@router.post("/templates", response_model=APIResponse[NotificationTemplateResponse])
def create_template(
    req: NotificationTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    item = notification_template_repo.create(db, obj_in=req, created_by=current_user.id)
    return APIResponse(success=True, message="Template created", data=item)

@router.get("/channels", response_model=APIResponse[PaginatedResponse[NotificationChannelResponse]])
def get_channels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
) -> Any:
    items = notification_channel_repo.get_all(db, skip=(page-1)*page_size, limit=page_size)
    total = db.scalar(select(func.count()).select_from(notification_channel_repo.model)) or 0
    return APIResponse(
        success=True, message="Channels retrieved",
        data=PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=(total+page_size-1)//page_size)
    )

@router.post("/channels", response_model=APIResponse[NotificationChannelResponse])
def create_channel(
    req: NotificationChannelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    item = notification_channel_repo.create(db, obj_in=req, created_by=current_user.id)
    return APIResponse(success=True, message="Channel created", data=item)
