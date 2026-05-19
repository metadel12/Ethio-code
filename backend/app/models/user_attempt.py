from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class TestResult(BaseModel):
    test_case: str
    passed: bool
    expected: str
    actual: str

class UserBackendAttempt(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    question_id: str
    user_answer: str
    user_code: str
    code_output: str
    test_results: List[TestResult] = []
    recording_url: Optional[str] = ""
    time_taken_seconds: int
    ai_score: Optional[int] = 0
    ai_feedback: str = ""
    ai_strengths: List[str] = []
    ai_improvements: List[str] = []
    is_correct: bool
    points_earned: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True