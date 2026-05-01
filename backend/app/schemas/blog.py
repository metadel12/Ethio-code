from pydantic import BaseModel


class BlogPostCreate(BaseModel):
    title: str
    body: str
