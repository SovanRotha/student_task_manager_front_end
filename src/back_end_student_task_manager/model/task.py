from sqlalchemy.orm import Session, relationship
from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey
from back_end_student_task_manager.database.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    priority = Column(String(20), nullable=False, default="medium")
    status = Column(String(20), nullable=False, default="pending")
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)



    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship("User", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")
    notifications = relationship("Notification", back_populates="task", cascade="all, delete-orphan")
    activity_logs = relationship(
        "ActivityLog",
        back_populates="task"
    )

    @property
    def completed(self) -> bool:
        return self.completed_at is not None