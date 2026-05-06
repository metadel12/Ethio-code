from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.auth import get_current_user
from app.models.template import (
    CreatorEarning,
    Template,
    TemplatePurchase,
    TemplateReview,
    TemplateStatus,
)

router = APIRouter()


@router.get("/")
def analytics_summary():
    return {"users": 0, "interviews": 0}


@router.get("/marketplace")
def marketplace_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.get("role") != "admin":
        pass
    start_date = datetime.utcnow() - timedelta(days=days)
    total_templates = db.query(func.count(Template.id)).scalar()
    approved_templates = db.query(func.count(Template.id)).filter(
        Template.status == TemplateStatus.APPROVED.value
    ).scalar()
    total_purchases = db.query(func.count(TemplatePurchase.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(TemplatePurchase.amount), 0)).scalar()
    platform_revenue = db.query(func.coalesce(func.sum(TemplatePurchase.platform_fee), 0)).scalar()
    recent_purchases = db.query(func.count(TemplatePurchase.id)).filter(
        TemplatePurchase.purchased_at >= start_date
    ).scalar()
    recent_revenue = db.query(func.coalesce(func.sum(TemplatePurchase.amount), 0)).filter(
        TemplatePurchase.purchased_at >= start_date
    ).scalar()
    avg_rating = db.query(func.coalesce(func.avg(TemplateReview.rating), 0)).scalar()
    return {
        "total_templates": total_templates,
        "approved_templates": approved_templates,
        "total_purchases": total_purchases,
        "total_revenue": round(total_revenue, 2),
        "platform_revenue": round(platform_revenue, 2),
        "recent_purchases": recent_purchases,
        "recent_revenue": round(recent_revenue, 2),
        "average_rating": round(avg_rating, 2),
    }


@router.get("/creator/stats")
def creator_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_earnings = db.query(func.coalesce(func.sum(CreatorEarning.amount), 0)).filter(
        CreatorEarning.creator_id == current_user["user_id"]
    ).scalar()
    pending_earnings = db.query(func.coalesce(func.sum(CreatorEarning.amount), 0)).filter(
        CreatorEarning.creator_id == current_user["user_id"],
        CreatorEarning.status == "pending"
    ).scalar()
    paid_earnings = db.query(func.coalesce(func.sum(CreatorEarning.amount), 0)).filter(
        CreatorEarning.creator_id == current_user["user_id"],
        CreatorEarning.status == "paid"
    ).scalar()
    total_purchases = db.query(func.count(TemplatePurchase.id)).join(Template).filter(
        Template.creator_id == current_user["user_id"]
    ).scalar()
    return {
        "total_earnings": round(total_earnings, 2),
        "pending_earnings": round(pending_earnings, 2),
        "paid_earnings": round(paid_earnings, 2),
        "total_purchases": total_purchases,
    }


@router.get("/top-templates")
def top_templates(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    templates = db.query(Template).filter(
        Template.status == TemplateStatus.APPROVED.value,
        Template.download_count > 0
    ).order_by(Template.download_count.desc()).limit(limit).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "category": t.category,
            "price": t.price,
            "download_count": t.download_count,
            "rating_average": t.rating_average,
        }
        for t in templates
    ]
