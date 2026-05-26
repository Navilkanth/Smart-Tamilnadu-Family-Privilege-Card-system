import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Always load backend/.env (works even if terminal cwd is project root)
_env_path = Path(__file__).resolve().parent / ".env"
# override=True: Windows may have a wrong global DATABASE_URL
load_dotenv(_env_path, override=True)


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    # Auto-rewrite database URL prefix to use psycopg (v3) dialect
    _db_url = os.getenv("DATABASE_URL")
    if _db_url:
        # Fix scheme
        if _db_url.startswith("postgres://"):
            _db_url = _db_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif _db_url.startswith("postgresql://"):
            _db_url = _db_url.replace("postgresql://", "postgresql+psycopg://", 1)

        # Fix Supabase direct URL → pooler URL (Render free tier doesn't support IPv6)
        # Direct: db.XXXX.supabase.co:5432  →  Pooler: aws-0-*.pooler.supabase.com:6543
        import re
        supabase_direct = re.search(r"@db\.([a-z0-9]+)\.supabase\.co:5432", _db_url)
        if supabase_direct:
            project_ref = supabase_direct.group(1)
            # Rewrite user to postgres.PROJECT_REF for pooler
            _db_url = re.sub(
                r"(postgresql\+psycopg://[^:]+):[^@]+@db\.[a-z0-9]+\.supabase\.co:5432/postgres",
                lambda m: _db_url.replace(
                    f"db.{project_ref}.supabase.co:5432",
                    f"aws-0-ap-south-1.pooler.supabase.com:6543"
                ).replace(
                    "postgresql+psycopg://postgres:",
                    f"postgresql+psycopg://postgres.{project_ref}:"
                ),
                _db_url
            )
            # Ensure sslmode is set
            if "sslmode" not in _db_url:
                _db_url += "?sslmode=require"

    SQLALCHEMY_DATABASE_URI = _db_url or "postgresql+psycopg://postgres:postgres@localhost:5432/smart_privilege_card"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "connect_args": {"sslmode": "require"} if (_db_url and "supabase" in _db_url) else {},
    }
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
