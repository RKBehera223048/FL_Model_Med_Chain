"""Global Admin API endpoints."""

import random
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, UserRole
from app.models.hospital import Hospital, FLRound, FLRoundStatus, Prediction
from app.core.deps import require_role
from app.core.security import hash_password
from app.schemas.user import HospitalAdminCreate, UserResponse
from app.schemas.hospital import (
    HospitalCreate, HospitalResponse, DashboardStats, FLRoundResponse,
)

router = APIRouter(prefix="/api/admin", tags=["Global Admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    current_user: User = Depends(require_role(UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Get global dashboard statistics."""
    total_hospitals = db.query(Hospital).count()
    connected_hospitals = db.query(Hospital).filter(Hospital.is_connected == True).count()
    total_fl_rounds = db.query(FLRound).count()
    completed_fl_rounds = db.query(FLRound).filter(
        FLRound.status == FLRoundStatus.COMPLETED
    ).count()
    total_credits = db.query(func.coalesce(func.sum(Hospital.compute_credits), 0)).scalar()
    total_predictions = db.query(Prediction).count()

    return DashboardStats(
        total_hospitals=total_hospitals,
        connected_hospitals=connected_hospitals,
        total_fl_rounds=total_fl_rounds,
        completed_fl_rounds=completed_fl_rounds,
        total_compute_credits=float(total_credits),
        total_predictions=total_predictions,
    )


@router.get("/hospitals", response_model=list[HospitalResponse])
async def list_hospitals(
    current_user: User = Depends(require_role(UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """List all registered hospitals."""
    hospitals = db.query(Hospital).order_by(Hospital.created_at.desc()).all()
    return hospitals


@router.post("/hospitals", response_model=HospitalResponse, status_code=201)
async def create_hospital(
    data: HospitalCreate,
    current_user: User = Depends(require_role(UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Register a new hospital node."""
    existing = db.query(Hospital).filter(Hospital.code == data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Hospital with code '{data.code}' already exists",
        )

    hospital = Hospital(
        name=data.name,
        code=data.code,
        city=data.city,
        state=data.state,
        is_connected=True,
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.post("/hospitals/{hospital_id}/create-admin", response_model=UserResponse, status_code=201)
async def create_hospital_admin(
    hospital_id: str,
    data: HospitalAdminCreate,
    current_user: User = Depends(require_role(UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Create an admin account for a specific hospital."""
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=UserRole.HOSPITAL_ADMIN,
        hospital_id=hospital_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/fl-rounds", response_model=list[FLRoundResponse])
async def list_fl_rounds(
    current_user: User = Depends(require_role(UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """List all FL training rounds."""
    rounds = db.query(FLRound).order_by(FLRound.round_number.desc()).all()
    return rounds


@router.post("/fl-rounds/start", response_model=FLRoundResponse, status_code=201)
async def start_fl_round(
    current_user: User = Depends(require_role(UserRole.GLOBAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Start a new Federated Learning round (simulated)."""
    # Get the next round number
    last_round = db.query(FLRound).order_by(FLRound.round_number.desc()).first()
    round_number = (last_round.round_number + 1) if last_round else 1

    connected = db.query(Hospital).filter(Hospital.is_connected == True).count()
    if connected == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No connected hospitals to participate",
        )

    # Simulate the FL round
    accuracy = round(random.uniform(0.78, 0.96), 4)
    loss = round(random.uniform(0.04, 0.22), 4)

    fl_round = FLRound(
        round_number=round_number,
        status=FLRoundStatus.COMPLETED,
        participating_hospitals=connected,
        accuracy=accuracy,
        loss=loss,
        started_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(fl_round)

    # Award compute credits to connected hospitals
    hospitals = db.query(Hospital).filter(Hospital.is_connected == True).all()
    for h in hospitals:
        h.compute_credits += round(random.uniform(5.0, 15.0), 2)

    db.commit()
    db.refresh(fl_round)
    return fl_round
