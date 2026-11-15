from sqlalchemy.orm import Session

from back_end_student_task_manager.model.user import User
from back_end_student_task_manager.core.security import verify_password


def authenticate_user(db: Session, email: str, password: str):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user