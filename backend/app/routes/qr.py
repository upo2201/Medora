import io
import os
from flask import Blueprint, request, jsonify, g, send_file
from app.config import Config
from app.database import get_db
from app.middleware.authentication import token_required
from app.services.qr_service import (
    create_or_regenerate_qr,
    revoke_qr_token,
    get_active_qr_token,
    get_emergency_url,
    generate_qr_png_bytes,
    generate_printable_card_pdf,
    generate_lockscreen_wallpaper
)

qr_bp = Blueprint("qr", __name__)

@qr_bp.route("/current", methods=["GET"])
@token_required
def get_current_qr():
    user_id = g.current_user["id"]
    base_url_override = request.args.get("base_url")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        token = get_active_qr_token(profile["id"], base_url_override)
        
        # Scans count
        cursor.execute("SELECT COUNT(*) as count FROM access_logs WHERE profile_id = ?", (profile["id"],))
        total_scans = cursor.fetchone()["count"]

        # Revoked tokens count
        cursor.execute("SELECT COUNT(*) as count FROM qr_tokens WHERE profile_id = ? AND status = 'revoked'", (profile["id"],))
        revoked_count = cursor.fetchone()["count"]

        # Scans this month
        cursor.execute(
            """SELECT COUNT(*) as count FROM access_logs 
               WHERE profile_id = ? AND strftime('%Y-%m', accessed_at) = strftime('%Y-%m', 'now')""",
            (profile["id"],)
        )
        this_month_scans = cursor.fetchone()["count"]

        from app.services.tunnel_service import get_active_tunnel_url, get_public_frontend_url, is_public_mode_active
        detected_base_url = get_public_frontend_url(base_url_override)
        public_active = is_public_mode_active()
        return jsonify({
            "has_active_qr": token is not None,
            "qr": token,
            "patient_name": profile["full_name"],
            "configured_base_url": detected_base_url,
            "is_public_mode": public_active,
            "warning": None if public_active else "No public emergency tunnel or production URL is currently active. For external phone cameras to scan this QR code, please launch Public Mode (start_public_mode.bat) or set EMERGENCY_BASE_URL.",
            "stats": {
                "total_scans": total_scans,
                "revoked_count": revoked_count,
                "this_month_scans": this_month_scans
            }
        }), 200

@qr_bp.route("/generate", methods=["POST"])
@token_required
def generate_qr():
    user_id = g.current_user["id"]
    data = request.get_json(silent=True) or {}
    base_url_override = data.get("base_url") or request.args.get("base_url")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name, emergency_contact_name, emergency_contact_phone FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        # Verify emergency contact exists
        if not profile["emergency_contact_phone"]:
            return jsonify({
                "warning": "Incomplete profile",
                "message": "Please set an Emergency Contact phone number in your profile before generating your QR code."
            }), 400

        # Safety check: if PUBLIC_MODE is active but tunnel is disconnected, prevent generating stale QR codes
        from app.services.tunnel_service import is_tunnel_alive
        if os.getenv("PUBLIC_MODE") == "1" and not is_tunnel_alive() and not base_url_override:
            return jsonify({
                "warning": "Tunnel disconnected",
                "message": "Public ngrok tunnel is currently disconnected. Please wait for the tunnel to reconnect or restart start_public_mode.bat before generating a QR code."
            }), 503

        result = create_or_regenerate_qr(profile["id"], base_url_override)
        return jsonify({
            "message": "New emergency QR code generated successfully",
            "token": result
        }), 201

@qr_bp.route("/revoke", methods=["POST"])
@token_required
def revoke_qr():
    user_id = g.current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        success = revoke_qr_token(profile["id"])
        if not success:
            return jsonify({"message": "No active QR code to revoke"}), 200

        return jsonify({
            "message": "Your QR code has been revoked. Scanners will no longer see your details."
        }), 200

@qr_bp.route("/download", methods=["GET"])
def download_qr_image():
    raw_token = request.args.get("token")
    base_url = request.args.get("base_url")
    if not raw_token:
        return jsonify({"error": "Token query parameter is required"}), 400
        
    emergency_url = get_emergency_url(raw_token, base_url)
    png_bytes = generate_qr_png_bytes(emergency_url)
    
    return send_file(
        io.BytesIO(png_bytes),
        mimetype="image/png",
        as_attachment=True,
        download_name="medora-emergency-qr.png"
    )

@qr_bp.route("/download-card", methods=["GET"])
def download_card_pdf():
    raw_token = request.args.get("token")
    base_url = request.args.get("base_url")
    patient_name = request.args.get("name", "Emergency Medical ID")
    if not raw_token:
        return jsonify({"error": "Token query parameter is required"}), 400

    emergency_url = get_emergency_url(raw_token, base_url)
    pdf_bytes = generate_printable_card_pdf(patient_name, emergency_url)

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"medora-card-{patient_name.replace(' ', '-').lower()}.pdf"
    )

@qr_bp.route("/download-wallpaper", methods=["GET"])
def download_wallpaper():
    raw_token = request.args.get("token")
    base_url = request.args.get("base_url")
    patient_name = request.args.get("name", "Emergency Medical ID")
    if not raw_token:
        return jsonify({"error": "Token query parameter is required"}), 400

    emergency_url = get_emergency_url(raw_token, base_url)
    wallpaper_bytes = generate_lockscreen_wallpaper(patient_name, emergency_url)

    return send_file(
        io.BytesIO(wallpaper_bytes),
        mimetype="image/png",
        as_attachment=True,
        download_name="medora-lockscreen-wallpaper.png"
    )
