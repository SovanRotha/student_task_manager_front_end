from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from back_end_student_task_manager.service import task_service
from back_end_student_task_manager.schema.task import TaskResponse, TaskCreate, TaskUpdate

def index(db: Session):
    return task_service.index(db)

def show(db: Session, id: int):
    task = task_service.show(db, id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

def create(db: Session, task: TaskCreate):
    return task_service.create(db, task)

def update(db: Session, id: int, task: TaskUpdate):
    existing_task = db.query(task_service.Task).filter(task_service.Task.id == id).first()

    if not existing_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return task_service.update(db, id, task)

def delete(db: Session, id: int):
    existing_task = db.query(task_service.Task).filter(task_service.Task.id == id).first()

    if not existing_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return task_service.delete(db, id)

