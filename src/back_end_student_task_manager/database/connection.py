from sqlalchemy import create_engine, URL
from sqlalchemy.orm import sessionmaker

from back_end_student_task_manager.core.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username = DB_USER,
    password = DB_PASSWORD,
    host = DB_HOST,
    port = DB_PORT,
    database = DB_NAME
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

