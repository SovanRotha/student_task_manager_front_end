from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    Identity,
    func
)
from sqlalchemy.orm import relationship

from back_end_student_task_manager.database.base import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(
        BigInteger,
        Identity(),
        primary_key=True
    )

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    task_id = Column(
        BigInteger,
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True
    )

    action = Column(String(50), nullable=False)

    description = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="activity_logs")
    task = relationship("Task", back_populates="activity_logs")