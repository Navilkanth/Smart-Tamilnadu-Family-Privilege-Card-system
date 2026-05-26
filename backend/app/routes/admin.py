from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import (
    User, Family, FamilyMember, SchemeApplication, Complaint,
    FraudAlert, WelfareRecommendation, Notification, CardTrackingEvent,
)
from app.utils.decorators import role_required
from app.services.recommendation_engine import run_recommendations_for_family

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/dashboard")
@role_required("admin")
def dashboard(user):
    total_families = Family.query.count()
    approved = Family.query.filter_by(registration_status="approved").count()
    pending = Family.query.filter_by(registration_status="pending").count()
    total_members = FamilyMember.query.count()
    pending_benefits = SchemeApplication.query.filter(
        SchemeApplication.status.in_(("applied", "under_verification", "pending"))
    ).count()
    rejected = SchemeApplication.query.filter_by(status="rejected").count()
    fraud_open = FraudAlert.query.filter_by(is_resolved=False).count()
    complaints_open = Complaint.query.filter(Complaint.status != "resolved").count()
    new_recommendations = WelfareRecommendation.query.filter_by(status="new").count()
    credited = SchemeApplication.query.filter_by(status="benefit_credited").count()

    return jsonify({
        "total_registrations": total_families,
        "approved_registrations": approved,
        "pending_registrations": pending,
        "total_beneficiaries": total_members,
        "pending_benefits": pending_benefits,
        "rejected_applications": rejected,
        "fraud_cases": fraud_open,
        "open_complaints": complaints_open,
        "newly_eligible_families": new_recommendations,
        "benefits_credited": credited,
    })


@admin_bp.get("/families")
@role_required("admin")
def list_families(user):
    families = Family.query.order_by(Family.created_at.desc()).limit(100).all()
    return jsonify([f.to_dict(include_members=True) for f in families])


@admin_bp.patch("/families/<int:family_id>/verify")
@role_required("admin")
def verify_family(user, family_id):
    family = Family.query.get_or_404(family_id)
    data = request.get_json() or {}
    status = data.get("registration_status", "approved")
    family.registration_status = status
    if status == "approved":
        family.card_status = "approved"
        db.session.add(CardTrackingEvent(family_id=family.id, status="approved", notes="Verified by admin"))
    db.session.commit()
    return jsonify(family.to_dict())


@admin_bp.patch("/applications/<int:app_id>")
@role_required("admin")
def update_application(user, app_id):
    app = SchemeApplication.query.get_or_404(app_id)
    data = request.get_json() or {}
    app.status = data.get("status", app.status)
    app.rejection_reason = data.get("rejection_reason")
    if data.get("benefit_amount"):
        app.benefit_amount = data["benefit_amount"]
    if app.status == "approved":
        app.approved_at = datetime.utcnow()
    if app.status == "benefit_credited":
        app.credited_at = datetime.utcnow()
        from app.models import BenefitCredit
        db.session.add(BenefitCredit(
            application_id=app.id,
            amount=app.benefit_amount or 0,
            reference_number=data.get("reference_number", f"TN{app.id}"),
        ))
    db.session.commit()
    return jsonify(app.to_dict())


@admin_bp.get("/fraud-alerts")
@role_required("admin")
def fraud_alerts(user):
    alerts = FraudAlert.query.order_by(FraudAlert.detected_at.desc()).all()
    return jsonify([a.to_dict() for a in alerts])


@admin_bp.patch("/fraud-alerts/<int:alert_id>/resolve")
@role_required("admin")
def resolve_fraud(user, alert_id):
    alert = FraudAlert.query.get_or_404(alert_id)
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = user.id
    db.session.commit()
    return jsonify(alert.to_dict())


@admin_bp.get("/recommendations")
@role_required("admin")
def recommendations(user):
    lang = request.args.get("lang", "en")
    recs = WelfareRecommendation.query.order_by(WelfareRecommendation.recommended_at.desc()).limit(100).all()
    return jsonify([r.to_dict(lang) for r in recs])


@admin_bp.post("/recommendations/run-all")
@role_required("admin")
def run_all_recommendations(user):
    count = 0
    for family in Family.query.all():
        run_recommendations_for_family(family)
        count += 1
    return jsonify({"families_processed": count})


@admin_bp.get("/complaints")
@role_required("admin")
def admin_complaints(user):
    complaints = Complaint.query.filter(
        Complaint.status.in_(("escalated", "under_review", "submitted"))
    ).order_by(Complaint.created_at.desc()).all()
    return jsonify([c.to_dict() for c in complaints])


@admin_bp.patch("/card/<int:family_id>/status")
@role_required("admin")
def update_card_status(user, family_id):
    family = Family.query.get_or_404(family_id)
    data = request.get_json() or {}
    status = data.get("card_status")
    if status:
        family.card_status = status
        db.session.add(CardTrackingEvent(
            family_id=family.id,
            status=status,
            notes=data.get("notes", ""),
        ))
    db.session.commit()
    return jsonify(family.to_dict())
