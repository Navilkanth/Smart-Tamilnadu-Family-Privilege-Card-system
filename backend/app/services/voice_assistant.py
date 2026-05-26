"""Simple bilingual Q&A for eligible schemes (voice/read-aloud support)."""
from app.models import FamilyEligibleScheme


def answer_eligibility_question(family, question: str, lang: str = "en") -> str:
    q = question.lower()
    schemes = FamilyEligibleScheme.query.filter_by(family_id=family.id).all()

    if lang == "ta" or any(c in question for c in "எனக்கு திட்டம் கிடைக்கும்"):
        if not schemes:
            return "உங்கள் குடும்பத்திற்கு தகுதியான திட்டங்கள் இன்னும் பகுப்பாய்வு செய்யப்படவில்லை. பதிவு முடிந்த பிறகு AI இயந்திரம் திட்டங்களை காட்டும்."
        lines = ["உங்கள் குடும்ப உறுப்பினர்களுக்கு தகுதியான திட்டங்கள்:"]
        for e in schemes[:10]:
            name = e.scheme.name_ta if e.scheme else ""
            member = e.member.name if e.member else ""
            lines.append(f"• {member}: {name}")
        return "\n".join(lines)

    if "scheme" in q or "eligible" in q or "welfare" in q:
        if not schemes:
            return "Eligibility analysis is pending. Complete family registration to see your schemes."
        lines = ["Eligible welfare schemes for your family:"]
        for e in schemes[:10]:
            name = e.scheme.name_en if e.scheme else ""
            member = e.member.name if e.member else ""
            lines.append(f"- {member}: {name} ({e.match_reason})")
        return "\n".join(lines)

    return (
        "எனக்கு என்ன திட்டம் கிடைக்கும்? / What schemes am I eligible for?"
        if lang == "ta"
        else "Ask: What schemes am I eligible for? (English or Tamil)"
    )
