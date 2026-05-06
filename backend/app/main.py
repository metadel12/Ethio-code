from contextlib import asynccontextmanager
import asyncio
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.middleware import SecurityMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.v1 import (
    admin,
    analytics,
    auth,
    blogs,
    code,
    enterprise,
    gdpr,
    home,
    interviews,
    learning,
    notifications,
    payments,
    platform,
    proctoring,
    search,
    templates,
    users,
    video,
    dashboard,
)
from app.api.v1 import jobs
from app.api.v1 import projects as projects_api
from app.api.v1 import recommendations
from app.api.v1 import predictions
from app.api.v1 import insights
from app.api.v1 import nlp
from app.api.v1.templates import creator_router
from app.websockets.ws_router import router as ws_router
from app.database_mongo import init_mongodb


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_mongodb()
    try:
        yield
    except asyncio.CancelledError:
        pass


app = FastAPI(title="EthioCode API", version="1.0.0", lifespan=lifespan)

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(SecurityMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus — must be called after app is created, before first request
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(home.router, prefix="/api/v1/home", tags=["home"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(projects_api.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(learning.router, prefix="/api/v1/learning", tags=["learning"])
app.include_router(enterprise.router, prefix="/api/v1/enterprise", tags=["enterprise"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(blogs.router, prefix="/api/v1/blogs", tags=["blogs"])
app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(code.router, prefix="/api/v1/code", tags=["code"])
app.include_router(video.router, prefix="/api/v1/video", tags=["video"])
app.include_router(proctoring.router, prefix="/api/v1/proctoring", tags=["proctoring"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(creator_router, prefix="/api/v1/creator", tags=["creator"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["AI Recommendations"])
app.include_router(predictions.router, prefix="/api/v1", tags=["Predictive Analytics"])
app.include_router(insights.router, prefix="/api/v1", tags=["Intelligent Insights"])
app.include_router(nlp.router, prefix="/api/v1", tags=["NLP"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(platform.router, prefix="/api/v1", tags=["platform"])
app.include_router(gdpr.router, prefix="/api/v1", tags=["gdpr"])
app.include_router(ws_router, tags=["WebSocket"])


@app.get("/health")
async def health():
    return {"status": "ok"}
