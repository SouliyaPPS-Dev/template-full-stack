from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models.schemas import UserCreate, UserLogin, TokenResponse

router = APIRouter()
security = HTTPBearer()

_users: dict[str, dict] = {}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    for user in _users.values():
        if user["id"] == user_id:
            if not user.get("is_active", True):
                raise HTTPException(status_code=403, detail="Account is disabled")
            return user
    raise HTTPException(status_code=401, detail="User not found")


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
    if len(data.password) < 8 or len(data.password) > 128:
        raise HTTPException(status_code=400, detail="Password must be 8-128 characters")
    if data.email in _users:
        raise HTTPException(status_code=400, detail="Email already registered")

    import uuid
    user = {
        "id": str(uuid.uuid4()),
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
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

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
