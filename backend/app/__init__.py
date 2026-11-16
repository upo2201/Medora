import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import Config
from app.database import init_db
from app.middleware.rate_limit import limiter
from app.middleware.error_handler import register_error_handlers

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Initialize Limiter
    limiter.init_app(app)

    # Register Error Handlers
    register_error_handlers(app)

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.profiles import profiles_bp
    from app.routes.qr import qr_bp
    from app.routes.emergency import emergency_bp
    from app.routes.access_logs import access_logs_bp
    from app.routes.notifications import notifications_bp
    from app.routes.dev import dev_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profiles_bp, url_prefix="/api/profile")
    app.register_blueprint(qr_bp, url_prefix="/api/qr")
    app.register_blueprint(emergency_bp, url_prefix="/api/emergency")
    app.register_blueprint(access_logs_bp, url_prefix="/api/access-logs")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(dev_bp, url_prefix="/api/dev")

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Medora API",
            "version": "1.0.0"
        }), 200

    # Ensure DB is created on startup
    with app.app_context():
        init_db()

    # Frontend SPA serving fallback (if built frontend dist exists)
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
    if os.path.exists(dist_dir):
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path and path.startswith("api/"):
                return jsonify({"error": "API route not found"}), 404
            target = os.path.join(dist_dir, path)
            if path and os.path.exists(target) and not os.path.isdir(target):
                return send_from_directory(dist_dir, path)
            return send_from_directory(dist_dir, "index.html")

    return app

