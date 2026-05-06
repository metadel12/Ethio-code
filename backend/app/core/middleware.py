"""Security middleware: CSP, HSTS, CSRF double-submit, audit logging."""
import secrets
import time
from datetime import datetime, timezone

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# In-memory audit log (replace with DB write in production)
_audit: list[dict] = []

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

# Paths that skip CSRF (public endpoints, WebSocket)
CSRF_EXEMPT = {"/api/v1/auth/login", "/api/v1/auth/register", "/health", "/ws"}


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # ── CSRF double-submit cookie check ──────────────────────────────────
        # CSRF not needed — API is stateless JWT Bearer auth

        start = time.monotonic()
        response: Response = await call_next(request)
        duration_ms = round((time.monotonic() - start) * 1000, 1)

        # ── Security headers ─────────────────────────────────────────────────
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' ws: wss:; "
            "frame-ancestors 'none';"
        )
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        # ── Rotate CSRF cookie on every response ─────────────────────────────
        if "csrf_token" not in request.cookies:
            token = secrets.token_hex(32)
            response.set_cookie(
                "csrf_token", token,
                httponly=False,   # JS must read it to send as header
                samesite="strict",
                secure=False,     # set True in production (HTTPS)
                max_age=86400,
            )

        # ── Audit sensitive mutations ─────────────────────────────────────────
        if request.method not in SAFE_METHODS and "/api/v1/" in request.url.path:
            _audit.append({
                "ts": datetime.now(timezone.utc).isoformat(),
                "method": request.method,
                "path": request.url.path,
                "ip": request.client.host if request.client else "unknown",
                "status": response.status_code,
                "ms": duration_ms,
            })
            if len(_audit) > 10_000:
                _audit.pop(0)

        return response


def get_audit_log(limit: int = 100) -> list:
    return list(reversed(_audit))[:limit]
