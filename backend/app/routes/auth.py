import uuid
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, g
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from app.config import Config
from app.database import get_db
from app.middleware.authentication import token_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    full_name = f"{first_name} {last_name}".strip() or data.get("full_name", "").strip()
    emergency_notification_email = (data.get("emergency_notification_email") or "").strip().lower()
    
    preferred_language = (data.get("preferred_language") or "en").strip().lower()
    if preferred_language not in ("en", "bn", "hi"):
        preferred_language = "en"

    emergency_second_language = (data.get("emergency_second_language") or "").strip().lower()
    if emergency_second_language not in ("bn", "hi"):
        emergency_second_language = None

    full_name_secondary = (data.get("full_name_secondary") or "").strip() or None

    if not email or "@" not in email:
        return jsonify({"error": "Please provide a valid account email address"}), 400
    if not emergency_notification_email or "@" not in emergency_notification_email or "." not in emergency_notification_email:
        return jsonify({"error": "Please provide a valid Emergency Notification Email. This is required for safety alerts when your QR is scanned."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if not full_name:
        return jsonify({"error": "Please provide your full name"}), 400

    now = datetime.now(timezone.utc).isoformat()
    user_id = str(uuid.uuid4())
    profile_id = str(uuid.uuid4())
    visibility_id = str(uuid.uuid4())
    pw_hash = generate_password_hash(password)

    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                return jsonify({"error": "An account with this email already exists"}), 409
                
            # Create user
            cursor.execute(
                """INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (user_id, email, pw_hash, full_name, now, now)
            )
            
            # Create initial medical profile with mandatory emergency notification email & language preferences
            cursor.execute(
                """INSERT INTO medical_profiles 
                   (id, user_id, full_name, age, blood_group, medical_conditions, allergies, no_known_allergies, 
                    current_medications, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, 
                    emergency_contact_email, emergency_notification_email, emergency_email_verified,
                    emergency_email_verification_code, emergency_email_verification_token, emergency_email_verification_sent_at,
                    preferred_language, emergency_second_language, full_name_secondary, emergency_contact_name_secondary,
                    created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, '[]', '[]', 0, '[]', '', '', '', ?, ?, 1, NULL, NULL, NULL, ?, ?, ?, NULL, ?, ?)""",
                (
                    profile_id, user_id, full_name, None, None,
                    emergency_notification_email, emergency_notification_email,
                    preferred_language, emergency_second_language, full_name_secondary,
                    now, now
                )
            )
            
            # Create default emergency visibility
            cursor.execute(
                """INSERT INTO emergency_visibility 
                   (id, profile_id, show_name, show_age, show_blood_group, show_allergies, 
                    show_medications, show_conditions, show_doctor_details, show_emergency_contact, updated_at)
                   VALUES (?, ?, 1, 1, 1, 1, 1, 1, 0, 1, ?)""",
                (visibility_id, profile_id, now)
            )
            
            conn.commit()

        # Generate JWT
        token = jwt.encode(
            {
                "sub": user_id,
                "email": email,
                "exp": datetime.now(timezone.utc) + timedelta(days=7)
            },
            Config.SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Account created successfully",
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "preferred_language": preferred_language,
                "emergency_second_language": emergency_second_language
            }
        }), 201

    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Please provide both email and password"}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        token = jwt.encode(
            {
                "sub": user["id"],
                "email": user["email"],
                "exp": datetime.now(timezone.utc) + timedelta(days=7)
            },
            Config.SECRET_KEY,
            algorithm="HS256"
        )

        # Fetch language preferences from medical profile
        cursor.execute("SELECT preferred_language, emergency_second_language FROM medical_profiles WHERE user_id = ?", (user["id"],))
        mp = cursor.fetchone()
        pref_lang = mp["preferred_language"] if mp and "preferred_language" in mp.keys() else "en"
        sec_lang = mp["emergency_second_language"] if mp and "emergency_second_language" in mp.keys() else None

        return jsonify({
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "preferred_language": pref_lang,
                "emergency_second_language": sec_lang
            }
        }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    user = dict(g.current_user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, preferred_language, emergency_second_language FROM medical_profiles WHERE user_id = ?", (user["id"],))
        profile = cursor.fetchone()
        if profile:
            user["preferred_language"] = profile["preferred_language"] if "preferred_language" in profile.keys() else "en"
            user["emergency_second_language"] = profile["emergency_second_language"] if "emergency_second_language" in profile.keys() else None
        
    return jsonify({
        "user": user,
        "profile_id": profile["id"] if profile else None
    })

@auth_bp.route("/update-password", methods=["POST"])
@token_required
def update_password():
    user_id = g.current_user["id"]
    data = request.get_json() or {}
    old_pw = data.get("current_password") or ""
    new_pw = data.get("new_password") or ""

    if len(new_pw) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user["password_hash"], old_pw):
            return jsonify({"error": "Current password incorrect"}), 400

        new_hash = generate_password_hash(new_pw)
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", (new_hash, now, user_id))
        conn.commit()

    return jsonify({"message": "Password updated successfully"}), 200

@auth_bp.route("/delete-account", methods=["DELETE"])
@token_required
def delete_account():
    user_id = g.current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        # Find medical profile id
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        med = cursor.fetchone()
        if med:
            profile_id = med["id"]
            # Revoke all QR tokens immediately
            now = datetime.now(timezone.utc).isoformat()
            cursor.execute("UPDATE qr_tokens SET status = 'revoked', revoked_at = ? WHERE profile_id = ?", (now, profile_id))
        
        # Deleting user cascades to medical_profiles, visibility, access_logs, and notifications
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()

    return jsonify({"message": "Account and all associated records have been permanently deleted and QR codes revoked"}), 200

@auth_bp.route("/verify-emergency-email", methods=["POST", "GET"])
def verify_emergency_email():
    """Legacy redirect/noop handler: verification is not required in simplified mode."""
    if request.method == "GET":
        from flask import redirect
        return redirect(f"{Config.FRONTEND_URL}/profile")
    return jsonify({
        "success": True,
        "message": "Email verification is not required. Alerts are automatically active."
    }), 200


