from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class Constraint(BaseModel):
    name: str
    value: str

class ExpectedComponent(BaseModel):
    name: str
    purpose: str
    technologies: List[str]

class SystemDesignScenario(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    title: str
    title_am: Optional[str] = ""
    description: str
    requirements: List[str] = []
    constraints: List[Constraint] = []
    expected_components: List[ExpectedComponent] = []
    sample_solution_url: Optional[str] = ""
    diagram_url: Optional[str] = ""
    difficulty: str
    estimated_time_minutes: int
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True