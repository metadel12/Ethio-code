from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def analytics_summary():
    return {"users": 0, "interviews": 0}
