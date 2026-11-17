from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session
from back_end_student_task_manager.model.task import Task
from back_end_student_task_manager.schema.task import TaskCreate, TaskUpdate
from back_end_student_task_manager.service import activity_service

def index(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).all()

def show(db: Session, id: int, user_id: int):
    return db.query(Task).filter(Task.id == id, Task.user_id == user_id).first()

def create(db: Session, task_data: TaskCreate, user_id: int):
    if task_data.category_id is not None:
        from back_end_student_task_manager.model.category import Category
        category = db.query(Category).filter(
            Category.id == task_data.category_id,
            Category.user_id == user_id,
        ).first()
        if category is None:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Category not found")
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        status=task_data.status,
        user_id=user_id,
        category_id=task_data.category_id,
        completed_at=datetime.now(timezone.utc) if task_data.completed else None
    )

    db.add(db_task)
    db.flush()
    activity_service.log_activity(
        db=db,
        user_id=user_id,
        action="create",
        description=f"Task created: {task_data.title}",
        task_id=db_task.id
    )
    db.commit()
    db.refresh(db_task)

    return db_task

def update(db: Session, id: int, task_data: TaskUpdate, user_id: int):
    existing_task = db.query(Task).filter(Task.id == id, Task.user_id == user_id).first()

    if not existing_task:
        return None

    activity_service.log_activity(
        db=db,
        user_id=existing_task.user_id,
        action="update",
        description=f"Task updated: {existing_task.title}",
        task_id=existing_task.id
    )

    update_data = task_data.model_dump(exclude_unset=True)
    update_data.pop("user_id", None)
    if update_data.get("category_id") is not None:
        from back_end_student_task_manager.model.category import Category
        category = db.query(Category).filter(
            Category.id == update_data["category_id"], Category.user_id == user_id
        ).first()
        if category is None:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Category not found")
    if "completed" in update_data:
        completed = update_data.pop("completed")
        existing_task.completed_at = datetime.now(timezone.utc) if completed else None

    for key, value in update_data.items():
        setattr(existing_task, key, value)

    db.commit()
    db.refresh(existing_task)

    return existing_task

def delete(db: Session, id: int, user_id: int):
    existing_task = db.query(Task).filter(Task.id == id, Task.user_id == user_id).first()

    if not existing_task:
        return None

    activity_service.log_activity(
        db=db,
        user_id=existing_task.user_id,
        action="delete",
        description=f"Task deleted: {existing_task.title}",
        task_id=existing_task.id
    )

    db.delete(existing_task)
    db.commit()

    return existing_task


def get_tasks_by_user(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).all()

def count_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id).count()

def count_tasks_in_progress(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id, Task.status == "in_progress").count()

def count_tasks_completed(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id, Task.completed_at.isnot(None)).count()

def count_tasks_pending(db: Session, user_id: int):
    return db.query(Task).filter(Task.user_id == user_id, Task.status == "pending").count()

def count_tasks_overdue(db: Session, user_id: int):
    return db.query(Task).filter(
        Task.user_id == user_id,
        Task.due_date < datetime.now(timezone.utc),
        Task.completed_at.is_(None),
    ).count()

def up_coming_tasks(db: Session, user_id: int):
    return db.query(Task).filter(
        Task.user_id == user_id,
        Task.due_date >= datetime.now(timezone.utc),
    ).all()

def today_task(db: Session, user_id: int):
    today = datetime.now(timezone.utc).date()
    query = db.query(Task).filter(
        Task.user_id == user_id,
        Task.due_date.isnot(None),
        func.date(Task.due_date) == today
    )
    return query.all()

from datetime import datetime, timedelta, timezone

def up_coming_deadline_tasks(db: Session, user_id: int):
    now = datetime.now(timezone.utc)
    upcoming_time = now + timedelta(hours=3)

    query = db.query(Task).filter(
        Task.user_id == user_id,
        Task.due_date.isnot(None),
        Task.due_date >= now,
        Task.due_date <= upcoming_time
    )

    return query.order_by(Task.due_date.asc()).all()
