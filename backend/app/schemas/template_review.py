from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TemplateReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)


class TemplateReviewCreate(TemplateReviewBase):
    pass


class TemplateReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)


class TemplateReviewResponse(TemplateReviewBase):
    id: int
    template_id: int
    user_id: int
    user_name: Optional[str] = None
    is_verified_purchase: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TemplateRatingStats(BaseModel):
    average_rating: float
    rating_count: int
    distribution: dict[str, int]  # 1-5 star counts