"""Global search: full-text, faceted, autocomplete."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.core.auth import get_current_user
from app.database_mongo import (
    jobs_collection, blogs_collection,
    templates_collection, users_collection,
)

router = APIRouter()


@router.get("/search")
async def global_search(
    q: str = Query(..., min_length=1),
    type: Optional[str] = Query(None),   # jobs | blogs | templates | users
    limit: int = Query(10, le=50),
    current_user: dict = Depends(get_current_user),
):
    results = []
    regex = {"$regex": q, "$options": "i"}

    async def _search(collection, filter_, projection, label, fields):
        docs = await collection.find({**filter_}, projection).limit(limit).to_list(limit)
        for d in docs:
            results.append({
                "type": label,
                "id": str(d.get("_id", d.get("id", ""))),
                **{k: d.get(k, "") for k in fields},
            })

    if not type or type == "jobs":
        await _search(jobs_collection,
            {"is_active": True, "$or": [{"title": regex}, {"company_name": regex}, {"skills_required": regex}]},
            {"title": 1, "company_name": 1, "location": 1, "job_type": 1},
            "job", ["title", "company_name", "location", "job_type"])

    if not type or type == "blogs":
        await _search(blogs_collection,
            {"$or": [{"title": regex}, {"content": regex}, {"tags": regex}]},
            {"title": 1, "slug": 1, "category": 1},
            "blog", ["title", "slug", "category"])

    if not type or type == "templates":
        await _search(templates_collection,
            {"is_active": True, "status": "approved", "$or": [{"title": regex}, {"tags": regex}]},
            {"title": 1, "category": 1, "price": 1},
            "template", ["title", "category", "price"])

    return {"query": q, "results": results[:limit], "total": len(results)}


@router.get("/search/autocomplete")
async def autocomplete(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user),
):
    regex = {"$regex": f"^{q}", "$options": "i"}
    suggestions = []

    jobs = await jobs_collection.find({"title": regex, "is_active": True}, {"title": 1}).limit(5).to_list(5)
    suggestions += [{"label": j["title"], "type": "job"} for j in jobs]

    templates = await templates_collection.find({"title": regex, "is_active": True}, {"title": 1}).limit(3).to_list(3)
    suggestions += [{"label": t["title"], "type": "template"} for t in templates]

    static = ["JavaScript", "Python", "React", "Node.js", "MongoDB", "Docker", "AWS", "TypeScript"]
    suggestions += [{"label": s, "type": "skill"} for s in static if s.lower().startswith(q.lower())]

    return {"suggestions": suggestions[:10]}
