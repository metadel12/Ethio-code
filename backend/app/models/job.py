from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class Job(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    company: str = Field(..., min_length=1, max_length=200)
    title: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=100)
    salary: Optional[str] = Field(None, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    link: str = Field(..., min_length=1, max_length=500)
    logo: Optional[str] = Field(None, max_length=500)
    posted_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('type')
    @classmethod
    def validate_job_type(cls, v):
        allowed_types = ['full-time', 'part-time', 'contract', 'internship', 'temporary']
        if v.lower() not in allowed_types:
            raise ValueError(f'Job type must be one of {allowed_types}')
        return v.lower()

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        },
        json_schema_extra={
            "example": {
                "company": "Tech Solutions Inc.",
                "title": "Senior Software Engineer",
                "location": "Addis Ababa, Ethiopia",
                "salary": "15000-25000 ETB",
                "type": "full-time",
                "link": "https://example.com/job/123",
                "logo": "https://example.com/logo.png",
                "posted_at": "2026-05-01T00:00:00Z",
                "is_active": True,
                "created_at": "2026-05-01T00:00:00Z"
            }
        }
    )

    def to_mongo_dict(self):
        """Convert to MongoDB-compatible dictionary"""
        data = self.model_dump(by_alias=True, exclude_unset=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

    @classmethod
    def from_mongo(cls, data: dict):
        """Create Job instance from MongoDB document"""
        if not data:
            return None
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return cls(**data)