import json
import sys
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
from app.database import get_db, init_db

def seed_demo_data(reset=False, db_path=None):
    init_db(db_path=db_path)
    
    user_id = "demo-user-ananya-sen-uuid"
    profile_id = "demo-profile-ananya-sen-uuid"
    visibility_id = "demo-visibility-ananya-sen-uuid"
    
    email = "ananya.sen@example.com"
    password = "DemoPassword123!"
    full_name = "Ananya Sen"
    
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    
    with get_db(db_path=db_path) as conn:
        cursor = conn.cursor()
        
        # Check if already seeded
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()
        
        conditions = json.dumps(["Hypertension (Stage 2)", "Type 2 Diabetes Mellitus"])
        allergies = json.dumps(["Penicillin (Fictional Demo - Rash)", "Peanuts (Fictional Demo - Anaphylaxis)"])
        medications = json.dumps([
            {"name": "Metformin", "dosage": "500 mg", "frequency": "Twice daily after meals"},
            {"name": "Amlodipine", "dosage": "5 mg", "frequency": "Once daily in the morning"}
        ])

        if existing_user and not reset:
            # Verify demo user's medical profile exists and has valid, consistent data
            cursor.execute("SELECT * FROM medical_profiles WHERE user_id = ?", (existing_user["id"],))
            existing_profile = cursor.fetchone()
            if not existing_profile:
                # Profile missing for demo user, create it
                cursor.execute(
                    """INSERT INTO medical_profiles 
                       (id, user_id, full_name, age, blood_group, medical_conditions, allergies, no_known_allergies,
                        current_medications, doctor_name, doctor_contact, emergency_contact_name,
                        emergency_contact_relationship, emergency_contact_phone, emergency_contact_email,
                        emergency_notification_email, emergency_email_verified,
                        preferred_language, emergency_second_language, full_name_secondary, emergency_contact_name_secondary,
                        created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)""",
                    (
                        profile_id, existing_user["id"], full_name, 72, "B+", conditions, allergies,
                        medications, "Dr. R. Chatterjee", "+91 98765 12345",
                        "Ritu Sen", "Daughter", "+91 98765 43210", "ritu.sen@example.com",
                        "ritu.sen@example.com", "en", "bn", "অনন্যা সেন", "রিতু সেন",
                        now_iso, now_iso
                    )
                )
            else:
                # Ensure demo profile has valid JSON arrays, language preferences, and Bengali fields
                cursor.execute(
                    """UPDATE medical_profiles
                       SET preferred_language = COALESCE(preferred_language, 'en'),
                           emergency_second_language = COALESCE(emergency_second_language, 'bn'),
                           full_name_secondary = COALESCE(full_name_secondary, ?),
                           emergency_contact_name_secondary = COALESCE(emergency_contact_name_secondary, ?),
                           emergency_notification_email = COALESCE(emergency_notification_email, 'ritu.sen@example.com'),
                           emergency_contact_email = COALESCE(emergency_contact_email, 'ritu.sen@example.com'),
                           emergency_email_verified = 1
                       WHERE user_id = ?""",
                    ("অনন্যা সেন", "রিতু সেন", existing_user["id"])
                )

            # Ensure emergency visibility exists for demo user
            cursor.execute("SELECT id FROM emergency_visibility WHERE profile_id = ?", (profile_id,))
            if not cursor.fetchone():
                cursor.execute(
                    """INSERT OR IGNORE INTO emergency_visibility
                       (id, profile_id, show_name, show_age, show_blood_group, show_allergies,
                        show_medications, show_conditions, show_doctor_details, show_emergency_contact, updated_at)
                       VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1, 1, ?)""",
                    (visibility_id, profile_id, now_iso)
                )
            conn.commit()
            return
            
        if reset or existing_user:
            cursor.execute("DELETE FROM users WHERE email = ?", (email,))
            conn.commit()

        print("Seeding synthetic demonstration patient profile...")
        
        # 1. User
        cursor.execute(
            """INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, email, generate_password_hash(password), full_name, now_iso, now_iso)
        )
        
        # 2. Medical Profile
        cursor.execute(
            """INSERT INTO medical_profiles 
               (id, user_id, full_name, age, blood_group, medical_conditions, allergies, no_known_allergies,
                current_medications, doctor_name, doctor_contact, emergency_contact_name,
                emergency_contact_relationship, emergency_contact_phone, emergency_contact_email,
                emergency_notification_email, emergency_email_verified,
                preferred_language, emergency_second_language, full_name_secondary, emergency_contact_name_secondary,
                created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)""",
            (
                profile_id, user_id, full_name, 72, "B+", conditions, allergies,
                medications, "Dr. R. Chatterjee", "+91 98765 12345",
                "Ritu Sen", "Daughter", "+91 98765 43210", "ritu.sen@example.com",
                "ritu.sen@example.com", "en", "bn", "অনন্যা সেন", "রিতু সেন",
                now_iso, now_iso
            )
        )
        
        # 3. Emergency Visibility (explicit user controls)
        cursor.execute(
            """INSERT INTO emergency_visibility
               (id, profile_id, show_name, show_age, show_blood_group, show_allergies,
                show_medications, show_conditions, show_doctor_details, show_emergency_contact, updated_at)
               VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1, 1, ?)""",
            (visibility_id, profile_id, now_iso)
        )
        
        # Note: per project requirements, NO QR code is created on registration/seeding.
        # A unique QR code is only generated when the user explicitly clicks "Generate QR".
        
        conn.commit()
        print("Demo account seeded successfully!")
        print(f"Login Email: {email}")
        print(f"Login Password: {password}")

if __name__ == "__main__":
    should_reset = "--reset" in sys.argv
    seed_demo_data(reset=should_reset)
