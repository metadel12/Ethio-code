from contextlib import asynccontextmanager
import asyncio
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.middleware import SecurityMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from app.database import db

from app.api.v1 import (
    admin,
    auth,
    backend_interview,
    code,
    code_execution,
    ai_feedback,
    device_test,
    enterprise,
    gdpr,
    home,
    interviews,
    learning,
    notifications,
    payments,
    platform,
    pricing,
    proctoring,
    search,
    templates,
    translator,
    users,
    video,
    video_chat,
    dashboard,
    contact,
)
from app.api.v1 import blogs
from app.api.v1 import jobs
from app.api.v1 import projects as projects_api
from app.api.v1 import recommendations
from app.api.v1 import predictions
from app.api.v1 import insights
from app.api.v1 import nlp
from app.api.v1.templates import creator_router
from app.websockets.ws_router import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    print("EthioCode Backend Interview API Started")
    yield
    await db.disconnect()


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
app.include_router(blogs.router, prefix="/api/v1", tags=["blogs"])
app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(backend_interview.router, prefix="/api/v1", tags=["Backend Interview"])
app.include_router(code_execution.router, prefix="/api/v1", tags=["Code Execution"])
app.include_router(device_test.router, prefix="/api/v1", tags=["Device Test"])
app.include_router(ai_feedback.router, prefix="/api/v1", tags=["AI Feedback"])
app.include_router(code.router, prefix="/api/v1/code", tags=["code"])
app.include_router(translator.router, prefix="/api/v1", tags=["translator"])
app.include_router(video.router, prefix="/api/v1/video", tags=["video"])
app.include_router(video_chat.router, prefix="/api/v1", tags=["Video Chat"])
app.include_router(proctoring.router, prefix="/api/v1/proctoring", tags=["proctoring"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(creator_router, prefix="/api/v1/creator", tags=["creator"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(pricing.router, prefix="/api/v1", tags=["pricing"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
# app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["AI Recommendations"])
app.include_router(predictions.router, prefix="/api/v1", tags=["Predictive Analytics"])
app.include_router(insights.router, prefix="/api/v1", tags=["Intelligent Insights"])
app.include_router(nlp.router, prefix="/api/v1", tags=["NLP"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(platform.router, prefix="/api/v1", tags=["platform"])
app.include_router(contact.router, prefix="/api/v1", tags=["contact"])
app.include_router(gdpr.router, prefix="/api/v1", tags=["gdpr"])
app.include_router(ws_router, tags=["WebSocket"])


@app.get("/health")
async def health():
    return {"status": "ok"}
