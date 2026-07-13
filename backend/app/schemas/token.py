from datetime import datetime

from pydantic import BaseModel


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    access_token_expires_at: datetime
    refresh_token_expires_at: datetime


class TokenPayload(BaseModel):
    sub: str
    email: str | None = None
    role: str | None = None
    type: str
    jti: str
    exp: int
