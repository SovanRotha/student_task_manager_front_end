from sqlalchemy.orm import Session
from back_end_student_task_manager.model.category import Category
from back_end_student_task_manager.schema.category import (
    CategoryCreate,
    CategoryUpdate,
)

def index(db: Session, user_id: int):
    return db.query(Category).filter(Category.user_id == user_id).all()


def count_categories(db: Session, user_id: int):
    return db.query(Category).filter(Category.user_id == user_id).count()

def show(db: Session, id: int, user_id: int):
    return db.query(Category).filter(Category.id == id, Category.user_id == user_id).first()

def create(db: Session, category_data: CategoryCreate, user_id: int):
    db_category = Category(
        name=category_data.name,
        description=category_data.description,
        user_id=user_id
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category

def update(db: Session, id: int, category_data: CategoryUpdate, user_id: int):
    db_category = db.query(Category).filter(Category.id == id, Category.user_id == user_id).first()

    if not db_category:
        return None

    if category_data.name is not None:
        db_category.name = category_data.name
    if category_data.description is not None:
        db_category.description = category_data.description

    db.commit()
    db.refresh(db_category)

    return db_category

def delete(db: Session, id: int, user_id: int):
    db_category = db.query(Category).filter(Category.id == id, Category.user_id == user_id).first()

    if not db_category:
        return None

    db.delete(db_category)
    db.commit()

    return db_category
