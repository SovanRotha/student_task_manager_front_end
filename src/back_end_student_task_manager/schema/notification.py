from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    task_id: int | None = None
    message: str
    is_read: bool
    title: str
    notification_type: str
    read_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    user_id: int | None = None
    task_id: int | None = None
    message: str = Field(min_length=2, max_length=255)
    title: str = Field(min_length=2, max_length=100)
    type: str = Field(min_length=2, max_length=50)


class NotificationUpdate(BaseModel):
    task_id: int | None = None
    message: str | None = Field(default=None, min_length=2, max_length=255)
    is_read: bool | None = None
    title: str | None = Field(default=None, min_length=2, max_length=100)
    type: str | None = Field(default=None, min_length=2, max_length=50)
    read_at: datetime | None = None
