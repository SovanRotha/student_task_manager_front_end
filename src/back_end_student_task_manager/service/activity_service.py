from sqlalchemy.orm import Session

from back_end_student_task_manager.model.activity import ActivityLog


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