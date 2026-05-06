from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "job_seeker"  # job_seeker | company | admin
    # Company-specific
    company_name: Optional[str] = None
    company_registration: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None
    company_size: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "job_seeker"
    is_verified: bool = False
    company_name: Optional[str] = None
    verification_status: Optional[str] = None
    avatar: Optional[str] = None
    skills: list[str] = []
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserPublic
