"""Auth schemas for registration, login, etc."""
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(...)
    role: str = Field(default="user", regex="^(user|admin|company)$")
    experience_level: Optional[str] = Field(None, regex="^(beginner|intermediate|advanced)$")
    how_heard: Optional[str] = Field(None, max_length=100)
    accept_terms: bool = Field(...)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        # Allow letters, spaces, hyphens
        import re
        if not re.match(r"^[a-zA-Z\s\-']+$", v):
            raise ValueError("Name can only contain letters, spaces, hyphens, and apostrophes")
        return v.strip()

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        # Ethiopian phone: +2519... or 09...
        import re
        if not re.match(r'^(\+2519|09)[0-9]{8}$', v):
            raise ValueError("Please enter a valid Ethiopian phone number")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=32)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(...)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str


class EmailVerificationRequest(BaseModel):
    token: str = Field(..., min_length=32)


class TwoFactorEnableRequest(BaseModel):
    secret: str = Field(...)
    code: str = Field(..., min_length=6, max_length=6)


class TwoFactorVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)
    remember_device: bool = Field(default=False)


class SocialAuthCallback(BaseModel):
    provider: str = Field(..., regex="^(google|github|linkedin)$")
    code: str
    redirect_uri: Optional[str] = None
