import os
import shutil
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel, EmailStr, Field

from app.core.auth import get_current_user
from app.database_mongo import users_collection

router = APIRouter()

UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


# ── Schemas ───────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
    title: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    github_url: Optional[str] = Field(None, max_length=200)
    linkedin_url: Optional[str] = Field(None, max_length=200)
    portfolio_url: Optional[str] = Field(None, max_length=200)
    website_url: Optional[str] = Field(None, max_length=200)
    skills: Optional[list[str]] = None
    learning_goals: Optional[list[str]] = None
    role: Optional[str] = None

class NotificationSettings(BaseModel):
    email: bool = True
    push: bool = True
    sms: bool = False
    newsletter: bool = True
    job_alerts: bool = True
    achievement_alerts: bool = True

class UserSettings(BaseModel):
    theme: Optional[str] = Field(None, pattern="^(light|dark|system)$")
    language: Optional[str] = Field(None, max_length=10)
    currency: Optional[str] = Field(None, max_length=5)
    timezone: Optional[str] = Field(None, max_length=50)
    weekly_goal_hours: Optional[int] = Field(None, ge=1, le=168)
    notifications: Optional[NotificationSettings] = None
    default_view: Optional[str] = None
    dashboard_role: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────

def _serialize(user: dict) -> dict:
    return {
        "id": str(user.get("id") or user.get("_id")),
        "full_name": user.get("full_name") or user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "bio": user.get("bio"),
        "avatar": user.get("avatar"),
        "location": user.get("location"),
        "role": user.get("role", "job_seeker"),
        "title": user.get("title"),
        "company": user.get("company"),
        "experience_years": user.get("experience_years"),
        "github_url": user.get("github_url"),
        "linkedin_url": user.get("linkedin_url"),
        "portfolio_url": user.get("portfolio_url"),
        "website_url": user.get("website_url"),
        "skills": user.get("skills", []),
        "learning_goals": user.get("learning_goals", []),
        "is_verified": user.get("is_verified", False),
        "phone_verified": user.get("phone_verified", False),
        "two_factor_enabled": user.get("two_factor_enabled", False),
        "preferences": user.get("preferences", {}),
        "created_at": user.get("created_at").isoformat() if hasattr(user.get("created_at"), "isoformat") else None,
        "updated_at": user.get("updated_at").isoformat() if hasattr(user.get("updated_at"), "isoformat") else None,
    }

async def _get_db_user(current_user: dict) -> dict:
    user = await users_collection.find_one({
        "$or": [
            {"email": current_user.get("sub")},
            {"id": current_user.get("user_id")},
        ]
    })
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── GET /me ───────────────────────────────────────────────────
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await _get_db_user(current_user)
    return _serialize(user)


# ── PUT /me ───────────────────────────────────────────────────
@router.put("/me")
async def update_me(
    payload: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    user = await _get_db_user(current_user)
    updates = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")

    updates["updated_at"] = datetime.now(timezone.utc)
    await users_collection.update_one({"_id": user["_id"]}, {"$set": updates})
    updated = await users_collection.find_one({"_id": user["_id"]})
    return _serialize(updated)


# ── POST /me/avatar ───────────────────────────────────────────
@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, GIF allowed")

    contents = await file.read()
    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    user = await _get_db_user(current_user)
    uid = str(user.get("id") or user.get("_id"))
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uid}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    avatar_url = f"/uploads/avatars/{filename}"
    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"avatar": avatar_url, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"avatar_url": avatar_url, "message": "Avatar updated"}


# ── GET /me/settings ──────────────────────────────────────────
@router.get("/me/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    user = await _get_db_user(current_user)
    prefs = user.get("preferences", {})
    return {
        "theme": prefs.get("theme", "system"),
        "language": prefs.get("language", "en"),
        "currency": prefs.get("currency", "ETB"),
        "timezone": prefs.get("timezone", "Africa/Addis_Ababa"),
        "weekly_goal_hours": user.get("learning", {}).get("weekly_goal_hours", 10),
        "notifications": prefs.get("notifications", {
            "email": True, "push": True, "sms": False,
            "newsletter": True, "job_alerts": True, "achievement_alerts": True,
        }),
        "default_view": prefs.get("default_view", "dashboard"),
        "dashboard_role": prefs.get("dashboard_role", user.get("role", "developer")),
        "two_factor_enabled": user.get("two_factor_enabled", False),
        "phone_verified": user.get("phone_verified", False),
    }


# ── PUT /me/settings ──────────────────────────────────────────
@router.put("/me/settings")
async def update_settings(
    payload: UserSettings,
    current_user: dict = Depends(get_current_user),
):
    user = await _get_db_user(current_user)
    updates: dict = {}

    prefs = user.get("preferences", {})
    if payload.theme:           prefs["theme"] = payload.theme
    if payload.language:        prefs["language"] = payload.language
    if payload.currency:        prefs["currency"] = payload.currency
    if payload.timezone:        prefs["timezone"] = payload.timezone
    if payload.default_view:    prefs["default_view"] = payload.default_view
    if payload.dashboard_role:  prefs["dashboard_role"] = payload.dashboard_role
    if payload.notifications:
        prefs["notifications"] = payload.notifications.model_dump()

    updates["preferences"] = prefs

    if payload.weekly_goal_hours is not None:
        updates["learning.weekly_goal_hours"] = payload.weekly_goal_hours

    updates["updated_at"] = datetime.now(timezone.utc)
    await users_collection.update_one({"_id": user["_id"]}, {"$set": updates})
    return {"message": "Settings updated", "settings": prefs}
