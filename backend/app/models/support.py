from datetime import datetime
from app.extensions import db


class RequiredDocument(db.Model):
    __tablename__ = "required_documents"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name_en = db.Column(db.String(255), nullable=False)
    name_ta = db.Column(db.String(255), nullable=False)
    description_en = db.Column(db.Text)
    description_ta = db.Column(db.Text)
    is_conditional = db.Column(db.Boolean, default=False)
    condition_note_en = db.Column(db.String(255))
    condition_note_ta = db.Column(db.String(255))
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self, lang="en"):
        return {
            "code": self.code,
            "name": self.name_ta if lang == "ta" else self.name_en,
            "description": self.description_ta if lang == "ta" else self.description_en,
            "is_conditional": self.is_conditional,
            "condition_note": self.condition_note_ta if lang == "ta" else self.condition_note_en,
        }


class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default="submitted")
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))
    resolution_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)

    family = db.relationship("Family", backref="complaints")
    assignee = db.relationship(
        "User",
        foreign_keys=[assigned_to],
        backref="assigned_complaints",
    )
    messages = db.relationship("ComplaintMessage", backref="complaint", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "family_id": self.family_id,
            "category": self.category,
            "subject": self.subject,
            "description": self.description,
            "status": self.status,
            "resolution_notes": self.resolution_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }


class ComplaintMessage(db.Model):
    __tablename__ = "complaint_messages"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "sender": self.sender.full_name if self.sender else None,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"))
    title_en = db.Column(db.String(255), nullable=False)
    title_ta = db.Column(db.String(255))
    message_en = db.Column(db.Text, nullable=False)
    message_ta = db.Column(db.Text)
    notification_type = db.Column(db.String(50))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, lang="en"):
        return {
            "id": self.id,
            "title": self.title_ta if lang == "ta" else self.title_en,
            "message": self.message_ta if lang == "ta" else self.message_en,
            "notification_type": self.notification_type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WelfareRecommendation(db.Model):
    __tablename__ = "welfare_recommendations"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    family_member_id = db.Column(db.Integer, db.ForeignKey("family_members.id"))
    scheme_id = db.Column(db.Integer, db.ForeignKey("welfare_schemes.id"), nullable=False)
    trigger_reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default="new")
    recommended_at = db.Column(db.DateTime, default=datetime.utcnow)

    scheme = db.relationship("WelfareScheme")
    member = db.relationship("FamilyMember")

    def to_dict(self, lang="en"):
        return {
            "id": self.id,
            "member_name": self.member.name if self.member else None,
            "scheme": self.scheme.to_dict(lang) if self.scheme else None,
            "trigger_reason": self.trigger_reason,
            "status": self.status,
            "recommended_at": self.recommended_at.isoformat() if self.recommended_at else None,
        }


class FraudAlert(db.Model):
    __tablename__ = "fraud_alerts"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"))
    alert_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(20), default="medium")
    description = db.Column(db.Text, nullable=False)
    is_resolved = db.Column(db.Boolean, default=False)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    family = db.relationship("Family", backref="fraud_alerts")

    def to_dict(self):
        return {
            "id": self.id,
            "family_id": self.family_id,
            "privilege_card_id": self.family.privilege_card_id if self.family else None,
            "alert_type": self.alert_type,
            "severity": self.severity,
            "description": self.description,
            "is_resolved": self.is_resolved,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
        }


class CardTrackingEvent(db.Model):
    __tablename__ = "card_tracking_events"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    status = db.Column(db.String(30), nullable=False)
    notes = db.Column(db.Text)
    event_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "status": self.status,
            "notes": self.notes,
            "event_at": self.event_at.isoformat() if self.event_at else None,
        }


class HelpdeskContact(db.Model):
    __tablename__ = "helpdesk_contacts"

    id = db.Column(db.Integer, primary_key=True)
    contact_type = db.Column(db.String(30), nullable=False)
    value = db.Column(db.String(255), nullable=False)
    label_en = db.Column(db.String(100))
    label_ta = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self, lang="en"):
        return {
            "contact_type": self.contact_type,
            "value": self.value,
            "label": self.label_ta if lang == "ta" else self.label_en,
        }


class RegistrationSession(db.Model):
    __tablename__ = "registration_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    session_token = db.Column(db.String(64), unique=True, nullable=False)
    current_step = db.Column(db.Integer, default=1)
    form_data = db.Column(db.JSON, default=dict)
    expires_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "session_token": self.session_token,
            "current_step": self.current_step,
            "form_data": self.form_data,
        }
