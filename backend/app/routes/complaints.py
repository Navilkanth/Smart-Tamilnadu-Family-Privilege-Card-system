from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Family, Complaint, ComplaintMessage, Notification
from app.utils.decorators import role_required

complaints_bp = Blueprint("complaints", __name__, url_prefix="/api/complaints")

VALID_CATEGORIES = ("technical", "benefit", "card", "family_update", "general")


@complaints_bp.post("/")
@jwt_required()
def create_complaint():
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}
    category = data.get("category", "general")
    if category not in VALID_CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    family = Family.query.filter_by(user_id=user.id).first()
    complaint = Complaint(
        family_id=family.id if family else None,
        user_id=user.id,
        category=category,
        subject=data.get("subject", ""),
        description=data.get("description", ""),
        status="submitted",
    )
    db.session.add(complaint)
    db.session.commit()
    return jsonify(complaint.to_dict()), 201


@complaints_bp.get("/mine")
@jwt_required()
def my_complaints():
    user = User.query.get(int(get_jwt_identity()))
    complaints = Complaint.query.filter_by(user_id=user.id).order_by(Complaint.created_at.desc()).all()
    return jsonify([c.to_dict() for c in complaints])


@complaints_bp.get("/<int:complaint_id>")
@jwt_required()
def get_complaint(complaint_id):
    user = User.query.get(int(get_jwt_identity()))
    complaint = Complaint.query.get_or_404(complaint_id)
    if complaint.user_id != user.id and user.role not in ("admin", "helpdesk"):
        return jsonify({"error": "Forbidden"}), 403
    data = complaint.to_dict()
    data["messages"] = [m.to_dict() for m in complaint.messages]
    return jsonify(data)


@complaints_bp.post("/<int:complaint_id>/messages")
@jwt_required()
def add_message(complaint_id):
    user = User.query.get(int(get_jwt_identity()))
    complaint = Complaint.query.get_or_404(complaint_id)
    data = request.get_json() or {}
    msg = ComplaintMessage(
        complaint_id=complaint.id,
        sender_id=user.id,
        message=data.get("message", ""),
    )
    db.session.add(msg)
    if user.role == "helpdesk" and complaint.status == "submitted":
        complaint.status = "under_review"
    db.session.commit()
    return jsonify(msg.to_dict()), 201


@complaints_bp.get("/helpdesk/queue")
@role_required("helpdesk", "admin")
def helpdesk_queue(user):
    status = request.args.get("status")
    q = Complaint.query
    if status:
        q = q.filter_by(status=status)
    complaints = q.order_by(Complaint.created_at.desc()).all()
    return jsonify([c.to_dict() for c in complaints])


@complaints_bp.patch("/<int:complaint_id>/status")
@role_required("helpdesk", "admin")
def update_status(user, complaint_id):
    complaint = Complaint.query.get_or_404(complaint_id)
    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status not in ("submitted", "under_review", "escalated", "resolved"):
        return jsonify({"error": "Invalid status"}), 400

    complaint.status = new_status
    complaint.resolution_notes = data.get("resolution_notes", complaint.resolution_notes)
    if new_status == "escalated" and user.role == "helpdesk":
        admins = User.query.filter_by(role="admin").all()
        for admin in admins:
            db.session.add(Notification(
                user_id=admin.id,
                title_en="Escalated Complaint",
                title_ta="உயர்த்தப்பட்ட புகார்",
                message_en=f"Complaint #{complaint.id}: {complaint.subject}",
                message_ta=f"புகார் #{complaint.id}",
                notification_type="complaint_escalation",
            ))
    if new_status == "resolved":
        complaint.resolved_at = datetime.utcnow()
        db.session.add(Notification(
            user_id=complaint.user_id,
            family_id=complaint.family_id,
            title_en="Complaint Resolved",
            title_ta="புகார் தீர்க்கப்பட்டது",
            message_en=f"Your complaint '{complaint.subject}' has been resolved.",
            message_ta="உங்கள் புகார் தீர்க்கப்பட்டது",
            notification_type="complaint",
        ))
    db.session.commit()
    return jsonify(complaint.to_dict())
