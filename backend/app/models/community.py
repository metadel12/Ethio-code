from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# ==================== CONTENT ====================

class SEO(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: List[str] = []

class Blog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    author_id: PyObjectId
    category: str
    tags: List[str] = []
    status: str = "draft"
    views: int = 0
    likes: int = 0
    shares: int = 0
    bookmarks: int = 0
    reading_time: int = 0
    seo: SEO = SEO()
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class BlogComment(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    blog_id: PyObjectId
    user_id: PyObjectId
    parent_id: Optional[PyObjectId] = None
    content: str
    likes: int = 0
    is_approved: bool = False
    is_flagged: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ForumPost(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    content: str
    author_id: PyObjectId
    category: str
    tags: List[str] = []
    views: int = 0
    likes: int = 0
    answers_count: int = 0
    is_solved: bool = False
    solved_answer_id: Optional[PyObjectId] = None
    status: str = "open"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ==================== ANALYTICS ====================

class DeviceInfo(BaseModel):
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[Dict[str, Any]] = None

class UserActivity(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    event_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[PyObjectId] = None
    metadata: Optional[Dict[str, Any]] = None
    device_info: Optional[DeviceInfo] = None
    session_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class DailyAggregate(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    date: datetime
    xp_earned: int = 0
    time_spent: int = 0
    challenges_solved: int = 0
    courses_completed: int = 0
    projects_updated: int = 0
    activities_count: int = 0
    longest_streak: int = 0

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ==================== NOTIFICATIONS ====================

class Notification(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    link: Optional[str] = None
    image: Optional[str] = None
    priority: str = "medium"
    is_read: bool = False
    read_at: Optional[datetime] = None
    is_delivered: bool = False
    delivered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# ==================== ENTERPRISE & TEAMS ====================

class SSOConfig(BaseModel):
    provider: Optional[str] = None
    entity_id: Optional[str] = None
    sso_url: Optional[str] = None
    certificate: Optional[str] = None

class CustomBranding(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    favicon_url: Optional[str] = None

class OrgSettings(BaseModel):
    sso_enabled: bool = False
    saml_config: Optional[SSOConfig] = None
    custom_branding: Optional[CustomBranding] = None
    api_access: bool = False
    webhooks: List[Dict[str, Any]] = []

class Organization(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    slug: str
    logo: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    subscription_plan: str = "free"
    subscription_expiry: Optional[datetime] = None
    settings: OrgSettings = OrgSettings()
    created_by: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TeamMember(BaseModel):
    user_id: PyObjectId
    role: str = "member"
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class Team(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    organization_id: PyObjectId
    name: str
    description: Optional[str] = None
    lead_id: PyObjectId
    members: List[TeamMember] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
