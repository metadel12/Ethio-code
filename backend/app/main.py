from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    analytics,
    auth,
    blogs,
    code,
    home,
    interviews,
    notifications,
    payments,
    proctoring,
    templates,
    users,
    video,
)
from app.api.v1 import jobs
from app.database_mongo import init_mongodb


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_mongodb()
    yield


app = FastAPI(title="EthioCode API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(home.router, prefix="/api/v1/home", tags=["home"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(blogs.router, prefix="/api/v1/blogs", tags=["blogs"])
app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(code.router, prefix="/api/v1/code", tags=["code"])
app.include_router(video.router, prefix="/api/v1/video", tags=["video"])
app.include_router(proctoring.router, prefix="/api/v1/proctoring", tags=["proctoring"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["templates"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok"}
