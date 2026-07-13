from pydantic import BaseModel
from pydantic import EmailStr


class UserCreate(BaseModel):

    full_name: str

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int
    uuid: str

    full_name: str

    email: EmailStr
    phone: str | None = None

    role: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True
