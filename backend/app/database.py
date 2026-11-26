import sqlite3
import os
from app.config import Config

def get_db(db_path=None):
    target = db_path or Config.DATABASE_PATH
    try:
        from flask import has_app_context, current_app
        if has_app_context():
            if not db_path and current_app.config.get("DATABASE_PATH"):
                target = current_app.config["DATABASE_PATH"]
            if current_app.config.get("TESTING"):
                from app.test_db_guard import assert_not_dev_db
                assert_not_dev_db(target)
    except (ImportError, RuntimeError):
        pass

    conn = sqlite3.connect(target)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path=None):
    target = db_path or Config.DATABASE_PATH
    try:
        from flask import has_app_context, current_app
        if has_app_context():
            if not db_path and current_app.config.get("DATABASE_PATH"):
                target = current_app.config["DATABASE_PATH"]
            if current_app.config.get("TESTING"):
                from app.test_db_guard import assert_not_dev_db
                assert_not_dev_db(target)
    except (ImportError, RuntimeError):
        pass

    db_dir = os.path.dirname(target)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    with get_db(db_path=target) as conn:
        cursor = conn.cursor()
        
        # 1. Users / Auth Profiles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)
        
        # 2. Medical Profiles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS medical_profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            age INTEGER,
            blood_group TEXT,
            medical_conditions TEXT NOT NULL DEFAULT '[]',
            allergies TEXT NOT NULL DEFAULT '[]',
            no_known_allergies INTEGER NOT NULL DEFAULT 0,
            current_medications TEXT NOT NULL DEFAULT '[]',
            doctor_name TEXT,
            doctor_contact TEXT,
            emergency_contact_name TEXT NOT NULL,
            emergency_contact_relationship TEXT NOT NULL,
            emergency_contact_phone TEXT NOT NULL,
            emergency_contact_email TEXT,
            emergency_notification_email TEXT,
            emergency_email_verified INTEGER NOT NULL DEFAULT 0,
            emergency_email_verification_code TEXT,
            emergency_email_verification_token TEXT,
            emergency_email_verification_sent_at TEXT,
            pending_emergency_notification_email TEXT,
            preferred_language TEXT NOT NULL DEFAULT 'en',
            emergency_second_language TEXT,
            full_name_secondary TEXT,
            emergency_contact_name_secondary TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """)
        
        # 3. Emergency Visibility (Explicit User Toggles)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS emergency_visibility (
            id TEXT PRIMARY KEY,
            profile_id TEXT UNIQUE NOT NULL,
            show_name INTEGER NOT NULL DEFAULT 1,
            show_age INTEGER NOT NULL DEFAULT 1,
            show_blood_group INTEGER NOT NULL DEFAULT 1,
            show_allergies INTEGER NOT NULL DEFAULT 1,
            show_medications INTEGER NOT NULL DEFAULT 1,
            show_conditions INTEGER NOT NULL DEFAULT 1,
            show_doctor_details INTEGER NOT NULL DEFAULT 0,
            show_emergency_contact INTEGER NOT NULL DEFAULT 1,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (profile_id) REFERENCES medical_profiles (id) ON DELETE CASCADE
        );
        """)
        
        # 4. QR Tokens (Cryptographic tokens, SHA-256 hash for public lookup & encrypted token for owner retrieval)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS qr_tokens (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            token_hash TEXT UNIQUE NOT NULL,
            token_encrypted TEXT,
            created_at TEXT NOT NULL,
            revoked_at TEXT,
            last_accessed_at TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            FOREIGN KEY (profile_id) REFERENCES medical_profiles (id) ON DELETE CASCADE
        );
        """)
        
        # Auto-migration: ensure token_encrypted column exists if table was previously created
        cursor.execute("PRAGMA table_info(qr_tokens);")
        columns = [row["name"] for row in cursor.fetchall()]
        if "token_encrypted" not in columns:
            cursor.execute("ALTER TABLE qr_tokens ADD COLUMN token_encrypted TEXT;")
            
        cursor.execute("PRAGMA table_info(medical_profiles);")
        mp_columns = [row["name"] for row in cursor.fetchall()]
        if "emergency_contact_email" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_contact_email TEXT;")
        if "emergency_notification_email" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_notification_email TEXT;")
        if "emergency_email_verified" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_email_verified INTEGER NOT NULL DEFAULT 0;")
        if "emergency_email_verification_code" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_email_verification_code TEXT;")
        if "emergency_email_verification_token" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_email_verification_token TEXT;")
        if "emergency_email_verification_sent_at" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_email_verification_sent_at TEXT;")
        if "pending_emergency_notification_email" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN pending_emergency_notification_email TEXT;")
        if "preferred_language" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'en';")
        if "emergency_second_language" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_second_language TEXT;")
        if "full_name_secondary" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN full_name_secondary TEXT;")
        if "emergency_contact_name_secondary" not in mp_columns:
            cursor.execute("ALTER TABLE medical_profiles ADD COLUMN emergency_contact_name_secondary TEXT;")
            
        # 5. Access Logs (Privacy-Conscious, no raw IP or precise geolocation)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS access_logs (
            id TEXT PRIMARY KEY,
            qr_token_id TEXT,
            profile_id TEXT NOT NULL,
            accessed_at TEXT NOT NULL,
            device_type TEXT NOT NULL DEFAULT 'Unknown Device',
            browser TEXT NOT NULL DEFAULT 'Unknown Browser',
            access_status TEXT NOT NULL,
            FOREIGN KEY (qr_token_id) REFERENCES qr_tokens (id) ON DELETE SET NULL,
            FOREIGN KEY (profile_id) REFERENCES medical_profiles (id) ON DELETE CASCADE
        );
        """)
        
        # 6. Notifications (Demonstration Alerts)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            access_log_id TEXT,
            notification_type TEXT NOT NULL DEFAULT 'SIMULATED',
            recipient TEXT NOT NULL,
            delivery_status TEXT NOT NULL DEFAULT 'SENT',
            message TEXT NOT NULL,
            error_message TEXT,
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (profile_id) REFERENCES medical_profiles (id) ON DELETE CASCADE,
            FOREIGN KEY (access_log_id) REFERENCES access_logs (id) ON DELETE SET NULL
        );
        """)
        
        cursor.execute("PRAGMA table_info(notifications);")
        notif_columns = [row["name"] for row in cursor.fetchall()]
        if "error_message" not in notif_columns:
            cursor.execute("ALTER TABLE notifications ADD COLUMN error_message TEXT;")
        
        # Performance Indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_qr_tokens_hash ON qr_tokens(token_hash);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_qr_tokens_profile ON qr_tokens(profile_id, status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_access_logs_profile ON access_logs(profile_id, accessed_at DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications(profile_id, created_at DESC);")
        
        conn.commit()
