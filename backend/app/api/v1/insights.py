from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.services.insights_engine import (
    get_daily_insights,
    get_skill_gaps,
    get_learning_path,
    get_time_optimization,
    get_peer_comparison,
)

router = APIRouter(prefix="/ai/insights", tags=["Intelligent Insights"])


def _uid(current_user: dict) -> str:
    return str(current_user.get("user_id", current_user.get("sub", "")))


@router.get("/daily")
async def daily_insights(current_user: dict = Depends(get_current_user)):
    return await get_daily_insights(_uid(current_user))


@router.get("/skill-gaps")
async def skill_gaps(current_user: dict = Depends(get_current_user)):
    return await get_skill_gaps(_uid(current_user))


@router.get("/learning-path")
async def learning_path(current_user: dict = Depends(get_current_user)):
    return await get_learning_path(_uid(current_user))


@router.get("/time-optimization")
async def time_optimization(current_user: dict = Depends(get_current_user)):
    return await get_time_optimization(_uid(current_user))


@router.get("/peer-comparison")
async def peer_comparison(current_user: dict = Depends(get_current_user)):
    return await get_peer_comparison(_uid(current_user))
