"""
Seed script to create initial blog categories
Run: python seed_blog_categories.py
"""
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "ethiocode"

async def seed_categories():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    categories = [
        {
            "name": "Tutorial",
            "slug": "tutorial",
            "description": "Step-by-step guides and tutorials",
            "icon": "📚",
            "color": "#10b981",
            "post_count": 0,
            "order": 1,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Career",
            "slug": "career",
            "description": "Career advice and job hunting tips",
            "icon": "💼",
            "color": "#3b82f6",
            "post_count": 0,
            "order": 2,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "News",
            "slug": "news",
            "description": "Latest tech news and updates",
            "icon": "📰",
            "color": "#8b5cf6",
            "post_count": 0,
            "order": 3,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Success Story",
            "slug": "success-story",
            "description": "Inspiring success stories from developers",
            "icon": "🌟",
            "color": "#f59e0b",
            "post_count": 0,
            "order": 4,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Interview Prep",
            "slug": "interview-prep",
            "description": "Interview preparation and coding challenges",
            "icon": "🎯",
            "color": "#ef4444",
            "post_count": 0,
            "order": 5,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Tech Stack",
            "slug": "tech-stack",
            "description": "Technology reviews and comparisons",
            "icon": "⚡",
            "color": "#06b6d4",
            "post_count": 0,
            "order": 6,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    # Check if categories already exist
    existing = await db.blog_categories.count_documents({})
    
    if existing > 0:
        print(f"Categories already exist ({existing} found). Skipping seed.")
        return
    
    # Insert categories
    result = await db.blog_categories.insert_many(categories)
    print(f"✅ Successfully created {len(result.inserted_ids)} blog categories!")
    
    # Print created categories
    for cat in categories:
        print(f"  {cat['icon']} {cat['name']} - {cat['description']}")
    
    client.close()

if __name__ == "__main__":
    print("🌱 Seeding blog categories...")
    asyncio.run(seed_categories())
    print("✨ Done!")
