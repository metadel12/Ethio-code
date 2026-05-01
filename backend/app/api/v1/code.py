from fastapi import APIRouter

from app.schemas.code import CodeRunRequest

router = APIRouter()


@router.post("/run")
def run_code(payload: CodeRunRequest):
    return {"language": payload.language, "output": ""}
