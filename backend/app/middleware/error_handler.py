from flask import jsonify

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request", "message": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized access", "message": str(error)}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "message": "You do not have permission to access this resource"}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(429)
    def ratelimit_exceeded(error):
        return jsonify({
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please wait a moment before trying again."
        }), 429

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"error": "Internal server error", "message": "An unexpected error occurred"}), 500

