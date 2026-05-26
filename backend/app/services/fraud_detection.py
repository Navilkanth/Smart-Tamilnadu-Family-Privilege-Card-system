"""Fraud detection: duplicate registrations, Aadhaar, income mismatch."""
import hashlib
from collections import defaultdict
from app.extensions import db
from app.models import Family, FamilyMember, FraudAlert, SchemeApplication


def _hash_aadhaar(aadhaar: str) -> str:
    return hashlib.sha256(aadhaar.encode()).hexdigest()


def run_fraud_checks(family) -> list[FraudAlert]:
    alerts = []

    # Duplicate Aadhaar across system
    for member in family.members:
        if not member.aadhaar_hash:
            continue
        dupes = FamilyMember.query.filter(
            FamilyMember.aadhaar_hash == member.aadhaar_hash,
            FamilyMember.family_id != family.id,
        ).count()
        if dupes > 0:
            alert = _create_alert(
                family.id,
                "duplicate_aadhaar",
                "high",
                f"Duplicate Aadhaar detected for member {member.name}.",
            )
            alerts.append(alert)

    # Duplicate family head + address
    similar = Family.query.filter(
        Family.family_head_name == family.family_head_name,
        Family.address == family.address,
        Family.id != family.id,
    ).count()
    if similar > 0:
        alerts.append(
            _create_alert(
                family.id,
                "duplicate_registration",
                "high",
                "Possible duplicate family registration (same head name and address).",
            )
        )

    # Income mismatch: declared low income but high scheme claims
    total_income = sum(float(m.income or 0) for m in family.members)
    if total_income > 500000:
        low_income_apps = SchemeApplication.query.filter_by(family_id=family.id).count()
        if low_income_apps > 3 and total_income > 1000000:
            alerts.append(
                _create_alert(
                    family.id,
                    "income_mismatch",
                    "medium",
                    "Suspicious income vs benefit application pattern.",
                )
            )

    # Multiple active benefits same scheme
    from sqlalchemy import func

    dup_benefits = (
        db.session.query(SchemeApplication.scheme_id, func.count(SchemeApplication.id))
        .filter(SchemeApplication.family_id == family.id, SchemeApplication.status == "benefit_credited")
        .group_by(SchemeApplication.scheme_id)
        .having(func.count(SchemeApplication.id) > 1)
        .all()
    )
    if dup_benefits:
        alerts.append(
            _create_alert(
                family.id,
                "duplicate_benefit",
                "high",
                "Multiple credited benefits detected for the same scheme.",
            )
        )

    db.session.commit()
    return alerts


def _create_alert(family_id, alert_type, severity, description) -> FraudAlert:
    existing = FraudAlert.query.filter_by(
        family_id=family_id, alert_type=alert_type, is_resolved=False
    ).first()
    if existing:
        return existing
    alert = FraudAlert(
        family_id=family_id,
        alert_type=alert_type,
        severity=severity,
        description=description,
    )
    db.session.add(alert)
    return alert
