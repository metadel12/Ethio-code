"""
Seed script for contact page data (FAQs and office locations)
Run: python seed_contact_data.py
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "ethiocode"

async def seed_contact_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    # FAQs
    faqs = [
        {
            "question": "How do I create an account on EthioCode?",
            "answer": "Click the 'Sign Up' button in the top right corner, fill in your details, and verify your email address. It's free and takes less than a minute!",
            "category": "account",
            "tags": ["signup", "registration", "account"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 1,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "What payment methods do you accept?",
            "answer": "We accept Telebirr, CBE Birr, Chapa, and international cards via Stripe. All payments are secure and encrypted.",
            "category": "billing",
            "tags": ["payment", "billing", "subscription"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 2,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "Can I cancel my subscription anytime?",
            "answer": "Yes! You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period.",
            "category": "billing",
            "tags": ["subscription", "cancel", "billing"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 3,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "How do I reset my password?",
            "answer": "Click 'Forgot Password' on the login page, enter your email, and we'll send you a reset link. Check your spam folder if you don't see it.",
            "category": "account",
            "tags": ["password", "reset", "login"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 4,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "Do you offer student discounts?",
            "answer": "Yes! Students get 50% off with code STUDENT50. You'll need to verify your student status with a valid student ID.",
            "category": "billing",
            "tags": ["discount", "student", "pricing"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 5,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "What programming languages do you support?",
            "answer": "We support 16+ languages including Python, JavaScript, Java, C++, Go, Rust, PHP, Ruby, and more. Check our code editor for the full list.",
            "category": "technical",
            "tags": ["languages", "programming", "code"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 6,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "How long does it take to get a response?",
            "answer": "We typically respond within 24 hours on weekdays. For urgent issues, use our live chat feature for immediate assistance.",
            "category": "general",
            "tags": ["support", "response", "time"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 7,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "question": "Can I use EthioCode offline?",
            "answer": "Some features work offline with our PWA, but most functionality requires an internet connection for code execution and real-time features.",
            "category": "technical",
            "tags": ["offline", "pwa", "internet"],
            "helpful_count": 0,
            "not_helpful_count": 0,
            "order": 8,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Office locations
    locations = [
        {
            "name": "EthioCode HQ - Bole",
            "address": "Bole, Woreda 03, Near Edna Mall, Addis Ababa",
            "city": "Addis Ababa",
            "country": "Ethiopia",
            "phone": "+251-111-234-567",
            "email": "hello@ethiocode.com",
            "map_coordinates": {
                "lat": 8.9806,
                "lng": 38.7578
            },
            "working_hours": {
                "monday_friday": "9:00 AM - 6:00 PM",
                "saturday": "10:00 AM - 2:00 PM",
                "sunday": "Closed"
            },
            "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
            "is_main": True,
            "order": 1
        }
    ]
    
    # Check existing data
    existing_faqs = await db.faqs.count_documents({})
    existing_locations = await db.office_locations.count_documents({})
    
    if existing_faqs > 0:
        print(f"⚠️  {existing_faqs} FAQs already exist. Skipping FAQs.")
    else:
        result = await db.faqs.insert_many(faqs)
        print(f"✅ Created {len(result.inserted_ids)} FAQs")
    
    if existing_locations > 0:
        print(f"⚠️  {existing_locations} office locations already exist. Skipping locations.")
    else:
        result = await db.office_locations.insert_many(locations)
        print(f"✅ Created {len(result.inserted_ids)} office locations")
    
    client.close()

if __name__ == "__main__":
    print("🌱 Seeding contact data...")
    asyncio.run(seed_contact_data())
    print("✨ Done!")
