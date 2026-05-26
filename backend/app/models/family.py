from datetime import datetime
from app.extensions import db


class Family(db.Model):
    __tablename__ = "families"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    privilege_card_id = db.Column(db.String(32), unique=True, nullable=False)
    family_head_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    district = db.Column(db.String(100))
    pincode = db.Column(db.String(10))
    contact_number = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255))
    registration_status = db.Column(db.String(30), default="pending")
    card_status = db.Column(db.String(30), default="submitted")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = db.relationship("FamilyMember", backref="family", lazy=True, cascade="all, delete-orphan")
    documents = db.relationship("FamilyDocument", backref="family", lazy=True, cascade="all, delete-orphan")
    applications = db.relationship("SchemeApplication", backref="family", lazy=True)
    card_events = db.relationship("CardTrackingEvent", backref="family", lazy=True)

    def to_dict(self, include_members=False):
        data = {
            "id": self.id,
            "privilege_card_id": self.privilege_card_id,
            "family_head_name": self.family_head_name,
            "address": self.address,
            "district": self.district,
            "pincode": self.pincode,
            "contact_number": self.contact_number,
            "email": self.email,
            "registration_status": self.registration_status,
            "card_status": self.card_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_members:
            data["members"] = [m.to_dict() for m in self.members]
        return data


class FamilyMember(db.Model):
    __tablename__ = "family_members"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    occupation = db.Column(db.String(100))
    income = db.Column(db.Numeric(12, 2), default=0)
    education_status = db.Column(db.String(100))
    disability_status = db.Column(db.Boolean, default=False)
    farmer_status = db.Column(db.Boolean, default=False)
    widow_status = db.Column(db.Boolean, default=False)
    senior_citizen_status = db.Column(db.Boolean, default=False)
    aadhaar_hash = db.Column(db.String(64))
    relationship = db.Column(db.String(50), default="member")
    is_head = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "occupation": self.occupation,
            "income": float(self.income or 0),
            "education_status": self.education_status,
            "disability_status": self.disability_status,
            "farmer_status": self.farmer_status,
            "widow_status": self.widow_status,
            "senior_citizen_status": self.senior_citizen_status,
            "relationship": self.relationship,
            "is_head": self.is_head,
        }


class FamilyDocument(db.Model):
    __tablename__ = "family_documents"

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey("families.id"), nullable=False)
    document_code = db.Column(db.String(50), nullable=False)
    file_name = db.Column(db.String(255))
    verification_status = db.Column(db.String(30), default="pending")
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "document_code": self.document_code,
            "file_name": self.file_name,
            "verification_status": self.verification_status,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }
