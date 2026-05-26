@echo off
cd /d "%~dp0backend"
if not exist "venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  python -m venv venv
)
echo Installing backend dependencies...
call venv\Scripts\pip install -r requirements.txt -q
if not exist ".env" (
  echo ERROR: backend\.env missing. Copy .env.example to .env and set your PostgreSQL password.
  copy .env.example .env
  pause
  exit /b 1
)
echo Starting Flask API on http://localhost:5000
call venv\Scripts\python run.py
pause
