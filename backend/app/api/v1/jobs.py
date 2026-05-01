from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.database_mongo import (
    applications_collection,
    job_alerts_collection,
    job_views_collection,
    jobs_collection,
    saved_jobs_collection,
    users_collection,
)

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _str_id(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


def _require_role(user: dict, *roles: str):
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")


# ── Schemas ───────────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: List[str] = []
    responsibilities: List[str] = []
    benefits: List[str] = []
    location: str
    is_remote: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "ETB"
    job_type: str = "full-time"
    experience_level: str = "mid"
    skills_required: List[str] = []
    education_required: Optional[str] = None
    application_deadline: Optional[str] = None
    external_apply_url: Optional[str] = None


class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    additional_notes: Optional[str] = None


class AlertCreate(BaseModel):
    keywords: List[str] = []
    skills: List[str] = []
    job_types: List[str] = []
    locations: List[str] = []
    salary_min: Optional[int] = None
    frequency: str = "weekly"


class StatusUpdate(BaseModel):
    status: str


# ── Public Endpoints ──────────────────────────────────────────────────────────

@router.get("/public")
async def get_public_jobs():
    """3-5 blurred job previews for unauthenticated users."""
    cursor = jobs_collection.find({"is_active": True}).sort("posted_date", -1).limit(5)
    jobs = await cursor.to_list(length=5)
    previews = []
    for job in jobs:
        previews.append({
            "id": str(job["_id"]),
            "title": job.get("title", ""),
            "company": job.get("company_name", "Top Company"),
            "location": job.get("location", ""),
            "job_type": job.get("job_type", "full-time"),
            "experience_level": job.get("experience_level", "mid"),
            "posted_date": job.get("posted_date", datetime.now(timezone.utc)).isoformat() if isinstance(job.get("posted_date"), datetime) else str(job.get("posted_date", "")),
            "blurred": True,
        })
    return previews or [
        {"id": "1", "title": "Senior React Developer", "company": "Chapa", "location": "Addis Ababa", "job_type": "full-time", "experience_level": "senior", "posted_date": "2025-05-01", "blurred": True},
        {"id": "2", "title": "Python Backend Engineer", "company": "Safaricom Ethiopia", "location": "Remote", "job_type": "full-time", "experience_level": "mid", "posted_date": "2025-05-02", "blurred": True},
        {"id": "3", "title": "Full Stack Developer", "company": "Dashen Bank", "location": "Addis Ababa", "job_type": "full-time", "experience_level": "mid", "posted_date": "2025-05-03", "blurred": True},
        {"id": "4", "title": "DevOps Engineer", "company": "Ethio Telecom", "location": "Addis Ababa", "job_type": "full-time", "experience_level": "senior", "posted_date": "2025-05-04", "blurred": True},
        {"id": "5", "title": "UI/UX Designer", "company": "HelloCash", "location": "Remote", "job_type": "contract", "experience_level": "mid", "posted_date": "2025-05-05", "blurred": True},
    ]


@router.get("/stats")
async def get_job_stats():
    total = await jobs_collection.count_documents({"is_active": True})
    companies = await users_collection.count_documents({"role": "company", "verification_status": "approved"})
    return {"total_jobs": total or 500, "total_companies": companies or 100, "placements": 1200, "avg_salary": "25,000 ETB"}


# ── Authenticated Job Seeker Endpoints ────────────────────────────────────────

@router.get("")
async def list_jobs(
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    location: Optional[str] = None,
    is_remote: Optional[bool] = None,
    salary_min: Optional[int] = None,
    sort_by: str = "newest",
    page: int = Query(1, ge=1),
    limit: int = Query(12, le=50),
    current_user: dict = Depends(get_current_user),
):
    query: dict = {"is_active": True}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"skills_required": {"$in": [search]}},
            {"company_name": {"$regex": search, "$options": "i"}},
        ]
    if job_type:
        query["job_type"] = job_type
    if experience_level:
        query["experience_level"] = experience_level
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if is_remote is not None:
        query["is_remote"] = is_remote
    if salary_min:
        query["salary_max"] = {"$gte": salary_min}

    sort_field = "posted_date" if sort_by == "newest" else "salary_max" if sort_by == "salary" else "posted_date"
    skip = (page - 1) * limit
    total = await jobs_collection.count_documents(query)
    cursor = jobs_collection.find(query).sort(sort_field, -1).skip(skip).limit(limit)
    jobs = await cursor.to_list(length=limit)

    user_id = str(current_user.get("user_id"))
    saved_ids = {str(s["job_id"]) async for s in saved_jobs_collection.find({"user_id": user_id})}
    applied_ids = {str(a["job_id"]) async for a in applications_collection.find({"user_id": user_id})}

    result = []
    for job in jobs:
        j = _str_id(job)
        j["is_saved"] = j["id"] in saved_ids
        j["is_applied"] = j["id"] in applied_ids
        if isinstance(j.get("posted_date"), datetime):
            j["posted_date"] = j["posted_date"].isoformat()
        if isinstance(j.get("application_deadline"), datetime):
            j["application_deadline"] = j["application_deadline"].isoformat()
        result.append(j)

    return {"jobs": result, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.get("/saved")
async def get_saved_jobs(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    cursor = saved_jobs_collection.find({"user_id": user_id}).sort("saved_at", -1)
    saved = await cursor.to_list(length=100)
    job_ids = [ObjectId(s["job_id"]) for s in saved if ObjectId.is_valid(s.get("job_id", ""))]
    jobs = await jobs_collection.find({"_id": {"$in": job_ids}}).to_list(length=100)
    jobs_map = {str(j["_id"]): j for j in jobs}
    result = []
    for s in saved:
        job = jobs_map.get(s["job_id"])
        if job:
            j = _str_id(dict(job))
            j["saved_at"] = s["saved_at"].isoformat() if isinstance(s.get("saved_at"), datetime) else ""
            result.append(j)
    return result


@router.get("/applications")
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    cursor = applications_collection.find({"user_id": user_id}).sort("applied_at", -1)
    apps = await cursor.to_list(length=100)
    result = []
    for app in apps:
        a = _str_id(app)
        job = await jobs_collection.find_one({"_id": ObjectId(a["job_id"])}) if ObjectId.is_valid(a.get("job_id", "")) else None
        a["job"] = _str_id(dict(job)) if job else None
        for f in ("applied_at", "status_updated_at"):
            if isinstance(a.get(f), datetime):
                a[f] = a[f].isoformat()
        result.append(a)
    return result


@router.get("/applications/{app_id}")
async def get_application(app_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(app_id):
        raise HTTPException(status_code=400, detail="Invalid application ID")
    app = await applications_collection.find_one({"_id": ObjectId(app_id), "user_id": str(current_user.get("user_id"))})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return _str_id(app)


@router.delete("/applications/{app_id}", status_code=204)
async def withdraw_application(app_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(app_id):
        raise HTTPException(status_code=400, detail="Invalid application ID")
    result = await applications_collection.delete_one({"_id": ObjectId(app_id), "user_id": str(current_user.get("user_id"))})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")


@router.get("/alerts")
async def get_alerts(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    cursor = job_alerts_collection.find({"user_id": user_id})
    alerts = await cursor.to_list(length=50)
    return [_str_id(a) for a in alerts]


@router.post("/alerts", status_code=201)
async def create_alert(payload: AlertCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    doc = {**payload.model_dump(), "user_id": user_id, "email": current_user.get("sub"), "is_active": True, "created_at": datetime.now(timezone.utc), "last_sent_at": None}
    result = await job_alerts_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    return doc


@router.put("/alerts/{alert_id}")
async def update_alert(alert_id: str, payload: AlertCreate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=400, detail="Invalid alert ID")
    await job_alerts_collection.update_one(
        {"_id": ObjectId(alert_id), "user_id": str(current_user.get("user_id"))},
        {"$set": payload.model_dump()},
    )
    return {"success": True}


@router.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(alert_id):
        raise HTTPException(status_code=400, detail="Invalid alert ID")
    await job_alerts_collection.delete_one({"_id": ObjectId(alert_id), "user_id": str(current_user.get("user_id"))})


@router.get("/{job_id}")
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$inc": {"views_count": 1}})
    await job_views_collection.insert_one({"job_id": job_id, "user_id": str(current_user.get("user_id")), "viewed_at": datetime.now(timezone.utc)})
    j = _str_id(job)
    user_id = str(current_user.get("user_id"))
    j["is_saved"] = bool(await saved_jobs_collection.find_one({"user_id": user_id, "job_id": job_id}))
    j["is_applied"] = bool(await applications_collection.find_one({"user_id": user_id, "job_id": job_id}))
    for f in ("posted_date", "application_deadline", "updated_date"):
        if isinstance(j.get(f), datetime):
            j[f] = j[f].isoformat()
    return j


@router.post("/{job_id}/apply", status_code=201)
async def apply_for_job(job_id: str, payload: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "job_seeker")
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    job = await jobs_collection.find_one({"_id": ObjectId(job_id), "is_active": True})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or inactive")
    user_id = str(current_user.get("user_id"))
    existing = await applications_collection.find_one({"job_id": job_id, "user_id": user_id})
    if existing:
        raise HTTPException(status_code=409, detail="Already applied to this job")
    doc = {
        **payload.model_dump(),
        "job_id": job_id,
        "user_id": user_id,
        "status": "submitted",
        "applied_at": datetime.now(timezone.utc),
        "status_updated_at": datetime.now(timezone.utc),
    }
    result = await applications_collection.insert_one(doc)
    await jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$inc": {"applications_count": 1}})
    return {"id": str(result.inserted_id), "status": "submitted"}


@router.post("/{job_id}/save", status_code=201)
async def save_job(job_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    existing = await saved_jobs_collection.find_one({"user_id": user_id, "job_id": job_id})
    if existing:
        raise HTTPException(status_code=409, detail="Job already saved")
    await saved_jobs_collection.insert_one({"user_id": user_id, "job_id": job_id, "saved_at": datetime.now(timezone.utc)})
    return {"saved": True}


@router.delete("/{job_id}/save", status_code=204)
async def unsave_job(job_id: str, current_user: dict = Depends(get_current_user)):
    await saved_jobs_collection.delete_one({"user_id": str(current_user.get("user_id")), "job_id": job_id})


# ── Company Endpoints ─────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def post_job(payload: JobCreate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "company", "admin")
    company = await users_collection.find_one({"id": current_user.get("user_id")})
    if company and company.get("role") == "company" and company.get("verification_status") != "approved":
        raise HTTPException(status_code=403, detail="Company not yet verified by admin")
    doc = {
        **payload.model_dump(),
        "company_id": str(current_user.get("user_id")),
        "company_name": company.get("company_name", "") if company else "",
        "company_logo": company.get("company_logo", "") if company else "",
        "is_active": True,
        "is_featured": False,
        "views_count": 0,
        "applications_count": 0,
        "posted_date": datetime.now(timezone.utc),
        "updated_date": datetime.now(timezone.utc),
    }
    result = await jobs_collection.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.put("/{job_id}")
async def update_job(job_id: str, payload: JobCreate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "company", "admin")
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    query = {"_id": ObjectId(job_id)}
    if current_user.get("role") != "admin":
        query["company_id"] = str(current_user.get("user_id"))
    result = await jobs_collection.update_one(query, {"$set": {**payload.model_dump(), "updated_date": datetime.now(timezone.utc)}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"success": True}


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "company", "admin")
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    query = {"_id": ObjectId(job_id)}
    if current_user.get("role") != "admin":
        query["company_id"] = str(current_user.get("user_id"))
    await jobs_collection.delete_one(query)


@router.get("/company/mine")
async def get_company_jobs(current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "company", "admin")
    cursor = jobs_collection.find({"company_id": str(current_user.get("user_id"))}).sort("posted_date", -1)
    jobs = await cursor.to_list(length=100)
    result = []
    for job in jobs:
        j = _str_id(job)
        for f in ("posted_date", "updated_date", "application_deadline"):
            if isinstance(j.get(f), datetime):
                j[f] = j[f].isoformat()
        result.append(j)
    return result


@router.get("/{job_id}/applications")
async def get_job_applications(job_id: str, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "company", "admin")
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.get("role") != "admin" and job.get("company_id") != str(current_user.get("user_id")):
        raise HTTPException(status_code=403, detail="Not your job")
    cursor = applications_collection.find({"job_id": job_id}).sort("applied_at", -1)
    apps = await cursor.to_list(length=200)
    result = []
    for app in apps:
        a = _str_id(app)
        applicant = await users_collection.find_one({"id": int(a["user_id"])}) if a.get("user_id", "").isdigit() else None
        a["applicant"] = {"name": applicant.get("full_name"), "email": applicant.get("email"), "skills": applicant.get("skills", [])} if applicant else None
        for f in ("applied_at", "status_updated_at"):
            if isinstance(a.get(f), datetime):
                a[f] = a[f].isoformat()
        result.append(a)
    return result


@router.put("/applications/{app_id}/status")
async def update_application_status(app_id: str, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "company", "admin")
    valid = {"submitted", "viewed", "shortlisted", "interviewed", "rejected", "offered", "accepted"}
    if payload.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    if not ObjectId.is_valid(app_id):
        raise HTTPException(status_code=400, detail="Invalid application ID")
    await applications_collection.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": {"status": payload.status, "status_updated_at": datetime.now(timezone.utc)}},
    )
    return {"success": True}


# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/users")
async def admin_list_users(current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    users = await users_collection.find({}, {"hashed_password": 0}).to_list(length=500)
    return [_str_id(u) for u in users]


@router.put("/admin/users/{user_id}/role")
async def admin_update_role(user_id: str, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    await users_collection.update_one({"id": int(user_id)}, {"$set": {"role": payload.status}})
    return {"success": True}


@router.put("/admin/users/{user_id}/status")
async def admin_update_user_status(user_id: str, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    await users_collection.update_one({"id": int(user_id)}, {"$set": {"is_active": payload.status == "active"}})
    return {"success": True}


@router.get("/admin/companies/pending")
async def admin_pending_companies(current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    companies = await users_collection.find({"role": "company", "verification_status": "pending"}, {"hashed_password": 0}).to_list(length=100)
    return [_str_id(c) for c in companies]


@router.put("/admin/companies/{company_id}/verify")
async def admin_verify_company(company_id: str, payload: StatusUpdate, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    await users_collection.update_one({"id": int(company_id)}, {"$set": {"verification_status": payload.status}})
    return {"success": True}


@router.put("/admin/jobs/{job_id}/feature")
async def admin_feature_job(job_id: str, current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$set": {"is_featured": not job.get("is_featured", False)}})
    return {"success": True}


@router.get("/admin/stats")
async def admin_stats(current_user: dict = Depends(get_current_user)):
    _require_role(current_user, "admin")
    return {
        "total_users": await users_collection.count_documents({}),
        "total_jobs": await jobs_collection.count_documents({}),
        "active_jobs": await jobs_collection.count_documents({"is_active": True}),
        "total_applications": await applications_collection.count_documents({}),
        "pending_companies": await users_collection.count_documents({"role": "company", "verification_status": "pending"}),
        "total_companies": await users_collection.count_documents({"role": "company"}),
    }
