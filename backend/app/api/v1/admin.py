from datetime import datetime, timezone, timedelta
from typing import Optional
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.database_mongo import (
    users_collection,
    jobs_collection,
    templates_collection,
    applications_collection,
    template_purchases_collection,
    blogs_collection,
    blog_comments_collection,
    forum_posts_collection,
    login_history_collection,
    user_activities_collection,
)

router = APIRouter()

_audit_log: list = []  # in-memory audit log (replace with DB collection in production)
_mod_queue: list = []  # in-memory moderation queue


def _now():
    return datetime.now(timezone.utc)


def _sid(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


def _require_admin(current_user: dict):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


def _log(action: str, admin_id, target: str, detail: str = ""):
    _audit_log.append({
        "id": len(_audit_log) + 1,
        "action": action,
        "admin_id": admin_id,
        "target": target,
        "detail": detail,
        "timestamp": _now().isoformat(),
    })


# ── Schemas ───────────────────────────────────────────────────────────────────

class RoleUpdate(BaseModel):
    role: str  # job_seeker | company | admin


class StatusUpdate(BaseModel):
    status: str  # active | banned | suspended


class RejectPayload(BaseModel):
    reason: Optional[str] = ""


class ModerationResolve(BaseModel):
    item_id: str
    action: str   # approve | remove | warn
    reason: Optional[str] = ""


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    now = _now()
    week_ago = now - timedelta(days=7)

    total_users = await users_collection.count_documents({})
    new_users_week = await users_collection.count_documents({"created_at": {"$gte": week_ago}})
    total_jobs = await jobs_collection.count_documents({})
    pending_jobs = await jobs_collection.count_documents({"status": "pending"})
    total_templates = await templates_collection.count_documents({})
    pending_templates = await templates_collection.count_documents({"status": "pending_review"})
    total_applications = await applications_collection.count_documents({})
    pending_companies = await users_collection.count_documents({"role": "company", "verification_status": "pending"})
    total_revenue = await template_purchases_collection.count_documents({"status": "completed"})
    mod_items = len([m for m in _mod_queue if m["status"] == "pending"])

    return {
        "stats": {
            "total_users": total_users,
            "new_users_this_week": new_users_week,
            "total_jobs": total_jobs,
            "pending_jobs": pending_jobs,
            "total_templates": total_templates,
            "pending_templates": pending_templates,
            "total_applications": total_applications,
            "pending_companies": pending_companies,
            "total_purchases": total_revenue,
            "moderation_queue": mod_items,
        },
        "recent_logs": _audit_log[-5:][::-1],
    }


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_banned: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    query: dict = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
        ]
    if role:
        query["role"] = role
    if is_banned is not None:
        query["is_banned"] = is_banned

    total = await users_collection.count_documents(query)
    skip = (page - 1) * limit
    users = await users_collection.find(
        query, {"hashed_password": 0, "two_factor_secret": 0, "backup_codes": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)

    return {"users": [_sid(u) for u in users], "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, body: RoleUpdate, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    valid_roles = {"job_seeker", "company", "admin"}
    if body.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Role must be one of {valid_roles}")
    result = await users_collection.update_one({"id": user_id}, {"$set": {"role": body.role, "updated_at": _now()}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    _log("update_role", current_user.get("user_id"), f"user:{user_id}", f"role={body.role}")
    return {"success": True}


@router.put("/users/{user_id}/status")
async def update_user_status(user_id: int, body: StatusUpdate, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    valid = {"active", "banned", "suspended"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    update = {"is_banned": body.status == "banned", "status": body.status, "updated_at": _now()}
    result = await users_collection.update_one({"id": user_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    _log("update_status", current_user.get("user_id"), f"user:{user_id}", f"status={body.status}")
    return {"success": True}


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    if user_id == current_user.get("user_id"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await users_collection.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    _log("delete_user", current_user.get("user_id"), f"user:{user_id}")


# ── Templates ─────────────────────────────────────────────────────────────────

@router.get("/templates/pending")
async def pending_templates(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    items = await templates_collection.find({"status": "pending_review"}).sort("created_at", -1).to_list(length=100)
    return {"templates": [_sid({k: v for k, v in t.items() if k != "_id"} | {"id": str(t["_id"])} if "_id" in t else t) for t in items], "total": len(items)}


@router.put("/templates/{template_id}/approve")
async def approve_template(template_id: int, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    result = await templates_collection.update_one(
        {"id": template_id},
        {"$set": {"status": "approved", "approved_at": _now(), "updated_at": _now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    _log("approve_template", current_user.get("user_id"), f"template:{template_id}")
    return {"success": True}


@router.put("/templates/{template_id}/reject")
async def reject_template(template_id: int, body: RejectPayload, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    result = await templates_collection.update_one(
        {"id": template_id},
        {"$set": {"status": "rejected", "rejection_reason": body.reason, "updated_at": _now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    _log("reject_template", current_user.get("user_id"), f"template:{template_id}", body.reason or "")
    return {"success": True}


# ── Jobs ──────────────────────────────────────────────────────────────────────

@router.get("/jobs/pending")
async def pending_jobs(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    items = await jobs_collection.find({"status": "pending"}).sort("posted_date", -1).to_list(length=100)
    result = []
    for j in items:
        d = _sid(j)
        if isinstance(d.get("posted_date"), datetime):
            d["posted_date"] = d["posted_date"].isoformat()
        result.append(d)
    return {"jobs": result, "total": len(result)}


@router.put("/jobs/{job_id}/approve")
async def approve_job(job_id: str, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    result = await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "approved", "is_active": True, "approved_at": _now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    _log("approve_job", current_user.get("user_id"), f"job:{job_id}")
    return {"success": True}


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports")
async def admin_reports(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    now = _now()
    return {
        "reports": [
            {"id": "ar1", "title": "Platform Growth Report", "type": "growth", "generated_at": (now - timedelta(days=1)).isoformat(), "download_url": "/api/v1/admin/reports/ar1/download"},
            {"id": "ar2", "title": "Revenue Summary", "type": "revenue", "generated_at": (now - timedelta(days=3)).isoformat(), "download_url": "/api/v1/admin/reports/ar2/download"},
            {"id": "ar3", "title": "User Retention Analysis", "type": "retention", "generated_at": (now - timedelta(days=7)).isoformat(), "download_url": "/api/v1/admin/reports/ar3/download"},
            {"id": "ar4", "title": "Content Moderation Report", "type": "moderation", "generated_at": (now - timedelta(days=2)).isoformat(), "download_url": "/api/v1/admin/reports/ar4/download"},
        ]
    }


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def admin_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    cutoff = _now() - timedelta(days=days)

    new_users = await users_collection.count_documents({"created_at": {"$gte": cutoff}})
    new_jobs = await jobs_collection.count_documents({"posted_date": {"$gte": cutoff}})
    new_applications = await applications_collection.count_documents({"applied_at": {"$gte": cutoff}})
    new_purchases = await template_purchases_collection.count_documents({"purchased_at": {"$gte": cutoff}, "status": "completed"})

    revenue_docs = await template_purchases_collection.find(
        {"purchased_at": {"$gte": cutoff}, "status": "completed"}, {"amount": 1}
    ).to_list(length=10000)
    total_revenue = sum(d.get("amount", 0) for d in revenue_docs)

    role_breakdown = {}
    for role in ("job_seeker", "company", "admin"):
        role_breakdown[role] = await users_collection.count_documents({"role": role})

    return {
        "period": period,
        "new_users": new_users,
        "new_jobs": new_jobs,
        "new_applications": new_applications,
        "new_purchases": new_purchases,
        "total_revenue_usd": round(total_revenue, 2),
        "platform_fee_usd": round(total_revenue * 0.20, 2),
        "user_role_breakdown": role_breakdown,
        "total_users": await users_collection.count_documents({}),
        "total_jobs": await jobs_collection.count_documents({"is_active": True}),
    }


# ── Audit Logs ────────────────────────────────────────────────────────────────

@router.get("/logs")
async def admin_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    logs = list(reversed(_audit_log))
    skip = (page - 1) * limit
    return {
        "logs": logs[skip: skip + limit],
        "total": len(logs),
        "page": page,
        "pages": (len(logs) + limit - 1) // limit,
    }


# ── Moderation ────────────────────────────────────────────────────────────────

@router.get("/moderation/queue")
async def moderation_queue(
    content_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)

    # Pull flagged blog comments
    flagged_comments = await blog_comments_collection.find(
        {"is_flagged": True, "is_approved": {"$ne": True}}
    ).limit(50).to_list(length=50)

    # Pull flagged forum posts
    flagged_posts = await forum_posts_collection.find(
        {"status": "flagged"}
    ).limit(50).to_list(length=50)

    queue = []
    for c in flagged_comments:
        queue.append({"id": str(c["_id"]), "type": "comment", "content": c.get("content", "")[:200], "reported_at": c.get("created_at", _now()).isoformat() if isinstance(c.get("created_at"), datetime) else "", "status": "pending"})
    for p in flagged_posts:
        queue.append({"id": str(p["_id"]), "type": "forum_post", "content": p.get("content", "")[:200], "reported_at": p.get("last_activity", _now()).isoformat() if isinstance(p.get("last_activity"), datetime) else "", "status": "pending"})

    # Merge in-memory queue items
    queue += [m for m in _mod_queue if m["status"] == "pending"]

    if content_type:
        queue = [q for q in queue if q["type"] == content_type]

    skip = (page - 1) * limit
    return {"queue": queue[skip: skip + limit], "total": len(queue)}


@router.post("/moderation/resolve")
async def resolve_moderation(body: ModerationResolve, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)

    resolved = False

    if ObjectId.is_valid(body.item_id):
        oid = ObjectId(body.item_id)
        if body.action == "approve":
            r = await blog_comments_collection.update_one({"_id": oid}, {"$set": {"is_approved": True, "is_flagged": False}})
            if r.matched_count == 0:
                await forum_posts_collection.update_one({"_id": oid}, {"$set": {"status": "active"}})
            resolved = True
        elif body.action == "remove":
            r = await blog_comments_collection.delete_one({"_id": oid})
            if r.deleted_count == 0:
                await forum_posts_collection.delete_one({"_id": oid})
            resolved = True

    # Also resolve in-memory queue
    for item in _mod_queue:
        if item["id"] == body.item_id:
            item["status"] = "resolved"
            item["resolved_by"] = current_user.get("user_id")
            item["resolved_at"] = _now().isoformat()
            resolved = True

    _log("moderation_resolve", current_user.get("user_id"), f"item:{body.item_id}", f"action={body.action}")
    return {"success": True, "action": body.action, "item_id": body.item_id}
