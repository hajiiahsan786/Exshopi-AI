from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.notification import (
    Notification, NotificationCategory, NotificationTemplate, NotificationChannel,
    UserNotification, NotificationPreference, NotificationDelivery, Broadcast,
    ReminderSchedule, Reminder, EmailMessage, EmailQueue, SMSMessage, SMSQueue,
    NotificationAuditLog
)

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def _log_audit(self, action: str, details: Dict[str, Any], user_id: Optional[int] = None):
        log = NotificationAuditLog(action=action, details=details, created_by=user_id)
        self.db.add(log)
        self.db.commit()

    def send_notification(self, title: str, content: str, user_ids: List[int], category_id: Optional[int] = None, priority: str = "normal", sender_id: Optional[int] = None, scheduled_at: Optional[datetime] = None) -> Notification:
        notif = Notification(
            title=title,
            content=content,
            category_id=category_id,
            priority=priority,
            created_by=sender_id
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)

        self._log_audit("create_notification", {"notification_id": notif.id, "title": title}, sender_id)

        for user_id in user_ids:
            user_notif = UserNotification(
                user_id=user_id,
                notification_id=notif.id,
                is_read=False
            )
            self.db.add(user_notif)

            # Determine channels based on preference or fallback
            preferences = self.db.execute(select(NotificationPreference).where(NotificationPreference.user_id == user_id, NotificationPreference.is_enabled == True)).scalars().all()

            channel_ids = [p.channel_id for p in preferences]
            # Default to in-app if no preferences
            if not channel_ids:
                in_app_channel = self.db.execute(select(NotificationChannel).where(NotificationChannel.name == "in-app")).scalars().first()
                if not in_app_channel:
                    in_app_channel = NotificationChannel(name="in-app")
                    self.db.add(in_app_channel)
                    self.db.commit()
                    self.db.refresh(in_app_channel)
                channel_ids = [in_app_channel.id]

            for ch_id in channel_ids:
                delivery = NotificationDelivery(
                    notification_id=notif.id,
                    channel_id=ch_id,
                    status="pending" if scheduled_at else "queued",
                )
                self.db.add(delivery)

        self.db.commit()
        return notif

    def process_delivery_queues(self):
        """Background worker to process delivery queues"""
        now = datetime.now(timezone.utc)

        # Process pending deliveries
        deliveries = self.db.execute(select(NotificationDelivery).where(NotificationDelivery.status == "queued")).scalars().all()
        for delivery in deliveries:
            try:
                # Simulate channel dispatch
                channel = self.db.get(NotificationChannel, delivery.channel_id)
                if getattr(channel, 'name', 'in-app') == "email":
                    # Fallback or route to email
                    pass
                delivery.status = "delivered"
                delivery.delivered_at = now
            except Exception as e:
                delivery.status = "failed"
                delivery.error_message = str(e)
                # Channel fallback logic
                in_app_channel = self.db.execute(select(NotificationChannel).where(NotificationChannel.name == "in-app")).scalars().first()
                fallback = NotificationDelivery(
                    notification_id=delivery.notification_id,
                    channel_id=in_app_channel.id if in_app_channel else delivery.channel_id,
                    status="queued"
                )
                self.db.add(fallback)
        self.db.commit()

    def queue_email(self, subject: str, html: str, recipient: str, sender: str = "noreply@exshopi.ai", scheduled_at: Optional[datetime] = None) -> EmailQueue:
        msg = EmailMessage(subject=subject, body_html=html, sender=sender, recipient=recipient)
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)

        q = EmailQueue(email_message_id=msg.id, scheduled_at=scheduled_at, status="queued")
        self.db.add(q)
        self.db.commit()
        self.db.refresh(q)
        return q

    def process_email_queue(self):
        now = datetime.now(timezone.utc)
        items = self.db.execute(select(EmailQueue).where(EmailQueue.status == 'queued', (EmailQueue.scheduled_at <= now) | (EmailQueue.scheduled_at.is_(None)))).scalars().all()
        for item in items:
            item.attempts += 1
            item.last_attempt_at = now
            try:
                # Mock email send
                item.status = "completed"
                msg = self.db.get(EmailMessage, item.email_message_id)
                if msg: msg.status = "sent"
            except Exception as e:
                if item.attempts >= 3:
                    item.status = "failed"
                else:
                    item.scheduled_at = now + timedelta(minutes=5 * item.attempts) # Exponential backoff
        self.db.commit()

    def send_broadcast(self, title: str, content: str, target_audience: Dict[str, Any], sender_id: Optional[int] = None) -> Broadcast:
        broadcast = Broadcast(
            title=title,
            content=content,
            target_audience=target_audience,
            status="scheduled",
            created_by=sender_id
        )
        self.db.add(broadcast)
        self.db.commit()
        self.db.refresh(broadcast)
        self._log_audit("create_broadcast", {"broadcast_id": broadcast.id}, sender_id)
        return broadcast

    def mark_read(self, user_notification_id: int, user_id: int) -> Optional[UserNotification]:
        un = self.db.query(UserNotification).filter_by(id=user_notification_id, user_id=user_id).first()
        if un and not un.is_read:
            un.is_read = True
            un.read_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(un)
        return un

    def mark_unread(self, user_notification_id: int, user_id: int) -> Optional[UserNotification]:
        un = self.db.query(UserNotification).filter_by(id=user_notification_id, user_id=user_id).first()
        if un and un.is_read:
            un.is_read = False
            un.read_at = None
            self.db.commit()
            self.db.refresh(un)
        return un

    def archive_notification(self, user_notification_id: int, user_id: int) -> bool:
        un = self.db.query(UserNotification).filter_by(id=user_notification_id, user_id=user_id).first()
        if un:
            un.deleted_at = datetime.now(timezone.utc)
            un.deleted_by = user_id
            self.db.commit()
            return True
        return False

    def render_template(self, template_id: int, variables: Dict[str, Any]) -> str:
        template = self.db.query(NotificationTemplate).filter_by(id=template_id).first()
        if not template:
            raise ValueError("Template not found")
        content = template.content
        for k, v in variables.items():
            content = content.replace(f"{{{{{k}}}}}", str(v))
        return content
