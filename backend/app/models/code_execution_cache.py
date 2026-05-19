from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class CodeExecutionCache(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    code_hash: str
    language: str
    output: str
    execution_time_ms: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True