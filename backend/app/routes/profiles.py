import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.database import get_db
from app.middleware.authentication import token_required

profiles_bp = Blueprint("profiles", __name__)

@profiles_bp.route("", methods=["GET"])
@token_required
def get_profile():
    user_id = g.current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()

        if not profile:
            return jsonify({"error": "Medical profile not found"}), 404

        profile_id = profile["id"]
        cursor.execute("SELECT * FROM emergency_visibility WHERE profile_id = ?", (profile_id,))
        visibility = cursor.fetchone()

        # Parse JSON fields safely
        conditions = json.loads(profile["medical_conditions"]) if profile["medical_conditions"] else []
        allergies = json.loads(profile["allergies"]) if profile["allergies"] else []
        medications = json.loads(profile["current_medications"]) if profile["current_medications"] else []

        vis_dict = {
            "show_name": bool(visibility["show_name"]) if visibility else True,
            "show_age": bool(visibility["show_age"]) if visibility else True,
            "show_blood_group": bool(visibility["show_blood_group"]) if visibility else True,
            "show_allergies": bool(visibility["show_allergies"]) if visibility else True,
            "show_medications": bool(visibility["show_medications"]) if visibility else True,
            "show_conditions": bool(visibility["show_conditions"]) if visibility else True,
            "show_doctor_details": bool(visibility["show_doctor_details"]) if visibility else False,
            "show_emergency_contact": bool(visibility["show_emergency_contact"]) if visibility else True,
        }

        # Check QR status
        cursor.execute(
            "SELECT id, status, created_at, revoked_at, last_accessed_at FROM qr_tokens WHERE profile_id = ? ORDER BY created_at DESC LIMIT 1",
            (profile_id,)
        )
        latest_qr = cursor.fetchone()

        # Stats
        cursor.execute("SELECT COUNT(*) as total_scans FROM access_logs WHERE profile_id = ?", (profile_id,))
        scan_count = cursor.fetchone()["total_scans"]

        return jsonify({
            "profile": {
                "id": profile["id"],
                "user_id": profile["user_id"],
                "full_name": profile["full_name"],
                "age": profile["age"],
                "blood_group": profile["blood_group"],
                "medical_conditions": conditions,
                "allergies": allergies,
                "no_known_allergies": bool(profile["no_known_allergies"]),
                "current_medications": medications,
                "doctor_name": profile["doctor_name"],
                "doctor_contact": profile["doctor_contact"],
                "emergency_contact_name": profile["emergency_contact_name"],
                "emergency_contact_relationship": profile["emergency_contact_relationship"],
                "emergency_contact_phone": profile["emergency_contact_phone"],
                "emergency_contact_email": profile["emergency_contact_email"] if "emergency_contact_email" in profile.keys() else None,
                "emergency_notification_email": profile["emergency_notification_email"] if "emergency_notification_email" in profile.keys() and profile["emergency_notification_email"] else (profile["emergency_contact_email"] if "emergency_contact_email" in profile.keys() else None),
                "emergency_email_verified": bool(profile["emergency_email_verified"]) if "emergency_email_verified" in profile.keys() else False,
                "pending_emergency_notification_email": profile["pending_emergency_notification_email"] if "pending_emergency_notification_email" in profile.keys() else None,
                "created_at": profile["created_at"],
                "updated_at": profile["updated_at"]
            },
            "visibility": vis_dict,
            "qr": dict(latest_qr) if latest_qr else None,
            "stats": {
                "total_scans": scan_count
            }
        }), 200

@profiles_bp.route("", methods=["PUT"])
@token_required
def update_profile():
    user_id = g.current_user["id"]
    data = request.get_json() or {}

    full_name = (data.get("full_name") or "").strip()
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400

    age = data.get("age")
    if age is not None and age != "":
        try:
            age = int(age)
            if age < 0 or age > 130:
                return jsonify({"error": "Age must be between 0 and 130"}), 400
        except ValueError:
            return jsonify({"error": "Age must be a valid number"}), 400
    else:
        age = None

    blood_group = data.get("blood_group") or None
    conditions = json.dumps(data.get("medical_conditions", []))
    allergies = json.dumps(data.get("allergies", []))
    no_known_allergies = 1 if data.get("no_known_allergies") else 0
    medications = json.dumps(data.get("current_medications", []))
    doctor_name = (data.get("doctor_name") or "").strip() or None
    doctor_contact = (data.get("doctor_contact") or "").strip() or None
    
    ec_name = (data.get("emergency_contact_name") or "").strip()
    ec_rel = (data.get("emergency_contact_relationship") or "").strip()
    ec_phone = (data.get("emergency_contact_phone") or "").strip()
    
    submitted_notif_email = (data.get("emergency_notification_email") or data.get("emergency_contact_email") or "").strip().lower()

    now = datetime.now(timezone.utc).isoformat()
    response_msg = "Medical profile updated successfully"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM medical_profiles WHERE user_id = ?", (user_id,))
        curr = cursor.fetchone()
        if not curr:
            return jsonify({"error": "Profile not found"}), 404

        if submitted_notif_email:
            if "@" not in submitted_notif_email or "." not in submitted_notif_email:
                return jsonify({"error": "Please enter a valid Emergency Notification Email address"}), 400
            target_notif_email = submitted_notif_email
        else:
            target_notif_email = curr["emergency_notification_email"] or curr["emergency_contact_email"] or ""

        cursor.execute(
            """UPDATE medical_profiles
               SET full_name = ?, age = ?, blood_group = ?, medical_conditions = ?,
                   allergies = ?, no_known_allergies = ?, current_medications = ?,
                   doctor_name = ?, doctor_contact = ?,
                   emergency_contact_name = ?, emergency_contact_relationship = ?,
                   emergency_contact_phone = ?,
                   emergency_contact_email = ?,
                   emergency_notification_email = ?,
                   emergency_email_verified = 1,
                   pending_emergency_notification_email = NULL,
                   emergency_email_verification_code = NULL,
                   emergency_email_verification_token = NULL,
                   updated_at = ?
               WHERE user_id = ?""",
            (full_name, age, blood_group, conditions, allergies, no_known_allergies,
             medications, doctor_name, doctor_contact, ec_name, ec_rel, ec_phone,
             target_notif_email, target_notif_email, now, user_id)
        )

        # Also update user's name
        cursor.execute("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?", (full_name, now, user_id))
        conn.commit()

    return jsonify({"message": response_msg, "updated_at": now}), 200

@profiles_bp.route("/visibility", methods=["PUT"])
@token_required
def update_visibility():
    user_id = g.current_user["id"]
    data = request.get_json() or {}

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        profile_id = profile["id"]
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute(
            """UPDATE emergency_visibility
               SET show_name = ?, show_age = ?, show_blood_group = ?,
                   show_allergies = ?, show_medications = ?, show_conditions = ?,
                   show_doctor_details = ?, show_emergency_contact = ?, updated_at = ?
               WHERE profile_id = ?""",
            (
                1 if data.get("show_name", True) else 0,
                1 if data.get("show_age", True) else 0,
                1 if data.get("show_blood_group", True) else 0,
                1 if data.get("show_allergies", True) else 0,
                1 if data.get("show_medications", True) else 0,
                1 if data.get("show_conditions", True) else 0,
                1 if data.get("show_doctor_details", False) else 0,
                1 if data.get("show_emergency_contact", True) else 0,
                now,
                profile_id
            )
        )
        conn.commit()

    return jsonify({"message": "Emergency visibility preferences updated successfully"}), 200

