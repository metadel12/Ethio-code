from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime, date, time as time_type


class Event(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str = Field(..., min_length=1, max_length=200)
    event_date: date = Field(..., alias="date")
    event_time: time_type = Field(..., alias="time")
    location: str = Field(..., min_length=1, max_length=200)
    speaker: str = Field(..., min_length=1, max_length=200)
    link: Optional[str] = Field(None, max_length=500)
    is_virtual: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('event_date')
    @classmethod
    def validate_date(cls, v):
        return v

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None,
            time_type: lambda v: v.isoformat() if v else None
        },
        json_schema_extra={
            "example": {
                "title": "Ethiopian Tech Conference 2026",
                "date": "2026-06-15",
                "time": "09:00:00",
                "location": "Addis Ababa, Ethiopia",
                "speaker": "Dr. Abebe Kebede",
                "link": "https://example.com/event/123",
                "is_virtual": False,
                "created_at": "2026-05-01T00:00:00Z"
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