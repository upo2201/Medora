from flask import Blueprint, request, jsonify
from app.services.emergency_service import get_public_emergency_profile
from app.middleware.rate_limit import limiter

emergency_bp = Blueprint("emergency", __name__)

@emergency_bp.route("/<token>", methods=["GET"])
@limiter.limit("15 per minute")
def scan_emergency_profile(token):
    """
    Public emergency scan endpoint.
    - Zero authentication needed
    - Fully read-only
    - Rate limited to prevent scraping
    - Privacy-filtered based on owner's settings
    - Automatically records access log & simulated notification
    """
    user_agent = request.headers.get("User-Agent", "")
    data, status_code = get_public_emergency_profile(token, user_agent)
    return jsonify(data), status_code

