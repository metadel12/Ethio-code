from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from pymongo import DESCENDING
from pymongo.errors import DuplicateKeyError

from app.core.auth import get_current_user
from app.database_mongo import (
    template_reviews_collection,
    template_saved_collection,
    template_purchases_collection,
    templates_collection,
)
from app.schemas.template import TemplateCreate, TemplateListResponse, TemplateResponse, TemplateUpdate
from app.schemas.template_review import TemplateReviewCreate, TemplateReviewResponse

router = APIRouter()


class TemplateActionPayload(BaseModel):
    reason: str | None = None


def _clean_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if not document:
        return None
    return {k: v for k, v in document.items() if k != "_id"}


def _clean_documents(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [_clean_document(document) for document in documents if document]


async def _next_template_id() -> int:
    last = await templates_collection.find_one({}, sort=[("id", -1)])
    return int(last["id"]) + 1 if last else 1


async def _next_review_id() -> int:
    last = await template_reviews_collection.find_one({}, sort=[("id", -1)])
    return int(last["id"]) + 1 if last else 1


async def _update_template_rating(template_id: int) -> None:
    reviews = await template_reviews_collection.find({"template_id": template_id}).to_list(None)
    review_count = len(reviews)
    if review_count == 0:
        await templates_collection.update_one(
            {"id": template_id},
            {"$set": {"rating_average": 0.0, "rating_count": 0}},
        )
        return

    total_rating = sum(review["rating"] for review in reviews)
    average_rating = total_rating / review_count
    await templates_collection.update_one(
        {"id": template_id},
        {"$set": {"rating_average": average_rating, "rating_count": review_count}},
    )


def _build_search_filters(
    query: str | None,
    category: str | None,
    min_price: float | None,
    max_price: float | None,
    min_rating: float | None,
) -> dict[str, Any]:
    filters: dict[str, Any] = {"is_active": True, "status": "approved"}

    if query:
        filters["$or"] = [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"tags": {"$regex": query, "$options": "i"}},
        ]

    if category and category.lower() != "all":
        filters["category"] = category

    if min_price is not None or max_price is not None:
        price_filter: dict[str, Any] = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        filters["price"] = price_filter

    if min_rating is not None:
        filters["rating_average"] = {"$gte": min_rating}

    return filters


async def _find_templates(
    query: str | None,
    category: str | None,
    min_price: float | None,
    max_price: float | None,
    min_rating: float | None,
    page: int,
    per_page: int,
    sort_by: str,
    sort_order: str,
) -> dict[str, Any]:
    filters = _build_search_filters(query, category, min_price, max_price, min_rating)
    sort_options = {
        "created_at": ("created_at", DESCENDING),
        "price": ("price", 1),
        "rating": ("rating_average", DESCENDING),
        "downloads": ("download_count", DESCENDING),
    }
    sort_field, default_direction = sort_options.get(sort_by, ("created_at", DESCENDING))
    direction = DESCENDING if sort_order.lower() == "desc" else 1

    total = await templates_collection.count_documents(filters)
    skip = (page - 1) * per_page
    cursor = (
        templates_collection.find(filters)
        .sort(sort_field, direction)
        .skip(skip)
        .limit(per_page)
    )
    items = await cursor.to_list(length=per_page)

    return {
        "items": _clean_documents(items),
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.get("/", response_model=TemplateListResponse)
async def list_templates(
    q: str | None = Query(None, alias="q"),
    category: str | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    min_rating: float | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
):
    return await _find_templates(q, category, min_price, max_price, min_rating, page, per_page, sort_by, sort_order)


@router.get("/search", response_model=TemplateListResponse)
async def search_templates(
    q: str | None = Query(None, alias="q"),
    category: str | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    min_rating: float | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
):
    return await _find_templates(q, category, min_price, max_price, min_rating, page, per_page, sort_by, sort_order)


@router.get("/categories")
async def get_template_categories():
    categories = await templates_collection.distinct("category", {"is_active": True, "status": "approved"})
    return sorted(categories)


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: int):
    template = await templates_collection.find_one({"id": template_id, "is_active": True, "status": "approved"})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return _clean_document(template)


@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(payload: TemplateCreate, current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    template_id = await _next_template_id()
    template = {
        "id": template_id,
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "tags": payload.tags or [],
        "price": payload.price,
        "version": payload.version,
        "preview_url": "",
        "file_url": "",
        "file_size": 0,
        "file_type": "zip",
        "status": "draft",
        "is_featured": False,
        "is_active": True,
        "download_count": 0,
        "view_count": 0,
        "rating_average": 0.0,
        "rating_count": 0,
        "creator_id": int(current_user["user_id"]),
        "creator_name": current_user.get("full_name") or current_user.get("sub"),
        "created_at": now,
        "updated_at": now,
    }
    await templates_collection.insert_one(template)
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    payload: TemplateUpdate,
    current_user: dict = Depends(get_current_user),
):
    template = await templates_collection.find_one({"id": template_id, "creator_id": int(current_user["user_id"])})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    update_data = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if not update_data:
        return _clean_document(template)

    update_data["updated_at"] = datetime.now(timezone.utc)
    await templates_collection.update_one({"id": template_id}, {"$set": update_data})
    return _clean_document(await templates_collection.find_one({"id": template_id}))


@router.delete("/{template_id}")
async def delete_template(template_id: int, current_user: dict = Depends(get_current_user)):
    result = await templates_collection.delete_one({"id": template_id, "creator_id": int(current_user["user_id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return {"deleted": True}


@router.post("/{template_id}/submit", response_model=TemplateResponse)
async def submit_template_for_review(template_id: int, current_user: dict = Depends(get_current_user)):
    template = await templates_collection.find_one({"id": template_id, "creator_id": int(current_user["user_id"])})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    await templates_collection.update_one(
        {"id": template_id},
        {"$set": {"status": "pending_review", "updated_at": datetime.now(timezone.utc)}},
    )
    return _clean_document(await templates_collection.find_one({"id": template_id}))


@router.post("/{template_id}/upload", response_model=TemplateResponse)
async def upload_template_file(
    template_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    template = await templates_collection.find_one({"id": template_id, "creator_id": int(current_user["user_id"])})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    upload_dir = Path(__file__).resolve().parents[3] / "uploads" / "templates"
    upload_dir.mkdir(parents=True, exist_ok=True)
    extension = Path(file.filename).suffix or ".zip"
    filename = f"template_{template_id}{extension}"
    file_path = upload_dir / filename

    content = await file.read()
    file_path.write_bytes(content)

    file_url = f"/uploads/templates/{filename}"
    await templates_collection.update_one(
        {"id": template_id},
        {
            "$set": {
                "file_url": file_url,
                "preview_url": file_url,
                "file_size": len(content),
                "file_type": extension.lstrip("."),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return _clean_document(await templates_collection.find_one({"id": template_id}))


@router.get("/my/templates", response_model=list[TemplateResponse])
async def get_my_templates(current_user: dict = Depends(get_current_user)):
    templates = await templates_collection.find({"creator_id": int(current_user["user_id"])}).to_list(None)
    return _clean_documents(templates)


@router.get("/creator/dashboard")
async def get_creator_dashboard(current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["user_id"])
    templates = await templates_collection.find({"creator_id": user_id}).to_list(None)
    template_ids = [template["id"] for template in templates]

    saved_templates = []
    if template_ids:
        saved_templates = await template_saved_collection.find({"template_id": {"$in": template_ids}}).to_list(None)

    total_reviews = sum(template.get("rating_count", 0) for template in templates)
    average_rating = 0.0
    if total_reviews > 0:
        total_rating = sum(template.get("rating_average", 0.0) * template.get("rating_count", 0) for template in templates)
        average_rating = total_rating / total_reviews

    total_purchases = len(saved_templates)
    total_earnings = sum(
        next((template.get("price", 0.0) for template in templates if template["id"] == saved["template_id"]), 0.0)
        for saved in saved_templates
    )

    return {
        "total_templates": len(templates),
        "total_purchases": total_purchases,
        "total_earnings": total_earnings,
        "pending_earnings": 0.0,
        "rating_average": average_rating,
        "rating_count": total_reviews,
    }


@router.get("/admin/pending", response_model=list[TemplateResponse])
async def get_pending_templates(current_user: dict = Depends(get_current_user)):
    templates = await templates_collection.find({"status": "pending_review"}).to_list(None)
    return _clean_documents(templates)


@router.post("/{template_id}/approve", response_model=TemplateResponse)
async def approve_template(template_id: int, current_user: dict = Depends(get_current_user)):
    template = await templates_collection.find_one({"id": template_id})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    await templates_collection.update_one(
        {"id": template_id},
        {"$set": {"status": "approved", "updated_at": datetime.now(timezone.utc)}},
    )
    return _clean_document(await templates_collection.find_one({"id": template_id}))


@router.post("/{template_id}/reject", response_model=TemplateResponse)
async def reject_template(
    template_id: int,
    payload: TemplateActionPayload,
    current_user: dict = Depends(get_current_user),
):
    template = await templates_collection.find_one({"id": template_id})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    await templates_collection.update_one(
        {"id": template_id},
        {
            "$set": {
                "status": "rejected",
                "review_feedback": payload.reason,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return _clean_document(await templates_collection.find_one({"id": template_id}))


@router.get("/{template_id}/reviews", response_model=list[TemplateReviewResponse])
async def get_template_reviews(template_id: int):
    reviews = await template_reviews_collection.find({"template_id": template_id}).sort("created_at", DESCENDING).to_list(None)
    return _clean_documents(reviews)


@router.post("/{template_id}/reviews", response_model=TemplateReviewResponse)
async def create_template_review(
    template_id: int,
    payload: TemplateReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    template = await templates_collection.find_one({"id": template_id, "is_active": True})
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    review_id = await _next_review_id()
    review = {
        "id": review_id,
        "template_id": template_id,
        "user_id": int(current_user["user_id"]),
        "user_name": current_user.get("full_name") or current_user.get("sub"),
        "rating": payload.rating,
        "comment": payload.comment,
        "is_verified_purchase": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        await template_reviews_collection.insert_one(review)
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this template")

    await _update_template_rating(template_id)
    return review


@router.get("/saved/list")
async def get_saved_templates(current_user: dict = Depends(get_current_user)):
    saved = await template_saved_collection.find({"user_id": int(current_user["user_id"])}).to_list(None)
    return _clean_documents(saved)


@router.post("/{template_id}/save")
async def save_template(template_id: int, current_user: dict = Depends(get_current_user)):
    saved = {
        "user_id": int(current_user["user_id"]),
        "template_id": template_id,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await template_saved_collection.insert_one(saved)
    except DuplicateKeyError:
        return {"saved": True}
    return {"saved": True}


@router.delete("/{template_id}/save")
async def unsave_template(template_id: int, current_user: dict = Depends(get_current_user)):
    result = await template_saved_collection.delete_one(
        {"user_id": int(current_user["user_id"]), "template_id": template_id}
    )
    return {"saved": result.deleted_count > 0}


# ── Purchase ──────────────────────────────────────────────────────────────────


class PurchasePayload(BaseModel):
    payment_method: str = "chapa"  # chapa | stripe | free


@router.post("/{template_id}/purchase", status_code=201)
async def purchase_template(template_id: int, payload: PurchasePayload, current_user: dict = Depends(get_current_user)):
    template = await templates_collection.find_one({"id": template_id, "is_active": True, "status": "approved"})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    user_id = int(current_user["user_id"])
    existing = await template_purchases_collection.find_one({"user_id": user_id, "template_id": template_id, "status": "completed"})
    if existing:
        raise HTTPException(status_code=409, detail="Already purchased")

    now = datetime.now(timezone.utc)
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    doc = {
        "user_id": user_id,
        "template_id": template_id,
        "creator_id": template.get("creator_id"),
        "amount": template.get("price", 0.0),
        "payment_method": payload.payment_method,
        "transaction_id": transaction_id,
        "status": "completed",
        "purchased_at": now,
    }
    await template_purchases_collection.insert_one(doc)
    await templates_collection.update_one({"id": template_id}, {"$inc": {"download_count": 1}})
    return {"transaction_id": transaction_id, "amount": doc["amount"], "status": "completed", "template_id": template_id}


# ── Download ──────────────────────────────────────────────────────────────────

@router.get("/{template_id}/download")
async def download_template(template_id: int, current_user: dict = Depends(get_current_user)):
    template = await templates_collection.find_one({"id": template_id, "is_active": True})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    user_id = int(current_user["user_id"])
    price = template.get("price", 0.0)

    if price > 0:
        purchase = await template_purchases_collection.find_one({"user_id": user_id, "template_id": template_id, "status": "completed"})
        if not purchase:
            raise HTTPException(status_code=403, detail="Purchase required to download")

    file_url = template.get("file_url", "")
    if not file_url:
        raise HTTPException(status_code=404, detail="File not available yet")

    return {
        "download_url": file_url,
        "filename": f"{template.get('title', 'template').replace(' ', '_')}.zip",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
    }


# ── Review alias (POST /{id}/review → same as /{id}/reviews) ──────────────────

@router.post("/{template_id}/review", status_code=201)
async def post_review_alias(
    template_id: int,
    payload: "TemplateReviewCreate",
    current_user: dict = Depends(get_current_user),
):
    """Alias for POST /{id}/reviews."""
    from pymongo.errors import DuplicateKeyError as DKE
    template = await templates_collection.find_one({"id": template_id, "is_active": True})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    review_id = await _next_review_id()
    review = {
        "id": review_id,
        "template_id": template_id,
        "user_id": int(current_user["user_id"]),
        "user_name": current_user.get("full_name") or current_user.get("sub"),
        "rating": payload.rating,
        "comment": payload.comment,
        "is_verified_purchase": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    try:
        await template_reviews_collection.insert_one(review)
    except DKE:
        raise HTTPException(status_code=409, detail="Already reviewed")
    await _update_template_rating(template_id)
    return _clean_document(review)


# ── Creator routes (/api/v1/creator/*) ────────────────────────────────────────
# Registered separately in main.py under prefix /api/v1/creator

creator_router = APIRouter()


async def _creator_templates(user_id: int):
    return await templates_collection.find({"creator_id": user_id}).to_list(length=200)


async def _creator_purchases(template_ids: list):
    if not template_ids:
        return []
    return await template_purchases_collection.find(
        {"template_id": {"$in": template_ids}, "status": "completed"}
    ).sort("purchased_at", DESCENDING).to_list(length=500)


@creator_router.get("/earnings")
async def get_creator_earnings(current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["user_id"])
    templates = await _creator_templates(user_id)
    t_ids = [t["id"] for t in templates]
    purchases = await _creator_purchases(t_ids)

    total = sum(p.get("amount", 0.0) for p in purchases)
    platform_fee = round(total * 0.20, 2)  # 20% platform cut
    net = round(total - platform_fee, 2)

    now = datetime.now(timezone.utc)
    this_month = [p for p in purchases if p.get("purchased_at", now).month == now.month]
    month_earnings = round(sum(p.get("amount", 0.0) for p in this_month) * 0.80, 2)

    return {
        "total_gross": round(total, 2),
        "platform_fee": platform_fee,
        "total_net": net,
        "this_month_net": month_earnings,
        "pending_payout": net,  # simplified: all net is pending
        "currency": "USD",
    }


@creator_router.get("/sales")
async def get_creator_sales(
    limit: int = Query(20, le=100),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    user_id = int(current_user["user_id"])
    templates = await _creator_templates(user_id)
    t_ids = [t["id"] for t in templates]
    t_map = {t["id"]: t.get("title", "") for t in templates}
    purchases = await _creator_purchases(t_ids)

    sales = [
        {
            "transaction_id": p.get("transaction_id"),
            "template_id": p.get("template_id"),
            "template_title": t_map.get(p.get("template_id"), ""),
            "amount": p.get("amount", 0.0),
            "net": round(p.get("amount", 0.0) * 0.80, 2),
            "payment_method": p.get("payment_method", ""),
            "purchased_at": p.get("purchased_at").isoformat() if isinstance(p.get("purchased_at"), datetime) else "",
        }
        for p in purchases
    ]
    return {"sales": sales[skip: skip + limit], "total": len(sales)}


class WithdrawPayload(BaseModel):
    amount: float
    method: str = "bank"  # bank | mobile_money
    account_details: dict = {}


@creator_router.post("/withdraw", status_code=201)
async def request_withdrawal(payload: WithdrawPayload, current_user: dict = Depends(get_current_user)):
    user_id = int(current_user["user_id"])
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if payload.amount < 10:
        raise HTTPException(status_code=400, detail="Minimum withdrawal is $10")

    # In production: check available balance, create payout record, trigger payment provider
    withdrawal_id = f"WD-{uuid.uuid4().hex[:10].upper()}"
    return {
        "withdrawal_id": withdrawal_id,
        "amount": payload.amount,
        "method": payload.method,
        "status": "pending",
        "estimated_arrival": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(),
        "message": "Withdrawal request submitted. Funds arrive in 1–3 business days.",
    }


@creator_router.get("/analytics")
async def get_creator_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: dict = Depends(get_current_user),
):
    user_id = int(current_user["user_id"])
    templates = await _creator_templates(user_id)
    t_ids = [t["id"] for t in templates]
    purchases = await _creator_purchases(t_ids)

    days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    period_purchases = [p for p in purchases if isinstance(p.get("purchased_at"), datetime) and p["purchased_at"] >= cutoff]

    # Revenue by template
    revenue_by_template = {}
    for p in period_purchases:
        tid = p.get("template_id")
        title = next((t.get("title", str(tid)) for t in templates if t["id"] == tid), str(tid))
        revenue_by_template[title] = revenue_by_template.get(title, 0.0) + p.get("amount", 0.0)

    # Total views across creator's templates
    total_views = sum(t.get("view_count", 0) for t in templates)
    total_downloads = sum(t.get("download_count", 0) for t in templates)
    conversion_rate = round((total_downloads / total_views * 100), 1) if total_views else 0.0

    return {
        "period": period,
        "total_sales": len(period_purchases),
        "total_revenue": round(sum(p.get("amount", 0.0) for p in period_purchases), 2),
        "net_revenue": round(sum(p.get("amount", 0.0) for p in period_purchases) * 0.80, 2),
        "total_views": total_views,
        "total_downloads": total_downloads,
        "conversion_rate_pct": conversion_rate,
        "revenue_by_template": revenue_by_template,
        "top_template": max(templates, key=lambda t: t.get("download_count", 0)).get("title", "") if templates else None,
    }
