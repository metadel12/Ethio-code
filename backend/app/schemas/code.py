from pydantic import BaseModel


class CodeRunRequest(BaseModel):
    language: str
    source: str
