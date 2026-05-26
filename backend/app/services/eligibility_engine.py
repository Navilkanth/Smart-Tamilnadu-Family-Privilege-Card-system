"""AI-style eligibility engine: maps family members to welfare schemes."""
from app.extensions import db
from app.models import WelfareScheme, FamilyEligibleScheme, FamilyMember


def _member_matches_scheme(member: FamilyMember, scheme: WelfareScheme) -> tuple[bool, str]:
    reasons = []

    if scheme.min_age is not None and member.age < scheme.min_age:
        return False, ""
    if scheme.max_age is not None and member.age > scheme.max_age:
        return False, ""

    if scheme.gender_filter and member.gender.lower() != scheme.gender_filter.lower():
        return False, ""

    if scheme.requires_farmer and not member.farmer_status:
        return False, ""
    if scheme.requires_farmer:
        reasons.append("farmer")

    if scheme.requires_disability and not member.disability_status:
        return False, ""
    if scheme.requires_disability:
        reasons.append("disability")

    if scheme.requires_widow and not member.widow_status:
        return False, ""
    if scheme.requires_widow:
        reasons.append("widow")

    if scheme.requires_senior and not (member.senior_citizen_status or member.age >= 60):
        return False, ""
    if scheme.requires_senior or member.age >= 60:
        if member.age >= 60:
            reasons.append("senior_citizen")

    if scheme.max_income is not None and float(member.income or 0) > float(scheme.max_income):
        return False, ""

    if scheme.education_level and member.education_status:
        if scheme.education_level.lower() not in (member.education_status or "").lower():
            return False, ""
    elif scheme.education_level and not member.education_status:
        return False, ""

    if member.gender.lower() == "female" and scheme.category in ("women", "maternity"):
        reasons.append("women_welfare")

    if member.age < 18 and scheme.category == "education":
        reasons.append("education")

    reason = ", ".join(reasons) if reasons else scheme.category or "general_eligibility"
    return True, reason


def run_eligibility_for_family(family) -> list[FamilyEligibleScheme]:
    """Analyze all members and persist eligible scheme mappings."""
    schemes = WelfareScheme.query.filter_by(is_active=True).all()
    results = []

    FamilyEligibleScheme.query.filter_by(family_id=family.id, is_recommended=False).delete()

    for member in family.members:
        for scheme in schemes:
            matches, reason = _member_matches_scheme(member, scheme)
            if not matches:
                continue

            existing = FamilyEligibleScheme.query.filter_by(
                family_member_id=member.id, scheme_id=scheme.id
            ).first()
            if existing:
                existing.match_reason = reason
                results.append(existing)
            else:
                entry = FamilyEligibleScheme(
                    family_id=family.id,
                    family_member_id=member.id,
                    scheme_id=scheme.id,
                    match_reason=reason,
                )
                db.session.add(entry)
                results.append(entry)

    db.session.commit()
    return results
