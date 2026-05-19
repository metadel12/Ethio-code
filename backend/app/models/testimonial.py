from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class Testimonial(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=100)
    company: str = Field(..., min_length=1, max_length=200)
    quote: str = Field(..., min_length=10, max_length=1000)
    salary_increase: Optional[str] = Field(None, max_length=50)
    location: str = Field(..., min_length=1, max_length=100)
    avatar: Optional[str] = Field(None, max_length=500)
    featured: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('salary_increase')
    @classmethod
    def validate_salary_increase(cls, v):
        if v is not None:
            if not any(char.isdigit() for char in v):
                raise ValueError('Salary increase must contain a number')
        return v

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda v: v.isoformat() if v else None},
        json_schema_extra={
            "example": {
                "name": "Alemayehu Tesfaye",
                "role": "Software Engineer",
                "company": "EthioTech Solutions",
                "quote": "EthioCode helped me land my dream job with a 100% salary increase!",
                "salary_increase": "100%",
                "location": "Addis Ababa, Ethiopia",
                "avatar": "https://example.com/avatar.jpg",
                "featured": True,
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