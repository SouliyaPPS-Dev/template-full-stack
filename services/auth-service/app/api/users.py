from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_users():
    return {"data": [], "total": 0}


@router.get("/{user_id}")
async def get_user(user_id: str):
    return {"error": "not found"}
