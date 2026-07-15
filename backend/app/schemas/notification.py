from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field

from app.schemas.crm_common import CRMBaseModel, AuditResponseMixin

class NotificationCategoryBase(CRMBaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    is_active: bool = True

class NotificationCategoryCreate(NotificationCategoryBase):
    pass

class NotificationCategoryUpdate(NotificationCategoryBase):
    name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class NotificationCategoryResponse(NotificationCategoryBase, AuditResponseMixin):
    id: int

class NotificationChannelBase(CRMBaseModel):
    name: str = Field(..., max_length=50)
    is_active: bool = True
    config: Optional[dict[str, Any]] = None

class NotificationChannelCreate(NotificationChannelBase):
    pass

class NotificationChannelUpdate(NotificationChannelBase):
    name: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None

class NotificationChannelResponse(NotificationChannelBase, AuditResponseMixin):
    id: int

class NotificationTemplateBase(CRMBaseModel):
    name: str = Field(..., max_length=150)
    category_id: Optional[int] = None
    content: str
    variables: Optional[dict[str, Any]] = None
    is_active: bool = True

class NotificationTemplateCreate(NotificationTemplateBase):
    pass

class NotificationTemplateUpdate(NotificationTemplateBase):
    name: Optional[str] = Field(None, max_length=150)
    content: Optional[str] = None
    is_active: Optional[bool] = None

class NotificationTemplateResponse(NotificationTemplateBase, AuditResponseMixin):
    id: int

class NotificationBase(CRMBaseModel):
    title: str = Field(..., max_length=255)
    content: str
    category_id: Optional[int] = None
    priority: str = Field(default="normal", max_length=50)

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    priority: Optional[str] = Field(None, max_length=50)

class NotificationResponse(NotificationBase, AuditResponseMixin):
    id: int

class UserNotificationBase(CRMBaseModel):
    user_id: int
    notification_id: int
    is_read: bool = False
    read_at: Optional[datetime] = None

class UserNotificationCreate(UserNotificationBase):
    pass

class UserNotificationUpdate(UserNotificationBase):
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None

class UserNotificationResponse(UserNotificationBase, AuditResponseMixin):
    id: int

class NotificationPreferenceBase(CRMBaseModel):
    user_id: int
    channel_id: int
    category_id: int
    is_enabled: bool = True

class NotificationPreferenceCreate(NotificationPreferenceBase):
    pass

class NotificationPreferenceUpdate(NotificationPreferenceBase):
    is_enabled: Optional[bool] = None

class NotificationPreferenceResponse(NotificationPreferenceBase, AuditResponseMixin):
    id: int

class NotificationDeliveryBase(CRMBaseModel):
    notification_id: int
    channel_id: int
    status: str = Field(default="pending", max_length=50)
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class NotificationDeliveryCreate(NotificationDeliveryBase):
    pass

class NotificationDeliveryUpdate(NotificationDeliveryBase):
    status: Optional[str] = Field(None, max_length=50)
    error_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

class NotificationDeliveryResponse(NotificationDeliveryBase, AuditResponseMixin):
    id: int

class BroadcastBase(CRMBaseModel):
    title: str = Field(..., max_length=255)
    content: str
    target_audience: dict[str, Any]
    status: str = Field(default="draft", max_length=50)
    scheduled_at: Optional[datetime] = None

class BroadcastCreate(BroadcastBase):
    pass

class BroadcastUpdate(BroadcastBase):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)
    target_audience: Optional[dict[str, Any]] = None

class BroadcastResponse(BroadcastBase, AuditResponseMixin):
    id: int

class ReminderScheduleBase(CRMBaseModel):
    name: str = Field(..., max_length=150)
    frequency: str = Field(..., max_length=50)
    config: Optional[dict[str, Any]] = None
    is_active: bool = True

class ReminderScheduleCreate(ReminderScheduleBase):
    pass

class ReminderScheduleUpdate(ReminderScheduleBase):
    name: Optional[str] = Field(None, max_length=150)
    frequency: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None

class ReminderScheduleResponse(ReminderScheduleBase, AuditResponseMixin):
    id: int

class ReminderBase(CRMBaseModel):
    schedule_id: int
    target_id: int
    target_type: str = Field(..., max_length=100)
    message: str
    status: str = Field(default="pending", max_length=50)
    due_date: datetime

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(ReminderBase):
    status: Optional[str] = Field(None, max_length=50)
    due_date: Optional[datetime] = None

class ReminderResponse(ReminderBase, AuditResponseMixin):
    id: int
