from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TemplateBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10, max_length=5000)
    category: str
    tags: Optional[list[str]] = None
    price: float = Field(default=0.0, ge=0)
    version: Optional[str] = "1.0.0"


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    price: Optional[float] = Field(None, ge=0)
    version: Optional[str] = None
    is_active: Optional[bool] = None


class TemplateResponse(TemplateBase):
    id: int
    preview_url: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    status: str
    is_featured: bool
    is_active: bool
    download_count: int
    view_count: int
    rating_average: float
    rating_count: int
    creator_id: int
    creator_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TemplateDetailResponse(TemplateResponse):
    pass


class TemplateListResponse(BaseModel):
    items: list[TemplateResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class TemplateSearchFilters(BaseModel):
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    tags: Optional[list[str]] = None
    is_featured: Optional[bool] = None
    creator_id: Optional[int] = None
    status: Optional[str] = None


class TemplateSortOptions(BaseModel):
    sort_by: str = "created_at"
    sort_order: str = "desc"