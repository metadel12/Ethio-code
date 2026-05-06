"""Sliding-window in-memory rate limiter.
For production, swap the store with Redis (aioredis).
"""
import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request, status
from app.config import settings

# store: key -> deque of timestamps
_store: dict[str, deque] = defaultdict(deque)


def _check(key: str, limit: int, window: int = 60) -> None:
    now = time.monotonic()
    q = _store[key]
    # evict old entries
    while q and q[0] < now - window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Max {limit} requests/min.",
            headers={"Retry-After": "60"},
        )
    q.append(now)


def rate_limit(limit: int = None, window: int = 60):
    """FastAPI dependency factory. Usage: Depends(rate_limit(100))"""
    _limit = limit or settings.RATE_LIMIT_DEFAULT

    async def _dep(request: Request):
        ip = request.client.host if request.client else "unknown"
        key = f"{ip}:{request.url.path}"
        _check(key, _limit, window)

    return _dep


# Convenience pre-built limiters
rate_limit_auth   = rate_limit(settings.RATE_LIMIT_AUTH)
rate_limit_api    = rate_limit(settings.RATE_LIMIT_API)
rate_limit_upload = rate_limit(settings.RATE_LIMIT_UPLOAD)
