# How to Run — Smart TN Family Privilege Card System

## Before you start

1. **PostgreSQL** must be installed and running.
2. Create the database (pgAdmin or `psql`):

```sql
CREATE DATABASE smart_privilege_card;
```

3. **`backend\.env`** must match your pgAdmin database:

| Setting | Your value |
|---------|------------|
| Database | `smart_privilege_card` |
| User | `postgres` |
| Host | `localhost` |
| Port | `5432` |

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PG_PASSWORD@localhost:5432/smart_privilege_card
```

**Important:** Do not run `copy .env.example .env` if `.env` already has your correct password — it will overwrite it with a placeholder and cause *password authentication failed*.

---

## Easiest way (Windows)

Open **two** Command Prompt or PowerShell windows in the project folder.

**Window 1 — Backend**

Double-click `start-backend.bat`  
OR run:

```bat
start-backend.bat
```

Wait until you see: `Running on http://127.0.0.1:5000`

**Window 2 — Frontend**

Double-click `start-frontend.bat`  
OR run:

```bat
start-frontend.bat
```

**Browser:** open http://localhost:5173

---

## Manual way (if scripts fail)

### Backend

```powershell
cd "c:\Users\navin\OneDrive\ドキュメント\smart privelage card system web app\backend"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your PostgreSQL password
python run.py
```

> Always use `.\venv\Scripts\python run.py` — not global `python` — so all packages are found.

### Frontend

```powershell
cd "c:\Users\navin\OneDrive\ドキュメント\smart privelage card system web app\frontend"
npm install
npm run dev
```

---

## Demo login accounts

| Role     | Email                 | Password     |
|----------|-----------------------|--------------|
| Citizen  | citizen@example.com   | citizen123   |
| Admin    | admin@tn.gov.in       | admin123     |
| Helpdesk | helpdesk@tn.gov.in    | helpdesk123  |

---

## Quick test

- API health: http://localhost:5000/api/health  
- Site: http://localhost:5173  

---

## Common errors

| Problem | Fix |
|---------|-----|
| `No module named 'flask'` | Activate venv or use `start-backend.bat` |
| `password authentication failed` | Fix `DATABASE_URL` in `backend\.env` |
| `database does not exist` | Run `CREATE DATABASE smart_privilege_card;` |
| Frontend cannot reach API | Keep backend running on port 5000 |
