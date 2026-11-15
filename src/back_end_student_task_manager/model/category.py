from sqlalchemy.orm import relationship
from sqlalchemy import Column, ForeignKey, Integer, String, ForeignKey

from back_end_student_task_manager.database.base import Base
from back_end_student_task_manager.model import user

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete = "CASCADE",), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)

    user = relationship("User", back_populates="categories")

    tasks = relationship("Task", back_populates="category", cascade="all, delete-orphan")