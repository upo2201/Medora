from flask import Blueprint, jsonify, request
from app.services.tunnel_service import get_tunnel_status, set_active_tunnel, clear_active_tunnel
from app.services.qr_service import get_active_qr_token
from app.middleware.authentication import token_required

dev_bp = Blueprint("dev", __name__)

@dev_bp.route("/tunnel-status", methods=["GET"])
def tunnel_status():
    """Returns the current ngrok public tunnel status and active public URL."""
    status = get_tunnel_status()
    return jsonify(status), 200

@dev_bp.route("/set-tunnel", methods=["POST"])
def update_tunnel():
    """Internal endpoint used by start_public_mode.py to register the detected ngrok URL."""
    data = request.get_json(silent=True) or {}
    url = data.get("url")
    if url:
        set_active_tunnel(url, {"source": "launcher_api"})
        return jsonify({"message": "Tunnel URL registered", "tunnel_url": url}), 200
    else:
        clear_active_tunnel()
        return jsonify({"message": "Tunnel URL cleared"}), 200

@dev_bp.route("/refresh-qr-url", methods=["POST"])
@token_required
def refresh_qr_for_tunnel():
    """
    Refreshes the QR code URL mapping for the user's active token to match
    the current tunnel URL without revoking or changing the cryptographic token.
    """
    from flask import g
    from app.database import get_db

    user_id = g.current_user["id"]
    data = request.get_json(silent=True) or {}
    new_base_url = data.get("base_url")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        token_record = get_active_qr_token(profile["id"], new_base_url)
        if not token_record:
            return jsonify({"error": "No active QR code found to refresh"}), 404

        return jsonify({
            "message": "QR code URL refreshed for current tunnel",
            "token": token_record
        }), 200

@dev_bp.route("/email-provider-status", methods=["GET"])
def email_provider_status():
    """Returns the current transactional email provider status (Resend, Brevo, SendGrid, SMTP)."""
    from app.services.email_service import get_email_provider_info
    return jsonify(get_email_provider_info()), 200
