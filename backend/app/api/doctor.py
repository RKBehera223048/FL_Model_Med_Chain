"""Doctor / Clinical User API endpoints."""

import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.hospital import Prediction
from app.core.deps import require_role
from app.schemas.hospital import PredictionRequest, PredictionResponse

router = APIRouter(prefix="/api/doctor", tags=["Doctor Interface"])


def simulate_thalassemia_prediction(data: PredictionRequest) -> tuple[float, str, str]:
    """
    Simulated Thalassemia risk prediction based on CBC parameters.
    
    In production, this would call the locally-deployed FL model.
    The scoring uses common clinical heuristics:
    - Low MCV (<80 fL) and MCH (<27 pg) suggest thalassemia trait
    - Low Hemoglobin with normal/high RBC count is suspicious
    - Elevated HbA2 (>3.5%) is diagnostic for beta-thalassemia trait
    - High RDW may help differentiate from iron deficiency
    """
    risk_score = 0.0

    # MCV analysis (Normal: 80-100 fL)
    if data.mcv < 72:
        risk_score += 30
    elif data.mcv < 78:
        risk_score += 20
    elif data.mcv < 80:
        risk_score += 10

    # MCH analysis (Normal: 27-33 pg)
    if data.mch < 24:
        risk_score += 25
    elif data.mch < 27:
        risk_score += 15

    # Hemoglobin (Normal Male: 13.5-17.5, Female: 12-16 g/dL)
    if data.hemoglobin < 10:
        risk_score += 20
    elif data.hemoglobin < 12:
        risk_score += 10

    # RBC Count — High RBC with low MCV suggests thalassemia
    if data.rbc_count > 5.5 and data.mcv < 80:
        risk_score += 15

    # MCHC analysis (Normal: 32-36 g/dL)
    if data.mchc < 30:
        risk_score += 10

    # RDW analysis (Normal: 11.5-14.5%)
    # Low-normal RDW with microcytosis suggests thalassemia over iron deficiency
    if data.rdw < 15 and data.mcv < 80:
        risk_score += 10
    elif data.rdw > 18:
        risk_score -= 5  # High RDW more suggestive of iron deficiency

    # HbA2 analysis (Normal: 2-3.5%) — if provided
    if data.hba2 is not None:
        if data.hba2 > 4.0:
            risk_score += 30
        elif data.hba2 > 3.5:
            risk_score += 20

    # HbF analysis — if provided
    if data.hbf is not None:
        if data.hbf > 2.0:
            risk_score += 15

    # Add slight randomization to simulate model uncertainty
    risk_score += random.uniform(-3, 3)
    risk_score = max(0, min(100, risk_score))
    risk_score = round(risk_score, 1)

    # Determine risk level
    if risk_score >= 70:
        level = "CRITICAL"
        notes = (
            "High probability of Thalassemia trait or disease. "
            "Immediate HPLC/Hemoglobin electrophoresis recommended. "
            "Consider genetic counseling referral."
        )
    elif risk_score >= 45:
        level = "HIGH"
        notes = (
            "Significant indicators for Thalassemia. "
            "Recommend HbA2 quantification and iron studies to differentiate from iron deficiency anemia. "
            "Family history screening advised."
        )
    elif risk_score >= 25:
        level = "MODERATE"
        notes = (
            "Some CBC parameters suggest possible Thalassemia trait. "
            "Recommend follow-up with iron studies (serum ferritin, TIBC) "
            "to rule out iron deficiency as primary cause."
        )
    else:
        level = "LOW"
        notes = (
            "CBC parameters within normal or near-normal ranges for Thalassemia screening. "
            "Continue routine monitoring. Consider retesting if clinical suspicion persists."
        )

    return risk_score, level, notes


@router.post("/predict", response_model=PredictionResponse, status_code=201)
async def predict_thalassemia(
    data: PredictionRequest,
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """Submit CBC parameters and get a Thalassemia risk prediction."""
    risk_score, risk_level, diagnosis_notes = simulate_thalassemia_prediction(data)

    prediction = Prediction(
        doctor_id=current_user.id,
        patient_name=data.patient_name,
        patient_age=data.patient_age,
        patient_gender=data.patient_gender,
        hemoglobin=data.hemoglobin,
        mcv=data.mcv,
        mch=data.mch,
        mchc=data.mchc,
        rbc_count=data.rbc_count,
        rdw=data.rdw,
        hba2=data.hba2,
        hbf=data.hbf,
        risk_score=risk_score,
        risk_level=risk_level,
        diagnosis_notes=diagnosis_notes,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/history", response_model=list[PredictionResponse])
async def get_prediction_history(
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """Get the prediction history for the current doctor."""
    predictions = (
        db.query(Prediction)
        .filter(Prediction.doctor_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(50)
        .all()
    )
    return predictions
