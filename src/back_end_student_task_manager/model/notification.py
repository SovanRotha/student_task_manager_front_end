from sqlalchemy import (
    Column, Integer, String, DateTime,
    ForeignKey, Boolean, func
)
from sqlalchemy.orm import relationship

from back_end_student_task_manager.database.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    task_id = Column(
        Integer,
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=True
    )

    title = Column(String(100), nullable=False)
    message = Column(String(255), nullable=False)

    notification_type = Column(String(50), nullable=False)

    is_read = Column(Boolean, nullable=False, default=False)

    read_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="notifications")
    task = relationship("Task", back_populates="notifications")