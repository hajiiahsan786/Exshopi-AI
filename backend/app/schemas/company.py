from pydantic import BaseModel, EmailStr


class CompanyCreate(BaseModel):
    name: str
    phone: str | None = None
    email: EmailStr | None = None
    website: str | None = None


class CompanyResponse(CompanyCreate):
    id: int

    class Config:
        from_attributes = True
