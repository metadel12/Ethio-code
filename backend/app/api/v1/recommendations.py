from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional

from app.core.auth import get_current_user
from app.services.recommendation_engine import (
    recommend_courses,
    recommend_challenges,
    recommend_jobs,
    recommend_templates,
    recommend_mentors,
    record_recommendation_feedback,
)

router = APIRouter(prefix="/ai/recommendations", tags=["AI Recommendations"])


class RecommendRequest(BaseModel):
    limit: int = 10
    context: Optional[dict] = None


class FeedbackRequest(BaseModel):
    item_id: str
    clicked: bool


# ── POST /api/ai/recommendations/courses ──────────────────────
@router.post("/courses")
async def get_course_recommendations(
    body: RecommendRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    results = await recommend_courses(user_id, limit=body.limit)
    return {
        "type": "courses",
        "algorithm": "hybrid:collaborative+content+bandit",
        "count": len(results),
        "results": results
    }


# ── POST /api/ai/recommendations/challenges ───────────────────
@router.post("/challenges")
async def get_challenge_recommendations(
    body: RecommendRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    results = await recommend_challenges(user_id, limit=body.limit)
    return {
        "type": "challenges",
        "algorithm": "hybrid:collaborative+content+bandit",
        "count": len(results),
        "results": results
    }


# ── POST /api/ai/recommendations/jobs ─────────────────────────
@router.post("/jobs")
async def get_job_recommendations(
    body: RecommendRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    results = await recommend_jobs(user_id, limit=body.limit)
    return {
        "type": "jobs",
        "algorithm": "hybrid:skills-match+collaborative+bandit",
        "count": len(results),
        "results": results
    }


# ── POST /api/ai/recommendations/templates ────────────────────
@router.post("/templates")
async def get_template_recommendations(
    body: RecommendRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    results = await recommend_templates(user_id, limit=body.limit)
    return {
        "type": "templates",
        "algorithm": "hybrid:collaborative+content+bandit",
        "count": len(results),
        "results": results
    }


# ── POST /api/ai/recommendations/mentors ──────────────────────
@router.post("/mentors")
async def get_mentor_recommendations(
    body: RecommendRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    results = await recommend_mentors(user_id, limit=body.limit)
    return {
        "type": "mentors",
        "algorithm": "skills-overlap+rating-score",
        "count": len(results),
        "results": results
    }


# ── POST /api/ai/recommendations/feedback ─────────────────────
@router.post("/feedback")
async def submit_feedback(
    body: FeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    await record_recommendation_feedback(body.item_id, body.clicked)
    return {"status": "ok"}
