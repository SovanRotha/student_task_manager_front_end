from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from back_end_student_task_manager.service import category_service
from back_end_student_task_manager.schema.category import CategoryResponse, CategoryCreate, CategoryUpdate

def index(db: Session, user_id: int):
    return category_service.index(db, user_id)

def show(db: Session, id: int, user_id: int):
    category = category_service.show(db, id, user_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

def create(db: Session, category: CategoryCreate, user_id: int):
    return category_service.create(db, category, user_id)

def update(db: Session, id: int, category: CategoryUpdate, user_id: int):
    existing_category = db.query(category_service.Category).filter(category_service.Category.id == id, category_service.Category.user_id == user_id).first()

    if not existing_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return category_service.update(db, id, category, user_id)

def delete(db: Session, id: int, user_id: int):
    existing_category = db.query(category_service.Category).filter(category_service.Category.id == id, category_service.Category.user_id == user_id).first()

    if not existing_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    return category_service.delete(db, id, user_id)
