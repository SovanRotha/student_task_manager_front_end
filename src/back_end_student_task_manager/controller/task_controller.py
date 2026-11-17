from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from back_end_student_task_manager.service import task_service
from back_end_student_task_manager.schema.task import TaskResponse, TaskCreate, TaskUpdate

def index(db: Session, user_id: int):
    return task_service.index(db, user_id)

def show(db: Session, id: int, user_id: int):
    task = task_service.show(db, id, user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

def create(db: Session, task: TaskCreate, user_id: int):
    return task_service.create(db, task, user_id)

def update(db: Session, id: int, task: TaskUpdate, user_id: int):
    existing_task = db.query(task_service.Task).filter(task_service.Task.id == id, task_service.Task.user_id == user_id).first()

    if not existing_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return task_service.update(db, id, task, user_id)

def delete(db: Session, id: int, user_id: int):
    existing_task = db.query(task_service.Task).filter(task_service.Task.id == id, task_service.Task.user_id == user_id).first()

    if not existing_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return task_service.delete(db, id, user_id)

