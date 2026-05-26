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

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "Smart TN Family Privilege Card API"}

    return app
