from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import task_controller
from back_end_student_task_manager.schema.task import (
    TaskResponse,
    TaskCreate,
    TaskUpdate
)
from back_end_student_task_manager.core.dependencies import get_current_user
from back_end_student_task_manager.model.user import User

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

@router.get("", response_model=list[TaskResponse], include_in_schema=False)
@router.get("/", response_model=list[TaskResponse])
def index(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_controller.index(db, current_user.id)

@router.get("/{id}", response_model=TaskResponse)
def show(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_controller.show(db, id, current_user.id)

@router.post("", response_model=TaskResponse, include_in_schema=False)
@router.post("/", response_model=TaskResponse)
def create(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_controller.create(db, task, current_user.id)

@router.put("/{id}", response_model=TaskResponse)
def update(id: int, task: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_controller.update(db, id, task, current_user.id)

@router.delete("/{id}", response_model=TaskResponse)
def delete(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return task_controller.delete(db, id, current_user.id)
