from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import user_controller
from back_end_student_task_manager.schema.user import (
    UserCreate,
    UserUpdate,
    UserResponse
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("", response_model=list[UserResponse], include_in_schema=False)
@router.get("/", response_model=list[UserResponse])
def index(db: Session = Depends(get_db)):
    return user_controller.index(db)


@router.get("/{id}", response_model=UserResponse)
def show(id: int, db: Session = Depends(get_db)):
    return user_controller.show(db, id)


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
    db: Session = Depends(get_db)
):
    return user_controller.update(db, id, user)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(id: int, db: Session = Depends(get_db)):
    user_controller.delete(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
