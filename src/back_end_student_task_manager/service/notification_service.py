from sqlalchemy.orm import Session
from fastapi import HTTPException

from back_end_student_task_manager.model.notification import Notification
from back_end_student_task_manager.schema.notification import (
    NotificationCreate,
    NotificationUpdate
)


# Get all notifications
def index(db: Session):
    return db.query(Notification).all()


# Get notification by ID
def show(db: Session, id: int):
    notification = db.query(Notification).filter(
        Notification.id == id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


# Create notification
def create(db: Session, notification_data: NotificationCreate):
    db_notification = Notification(
        user_id=notification_data.user_id,
        task_id=notification_data.task_id,
        message=notification_data.message,
        title=notification_data.title,
        type=notification_data.type
    )

    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    return db_notification


# Update notification
def update(
    db: Session,
    id: int,
    notification_data: NotificationUpdate
):
    db_notification = show(db, id)

    update_data = notification_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_notification, key, value)

    db.commit()
    db.refresh(db_notification)

    return db_notification


# Delete notification
def delete(db: Session, id: int):
    db_notification = show(db, id)

    db.delete(db_notification)
    db.commit()

    return True