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

class QuizScore(BaseModel):
    quiz_id: PyObjectId
    score: float
    attempted_at: datetime

class UserCourse(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    course_id: PyObjectId
    enrollment_date: datetime = Field(default_factory=datetime.utcnow)
    completion_date: Optional[datetime] = None
    progress_percentage: float = 0
    time_spent: int = 0
    last_accessed: Optional[datetime] = None
    status: str = "not_started"
    certificate_url: Optional[str] = None
    quiz_scores: List[QuizScore] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TestResults(BaseModel):
    passed: int = 0
    failed: int = 0
    total: int = 0

class UserChallenge(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    challenge_id: PyObjectId
    status: str = "started"
    code: Optional[str] = None
    language: Optional[str] = None
    test_results: Optional[TestResults] = None
    score: float = 0
    time_taken: int = 0
    attempts: int = 0
    hints_used: int = 0
    submitted_at: Optional[datetime] = None
    feedback: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserProject(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    title: str
    description: Optional[str] = None
    technologies: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    screenshots: List[str] = []
    status: str = "planning"
    progress: int = 0
    start_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    team_members: List[PyObjectId] = []
    is_featured: bool = False

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
