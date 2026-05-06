from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TemplatePurchaseBase(BaseModel):
    template_id: int
    payment_method: Optional[str] = None


class TemplatePurchaseCreate(TemplatePurchaseBase):
    pass


class TemplatePurchaseResponse(BaseModel):
    id: int
    template_id: int
    template_title: Optional[str] = None
    user_id: int
    amount: float
    platform_fee: float
    creator_earning: float
    payment_status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    purchased_at: datetime
    download_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TemplateSavedBase(BaseModel):
    template_id: int


class TemplateSavedResponse(BaseModel):
    id: int
    template_id: int
    template: Optional[dict] = None
    saved_at: datetime

    class Config:
        from_attributes = True


class CreatorEarningResponse(BaseModel):
    id: int
    template_id: Optional[int] = None
    template_title: Optional[str] = None
    purchase_id: Optional[int] = None
    amount: float
    platform_fee: float
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CreatorDashboardStats(BaseModel):
    total_templates: int
    total_purchases: int
    total_earnings: float
    pending_earnings: float
    rating_average: float
    rating_count: int


class TemplateDownloadResponse(BaseModel):
    download_url: str
    file_name: str
    file_size: int