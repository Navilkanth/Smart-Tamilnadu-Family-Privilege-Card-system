from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import (
    User, Family, WelfareScheme, SchemeApplication, ApplicationDraft,
    BenefitCredit, FamilyEligibleScheme,
)
from app.services.document_checker import get_missing_documents, format_document_warnings
from app.services.eligibility_engine import run_eligibility_for_family

schemes_bp = Blueprint("schemes", __name__, url_prefix="/api/schemes")


@schemes_bp.get("/")
def list_schemes():
    lang = request.args.get("lang", "en")
    schemes = WelfareScheme.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict(lang) for s in schemes])


@schemes_bp.get("/eligible")
@jwt_required()
def my_eligible():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"error": "Register family first"}), 404
    lang = request.args.get("lang", user.preferred_language or "en")
    entries = FamilyEligibleScheme.query.filter_by(family_id=family.id).all()
    return jsonify([e.to_dict(lang) for e in entries])


@schemes_bp.post("/eligibility/run")
@jwt_required()
def rerun_eligibility():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"error": "No family"}), 404
    results = run_eligibility_for_family(family)
    lang = user.preferred_language or "en"
    return jsonify([r.to_dict(lang) for r in results])


@schemes_bp.get("/applications")
@jwt_required()
def my_applications():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify([])
    lang = request.args.get("lang", user.preferred_language or "en")
    apps = SchemeApplication.query.filter_by(family_id=family.id).order_by(SchemeApplication.applied_at.desc()).all()
    return jsonify([a.to_dict(lang) for a in apps])


@schemes_bp.post("/applications")
@jwt_required()
def apply_scheme():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"error": "No family"}), 404

    data = request.get_json() or {}
    scheme_id = data.get("scheme_id")
    member_id = data.get("family_member_id")
    scheme = WelfareScheme.query.get(scheme_id)
    if not scheme:
        return jsonify({"error": "Scheme not found"}), 404

    missing = get_missing_documents(family, scheme)
    if missing and not data.get("force"):
        return jsonify({"error": "missing_documents", "missing_documents": missing}), 400

    app = SchemeApplication(
        family_id=family.id,
        family_member_id=member_id,
        scheme_id=scheme_id,
        status="applied",
    )
    db.session.add(app)
    draft = ApplicationDraft.query.filter_by(family_id=family.id, scheme_id=scheme_id).first()
    if draft:
        db.session.delete(draft)
    db.session.commit()
    return jsonify(app.to_dict(user.preferred_language or "en")), 201


@schemes_bp.get("/drafts")
@jwt_required()
def list_drafts():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify([])
    drafts = ApplicationDraft.query.filter_by(family_id=family.id).all()
    return jsonify([d.to_dict() for d in drafts])


@schemes_bp.post("/drafts")
@jwt_required()
def save_draft():
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"error": "No family"}), 404

    data = request.get_json() or {}
    scheme_id = data.get("scheme_id")
    scheme = WelfareScheme.query.get(scheme_id)
    if not scheme:
        return jsonify({"error": "Scheme not found"}), 404

    missing = get_missing_documents(family, scheme)
    lang = data.get("lang", user.preferred_language or "en")
    warnings = format_document_warnings(missing, lang)
    draft = ApplicationDraft.query.filter_by(family_id=family.id, scheme_id=scheme_id).first()
    if not draft:
        draft = ApplicationDraft(family_id=family.id, scheme_id=scheme_id)
        db.session.add(draft)

    draft.current_step = data.get("current_step", draft.current_step)
    draft.draft_data = data.get("draft_data", draft.draft_data or {})
    draft.missing_documents = warnings
    db.session.commit()
    payload = draft.to_dict()
    payload["warnings"] = warnings
    payload["missing_documents"] = missing
    return jsonify(payload)


@schemes_bp.get("/drafts/<int:scheme_id>")
@jwt_required()
def get_draft(scheme_id):
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    if not family:
        return jsonify({"error": "No family"}), 404
    lang = request.args.get("lang", user.preferred_language or "en")
    scheme = WelfareScheme.query.get(scheme_id)
    draft = ApplicationDraft.query.filter_by(family_id=family.id, scheme_id=scheme_id).first()
    if not draft:
        missing = get_missing_documents(family, scheme) if scheme and family else []
        warnings = format_document_warnings(missing, lang)
        return jsonify({
            "current_step": 1,
            "draft_data": {},
            "missing_documents": missing,
            "warnings": warnings,
        })
    payload = draft.to_dict()
    if scheme:
        missing = get_missing_documents(family, scheme)
        payload["missing_documents"] = missing
        payload["warnings"] = format_document_warnings(missing, lang)
    return jsonify(payload)


@schemes_bp.get("/document-check/<int:scheme_id>")
@jwt_required()
def document_check(scheme_id):
    user = User.query.get(int(get_jwt_identity()))
    family = Family.query.filter_by(user_id=user.id).first()
    scheme = WelfareScheme.query.get(scheme_id)
    if not family or not scheme:
        return jsonify({"error": "Not found"}), 404
    lang = request.args.get("lang", user.preferred_language or "en")
    missing = get_missing_documents(family, scheme)
    warnings = format_document_warnings(missing, lang)
    return jsonify({
        "missing_documents": missing,
        "warnings": warnings,
        "ready": len(missing) == 0,
    })
