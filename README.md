# Smart Tamil Nadu Family Privilege Card System

AI-enabled welfare delivery platform: families register once, receive a unified privilege card, and get automatic eligibility mapping to Tamil Nadu welfare schemes.

**Stack:** React (Vite) · Flask · PostgreSQL

## Features

| Role | Capabilities |
|------|----------------|
| **Citizen** | Document guide, family registration (resume), AI eligibility, unified dashboard, benefit tracking, complaints, voice assistant (TA/EN), helpdesk contacts |
| **Admin** | Analytics, verify families, fraud alerts, AI recommendations, escalated complaints, card status |
| **Helpdesk** | 24/7 complaint queue, resolve or escalate to admin |

## Quick start (Windows)

See **[HOW_TO_RUN.md](HOW_TO_RUN.md)** for step-by-step instructions.

1. Create PostgreSQL database `smart_privilege_card`
2. Edit `backend/.env` with your PostgreSQL password
3. Double-click **`start-backend.bat`** (wait for port 5000)
4. Double-click **`start-frontend.bat`**
5. Open http://localhost:5173

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

## Database Setup

```sql
CREATE DATABASE smart_privilege_card;
```

Apply schema (optional — Flask also creates tables):

```bash
psql -U postgres -d smart_privilege_card -f database/schema.sql
```

## Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit DATABASE_URL in .env
python run.py
```

API: `http://localhost:5000` · Health: `GET /api/health`

### Demo accounts (seeded on first run)

| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@example.com | citizen123 |
| Admin | admin@tn.gov.in | admin123 |
| Helpdesk | helpdesk@tn.gov.in | helpdesk123 |

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy → PostgreSQL tables
│   │   ├── routes/          # REST API
│   │   └── services/        # AI eligibility, fraud, recommendations
│   ├── config.py
│   └── run.py
├── frontend/src/            # React pages & components
├── database/schema.sql      # Raw PostgreSQL DDL
└── README.md
```

## PostgreSQL Tables

`users`, `families`, `family_members`, `required_documents`, `family_documents`, `welfare_schemes`, `family_eligible_schemes`, `scheme_applications`, `application_drafts`, `benefit_credits`, `card_tracking_events`, `fraud_alerts`, `complaints`, `complaint_messages`, `notifications`, `welfare_recommendations`, `helpdesk_contacts`, `registration_sessions`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `postgresql+psycopg://user:pass@host:5432/smart_privilege_card` |
| `SECRET_KEY` | Flask secret |
| `JWT_SECRET_KEY` | JWT signing key |
| `CORS_ORIGINS` | `http://localhost:5173` |

## Core Flow

1. Citizen views required documents  
2. Registers family → **TNFP** privilege card ID generated  
3. AI eligibility engine maps schemes per member  
4. Dashboard shows schemes, benefits, card tracking  
5. Applications checked for missing documents; drafts resume mid-flow  
6. Fraud checks run on registration  
7. Admin monitors analytics, fraud, recommendations  
8. Helpdesk resolves or escalates complaints  
