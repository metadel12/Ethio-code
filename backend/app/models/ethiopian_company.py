from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class EthiopianCompany(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    industry: str
    website: str
    interview_process: str
    average_salary_range: str
    common_questions: List[str] = []
    tips: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
