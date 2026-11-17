
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from back_end_student_task_manager.service import (
    activity_service,
    task_service,
    category_service,
)


def get_dashboard(db: Session, user_id: int):

    # 1. Count statistics
    total_tasks = task_service.count_tasks(db, user_id)
    total_categories = category_service.count_categories(db, user_id)

    # 2. Count tasks by status
    total_task_in_progress = task_service.count_tasks_in_progress(db, user_id)
    total_task_completed = task_service.count_tasks_completed(db, user_id)
    total_task_pending = task_service.count_tasks_pending(db, user_id)
    total_task_overdue = task_service.count_tasks_overdue(db, user_id)

    # 3. Get task information
    upcoming_tasks = task_service.up_coming_tasks(db, user_id)
    today_tasks = task_service.today_task(db, user_id)
    upcoming_deadline_tasks = task_service.up_coming_deadline_tasks(db, user_id)

    # 4. Get recent activities
    recent_activities = activity_service.get_recent_activity_logs(db, user_id)

    # 5. Return dashboard data
    dashboard_data = {
        "statistics": {
            "total_tasks": total_tasks,
            "total_categories": total_categories,
        },

        "task_status": {
            "in_progress": total_task_in_progress,
            "completed": total_task_completed,
            "pending": total_task_pending,
            "overdue": total_task_overdue,
        },

        "upcoming_tasks": upcoming_tasks,
        "today_tasks": today_tasks,
        "upcoming_deadline_tasks": upcoming_deadline_tasks,
        "recent_activities": recent_activities,
    }

    return jsonable_encoder(dashboard_data)
