"""
StudyOS Backend - FastAPI Application
AI-Powered Student Productivity & Learning Operating System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import auth, study_plans, notes, quizzes, analytics, tasks, habits
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup
    print("🚀 Starting StudyOS Backend...")
    yield
    # Shutdown
    print("👋 Shutting down StudyOS Backend...")


app = FastAPI(
    title="StudyOS API",
    description="AI-Powered Student Productivity & Learning Operating System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(study_plans.router, prefix="/api/v1/study-plans", tags=["Study Plans"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["Notes"])
app.include_router(quizzes.router, prefix="/api/v1/quizzes", tags=["Quizzes"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(habits.router, prefix="/api/v1/habits", tags=["Habits"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Welcome to StudyOS API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
