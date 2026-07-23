from fastapi import APIRouter, Depends, HTTPException

from app.api.auth import _users, get_current_user, require_admin

router = APIRouter()


@router.get("/")
async def list_users(current_user: dict = Depends(require_admin)):
    return {
        "data": [
            {
                "id": u["id"],
                "email": u["email"],
                "full_name": u["full_name"],
                "role": u["role"],
                "is_active": u["is_active"],
            }
            for u in _users.values()
        ],
        "total": len(_users),
    }


@router.get("/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ("admin", "superadmin") and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    for user in _users.values():
        if user["id"] == user_id:
            return {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "is_active": user["is_active"],
            }
    raise HTTPException(status_code=404, detail="User not found")
