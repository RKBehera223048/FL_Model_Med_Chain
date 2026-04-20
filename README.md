# MedChain-FL — Privacy-Preserving AI for Indian Healthcare

<div align="center">

![MedChain-FL](https://img.shields.io/badge/MedChain--FL-Federated%20Learning-0ea5e9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xOS41IDEyLjU3MmwtNy41IDQuMjg2LTcuNS00LjI4NiIvPjxwYXRoIGQ9Ik0xOS41IDcuNzE0bC03LjUgNC4yODYtNy41LTQuMjg2Ii8+PHBhdGggZD0iTTEyIDIuMjg2bDcuNSA0LjI4Ni03LjUgNC4yODYtNy41LTQuMjg2eiIvPjwvc3ZnPg==)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2014-000?style=for-the-badge&logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A Data-Collaboration-as-a-Service platform enabling privacy-preserving AI for Indian Healthcare via Federated Learning.**

*Detect Thalassemia and chronic blood disorders without exposing raw patient data.*

</div>

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Global Server  │────▶│  PostgreSQL   │
│  Next.js 14  │     │     FastAPI      │     │   Database    │
│  Port 3000   │     │    Port 8000     │     │  Port 5432    │
└──────────────┘     └────────┬─────────┘     └──────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼                   ▼
             ┌────────────┐     ┌────────────┐
             │ FL Worker 1│     │ FL Worker 2│
             │ AIIMS Delhi│     │ CMC Vellore│
             └────────────┘     └────────────┘
```

## ✨ Features

- **🔒 Zero Data Exposure** — Patient records never leave hospital infrastructure. Only encrypted model gradients are shared.
- **🧠 Federated Intelligence** — AI models travel to hospitals to train locally, then aggregate globally.
- **🏥 Multi-Hospital Network** — Decentralized network of hospital nodes with no single point of failure.
- **🩺 Thalassemia Detection** — Purpose-built CBC-based risk assessment with clinical recommendations.
- **🔐 3-Tier RBAC** — JWT authentication with Global Admin → Hospital Admin → Doctor roles.
- **💰 Compute Credits** — Hospitals earn credits for participating in FL training rounds.

## 🎯 User Roles

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Global Admin** | Full platform | Manage hospitals, start FL rounds, view global stats |
| **Hospital Admin** | Hospital-specific | Upload datasets, manage doctors, view credits |
| **Doctor/Nurse** | Diagnostic tools | Run Thalassemia predictions, view history |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/RKBehera/FL_Model_Med_Chain.git
cd FL_Model_Med_Chain

# Terminal 1: Start Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
```

### Docker Compose (Full Stack)

```bash
docker-compose up --build
```

This spins up: PostgreSQL, FastAPI Global Server, Next.js Frontend, and 2 FL Worker nodes.

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Global Admin | `admin@medchain.in` | `MedChain@2026` |
| Hospital Admin (AIIMS) | `admin@aiimsdel.medchain.in` | `Hospital@2026` |
| Doctor | `dr.sharma@medchain.in` | `Doctor@2026` |

## 📁 Project Structure

```
FL_Model_Med_Chain/
├── backend/                    # FastAPI Global Server
│   ├── app/
│   │   ├── api/               # REST API endpoints
│   │   │   ├── auth.py        # Login, JWT tokens
│   │   │   ├── admin.py       # Global admin operations
│   │   │   ├── hospital.py    # Hospital admin operations
│   │   │   └── doctor.py      # Thalassemia prediction
│   │   ├── core/              # Security & RBAC
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic validation
│   │   ├── main.py            # App entry point
│   │   └── seed.py            # Sample data seeder
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # Next.js 14 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── login/         # Auth page
│   │   │   ├── admin/         # Global admin dashboard
│   │   │   ├── hospital/      # Hospital admin dashboard
│   │   │   └── doctor/        # Doctor diagnostic interface
│   │   └── lib/               # API client, auth context
│   ├── Dockerfile
│   └── package.json
│
├── fl_worker/                  # FL Worker Node Template
│   ├── worker.py              # Simulated local training
│   └── Dockerfile
│
├── docker-compose.yml          # Full stack orchestration
└── .env                        # Environment variables
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 19, Tailwind CSS v4, Framer Motion |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Database | SQLite (dev) / PostgreSQL (production) |
| Infrastructure | Docker, Docker Compose |

## 📊 Seeded Sample Data

The backend auto-seeds on first startup:
- **5 Hospitals**: AIIMS Delhi, CMC Vellore, PGIMER Chandigarh, KEM Mumbai, NIMHANS Bangalore
- **7 FL Training Rounds**: With progressively improving accuracy (80% → 93%)
- **Compute Credits**: Distributed across participating hospitals

## 📄 License

This project is built for educational and research purposes. Not intended for clinical use without proper validation and regulatory approval.

---

<div align="center">
  <b>Built with ❤️ for Indian Healthcare</b>
</div>
