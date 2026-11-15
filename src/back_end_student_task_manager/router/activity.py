from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import activity_controller
from back_end_student_task_manager.schema.activity import (
    ActivityLogCreate,
    ActivityLogResponse
)


router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)


# GET all activity logs
@router.get("/", response_model=list[ActivityLogResponse])
def index(db: Session = Depends(get_db)):
    return activity_controller.index(db)


# GET activity log by ID
@router.get("/{id}", response_model=ActivityLogResponse)
def show(id: int, db: Session = Depends(get_db)):
    return activity_controller.show(db, id)


# GET activity logs by user ID
@router.get("/user/{user_id}", response_model=list[ActivityLogResponse])
def get_by_user(user_id: int, db: Session = Depends(get_db)):
    return activity_controller.get_by_user(db, user_id)


# CREATE activity log
@router.post(
    "/",
    response_model=ActivityLogResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    activity_data: ActivityLogCreate,
    db: Session = Depends(get_db)
):
    return activity_controller.create(db, activity_data)


# DELETE activity log
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(id: int, db: Session = Depends(get_db)):
    activity_controller.delete(db, id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)