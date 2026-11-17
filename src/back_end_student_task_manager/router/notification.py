from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import notification_controller
from back_end_student_task_manager.schema.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# GET all notifications
@router.get("", response_model=list[NotificationResponse], include_in_schema=False)
@router.get("/", response_model=list[NotificationResponse])
def index(db: Session = Depends(get_db)):
    return notification_controller.index(db)


# GET notification by ID
@router.get("/{id}", response_model=NotificationResponse)
def show(id: int, db: Session = Depends(get_db)):
    return notification_controller.show(db, id)


# CREATE notification
@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    return notification_controller.create(db, notification_data)


# UPDATE notification
@router.put("/{id}", response_model=NotificationResponse)
def update(
    id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db)
):
    return notification_controller.update(db, id, notification_data)


# DELETE notification
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(id: int, db: Session = Depends(get_db)):
    notification_controller.delete(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
