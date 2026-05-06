from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class Newsletter(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('email')
    @classmethod
    def validate_email_domain(cls, v):
        return v.lower()

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda v: v.isoformat() if v else None},
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "subscribed_at": "2026-05-01T00:00:00Z"
            }
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