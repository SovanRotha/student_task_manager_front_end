from fastapi import HTTPException
from sqlalchemy.orm import Session

from back_end_student_task_manager.model.user import User
from back_end_student_task_manager.model.task import Task
from back_end_student_task_manager.schema.activity import ActivityLogCreate
from back_end_student_task_manager.service import activity_service


# Get all activity logs
def index(db: Session):
    return activity_service.get_all_activity_logs(db)


# Get activity log by ID
def show(db: Session, id: int):
    activity = activity_service.get_activity_log_by_id(db, id)

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity log not found"
        )

    return activity


# Get activity logs by user ID
def get_by_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return activity_service.get_activity_logs_by_user(db, user_id)


# Create activity log
def create(db: Session, activity_data: ActivityLogCreate):

    # Check whether the user exists
    user = db.query(User).filter(
        User.id == activity_data.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check whether the task exists
    if activity_data.task_id is not None:
        task = db.query(Task).filter(
            Task.id == activity_data.task_id
        ).first()

        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        # Make sure the task belongs to the same user
        if task.user_id != activity_data.user_id:
            raise HTTPException(
                status_code=400,
                detail="Task does not belong to this user"
            )

    return activity_service.create_activity_log(db, activity_data)


# Delete activity log
def delete(db: Session, id: int):
    activity = show(db, id)

    activity_service.delete_activity_log(db, activity)

    return True