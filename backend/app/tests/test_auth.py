import pytest
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import AuthService
from app.security.hashing import verify_password
from app.security.jwt import create_access_token, decode_token

def test_user_registration_and_login(db: Session):
    # Ensure Role exists
    role = db.query(Role).filter(Role.name == "Admin").first()
    if not role:
        role = Role(name="Admin", description="Administrator")
        db.add(role)
        db.commit()
        db.refresh(role)

    # 1. Register a user
    register_req = RegisterRequest(
        company_name="Test Company",
        full_name="Alice Smith",
        email="alice@example.com",
        password="SecurePassword123!",
        phone="+1234567890",
        country="US",
        language="en",
        timezone="UTC",
        accept_terms=True
    )

    reg_data = AuthService.register(db, register_req)
    assert reg_data["user"]["email"] == "alice@example.com"
    assert reg_data["user"]["full_name"] == "Alice Smith"
    assert reg_data["user"]["is_verified"] is False

    # Check password is encrypted
    user = db.query(User).filter(User.email == "alice@example.com").first()
    assert user is not None
    assert verify_password("SecurePassword123!", user.password_hash)

    # 2. Try Login (needs email to be verified, but let's verify it first so they can login)
    user.is_verified = True
    db.commit()

    login_req = LoginRequest(
        email="alice@example.com",
        password="SecurePassword123!"
    )
    login_data = AuthService.login(db, login_req)
    assert "tokens" in login_data
    assert "access_token" in login_data["tokens"]
    assert "refresh_token" in login_data["tokens"]
    assert login_data["user"]["email"] == "alice@example.com"

    # Decode and verify token
    payload = decode_token(login_data["tokens"]["access_token"])
    assert payload is not None
    assert payload["sub"] == str(user.id)


def test_rbac_endpoints_and_permissions(client: TestClient, db: Session):
    # Seed Role and Permissions
    read_perm = Permission(name="inventory.read", description="Read inventory")
    db.add(read_perm)

    role_user = Role(name="Employee", description="Standard Employee")
    role_user.permissions.append(read_perm)
    db.add(role_user)
    db.commit()

    # Create active, verified user
    user = User(
        full_name="Bob Jones",
        email="bob@example.com",
        password_hash="$2b$12$EixZaYVK1fsY1FnylS6rKe310Z.x/N/zB4Jg4/b8zE.b.Yl8h1I2a", # dummy bcrypt
        role_id=role_user.id,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create valid JWT
    token = create_access_token(subject=str(user.id), email=user.email, role="Employee")

    # Try GET to a protected route with current_user
    headers = {"Authorization": f"Bearer {token[0]}"}

    # We can test GET /api/v1/auth/me using our TestClient
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["email"] == "bob@example.com"
