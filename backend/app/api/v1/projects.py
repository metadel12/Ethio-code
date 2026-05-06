import re
from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.database_mongo import (
    projects_collection,
    project_likes_collection,
    project_saves_collection,
    project_comments_collection,
    project_views_collection,
    users_collection,
)

router = APIRouter()


def _sid(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    for k in ("creator_id",):
        if isinstance(doc.get(k), ObjectId):
            doc[k] = str(doc[k])
    for k in ("created_at", "updated_at", "published_at", "started_date", "completed_date"):
        if isinstance(doc.get(k), datetime):
            doc[k] = doc[k].isoformat()
    return doc


def _slug(title: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{s}-{int(datetime.now(timezone.utc).timestamp())}"


class ProjectCreate(BaseModel):
    title: str
    short_description: str = ""
    description: str = ""
    project_type: str = "portfolio"
    category: str = "web-development"
    difficulty_level: str = "intermediate"
    project_status: str = "completed"
    tech_stack: List[str] = []
    libraries: List[str] = []
    databases: List[str] = []
    apis_integrated: List[str] = []
    key_features: List[str] = []
    challenges_faced: List[str] = []
    future_plans: List[str] = []
    github_url: str = ""
    live_demo_url: str = ""
    documentation_url: str = ""
    figma_url: str = ""
    featured_image: str = ""
    gallery_images: List[str] = []
    demo_video_url: str = ""
    team_members: List[dict] = []
    started_date: Optional[str] = None
    completed_date: Optional[str] = None
    is_published: bool = False


class CommentCreate(BaseModel):
    comment: str
    parent_id: Optional[str] = None


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats():
    total = await projects_collection.count_documents({"is_published": True})
    creators = await projects_collection.distinct("creator_id", {"is_published": True})
    likes = await project_likes_collection.count_documents({})
    return {"total_projects": total, "total_creators": len(creators), "total_likes": likes}


@router.get("/filter-options")
async def get_filter_options():
    q = {"is_published": True}
    types = await projects_collection.distinct("project_type", q)
    cats = await projects_collection.distinct("category", q)
    diffs = await projects_collection.distinct("difficulty_level", q)
    pipeline = [
        {"$match": q}, {"$unwind": "$tech_stack"},
        {"$group": {"_id": "$tech_stack", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 20}
    ]
    techs = await projects_collection.aggregate(pipeline).to_list(20)
    return {
        "project_types": [t for t in types if t],
        "categories": [c for c in cats if c],
        "difficulty_levels": [d for d in diffs if d],
        "popular_tech_stacks": [{"name": t["_id"], "count": t["count"]} for t in techs],
    }


@router.get("/featured")
async def get_featured(limit: int = Query(6, le=20)):
    cursor = projects_collection.find({"is_published": True, "is_featured": True}).sort("likes", -1).limit(limit)
    projects = await cursor.to_list(limit)
    return {"projects": [_sid(p) for p in projects]}


@router.get("")
async def list_projects(
    search: Optional[str] = None,
    project_type: Optional[str] = None,
    category: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    tech_stack: Optional[str] = None,
    sort_by: str = Query("newest"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, le=50),
):
    query: dict = {"is_published": True}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"short_description": {"$regex": search, "$options": "i"}},
            {"tech_stack": {"$in": [search]}},
        ]
    if project_type:
        query["project_type"] = project_type
    if category:
        query["category"] = category
    if difficulty_level:
        query["difficulty_level"] = difficulty_level
    if tech_stack:
        query["tech_stack"] = {"$in": tech_stack.split(",")}

    sort_map = {"newest": ("created_at", -1), "most_viewed": ("views", -1), "most_liked": ("likes", -1), "oldest": ("created_at", 1)}
    sf, so = sort_map.get(sort_by, ("created_at", -1))

    total = await projects_collection.count_documents(query)
    skip = (page - 1) * limit
    cursor = projects_collection.find(query).sort(sf, so).skip(skip).limit(limit)
    projects = await cursor.to_list(limit)
    return {"total": total, "page": page, "limit": limit, "total_pages": (total + limit - 1) // limit, "projects": [_sid(p) for p in projects]}


@router.get("/{project_id}")
async def get_project(project_id: str, request: Request):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(404, "Project not found")
    project = await projects_collection.find_one({"_id": ObjectId(project_id), "is_published": True})
    if not project:
        raise HTTPException(404, "Project not found")
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"views": 1}})
    await project_views_collection.insert_one({
        "project_id": project_id,
        "ip_address": request.client.host if request.client else "",
        "viewed_at": datetime.now(timezone.utc),
    })
    comments_cursor = project_comments_collection.find({"project_id": project_id}).sort("created_at", -1).limit(50)
    comments = [_sid(c) for c in await comments_cursor.to_list(50)]
    similar = await projects_collection.find({
        "_id": {"$ne": ObjectId(project_id)},
        "is_published": True,
        "tech_stack": {"$in": project.get("tech_stack", [])[:3]},
    }).limit(4).to_list(4)
    return {"project": _sid(project), "comments": comments, "similar_projects": [_sid(s) for s in similar]}


# ── Auth required ─────────────────────────────────────────────────────────────

@router.post("", status_code=201)
async def create_project(payload: ProjectCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))  # always store as string
    user = await users_collection.find_one({"$or": [{"id": current_user.get("user_id")}, {"email": current_user.get("sub")}]}) or {}
    now = datetime.now(timezone.utc)
    doc = {
        **payload.model_dump(),
        "slug": _slug(payload.title),
        "creator_id": user_id,
        "creator_name": user.get("full_name") or current_user.get("full_name", ""),
        "creator_avatar": user.get("avatar", ""),
        "views": 0, "likes": 0, "saves": 0, "comments_count": 0,
        "is_featured": False, "is_verified": False,
        "created_at": now, "updated_at": now,
        "published_at": now if payload.is_published else None,
    }
    result = await projects_collection.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/user/mine")
async def get_my_projects(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    # Match both string and int versions of user_id
    cursor = projects_collection.find({
        "$or": [{"creator_id": str(user_id)}, {"creator_id": user_id}]
    }).sort("created_at", -1)
    projects = await cursor.to_list(100)
    return [_sid(p) for p in projects]


@router.put("/{project_id}")
async def update_project(project_id: str, payload: ProjectCreate, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(404, "Not found")
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(404, "Not found")
    if project["creator_id"] != str(current_user.get("user_id")) and current_user.get("role") != "admin":
        raise HTTPException(403, "Access denied")
    update = {**payload.model_dump(), "updated_at": datetime.now(timezone.utc)}
    if payload.is_published and not project.get("published_at"):
        update["published_at"] = datetime.now(timezone.utc)
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$set": update})
    return {"success": True}


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(404, "Not found")
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(404, "Not found")
    if project["creator_id"] != str(current_user.get("user_id")) and current_user.get("role") != "admin":
        raise HTTPException(403, "Access denied")
    await projects_collection.delete_one({"_id": ObjectId(project_id)})
    await project_likes_collection.delete_many({"project_id": project_id})
    await project_saves_collection.delete_many({"project_id": project_id})
    await project_comments_collection.delete_many({"project_id": project_id})


@router.post("/{project_id}/like")
async def toggle_like(project_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    existing = await project_likes_collection.find_one({"project_id": project_id, "user_id": user_id})
    if existing:
        await project_likes_collection.delete_one({"_id": existing["_id"]})
        await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"likes": -1}})
        return {"liked": False}
    await project_likes_collection.insert_one({"project_id": project_id, "user_id": user_id, "created_at": datetime.now(timezone.utc)})
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"likes": 1}})
    return {"liked": True}


@router.post("/{project_id}/save")
async def toggle_save(project_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    existing = await project_saves_collection.find_one({"project_id": project_id, "user_id": user_id})
    if existing:
        await project_saves_collection.delete_one({"_id": existing["_id"]})
        await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"saves": -1}})
        return {"saved": False}
    await project_saves_collection.insert_one({"project_id": project_id, "user_id": user_id, "created_at": datetime.now(timezone.utc)})
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"saves": 1}})
    return {"saved": True}


@router.post("/{project_id}/comment", status_code=201)
async def add_comment(project_id: str, payload: CommentCreate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    user = await users_collection.find_one({"$or": [{"id": current_user.get("user_id")}, {"_id": current_user.get("user_id")}]}) or {}
    doc = {
        "project_id": project_id, "user_id": user_id,
        "user_name": user.get("full_name", "User"),
        "user_avatar": user.get("avatar", ""),
        "comment": payload.comment,
        "parent_id": payload.parent_id,
        "likes": 0,
        "created_at": datetime.now(timezone.utc),
    }
    result = await project_comments_collection.insert_one(doc)
    await projects_collection.update_one({"_id": ObjectId(project_id)}, {"$inc": {"comments_count": 1}})
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@router.get("/user/saved")
async def get_saved_projects(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user.get("user_id"))
    saves = await project_saves_collection.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    ids = [ObjectId(s["project_id"]) for s in saves if ObjectId.is_valid(s.get("project_id", ""))]
    projects = await projects_collection.find({"_id": {"$in": ids}}).to_list(100)
    return [_sid(p) for p in projects]
