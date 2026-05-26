from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Family, HelpdeskContact
from app.services.voice_assistant import answer_eligibility_question

support_bp = Blueprint("support", __name__, url_prefix="/api/support")


@support_bp.get("/helpdesk-contacts")
def helpdesk_contacts():
    lang = request.args.get("lang", "en")
    contacts = HelpdeskContact.query.filter_by(is_active=True).all()
    return jsonify([c.to_dict(lang) for c in contacts])


@support_bp.post("/ask")
@jwt_required()
def ask_assistant():
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}
    question = data.get("question", "")
    lang = data.get("lang", user.preferred_language or "en")
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({
            "answer": "Please complete family registration first." if lang == "en"
            else "முதலில் குடும்ப பதிவை முடிக்கவும்.",
        })
    answer = answer_eligibility_question(family, question, lang)
    return jsonify({"answer": answer, "lang": lang})
