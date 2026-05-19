from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.proctoring import QuestionModel, ProctoringRules, AISettings


class ProctoringTestCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    duration_minutes: int = 60
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    questions: List[QuestionModel] = []
    proctoring_rules: ProctoringRules = ProctoringRules()
    ai_settings: AISettings = AISettings()


class ProctoringTestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    questions: Optional[List[QuestionModel]] = None
    proctoring_rules: Optional[ProctoringRules] = None
    ai_settings: Optional[AISettings] = None
    status: Optional[str] = None


class FlagReport(BaseModel):
    type: str
    details: Optional[str] = ""
    screenshot_url: Optional[str] = None


class AnswerSubmit(BaseModel):
    answer: Optional[str] = None
    code: Optional[str] = None
    time_taken: Optional[int] = None
