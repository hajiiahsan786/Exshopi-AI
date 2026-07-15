import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.dependencies import get_db
from app.main import app as fastapi_app
from app.models.user import User

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.database.base import Base

import app.models.user
import app.models.company
import app.models.organization
import app.models.department
import app.models.employee
import app.models.customer
import app.models.lead
import app.models.contact
import app.models.opportunity
import app.models.activity
import app.models.crm_task
import app.models.inventory
import app.models.sales
import app.models.finance
import app.models.role
import app.models.permission
import app.models.auth_token
import app.models.aiceo

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

fastapi_app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    with TestClient(fastapi_app) as c:
        yield c

@pytest.fixture(scope="module")
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="module")
def admin_user(db_session):
    user = User(
        email="admin@exshopi.com",
        full_name="Admin User",
        password_hash="test",
        role_id=1,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="module")
def admin_token_headers(admin_user):
    # This assumes some auth handling is mocked or we override get_current_user
    return {"Authorization": "Bearer test-token"}

from app.security.dependencies import get_current_user
def override_get_current_user():
    return User(id=1, email="admin@exshopi.com", role_id=1)

fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
