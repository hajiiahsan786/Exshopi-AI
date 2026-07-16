from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

class NotificationCategory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notification_categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)

class NotificationChannel(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notification_channels"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True) # email, sms, whatsapp, push, in-app, webhook
    is_active = Column(Boolean, default=True)
    config = Column(JSON, nullable=True)

class NotificationTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notification_templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    category_id = Column(Integer, ForeignKey("notification_categories.id"))
    content = Column(Text, nullable=False)
    variables = Column(JSON, nullable=True) # expected variables
    is_active = Column(Boolean, default=True)

    category = relationship("NotificationCategory")

class Notification(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("notification_categories.id"))
    priority = Column(String(50), default="normal") # low, normal, high, urgent

    category = relationship("NotificationCategory")

class UserNotification(UUIDMixin, AuditMixin, Base):
    __tablename__ = "user_notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notification_id = Column(Integer, ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    notification = relationship("Notification")

class NotificationPreference(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notification_preferences"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    channel_id = Column(Integer, ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("notification_categories.id", ondelete="CASCADE"), nullable=False)
    is_enabled = Column(Boolean, default=True)

    user = relationship("User", foreign_keys=[user_id])
    channel = relationship("NotificationChannel")
    category = relationship("NotificationCategory")

class NotificationDelivery(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notification_deliveries"
    id = Column(Integer, primary_key=True)
    notification_id = Column(Integer, ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False)
    channel_id = Column(Integer, ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending") # pending, sent, failed, delivered, read
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    notification = relationship("Notification")
    channel = relationship("NotificationChannel")

class EmailTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "email_templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    subject = Column(String(255), nullable=False)
    body_html = Column(Text, nullable=False)
    body_text = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

class EmailMessage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "email_messages"
    id = Column(Integer, primary_key=True)
    subject = Column(String(255), nullable=False)
    body_html = Column(Text, nullable=False)
    body_text = Column(Text, nullable=True)
    sender = Column(String(255), nullable=False)
    recipient = Column(String(255), nullable=False)
    cc = Column(String(255), nullable=True)
    bcc = Column(String(255), nullable=True)
    status = Column(String(50), default="pending")

class EmailAttachment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "email_attachments"
    id = Column(Integer, primary_key=True)
    email_message_id = Column(Integer, ForeignKey("email_messages.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=True)

    email_message = relationship("EmailMessage")

class EmailQueue(UUIDMixin, AuditMixin, Base):
    __tablename__ = "email_queue"
    id = Column(Integer, primary_key=True)
    email_message_id = Column(Integer, ForeignKey("email_messages.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="queued") # queued, processing, completed, failed
    attempts = Column(Integer, default=0)
    last_attempt_at = Column(DateTime(timezone=True), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    email_message = relationship("EmailMessage")

class SMSTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "sms_templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    content = Column(String(1600), nullable=False)
    is_active = Column(Boolean, default=True)

class SMSMessage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "sms_messages"
    id = Column(Integer, primary_key=True)
    sender = Column(String(50), nullable=False)
    recipient = Column(String(50), nullable=False)
    content = Column(String(1600), nullable=False)
    status = Column(String(50), default="pending")

class SMSQueue(UUIDMixin, AuditMixin, Base):
    __tablename__ = "sms_queue"
    id = Column(Integer, primary_key=True)
    sms_message_id = Column(Integer, ForeignKey("sms_messages.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="queued")
    attempts = Column(Integer, default=0)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    sms_message = relationship("SMSMessage")

class WhatsAppTemplate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "whatsapp_templates"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)

class WhatsAppMessage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "whatsapp_messages"
    id = Column(Integer, primary_key=True)
    sender = Column(String(50), nullable=False)
    recipient = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(50), default="pending")

class WhatsAppQueue(UUIDMixin, AuditMixin, Base):
    __tablename__ = "whatsapp_queue"
    id = Column(Integer, primary_key=True)
    whatsapp_message_id = Column(Integer, ForeignKey("whatsapp_messages.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="queued")
    attempts = Column(Integer, default=0)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    whatsapp_message = relationship("WhatsAppMessage")

class PushSubscription(UUIDMixin, AuditMixin, Base):
    __tablename__ = "push_subscriptions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_token = Column(String(255), nullable=False)
    device_type = Column(String(50), nullable=False) # ios, android, web
    is_active = Column(Boolean, default=True)

    user = relationship("User", foreign_keys=[user_id])

class PushNotification(UUIDMixin, AuditMixin, Base):
    __tablename__ = "push_notifications"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)
    status = Column(String(50), default="pending")

class InAppNotification(UUIDMixin, AuditMixin, Base):
    __tablename__ = "in_app_notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    action_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)

    user = relationship("User", foreign_keys=[user_id])

class Announcement(UUIDMixin, AuditMixin, Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

class Broadcast(UUIDMixin, AuditMixin, Base):
    __tablename__ = "broadcasts"
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    target_audience = Column(JSON, nullable=False) # filter criteria like roles, departments
    status = Column(String(50), default="draft") # draft, scheduled, sending, completed
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

class ReminderSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "reminder_schedules"
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    frequency = Column(String(50), nullable=False) # daily, weekly, monthly, custom
    config = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

class Reminder(UUIDMixin, AuditMixin, Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True)
    schedule_id = Column(Integer, ForeignKey("reminder_schedules.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(Integer, nullable=False)
    target_type = Column(String(100), nullable=False) # e.g., Task, Invoice
    message = Column(Text, nullable=False)
    status = Column(String(50), default="pending")
    due_date = Column(DateTime(timezone=True), nullable=False)

    schedule = relationship("ReminderSchedule")

class NotificationAuditLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "notification_audit_logs"
    id = Column(Integer, primary_key=True)
    action = Column(String(100), nullable=False)
    details = Column(JSON, nullable=True)
