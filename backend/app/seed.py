"""Seed required documents, welfare schemes, helpdesk contacts, demo users."""
from app.extensions import db
from app.models import User, RequiredDocument, WelfareScheme, HelpdeskContact

def seed_database():
    documents = [
        ("aadhaar", "Aadhaar Card", "ஆதார் அட்டை", False, 1),
        ("ration_card", "Family/Ration Card", "குடும்ப/ரேஷன் அட்டை", False, 2),
        ("income_certificate", "Income Certificate", "வருமான சான்றிதழ்", False, 3),
        ("community_certificate", "Community Certificate", "சமூக சான்றிதழ்", False, 4),
        ("address_proof", "Address Proof", "முகவரி சான்று", False, 5),
        ("farmer_certificate", "Farmer Certificate", "விவசாயி சான்றிதழ்", True, 6),
        ("disability_certificate", "Disability Certificate", "மாற்றுத்திறன் சான்றிதழ்", True, 7),
        ("death_certificate", "Death Certificate (member removal)", "இறப்பு சான்றிதழ்", True, 8),
        ("education_certificate", "Education Certificate", "கல்வி சான்றிதழ்", True, 9),
    ]
    for code, en, ta, cond, order in documents:
        if not RequiredDocument.query.filter_by(code=code).first():
            db.session.add(RequiredDocument(
                code=code, name_en=en, name_ta=ta, is_conditional=cond, display_order=order,
                condition_note_en="If applicable" if cond else None,
                condition_note_ta="பொருந்தினால்" if cond else None,
            ))

    schemes = [
        ("TN_FARMER_SUBSIDY", "Tamil Nadu Farmer Subsidy", "தமிழ்நாடு விவசாய உதவித்தொகை",
         "farmer", None, None, None, True, False, False, False, 300000, None, 15000),
        ("TN_WOMEN_WELFARE", "Women Welfare Scheme", "பெண்கள் நல திட்டம்",
         "women", 18, None, "female", False, False, True, False, 200000, None, 12000),
        ("TN_CHILD_EDUCATION", "Child Education Support", "குழந்தை கல்வி உதவி",
         "education", 5, 18, None, False, False, False, False, 150000, "school", 10000),
        ("TN_SENIOR_PENSION", "Senior Citizen Pension", "மூத்த குடிமக்கள் ஓய்வூதியம்",
         "pension", 60, None, None, False, False, False, True, 100000, None, 2000),
        ("TN_DISABILITY_AID", "Disability Welfare Aid", "மாற்றுத்திறனாளி நல உதவி",
         "disability", None, None, None, False, True, False, False, 250000, None, 8000),
        ("TN_SCHOLARSHIP", "Merit Scholarship", "சிறந்தோர் கல்வி உதவித்தொகை",
         "education", 10, 25, None, False, False, False, False, 200000, "higher_secondary", 25000),
        ("TN_WIDOW_PENSION", "Widow Pension Scheme", "விதவை ஓய்வூதிய திட்டம்",
         "women", 18, None, "female", False, False, True, False, 150000, None, 3000),
        ("TN_RATION_SUPPORT", "Additional Ration Support", "கூடுதல் ரேஷன் உதவி",
         "general", None, None, None, False, False, False, False, 100000, None, 5000),
        
        # New Additions - Realistic TN Schemes
        ("TN_KALAIGNAR_URIMAI", "Kalaignar Magalir Urimai Thittam", "கலைஞர் மகளிர் உரிமைத் திட்டம்",
         "women", 21, None, "female", False, False, False, False, 250000, None, 12000),
        ("TN_PUDHUMAI_PENN", "Pudhumai Penn Scheme", "புதுமைப் பெண் திட்டம்",
         "education", 17, 25, "female", False, False, False, False, 250000, "higher_secondary", 12000),
        ("TN_CMCHIS", "CM's Comprehensive Health Insurance", "முதலமைச்சரின் விரிவான மருத்துவ காப்பீட்டுத் திட்டம்",
         "health", None, None, None, False, False, False, False, 120000, None, 500000),
        ("TN_ILLAM_THEDI_KALVI", "Illam Thedi Kalvi", "இல்லம் தேடிக் கல்வி",
         "education", 5, 14, None, False, False, False, False, 150000, "school", 5000),
        ("TN_MAKKALAI_THEDI_MARUTHUVAM", "Makkalai Thedi Maruthuvam", "மக்களைத் தேடி மருத்துவம்",
         "health", 45, None, None, False, False, False, False, 300000, None, 10000),
    ]
    for row in schemes:
        if not WelfareScheme.query.filter_by(code=row[0]).first():
            db.session.add(WelfareScheme(
                code=row[0], name_en=row[1], name_ta=row[2], category=row[3],
                min_age=row[4], max_age=row[5], gender_filter=row[6],
                requires_farmer=row[7], requires_disability=row[8],
                requires_widow=row[9], requires_senior=row[10],
                max_income=row[11], education_level=row[12], benefit_amount=row[13],
                description_en=f"Government welfare scheme: {row[1]}",
                description_ta=f"அரசு நலத்திட்டம்: {row[2]}",
            ))

    contacts = [
        ("phone", "1800-425-1234", "24/7 Toll Free", "24/7 இலவச எண்"),
        ("whatsapp", "+91-9876543210", "WhatsApp Support", "வாட்ஸ்அப் ஆதரவு"),
        ("email", "helpdesk@tnprivilegecard.gov.in", "Email Support", "மின்னஞ்சல் ஆதரவு"),
    ]
    for ctype, val, en, ta in contacts:
        if not HelpdeskContact.query.filter_by(contact_type=ctype).first():
            db.session.add(HelpdeskContact(contact_type=ctype, value=val, label_en=en, label_ta=ta))

    if not User.query.filter_by(email="admin@tn.gov.in").first():
        admin = User(email="admin@tn.gov.in", full_name="TN Admin", role="admin", phone="9000000001")
        admin.set_password("admin123")
        db.session.add(admin)

    if not User.query.filter_by(email="helpdesk@tn.gov.in").first():
        hd = User(email="helpdesk@tn.gov.in", full_name="Help Desk", role="helpdesk", phone="9000000002")
        hd.set_password("helpdesk123")
        db.session.add(hd)

    if not User.query.filter_by(email="citizen@example.com").first():
        citizen = User(email="citizen@example.com", full_name="Demo Citizen", role="citizen", phone="9000000003")
        citizen.set_password("citizen123")
        db.session.add(citizen)

    db.session.commit()

