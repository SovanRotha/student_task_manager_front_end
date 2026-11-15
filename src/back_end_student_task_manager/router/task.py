from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import task_controller
from back_end_student_task_manager.schema.task import (
    TaskResponse,
    TaskCreate,
    TaskUpdate
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@router.get("/", response_model=list[TaskResponse])
def index(db: Session = Depends(get_db)):
    return task_controller.index(db)

@router.get("/{id}", response_model=TaskResponse)
def show(id: int, db: Session = Depends(get_db)):
    return task_controller.show(db, id)

@router.post("/", response_model=TaskResponse)
def create(task: TaskCreate, db: Session = Depends(get_db)):
    return task_controller.create(db, task)

@router.put("/{id}", response_model=TaskResponse)
def update(id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    return task_controller.update(db, id, task)

@router.delete("/{id}", response_model=TaskResponse)
def delete(id: int, db: Session = Depends(get_db)):
    return task_controller.delete(db, id)