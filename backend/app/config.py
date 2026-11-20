import os
from dotenv import load_dotenv

# Robustly discover and load .env from backend directory and project root
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
_root_dir = os.path.abspath(os.path.join(_backend_dir, ".."))

_backend_env = os.path.join(_backend_dir, ".env")
_root_env = os.path.join(_root_dir, ".env")

# 1. Load backend/.env if present
if os.path.exists(_backend_env):
    load_dotenv(_backend_env, override=True)

# 2. Load root .env if present
if os.path.exists(_root_env):
    load_dotenv(_root_env, override=True)

# 3. Default cwd fallback
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "medora-medical-snapshot-qr-secure-jwt-secret-key-2026")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # Public Base URL for Emergency QR Codes
    # (MUST be accessible from external mobile phones - never localhost or 127.0.0.1 in QR codes)
    EMERGENCY_BASE_URL = os.getenv("EMERGENCY_BASE_URL", "").rstrip("/")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    raw_db_path = os.getenv("DATABASE_PATH", "medora.db")
    if os.path.isabs(raw_db_path):
        DATABASE_PATH = raw_db_path
    else:
        DATABASE_PATH = os.path.abspath(os.path.join(backend_dir, raw_db_path))
    RATELIMIT_STORAGE_URI = os.getenv("REDIS_URL", "memory://")
    
    # Transactional Email Providers (Server-Side Developer Settings: Brevo, Resend, SendGrid, or SMTP)
    # The application owner/developer configures this once. End users never touch these.
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
    BREVO_API_KEY = os.getenv("BREVO_API_KEY", "").strip()
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "").strip()
    EMAIL_FROM = os.getenv("EMAIL_FROM", os.getenv("SMTP_FROM", "Medora Alerts <alerts@medora.app>")).strip()
    
    # SMTP Fallback Configuration (Optional enterprise/self-hosted fallback)
    SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "").strip()
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
    SMTP_FROM = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "alerts@medora.app")).strip()
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")
    SMTP_TIMEOUT = int(os.getenv("SMTP_TIMEOUT", "10"))
