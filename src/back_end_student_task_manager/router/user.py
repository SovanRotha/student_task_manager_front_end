from fastapi import APIRouter, Depends, Response, status, HTTPException
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import user_controller
from back_end_student_task_manager.schema.user import (
    UserCreate,
    UserUpdate,
    UserResponse
)
from back_end_student_task_manager.core.dependencies import get_current_user
from back_end_student_task_manager.model.user import User as AuthenticatedUser

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("", response_model=list[UserResponse], include_in_schema=False)
@router.get("/", response_model=list[UserResponse])
def index(db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)):
    return [current_user]


@router.get("/{id}", response_model=UserResponse)
def show(id: int, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)):
    if id != current_user.id:
        raise HTTPException(status_code=404, detail="User not found")
    return current_user


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return user_controller.create(db, user)


@router.put("/{id}", response_model=UserResponse)
def update(
    id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    if id != current_user.id:
        raise HTTPException(status_code=404, detail="User not found")
    return user_controller.update(db, id, user)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(id: int, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)):
    if id != current_user.id:
        raise HTTPException(status_code=404, detail="User not found")
    user_controller.delete(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
