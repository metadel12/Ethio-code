"""Feature flags, A/B testing, and report export endpoints."""
import csv
import io
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.auth import get_current_user

router = APIRouter()

# ── Feature Flags ─────────────────────────────────────────────────────────────

_FLAGS: dict = {
    "new_dashboard":       {"enabled": True,  "rollout": 100, "description": "New dashboard UI"},
    "ai_recommendations":  {"enabled": True,  "rollout": 100, "description": "AI-powered recommendations"},
    "gamification":        {"enabled": True,  "rollout": 100, "description": "XP, badges, leaderboards"},
    "creator_marketplace": {"enabled": True,  "rollout": 100, "description": "Template marketplace"},
    "enterprise_sso":      {"enabled": True,  "rollout": 100, "description": "SSO for enterprise"},
    "pwa_push":            {"enabled": True,  "rollout": 80,  "description": "Push notifications"},
    "new_editor":          {"enabled": False, "rollout": 0,   "description": "New code editor (beta)"},
    "beta_analytics":      {"enabled": True,  "rollout": 50,  "description": "Advanced analytics beta"},
}

_EXPERIMENTS: dict = {
    "cta_button_color": {"variants": ["green", "blue", "gold"], "weights": [50, 30, 20]},
    "onboarding_flow":  {"variants": ["wizard", "single_page"], "weights": [60, 40]},
}


class FlagUpdate(BaseModel):
    enabled: bool
    rollout: int = 100


@router.get("/feature-flags")
async def get_flags(current_user: dict = Depends(get_current_user)):
    return {"flags": _FLAGS}


@router.put("/feature-flags/{flag}")
async def update_flag(flag: str, body: FlagUpdate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    if flag not in _FLAGS:
        raise HTTPException(status_code=404, detail="Flag not found")
    _FLAGS[flag].update({"enabled": body.enabled, "rollout": body.rollout})
    return {"flag": flag, **_FLAGS[flag]}


@router.get("/experiments")
async def get_experiments(current_user: dict = Depends(get_current_user)):
    return {"experiments": _EXPERIMENTS}


@router.get("/experiments/{name}/variant")
async def get_variant(name: str, current_user: dict = Depends(get_current_user)):
    exp = _EXPERIMENTS.get(name)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    user_id = str(current_user.get("user_id", "anon"))
    h = 0
    for c in (user_id + name):
        h = (h * 31 + ord(c)) & 0xFFFFFFFF
    bucket = h % 100
    cumulative = 0
    for variant, weight in zip(exp["variants"], exp["weights"]):
        cumulative += weight
        if bucket < cumulative:
            return {"experiment": name, "variant": variant, "bucket": bucket}
    return {"experiment": name, "variant": exp["variants"][0], "bucket": bucket}


# ── Report Export (CSV / JSON) ────────────────────────────────────────────────

from app.database_mongo import (
    users_collection, jobs_collection,
    applications_collection, template_purchases_collection,
)


async def _get_report_data(report_type: str) -> list[dict]:
    if report_type == "users":
        docs = await users_collection.find({}, {"hashed_password": 0, "two_factor_secret": 0}).limit(5000).to_list(5000)
        return [{"id": str(d.get("id", "")), "email": d.get("email", ""), "role": d.get("role", ""), "created_at": str(d.get("created_at", ""))} for d in docs]
    if report_type == "jobs":
        docs = await jobs_collection.find({}).limit(5000).to_list(5000)
        return [{"id": str(d.get("_id", "")), "title": d.get("title", ""), "company": d.get("company_name", ""), "location": d.get("location", ""), "posted_date": str(d.get("posted_date", ""))} for d in docs]
    if report_type == "applications":
        docs = await applications_collection.find({}).limit(5000).to_list(5000)
        return [{"id": str(d.get("_id", "")), "user_id": d.get("user_id", ""), "job_id": d.get("job_id", ""), "status": d.get("status", ""), "applied_at": str(d.get("applied_at", ""))} for d in docs]
    if report_type == "revenue":
        docs = await template_purchases_collection.find({"status": "completed"}).limit(5000).to_list(5000)
        return [{"transaction_id": d.get("transaction_id", ""), "amount": d.get("amount", 0), "template_id": d.get("template_id", ""), "purchased_at": str(d.get("purchased_at", ""))} for d in docs]
    return []


@router.get("/reports/export")
async def export_report(
    type: str = Query(..., regex="^(users|jobs|applications|revenue)$"),
    format: str = Query("csv", regex="^(csv|json)$"),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    data = await _get_report_data(type)
    filename = f"{type}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"

    if format == "json":
        content = json.dumps(data, indent=2, default=str)
        return StreamingResponse(
            io.StringIO(content),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}.json"'},
        )

    # CSV
    if not data:
        return StreamingResponse(io.StringIO(""), media_type="text/csv")
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}.csv"'},
    )
