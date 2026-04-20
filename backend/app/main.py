"""MedChain-FL Global Server — FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables and seed on startup."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created")

    # Seed default data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield  # App runs here

    print("[STOP] Shutting down MedChain-FL Global Server")


app = FastAPI(
    title=settings.APP_NAME,
    description="Privacy-Preserving AI for Indian Healthcare via Federated Learning",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.hospital import router as hospital_router
from app.api.doctor import router as doctor_router

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(hospital_router)
app.include_router(doctor_router)


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
