"""Password reset token model."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class PasswordResetToken(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(...)
    token: str = Field(..., min_length=32)
    expires_at: datetime = Field(...)
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

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
