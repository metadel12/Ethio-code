import httpx
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.database_mongo import (
    users_collection,
    jobs_collection,
    applications_collection,
    saved_jobs_collection,
)

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class Activity(BaseModel):
    action: str
    metadata: dict = {}
    created_at: str


class DashboardStats(BaseModel):
    total_xp: int
    current_streak: int
    courses_enrolled: int
    challenges_solved: int
    projects_completed: int
    global_rank: int


class LearningProgress(BaseModel):
    courses: List[dict]
    weekly_activity: List[dict]
    xp_history: List[dict]
    skills: List[dict]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _str_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


async def _get_user_stats(user_id: str) -> dict:
    """Calculate user statistics."""
    user = await users_collection.find_one({"id": int(user_id)})
    if not user:
        return {
            "total_xp": 0,
            "current_streak": 0,
            "courses_enrolled": 0,
            "challenges_solved": 0,
            "projects_completed": 0,
            "global_rank": 0,
        }

    learning_stats = user.get("learning_stats", {})
    
    # Calculate global rank (simplified - count users with higher XP)
    xp = learning_stats.get("xp_points", 0)
    higher_count = await users_collection.count_documents({"learning_stats.xp_points": {"$gt": xp}})
    
    return {
        "total_xp": learning_stats.get("xp_points", 0),
        "current_streak": learning_stats.get("streak_days", 0),
        "courses_enrolled": learning_stats.get("courses_enrolled", 0),
        "challenges_solved": learning_stats.get("challenges_solved", 0),
        "projects_completed": learning_stats.get("projects_completed", 0),
        "global_rank": higher_count + 1,
    }


async def _get_recent_activities(user_id: str, limit: int = 20) -> List[dict]:
    """Get user's recent activities."""
    # Mock activities for now - in production, query user_activities collection
    now = datetime.now(timezone.utc)
    activities = [
        {"action": "Completed React Basics module", "metadata": {"type": "learning"}, "created_at": (now - timedelta(hours=2)).isoformat()},
        {"action": "Solved 'Two Sum' challenge (85/100)", "metadata": {"type": "challenge", "score": 85}, "created_at": (now - timedelta(hours=5)).isoformat()},
        {"action": "Earned '7 Day Streak' badge", "metadata": {"type": "achievement", "badge": "7-day-streak"}, "created_at": (now - timedelta(days=1)).isoformat()},
        {"action": "Submitted project 'E-commerce Site'", "metadata": {"type": "project"}, "created_at": (now - timedelta(days=2)).isoformat()},
        {"action": "Applied for 'Senior Dev' at Chapa", "metadata": {"type": "job"}, "created_at": (now - timedelta(days=3)).isoformat()},
    ]
    return activities[:limit]


async def _get_learning_progress(user_id: str) -> dict:
    """Get user's learning progress data."""
    # Mock data - in production, query enrollments, activities, etc.
    return {
        "courses": [
            {"id": "1", "title": "React Fundamentals", "progress": 65, "last_accessed": datetime.now(timezone.utc).isoformat()},
            {"id": "2", "title": "Node.js Backend", "progress": 42, "last_accessed": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()},
            {"id": "3", "title": "MongoDB Mastery", "progress": 88, "last_accessed": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()},
        ],
        "weekly_activity": [
            {"date": "2024-01-15", "count": 5},
            {"date": "2024-01-16", "count": 8},
            {"date": "2024-01-17", "count": 3},
            {"date": "2024-01-18", "count": 12},
            {"date": "2024-01-19", "count": 7},
            {"date": "2024-01-20", "count": 10},
            {"date": "2024-01-21", "count": 6},
        ],
        "xp_history": [
            {"date": "2024-01-15", "xp": 50},
            {"date": "2024-01-16", "xp": 120},
            {"date": "2024-01-17", "xp": 80},
            {"date": "2024-01-18", "xp": 200},
            {"date": "2024-01-19", "xp": 150},
            {"date": "2024-01-20", "xp": 180},
            {"date": "2024-01-21", "xp": 100},
        ],
        "skills": [
            {"name": "JavaScript", "level": 85},
            {"name": "React", "level": 75},
            {"name": "Node.js", "level": 60},
            {"name": "MongoDB", "level": 70},
            {"name": "Python", "level": 55},
            {"name": "Docker", "level": 45},
        ],
    }


async def _get_user_projects(user_id: str) -> List[dict]:
    """Get user's active projects."""
    # Mock data - in production, query user_projects collection
    return [
        {
            "id": "1",
            "title": "E-commerce Platform",
            "description": "Full-stack MERN e-commerce site",
            "progress": 65,
            "tasks_completed": 13,
            "total_tasks": 20,
            "deadline": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "status": "in_progress",
        },
        {
            "id": "2",
            "title": "Portfolio Website",
            "description": "Personal portfolio with blog",
            "progress": 100,
            "tasks_completed": 10,
            "total_tasks": 10,
            "deadline": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "status": "completed",
        },
        {
            "id": "3",
            "title": "Mobile Banking App",
            "description": "React Native banking app",
            "progress": 42,
            "tasks_completed": 8,
            "total_tasks": 19,
            "deadline": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat(),
            "status": "in_progress",
        },
    ]


async def _get_achievements(user_id: str) -> List[dict]:
    """Get user's earned badges."""
    # Mock data - in production, query user_achievements collection
    return [
        {"id": "1", "name": "First Blood", "description": "Solved first challenge", "icon": "🏅", "earned_at": "2024-01-10", "locked": False},
        {"id": "2", "name": "7 Day Streak", "description": "Logged in for 7 consecutive days", "icon": "🔥", "earned_at": "2024-01-18", "locked": False},
        {"id": "3", "name": "100 XP", "description": "Reached 100 XP", "icon": "💎", "earned_at": "2024-01-15", "locked": False},
        {"id": "4", "name": "Top 10%", "description": "Ranked in top 10% of learners", "icon": "👑", "earned_at": None, "locked": True, "progress": 65},
        {"id": "5", "name": "Project Master", "description": "Completed 3 projects", "icon": "🚀", "earned_at": None, "locked": True, "progress": 33},
        {"id": "6", "name": "Community Helper", "description": "Helped 5 users", "icon": "⭐", "earned_at": None, "locked": True, "progress": 20},
    ]


async def _get_saved_items(user_id: str, item_type: Optional[str] = None) -> List[dict]:
    """Get user's saved/bookmarked items."""
    # For now, return saved jobs
    query = {"user_id": user_id}
    saved = await saved_jobs_collection.find(query).sort("saved_at", -1).limit(20).to_list(length=20)
    
    result = []
    for item in saved:
        job_id = item.get("job_id")
        if job_id and ObjectId.is_valid(job_id):
            job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
            if job:
                result.append({
                    "id": str(job["_id"]),
                    "type": "job",
                    "title": job.get("title", ""),
                    "description": job.get("description", "")[:100],
                    "saved_at": item.get("saved_at").isoformat() if isinstance(item.get("saved_at"), datetime) else "",
                    "thumbnail": job.get("company_logo", ""),
                })
    
    return result


async def _get_job_applications_summary(user_id: str) -> dict:
    """Get job applications summary."""
    cursor = applications_collection.find({"user_id": user_id})
    apps = await cursor.to_list(length=100)
    
    status_counts = {}
    for app in apps:
        status = app.get("status", "submitted")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    recent = []
    for app in sorted(apps, key=lambda x: x.get("applied_at", datetime.min), reverse=True)[:5]:
        job_id = app.get("job_id")
        job = await jobs_collection.find_one({"_id": ObjectId(job_id)}) if job_id and ObjectId.is_valid(job_id) else None
        recent.append({
            "id": str(app["_id"]),
            "job_title": job.get("title", "Job") if job else "Job",
            "company": job.get("company_name", "Company") if job else "Company",
            "status": app.get("status", "submitted"),
            "applied_at": app.get("applied_at").isoformat() if isinstance(app.get("applied_at"), datetime) else "",
        })
    
    return {
        "total": len(apps),
        "status_breakdown": status_counts,
        "recent_applications": recent,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get user's dashboard statistics."""
    user_id = str(current_user.get("user_id"))
    stats = await _get_user_stats(user_id)
    return stats


@router.get("/activities")
async def get_activities(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    activity_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get user's recent activities."""
    user_id = str(current_user.get("user_id"))
    activities = await _get_recent_activities(user_id, limit)
    return {"activities": activities, "total": len(activities)}


@router.get("/learning/progress")
async def get_learning_progress(current_user: dict = Depends(get_current_user)):
    """Get user's learning progress data."""
    user_id = str(current_user.get("user_id"))
    progress = await _get_learning_progress(user_id)
    return progress


@router.get("/projects")
async def get_projects(current_user: dict = Depends(get_current_user)):
    """Get user's active projects."""
    user_id = str(current_user.get("user_id"))
    projects = await _get_user_projects(user_id)
    return {"projects": projects}


@router.get("/achievements")
async def get_achievements(current_user: dict = Depends(get_current_user)):
    """Get user's badges and achievements."""
    user_id = str(current_user.get("user_id"))
    achievements = await _get_achievements(user_id)
    return {"achievements": achievements}


@router.get("/saved-items")
async def get_saved_items(
    item_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get user's saved/bookmarked items."""
    user_id = str(current_user.get("user_id"))
    items = await _get_saved_items(user_id, item_type)
    return {"items": items}


@router.get("/job-applications")
async def get_job_applications_summary(current_user: dict = Depends(get_current_user)):
    """Get job applications summary."""
    user_id = str(current_user.get("user_id"))
    summary = await _get_job_applications_summary(user_id)
    return summary


@router.get("/analytics")
async def get_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: dict = Depends(get_current_user),
):
    """Get user's performance analytics."""
    user_id = str(current_user.get("user_id"))
    
    # Mock analytics data
    return {
        "xp_trend": [
            {"date": "2024-01-15", "value": 50},
            {"date": "2024-01-16", "value": 120},
            {"date": "2024-01-17", "value": 80},
            {"date": "2024-01-18", "value": 200},
            {"date": "2024-01-19", "value": 150},
            {"date": "2024-01-20", "value": 180},
            {"date": "2024-01-21", "value": 100},
        ],
        "challenges_by_difficulty": {
            "easy": 15,
            "medium": 8,
            "hard": 3,
        },
        "time_by_category": {
            "Frontend": 35,
            "Backend": 28,
            "Database": 15,
            "DevOps": 12,
            "Other": 10,
        },
    }


@router.get("/recommendations")
async def get_recommendations(current_user: dict = Depends(get_current_user)):
    """Get AI-powered recommendations."""
    # Mock recommendations
    return {
        "next_actions": [
            {"type": "profile", "title": "Complete your profile", "description": "Add your skills and experience", "priority": "high"},
            {"type": "challenge", "title": "Try Binary Search challenge", "description": "Based on your skill gaps", "priority": "medium"},
            {"type": "course", "title": "Enroll in Docker Fundamentals", "description": "Recommended for your career path", "priority": "low"},
        ]
    }


@router.get("/deadlines")
async def get_deadlines(current_user: dict = Depends(get_current_user)):
    """Get upcoming deadlines."""
    user_id = str(current_user.get("user_id"))
    
    # Mock deadlines
    now = datetime.now(timezone.utc)
    return {
        "deadlines": [
            {"type": "project", "title": "E-commerce Platform", "due_date": (now + timedelta(days=7)).isoformat(), "priority": "high"},
            {"type": "assignment", "title": "React Quiz", "due_date": (now + timedelta(days=3)).isoformat(), "priority": "medium"},
            {"type": "application", "title": "Chapa Job Application", "due_date": (now + timedelta(days=14)).isoformat(), "priority": "low"},
        ]
    }


# ── In-memory widget store (per-user, resets on restart) ──────────────────────
_widget_orders: dict = {}
_user_preferences: dict = {}
_notifications_store: dict = {}
_calendar_events: dict = {}

DEFAULT_WIDGETS = [
    {"id": "stats", "title": "Stats Overview", "order": 0, "visible": True},
    {"id": "progress", "title": "Learning Progress", "order": 1, "visible": True},
    {"id": "activities", "title": "Recent Activities", "order": 2, "visible": True},
    {"id": "projects", "title": "Projects", "order": 3, "visible": True},
    {"id": "jobs", "title": "Job Applications", "order": 4, "visible": True},
    {"id": "achievements", "title": "Achievements", "order": 5, "visible": True},
]

MOTIVATIONAL_QUOTES = [
    {"quote": "Code is like humor. When you have to explain it, it's bad.", "author": "Cory House"},
    {"quote": "First, solve the problem. Then, write the code.", "author": "John Johnson"},
    {"quote": "Experience is the name everyone gives to their mistakes.", "author": "Oscar Wilde"},
    {"quote": "In order to be irreplaceable, one must always be different.", "author": "Coco Chanel"},
    {"quote": "Java is to JavaScript what car is to Carpet.", "author": "Chris Heilmann"},
    {"quote": "Knowledge is power.", "author": "Francis Bacon"},
    {"quote": "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", "author": "Dan Salomon"},
]


def _default_notifications(user_id: str) -> list:
    now = datetime.now(timezone.utc)
    return [
        {"id": "n1", "user_id": user_id, "title": "New challenge available", "body": "Try the new Binary Tree challenge!", "read": False, "created_at": (now - timedelta(hours=1)).isoformat()},
        {"id": "n2", "user_id": user_id, "title": "Streak reminder", "body": "Keep your streak alive — log in daily!", "read": False, "created_at": (now - timedelta(hours=3)).isoformat()},
        {"id": "n3", "user_id": user_id, "title": "Job match found", "body": "A new job matches your profile.", "read": True, "created_at": (now - timedelta(days=1)).isoformat()},
    ]


# ── Widgets ───────────────────────────────────────────────────────────────────

@router.get("/widgets")
async def get_widgets(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    widgets = _widget_orders.get(user_id, DEFAULT_WIDGETS)
    return {"widgets": widgets}


@router.get("/widgets/{widget_id}/data")
async def get_widget_data(widget_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    handlers = {
        "stats": lambda: _get_user_stats(user_id),
        "progress": lambda: _get_learning_progress(user_id),
        "activities": lambda: _get_recent_activities(user_id),
        "projects": lambda: _get_user_projects(user_id),
        "achievements": lambda: _get_achievements(user_id),
        "jobs": lambda: _get_job_applications_summary(user_id),
    }
    if widget_id not in handlers:
        raise HTTPException(status_code=404, detail="Widget not found")
    data = await handlers[widget_id]()
    return {"widget_id": widget_id, "data": data}


class WidgetOrder(BaseModel):
    order: List[str]


@router.post("/widgets/reorder")
async def reorder_widgets(body: WidgetOrder, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    widgets = _widget_orders.get(user_id, [w.copy() for w in DEFAULT_WIDGETS])
    id_to_widget = {w["id"]: w for w in widgets}
    reordered = []
    for i, wid in enumerate(body.order):
        if wid in id_to_widget:
            id_to_widget[wid]["order"] = i
            reordered.append(id_to_widget[wid])
    _widget_orders[user_id] = reordered
    return {"widgets": reordered}


# ── Preferences ───────────────────────────────────────────────────────────────

class Preferences(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    timezone: Optional[str] = None


@router.post("/preferences/save")
async def save_preferences(body: Preferences, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    existing = _user_preferences.get(user_id, {})
    existing.update({k: v for k, v in body.model_dump().items() if v is not None})
    _user_preferences[user_id] = existing
    return {"preferences": existing}


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user.get("user_id"))
    if user_id not in _notifications_store:
        _notifications_store[user_id] = _default_notifications(user_id)
    notes = _notifications_store[user_id]
    if unread_only:
        notes = [n for n in notes if not n["read"]]
    return {"notifications": notes, "unread_count": sum(1 for n in _notifications_store[user_id] if not n["read"])}


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    if user_id not in _notifications_store:
        _notifications_store[user_id] = _default_notifications(user_id)
    for n in _notifications_store[user_id]:
        if n["id"] == notification_id:
            n["read"] = True
            return {"success": True}
    raise HTTPException(status_code=404, detail="Notification not found")


@router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    if user_id not in _notifications_store:
        _notifications_store[user_id] = _default_notifications(user_id)
    for n in _notifications_store[user_id]:
        n["read"] = True
    return {"success": True}


# ── Calendar ──────────────────────────────────────────────────────────────────

class CalendarEvent(BaseModel):
    title: str
    start: str
    end: Optional[str] = None
    type: Optional[str] = "general"
    description: Optional[str] = ""


@router.get("/calendar")
async def get_calendar(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    events = _calendar_events.get(user_id, [])
    now = datetime.now(timezone.utc)
    upcoming = [e for e in events if e["start"] >= now.isoformat()][:5]
    return {"upcoming_events": upcoming, "total_events": len(events)}


@router.get("/calendar/events")
async def get_calendar_events(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    user_id = str(current_user.get("user_id"))
    events = _calendar_events.get(user_id, [])
    if month and year:
        prefix = f"{year}-{month:02d}"
        events = [e for e in events if e["start"].startswith(prefix)]
    return {"events": events}


@router.post("/calendar/event")
async def create_calendar_event(body: CalendarEvent, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    if user_id not in _calendar_events:
        _calendar_events[user_id] = []
    event = {"id": str(len(_calendar_events[user_id]) + 1), **body.model_dump()}
    _calendar_events[user_id].append(event)
    return {"event": event}


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports")
async def get_reports(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    now = datetime.now(timezone.utc)
    return {
        "reports": [
            {"id": "r1", "title": "Monthly Progress Report", "period": "2024-01", "generated_at": (now - timedelta(days=5)).isoformat(), "type": "progress"},
            {"id": "r2", "title": "Skills Assessment", "period": "2024-Q1", "generated_at": (now - timedelta(days=10)).isoformat(), "type": "skills"},
            {"id": "r3", "title": "Job Application Summary", "period": "2024-01", "generated_at": (now - timedelta(days=3)).isoformat(), "type": "jobs"},
        ]
    }


class ExportRequest(BaseModel):
    report_id: str
    format: str = "json"  # json | csv


@router.post("/reports/export")
async def export_report(body: ExportRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    return {
        "report_id": body.report_id,
        "format": body.format,
        "download_url": f"/api/v1/dashboard/reports/{body.report_id}/download?format={body.format}",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
    }


# ── Search ────────────────────────────────────────────────────────────────────

@router.get("/search")
async def dashboard_search(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
):
    q_lower = q.lower()
    results = []

    # Search jobs
    async for job in jobs_collection.find({"title": {"$regex": q, "$options": "i"}}).limit(5):
        results.append({"type": "job", "id": str(job["_id"]), "title": job.get("title", ""), "subtitle": job.get("company_name", "")})

    # Static quick matches
    static_items = [
        {"type": "page", "id": "challenges", "title": "Challenges", "subtitle": "Practice coding"},
        {"type": "page", "id": "courses", "title": "Courses", "subtitle": "Learn new skills"},
        {"type": "page", "id": "jobs", "title": "Jobs", "subtitle": "Find opportunities"},
        {"type": "page", "id": "community", "title": "Community", "subtitle": "Connect with peers"},
    ]
    results += [i for i in static_items if q_lower in i["title"].lower()]

    return {"query": q, "results": results[:10]}


# ── Quick Actions ─────────────────────────────────────────────────────────────

@router.get("/quick-actions")
async def get_quick_actions(current_user: dict = Depends(get_current_user)):
    return {
        "actions": [
            {"id": "new_challenge", "label": "Start Challenge", "icon": "code", "href": "/challenges"},
            {"id": "browse_jobs", "label": "Browse Jobs", "icon": "briefcase", "href": "/jobs"},
            {"id": "resume_course", "label": "Resume Course", "icon": "book", "href": "/courses"},
            {"id": "community", "label": "Community", "icon": "users", "href": "/community"},
            {"id": "mock_interview", "label": "Mock Interview", "icon": "mic", "href": "/interviews"},
            {"id": "upload_project", "label": "Upload Project", "icon": "upload", "href": "/projects/new"},
        ]
    }


# ── Weather ───────────────────────────────────────────────────────────────────

@router.get("/weather")
async def get_weather(
    lat: float = Query(9.03, description="Latitude"),
    lon: float = Query(38.74, description="Longitude (default: Addis Ababa)"),
):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={"latitude": lat, "longitude": lon, "current_weather": True, "timezone": "auto"},
            )
            resp.raise_for_status()
            data = resp.json()
            cw = data.get("current_weather", {})
            return {
                "temperature": cw.get("temperature"),
                "windspeed": cw.get("windspeed"),
                "weathercode": cw.get("weathercode"),
                "is_day": cw.get("is_day"),
                "location": {"lat": lat, "lon": lon},
            }
    except Exception:
        return {"temperature": None, "error": "Weather service unavailable"}


# ── Quote ─────────────────────────────────────────────────────────────────────

@router.get("/quote")
async def get_quote():
    from random import randint
    q = MOTIVATIONAL_QUOTES[randint(0, len(MOTIVATIONAL_QUOTES) - 1)]
    return q
