"""Auto welfare recommendations when life events change eligibility."""
from app.extensions import db
from app.models import WelfareRecommendation, WelfareScheme, FamilyEligibleScheme
from app.services.eligibility_engine import _member_matches_scheme


def run_recommendations_for_family(family) -> list[WelfareRecommendation]:
    recommendations = []
    schemes = WelfareScheme.query.filter_by(is_active=True).all()
    existing_scheme_ids = {
        e.scheme_id for e in FamilyEligibleScheme.query.filter_by(family_id=family.id).all()
    }

    for member in family.members:
        triggers = _life_triggers(member)
        for scheme in schemes:
            if scheme.id in existing_scheme_ids:
                continue
            matches, reason = _member_matches_scheme(member, scheme)
            if not matches:
                continue

            trigger = triggers[0] if triggers else f"Profile match: {reason}"
            existing = WelfareRecommendation.query.filter_by(
                family_id=family.id,
                family_member_id=member.id,
                scheme_id=scheme.id,
                status="new",
            ).first()
            if existing:
                continue

            rec = WelfareRecommendation(
                family_id=family.id,
                family_member_id=member.id,
                scheme_id=scheme.id,
                trigger_reason=trigger,
            )
            db.session.add(rec)
            recommendations.append(rec)

            eligible = FamilyEligibleScheme(
                family_id=family.id,
                family_member_id=member.id,
                scheme_id=scheme.id,
                match_reason=trigger,
                is_recommended=True,
            )
            db.session.add(eligible)

    db.session.commit()
    return recommendations


def _life_triggers(member) -> list[str]:
    triggers = []
    if member.age == 5:
        triggers.append("Child turned age 5 — education support may be eligible.")
    if member.age == 60 and not member.senior_citizen_status:
        triggers.append("Member crossed senior citizen age — pension eligibility triggered.")
    if member.widow_status:
        triggers.append("Widow status — women welfare schemes recommended.")
    if member.disability_status:
        triggers.append("Disability certificate on file — disability schemes recommended.")
    if member.farmer_status:
        triggers.append("Farmer status — agricultural subsidy schemes recommended.")
    return triggers
