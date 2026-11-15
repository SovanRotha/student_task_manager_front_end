from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from back_end_student_task_manager.service import auth_service
from back_end_student_task_manager.core.security import create_access_token


def login(db: Session, email: str, password: str):

    user = auth_service.authenticate_user(
        db,
        email,
        password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }