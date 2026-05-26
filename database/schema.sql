-- Smart Tamil Nadu Family Privilege Card System
-- PostgreSQL schema (also managed via Flask-Migrate / SQLAlchemy models)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users: citizen, admin, helpdesk
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'helpdesk')),
    preferred_language VARCHAR(10) DEFAULT 'en' CHECK (preferred_language IN ('en', 'ta')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    privilege_card_id VARCHAR(32) UNIQUE NOT NULL,
    family_head_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100),
    pincode VARCHAR(10),
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    registration_status VARCHAR(30) DEFAULT 'pending'
        CHECK (registration_status IN ('pending', 'under_verification', 'approved', 'rejected')),
    card_status VARCHAR(30) DEFAULT 'submitted'
        CHECK (card_status IN ('submitted', 'under_verification', 'approved', 'card_generated', 'dispatched', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    occupation VARCHAR(100),
    income DECIMAL(12, 2) DEFAULT 0,
    education_status VARCHAR(100),
    disability_status BOOLEAN DEFAULT FALSE,
    farmer_status BOOLEAN DEFAULT FALSE,
    widow_status BOOLEAN DEFAULT FALSE,
    senior_citizen_status BOOLEAN DEFAULT FALSE,
    aadhaar_hash VARCHAR(64),
    relationship VARCHAR(50) DEFAULT 'member',
    is_head BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS required_documents (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ta TEXT,
    is_conditional BOOLEAN DEFAULT FALSE,
    condition_note_en VARCHAR(255),
    condition_note_ta VARCHAR(255),
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS family_documents (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    document_code VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    verification_status VARCHAR(30) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS welfare_schemes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ta TEXT,
    category VARCHAR(100),
    min_age INTEGER,
    max_age INTEGER,
    gender_filter VARCHAR(20),
    requires_farmer BOOLEAN DEFAULT FALSE,
    requires_disability BOOLEAN DEFAULT FALSE,
    requires_widow BOOLEAN DEFAULT FALSE,
    requires_senior BOOLEAN DEFAULT FALSE,
    max_income DECIMAL(12, 2),
    education_level VARCHAR(100),
    benefit_amount DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS family_eligible_schemes (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    family_member_id INTEGER REFERENCES family_members(id) ON DELETE CASCADE,
    scheme_id INTEGER NOT NULL REFERENCES welfare_schemes(id) ON DELETE CASCADE,
    match_reason TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    is_recommended BOOLEAN DEFAULT FALSE,
    UNIQUE (family_member_id, scheme_id)
);

CREATE TABLE IF NOT EXISTS scheme_applications (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    family_member_id INTEGER REFERENCES family_members(id),
    scheme_id INTEGER NOT NULL REFERENCES welfare_schemes(id),
    status VARCHAR(30) DEFAULT 'applied'
        CHECK (status IN ('applied', 'under_verification', 'pending', 'approved', 'rejected', 'benefit_credited')),
    rejection_reason TEXT,
    benefit_amount DECIMAL(12, 2),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    credited_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_drafts (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    scheme_id INTEGER NOT NULL REFERENCES welfare_schemes(id),
    current_step INTEGER DEFAULT 1,
    draft_data JSONB DEFAULT '{}',
    missing_documents JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (family_id, scheme_id)
);

CREATE TABLE IF NOT EXISTS benefit_credits (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES scheme_applications(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    credit_date TIMESTAMPTZ DEFAULT NOW(),
    reference_number VARCHAR(100),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS card_tracking_events (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    event_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('technical', 'benefit', 'card', 'family_update', 'general')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'under_review', 'escalated', 'resolved')),
    assigned_to INTEGER REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS complaint_messages (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_ta VARCHAR(255),
    message_en TEXT NOT NULL,
    message_ta TEXT,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS welfare_recommendations (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    family_member_id INTEGER REFERENCES family_members(id),
    scheme_id INTEGER NOT NULL REFERENCES welfare_schemes(id),
    trigger_reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'notified', 'applied', 'dismissed')),
    recommended_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS helpdesk_contacts (
    id SERIAL PRIMARY KEY,
    contact_type VARCHAR(30) NOT NULL CHECK (contact_type IN ('phone', 'whatsapp', 'email')),
    value VARCHAR(255) NOT NULL,
    label_en VARCHAR(100),
    label_ta VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS registration_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(64) UNIQUE NOT NULL,
    current_step INTEGER DEFAULT 1,
    form_data JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_families_user ON families(user_id);
CREATE INDEX IF NOT EXISTS idx_families_card ON families(privilege_card_id);
CREATE INDEX IF NOT EXISTS idx_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_applications_family ON scheme_applications(family_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_fraud_resolved ON fraud_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
