from datetime import datetime, timezone, timedelta
from random import randint, sample
from typing import List, Optional
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.database_mongo import (
    users_collection,
    user_courses_collection,
    user_challenges_collection,
    user_projects_collection,
)

router = APIRouter()

# ── Static seed data ──────────────────────────────────────────────────────────

_COURSES = [
    {"id": "c1", "title": "React Fundamentals", "category": "Frontend", "difficulty": "Beginner", "duration_hours": 12, "modules": 8, "rating": 4.8, "enrolled": 1240, "thumbnail": "", "instructor": "Abebe Girma"},
    {"id": "c2", "title": "Node.js Backend", "category": "Backend", "difficulty": "Intermediate", "duration_hours": 16, "modules": 10, "rating": 4.7, "enrolled": 980, "thumbnail": "", "instructor": "Tigist Haile"},
    {"id": "c3", "title": "MongoDB Mastery", "category": "Database", "difficulty": "Intermediate", "duration_hours": 10, "modules": 7, "rating": 4.6, "enrolled": 760, "thumbnail": "", "instructor": "Dawit Bekele"},
    {"id": "c4", "title": "Python for Data Science", "category": "Data", "difficulty": "Beginner", "duration_hours": 20, "modules": 12, "rating": 4.9, "enrolled": 2100, "thumbnail": "", "instructor": "Sara Tesfaye"},
    {"id": "c5", "title": "Docker & Kubernetes", "category": "DevOps", "difficulty": "Advanced", "duration_hours": 18, "modules": 11, "rating": 4.7, "enrolled": 540, "thumbnail": "", "instructor": "Yonas Alemu"},
    {"id": "c6", "title": "TypeScript Deep Dive", "category": "Frontend", "difficulty": "Intermediate", "duration_hours": 14, "modules": 9, "rating": 4.8, "enrolled": 870, "thumbnail": "", "instructor": "Meron Tadesse"},
]

_CHALLENGES = [
    {"id": "ch1", "title": "Two Sum", "category": "Arrays", "difficulty": "Easy", "xp": 50, "tags": ["array", "hash-map"], "hints": ["Use a hash map for O(n) solution", "Store complement as key"], "description": "Given an array of integers, return indices of two numbers that add up to a target."},
    {"id": "ch2", "title": "Binary Search", "category": "Search", "difficulty": "Easy", "xp": 60, "tags": ["binary-search", "array"], "hints": ["Divide the search space in half each iteration"], "description": "Implement binary search on a sorted array."},
    {"id": "ch3", "title": "Merge Sort", "category": "Sorting", "difficulty": "Medium", "xp": 100, "tags": ["sorting", "divide-conquer"], "hints": ["Split array in half recursively", "Merge sorted halves"], "description": "Implement merge sort algorithm."},
    {"id": "ch4", "title": "LRU Cache", "category": "Design", "difficulty": "Hard", "xp": 200, "tags": ["design", "linked-list", "hash-map"], "hints": ["Use OrderedDict or doubly linked list + hash map"], "description": "Design a data structure that follows LRU cache constraints."},
    {"id": "ch5", "title": "Valid Parentheses", "category": "Stack", "difficulty": "Easy", "xp": 50, "tags": ["stack", "string"], "hints": ["Use a stack to track opening brackets"], "description": "Determine if a string of brackets is valid."},
]

_SKILLS = [
    {"name": "JavaScript", "category": "Languages", "level": 0, "max_level": 100},
    {"name": "Python", "category": "Languages", "level": 0, "max_level": 100},
    {"name": "React", "category": "Frontend", "level": 0, "max_level": 100},
    {"name": "Node.js", "category": "Backend", "level": 0, "max_level": 100},
    {"name": "MongoDB", "category": "Database", "level": 0, "max_level": 100},
    {"name": "Docker", "category": "DevOps", "level": 0, "max_level": 100},
    {"name": "SQL", "category": "Database", "level": 0, "max_level": 100},
    {"name": "TypeScript", "category": "Languages", "level": 0, "max_level": 100},
]

_BADGES = [
    {"id": "b1", "name": "First Blood", "description": "Solved your first challenge", "icon": "🏅", "xp_reward": 50},
    {"id": "b2", "name": "7 Day Streak", "description": "Logged in 7 days in a row", "icon": "🔥", "xp_reward": 100},
    {"id": "b3", "name": "Century", "description": "Earned 100 XP", "icon": "💯", "xp_reward": 50},
    {"id": "b4", "name": "Course Graduate", "description": "Completed a full course", "icon": "🎓", "xp_reward": 200},
    {"id": "b5", "name": "Project Master", "description": "Completed 3 projects", "icon": "🚀", "xp_reward": 300},
    {"id": "b6", "name": "Top 10%", "description": "Ranked in top 10% of learners", "icon": "👑", "xp_reward": 500},
    {"id": "b7", "name": "Community Helper", "description": "Helped 5 peers", "icon": "⭐", "xp_reward": 150},
    {"id": "b8", "name": "Speed Coder", "description": "Solved a challenge in under 5 minutes", "icon": "⚡", "xp_reward": 100},
]

_ROADMAPS = {
    "frontend": {
        "title": "Frontend Developer",
        "steps": [
            {"order": 1, "title": "HTML & CSS Basics", "status": "recommended", "course_id": None},
            {"order": 2, "title": "JavaScript Fundamentals", "status": "recommended", "course_id": None},
            {"order": 3, "title": "React Fundamentals", "status": "recommended", "course_id": "c1"},
            {"order": 4, "title": "TypeScript Deep Dive", "status": "recommended", "course_id": "c6"},
            {"order": 5, "title": "Build & Deploy Projects", "status": "recommended", "course_id": None},
        ],
    },
    "backend": {
        "title": "Backend Developer",
        "steps": [
            {"order": 1, "title": "Python or Node.js Basics", "status": "recommended", "course_id": None},
            {"order": 2, "title": "Node.js Backend", "status": "recommended", "course_id": "c2"},
            {"order": 3, "title": "MongoDB Mastery", "status": "recommended", "course_id": "c3"},
            {"order": 4, "title": "Docker & Kubernetes", "status": "recommended", "course_id": "c5"},
            {"order": 5, "title": "System Design", "status": "recommended", "course_id": None},
        ],
    },
    "data": {
        "title": "Data Scientist",
        "steps": [
            {"order": 1, "title": "Python for Data Science", "status": "recommended", "course_id": "c4"},
            {"order": 2, "title": "SQL & Databases", "status": "recommended", "course_id": None},
            {"order": 3, "title": "Machine Learning Basics", "status": "recommended", "course_id": None},
            {"order": 4, "title": "Deep Learning", "status": "recommended", "course_id": None},
        ],
    },
}


def _now():
    return datetime.now(timezone.utc)


def _sid(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


# ── Courses ───────────────────────────────────────────────────────────────────

@router.get("/courses")
async def list_courses(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    courses = _COURSES
    if category:
        courses = [c for c in courses if c["category"].lower() == category.lower()]
    if difficulty:
        courses = [c for c in courses if c["difficulty"].lower() == difficulty.lower()]
    if search:
        courses = [c for c in courses if search.lower() in c["title"].lower()]
    return {"courses": courses[skip: skip + limit], "total": len(courses)}


@router.get("/courses/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = next((c for c in _COURSES if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    user_id = str(current_user.get("user_id"))
    enrollment = await user_courses_collection.find_one({"user_id": user_id, "course_id": course_id})
    return {**course, "enrollment": _sid(enrollment) if enrollment else None}


@router.post("/courses/{course_id}/enroll", status_code=201)
async def enroll_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = next((c for c in _COURSES if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    user_id = str(current_user.get("user_id"))
    existing = await user_courses_collection.find_one({"user_id": user_id, "course_id": course_id})
    if existing:
        raise HTTPException(status_code=409, detail="Already enrolled")
    doc = {"user_id": user_id, "course_id": course_id, "progress": 0, "status": "in_progress", "enrolled_at": _now(), "last_accessed": _now()}
    await user_courses_collection.insert_one(doc)
    return {"message": "Enrolled successfully", "course_id": course_id}


class ProgressUpdate(BaseModel):
    progress: int  # 0-100
    last_module: Optional[str] = None


@router.put("/courses/{course_id}/progress")
async def update_progress(course_id: str, body: ProgressUpdate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    enrollment = await user_courses_collection.find_one({"user_id": user_id, "course_id": course_id})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")
    progress = max(0, min(100, body.progress))
    update = {"progress": progress, "last_accessed": _now(), "last_module": body.last_module}
    if progress == 100:
        update["status"] = "completed"
        update["completed_at"] = _now()
    await user_courses_collection.update_one({"_id": enrollment["_id"]}, {"$set": update})
    return {"progress": progress, "status": update.get("status", "in_progress")}


@router.get("/courses/{course_id}/certificate")
async def get_certificate(course_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    enrollment = await user_courses_collection.find_one({"user_id": user_id, "course_id": course_id})
    if not enrollment or enrollment.get("progress", 0) < 100:
        raise HTTPException(status_code=403, detail="Course not completed")
    course = next((c for c in _COURSES if c["id"] == course_id), {})
    user = await users_collection.find_one({"id": int(user_id)}) or {}
    return {
        "certificate_id": f"CERT-{user_id}-{course_id}",
        "course_title": course.get("title", ""),
        "recipient": user.get("full_name", ""),
        "issued_at": enrollment.get("completed_at", _now()).isoformat() if isinstance(enrollment.get("completed_at"), datetime) else _now().isoformat(),
        "download_url": f"/api/v1/learning/certificates/CERT-{user_id}-{course_id}.pdf",
    }


# ── Challenges ────────────────────────────────────────────────────────────────

@router.get("/challenges")
async def list_challenges(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
):
    challenges = _CHALLENGES
    if difficulty:
        challenges = [c for c in challenges if c["difficulty"].lower() == difficulty.lower()]
    if category:
        challenges = [c for c in challenges if c["category"].lower() == category.lower()]
    # strip hints from list view
    return {"challenges": [{k: v for k, v in c.items() if k != "hints"} for c in challenges[skip: skip + limit]], "total": len(challenges)}


@router.get("/challenges/{challenge_id}")
async def get_challenge(challenge_id: str, current_user: dict = Depends(get_current_user)):
    ch = next((c for c in _CHALLENGES if c["id"] == challenge_id), None)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")
    user_id = str(current_user.get("user_id"))
    submission = await user_challenges_collection.find_one({"user_id": user_id, "challenge_id": challenge_id})
    return {**{k: v for k, v in ch.items() if k != "hints"}, "submission": _sid(submission) if submission else None}


class ChallengeSubmit(BaseModel):
    code: str
    language: str = "python"


@router.post("/challenges/{challenge_id}/submit")
async def submit_challenge(challenge_id: str, body: ChallengeSubmit, current_user: dict = Depends(get_current_user)):
    ch = next((c for c in _CHALLENGES if c["id"] == challenge_id), None)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")
    user_id = str(current_user.get("user_id"))
    # Simulated test results
    passed = randint(3, 5)
    total = 5
    score = round((passed / total) * ch["xp"])
    doc = {
        "user_id": user_id, "challenge_id": challenge_id,
        "code": body.code, "language": body.language,
        "passed": passed, "total": total, "score": score,
        "status": "accepted" if passed == total else "partial",
        "submitted_at": _now(),
    }
    await user_challenges_collection.update_one(
        {"user_id": user_id, "challenge_id": challenge_id},
        {"$set": doc},
        upsert=True,
    )
    return {"passed": passed, "total": total, "score": score, "status": doc["status"], "xp_earned": score}


@router.get("/challenges/{challenge_id}/hint")
async def get_hint(
    challenge_id: str,
    index: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    ch = next((c for c in _CHALLENGES if c["id"] == challenge_id), None)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")
    hints = ch.get("hints", [])
    if index >= len(hints):
        raise HTTPException(status_code=404, detail="No more hints available")
    return {"hint": hints[index], "hints_remaining": len(hints) - index - 1}


# ── Projects ──────────────────────────────────────────────────────────────────

@router.get("/projects")
async def list_projects(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    docs = await user_projects_collection.find({"user_id": user_id}).sort("created_at", -1).to_list(length=50)
    return {"projects": [_sid(d) for d in docs]}


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    technologies: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    deadline: Optional[str] = None


@router.post("/projects", status_code=201)
async def create_project(body: ProjectCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    doc = {**body.model_dump(), "user_id": user_id, "progress": 0, "status": "planning", "created_at": _now(), "updated_at": _now()}
    result = await user_projects_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"project": doc}


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None


@router.put("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = _now()
    result = await user_projects_collection.update_one(
        {"_id": ObjectId(project_id), "user_id": user_id}, {"$set": update}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "updated": update}


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    result = await user_projects_collection.delete_one({"_id": ObjectId(project_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")


# ── Skills ────────────────────────────────────────────────────────────────────

@router.get("/skills")
async def get_skills(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    user = await users_collection.find_one({"id": int(user_id)}) or {}
    skill_levels = user.get("skill_levels", {})
    skills = [{**s, "level": skill_levels.get(s["name"], 0)} for s in _SKILLS]
    return {"skills": skills}


@router.get("/skills/assessment")
async def get_assessment_info():
    return {
        "description": "Assess your current skill levels across key technologies.",
        "skills": [s["name"] for s in _SKILLS],
        "estimated_time_minutes": 15,
        "instructions": "Rate your confidence in each skill from 0 (none) to 100 (expert).",
    }


class SkillAssessment(BaseModel):
    ratings: dict  # {"JavaScript": 70, "Python": 50, ...}


@router.post("/skills/assessment")
async def submit_assessment(body: SkillAssessment, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    valid_names = {s["name"] for s in _SKILLS}
    ratings = {k: max(0, min(100, int(v))) for k, v in body.ratings.items() if k in valid_names}
    await users_collection.update_one(
        {"id": int(user_id)},
        {"$set": {"skill_levels": ratings, "assessment_completed_at": _now()}},
    )
    return {"saved": ratings, "message": "Assessment saved successfully"}


# ── Roadmap ───────────────────────────────────────────────────────────────────

@router.get("/roadmap")
async def get_roadmap(
    track: str = Query("frontend", regex="^(frontend|backend|data)$"),
    current_user: dict = Depends(get_current_user),
):
    roadmap = _ROADMAPS.get(track)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


# ── Achievements ──────────────────────────────────────────────────────────────

@router.get("/achievements")
async def get_achievements(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    user = await users_collection.find_one({"id": int(user_id)}) or {}
    earned_ids = set(user.get("earned_badges", []))
    result = []
    for b in _BADGES:
        result.append({**b, "earned": b["id"] in earned_ids, "earned_at": user.get(f"badge_{b['id']}_at")})
    return {"achievements": result, "total_earned": len(earned_ids)}


# ── Badges ────────────────────────────────────────────────────────────────────

@router.get("/badges")
async def get_badges(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    user = await users_collection.find_one({"id": int(user_id)}) or {}
    earned_ids = set(user.get("earned_badges", []))
    earned = [b for b in _BADGES if b["id"] in earned_ids]
    locked = [b for b in _BADGES if b["id"] not in earned_ids]
    return {"earned": earned, "locked": locked, "total": len(_BADGES), "earned_count": len(earned)}


# ── Leaderboard ───────────────────────────────────────────────────────────────

async def _build_leaderboard(limit: int = 10) -> list:
    users = await users_collection.find(
        {"learning_stats.xp_points": {"$exists": True}},
        {"id": 1, "full_name": 1, "avatar": 1, "learning_stats": 1}
    ).sort("learning_stats.xp_points", -1).limit(limit).to_list(length=limit)

    board = []
    for i, u in enumerate(users):
        stats = u.get("learning_stats", {})
        board.append({
            "rank": i + 1,
            "user_id": str(u.get("id", "")),
            "name": u.get("full_name", "Anonymous"),
            "avatar": u.get("avatar", ""),
            "xp": stats.get("xp_points", 0),
            "streak": stats.get("streak_days", 0),
            "challenges_solved": stats.get("challenges_solved", 0),
        })

    # Pad with mock data if DB is sparse
    if len(board) < 5:
        mock_names = ["Abebe G.", "Tigist H.", "Dawit B.", "Sara T.", "Yonas A.", "Meron T.", "Biruk K.", "Hana M.", "Eyob S.", "Liya F."]
        for i in range(len(board), min(10, limit)):
            board.append({
                "rank": i + 1,
                "user_id": f"mock_{i}",
                "name": mock_names[i],
                "avatar": "",
                "xp": max(100, 2000 - i * 180),
                "streak": max(1, 14 - i),
                "challenges_solved": max(1, 20 - i * 2),
            })
    return board


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(10, le=50),
    current_user: dict = Depends(get_current_user),
):
    board = await _build_leaderboard(limit)
    user_id = str(current_user.get("user_id"))
    user_rank = next((e for e in board if e["user_id"] == user_id), None)
    return {"leaderboard": board, "your_rank": user_rank}


@router.get("/leaderboard/{period}")
async def get_leaderboard_by_period(
    period: str,
    limit: int = Query(10, le=50),
    current_user: dict = Depends(get_current_user),
):
    if period not in ("weekly", "monthly", "all-time"):
        raise HTTPException(status_code=400, detail="Period must be weekly, monthly, or all-time")
    board = await _build_leaderboard(limit)
    # For weekly/monthly, apply a multiplier to simulate period-specific scores
    if period == "weekly":
        for e in board:
            e["xp"] = round(e["xp"] * 0.15)
    elif period == "monthly":
        for e in board:
            e["xp"] = round(e["xp"] * 0.45)
    return {"period": period, "leaderboard": board}


# ── Recommendations ───────────────────────────────────────────────────────────

@router.get("/recommendations")
async def get_learning_recommendations(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    user = await users_collection.find_one({"id": int(user_id)}) or {}
    skill_levels = user.get("skill_levels", {})

    # Recommend courses for weakest skills
    weak_skills = sorted(skill_levels.items(), key=lambda x: x[1])[:3] if skill_levels else []
    weak_categories = {s[0] for s in weak_skills}

    recommended_courses = sample(_COURSES, min(3, len(_COURSES)))
    recommended_challenges = sample(_CHALLENGES, min(3, len(_CHALLENGES)))

    return {
        "courses": [{k: v for k, v in c.items()} for c in recommended_courses],
        "challenges": [{k: v for k, v in c.items() if k != "hints"} for c in recommended_challenges],
        "focus_skills": [s[0] for s in weak_skills] or ["JavaScript", "Python", "React"],
        "message": "Based on your activity and skill gaps" if skill_levels else "Popular picks to get you started",
    }
