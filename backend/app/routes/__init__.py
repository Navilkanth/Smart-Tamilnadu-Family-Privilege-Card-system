from app.routes.auth import auth_bp
from app.routes.family import family_bp
from app.routes.schemes import schemes_bp
from app.routes.complaints import complaints_bp
from app.routes.admin import admin_bp
from app.routes.support import support_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(schemes_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(support_bp)
