from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import secrets
from bson import ObjectId

from app.database import db
from app.core.auth import get_current_user

router = APIRouter(prefix="/pricing", tags=["Pricing"])

# ETB to USD conversion
ETB_TO_USD = 0.018

class SubscriptionRequest(BaseModel):
    plan_id: str
    billing_cycle: str
    payment_method: str
    coupon_code: Optional[str] = None
    phone_number: Optional[str] = None

class CouponRequest(BaseModel):
    code: str
    plan_id: str
    billing_cycle: str

@router.get("/plans")
async def get_pricing_plans(currency: str = "ETB"):
    """Get all pricing plans"""
    
    plans = [
        {
            "_id": "free",
            "name": "Free",
            "slug": "free",
            "description": "Perfect for getting started",
            "monthly_price_etb": 0,
            "yearly_price_etb": 0,
            "features": [
                {"name": "50 Coding Challenges/month", "included": True, "limit": 50},
                {"name": "5 Video Tutorials/month", "included": True, "limit": 5},
                {"name": "1 Mock Interview/month", "included": True, "limit": 1},
                {"name": "Basic Templates", "included": True},
                {"name": "AI Code Review", "included": False},
                {"name": "Resume Review", "included": False},
                {"name": "Priority Support", "included": False}
            ],
            "is_popular": False,
            "button_text": "Get Started",
            "order": 1
        },
        {
            "_id": "pro",
            "name": "Pro",
            "slug": "pro",
            "description": "Best for serious developers",
            "monthly_price_etb": 499,
            "yearly_price_etb": 4990,
            "features": [
                {"name": "Unlimited Coding Challenges", "included": True},
                {"name": "Unlimited Video Tutorials", "included": True},
                {"name": "10 Mock Interviews/month", "included": True, "limit": 10},
                {"name": "Premium Templates", "included": True},
                {"name": "AI Code Review", "included": True},
                {"name": "Resume Review", "included": True},
                {"name": "Job Application Tracking", "included": True},
                {"name": "Priority Support", "included": False}
            ],
            "is_popular": True,
            "button_text": "Subscribe Now",
            "order": 2
        },
        {
            "_id": "enterprise",
            "name": "Enterprise",
            "slug": "enterprise",
            "description": "For teams and organizations",
            "monthly_price_etb": None,
            "yearly_price_etb": None,
            "features": [
                {"name": "Everything in Pro", "included": True},
                {"name": "Unlimited Mock Interviews", "included": True},
                {"name": "Team Collaboration", "included": True},
                {"name": "Custom Integration", "included": True},
                {"name": "Dedicated Account Manager", "included": True},
                {"name": "Priority Support", "included": True},
                {"name": "SLA Guarantee (99.9%)", "included": True},
                {"name": "Custom Training", "included": True}
            ],
            "is_popular": False,
            "button_text": "Contact Sales",
            "is_custom": True,
            "order": 3
        }
    ]
    
    for plan in plans:
        if currency == "USD" and plan["monthly_price_etb"] is not None:
            plan["monthly_price"] = round(plan["monthly_price_etb"] * ETB_TO_USD, 2)
            plan["yearly_price"] = round(plan["yearly_price_etb"] * ETB_TO_USD, 2)
            plan["currency"] = "USD"
        else:
            plan["monthly_price"] = plan["monthly_price_etb"]
            plan["yearly_price"] = plan["yearly_price_etb"]
            plan["currency"] = "ETB"
    
    return {"plans": plans, "currency": currency, "exchange_rate": ETB_TO_USD}

@router.post("/subscribe")
async def create_subscription(
    request: SubscriptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new subscription"""
    
    # Get plan details
    plans_response = await get_pricing_plans()
    plan = next((p for p in plans_response["plans"] if p["_id"] == request.plan_id), None)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Calculate price
    price = plan["monthly_price_etb"] if request.billing_cycle == "monthly" else plan["yearly_price_etb"]
    
    if price is None:
        raise HTTPException(status_code=400, detail="Please contact sales for enterprise pricing")
    
    # Apply coupon if provided
    discount_amount = 0
    if request.coupon_code:
        # Simple coupon validation
        if request.coupon_code.upper() == "ETHIOCODE20":
            discount_amount = price * 0.20
    
    final_price = price - discount_amount
    
    # Create subscription record
    subscription = {
        "user_id": current_user["_id"],
        "plan_id": request.plan_id,
        "plan_name": plan["name"],
        "status": "active",
        "billing_cycle": request.billing_cycle,
        "current_period_start": datetime.utcnow(),
        "current_period_end": datetime.utcnow() + timedelta(days=30 if request.billing_cycle == "monthly" else 365),
        "cancel_at_period_end": False,
        "auto_renew": True,
        "amount": final_price,
        "discount_applied": discount_amount,
        "coupon_code": request.coupon_code,
        "payment_method": request.payment_method,
        "created_at": datetime.utcnow()
    }
    
    result = await db.user_subscriptions.insert_one(subscription)
    
    # Create payment record
    payment = {
        "user_id": current_user["_id"],
        "subscription_id": result.inserted_id,
        "amount_etb": final_price,
        "payment_method": request.payment_method,
        "transaction_id": f"TXN_{datetime.now().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}",
        "status": "completed",
        "created_at": datetime.utcnow()
    }
    
    await db.payments.insert_one(payment)
    
    return {
        "success": True,
        "subscription_id": str(result.inserted_id),
        "message": "Subscription created successfully"
    }

@router.post("/apply-coupon")
async def apply_coupon(request: CouponRequest):
    """Apply discount coupon"""
    
    # Get plan
    plans_response = await get_pricing_plans()
    plan = next((p for p in plans_response["plans"] if p["_id"] == request.plan_id), None)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    price = plan["monthly_price_etb"] if request.billing_cycle == "monthly" else plan["yearly_price_etb"]
    
    # Simple coupon validation
    if request.code.upper() == "ETHIOCODE20":
        discount = price * 0.20
        return {
            "valid": True,
            "code": "ETHIOCODE20",
            "discount_type": "percentage",
            "discount_value": 20,
            "discount_amount": discount,
            "original_price": price,
            "final_price": price - discount,
            "description": "20% off your subscription"
        }
    elif request.code.upper() == "STUDENT50":
        discount = price * 0.50
        return {
            "valid": True,
            "code": "STUDENT50",
            "discount_type": "percentage",
            "discount_value": 50,
            "discount_amount": discount,
            "original_price": price,
            "final_price": price - discount,
            "description": "50% student discount"
        }
    else:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon")

@router.get("/subscriptions/current")
async def get_current_subscription(current_user: dict = Depends(get_current_user)):
    """Get user's current subscription"""
    
    subscription = await db.user_subscriptions.find_one({
        "user_id": current_user["_id"],
        "status": "active",
        "current_period_end": {"$gte": datetime.utcnow()}
    })
    
    if not subscription:
        return {"has_subscription": False}
    
    return {
        "has_subscription": True,
        "plan": {
            "name": subscription["plan_name"],
            "id": subscription["plan_id"]
        },
        "billing_cycle": subscription["billing_cycle"],
        "current_period_end": subscription["current_period_end"],
        "auto_renew": subscription["auto_renew"],
        "cancel_at_period_end": subscription["cancel_at_period_end"]
    }

@router.post("/subscriptions/cancel")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel subscription at period end"""
    
    subscription = await db.user_subscriptions.find_one({
        "user_id": current_user["_id"],
        "status": "active"
    })
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    await db.user_subscriptions.update_one(
        {"_id": subscription["_id"]},
        {"$set": {"cancel_at_period_end": True}}
    )
    
    return {"message": "Subscription will be canceled at the end of billing period"}

@router.get("/invoices")
async def get_user_invoices(current_user: dict = Depends(get_current_user)):
    """Get user's invoice history"""
    
    cursor = db.payments.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(50)
    payments = await cursor.to_list(length=50)
    
    for payment in payments:
        payment["_id"] = str(payment["_id"])
        payment["user_id"] = str(payment["user_id"])
        payment["subscription_id"] = str(payment.get("subscription_id", ""))
    
    return {"invoices": payments}
