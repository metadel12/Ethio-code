import hmac
import os
import random
import string
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import DuplicateKeyError
from typing import Optional

from app.core.auth import create_access_token, create_refresh_token, get_current_user, decode_access_token
from app.core.security import hash_password, verify_password
from app.utils.rate_limiter import rate_limit
from app.database_mongo import (
    users_collection,
    password_reset_tokens_collection,
    email_verification_tokens_collection,
    sessions_collection,
)
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserPublic

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────

def _public_user(user: dict) -> UserPublic:
    return UserPublic(
        id=int(user.get("id", 0)),
        email=user["email"],
        full_name=user.get("full_name"),
        role=user.get("role", "job_seeker"),
        is_verified=user.get("is_verified", False),
        company_name=user.get("company_name"),
        verification_status=user.get("verification_status"),
        avatar=user.get("avatar"),
        skills=user.get("skills", []),
        resume_url=user.get("resume_url"),
        portfolio_url=user.get("portfolio_url"),
    )

def _issue_token(user: dict) -> TokenResponse:
    token = create_access_token(
        subject=user["email"],
        extra={
            "user_id": int(user.get("id", 0)),
            "full_name": user.get("full_name"),
            "role": user.get("role", "job_seeker"),
        },
    )
    refresh = create_refresh_token(
        subject=user["email"],
        extra={"user_id": int(user.get("id", 0))},
    )
    return TokenResponse(access_token=token, refresh_token=refresh, user=_public_user(user))

async def _next_user_id() -> int:
    last = await users_collection.find_one({}, sort=[("id", -1)])
    return int(last.get("id", 0)) + 1 if last else 1

def _random_token(n: int = 48) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))

def _totp_code(secret: str) -> str:
    """Simple 6-digit TOTP simulation (use pyotp in production)."""
    import hashlib, time
    t = int(time.time()) // 30
    h = hmac.new(secret.encode(), str(t).encode(), hashlib.sha256).hexdigest()
    return str(int(h[:6], 16) % 1_000_000).zfill(6)

async def _get_user_by_email(email: str) -> dict:
    user = await users_collection.find_one({"email": email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def _ensure_demo_user() -> dict:
    email = "demo@ethiocode.com"
    user = await users_collection.find_one({"email": email})
    if user:
        return user
    now = datetime.now(timezone.utc)
    user = {
        "id": await _next_user_id(), "email": email,
        "full_name": "EthioCode Demo",
        "hashed_password": hash_password("password123"),
        "role": "job_seeker", "is_verified": True, "skills": [],
        "created_at": now, "updated_at": now,
    }
    try:
        await users_collection.insert_one(user)
    except DuplicateKeyError:
        return await users_collection.find_one({"email": email})
    return user


# ── Schemas ───────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class VerifyEmailRequest(BaseModel):
    token: str

class VerifyPhoneRequest(BaseModel):
    phone: str
    code: str = Field(min_length=4, max_length=6)

class Enable2FARequest(BaseModel):
    secret: str
    code: str = Field(min_length=6, max_length=6)

class Verify2FARequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)
    remember_device: bool = False

class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


# ── POST /register ────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: UserCreate, _rl=Depends(rate_limit(20))):
    email = str(payload.email).lower()
    if await users_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    now = datetime.now(timezone.utc)
    role = payload.role if payload.role in ("job_seeker", "company") else "job_seeker"
    user = {
        "id": await _next_user_id(), "email": email,
        "full_name": payload.full_name,
        "hashed_password": hash_password(payload.password),
        "role": role, "is_verified": False, "skills": [],
        "two_factor_enabled": False, "two_factor_secret": None,
        "preferences": {"theme": "system", "language": "en", "notifications": {"email": True, "push": True}},
        "created_at": now, "updated_at": now,
        **({"company_name": payload.company_name, "verification_status": "approved"} if role == "company" else {}),
    }
    try:
        await users_collection.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create email verification token
    token = _random_token()
    await email_verification_tokens_collection.insert_one({
        "token": token, "user_id": user["id"], "email": email,
        "expires_at": now + timedelta(hours=24), "used": False,
    })
    print(f"[Auth] Verify email token: {token}")
    return _issue_token(user)


# ── POST /login ───────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin | None = None, _rl=Depends(rate_limit(20))):
    if payload is None:
        return _issue_token(await _ensure_demo_user())

    user = await users_collection.find_one({"email": str(payload.email).lower()})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("is_banned"):
        raise HTTPException(status_code=403, detail="Account suspended")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}}
    )
    return _issue_token(user)


# ── POST /logout ──────────────────────────────────────────────
@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    await sessions_collection.update_many(
        {"user_id": current_user.get("user_id")},
        {"$set": {"revoked": True, "revoked_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Logged out successfully"}


# ── POST /refresh ─────────────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"id": current_user.get("user_id")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _issue_token(user)


# ── POST /forgot-password ─────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": str(payload.email).lower()})
    if not user:
        return {"message": "If that email exists, a reset link has been sent"}

    token = _random_token()
    now = datetime.now(timezone.utc)
    await password_reset_tokens_collection.insert_one({
        "token": token, "user_id": user["id"], "email": user["email"],
        "expires_at": now + timedelta(hours=2), "used": False,
    })
    print(f"[Auth] Password reset token for {user['email']}: {token}")
    return {"message": "If that email exists, a reset link has been sent"}


# ── POST /reset-password ──────────────────────────────────────
@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    now = datetime.now(timezone.utc)
    record = await password_reset_tokens_collection.find_one({
        "token": payload.token, "used": False, "expires_at": {"$gt": now}
    })
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    await users_collection.update_one(
        {"id": record["user_id"]},
        {"$set": {"hashed_password": hash_password(payload.new_password), "updated_at": now}}
    )
    await password_reset_tokens_collection.update_one(
        {"_id": record["_id"]}, {"$set": {"used": True}}
    )
    return {"message": "Password reset successfully"}


# ── POST /verify-email ────────────────────────────────────────
@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest):
    now = datetime.now(timezone.utc)
    record = await email_verification_tokens_collection.find_one({
        "token": payload.token, "used": False, "expires_at": {"$gt": now}
    })
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    await users_collection.update_one(
        {"id": record["user_id"]},
        {"$set": {"is_verified": True, "email_verified_at": now, "updated_at": now}}
    )
    await email_verification_tokens_collection.update_one(
        {"_id": record["_id"]}, {"$set": {"used": True}}
    )
    return {"message": "Email verified successfully"}


# ── POST /verify-phone ────────────────────────────────────────
@router.post("/verify-phone")
async def verify_phone(
    payload: VerifyPhoneRequest,
    current_user: dict = Depends(get_current_user)
):
    # In production: verify OTP from SMS provider (Twilio, Africa's Talking)
    # Here we accept "123456" as demo code
    if payload.code not in ("123456",):
        raise HTTPException(status_code=400, detail="Invalid verification code")

    await users_collection.update_one(
        {"id": current_user.get("user_id")},
        {"$set": {"phone": payload.phone, "phone_verified": True, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Phone verified successfully"}


# ── POST /2fa/enable ──────────────────────────────────────────
@router.post("/2fa/enable")
async def enable_2fa(
    payload: Enable2FARequest,
    current_user: dict = Depends(get_current_user)
):
    expected = _totp_code(payload.secret)
    if payload.code != expected:
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    backup_codes = [_random_token(8) for _ in range(8)]
    await users_collection.update_one(
        {"id": current_user.get("user_id")},
        {"$set": {
            "two_factor_enabled": True,
            "two_factor_secret": payload.secret,
            "backup_codes": backup_codes,
            "updated_at": datetime.now(timezone.utc),
        }}
    )
    return {"message": "2FA enabled", "backup_codes": backup_codes}


# ── POST /2fa/verify ──────────────────────────────────────────
@router.post("/2fa/verify")
async def verify_2fa(
    payload: Verify2FARequest,
    current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one({"id": current_user.get("user_id")})
    if not user or not user.get("two_factor_enabled"):
        raise HTTPException(status_code=400, detail="2FA not enabled")

    secret = user.get("two_factor_secret", "")
    expected = _totp_code(secret)
    backup_codes = user.get("backup_codes", [])

    if payload.code != expected and payload.code not in backup_codes:
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    if payload.code in backup_codes:
        backup_codes.remove(payload.code)
        await users_collection.update_one(
            {"_id": user["_id"]}, {"$set": {"backup_codes": backup_codes}}
        )

    return {"message": "2FA verified", "verified": True}


# ── POST /2fa/disable ─────────────────────────────────────────
@router.post("/2fa/disable")
async def disable_2fa(
    payload: Verify2FARequest,
    current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one({"id": current_user.get("user_id")})
    if not user or not user.get("two_factor_enabled"):
        raise HTTPException(status_code=400, detail="2FA not enabled")

    secret = user.get("two_factor_secret", "")
    if payload.code != _totp_code(secret):
        raise HTTPException(status_code=400, detail="Invalid 2FA code")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "two_factor_enabled": False,
            "two_factor_secret": None,
            "backup_codes": [],
            "updated_at": datetime.now(timezone.utc),
        }}
    )
    return {"message": "2FA disabled"}
