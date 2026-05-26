from flask import Flask
from flask_cors import CORS
from config import config_by_name
from app.extensions import db, migrate, jwt
from app.routes import register_blueprints


def create_app(config_name=None):
    app = Flask(__name__)
    config_name = config_name or "default"
    app.config.from_object(config_by_name[config_name])

    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    register_blueprints(app)

    # Automatically create database tables and seed initial data at startup
    with app.app_context():
        try:
            db.create_all()
            from app.seed import seed_database
            seed_database()
            app.logger.info("Database checked, initialized, and seeded successfully!")
        except Exception as exc:
            app.logger.error(f"Error initializing/seeding database: {exc}")

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "Smart TN Family Privilege Card API"}

    @app.get("/api/db-status")
    def db_status():
        import re
        uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
        masked_uri = re.sub(r":([^@/]+)@", ":****@", uri)
        
        status = "unknown"
        error = None
        try:
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            status = "connected"
        except Exception as e:
            status = "failed"
            error = str(e)
            
        return {
            "status": status,
            "database_uri": masked_uri,
            "error": error
        }

    return app
