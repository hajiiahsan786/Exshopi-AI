from typing import TypeVar, Type, Generic, Any, Sequence, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.notification import (
    Notification, NotificationCategory, NotificationTemplate, NotificationChannel,
    UserNotification, NotificationPreference, NotificationDelivery, Broadcast,
    ReminderSchedule, Reminder
)
from app.repositories.crm_repository import CRMRepository

ModelType = TypeVar("ModelType")

class BaseNotificationRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return db.scalar(select(self.model).where(self.model.id == id))

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        return db.scalars(select(self.model).offset(skip).limit(limit)).all()

    def create(self, db: Session, *, obj_in: Any, created_by: int | None = None) -> ModelType:
        obj_in_data = obj_in.model_dump()
        if hasattr(self.model, "created_by"):
            obj_in_data["created_by"] = created_by
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: ModelType, obj_in: Any, updated_by: int | None = None) -> ModelType:
        obj_data = db_obj.__dict__
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        if hasattr(db_obj, "updated_by"):
            setattr(db_obj, "updated_by", updated_by)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> None:
        obj = self.get(db, id)
        if obj:
            db.delete(obj)
            db.commit()

class NotificationCategoryRepository(BaseNotificationRepository[NotificationCategory]):
    pass

class NotificationChannelRepository(BaseNotificationRepository[NotificationChannel]):
    pass

class NotificationTemplateRepository(BaseNotificationRepository[NotificationTemplate]):
    pass

class NotificationRepository(BaseNotificationRepository[Notification]):
    pass

class UserNotificationRepository(BaseNotificationRepository[UserNotification]):
    def get_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> Sequence[UserNotification]:
        return db.scalars(select(self.model).where(self.model.user_id == user_id).offset(skip).limit(limit)).all()

class NotificationPreferenceRepository(BaseNotificationRepository[NotificationPreference]):
    def get_by_user(self, db: Session, user_id: int) -> Sequence[NotificationPreference]:
        return db.scalars(select(self.model).where(self.model.user_id == user_id)).all()

class NotificationDeliveryRepository(BaseNotificationRepository[NotificationDelivery]):
    pass

class BroadcastRepository(BaseNotificationRepository[Broadcast]):
    pass

class ReminderScheduleRepository(BaseNotificationRepository[ReminderSchedule]):
    pass

class ReminderRepository(BaseNotificationRepository[Reminder]):
    pass

notification_category_repo = NotificationCategoryRepository(NotificationCategory)
notification_channel_repo = NotificationChannelRepository(NotificationChannel)
notification_template_repo = NotificationTemplateRepository(NotificationTemplate)
notification_repo = NotificationRepository(Notification)
user_notification_repo = UserNotificationRepository(UserNotification)
notification_preference_repo = NotificationPreferenceRepository(NotificationPreference)
notification_delivery_repo = NotificationDeliveryRepository(NotificationDelivery)
broadcast_repo = BroadcastRepository(Broadcast)
reminder_schedule_repo = ReminderScheduleRepository(ReminderSchedule)
reminder_repo = ReminderRepository(Reminder)
