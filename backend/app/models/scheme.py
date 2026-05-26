from datetime import datetime
from app.extensions import db


class WelfareScheme(db.Model):
    __tablename__ = "welfare_schemes"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name_en = db.Column(db.String(255), nullable=False)
    name_ta = db.Column(db.String(255), nullable=False)
    description_en = db.Column(db.Text)
    description_ta = db.Column(db.Text)
    category = db.Column(db.String(100))
    min_age = db.Column(db.Integer)
    max_age = db.Column(db.Integer)
    gender_filter = db.Column(db.String(20))
    requires_farmer = db.Column(db.Boolean, default=False)
    requires_disability = db.Column(db.Boolean, default=False)
    requires_widow = db.Column(db.Boolean, default=False)
    requires_senior = db.Column(db.Boolean, default=False)
    max_income = db.Column(db.Numeric(12, 2))
    education_level = db.Column(db.String(100))
    benefit_amount = db.Column(db.Numeric(12, 2))
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self, lang="en"):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name_ta if lang == "ta" else self.name_en,
            "name_en": self.name_en,
            "name_ta": self.name_ta,
            "description": self.description_ta if lang == "ta" else self.description_en,
            "category": self.category,
            "benefit_amount": float(self.benefit_amount or 0),
        }


class FamilyEligibleScheme(db.Model):
    __tablename__ = "family_eligible_schemes"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    family_member_id = db.Column(db.Integer, db.ForeignKey("family_members.id"))
    scheme_id = db.Column(db.Integer, db.ForeignKey("welfare_schemes.id"), nullable=False)
    match_reason = db.Column(db.Text)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_recommended = db.Column(db.Boolean, default=False)

    member = db.relationship("FamilyMember", backref="eligible_schemes")
    scheme = db.relationship("WelfareScheme")

    def to_dict(self, lang="en"):
        return {
            "id": self.id,
            "family_member_id": self.family_member_id,
            "member_name": self.member.name if self.member else None,
            "scheme": self.scheme.to_dict(lang) if self.scheme else None,
            "match_reason": self.match_reason,
            "is_recommended": self.is_recommended,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
        }


class SchemeApplication(db.Model):
    __tablename__ = "scheme_applications"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    family_member_id = db.Column(db.Integer, db.ForeignKey("family_members.id"))
    scheme_id = db.Column(db.Integer, db.ForeignKey("welfare_schemes.id"), nullable=False)
    status = db.Column(db.String(30), default="applied")
    rejection_reason = db.Column(db.Text)
    benefit_amount = db.Column(db.Numeric(12, 2))
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    credited_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scheme = db.relationship("WelfareScheme")
    member = db.relationship("FamilyMember")
    credits = db.relationship("BenefitCredit", backref="application", lazy=True)

    def to_dict(self, lang="en"):
        return {
            "id": self.id,
            "scheme": self.scheme.to_dict(lang) if self.scheme else None,
            "member_name": self.member.name if self.member else None,
            "status": self.status,
            "rejection_reason": self.rejection_reason,
            "benefit_amount": float(self.benefit_amount or 0),
            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "credited_at": self.credited_at.isoformat() if self.credited_at else None,
            "credits": [c.to_dict() for c in self.credits],
        }


class ApplicationDraft(db.Model):
    __tablename__ = "application_drafts"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    scheme_id = db.Column(db.Integer, db.ForeignKey("welfare_schemes.id"), nullable=False)
    current_step = db.Column(db.Integer, default=1)
    draft_data = db.Column(db.JSON, default=dict)
    missing_documents = db.Column(db.JSON, default=list)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scheme = db.relationship("WelfareScheme")

    def to_dict(self):
        return {
            "scheme_id": self.scheme_id,
            "scheme": self.scheme.to_dict() if self.scheme else None,
            "current_step": self.current_step,
            "draft_data": self.draft_data,
            "missing_documents": self.missing_documents,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class BenefitCredit(db.Model):
    __tablename__ = "benefit_credits"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("scheme_applications.id"), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    credit_date = db.Column(db.DateTime, default=datetime.utcnow)
    reference_number = db.Column(db.String(100))
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "amount": float(self.amount),
            "credit_date": self.credit_date.isoformat() if self.credit_date else None,
            "reference_number": self.reference_number,
            "notes": self.notes,
        }
