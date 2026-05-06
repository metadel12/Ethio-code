from fastapi import APIRouter, Depends, Query
from app.core.auth import get_current_user
from app.services.predictive_analytics import (
    predict_completion_date,
    predict_job_match_score,
    predict_salary_range,
    predict_dropout_risk,
    predict_earning_potential,
)

router = APIRouter(prefix="/ai/predict", tags=["Predictive Analytics"])


@router.get("/completion-date")
async def completion_date(
    course_id: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id", current_user.get("sub", "")))
    return await predict_completion_date(user_id, course_id)


@router.get("/job-match-score")
async def job_match_score(
    job_id: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id", current_user.get("sub", "")))
    return await predict_job_match_score(user_id, job_id)


@router.get("/salary-range")
async def salary_range(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id", current_user.get("sub", "")))
    return await predict_salary_range(user_id)


@router.get("/dropout-risk")
async def dropout_risk(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id", current_user.get("sub", "")))
    return await predict_dropout_risk(user_id)


@router.get("/earning-potential")
async def earning_potential(
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user.get("user_id", current_user.get("sub", "")))
    return await predict_earning_potential(user_id)
