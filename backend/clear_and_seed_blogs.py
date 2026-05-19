"""
Clear existing blogs and seed fresh sample articles
Run: python clear_and_seed_blogs.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "ethiocode"

async def clear_and_seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DATABASE_NAME]
    
    print("🗑️  Clearing existing blog data...")
    
    # Delete all blogs
    result = await db.blogs.delete_many({})
    print(f"   Deleted {result.deleted_count} blogs")
    
    # Delete all comments
    result = await db.blog_comments.delete_many({})
    print(f"   Deleted {result.deleted_count} comments")
    
    # Delete all reactions
    result = await db.blog_reactions.delete_many({})
    print(f"   Deleted {result.deleted_count} reactions")
    
    # Delete all bookmarks
    result = await db.blog_bookmarks.delete_many({})
    print(f"   Deleted {result.deleted_count} bookmarks")
    
    # Delete all views
    result = await db.blog_views.delete_many({})
    print(f"   Deleted {result.deleted_count} views")
    
    print("\n✅ Database cleared!")
    print("\n🌱 Now run: python seed_blog_articles.py")
    
    client.close()

if __name__ == "__main__":
    print("=" * 60)
    asyncio.run(clear_and_seed())
    print("=" * 60)
