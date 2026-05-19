"""MongoDB async connection using Motor."""
import motor.motor_asyncio
from pymongo import DESCENDING
from app.config import settings

# MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]

# Collections
jobs_collection = db.jobs
testimonials_collection = db.testimonials
blogs_collection = db.blogs
events_collection = db.events
newsletter_collection = db.newsletter
users_collection = db.users

async def init_mongodb():
    """Initialize MongoDB indexes."""
    # Jobs indexes
    await jobs_collection.create_index([("posted_at", DESCENDING)])
    await jobs_collection.create_index("is_active")
    await jobs_collection.create_index([("company", 1), ("title", 1)])

    # Testimonials indexes
    await testimonials_collection.create_index("featured")
    await testimonials_collection.create_index("company")

    # Blogs indexes
    await blogs_collection.create_index([("published_at", DESCENDING)])
    await blogs_collection.create_index("category")
    await blogs_collection.create_index("slug", unique=True)

    # Events indexes
    await events_collection.create_index("date")
    await events_collection.create_index("is_virtual")

    # Newsletter indexes
    await newsletter_collection.create_index("email", unique=True)

    # Users indexes
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("created_at")
