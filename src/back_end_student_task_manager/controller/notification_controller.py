from sqlalchemy.orm import Session
from fastapi import HTTPException

from back_end_student_task_manager.model.notification import Notification
from back_end_student_task_manager.schema.notification import (
    NotificationCreate,
    NotificationUpdate
)


# Get all notifications
def index(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).all()


# Get notification by ID
def show(db: Session, id: int, user_id: int):
    notification = db.query(Notification).filter(
        Notification.id == id, Notification.user_id == user_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


# Create notification
def create(db: Session, notification_data: NotificationCreate, user_id: int):

    # Check whether the user exists
    from back_end_student_task_manager.model.user import User

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check whether the task exists (if task_id is provided)
    if notification_data.task_id is not None:
        from back_end_student_task_manager.model.task import Task

        task = db.query(Task).filter(
            Task.id == notification_data.task_id, Task.user_id == user_id
        ).first()

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

    db_notification = Notification(
        user_id=user_id,
        task_id=notification_data.task_id,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.type
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification


# Update notification
def update(
    db: Session,
    id: int,
    notification_data: NotificationUpdate,
    user_id: int,
):
    db_notification = show(db, id, user_id)

    update_data = notification_data.model_dump(exclude_unset=True)
    update_data.pop("user_id", None)
    if "type" in update_data:
        update_data["notification_type"] = update_data.pop("type")
    if update_data.get("task_id") is not None:
        from back_end_student_task_manager.model.task import Task
        task = db.query(Task).filter(
            Task.id == update_data["task_id"], Task.user_id == user_id
        ).first()
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

    for key, value in update_data.items():
        setattr(db_notification, key, value)

    # Automatically set read_at when marking as read
    if update_data.get("is_read") is True:
        from datetime import datetime, timezone
        db_notification.read_at = datetime.now(timezone.utc)

    elif update_data.get("is_read") is False:
        db_notification.read_at = None

    db.commit()
    db.refresh(db_notification)

    return db_notification


# Delete notification
def delete(db: Session, id: int, user_id: int):
    db_notification = show(db, id, user_id)

    db.delete(db_notification)
    db.commit()

    return True
