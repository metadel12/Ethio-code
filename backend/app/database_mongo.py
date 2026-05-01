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
password_reset_tokens_collection = db.password_reset_tokens
email_verification_tokens_collection = db.email_verification_tokens
sessions_collection = db.sessions
login_history_collection = db.login_history
applications_collection = db.applications
saved_jobs_collection = db.saved_jobs
job_alerts_collection = db.job_alerts
job_views_collection = db.job_views

async def init_mongodb():
    """Initialize MongoDB indexes."""
    await client.admin.command("ping")

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
    await users_collection.create_index("is_verified")
    await users_collection.create_index("created_at")

    # Password reset tokens indexes
    await password_reset_tokens_collection.create_index("token", unique=True)
    await password_reset_tokens_collection.create_index("user_id")
    await password_reset_tokens_collection.create_index("expires_at")

    # Email verification tokens indexes
    await email_verification_tokens_collection.create_index("token", unique=True)
    await email_verification_tokens_collection.create_index("user_id")
    await email_verification_tokens_collection.create_index("expires_at")

    # Sessions indexes
    await sessions_collection.create_index("token_jti", unique=True)
    await sessions_collection.create_index("user_id")
    await sessions_collection.create_index("expires_at")

    # Login history indexes
    await login_history_collection.create_index([("user_id", 1), ("timestamp", -1)])
    await login_history_collection.create_index("ip_address")

    # Applications indexes
    await applications_collection.create_index([("user_id", 1), ("applied_at", -1)])
    await applications_collection.create_index("job_id")
    await applications_collection.create_index([("job_id", 1), ("user_id", 1)], unique=True)

    # Saved jobs indexes
    await saved_jobs_collection.create_index([("user_id", 1), ("job_id", 1)], unique=True)
    await saved_jobs_collection.create_index("user_id")

    # Job alerts indexes
    await job_alerts_collection.create_index("user_id")
    await job_alerts_collection.create_index("is_active")

    # Job views indexes
    await job_views_collection.create_index([("job_id", 1), ("viewed_at", -1)])
    await job_views_collection.create_index("user_id")

    print(f"[MongoDB] Connected successfully to '{settings.MONGODB_DB_NAME}' at {settings.MONGODB_URL}")
