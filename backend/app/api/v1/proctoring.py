from fastapi import APIRouter

router = APIRouter()


@router.get("/flags")
def list_flags():
    return []
