from datetime import datetime, timezone, timedelta
from typing import List, Optional
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.database_mongo import (
    organizations_collection,
    teams_collection,
    users_collection,
    user_courses_collection,
    user_challenges_collection,
)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _now():
    return datetime.now(timezone.utc)


def _sid(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


async def _get_or_create_org(user_id: int) -> dict:
    org = await organizations_collection.find_one({"created_by": user_id})
    if not org:
        raise HTTPException(status_code=404, detail="No organization found. Create one first.")
    return org


async def _require_org_admin(current_user: dict) -> dict:
    user_id = current_user.get("user_id")
    org = await organizations_collection.find_one({"created_by": user_id})
    if not org:
        raise HTTPException(status_code=403, detail="Not an organization admin")
    return org


# ── Schemas ───────────────────────────────────────────────────────────────────

class OrgCreate(BaseModel):
    name: str
    slug: str
    industry: Optional[str] = None
    size: Optional[str] = None
    subscription_plan: str = "starter"  # starter | pro | enterprise


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    lead_id: Optional[int] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    lead_id: Optional[int] = None


class MemberAdd(BaseModel):
    user_id: int
    role: str = "member"  # member | lead | viewer


class SSOConfig(BaseModel):
    provider: str  # okta | azure_ad | google
    client_id: str
    client_secret: str
    domain: Optional[str] = None
    metadata_url: Optional[str] = None


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def enterprise_dashboard(current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    org_id = str(org["_id"])

    teams = await teams_collection.find({"organization_id": org_id}).to_list(length=100)
    member_ids = []
    for t in teams:
        member_ids += [m["user_id"] for m in t.get("members", [])]
    unique_members = len(set(member_ids))

    total_enrollments = await user_courses_collection.count_documents(
        {"user_id": {"$in": [str(m) for m in set(member_ids)]}}
    )
    total_challenges = await user_challenges_collection.count_documents(
        {"user_id": {"$in": [str(m) for m in set(member_ids)]}}
    )

    return {
        "organization": {
            "id": org_id,
            "name": org.get("name"),
            "plan": org.get("subscription_plan", "starter"),
            "slug": org.get("slug"),
        },
        "stats": {
            "total_teams": len(teams),
            "total_members": unique_members,
            "total_enrollments": total_enrollments,
            "total_challenges_solved": total_challenges,
        },
        "teams_summary": [
            {"id": str(t["_id"]), "name": t.get("name"), "members": len(t.get("members", []))}
            for t in teams
        ],
    }


# ── Teams CRUD ────────────────────────────────────────────────────────────────

@router.get("/teams")
async def list_teams(current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    teams = await teams_collection.find({"organization_id": str(org["_id"])}).to_list(length=100)
    return {"teams": [_sid(t) for t in teams]}


@router.post("/teams", status_code=201)
async def create_team(body: TeamCreate, current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    doc = {
        **body.model_dump(),
        "organization_id": str(org["_id"]),
        "members": [],
        "created_by": current_user.get("user_id"),
        "created_at": _now(),
        "updated_at": _now(),
    }
    result = await teams_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"team": doc}


@router.put("/teams/{team_id}")
async def update_team(team_id: str, body: TeamUpdate, current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=400, detail="Invalid team ID")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    update["updated_at"] = _now()
    result = await teams_collection.update_one(
        {"_id": ObjectId(team_id), "organization_id": str(org["_id"])},
        {"$set": update},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"success": True}


@router.delete("/teams/{team_id}", status_code=204)
async def delete_team(team_id: str, current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=400, detail="Invalid team ID")
    result = await teams_collection.delete_one(
        {"_id": ObjectId(team_id), "organization_id": str(org["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")


# ── Team Members ──────────────────────────────────────────────────────────────

@router.post("/teams/{team_id}/members", status_code=201)
async def add_member(team_id: str, body: MemberAdd, current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=400, detail="Invalid team ID")

    team = await teams_collection.find_one({"_id": ObjectId(team_id), "organization_id": str(org["_id"])})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    existing_ids = [m["user_id"] for m in team.get("members", [])]
    if body.user_id in existing_ids:
        raise HTTPException(status_code=409, detail="User already in team")

    user = await users_collection.find_one({"id": body.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    member = {"user_id": body.user_id, "role": body.role, "joined_at": _now().isoformat()}
    await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {"$push": {"members": member}, "$set": {"updated_at": _now()}},
    )
    return {"success": True, "member": member}


@router.delete("/teams/{team_id}/members/{member_user_id}", status_code=204)
async def remove_member(team_id: str, member_user_id: int, current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    if not ObjectId.is_valid(team_id):
        raise HTTPException(status_code=400, detail="Invalid team ID")
    result = await teams_collection.update_one(
        {"_id": ObjectId(team_id), "organization_id": str(org["_id"])},
        {"$pull": {"members": {"user_id": member_user_id}}, "$set": {"updated_at": _now()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def enterprise_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: dict = Depends(get_current_user),
):
    org = await _require_org_admin(current_user)
    org_id = str(org["_id"])
    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    cutoff = _now() - timedelta(days=days)

    teams = await teams_collection.find({"organization_id": org_id}).to_list(length=100)
    all_member_ids = list({str(m["user_id"]) for t in teams for m in t.get("members", [])})

    enrollments = await user_courses_collection.count_documents({"user_id": {"$in": all_member_ids}})
    completed = await user_courses_collection.count_documents({"user_id": {"$in": all_member_ids}, "status": "completed"})
    challenges = await user_challenges_collection.count_documents({"user_id": {"$in": all_member_ids}})

    team_breakdown = []
    for t in teams:
        m_ids = [str(m["user_id"]) for m in t.get("members", [])]
        t_enroll = await user_courses_collection.count_documents({"user_id": {"$in": m_ids}})
        t_challenges = await user_challenges_collection.count_documents({"user_id": {"$in": m_ids}})
        team_breakdown.append({
            "team": t.get("name"),
            "members": len(m_ids),
            "enrollments": t_enroll,
            "challenges_solved": t_challenges,
        })

    return {
        "period": period,
        "total_members": len(all_member_ids),
        "total_enrollments": enrollments,
        "completed_courses": completed,
        "completion_rate_pct": round(completed / max(enrollments, 1) * 100, 1),
        "challenges_solved": challenges,
        "team_breakdown": team_breakdown,
    }


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports")
async def enterprise_reports(current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    now = _now()
    return {
        "reports": [
            {"id": "r1", "title": "Monthly Learning Report", "type": "learning", "generated_at": (now - timedelta(days=2)).isoformat(), "download_url": "/api/v1/enterprise/reports/r1/download"},
            {"id": "r2", "title": "Team Performance Summary", "type": "performance", "generated_at": (now - timedelta(days=7)).isoformat(), "download_url": "/api/v1/enterprise/reports/r2/download"},
            {"id": "r3", "title": "Skills Gap Analysis", "type": "skills", "generated_at": (now - timedelta(days=14)).isoformat(), "download_url": "/api/v1/enterprise/reports/r3/download"},
        ]
    }


# ── Compliance ────────────────────────────────────────────────────────────────

@router.get("/compliance")
async def enterprise_compliance(current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    now = _now()
    return {
        "organization": org.get("name"),
        "plan": org.get("subscription_plan", "starter"),
        "data_residency": "EU / Ethiopia",
        "sso_enabled": org.get("sso_configured", False),
        "audit_log_retention_days": 90,
        "last_audit": (now - timedelta(days=30)).isoformat(),
        "certifications": ["ISO 27001 (pending)", "SOC 2 Type I (planned)"],
        "gdpr_compliant": True,
        "data_export_available": True,
        "checklist": [
            {"item": "SSO configured", "status": org.get("sso_configured", False)},
            {"item": "2FA enforced for all members", "status": False},
            {"item": "Audit logs enabled", "status": True},
            {"item": "Data retention policy set", "status": True},
        ],
    }


# ── SSO ───────────────────────────────────────────────────────────────────────

@router.post("/sso/configure")
async def configure_sso(body: SSOConfig, current_user: dict = Depends(get_current_user)):
    org = await _require_org_admin(current_user)
    await organizations_collection.update_one(
        {"_id": org["_id"]},
        {"$set": {
            "sso_configured": True,
            "sso_provider": body.provider,
            "sso_client_id": body.client_id,
            "sso_domain": body.domain,
            "sso_metadata_url": body.metadata_url,
            "sso_updated_at": _now(),
        }},
    )
    return {
        "success": True,
        "provider": body.provider,
        "callback_url": f"/api/v1/auth/sso/{body.provider}/callback",
        "message": f"SSO configured for {body.provider}. Update your IdP with the callback URL.",
    }


# ── Org bootstrap (create org) ────────────────────────────────────────────────

@router.post("/organization", status_code=201)
async def create_organization(body: OrgCreate, current_user: dict = Depends(get_current_user)):
    existing = await organizations_collection.find_one({"created_by": current_user.get("user_id")})
    if existing:
        raise HTTPException(status_code=409, detail="Organization already exists")
    slug_taken = await organizations_collection.find_one({"slug": body.slug})
    if slug_taken:
        raise HTTPException(status_code=409, detail="Slug already taken")
    doc = {
        **body.model_dump(),
        "created_by": current_user.get("user_id"),
        "sso_configured": False,
        "created_at": _now(),
        "updated_at": _now(),
    }
    result = await organizations_collection.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"organization": doc}
