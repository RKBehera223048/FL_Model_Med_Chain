"""Pydantic schemas for user-related endpoints."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    hospital_id: Optional[str] = None


class UserBase(BaseModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str
    role: str = "DOCTOR"
    hospital_id: Optional[str] = None


class HospitalAdminCreate(UserBase):
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    hospital_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    is_active: bool
