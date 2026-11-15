from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from back_end_student_task_manager.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False, default="user")
    profile = Column(String, nullable=True)
    status = Column(String(20), nullable=False, default="active")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    categories = relationship(
        "Category",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    tasks = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    activity_logs = relationship(
        "ActivityLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )