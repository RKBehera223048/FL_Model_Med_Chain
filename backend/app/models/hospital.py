"""Hospital, FL Round, and Prediction models."""

import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False, default="")
    is_connected = Column(Boolean, default=False)
    compute_credits = Column(Float, default=0.0)
    datasets_uploaded = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    users = relationship("User", back_populates="hospital")


class FLRoundStatus(str, enum.Enum):
    PENDING = "PENDING"
    TRAINING = "TRAINING"
    AGGREGATING = "AGGREGATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class FLRound(Base):
    __tablename__ = "fl_rounds"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    round_number = Column(Integer, nullable=False)
    status = Column(Enum(FLRoundStatus), default=FLRoundStatus.PENDING)
    participating_hospitals = Column(Integer, default=0)
    accuracy = Column(Float, nullable=True)
    loss = Column(Float, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String, nullable=True)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)

    # CBC Parameters
    hemoglobin = Column(Float, nullable=True)
    mcv = Column(Float, nullable=True)  # Mean Corpuscular Volume
    mch = Column(Float, nullable=True)  # Mean Corpuscular Hemoglobin
    mchc = Column(Float, nullable=True)  # Mean Corpuscular Hemoglobin Concentration
    rbc_count = Column(Float, nullable=True)  # Red Blood Cell Count
    rdw = Column(Float, nullable=True)  # Red Cell Distribution Width
    hba2 = Column(Float, nullable=True)  # Hemoglobin A2
    hbf = Column(Float, nullable=True)  # Fetal Hemoglobin

    # Result
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    diagnosis_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
