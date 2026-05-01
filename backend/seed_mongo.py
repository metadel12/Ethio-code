"""Seed MongoDB database with real Ethiopian job listings and content."""
import asyncio
from datetime import datetime, timedelta

import motor.motor_asyncio
from faker import Faker
from app.config import settings
from app.database_mongo import (
    jobs_collection,
    testimonials_collection,
    blogs_collection,
    events_collection,
)

fake = Faker()


async def clear_collections():
    """Clear all collections for fresh seeding."""
    await jobs_collection.delete_many({})
    await testimonials_collection.delete_many({})
    await blogs_collection.delete_many({})
    await events_collection.delete_many({})
    print("✓ Cleared collections")


async def seed_jobs():
    """Seed real Ethiopian job listings."""
    ethiopian_jobs = [
        {
            "title": "Senior React Developer",
            "company": "Chapa",
            "location": "Addis Ababa",
            "salary": "15,000 - 25,000 ETB/month",
            "type": "Full-time",
            "link": "https://chapa.co/careers",
            "logo": "https://logo.clearbit.com/chapa.co",
            "posted_at": datetime.utcnow() - timedelta(hours=18),
            "is_active": True,
        },
        {
            "title": "Python Backend Engineer",
            "company": "Safaricom Ethiopia",
            "location": "Remote / Addis Ababa",
            "salary": "20,000 - 35,000 ETB/month",
            "type": "Full-time",
            "link": "https://www.safaricom.et/careers",
            "logo": "https://logo.clearbit.com/safaricom.et",
            "posted_at": datetime.utcnow() - timedelta(hours=42),
            "is_active": True,
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
            "is_active": True,
        },
        {
            "title": "DevOps Engineer",
            "company": "Ethio Telecom",
            "location": "Hawassa",
            "salary": "22,000 - 35,000 ETB/month",
            "type": "Full-time",
            "link": "https://ethiotelecom.et/careers",
            "logo": "https://logo.clearbit.com/ethiotelecom.et",
            "posted_at": datetime.utcnow() - timedelta(hours=12),
            "is_active": True,
        },
        {
            "title": "Frontend Developer",
            "company": "Kifiya Financial",
            "location": "Addis Ababa",
            "salary": "14,000 - 22,000 ETB/month",
            "type": "Full-time",
            "link": "https://kifiya.com/careers",
            "logo": "https://logo.clearbit.com/kifiya.com",
            "posted_at": datetime.utcnow() - timedelta(days=1, hours=6),
            "is_active": True,
        },
        {
            "title": "Mobile App Developer",
            "company": "Awash Bank",
            "location": "Addis Ababa",
            "salary": "16,000 - 28,000 ETB/month",
            "type": "Full-time",
            "link": "https://awashbank.com/careers",
            "logo": "https://logo.clearbit.com/awashbank.com",
            "posted_at": datetime.utcnow() - timedelta(days=2),
            "is_active": True,
        },
        {
            "title": "Cloud Platform Engineer",
            "company": "Bank of Abyssinia",
            "location": "Addis Ababa",
            "salary": "25,000 - 40,000 ETB/month",
            "type": "Full-time",
            "link": "https://bankofabyssinia.com/career",
            "logo": "https://logo.clearbit.com/bankofabyssinia.com",
            "posted_at": datetime.utcnow() - timedelta(hours=36),
            "is_active": True,
        },
        {
            "title": "Junior Backend Developer",
            "company": "Nib Insurance",
            "location": "Addis Ababa",
            "salary": "8,000 - 12,000 ETB/month",
            "type": "Entry Level",
            "link": "https://nibinsurance.com.et/careers",
            "logo": "https://logo.clearbit.com/nibinsurance.com.et",
            "posted_at": datetime.utcnow() - timedelta(days=1),
            "is_active": True,
        },
        {
            "title": "Software Engineer",
            "company": "BelCash",
            "location": "Addis Ababa",
            "salary": "18,000 - 30,000 ETB/month",
            "type": "Full-time",
            "link": "https://belcash.com/career",
            "logo": "https://logo.clearbit.com/belcash.com",
            "posted_at": datetime.utcnow() - timedelta(hours=24),
            "is_active": True,
        },
        {
            "title": "React Native Developer",
            "company": "Addis Software",
            "location": "Remote",
            "salary": "12,000 - 20,000 ETB/month",
            "type": "Remote",
            "link": "https://addissoftware.com/careers",
            "logo": "https://logo.clearbit.com/addissoftware.com",
            "posted_at": datetime.utcnow() - timedelta(hours=8),
            "is_active": True,
        },
    ]

    result = await jobs_collection.insert_many(ethiopian_jobs)
    print(f"✓ Seeded {len(result.inserted_ids)} jobs")


async def seed_testimonials():
    """Seed success stories from Ethiopian developers."""
    testimonials = [
        {
            "name": "Biruk Alemu",
            "role": "Software Engineer",
            "company": "Google",
            "quote": "EthioCode helped me land my dream job at Google while working from Addis Ababa. The structured learning path and mock interviews were game-changers.",
            "salary_increase": "+250%",
            "location": "Addis Ababa, Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=12",
            "featured": True,
            "created_at": datetime.utcnow() - timedelta(days=30),
        },
        {
            "name": "Meron Tesfaye",
            "role": "Frontend Developer",
            "company": "Chapa",
            "quote": "From bootcamp to job offer in just 3 months. The community support and real-world projects made all the difference.",
            "salary_increase": "+180%",
            "location": "Addis Ababa, Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=5",
            "featured": True,
            "created_at": datetime.utcnow() - timedelta(days=45),
        },
        {
            "name": "Dawit Kebede",
            "role": "Full Stack Engineer",
            "company": "Microsoft",
            "quote": "The roadmap clarity saved me months of confusion. I knew exactly what to learn and in what order. Now I'm building products used by millions.",
            "salary_increase": "+200%",
            "location": "Remote from Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=8",
            "featured": True,
            "created_at": datetime.utcnow() - timedelta(days=60),
        },
        {
            "name": "Hana Wolde",
            "role": "DevOps Engineer",
            "company": "Safaricom Ethiopia",
            "quote": "The AI-powered code review and interview simulator prepared me for real-world scenarios. Got my offer on my third application!",
            "salary_increase": "+150%",
            "location": "Hawassa, Ethiopia",
            "avatar": "https://i.pravatar.cc/150?img=9",
            "featured": True,
            "created_at": datetime.utcnow() - timedelta(days=90),
        },
    ]

    result = await testimonials_collection.insert_many(testimonials)
    print(f"✓ Seeded {len(result.inserted_ids)} testimonials")


async def seed_blogs():
    """Seed featured blog posts."""
    blogs = [
        {
            "title": "How Ethiopian Developers Win Remote Jobs",
            "slug": "ethiopian-developers-remote-jobs",
            "excerpt": "A practical roadmap from portfolio to offer for Ethiopian developers targeting global remote roles.",
            "category": "Career Advice",
            "author": "EthioCode Team",
            "read_time": 7,
            "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
            "published_at": datetime.utcnow() - timedelta(days=5),
            "created_at": datetime.utcnow() - timedelta(days=5),
        },
        {
            "title": "FastAPI + MongoDB: The Stack Ethiopian Companies Need",
            "slug": "fastapi-mongodb-ethiopia",
            "excerpt": "Why modern backend skills are in high demand at Ethiopian fintech and banking sectors.",
            "category": "Backend Development",
            "author": "Dawit K.",
            "read_time": 9,
            "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
            "published_at": datetime.utcnow() - timedelta(days=12),
            "created_at": datetime.utcnow() - timedelta(days=12),
        },
        {
            "title": "React Patterns for Production Ethiopian Apps",
            "slug": "react-patterns-ethiopian-apps",
            "excerpt": "Building maintainable interfaces that scale for millions of users in African markets.",
            "category": "Frontend Development",
            "author": "Meron B.",
            "read_time": 6,
            "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
            "published_at": datetime.utcnow() - timedelta(days=18),
            "created_at": datetime.utcnow() - timedelta(days=18),
        },
    ]

    result = await blogs_collection.insert_many(blogs)
    print(f"✓ Seeded {len(result.inserted_ids)} blogs")


async def seed_events():
    """Seed upcoming events and workshops."""
    events = [
        {
            "title": "Ethiopian Tech Meetup - Addis",
            "date": datetime.utcnow() + timedelta(days=14),
            "time": "6:30 PM EAT",
            "location": "Blue Space, Addis Ababa",
            "speaker": "Sarah Johnson - Tech Lead at Chapa",
            "link": "https://ethiocode.com/events/meetup-may",
            "is_virtual": False,
            "created_at": datetime.utcnow(),
        },
        {
            "title": "Remote Work Masterclass",
            "date": datetime.utcnow() + timedelta(days=19),
            "time": "7:00 PM EAT",
            "location": "Virtual (Zoom)",
            "speaker": "Biruk Alemu - Remote Engineer at Google",
            "link": "https://ethiocode.com/events/remote-masterclass",
            "is_virtual": True,
            "created_at": datetime.utcnow(),
        },
        {
            "title": "UI/UX Design Workshop",
            "date": datetime.utcnow() + timedelta(days=25),
            "time": "5:00 PM EAT",
            "location": "Virtual (Discord)",
            "speaker": "Meron Tesfaye - Design Lead at SafeCare",
            "link": "https://ethiocode.com/events/design-workshop",
            "is_virtual": True,
            "created_at": datetime.utcnow(),
        },
    ]

    result = await events_collection.insert_many(events)
    print(f"✓ Seeded {len(result.inserted_ids)} events")


async def main():
    """Run all seeders."""
    print("Seeding MongoDB with Ethiopian data...")

    await clear_collections()
    await seed_jobs()
    await seed_testimonials()
    await seed_blogs()
    await seed_events()

    print("\n✅ Database seeding complete!")


if __name__ == "__main__":
    asyncio.run(main())
