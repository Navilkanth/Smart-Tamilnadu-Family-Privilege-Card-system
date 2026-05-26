"""Document validation and application resume support."""
SCHEME_REQUIRED_DOCS = {
    "default": ["aadhaar", "ration_card", "address_proof", "income_certificate"],
    "farmer": ["farmer_certificate"],
    "education": ["education_certificate"],
    "disability": ["disability_certificate"],
    "widow": ["death_certificate"],
}


def get_missing_documents(family, scheme) -> list[dict]:
    uploaded = {d.document_code for d in family.documents}
    required = list(SCHEME_REQUIRED_DOCS["default"])

    if scheme.requires_farmer:
        required.extend(SCHEME_REQUIRED_DOCS["farmer"])
    if scheme.category == "education":
        required.extend(SCHEME_REQUIRED_DOCS["education"])
    if scheme.requires_disability:
        required.extend(SCHEME_REQUIRED_DOCS["disability"])
    if scheme.requires_widow:
        required.extend(SCHEME_REQUIRED_DOCS["widow"])

    missing = []
    labels = {
        "aadhaar": ("Aadhaar Card", "ஆதார் அட்டை"),
        "ration_card": ("Family/Ration Card", "குடும்ப அட்டை"),
        "income_certificate": ("Income Certificate", "வருமான சான்றிதழ்"),
        "address_proof": ("Address Proof", "முகவரி சான்று"),
        "farmer_certificate": ("Farmer Certificate", "விவசாயி சான்றிதழ்"),
        "disability_certificate": ("Disability Certificate", "மாற்றுத்திறன் சான்றிதழ்"),
        "education_certificate": ("Education Certificate", "கல்வி சான்றிதழ்"),
        "death_certificate": ("Death Certificate", "இறப்பு சான்றிதழ்"),
        "community_certificate": ("Community Certificate", "சமூக சான்றிதழ்"),
    }
    for code in required:
        if code not in uploaded:
            en, ta = labels.get(code, (code, code))
            missing.append({"code": code, "name_en": en, "name_ta": ta})

    pending_aadhaar = any(
        d.document_code == "aadhaar" and d.verification_status == "pending"
        for d in family.documents
    )
    if pending_aadhaar:
        missing.append({
            "code": "aadhaar_pending",
            "name_en": "Aadhaar Verification Pending",
            "name_ta": "ஆதார் சரிபார்ப்பு நிலுவையில்",
        })

    return missing


def format_document_warnings(missing: list, lang: str = "en") -> list[dict]:
    """User-facing warnings for scheme application UI."""
    warnings = []
    for doc in missing:
        code = doc.get("code", "")
        en = doc.get("name_en", code)
        ta = doc.get("name_ta", en)
        if code == "aadhaar_pending":
            warnings.append({
                **doc,
                "severity": "pending",
                "message_en": "Aadhaar Verification Pending",
                "message_ta": "ஆதார் சரிபார்ப்பு நிலுவையில்",
            })
        else:
            warnings.append({
                **doc,
                "severity": "missing",
                "message_en": f"{en} Missing",
                "message_ta": f"{ta} காணவில்லை",
            })
    if lang == "ta":
        for w in warnings:
            w["message"] = w["message_ta"]
    else:
        for w in warnings:
            w["message"] = w["message_en"]
    return warnings


DOC_LABELS = {
    "aadhaar": ("Aadhaar Card", "ஆதார் அட்டை"),
    "ration_card": ("Family/Ration Card", "குடும்ப அட்டை"),
    "income_certificate": ("Income Certificate", "வருமான சான்றிதழ்"),
    "address_proof": ("Address Proof", "முகவரி சான்று"),
    "community_certificate": ("Community Certificate", "சமூக சான்றிதழ்"),
    "farmer_certificate": ("Farmer Certificate", "விவசாயி சான்றிதழ்"),
    "disability_certificate": ("Disability Certificate", "மாற்றுத்திறன் சான்றிதழ்"),
    "education_certificate": ("Education Certificate", "கல்வி சான்றிதழ்"),
    "death_certificate": ("Death Certificate", "இறப்பு சான்றிதழ்"),
}


def get_required_documents_for_profile(flags: dict) -> list[dict]:
    """Pre-registration document list from family profile flags."""
    required = list(SCHEME_REQUIRED_DOCS["default"])
    required.append("community_certificate")

    if flags.get("is_farmer"):
        required.extend(SCHEME_REQUIRED_DOCS["farmer"])
    if flags.get("has_disability"):
        required.extend(SCHEME_REQUIRED_DOCS["disability"])
    if flags.get("is_widow"):
        required.extend(SCHEME_REQUIRED_DOCS["widow"])
    if flags.get("needs_education"):
        required.extend(SCHEME_REQUIRED_DOCS["education"])
    if flags.get("member_removal"):
        required.extend(["death_certificate"])

    seen = set()
    result = []
    for code in required:
        if code in seen:
            continue
        seen.add(code)
        en, ta = DOC_LABELS.get(code, (code.replace("_", " ").title(), code))
        result.append({
            "code": code,
            "name_en": en,
            "name_ta": ta,
            "is_conditional": code not in SCHEME_REQUIRED_DOCS["default"],
        })
    return result


def check_documents_against_uploaded(required: list, uploaded_codes: list, marked_have: list) -> dict:
    """Compare required docs with uploaded / user-marked-as-having."""
    have = set(uploaded_codes) | set(marked_have)
    missing = [d for d in required if d["code"] not in have]
    ready = len(missing) == 0
    return {
        "required": required,
        "missing_documents": missing,
        "ready": ready,
        "completion_percent": round((len(required) - len(missing)) / max(len(required), 1) * 100),
    }
