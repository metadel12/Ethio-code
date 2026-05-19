from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId

from app.database import db
from app.core.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/contact", tags=["Contact"])

# ==================== MODELS ====================
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    category: str
    message: str
    priority: str = "medium"

class FAQVote(BaseModel):
    helpful: bool

class TicketMessage(BaseModel):
    message: str

# ==================== PUBLIC ENDPOINTS ====================
@router.post("/submit")
async def submit_contact(
    contact_data: ContactRequest,
    background_tasks: BackgroundTasks,
    request: Request
):
    """Submit contact form (public)"""
    # Generate ticket number
    ticket_count = await db.contacts.count_documents({})
    ticket_number = f"TKT-{datetime.now().strftime('%Y%m')}-{ticket_count + 1:04d}"
    
    # Save contact submission
    contact = {
        "user_id": None,
        "name": contact_data.name,
        "email": contact_data.email,
        "phone": contact_data.phone,
        "subject": contact_data.subject,
        "category": contact_data.category,
        "message": contact_data.message,
        "priority": contact_data.priority,
        "status": "pending",
        "assigned_to": None,
        "attachments": [],
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "referrer": request.headers.get("referer"),
        "ticket_number": ticket_number,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.contacts.insert_one(contact)
    contact_id = str(result.inserted_id)
    
    return {
        "success": True,
        "message": "Your message has been sent successfully. We'll get back to you within 24 hours.",
        "ticket_number": ticket_number,
        "contact_id": contact_id
    }


@router.get("/faqs")
async def get_faqs(category: Optional[str] = None):
    """Get frequently asked questions"""
    query = {"is_active": True}
    if category:
        query["category"] = category
    
    faqs = await db.faqs.find(query).sort("order", 1).to_list(length=50)
    
    for faq in faqs:
        faq["_id"] = str(faq["_id"])
    
    return {"faqs": faqs}

@router.post("/faqs/{faq_id}/vote")
async def vote_faq(faq_id: str, vote_data: FAQVote):
    """Vote on FAQ helpfulness"""
    update_field = "helpful_count" if vote_data.helpful else "not_helpful_count"
    
    await db.faqs.update_one(
        {"_id": ObjectId(faq_id)},
        {"$inc": {update_field: 1}}
    )
    
    return {"message": "Vote recorded"}

@router.get("/office-locations")
async def get_office_locations():
    """Get EthioCode office locations"""
    locations = await db.office_locations.find().sort("order", 1).to_list(length=10)
    
    for location in locations:
        location["_id"] = str(location["_id"])
    
    return {"locations": locations}

# ==================== AUTHENTICATED ENDPOINTS ====================
@router.get("/my-tickets")
async def get_my_tickets(current_user = Depends(get_current_user)):
    """Get user's support tickets"""
    tickets = await db.contacts.find({
        "email": current_user.get("email")
    }).sort("created_at", -1).to_list(length=50)
    
    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])
    
    return {"tickets": tickets}

@router.get("/my-tickets/{ticket_id}")
async def get_ticket_details(ticket_id: str, current_user = Depends(get_current_user)):
    """Get specific ticket details"""
    ticket = await db.contacts.find_one({
        "_id": ObjectId(ticket_id),
        "email": current_user.get("email")
    })
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket["_id"] = str(ticket["_id"])
    return ticket

# ==================== ADMIN ENDPOINTS ====================
@router.get("/admin/contacts")
async def get_all_contacts(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
    current_user = Depends(get_current_user)
):
    """Get all contact submissions (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    
    contacts = await db.contacts.find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    for contact in contacts:
        contact["_id"] = str(contact["_id"])
    
    return {"contacts": contacts}

@router.put("/admin/contacts/{contact_id}/status")
async def update_contact_status(
    contact_id: str,
    status_data: dict,
    current_user = Depends(get_current_user)
):
    """Update contact status (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": {
            "status": status_data["status"],
            "assigned_to": current_user["_id"],
            "updated_at": datetime.utcnow(),
            "resolved_at": datetime.utcnow() if status_data["status"] == "resolved" else None
        }}
    )
    
    return {"success": True}

@router.get("/admin/analytics")
async def get_contact_analytics(
    days: int = 30,
    current_user = Depends(get_current_user)
):
    """Get contact analytics (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total contacts
    total_contacts = await db.contacts.count_documents({
        "created_at": {"$gte": start_date}
    })
    
    # Contacts by category
    category_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    by_category = await db.contacts.aggregate(category_pipeline).to_list(length=10)
    
    # Contacts by status
    status_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    by_status = await db.contacts.aggregate(status_pipeline).to_list(length=10)
    
    return {
        "total_contacts": total_contacts,
        "by_category": by_category,
        "by_status": by_status
    }
