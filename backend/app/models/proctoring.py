from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class QuestionModel(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    text: str
    type: str  # "multiple_choice", "coding", "essay"
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    points: int = 10
    code_language: Optional[str] = None
    initial_code: Optional[str] = None


class ProctoringRules(BaseModel):
    require_webcam: bool = True
    require_screen_sharing: bool = True
    require_microphone: bool = True
    allow_tab_switching: bool = False
    allow_copy_paste: bool = False
    max_violations_allowed: int = 3
    auto_submit_on_violation: bool = True
    notify_on_flag: bool = True


class AISettings(BaseModel):
    face_detection_enabled: bool = True
    multiple_faces_detection: bool = True
    object_detection_enabled: bool = True
    eye_tracking_enabled: bool = False
    audio_monitoring_enabled: bool = True
    sensitivity_level: str = "medium"  # "low", "medium", "high"


class FlagModel(BaseModel):
    type: str
    severity: str  # "low", "medium", "high"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: str = ""
    screenshot_url: Optional[str] = None
    video_clip_url: Optional[str] = None


class AnswerModel(BaseModel):
    question_id: str
    answer: Optional[str] = None
    code: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    time_taken_seconds: Optional[int] = None
