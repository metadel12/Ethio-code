"""User model for MongoDB."""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class User(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    password_hash: str = Field(...)
    role: str = Field(default="user", regex="^(user|admin|company)$")
    experience_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced)$")
    how_heard: Optional[str] = Field(None, max_length=100)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    email_verified_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = None
    two_factor_enabled: bool = Field(default=False)
    two_factor_secret: Optional[str] = None
    backup_codes: List[str] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('email')
    @classmethod
    def lowercase_email(cls, v):
        return v.lower().strip()

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    )

    def to_mongo_dict(self):
        data = self.model_dump(by_alias=True, exclude_unset=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

    @classmethod
    def from_mongo(cls, data: dict):
        if not data:
            return None
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)
