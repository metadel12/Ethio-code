"""MongoDB async connection using Motor."""
from datetime import datetime, timezone

import motor.motor_asyncio
from pymongo import DESCENDING

from app.config import settings

# MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]  # noqa: used directly by routers

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

templates_collection = db.templates
template_reviews_collection = db.template_reviews
template_saved_collection = db.template_saved
template_purchases_collection = db.template_purchases

# Learning & Progress
user_courses_collection = db.user_courses
user_challenges_collection = db.user_challenges
user_projects_collection = db.user_projects

# Community & Content
blog_comments_collection = db.blog_comments
forum_posts_collection = db.forum_posts

# Analytics
user_activities_collection = db.user_activities
daily_aggregates_collection = db.daily_aggregates

# Notifications
notifications_collection = db.notifications

# Enterprise
organizations_collection = db.organizations
teams_collection = db.teams

# Proctoring
proctoring_tests_collection = db.proctoring_tests
proctoring_sessions_collection = db.proctoring_sessions
proctoring_flags_collection = db.proctoring_flags

# Device Testing
device_test_results_collection = db.device_test_results
user_device_settings_collection = db.user_device_settings

# Projects Marketplace
projects_collection = db.projects
project_likes_collection = db.project_likes
project_saves_collection = db.project_saves
project_comments_collection = db.project_comments
project_views_collection = db.project_views

async def _seed_templates():
    if await templates_collection.count_documents({}) > 0:
        return

    now = datetime.now(timezone.utc)
    sample_templates = [
        {
            "id": 1,
            "title": "Startup Landing Page",
            "description": "A modern landing page template for startups and SaaS products.",
            "category": "Business",
            "tags": ["startup", "landing page", "saas", "responsive"],
            "price": 19.0,
            "version": "1.0.0",
            "preview_url": "",
            "file_url": "",
            "file_size": 0,
            "file_type": "zip",
            "status": "approved",
            "is_featured": True,
            "is_active": True,
            "download_count": 12,
            "view_count": 120,
            "rating_average": 4.8,
            "rating_count": 5,
            "creator_id": 1,
            "creator_name": "EthioCode Demo",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": 2,
            "title": "E-commerce Dashboard",
            "description": "Admin dashboard template built for product and sales analytics.",
            "category": "Admin",
            "tags": ["dashboard", "ecommerce", "admin", "analytics"],
            "price": 24.0,
            "version": "1.0.0",
            "preview_url": "",
            "file_url": "",
            "file_size": 0,
            "file_type": "zip",
            "status": "approved",
            "is_featured": False,
            "is_active": True,
            "download_count": 8,
            "view_count": 85,
            "rating_average": 4.7,
            "rating_count": 3,
            "creator_id": 2,
            "creator_name": "Template Creator",
            "created_at": now,
            "updated_at": now,
        },
    ]

    await templates_collection.insert_many(sample_templates)


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

    # Templates indexes
    await templates_collection.create_index("id", unique=True)
    await templates_collection.create_index("category")
    await templates_collection.create_index("tags")
    await templates_collection.create_index("price")
    await templates_collection.create_index("status")
    await templates_collection.create_index("is_active")
    await templates_collection.create_index([("created_at", DESCENDING)])
    await templates_collection.create_index([("creator_id", 1)])
    await template_reviews_collection.create_index([("template_id", 1), ("created_at", -1)])
    await template_reviews_collection.create_index([("user_id", 1), ("template_id", 1)], unique=True)
    await template_saved_collection.create_index([("user_id", 1), ("template_id", 1)], unique=True)
    await template_saved_collection.create_index("template_id")
    await template_saved_collection.create_index("user_id")

    await _seed_templates()

    # Learning & Progress indexes
    await user_courses_collection.create_index("user_id")
    await user_courses_collection.create_index("course_id")
    await user_courses_collection.create_index([("user_id", 1), ("course_id", 1)], unique=True)
    await user_courses_collection.create_index("status")

    await user_challenges_collection.create_index("user_id")
    await user_challenges_collection.create_index("challenge_id")
    await user_challenges_collection.create_index("status")

    await user_projects_collection.create_index("user_id")
    await user_projects_collection.create_index("status")
    await user_projects_collection.create_index("is_featured")

    # Template purchases indexes
    await template_purchases_collection.create_index("user_id")
    await template_purchases_collection.create_index("template_id")
    await template_purchases_collection.create_index("transaction_id", unique=True)
    await template_purchases_collection.create_index("status")

    # Blog comments indexes
    await blog_comments_collection.create_index("blog_id")
    await blog_comments_collection.create_index("user_id")
    await blog_comments_collection.create_index("parent_id")
    await blog_comments_collection.create_index("is_approved")

    # Forum posts indexes
    await forum_posts_collection.create_index("author_id")
    await forum_posts_collection.create_index("category")
    await forum_posts_collection.create_index("status")
    await forum_posts_collection.create_index([("last_activity", DESCENDING)])
    await forum_posts_collection.create_index([("title", "text"), ("content", "text")])

    # Analytics indexes
    await user_activities_collection.create_index("user_id")
    await user_activities_collection.create_index("event_type")
    await user_activities_collection.create_index("entity_id")
    await user_activities_collection.create_index([("created_at", DESCENDING)])
    await user_activities_collection.create_index("session_id")

    await daily_aggregates_collection.create_index([("user_id", 1), ("date", 1)], unique=True)
    await daily_aggregates_collection.create_index("date")

    # Notifications indexes
    await notifications_collection.create_index("user_id")
    await notifications_collection.create_index("is_read")
    await notifications_collection.create_index("type")
    await notifications_collection.create_index([("created_at", DESCENDING)])

    # Enterprise indexes
    await organizations_collection.create_index("slug", unique=True)
    await organizations_collection.create_index("created_by")
    await organizations_collection.create_index("subscription_plan")

    await teams_collection.create_index("organization_id")
    await teams_collection.create_index("lead_id")
    await teams_collection.create_index("members.user_id")

    # Projects Marketplace indexes
    await projects_collection.create_index([("created_at", DESCENDING)])
    await projects_collection.create_index("is_published")
    await projects_collection.create_index("project_type")
    await projects_collection.create_index("category")
    await projects_collection.create_index("tech_stack")
    await projects_collection.create_index("creator_id")
    await projects_collection.create_index("slug", unique=True, sparse=True)
    await project_likes_collection.create_index([("project_id", 1), ("user_id", 1)], unique=True)
    await project_saves_collection.create_index([("project_id", 1), ("user_id", 1)], unique=True)
    await project_comments_collection.create_index("project_id")
    await project_views_collection.create_index("project_id")

    # Proctoring indexes
    await proctoring_tests_collection.create_index("company_id")
    await proctoring_tests_collection.create_index("status")
    await proctoring_tests_collection.create_index([("created_at", DESCENDING)])
    await proctoring_sessions_collection.create_index("test_id")
    await proctoring_sessions_collection.create_index("user_id")
    await proctoring_sessions_collection.create_index("status")
    await proctoring_sessions_collection.create_index([("started_at", DESCENDING)])
    await proctoring_flags_collection.create_index("session_id")
    await proctoring_flags_collection.create_index("type")
    await proctoring_flags_collection.create_index("severity")
    await proctoring_flags_collection.create_index([("timestamp", DESCENDING)])

    # Device Testing indexes
    await device_test_results_collection.create_index([("user_id", 1), ("test_date", -1)])
    await device_test_results_collection.create_index("user_id")
    await user_device_settings_collection.create_index("user_id", unique=True)

    print(f"[MongoDB] Connected successfully to '{settings.MONGODB_DB_NAME}' at {settings.MONGODB_URL}")
