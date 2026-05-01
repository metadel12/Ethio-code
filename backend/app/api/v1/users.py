from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.core.auth import get_current_user
from app.database_mongo import users_collection

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    experience_level: Optional[str] = Field(
        default=None,
        pattern="^(beginner|intermediate|advanced)$",
    )
    how_heard: Optional[str] = Field(default=None, max_length=100)


def _serialize_user(user: dict) -> dict:
    return {
        "id": str(user.get("id") or user.get("_id")),
        "name": user.get("full_name") or user.get("name"),
        "full_name": user.get("full_name") or user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "role": user.get("role", "Member"),
        "experience_level": user.get("experience_level"),
        "how_heard": user.get("how_heard"),
        "is_verified": user.get("is_verified", False),
        "created_at": user.get("created_at").isoformat()
        if hasattr(user.get("created_at"), "isoformat")
        else user.get("created_at"),
        "updated_at": user.get("updated_at").isoformat()
        if hasattr(user.get("updated_at"), "isoformat")
        else user.get("updated_at"),
    }


async def _get_user_from_token(current_user: dict) -> dict:
    email = current_user.get("sub")
    user_id = current_user.get("user_id")
    query = {"email": email} if email else {"id": user_id}
    user = await users_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user = await _get_user_from_token(current_user)
    return _serialize_user(user)


@router.put("/me")
async def update_current_user_profile(
    updates: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    user = await _get_user_from_token(current_user)
    update_data = updates.model_dump(exclude_unset=True, exclude_none=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided",
        )

    if "email" in update_data:
        update_data["email"] = str(update_data["email"]).lower()

    update_data["updated_at"] = datetime.now(timezone.utc)
    await users_collection.update_one({"_id": user["_id"]}, {"$set": update_data})
    updated_user = await users_collection.find_one({"_id": user["_id"]})
    return _serialize_user(updated_user)
