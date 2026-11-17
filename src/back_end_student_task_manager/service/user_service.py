from sqlalchemy.orm import Session

from back_end_student_task_manager.model.user import User
from back_end_student_task_manager.schema.user import UserCreate, UserUpdate
from back_end_student_task_manager.core.security import hash_password


# Get all users
def index(db: Session):
    return db.query(User).all()


def count_users(db: Session):
    return db.query(User).count()


# Get user by ID
def show(db: Session, id: int):
    return db.query(User).filter(User.id == id).first()


# Get user by email
def get_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


# Create user
def create(db: Session, user: UserCreate):

    hashed_password = hash_password(user.password)

    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="user",
        profile=user.profile,
        status="active"
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# Update user
def update(db: Session, id: int, user: UserUpdate):

    db_user = show(db, id)

    if not db_user:
        return None

    update_data = user.model_dump(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        update_data["password"] = hash_password(update_data["password"])

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    return db_user


# Delete user
def delete(db: Session, id: int):

    db_user = show(db, id)

    if not db_user:
        return None

    db.delete(db_user)
    db.commit()

    return db_user
