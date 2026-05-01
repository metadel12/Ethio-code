from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class Blog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    excerpt: str = Field(..., min_length=1, max_length=500)
    category: str = Field(..., min_length=1, max_length=100)
    author: str = Field(..., min_length=1, max_length=100)
    read_time: int = Field(..., ge=1, le=300)
    image: Optional[str] = Field(None, max_length=500)
    published_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v):
        import re
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Slug must contain only lowercase letters, numbers, and hyphens')
        return v

    @field_validator('read_time')
    @classmethod
    def validate_read_time(cls, v):
        if v < 1:
            raise ValueError('Read time must be at least 1 minute')
        return v

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda v: v.isoformat() if v else None},
        json_schema_extra={
            "example": {
                "title": "How to Learn Python in 30 Days",
                "slug": "how-to-learn-python-in-30-days",
                "excerpt": "A comprehensive guide to mastering Python programming in just one month.",
                "category": "Programming",
                "author": "John Doe",
                "read_time": 15,
                "image": "https://example.com/blog-image.jpg",
                "published_at": "2026-05-01T00:00:00Z",
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