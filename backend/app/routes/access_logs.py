from flask import Blueprint, request, jsonify, g
from app.database import get_db
from app.middleware.authentication import token_required

access_logs_bp = Blueprint("access_logs", __name__)

@access_logs_bp.route("", methods=["GET"])
@token_required
def get_access_logs():
    user_id = g.current_user["id"]
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            return jsonify({"error": "Profile not found"}), 404

        profile_id = profile["id"]

        # Total count
        cursor.execute("SELECT COUNT(*) as total FROM access_logs WHERE profile_id = ?", (profile_id,))
        total_logs = cursor.fetchone()["total"]

        # Fetch logs
        cursor.execute(
            """SELECT id, accessed_at, device_type, browser, access_status
               FROM access_logs
               WHERE profile_id = ?
               ORDER BY accessed_at DESC
               LIMIT ? OFFSET ?""",
            (profile_id, limit, offset)
        )
        logs = [dict(row) for row in cursor.fetchall()]

        # Aggregate stats
        cursor.execute(
            """SELECT device_type, COUNT(*) as count 
               FROM access_logs WHERE profile_id = ? 
               GROUP BY device_type""",
            (profile_id,)
        )
        device_breakdown = [dict(r) for r in cursor.fetchall()]

        return jsonify({
            "logs": logs,
            "pagination": {
                "total": total_logs,
                "page": page,
                "limit": limit,
                "total_pages": (total_logs + limit - 1) // limit if total_logs > 0 else 1
            },
            "device_breakdown": device_breakdown
        }), 200

