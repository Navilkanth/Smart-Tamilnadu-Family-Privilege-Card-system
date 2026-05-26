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
        if _db_url.startswith("postgres://"):
            _db_url = _db_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif _db_url.startswith("postgresql://"):
            _db_url = _db_url.replace("postgresql://", "postgresql+psycopg://", 1)

    SQLALCHEMY_DATABASE_URI = _db_url or "postgresql+psycopg://postgres:postgres@localhost:5432/smart_privilege_card"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
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
