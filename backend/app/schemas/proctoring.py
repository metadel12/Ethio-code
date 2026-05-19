from pydantic import BaseModel


class ProctoringFlagCreate(BaseModel):
    reason: str
