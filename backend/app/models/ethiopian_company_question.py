from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class EthiopianCompanyQuestion(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    company_id: str
    company_name: str
    position: str
    question_text: str
    answer_text: str
    difficulty_rating: int
    asked_date: datetime
    submitted_by: str
    verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True