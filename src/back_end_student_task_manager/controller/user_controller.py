from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from back_end_student_task_manager.service import user_service
from back_end_student_task_manager.schema.user import UserResponse, UserCreate, UserUpdate

def index(db: Session):
    return user_service.index(db)

def show(db: Session, id: int):
    user = user_service.show(db, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def create(db: Session, user: UserCreate):
    existing_user = db.query(user_service.User).filter(user_service.User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    return user_service.create(db, user)

def update(db: Session, id: int, user: UserUpdate):
    existing_user = db.query(user_service.User).filter(user_service.User.id == id).first()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.email is not None:
        email_user = db.query(user_service.User).filter(user_service.User.email == user.email).first()
        if email_user and email_user.id != id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    return user_service.update(db, id, user)

def delete(db: Session, id: int):
    existing_user = db.query(user_service.User).filter(user_service.User.id == id).first()

    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user_service.delete(db, id)



