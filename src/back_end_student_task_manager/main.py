from fastapi import FastAPI

app = FastAPI(
    title="Student Task Manager API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Student Task Manager API"
    }