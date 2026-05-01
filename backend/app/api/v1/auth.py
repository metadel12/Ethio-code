from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.auth import create_access_token, get_current_user
from app.core.security import hash_password, verify_password
from app.database_mongo import users_collection
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserPublic

router = APIRouter()


def _public_user(user: dict) -> UserPublic:
    return UserPublic(
        id=int(user["id"]),
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
            "user_id": int(user["id"]),
            "full_name": user.get("full_name"),
            "role": user.get("role", "job_seeker"),
        },
    )
    return TokenResponse(access_token=token, user=_public_user(user))


async def _next_user_id() -> int:
    last_user = await users_collection.find_one({}, sort=[("id", -1)])
    return int(last_user.get("id", 0)) + 1 if last_user else 1


async def _ensure_demo_user() -> dict:
    email = "demo@ethiocode.com"
    user = await users_collection.find_one({"email": email})
    if user:
        return user

    user = {
        "id": await _next_user_id(),
        "email": email,
        "full_name": "EthioCode Demo",
        "hashed_password": hash_password("password123"),
        "role": "job_seeker",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "is_verified": True,
        "skills": [],
    }
    try:
        await users_collection.insert_one(user)
    except DuplicateKeyError:
        existing = await users_collection.find_one({"email": email})
        if existing:
            return existing
        raise
    print(f"[Auth] Demo user created in MongoDB: {email}")
    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    email = str(payload.email).lower()
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")

    now = datetime.now(timezone.utc)
    role = payload.role if payload.role in ("job_seeker", "company") else "job_seeker"
    user = {
        "id": await _next_user_id(),
        "email": email,
        "full_name": payload.full_name,
        "hashed_password": hash_password(payload.password),
        "role": role,
        "created_at": now,
        "updated_at": now,
        "is_verified": False,
        "skills": [],
        # Company fields
        "company_name": payload.company_name if role == "company" else None,
        "company_registration": payload.company_registration if role == "company" else None,
        "company_website": payload.company_website if role == "company" else None,
        "company_description": payload.company_description if role == "company" else None,
        "company_size": payload.company_size if role == "company" else None,
        "verification_status": "pending" if role == "company" else None,
    }

    try:
        await users_collection.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email is already registered") from exc

    print(f"[Auth] Registration successful: {email}")
    return _issue_token(user)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin | None = None):
    if payload is None:
        demo_user = await _ensure_demo_user()
        return _issue_token(demo_user)

    user = await users_collection.find_one({"email": str(payload.email).lower()})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"updated_at": datetime.now(timezone.utc)}},
    )
    print(f"[Auth] Login successful: {user['email']}")
    return _issue_token(user)


@router.get("/me", response_model=UserPublic)
def me(current_user=Depends(get_current_user)):
    return UserPublic(
        id=int(current_user["user_id"]),
        email=current_user["sub"],
        full_name=current_user.get("full_name"),
    )
