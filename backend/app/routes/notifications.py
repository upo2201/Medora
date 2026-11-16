from flask import Blueprint, request, jsonify, g
from app.database import get_db
from app.middleware.authentication import token_required

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("", methods=["GET"])
@token_required
def get_notifications():
    user_id = g.current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        profile_id = profile["id"]

        cursor.execute(
            """SELECT id, notification_type, recipient, delivery_status, error_message, message, is_read, created_at
               FROM notifications
               WHERE profile_id = ?
               ORDER BY created_at DESC
               LIMIT 50""",
            (profile_id,)
        )
        notifs = [dict(row) for row in cursor.fetchall()]

        cursor.execute(
            "SELECT COUNT(*) as unread_count FROM notifications WHERE profile_id = ? AND is_read = 0",
            (profile_id,)
        )
        unread = cursor.fetchone()["unread_count"]

        return jsonify({
            "notifications": notifs,
            "unread_count": unread
        }), 200

@notifications_bp.route("/<notif_id>/read", methods=["POST"])
@token_required
def mark_read(notif_id):
    user_id = g.current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND profile_id = ?",
            (notif_id, profile["id"])
        )
        conn.commit()

    return jsonify({"message": "Notification marked as read"}), 200

@notifications_bp.route("/read-all", methods=["POST"])
@token_required
def mark_all_read():
    user_id = g.current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        cursor.execute(
            "UPDATE notifications SET is_read = 1 WHERE profile_id = ?",
            (profile["id"],)
        )
        conn.commit()

    return jsonify({"message": "All notifications marked as read"}), 200

@notifications_bp.route("/test-email", methods=["POST"])
@token_required
def send_test_email_route():
    user_id = g.current_user["id"]
    data = request.get_json() or {}
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404
            
        cursor.execute("SELECT email FROM users WHERE id = ?", (user_id,))
        u_row = cursor.fetchone()
        user_email = u_row["email"] if u_row else ""
        
    recipient = (data.get("recipient") or "").strip()
    if not recipient:
        recipient = (profile["emergency_notification_email"] or profile["emergency_contact_email"] or "").strip()
    if not recipient:
        recipient = user_email
    if not recipient:
        return jsonify({"error": "No recipient email address found. Please enter or save an emergency alert email."}), 400
        
    from app.services.email_service import send_test_email
    result = send_test_email(
        recipient_email=recipient,
        patient_name=profile["full_name"],
        profile_id=profile["id"]
    )
    
    return jsonify(result), 200 if result.get("success") else 500

