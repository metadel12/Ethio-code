from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class JobLocation(BaseModel):
    type: str = "onsite"
    city: Optional[str] = None
    country: Optional[str] = None
    remote_allowed_countries: List[str] = []

class Salary(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    currency: str = "ETB"
    period: str = "month"

class Job(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    company_id: PyObjectId
    title: str
    description: str
    requirements: List[str] = []
    responsibilities: List[str] = []
    benefits: List[str] = []
    location: JobLocation = JobLocation()
    salary: Optional[Salary] = None
    employment_type: str = "full-time"
    experience_level: str = "mid"
    skills_required: List[str] = []
    education_required: Optional[str] = None
    application_deadline: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False
    views: int = 0
    applications_count: int = 0
    posted_date: datetime = Field(default_factory=datetime.utcnow)
    updated_date: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ApplicationAnswer(BaseModel):
    question: str
    answer: str

class StatusHistory(BaseModel):
    status: str
    note: Optional[str] = None
    changed_by: PyObjectId
    changed_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewSchedule(BaseModel):
    date: datetime
    type: str = "video"
    link: Optional[str] = None
    notes: Optional[str] = None

class OfferDetails(BaseModel):
    salary: Optional[float] = None
    start_date: Optional[datetime] = None
    benefits: List[str] = []
    accepted: Optional[bool] = None
    accepted_at: Optional[datetime] = None

class JobApplication(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_id: PyObjectId
    user_id: PyObjectId
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    answers: List[ApplicationAnswer] = []
    status: str = "submitted"
    status_history: List[StatusHistory] = []
    interview_scheduled: Optional[InterviewSchedule] = None
    offer_details: Optional[OfferDetails] = None
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
