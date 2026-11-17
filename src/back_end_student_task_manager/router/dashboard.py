from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from back_end_student_task_manager.database.connection import get_db
from back_end_student_task_manager.controller import dashboard_controller
from back_end_student_task_manager.core.dependencies import get_current_user
from back_end_student_task_manager.model.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("", include_in_schema=False)
@router.get("/", response_model=dict)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return dashboard_controller.get_dashboard(db, current_user.id)
