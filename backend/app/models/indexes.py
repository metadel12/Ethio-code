"""
MongoDB collection indexes and initialization for all EthioCode collections.
Call setup_indexes() on app startup.
"""
from motor.motor_asyncio import AsyncIOMotorDatabase


async def setup_indexes(db: AsyncIOMotorDatabase):
    # users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    await db.users.create_index("organization_id")
    await db.users.create_index("is_active")
    await db.users.create_index("created_at")

    # user_courses
    await db.user_courses.create_index("user_id")
    await db.user_courses.create_index("course_id")
    await db.user_courses.create_index([("user_id", 1), ("course_id", 1)], unique=True)
    await db.user_courses.create_index("status")

    # user_challenges
    await db.user_challenges.create_index("user_id")
    await db.user_challenges.create_index("challenge_id")
    await db.user_challenges.create_index("status")

    # user_projects
    await db.user_projects.create_index("user_id")
    await db.user_projects.create_index("status")
    await db.user_projects.create_index("is_featured")

    # templates
    await db.templates.create_index("slug", unique=True)
    await db.templates.create_index("creator_id")
    await db.templates.create_index("category")
    await db.templates.create_index("status")
    await db.templates.create_index("is_featured")
    await db.templates.create_index("is_premium")
    await db.templates.create_index([("title", "text"), ("description", "text"), ("tags", "text")])

    # template_purchases
    await db.template_purchases.create_index("user_id")
    await db.template_purchases.create_index("template_id")
    await db.template_purchases.create_index("transaction_id", unique=True)
    await db.template_purchases.create_index("status")

    # template_reviews
    await db.template_reviews.create_index("template_id")
    await db.template_reviews.create_index("user_id")
    await db.template_reviews.create_index([("user_id", 1), ("template_id", 1)], unique=True)

    # jobs
    await db.jobs.create_index("company_id")
    await db.jobs.create_index("is_active")
    await db.jobs.create_index("is_featured")
    await db.jobs.create_index("employment_type")
    await db.jobs.create_index("experience_level")
    await db.jobs.create_index("posted_date")
    await db.jobs.create_index([("title", "text"), ("description", "text"), ("skills_required", "text")])

    # job_applications
    await db.job_applications.create_index("job_id")
    await db.job_applications.create_index("user_id")
    await db.job_applications.create_index([("user_id", 1), ("job_id", 1)], unique=True)
    await db.job_applications.create_index("status")
    await db.job_applications.create_index("applied_at")

    # blogs
    await db.blogs.create_index("slug", unique=True)
    await db.blogs.create_index("author_id")
    await db.blogs.create_index("status")
    await db.blogs.create_index("category")
    await db.blogs.create_index("published_at")
    await db.blogs.create_index([("title", "text"), ("content", "text"), ("tags", "text")])

    # blog_comments
    await db.blog_comments.create_index("blog_id")
    await db.blog_comments.create_index("user_id")
    await db.blog_comments.create_index("parent_id")
    await db.blog_comments.create_index("is_approved")

    # forum_posts
    await db.forum_posts.create_index("author_id")
    await db.forum_posts.create_index("category")
    await db.forum_posts.create_index("status")
    await db.forum_posts.create_index("last_activity")
    await db.forum_posts.create_index([("title", "text"), ("content", "text")])

    # user_activities
    await db.user_activities.create_index("user_id")
    await db.user_activities.create_index("event_type")
    await db.user_activities.create_index("entity_id")
    await db.user_activities.create_index("created_at")
    await db.user_activities.create_index("session_id")

    # daily_aggregates
    await db.daily_aggregates.create_index([("user_id", 1), ("date", 1)], unique=True)
    await db.daily_aggregates.create_index("date")

    # notifications
    await db.notifications.create_index("user_id")
    await db.notifications.create_index("is_read")
    await db.notifications.create_index("type")
    await db.notifications.create_index("created_at")

    # organizations
    await db.organizations.create_index("slug", unique=True)
    await db.organizations.create_index("created_by")
    await db.organizations.create_index("subscription_plan")

    # teams
    await db.teams.create_index("organization_id")
    await db.teams.create_index("lead_id")
    await db.teams.create_index("members.user_id")


COLLECTIONS = [
    "users",
    "user_courses",
    "user_challenges",
    "user_projects",
    "templates",
    "template_purchases",
    "template_reviews",
    "jobs",
    "job_applications",
    "blogs",
    "blog_comments",
    "forum_posts",
    "user_activities",
    "daily_aggregates",
    "notifications",
    "organizations",
    "teams",
]
