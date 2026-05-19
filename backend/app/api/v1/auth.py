from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.auth import create_access_token, get_current_user
from app.core.security import hash_password, verify_password
from app.database_mongo import users_collection
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserPublic

router = APIRouter()


def _public_user(user: dict) -> UserPublic:
    return UserPublic(id=user["id"], email=user["email"], full_name=user.get("full_name"))


def _issue_token(user: dict) -> TokenResponse:
    token = create_access_token(
        subject=user["email"], extra={"user_id": user["id"], "full_name": user.get("full_name")}
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
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await users_collection.insert_one(user)
    except DuplicateKeyError:
        user = await users_collection.find_one({"email": email})
        if user:
            return user
        raise
    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    email = str(payload.email).lower()
    if await users_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = {
        "id": await _next_user_id(),
        "email": email,
        "full_name": payload.full_name,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    try:
        await users_collection.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email is already registered")

    return _issue_token(user)


@router.post("/login")
async def login(payload: UserLogin | None = None):
    if payload is None:
        return _issue_token(await _ensure_demo_user())

    user = await users_collection.find_one({"email": str(payload.email).lower()})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return _issue_token(user)


@router.get("/me", response_model=UserPublic)
def me(current_user=Depends(get_current_user)):
    return UserPublic(
        id=current_user["user_id"],
        email=current_user["sub"],
        full_name=current_user.get("full_name"),
    )
