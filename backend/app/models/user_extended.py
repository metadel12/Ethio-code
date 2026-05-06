from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
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

class Location(BaseModel):
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class Skill(BaseModel):
    name: str
    level: int = Field(ge=1, le=100)
    endorsements: int = 0
    last_used: Optional[datetime] = None

class Certification(BaseModel):
    name: str
    issuer: str
    date_earned: datetime
    expiry_date: Optional[datetime] = None
    credential_id: Optional[str] = None

class ProfessionalProfile(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    experience_years: Optional[int] = None
    skills: List[Skill] = []
    certifications: List[Certification] = []
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    personal_website: Optional[str] = None
    resume_url: Optional[str] = None

class Badge(BaseModel):
    id: PyObjectId
    earned_at: datetime
    progress: int = 0

class LearningProfile(BaseModel):
    level: str = "beginner"
    learning_goals: List[str] = []
    preferred_languages: List[str] = []
    weekly_goal_hours: int = 0
    learning_streak: int = 0
    total_hours: int = 0
    xp_points: int = 0
    rank: int = 0
    badges: List[Badge] = []

class PayoutMethod(BaseModel):
    telebirr: Optional[str] = None
    cbe: Optional[str] = None
    paypal: Optional[str] = None
    stripe: Optional[str] = None

class CreatorProfile(BaseModel):
    bio: Optional[str] = None
    specialties: List[str] = []
    total_templates: int = 0
    total_blogs: int = 0
    total_sales: int = 0
    total_earnings: float = 0
    rating: float = 0
    followers: int = 0
    verified: bool = False
    payout_method: Optional[PayoutMethod] = None

class EnterpriseSettings(BaseModel):
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    manager_id: Optional[PyObjectId] = None
    reporting_line: List[PyObjectId] = []
    compliance_training_completed: bool = False
    sso_enabled: bool = False

class NotificationPreferences(BaseModel):
    email: bool = True
    push: bool = True
    sms: bool = False
    newsletter: bool = True

class DashboardWidget(BaseModel):
    widget_id: str
    position: int
    visible: bool = True

class UserPreferences(BaseModel):
    theme: str = "system"
    language: str = "en"
    currency: str = "ETB"
    notifications: NotificationPreferences = NotificationPreferences()
    dashboard_widgets: List[DashboardWidget] = []
    default_view: Optional[str] = None

class UserExtended(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    phone: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[Location] = None
    password_hash: str
    auth_provider: str = "local"
    email_verified: bool = False
    phone_verified: bool = False
    two_factor_enabled: bool = False
    two_factor_secret: Optional[str] = None
    backup_codes: List[str] = []
    role: str = "developer"
    permissions: List[str] = []
    teams: List[PyObjectId] = []
    organization_id: Optional[PyObjectId] = None
    professional: Optional[ProfessionalProfile] = None
    learning: LearningProfile = LearningProfile()
    creator: Optional[CreatorProfile] = None
    enterprise: Optional[EnterpriseSettings] = None
    preferences: UserPreferences = UserPreferences()
    is_active: bool = True
    is_banned: bool = False
    last_login: Optional[datetime] = None
    last_active: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
