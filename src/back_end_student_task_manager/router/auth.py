from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import auth_controller
from back_end_student_task_manager.schema.auth import LoginRequest, TokenResponse
from back_end_student_task_manager.core.dependencies import get_current_user
from back_end_student_task_manager.schema.user import UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Login
@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    return auth_controller.login(
        db,
        credentials.email,
        credentials.password
    )


# Get current authenticated user
@router.get("/me", response_model=UserResponse)
def me(
    current_user = Depends(get_current_user)
):
    return current_user