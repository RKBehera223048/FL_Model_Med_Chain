"""Hospital Admin API endpoints."""

import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.hospital import Hospital, Prediction
from app.core.deps import require_role
from app.core.security import hash_password
from app.schemas.user import UserCreate, UserResponse
from app.schemas.hospital import HospitalDashboard, HospitalResponse
from app.config import settings

router = APIRouter(prefix="/api/hospital", tags=["Hospital Admin"])


@router.get("/dashboard", response_model=HospitalDashboard)
async def get_hospital_dashboard(
    current_user: User = Depends(require_role(UserRole.HOSPITAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Get hospital-specific dashboard data."""
    hospital = db.query(Hospital).filter(Hospital.id == current_user.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    total_doctors = db.query(User).filter(
        User.hospital_id == hospital.id,
        User.role == UserRole.DOCTOR,
    ).count()

    # Count predictions by doctors in this hospital
    doctor_ids = [
        d.id for d in db.query(User).filter(
            User.hospital_id == hospital.id,
            User.role == UserRole.DOCTOR,
        ).all()
    ]
    total_predictions = db.query(Prediction).filter(
        Prediction.doctor_id.in_(doctor_ids) if doctor_ids else False
    ).count() if doctor_ids else 0

    return HospitalDashboard(
        hospital=hospital,
        total_doctors=total_doctors,
        total_predictions=total_predictions,
        recent_predictions=0,
    )


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.HOSPITAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Upload a local dataset (CSV or images) for FL training."""
    hospital = db.query(Hospital).filter(Hospital.id == current_user.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Create uploads directory
    upload_path = os.path.join(settings.UPLOAD_DIR, hospital.code)
    os.makedirs(upload_path, exist_ok=True)

    # Save the file
    file_path = os.path.join(upload_path, file.filename)
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Update datasets count
    hospital.datasets_uploaded += 1
    db.commit()

    return {
        "message": "Dataset uploaded successfully",
        "filename": file.filename,
        "size_bytes": len(content),
        "total_datasets": hospital.datasets_uploaded,
    }


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_doctor(
    data: UserCreate,
    current_user: User = Depends(require_role(UserRole.HOSPITAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """Create a doctor/nurse account for this hospital."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=UserRole.DOCTOR,
        hospital_id=current_user.hospital_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=list[UserResponse])
async def list_doctors(
    current_user: User = Depends(require_role(UserRole.HOSPITAL_ADMIN)),
    db: Session = Depends(get_db),
):
    """List all doctors/nurses for this hospital."""
    users = db.query(User).filter(
        User.hospital_id == current_user.hospital_id,
        User.role == UserRole.DOCTOR,
    ).order_by(User.created_at.desc()).all()
    return users
