from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    position: str | None = None
    is_active: bool = True


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        from_attributes = True
