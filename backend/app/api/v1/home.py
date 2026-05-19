from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr  # Added EmailStr here
from fastapi import APIRouter, HTTPException, status

from app.database_mongo import (
    jobs_collection,
    testimonials_collection,
    blogs_collection,
    events_collection,
    users_collection,  # Added missing import
    newsletter_collection,  # Added missing import
)

router = APIRouter()


class NewsletterRequest(BaseModel):
    email: EmailStr


@router.get("/stats")
async def get_stats():
    """Get homepage statistics aggregated from database."""
    total_users = await users_collection.count_documents({})
    total_jobs = await jobs_collection.count_documents({"is_active": True})
    total_testimonials = await testimonials_collection.count_documents({"featured": True})

    return {
        "total_users": total_users or 50000,  # fallback if no users
        "total_jobs": total_jobs or 500,
        "success_rate": 98.7,
        "countries": 45,
        "salary_boost": 247,
        "problems_solved": 50000,
    }


@router.get("/jobs", response_model=List[dict])
async def get_jobs(limit: int = 6):
    """Get latest active job listings from Ethiopian companies."""
    cursor = jobs_collection.find({"is_active": True}).sort("posted_at", -1).limit(limit)
    jobs = await cursor.to_list(length=limit)

    # Convert ObjectId to string for JSON serialization
    for job in jobs:
        job["id"] = str(job.pop("_id"))

    return jobs or [
        {
            "title": "Senior React Developer",
            "company": "Chapa",
            "location": "Addis Ababa",
            "salary": "15,000 - 25,000 ETB/month",
            "type": "Full-time",
            "link": "https://chapa.co/careers",
            "logo": "https://logo.clearbit.com/chapa.co",
            "posted_at": datetime.utcnow() - timedelta(hours=18),
        },
        {
            "title": "Python Backend Engineer",
            "company": "Safaricom Ethiopia",
            "location": "Remote / Addis",
            "salary": "20,000 - 35,000 ETB/month",
            "type": "Full-time",
            "link": "https://www.safaricom.et/careers",
            "logo": "https://logo.clearbit.com/safaricom.et",
            "posted_at": datetime.utcnow() - timedelta(hours=42),
        },
        {
            "title": "Full Stack Developer",
            "company": "Dashen Bank",
            "location": "Addis Ababa",
            "salary": "18,000 - 30,000 ETB/month",
            "type": "Full-time",
            "link": "https://dashenbanksc.com/careers",
            "logo": "https://logo.clearbit.com/dashenbanksc.com",
            "posted_at": datetime.utcnow() - timedelta(hours=5),
        },
    ]


@router.get("/testimonials", response_model=List[dict])
async def get_testimonials(limit: int = 4):
    """Get featured success stories from Ethiopian developers."""
    cursor = testimonials_collection.find({"featured": True}).sort("created_at", -1).limit(limit)
    testimonials = await cursor.to_list(length=limit)

    for testimonial in testimonials:
        testimonial["id"] = str(testimonial.pop("_id"))

    return testimonials or [
        {
            "name": "Biruk Alemu",
            "role": "Software Engineer",
            "company": "Google",
            "quote": "EthioCode helped me land my dream job at Google while working from Addis Ababa. The structured learning path and mock interviews were game-changers.",
            "salary_increase": "+250%",
            "location": "Addis Ababa, Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=12",
        },
        {
            "name": "Meron Tesfaye",
            "role": "Frontend Developer",
            "company": "Chapa",
            "quote": "From bootcamp to job offer in just 3 months. The community support and real-world projects made all the difference.",
            "salary_increase": "+180%",
            "location": "Addis Ababa, Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=5",
        },
        {
            "name": "Dawit Kebede",
            "role": "Full Stack Engineer",
            "company": "Microsoft",
            "quote": "The roadmap clarity saved me months of confusion. I knew exactly what to learn and in what order. Now I'm building products used by millions.",
            "salary_increase": "+200%",
            "location": "Remote from Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=8",
        },
    ]


@router.get("/blogs/featured", response_model=List[dict])
async def get_featured_blogs(limit: int = 3):
    """Get latest featured blog posts."""
    cursor = blogs_collection.find({"published_at": {"$lte": datetime.utcnow()}}).sort("published_at", -1).limit(limit)
    blogs = await cursor.to_list(length=limit)

    for blog in blogs:
        blog["id"] = str(blog.pop("_id"))

    return blogs or [
        {
            "title": "How Ethiopian Developers Win Remote Jobs",
            "excerpt": "A practical roadmap from portfolio to offer for Ethiopian developers targeting global remote roles.",
            "category": "Career Advice",
            "author": "EthioCode Team",
            "read_time": 7,
            "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
        },
        {
            "title": "FastAPI + MongoDB: The Stack Ethiopian Companies Need",
            "excerpt": "Why modern backend skills are in high demand at Ethiopian fintech and banking sectors.",
            "category": "Backend Development",
            "author": "Dawit K.",
            "read_time": 9,
            "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
        },
        {
            "title": "React Patterns for Production Ethiopian Apps",
            "excerpt": "Building maintainable interfaces that scale for millions of users in African markets.",
            "category": "Frontend Development",
            "author": "Meron B.",
            "read_time": 6,
            "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
        },
    ]


@router.get("/events/upcoming", response_model=List[dict])
async def get_upcoming_events(limit: int = 3):
    """Get upcoming workshops and events."""
    future_date = datetime.utcnow()
    cursor = events_collection.find({"date": {"$gte": future_date}}).sort("date", 1).limit(limit)
    events = await cursor.to_list(length=limit)

    for event in events:
        event["id"] = str(event.pop("_id"))

    return events or [
        {
            "title": "Ethiopian Tech Meetup - Addis",
            "date": "2026-05-15",
            "time": "6:30 PM EAT",
            "location": "Blue Space, Addis Ababa",
            "speaker": "Sarah Johnson - Tech Lead at Chapa",
            "link": "https://ethiocode.com/events/meetup-may",
            "is_virtual": False,
        },
        {
            "title": "Remote Work Masterclass",
            "date": "2026-05-20",
            "time": "7:00 PM EAT",
            "location": "Virtual (Zoom)",
            "speaker": "Biruk Alemu - Remote Engineer at Google",
            "link": "https://ethiocode.com/events/remote-masterclass",
            "is_virtual": True,
        },
        {
            "title": "UI/UX Design Workshop",
            "date": "2026-05-25",
            "time": "5:00 PM EAT",
            "location": "Virtual (Discord)",
            "speaker": "Meron Tesfaye - Design Lead at SafeCare",
            "link": "https://ethiocode.com/events/design-workshop",
            "is_virtual": True,
        },
    ]


@router.get("/technologies")
async def get_technologies():
    """Get featured technologies list."""
    return [
        {"name": "JavaScript", "category": "Language", "popular": True},
        {"name": "TypeScript", "category": "Language", "popular": True},
        {"name": "Python", "category": "Language", "popular": True},
        {"name": "Java", "category": "Language", "popular": False},
        {"name": "Go", "category": "Language", "popular": False},
        {"name": "React", "category": "Frontend", "popular": True},
        {"name": "Vue.js", "category": "Frontend", "popular": False},
        {"name": "Angular", "category": "Frontend", "popular": False},
        {"name": "Next.js", "category": "Frontend", "popular": True},
        {"name": "Node.js", "category": "Backend", "popular": True},
        {"name": "FastAPI", "category": "Backend", "popular": True},
        {"name": "MongoDB", "category": "Database", "popular": True},
        {"name": "PostgreSQL", "category": "Database", "popular": True},
        {"name": "Redis", "category": "Database", "popular": False},
        {"name": "Docker", "category": "DevOps", "popular": True},
        {"name": "Kubernetes", "category": "DevOps", "popular": False},
        {"name": "AWS", "category": "Cloud", "popular": True},
        {"name": "GitHub Actions", "category": "DevOps", "popular": True},
        {"name": "HTML5", "category": "Web", "popular": True},
        {"name": "CSS3", "category": "Web", "popular": True},
        {"name": "Tailwind CSS", "category": "Web", "popular": True},
    ]


@router.get("/learning-paths")
async def get_learning_paths():
    """Get learning paths by experience level."""
    return [
        {
            "level": "Absolute Beginner",
            "difficulty": "No experience needed",
            "duration": "6 months to job-ready",
            "topics": ["HTML", "CSS", "JavaScript Basics", "Git"],
            "cta": "Start from Zero →",
            "color": "emerald",
        },
        {
            "level": "Intermediate Developer",
            "difficulty": "1+ year experience",
            "duration": "3 months to advance",
            "topics": ["React", "Node.js", "Databases", "APIs"],
            "cta": "Level Up →",
            "color": "blue",
        },
        {
            "level": "Advanced Professional",
            "difficulty": "3+ years experience",
            "duration": "2 months to master",
            "topics": ["System Design", "Cloud", "AI/ML", "Architecture"],
            "cta": "Become Expert →",
            "color": "purple",
        },
        {
            "level": "Career Changer",
            "difficulty": "Non-tech background",
            "duration": "9 months to transition",
            "topics": ["Full-Stack Web Dev", "Projects", "Interview Prep"],
            "cta": "Change Career →",
            "color": "orange",
        },
    ]


@router.get("/community-stats")
async def get_community_stats():
    """Get Discord/Telegram community stats."""
    return {
        "online_now": 1234,
        "total_members": 10000,
        "messages_today": 500,
        "discord_link": "https://discord.ethiocode.com",
        "telegram_link": "https://t.me/ethiocode",
    }


@router.get("/pricing")
async def get_pricing():
    """Get pricing tiers."""
    return [
        {
            "name": "Free",
            "price": "0 ETB",
            "period": "forever",
            "features": [
                "Access to 100+ coding challenges",
                "Basic career resources",
                "Community access",
            ],
            "cta": "Get Started →",
            "popular": False,
        },
        {
            "name": "Pro Monthly",
            "price": "499 ETB",
            "period": "per month",
            "features": [
                "Unlimited coding challenges",
                "Mock interviews",
                "AI code review",
                "Priority support",
            ],
            "cta": "Start Pro Trial →",
            "popular": True,
        },
        {
            "name": "Pro Yearly",
            "price": "4,990 ETB",
            "period": "per year",
            "features": [
                "All Pro features",
                "Resume review",
                "Career coaching session",
                "Save 16%",
            ],
            "cta": "Save with Annual →",
            "popular": False,
            "savings_badge": "Save 16%",
        },
    ]


@router.get("/faqs")
async def get_faqs():
    """Get FAQ items."""
    return [
        {
            "question": "Is EthioCode free to use?",
            "answer": "Yes! Our free tier includes 100+ coding challenges and community access.",
        },
        {
            "question": "Do you offer certificates?",
            "answer": "Yes, you'll earn verifiable certificates upon completing learning paths.",
        },
        {
            "question": "Can I get a job through EthioCode?",
            "answer": "We connect you with 500+ Ethiopian companies actively hiring developers.",
        },
        {
            "question": "What languages are available?",
            "answer": "Platform is available in English and Amharic, with more languages coming.",
        },
        {
            "question": "Do you offer refunds?",
            "answer": "14-day money-back guarantee on all paid plans.",
        },
        {
            "question": "How do I contact support?",
            "answer": "Email support@ethiocode.com or join our Discord for community help.",
        },
    ]


@router.post("/newsletter/subscribe")
async def subscribe_newsletter(req: NewsletterRequest):
    """Subscribe to newsletter."""
    try:
        await newsletter_collection.insert_one(
            {"email": req.email, "subscribed_at": datetime.utcnow()}
        )
        return {"success": True, "message": "Subscribed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already subscribed",
        )