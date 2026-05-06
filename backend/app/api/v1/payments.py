from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.auth import get_current_user
from app.models.template import (
    CreatorEarning,
    Template,
    TemplatePurchase,
    TemplateStatus,
)
from app.models.user import User
from app.schemas.payment import PaymentProcess, PaymentResponse
from app.schemas.template_purchase import TemplateDownloadResponse, TemplatePurchaseResponse

router = APIRouter()

PLATFORM_FEE_PERCENT = 15.0


def calculate_earnings(amount: float) -> tuple:
    platform_fee = round(amount * (PLATFORM_FEE_PERCENT / 100), 2)
    creator_earning = round(amount - platform_fee, 2)
    return platform_fee, creator_earning


@router.post("/templates/{template_id}/purchase", response_model=PaymentResponse)
def purchase_template(
    template_id: int,
    payload: PaymentProcess,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    if template.status != TemplateStatus.APPROVED.value:
        raise HTTPException(status_code=400, detail="Template is not available for purchase")
    if not template.file_url:
        raise HTTPException(status_code=400, detail="Template file not available")
    existing_purchase = db.query(TemplatePurchase).filter(
        TemplatePurchase.template_id == template_id,
        TemplatePurchase.user_id == current_user["user_id"],
        TemplatePurchase.payment_status == "completed"
    ).first()
    if existing_purchase:
        raise HTTPException(status_code=400, detail="You have already purchased this template")
    amount = template.price
    platform_fee, creator_earning = calculate_earnings(amount)
    transaction_id = f"txn_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{template_id}"
    purchase = TemplatePurchase(
        template_id=template_id,
        user_id=current_user["user_id"],
        amount=amount,
        platform_fee=platform_fee,
        creator_earning=creator_earning,
        payment_status="completed",
        payment_method=payload.payment_method,
        transaction_id=transaction_id,
    )
    db.add(purchase)
    template.download_count += 1
    earning = CreatorEarning(
        creator_id=template.creator_id,
        template_id=template_id,
        purchase_id=purchase.id,
        amount=creator_earning,
        platform_fee=platform_fee,
        status="pending",
    )
    db.add(earning)
    db.commit()
    db.refresh(purchase)
    return PaymentResponse(
        id=purchase.id,
        template_id=purchase.template_id,
        user_id=purchase.user_id,
        amount=purchase.amount,
        currency="ETB",
        payment_status=purchase.payment_status,
        payment_method=purchase.payment_method,
        transaction_id=purchase.transaction_id,
        created_at=purchase.purchased_at,
    )


@router.get("/templates/{template_id}/download", response_model=TemplateDownloadResponse)
def download_template(
    template_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    purchase = db.query(TemplatePurchase).filter(
        TemplatePurchase.template_id == template_id,
        TemplatePurchase.user_id == current_user["user_id"],
        TemplatePurchase.payment_status == "completed"
    ).first()
    if not purchase and template.price > 0:
        raise HTTPException(status_code=403, detail="You must purchase this template first")
    if not template.file_url:
        raise HTTPException(status_code=404, detail="Template file not available")
    purchase.download_at = datetime.utcnow()
    db.commit()
    return TemplateDownloadResponse(
        download_url=template.file_url,
        file_name=f"{template.title}.{template.file_type or 'zip'}",
        file_size=template.file_size or 0,
    )


@router.get("/my/purchases", response_model=list[TemplatePurchaseResponse])
def list_my_purchases(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    purchases = db.query(TemplatePurchase).filter(
        TemplatePurchase.user_id == current_user["user_id"]
    ).order_by(TemplatePurchase.purchased_at.desc()).all()
    result = []
    for p in purchases:
        template = db.query(Template).filter(Template.id == p.template_id).first()
        result.append(TemplatePurchaseResponse(
            id=p.id,
            template_id=p.template_id,
            template_title=template.title if template else None,
            user_id=p.user_id,
            amount=p.amount,
            platform_fee=p.platform_fee,
            creator_earning=p.creator_earning,
            payment_status=p.payment_status,
            payment_method=p.payment_method,
            transaction_id=p.transaction_id,
            purchased_at=p.purchased_at,
            download_at=p.download_at,
        ))
    return result


@router.get("/admin/pending-purchases", response_model=list[dict])
def list_pending_purchases(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    purchases = db.query(TemplatePurchase).filter(
        TemplatePurchase.payment_status == "pending"
    ).all()
    return purchases


@router.post("/admin/purchases/{purchase_id}/approve")
def approve_purchase(
    purchase_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    purchase = db.query(TemplatePurchase).filter(TemplatePurchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    purchase.payment_status = "completed"
    db.commit()
    return {"status": "approved"}


@router.post("/admin/purchases/{purchase_id}/reject")
def reject_purchase(
    purchase_id: int,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    purchase = db.query(TemplatePurchase).filter(TemplatePurchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    purchase.payment_status = "rejected"
    db.commit()
    return {"status": "rejected"}


@router.get("/analytics/earnings", response_model=dict)
def earnings_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(
        func.coalesce(func.sum(CreatorEarning.amount), 0).label("total_earnings"),
        func.coalesce(func.sum(CreatorEarning.amount).filter(CreatorEarning.status == "pending"), 0).label("pending_earnings"),
        func.coalesce(func.sum(CreatorEarning.amount).filter(CreatorEarning.status == "paid"), 0).label("paid_earnings"),
        func.count(CreatorEarning.id).label("total_transactions"),
    )
    result = query.first()
    return {
        "total_earnings": round(result.total_earnings, 2),
        "pending_earnings": round(result.pending_earnings, 2),
        "paid_earnings": round(result.paid_earnings, 2),
        "total_transactions": result.total_transactions,
    }


@router.post("/mock/process")
def mock_payment_process(
    amount: float = 100.0,
    method: str = "credit_card",
):
    platform_fee, creator_earning = calculate_earnings(amount)
    return {
        "status": "success",
        "amount": amount,
        "platform_fee": platform_fee,
        "creator_earning": creator_earning,
        "transaction_id": f"mock_txn_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    }
