import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi import Depends
from fastapi.testclient import TestClient

from app.database.base import Base
from app.database.session import get_db
import app.models  # Ensures all models are registered with Base
from app.main import app as fastapi_app
from app.models.notification import Notification, UserNotification, Broadcast, NotificationDelivery
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.services.notification_service import NotificationService
from app.security.dependencies import get_current_user, get_current_active_user
from app.security.hashing import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_get_current_user(db = Depends(get_db)):
    # Create dummy user
    user = db.query(User).filter_by(email="test@test.com").first()
    if not user:
        role = db.query(Role).filter_by(name="Admin").first()
        if not role:
            role = Role(name="Admin", description="Admin role")
            db.add(role)
            db.commit()
            db.refresh(role)

            perm = Permission(name="notifications.*", description="All notif")
            db.add(perm)
            db.commit()
            db.refresh(perm)

            role.permissions.append(perm)
            db.commit()

        user = User(
            full_name="Test User",
            email="test@test.com",
            password_hash=hash_password("password"),
            role_id=role.id,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

fastapi_app.dependency_overrides[get_db] = override_get_db
fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
fastapi_app.dependency_overrides[get_current_active_user] = override_get_current_user

client = TestClient(fastapi_app)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_create_user(db_session):
    user = override_get_current_user(db_session)
    assert user is not None

def test_send_notification_api(db_session):
    user = override_get_current_user(db_session)
    response = client.post(
        "/api/v1/notifications/send",
        json={
            "title": "Test Notif",
            "content": "Content here",
            "user_ids": [user.id]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"] == "Test Notif"

    # Check DB
    un = db_session.query(UserNotification).filter_by(user_id=user.id).first()
    assert un is not None
    assert un.is_read is False

def test_send_broadcast_api(db_session):
    response = client.post(
        "/api/v1/notifications/broadcast",
        json={
            "title": "Broadcast Test",
            "content": "Broadcast Content",
            "target_audience": {"role": "Admin"}
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["title"] == "Broadcast Test"

def test_mark_read_unread(db_session):
    user = override_get_current_user(db_session)

    # Create notif directly
    service = NotificationService(db_session)
    notif = service.send_notification("Title", "Body", [user.id])
    un = db_session.query(UserNotification).filter_by(notification_id=notif.id).first()

    # Mark read API
    res_read = client.post(f"/api/v1/notifications/user-notifications/{un.id}/read")
    assert res_read.status_code == 200
    assert res_read.json()["data"]["is_read"] is True

    # Mark unread API
    res_unread = client.post(f"/api/v1/notifications/user-notifications/{un.id}/unread")
    assert res_unread.status_code == 200
    assert res_unread.json()["data"]["is_read"] is False

def test_archive_notification(db_session):
    user = override_get_current_user(db_session)
    service = NotificationService(db_session)
    notif = service.send_notification("Title to archive", "Body", [user.id])
    un = db_session.query(UserNotification).filter_by(notification_id=notif.id).first()

    res_del = client.delete(f"/api/v1/notifications/user-notifications/{un.id}")
    assert res_del.status_code == 200

    db_session.refresh(un)
    assert un.deleted_at is not None

def test_template_crud(db_session):
    user = override_get_current_user(db_session)

    # Create
    res = client.post("/api/v1/notifications/templates", json={
        "name": "Welcome Email",
        "content": "Hello {{name}}!",
        "variables": {"name": "string"},
        "is_active": True
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["name"] == "Welcome Email"

    # Get List
    res_list = client.get("/api/v1/notifications/templates")
    assert res_list.status_code == 200
    assert len(res_list.json()["data"]["items"]) >= 1

def test_channel_crud(db_session):
    user = override_get_current_user(db_session)

    # Create
    res = client.post("/api/v1/notifications/channels", json={
        "name": "email",
        "config": {"smtp": "localhost"},
        "is_active": True
    })
    assert res.status_code == 200

    # Get List
    res_list = client.get("/api/v1/notifications/channels")
    assert res_list.status_code == 200
    assert len(res_list.json()["data"]["items"]) >= 1

def test_service_queue_email(db_session):
    user = override_get_current_user(db_session)
    service = NotificationService(db_session)
    q = service.queue_email("Test Subject", "<p>Test</p>", "test@example.com")
    assert q.status == "queued"

    # Process queue
    service.process_email_queue()

    db_session.refresh(q)
    assert q.status == "completed"
    assert q.attempts == 1

def test_service_delivery_fallback(db_session):
    user = override_get_current_user(db_session)
    service = NotificationService(db_session)

    # Ensure user has no preferences so it defaults to in-app (channel 1)
    notif = service.send_notification("Title", "Content", [user.id])

    # Process pending deliveries
    service.process_delivery_queues()

    deliveries = db_session.query(NotificationDelivery).filter_by(notification_id=notif.id).all()
    assert any(d.status == "delivered" for d in deliveries)
