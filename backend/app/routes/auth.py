from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    full_name = data.get("full_name", "").strip()
    phone = data.get("phone", "")
    role = data.get("role", "citizen")

    if role not in ("citizen", "admin", "helpdesk"):
        role = "citizen"

    if not email or not password or not full_name:
        return jsonify({"error": "Email, password, and full name are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(email=email, full_name=full_name, phone=phone, role=role)
    user.set_password(password)
    if data.get("preferred_language") in ("en", "ta"):
        user.preferred_language = data["preferred_language"]
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "citizen")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email, full_name=email.split('@')[0], phone="0000000000", role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    else:
        user.role = role
        db.session.commit()

    if not user.is_active:
        return jsonify({"error": "Account disabled"}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())
