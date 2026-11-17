from fastapi import FastAPI

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

app.include_router(dashboard.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(category.router, prefix="/api")
app.include_router(task.router, prefix="/api")
app.include_router(notification.router, prefix="/api")
app.include_router(activity.router, prefix="/api")
app.include_router(auth.router, prefix="/api")


@app.get("/")
def home():
    return {
        "message": "Welcome to Student Task Manager API"
    }