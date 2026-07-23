from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.models.schemas import UserCreate, UserLogin, TokenResponse

router = APIRouter()

# In-memory store for demo — replace with PostgreSQL
_users: dict[str, dict] = {}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
    if data.email in _users:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "id": str(len(_users) + 1),
        "email": data.email,
        "full_name": data.full_name,
        "password": hash_password(data.password),
        "role": "user",
        "is_active": True,
    }
    _users[data.email] = user

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "is_active": user["is_active"],
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = _users.get(data.email)
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "is_active": user["is_active"],
        },
    )
