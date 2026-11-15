from back_end_student_task_manager.model import task
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    category_id: int | None = None
    title: str
    description: str | None = None
    due_date: datetime | None = None
    completed: bool
    status: str
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    user_id: int
    category_id: int | None = None
    due_date: datetime | None = None
    completed: bool = False
    status: str = Field(default="pending", max_length=20)
    created_at: datetime | None = None
    updated_at: datetime | None = None

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    user_id: int | None = None
    category_id: int | None = None
    due_date: datetime | None = None
    status: str | None = Field(default=None, max_length=20)
    completed: bool | None = None
    created_at: datetime | None = None