from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# ==================== SQLAlchemy for Existing Code ====================
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    """Initialize SQLAlchemy database"""
    from app.models import template, user
    Base.metadata.create_all(bind=engine)


# ==================== MongoDB for Backend Interview Features ====================

class Database:
    """MongoDB Database Manager"""
    client: Optional[AsyncIOMotorClient] = None
    db = None
    _collections_initialized = False

    def __getattr__(self, name: str):
        """Allow accessing collections as attributes"""
        if self.db is None:
            raise RuntimeError("MongoDB is not connected. Call db.connect() first.")
        return self.db[name]

    @classmethod
    async def connect(cls):
        """Connect to MongoDB and initialize collections"""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.DATABASE_NAME]
            
            # Test connection
            await cls.client.admin.command("ping")
            print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")
            
            # Initialize collections
            await cls._init_collections()
            cls._collections_initialized = True
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            print("⚠️ Backend interview features will use fallback data without MongoDB")
            cls.db = None

    @classmethod
    async def _init_collections(cls):
        """Create all required collections if they don't exist"""
        if cls.db is None:
            return
        
        # Define all collections needed for the application
        collections_to_create = [
            # User Data
            "users",
            "user_profiles",
            "user_sessions",
            "user_activities",
            "user_preferences",
            
            # Device Testing
            "device_test_results",
            "user_device_settings",
            
            # Interviews
            "interviews",
            "frontend_questions",
            "backend_questions",
            "user_interview_attempts",
            "interview_progress",
            
            # Jobs
            "jobs",
            "job_applications",
            "saved_jobs",
            "job_alerts",
            "companies",
            
            # Projects
            "projects",
            "project_likes",
            "project_saves",
            "project_comments",
            "project_views",
            
            # Code & Templates
            "code_submissions",
            "code_snippets",
            "templates",
            "template_purchases",
            "template_reviews",
            
            # Video & Proctoring
            "video_sessions",
            "video_recordings",
            "proctoring_tests",
            "proctoring_sessions",
            "proctoring_flags",
            "proctoring_rules_history",
            
            # Blogs & Content
            "blogs",
            "blog_comments",
            "blog_likes",
            "blog_bookmarks",
            
            # Learning
            "courses",
            "user_courses",
            "challenges",
            "user_challenges",
            "learning_paths",
            "user_learning_paths",
            "badges",
            "user_badges",
            "achievements",
            "user_achievements",
            "leaderboard",
            
            # Payments & Notifications
            "payments",
            "subscriptions",
            "notifications",
            "user_notifications",
            
            # Analytics & Logs
            "analytics_events",
            "error_logs",
            "api_logs",
            
            # Social & Community
            "forum_posts",
            "forum_comments",
            "user_followers",
            "user_favorites",
            
            # System
            "system_settings",
            "feature_flags",
            "maintenance_logs"
        ]
        
        existing_collections = await cls.db.list_collection_names()
        
        for collection in collections_to_create:
            if collection not in existing_collections:
                try:
                    await cls.db.create_collection(collection)
                    print(f"  📁 Created collection: {collection}")
                except Exception as e:
                    print(f"  ⚠️ Could not create {collection}: {e}")
            else:
                print(f"  ✅ Collection exists: {collection}")
        
        # Create indexes for performance
        await cls._create_indexes()
        print("✅ MongoDB collections and indexes ready")

    @classmethod
    async def _create_indexes(cls):
        """Create indexes for better query performance"""
        if cls.db is None:
            return
        
        try:
            # Users indexes
            await cls.db.users.create_index("email", unique=True)
            await cls.db.users.create_index("username", unique=True)
            
            # Jobs indexes
            await cls.db.jobs.create_index("posted_date", -1)
            await cls.db.jobs.create_index("company_id")
            await cls.db.jobs.create_index("skills_required")
            await cls.db.jobs.create_index("location_city")
            await cls.db.jobs.create_index("is_active")
            
            # Job Applications indexes
            await cls.db.job_applications.create_index("user_id")
            await cls.db.job_applications.create_index("job_id")
            await cls.db.job_applications.create_index("status")
            await cls.db.job_applications.create_index([("user_id", 1), ("job_id", 1)])
            
            # Projects indexes
            await cls.db.projects.create_index("creator_id")
            await cls.db.projects.create_index("created_at", -1)
            await cls.db.projects.create_index("tech_stack")
            await cls.db.projects.create_index("project_type")
            await cls.db.projects.create_index("is_published")
            await cls.db.projects.create_index("status")
            
            # Project Likes/Saves indexes
            await cls.db.project_likes.create_index([("user_id", 1), ("project_id", 1)], unique=True)
            await cls.db.project_saves.create_index([("user_id", 1), ("project_id", 1)], unique=True)
            
            # Device Test Results indexes
            await cls.db.device_test_results.create_index("user_id")
            await cls.db.device_test_results.create_index("test_date", -1)
            
            # User Device Settings
            await cls.db.user_device_settings.create_index("user_id", unique=True)
            
            # Video Sessions indexes
            await cls.db.video_sessions.create_index("session_id", unique=True)
            await cls.db.video_sessions.create_index("status")
            await cls.db.video_sessions.create_index("host_id")
            await cls.db.video_sessions.create_index("scheduled_start")
            
            # Proctoring Sessions indexes
            await cls.db.proctoring_sessions.create_index("user_id")
            await cls.db.proctoring_sessions.create_index("test_id")
            await cls.db.proctoring_sessions.create_index("status")
            await cls.db.proctoring_sessions.create_index("started_at", -1)
            
            # Proctoring Flags indexes
            await cls.db.proctoring_flags.create_index("session_id")
            await cls.db.proctoring_flags.create_index("timestamp", -1)
            await cls.db.proctoring_flags.create_index("severity")
            
            # Blogs indexes
            await cls.db.blogs.create_index("slug", unique=True)
            await cls.db.blogs.create_index("published_at", -1)
            await cls.db.blogs.create_index("author_id")
            await cls.db.blogs.create_index("category")
            
            # Templates indexes
            await cls.db.templates.create_index("category")
            await cls.db.templates.create_index("downloads", -1)
            await cls.db.templates.create_index("rating", -1)
            await cls.db.templates.create_index("creator_id")
            
            # Questions indexes (backend/frontend)
            await cls.db.backend_questions.create_index("category")
            await cls.db.backend_questions.create_index("difficulty")
            await cls.db.backend_questions.create_index("question_type")
            await cls.db.backend_questions.create_index("success_rate", -1)
            
            # User Attempts indexes
            await cls.db.user_interview_attempts.create_index("user_id")
            await cls.db.user_interview_attempts.create_index("question_id")
            await cls.db.user_interview_attempts.create_index("created_at", -1)
            
            # Payments indexes
            await cls.db.payments.create_index("user_id")
            await cls.db.payments.create_index("status")
            await cls.db.payments.create_index("created_at", -1)
            await cls.db.payments.create_index("transaction_id", unique=True)
            
            # Notifications indexes
            await cls.db.notifications.create_index("user_id")
            await cls.db.notifications.create_index("created_at", -1)
            await cls.db.notifications.create_index("is_read")
            
            # Analytics indexes
            await cls.db.analytics_events.create_index("user_id")
            await cls.db.analytics_events.create_index("event_type")
            await cls.db.analytics_events.create_index("created_at", -1)
            
            print("  ✅ Created database indexes for performance")
            
        except Exception as e:
            print(f"  ⚠️ Index creation warning: {e}")

    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB"""
        if cls.client:
            cls.client.close()
            print("✅ Disconnected from MongoDB")

    @classmethod
    def is_connected(cls) -> bool:
        """Check if MongoDB is connected"""
        return cls.client is not None and cls.db is not None


# Create global database instance
db = Database()


# ==================== Helper Functions ====================

async def get_db():
    """Dependency for FastAPI to get database session"""
    return db


def get_mongo_collection(collection_name: str):
    """Helper to get MongoDB collection"""
    if db.db is None:
        raise RuntimeError("MongoDB not connected")
    return db.db[collection_name]