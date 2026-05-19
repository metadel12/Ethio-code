from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_db
from app.core.auth import get_current_user
from app.schemas.payment import PaymentProcess, PaymentResponse
from app.schemas.template_purchase import TemplateDownloadResponse, TemplatePurchaseResponse

router = APIRouter()

PLATFORM_FEE_PERCENT = 15.0


def calculate_earnings(amount: float) -> tuple:
    platform_fee = round(amount * (PLATFORM_FEE_PERCENT / 100), 2)
    creator_earning = round(amount - platform_fee, 2)
    return platform_fee, creator_earning


# NOTE: These endpoints are temporarily disabled during MongoDB migration
# They were using SQLAlchemy models that have been removed
# TODO: Reimplement these endpoints using MongoDB collections

# @router.post("/templates/{template_id}/purchase", response_model=PaymentResponse)
# async def purchase_template(...):
#     # TODO: Implement with MongoDB
#     pass

# @router.get("/templates/{template_id}/download", response_model=TemplateDownloadResponse)
# async def download_template(...):
#     # TODO: Implement with MongoDB
#     pass

# @router.get("/my/purchases", response_model=list[TemplatePurchaseResponse])
# async def list_my_purchases(...):
#     # TODO: Implement with MongoDB
#     pass


@router.post("/mock/process")
def mock_payment_process(
    amount: float = 100.0,
    method: str = "credit_card",
):
    """Mock payment processing endpoint for testing"""
    platform_fee, creator_earning = calculate_earnings(amount)
    return {
        "status": "success",
        "amount": amount,
        "platform_fee": platform_fee,
        "creator_earning": creator_earning,
        "transaction_id": f"mock_txn_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "message": "This is a mock payment endpoint. Real payment endpoints are being migrated to MongoDB."
    }
