import base64
import hashlib
import hmac
import json
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


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": subject, "exp": int(expires_at.timestamp()), **(extra or {})}
    body = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), body.encode("utf-8"), hashlib.sha256
    ).digest()
    return f"{body}.{_b64encode(signature)}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        body, signature = token.split(".", 1)
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode("utf-8"), body.encode("utf-8"), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(_b64decode(signature), expected_signature):
            raise ValueError("Invalid signature")

        payload = json.loads(_b64decode(body))
        if payload["exp"] < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("Token expired")
        return payload
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
        )
    return decode_access_token(credentials.credentials)
