from datatime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    password: str
    role: str
    profile: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=255)
    role: str = Field(default="user", max_length=20)
    profile: str | None = None
    status: str = Field(default="active", max_length=20)
    created_at: datetime | None = None
    updated_at: datetime | None = None

class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=6, max_length=255)
    role: str | None = Field(default=None, max_length=20)
    profile: str | None = None
    status: str | None = Field(default=None, max_length=20)
    created_at: datetime | None = None
    updated_at: datetime | None = None

