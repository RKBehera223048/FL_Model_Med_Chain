"""Seed the database with default admin and sample data."""

from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.hospital import Hospital, FLRound, FLRoundStatus
from app.core.security import hash_password
from app.config import settings
from datetime import datetime, timezone


def seed_database(db: Session):
    """Create default admin and sample hospitals if they don't exist."""

    # --- Seed Global Admin ---
    admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            full_name=settings.DEFAULT_ADMIN_NAME,
            hashed_password=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            role=UserRole.GLOBAL_ADMIN,
            is_active=True,
        )
        db.add(admin)
        print(f"[OK] Seeded Global Admin: {settings.DEFAULT_ADMIN_EMAIL}")

    # --- Seed Sample Hospitals ---
    sample_hospitals = [
        {"name": "AIIMS New Delhi", "code": "AIIMS-DEL", "city": "New Delhi", "state": "Delhi"},
        {"name": "CMC Vellore", "code": "CMC-VLR", "city": "Vellore", "state": "Tamil Nadu"},
        {"name": "PGIMER Chandigarh", "code": "PGI-CHD", "city": "Chandigarh", "state": "Chandigarh"},
        {"name": "KEM Hospital Mumbai", "code": "KEM-MUM", "city": "Mumbai", "state": "Maharashtra"},
        {"name": "NIMHANS Bangalore", "code": "NIM-BLR", "city": "Bangalore", "state": "Karnataka"},
    ]

    for h_data in sample_hospitals:
        existing = db.query(Hospital).filter(Hospital.code == h_data["code"]).first()
        if not existing:
            hospital = Hospital(
                name=h_data["name"],
                code=h_data["code"],
                city=h_data["city"],
                state=h_data["state"],
                is_connected=True,
                compute_credits=round(__import__("random").uniform(20, 100), 2),
            )
            db.add(hospital)
            print(f"[OK] Seeded Hospital: {h_data['name']}")

    db.commit()

    # --- Create Hospital Admins for sample hospitals ---
    hospitals = db.query(Hospital).all()
    for hospital in hospitals:
        admin_email = f"admin@{hospital.code.lower().replace('-', '')}.medchain.in"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            hospital_admin = User(
                email=admin_email,
                full_name=f"{hospital.name} Administrator",
                hashed_password=hash_password("Hospital@2026"),
                role=UserRole.HOSPITAL_ADMIN,
                hospital_id=hospital.id,
                is_active=True,
            )
            db.add(hospital_admin)
            print(f"  [OK] Seeded Hospital Admin: {admin_email}")

    # --- Create Sample Doctors ---
    first_hospital = db.query(Hospital).first()
    if first_hospital:
        doctor_email = "dr.sharma@medchain.in"
        existing_doc = db.query(User).filter(User.email == doctor_email).first()
        if not existing_doc:
            doctor = User(
                email=doctor_email,
                full_name="Dr. Priya Sharma",
                hashed_password=hash_password("Doctor@2026"),
                role=UserRole.DOCTOR,
                hospital_id=first_hospital.id,
                is_active=True,
            )
            db.add(doctor)
            print(f"  [OK] Seeded Doctor: {doctor_email}")

    db.commit()

    # --- Seed Sample FL Rounds ---
    import random
    existing_rounds = db.query(FLRound).count()
    if existing_rounds == 0:
        for i in range(1, 8):
            fl_round = FLRound(
                round_number=i,
                status=FLRoundStatus.COMPLETED,
                participating_hospitals=random.randint(3, 5),
                accuracy=round(random.uniform(0.75 + i * 0.02, 0.80 + i * 0.02), 4),
                loss=round(random.uniform(0.05, 0.20 - i * 0.015), 4),
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
            )
            db.add(fl_round)
        db.commit()
        print(f"[OK] Seeded {7} FL training rounds")

    print("[DONE] Database seeding complete!")
