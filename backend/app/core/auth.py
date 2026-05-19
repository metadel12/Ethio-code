import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


def _b64encode(payload: bytes) -> str:
    return base64.urlsafe_b64encode(payload).decode("utf-8").rstrip("=")


def _b64decode(payload: str) -> bytes:
    padding = "=" * (-len(payload) % 4)
    return base64.urlsafe_b64decode(payload + padding)


def _make_token(payload: dict) -> str:
    body = _b64encode(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(settings.SECRET_KEY.encode(), body.encode(), hashlib.sha256).digest()
    return f"{body}.{_b64encode(sig)}"


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _make_token({"sub": subject, "exp": int(exp.timestamp()), "type": "access", **(extra or {})})


def create_refresh_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = secrets.token_hex(16)
    return _make_token({"sub": subject, "exp": int(exp.timestamp()), "type": "refresh", "jti": jti, **(extra or {})})


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        body, signature = token.split(".", 1)
        expected = hmac.new(settings.SECRET_KEY.encode(), body.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64decode(signature), expected):
            raise ValueError("Invalid signature")
        payload = json.loads(_b64decode(body))
        if payload["exp"] < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("Token expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")
    payload = decode_access_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    return payload


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    """Get current user if authenticated, otherwise return None"""
    if credentials is None:
        return None
    
    try:
        payload = decode_access_token(credentials.credentials)
        if payload.get("type") != "access":
            return None
        return payload
    except:
        return None
