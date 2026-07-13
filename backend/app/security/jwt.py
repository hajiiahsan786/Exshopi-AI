from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import JWTError, jwt

from app.core.settings import settings


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def create_token(
    *,
    subject: str,
    email: str,
    role: str,
    token_type: str,
    expires_delta: timedelta,
) -> tuple[str, str, datetime]:
    expires_at = _utc_now() + expires_delta
    jti = uuid4().hex
    payload = {
        "sub": subject,
        "email": email,
        "role": role,
        "type": token_type,
        "jti": jti,
        "exp": expires_at,
        "iat": _utc_now(),
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    return token, jti, expires_at


def create_access_token(*, subject: str, email: str, role: str):
    return create_token(
        subject=subject,
        email=email,
        role=role,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(*, subject: str, email: str, role: str):
    return create_token(
        subject=subject,
        email=email,
        role=role,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        return None


def verify_token(token: str, expected_type: str = "access") -> dict | None:
    payload = decode_token(token)

    if not payload or payload.get("type") != expected_type:
        return None

    return payload
