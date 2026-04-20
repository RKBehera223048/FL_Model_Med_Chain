"""Pydantic schemas for hospital and FL round endpoints."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class HospitalCreate(BaseModel):
    name: str
    code: str
    city: str
    state: str = ""


class HospitalResponse(BaseModel):
    id: str
    name: str
    code: str
    city: str
    state: str
    is_connected: bool
    compute_credits: float
    datasets_uploaded: int
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_hospitals: int
    connected_hospitals: int
    total_fl_rounds: int
    completed_fl_rounds: int
    total_compute_credits: float
    total_predictions: int


class HospitalDashboard(BaseModel):
    hospital: HospitalResponse
    total_doctors: int
    total_predictions: int
    recent_predictions: int


class FLRoundResponse(BaseModel):
    id: str
    round_number: int
    status: str
    participating_hospitals: int
    accuracy: Optional[float] = None
    loss: Optional[float] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    hemoglobin: float
    mcv: float
    mch: float
    mchc: float
    rbc_count: float
    rdw: float
    hba2: Optional[float] = None
    hbf: Optional[float] = None


class PredictionResponse(BaseModel):
    id: str
    patient_name: Optional[str] = None
    risk_score: float
    risk_level: str
    diagnosis_notes: Optional[str] = None
    hemoglobin: float
    mcv: float
    mch: float
    mchc: float
    rbc_count: float
    rdw: float
    created_at: datetime

    class Config:
        from_attributes = True
