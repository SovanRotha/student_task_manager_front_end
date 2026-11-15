from datetime import datetime, timedelta, timezone

from jose import jwt
from pwdlib import PasswordHash

from back_end_student_task_manager.core.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

password_hash = PasswordHash.recommended()


# Hash password
def hash_password(password: str):
    return password_hash.hash(password)


# Verify password
def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)


# Create JWT access token
def create_access_token(user_id: int):

    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is not configured")

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token