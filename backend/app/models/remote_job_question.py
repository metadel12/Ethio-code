from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class RemoteJobQuestion(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    company_name: str
    question_text: str
    answer_text: str
    tips: List[str] = []
    salary_range_usd: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
