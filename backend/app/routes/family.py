import hashlib
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import (
    User, Family, FamilyMember, FamilyDocument, RequiredDocument,
    RegistrationSession, CardTrackingEvent, Notification,
)
from app.services.card_id_generator import generate_privilege_card_id
from app.services.eligibility_engine import run_eligibility_for_family
from app.services.fraud_detection import run_fraud_checks
from app.services.recommendation_engine import run_recommendations_for_family
from app.services.document_checker import (
    get_required_documents_for_profile,
    check_documents_against_uploaded,
    get_missing_documents,
)
from app.models import WelfareScheme

family_bp = Blueprint("family", __name__, url_prefix="/api/family")


@family_bp.get("/documents-guide")
def documents_guide():
    lang = request.args.get("lang", "en")
    docs = RequiredDocument.query.order_by(RequiredDocument.display_order).all()
    return jsonify([d.to_dict(lang) for d in docs])


@family_bp.post("/document-checker")
def document_checker():
    """Public pre-registration document checker."""
    data = request.get_json() or {}
    lang = data.get("lang", request.args.get("lang", "en"))
    flags = {
        "is_farmer": bool(data.get("is_farmer")),
        "has_disability": bool(data.get("has_disability")),
        "is_widow": bool(data.get("is_widow")),
        "needs_education": bool(data.get("needs_education")),
        "member_removal": bool(data.get("member_removal")),
    }
    marked_have = data.get("documents_have", [])
    required = get_required_documents_for_profile(flags)

    scheme_id = data.get("scheme_id")
    if scheme_id:
        scheme = WelfareScheme.query.get(scheme_id)
        if scheme:
            from app.services.document_checker import SCHEME_REQUIRED_DOCS, DOC_LABELS
            required_codes = {d["code"] for d in required}
            extra = list(SCHEME_REQUIRED_DOCS["default"])
            if scheme.requires_farmer:
                extra.extend(SCHEME_REQUIRED_DOCS["farmer"])
            if scheme.category == "education":
                extra.extend(SCHEME_REQUIRED_DOCS["education"])
            if scheme.requires_disability:
                extra.extend(SCHEME_REQUIRED_DOCS["disability"])
            if scheme.requires_widow:
                extra.extend(SCHEME_REQUIRED_DOCS["widow"])
            for code in extra:
                if code not in required_codes:
                    en, ta = DOC_LABELS.get(code, (code, code))
                    required.append({"code": code, "name_en": en, "name_ta": ta, "is_conditional": True})
                    required_codes.add(code)

    result = check_documents_against_uploaded(required, [], marked_have)
    if lang == "ta":
        for d in result["required"]:
            d["name"] = d.get("name_ta", d["name_en"])
        for d in result["missing_documents"]:
            d["name"] = d.get("name_ta", d["name_en"])
    else:
        for d in result["required"]:
            d["name"] = d["name_en"]
        for d in result["missing_documents"]:
            d["name"] = d["name_en"]
    return jsonify(result)


@family_bp.get("/document-checker/status")
@jwt_required()
def document_checker_status():
    """Document checker for logged-in family (uploaded vs required)."""
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    lang = request.args.get("lang", user.preferred_language or "en")
    scheme_id = request.args.get("scheme_id", type=int)

    if not family:
        return jsonify({"error": "no_family", "message": "Register your family first"}), 404

    flags = {
        "is_farmer": any(m.farmer_status for m in family.members),
        "has_disability": any(m.disability_status for m in family.members),
        "is_widow": any(m.widow_status for m in family.members),
        "needs_education": any((m.age or 0) < 25 for m in family.members),
        "member_removal": False,
    }
    required = get_required_documents_for_profile(flags)
    uploaded = [d.document_code for d in family.documents]

    missing_scheme = []
    if scheme_id:
        scheme = WelfareScheme.query.get(scheme_id)
        if scheme:
            missing_scheme = get_missing_documents(family, scheme)

    result = check_documents_against_uploaded(required, uploaded, [])
    result["scheme_id"] = scheme_id
    result["scheme_missing"] = missing_scheme
    result["uploaded_documents"] = [d.to_dict() for d in family.documents]
    if lang == "ta":
        for d in result["required"]:
            d["name"] = d.get("name_ta", d["name_en"])
        for d in result["missing_documents"]:
            d["name"] = d.get("name_ta", d["name_en"])
    else:
        for d in result["required"]:
            d["name"] = d["name_en"]
        for d in result["missing_documents"]:
            d["name"] = d["name_en"]
    return jsonify(result)


@family_bp.post("/registration-session")
@jwt_required()
def save_registration_session():
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}
    token = data.get("session_token") or secrets.token_hex(32)
    session = RegistrationSession.query.filter_by(session_token=token).first()
    if not session:
        session = RegistrationSession(
            user_id=user.id,
            session_token=token,
            expires_at=datetime.utcnow() + timedelta(days=7),
        )
        db.session.add(session)
    session.current_step = data.get("current_step", session.current_step)
    session.form_data = data.get("form_data", session.form_data or {})
    session.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(session.to_dict())


@family_bp.get("/registration-session/<token>")
@jwt_required()
def get_registration_session(token):
    session = RegistrationSession.query.filter_by(session_token=token).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(session.to_dict())


@family_bp.post("/register")
@jwt_required()
def register_family():
    user = User.query.get(int(get_jwt_identity()))
    if user.role != "citizen":
        return jsonify({"error": "Only citizens can register families"}), 403
    if Family.query.filter_by(user_id=user.id).first():
        return jsonify({"error": "Family already registered"}), 409

    data = request.get_json() or {}
    members_data = data.get("members", [])
    if not members_data:
        return jsonify({"error": "At least one family member required"}), 400

    card_id = generate_privilege_card_id()
    family = Family(
        user_id=user.id,
        privilege_card_id=card_id,
        family_head_name=data.get("family_head_name", members_data[0].get("name", "")),
        address=data.get("address", ""),
        district=data.get("district"),
        pincode=data.get("pincode"),
        contact_number=data.get("contact_number", user.phone or ""),
        email=data.get("email", user.email),
        registration_status="pending",
        card_status="submitted",
    )
    db.session.add(family)
    db.session.flush()

    for i, m in enumerate(members_data):
        aadhaar = m.get("aadhaar", "")
        aadhaar_hash = hashlib.sha256(aadhaar.encode()).hexdigest() if aadhaar else None
        age = int(m.get("age", 0))
        member = FamilyMember(
            family_id=family.id,
            name=m.get("name"),
            age=age,
            gender=m.get("gender", "other"),
            occupation=m.get("occupation"),
            income=m.get("income", 0),
            education_status=m.get("education_status"),
            disability_status=bool(m.get("disability_status")),
            farmer_status=bool(m.get("farmer_status")),
            widow_status=bool(m.get("widow_status")),
            senior_citizen_status=bool(m.get("senior_citizen_status")) or age >= 60,
            aadhaar_hash=aadhaar_hash,
            relationship=m.get("relationship", "member"),
            is_head=bool(m.get("is_head")) or i == 0,
        )
        db.session.add(member)

    for doc in data.get("documents", []):
        db.session.add(FamilyDocument(
            family_id=family.id,
            document_code=doc.get("document_code"),
            file_name=doc.get("file_name"),
            verification_status=doc.get("verification_status", "pending"),
        ))

    db.session.add(CardTrackingEvent(family_id=family.id, status="submitted", notes="Registration submitted"))
    db.session.add(Notification(
        user_id=user.id,
        family_id=family.id,
        title_en="Registration Successful",
        title_ta="பதிவு வெற்றிகரமாக முடிந்தது",
        message_en=f"Your Family Privilege Card ID is {card_id}. Card processing has started.",
        message_ta=f"உங்கள் குடும்ப சிறப்பு அட்டை ஐடி: {card_id}",
        notification_type="registration",
    ))
    db.session.commit()

    run_eligibility_for_family(family)
    run_fraud_checks(family)
    run_recommendations_for_family(family)

    return jsonify({
        "message": "Family registered successfully",
        "family": family.to_dict(include_members=True),
        "privilege_card_id": card_id,
    }), 201


@family_bp.get("/my-family")
@jwt_required()
def my_family():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"registered": False}), 200
    lang = request.args.get("lang", user.preferred_language or "en")
    return jsonify({
        "registered": True,
        "family": family.to_dict(include_members=True),
        "lang": lang,
    })


@family_bp.get("/dashboard")
@jwt_required()
def dashboard():
    from app.models import FamilyEligibleScheme, SchemeApplication, Complaint, Notification
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"error": "No family registered"}), 404

    lang = request.args.get("lang", user.preferred_language or "en")
    eligible = FamilyEligibleScheme.query.filter_by(family_id=family.id).all()
    applications = SchemeApplication.query.filter_by(family_id=family.id).all()
    complaints = Complaint.query.filter_by(user_id=user.id).order_by(Complaint.created_at.desc()).limit(5).all()
    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(10).all()
    documents = family.documents

    pending_benefits = [a for a in applications if a.status in ("applied", "under_verification", "pending")]
    received = [a for a in applications if a.status in ("approved", "benefit_credited")]

    return jsonify({
        "privilege_card_id": family.privilege_card_id,
        "family": family.to_dict(include_members=True),
        "registration_status": family.registration_status,
        "card_status": family.card_status,
        "eligible_schemes": [e.to_dict(lang) for e in eligible],
        "applications": [a.to_dict(lang) for a in applications],
        "pending_benefits": [a.to_dict(lang) for a in pending_benefits],
        "benefits_received": [a.to_dict(lang) for a in received],
        "notifications": [n.to_dict(lang) for n in notifications],
        "documents": [d.to_dict() for d in documents],
        "recent_complaints": [c.to_dict() for c in complaints],
        "card_tracking": [e.to_dict() for e in family.card_events],
    })
