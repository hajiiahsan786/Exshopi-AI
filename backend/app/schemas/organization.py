from pydantic import BaseModel, HttpUrl


class OrganizationCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    website: HttpUrl | None = None
    email: str | None = None
    phone: str | None = None
    country: str | None = None
    city: str | None = None


class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    owner_id: int

    class Config:
        from_attributes = True