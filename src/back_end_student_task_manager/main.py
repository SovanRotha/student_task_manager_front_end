from fastapi import Depends, FastAPI
from back_end_student_task_manager.core.dependencies import get_current_user

from back_end_student_task_manager.router import (
    dashboard,
    task,
    user,
    category,
    notification,
    activity,
    auth
)

app = FastAPI(
    title="Student Task Manager API",
    description="API for managing student tasks",
    version="1.0.0",
    redirect_slashes=False,
)

app.include_router(
    dashboard.router, prefix="/api", dependencies=[Depends(get_current_user)]
)
app.include_router(
    user.router, prefix="/api", dependencies=[Depends(get_current_user)]
)
app.include_router(
    category.router, prefix="/api", dependencies=[Depends(get_current_user)]
)
app.include_router(
    task.router, prefix="/api", dependencies=[Depends(get_current_user)]
)
app.include_router(
    notification.router, prefix="/api", dependencies=[Depends(get_current_user)]
)
app.include_router(
    activity.router, prefix="/api", dependencies=[Depends(get_current_user)]
)
app.include_router(auth.router, prefix="/api")
app.include_router(auth.registration_router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "Welcome to Student Task Manager API"
    }
