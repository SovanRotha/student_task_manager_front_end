from sqlalchemy.orm import Session

from back_end_student_task_manager.model.activity import ActivityLog
from back_end_student_task_manager.schema.activity import ActivityLogCreate


def get_recent_activity_logs(db: Session, limit: int = 5):
    return (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )

def get_all_activity_logs(db: Session):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()


def get_activity_log_by_id(db: Session, activity_id: int):
    return db.query(ActivityLog).filter(ActivityLog.id == activity_id).first()


def get_activity_logs_by_user(db: Session, user_id: int):
    return (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .all()
    )


def create_activity_log(db: Session, activity_data: ActivityLogCreate):
    activity = ActivityLog(
        user_id=activity_data.user_id,
        task_id=activity_data.task_id,
        action=activity_data.action,
        description=activity_data.description,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def delete_activity_log(db: Session, activity: ActivityLog):
    db.delete(activity)
    db.commit()


def log_activity(
    db: Session,
    user_id: int,
    action: str,
    description: str,
    task_id: int | None = None
):
    activity = ActivityLog(
        user_id=user_id,
        task_id=task_id,
        action=action,
        description=description
    )

    db.add(activity)

    return activity
