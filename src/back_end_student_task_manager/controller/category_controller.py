from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from back_end_student_task_manager.service import category_service
from back_end_student_task_manager.schema.category import CategoryResponse, CategoryCreate, CategoryUpdate

def index(db: Session):
    return category_service.index(db)

def show(db: Session, id: int):
    category = category_service.show(db, id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

def create(db: Session, category: CategoryCreate):
    return category_service.create(db, category)

def update(db: Session, id: int, category: CategoryUpdate):
    existing_category = db.query(category_service.Category).filter(category_service.Category.id == id).first()

    if not existing_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return category_service.update(db, id, category)

def delete(db: Session, id: int):
    existing_category = db.query(category_service.Category).filter(category_service.Category.id == id).first()

    if not existing_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return category_service.delete(db, id)