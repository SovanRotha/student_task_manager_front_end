from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import activity_controller
from back_end_student_task_manager.schema.activity import (
    ActivityLogCreate,
    ActivityLogResponse
)
from back_end_student_task_manager.core.dependencies import get_current_user
from back_end_student_task_manager.model.user import User


router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)


# GET all activity logs
@router.get("", response_model=list[ActivityLogResponse], include_in_schema=False)
@router.get("/", response_model=list[ActivityLogResponse])
def index(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return activity_controller.index(db, current_user.id)


# GET activity log by ID
@router.get("/{id}", response_model=ActivityLogResponse)
def show(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return activity_controller.show(db, id, current_user.id)


# GET activity logs by user ID
@router.get("/user/{user_id}", response_model=list[ActivityLogResponse])
def get_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return activity_controller.get_by_user(db, user_id, current_user.id)


# CREATE activity log
@router.post(
    "",
    response_model=ActivityLogResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@router.post(
    "/",
    response_model=ActivityLogResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    activity_data: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return activity_controller.create(db, activity_data, current_user.id)


# DELETE activity log
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    activity_controller.delete(db, id, current_user.id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
