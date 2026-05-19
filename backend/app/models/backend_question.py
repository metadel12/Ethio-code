from pydantic import BaseModel, Field, GetJsonSchemaHandler, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
from bson import ObjectId
from pydantic.json_schema import JsonSchemaValue

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: Any, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema)
        json_schema = handler.resolve_ref_schema(json_schema)
        json_schema.update(type="string")
        return json_schema

class TestCase(BaseModel):
    input: str
    expected_output: str
    description: str = ""
    is_hidden: bool = False

class BackendQuestion(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    category: str
    subcategory: str
    difficulty: str
    question_type: str
    question_text: str
    question_text_am: Optional[str] = ""
    answer_text: str
    answer_text_am: Optional[str] = ""
    sample_solution: Optional[str] = ""
    sample_solution_code: Optional[str] = ""
    initial_code: Optional[str] = ""
    language: Optional[str] = "python"
    test_cases: List[TestCase] = []
    hints: List[str] = []
    time_limit_seconds: int = 300
    points: int = 10
    tags: List[str] = []
    companies_asked: List[str] = []
    total_attempts: int = 0
    correct_attempts: int = 0
    success_rate: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )