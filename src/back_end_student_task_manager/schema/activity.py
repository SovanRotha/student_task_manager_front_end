from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class ActivityLogCreate(BaseModel):
    user_id: int | None = None
    task_id: int | None = None

    action: str = Field(
        min_length=2,
        max_length=50
    )

    description: str | None = None


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    task_id: int | None = None
    action: str
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
