from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import category_controller
from back_end_student_task_manager.schema.category import (
    CategoryResponse,
    CategoryCreate,
    CategoryUpdate
)

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@router.get("", response_model=list[CategoryResponse], include_in_schema=False)
@router.get("/", response_model=list[CategoryResponse])
def index(db: Session = Depends(get_db)):
    return category_controller.index(db)

@router.get("/{id}", response_model=CategoryResponse)
def show(id: int, db: Session = Depends(get_db)):
    return category_controller.show(db, id)

@router.post("", response_model=CategoryResponse, include_in_schema=False)
@router.post("/", response_model=CategoryResponse)
def create(category: CategoryCreate, db: Session = Depends(get_db)):
    return category_controller.create(db, category)

@router.put("/{id}", response_model=CategoryResponse)
def update(id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    return category_controller.update(db, id, category)

@router.delete("/{id}", response_model=CategoryResponse)
def delete(id: int, db: Session = Depends(get_db)):
    return category_controller.delete(db, id)
