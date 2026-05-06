"""GDPR: data export, deletion, consent management."""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import io
from pydantic import BaseModel
from app.core.auth import get_current_user
from app.database_mongo import (
    users_collection, applications_collection,
    user_courses_collection, user_challenges_collection,
    user_projects_collection, saved_jobs_collection,
)

router = APIRouter()

_consents: dict = {}  # user_id -> consent record


class ConsentUpdate(BaseModel):
    analytics: bool = False
    marketing: bool = False
    third_party: bool = False


@router.get("/gdpr/consent")
async def get_consent(current_user: dict = Depends(get_current_user)):
    uid = str(current_user.get("user_id"))
    return _consents.get(uid, {"analytics": False, "marketing": False, "third_party": False, "updated_at": None})


@router.post("/gdpr/consent")
async def update_consent(body: ConsentUpdate, current_user: dict = Depends(get_current_user)):
    uid = str(current_user.get("user_id"))
    _consents[uid] = {**body.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
    return _consents[uid]


@router.get("/gdpr/export")
async def export_my_data(current_user: dict = Depends(get_current_user)):
    uid = str(current_user.get("user_id"))
    user_id_int = current_user.get("user_id")

    user = await users_collection.find_one({"id": user_id_int}, {"hashed_password": 0, "two_factor_secret": 0, "backup_codes": 0}) or {}
    user.pop("_id", None)

    def _clean(docs):
        for d in docs:
            d.pop("_id", None)
            for k, v in d.items():
                if isinstance(v, datetime):
                    d[k] = v.isoformat()
        return docs

    applications = _clean(await applications_collection.find({"user_id": uid}).to_list(500))
    courses      = _clean(await user_courses_collection.find({"user_id": uid}).to_list(500))
    challenges   = _clean(await user_challenges_collection.find({"user_id": uid}).to_list(500))
    projects     = _clean(await user_projects_collection.find({"user_id": uid}).to_list(500))
    saved_jobs   = _clean(await saved_jobs_collection.find({"user_id": uid}).to_list(500))

    export = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "profile": {k: str(v) if isinstance(v, datetime) else v for k, v in user.items()},
        "applications": applications,
        "courses": courses,
        "challenges": challenges,
        "projects": projects,
        "saved_jobs": saved_jobs,
        "consents": _consents.get(uid, {}),
    }

    buf = io.StringIO(json.dumps(export, indent=2, default=str))
    return StreamingResponse(
        buf,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="my_data_{uid}.json"'},
    )


@router.delete("/gdpr/delete-account", status_code=204)
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    uid = str(current_user.get("user_id"))
    user_id_int = current_user.get("user_id")
    await users_collection.delete_one({"id": user_id_int})
    await applications_collection.delete_many({"user_id": uid})
    await user_courses_collection.delete_many({"user_id": uid})
    await user_challenges_collection.delete_many({"user_id": uid})
    await user_projects_collection.delete_many({"user_id": uid})
    await saved_jobs_collection.delete_many({"user_id": uid})
    _consents.pop(uid, None)
