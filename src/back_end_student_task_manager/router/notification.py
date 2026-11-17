from fastapi import APIRouter, BackgroundTasks, Depends, Response, status
from sqlalchemy.orm import Session

from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import notification_controller
from back_end_student_task_manager.schema.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse
)
from back_end_student_task_manager.core.dependencies import get_current_user
from back_end_student_task_manager.model.user import User
from back_end_student_task_manager.service.email_service import send_notification_email

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# GET all notifications
@router.get("", response_model=list[NotificationResponse], include_in_schema=False)
@router.get("/", response_model=list[NotificationResponse])
def index(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return notification_controller.index(db, current_user.id)


# GET notification by ID
@router.get("/{id}", response_model=NotificationResponse)
def show(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return notification_controller.show(db, id, current_user.id)


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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = notification_controller.create(
        db, notification_data, current_user.id
    )
    background_tasks.add_task(
        send_notification_email,
        current_user.email,
        notification.title,
        notification.message,
    )
    return notification


# UPDATE notification
@router.put("/{id}", response_model=NotificationResponse)
def update(
    id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return notification_controller.update(db, id, notification_data, current_user.id)


# DELETE notification
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_controller.delete(db, id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
