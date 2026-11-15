from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from back_end_student_task_manager.model import user, category
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    description: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    user_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    user_id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None