"""Login history model for audit and security."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class LoginHistory(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str = Field(...)
    success: bool = Field(...)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None
    failure_reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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
