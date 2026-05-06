from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    plan: str


class PaymentProcess(BaseModel):
    template_id: int
    payment_method: str = Field(..., pattern="^(credit_card|paypal|stripe|telebirr|cbebirr)$")
    card_token: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    template_id: int
    user_id: int
    amount: float
    currency: str = "ETB"
    payment_status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PlatformFeeConfig(BaseModel):
    platform_fee_percent: float = 15.0
    minimum_earning: float = 50.0