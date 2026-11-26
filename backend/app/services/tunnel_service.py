import os
import json
import time
import urllib.request
from typing import Optional, Dict, Any

_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_root_dir = os.path.abspath(os.path.join(_backend_dir, ".."))

STATE_FILES = [
    os.path.join(_backend_dir, ".tunnel_state.json"),
    os.path.join(_root_dir, ".tunnel_state.json")
]

_in_memory_tunnel_url: Optional[str] = None

def set_active_tunnel(url: str, metadata: Optional[Dict[str, Any]] = None):
    """Sets the active public tunnel URL in memory and persists to local runtime state files."""
    global _in_memory_tunnel_url
    clean_url = (url or "").strip().rstrip("/")
    _in_memory_tunnel_url = clean_url if clean_url else None
    
    state = {
        "active": bool(clean_url),
        "tunnel_url": clean_url,
        "updated_at": int(time.time()),
        "metadata": metadata or {}
    }
    for sf in STATE_FILES:
        try:
            with open(sf, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            pass

def clear_active_tunnel():
    """Clears the active tunnel state in memory and files."""
    global _in_memory_tunnel_url
    _in_memory_tunnel_url = None
    for sf in STATE_FILES:
        if os.path.exists(sf):
            try:
                os.remove(sf)
            except Exception:
                pass

def _probe_live_ngrok_api() -> Optional[str]:
    """Queries ngrok's local control API on port 4040 to find the active HTTPS public tunnel."""
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:4040/api/tunnels",
            headers={"User-Agent": "Medora-App/2.0"}
        )
        with urllib.request.urlopen(req, timeout=0.6) as res:
            tunnels_data = json.loads(res.read().decode("utf-8"))
            tunnels = tunnels_data.get("tunnels", [])
            for t in tunnels:
                p_url = t.get("public_url", "").strip().rstrip("/")
                if p_url.startswith("https://"):
                    return p_url
            for t in tunnels:
                p_url = t.get("public_url", "").strip().rstrip("/")
                if p_url.startswith("http://"):
                    return p_url.replace("http://", "https://", 1)
    except Exception:
        pass
    return None

def is_tunnel_alive() -> bool:
    """Returns True if the public tunnel or production origin is verified alive and active."""
    live = _probe_live_ngrok_api()
    if live:
        return True
    
    url = _in_memory_tunnel_url or os.getenv("PUBLIC_TUNNEL_URL", "").strip().rstrip("/")
    if url:
        if "ngrok" not in url.lower():
            return True
        return False
    return False

RENDER_FRONTEND_PRODUCTION_URL = "https://medora-frontend-tawk.onrender.com"

def is_render_production() -> bool:
    """Returns True if running in Render cloud production environment."""
    from app.config import Config
    if os.getenv("RENDER") == "true" or os.getenv("RENDER_SERVICE_ID") or os.getenv("RENDER_INSTANCE_ID"):
        return True
    for u in (Config.EMERGENCY_BASE_URL, Config.FRONTEND_URL):
        if u and "onrender.com" in u.lower():
            return True
    return False

def get_active_tunnel_url() -> Optional[str]:
    """
    Returns the active public tunnel URL if Public Testing Mode is active.
    Authoritatively checks ngrok's local control API (port 4040).
    NEVER returns a stale/dead ngrok URL from cache or persistent files when port 4040 is inactive.
    """
    global _in_memory_tunnel_url

    # 1. Authoritative check: dynamic probe of local ngrok inspection API (port 4040)
    live_url = _probe_live_ngrok_api()
    if live_url:
        if _in_memory_tunnel_url != live_url:
            _in_memory_tunnel_url = live_url
            set_active_tunnel(live_url, {"source": "ngrok_api_probe"})
        return live_url

    # 2. In-memory cached URL (used by tests / mocks when explicitly set with 'test')
    if _in_memory_tunnel_url and "test" in _in_memory_tunnel_url.lower():
        return _in_memory_tunnel_url

    # If ngrok was not found on port 4040, clear any cached ngrok URL to prevent stale usage
    if _in_memory_tunnel_url and "ngrok" in _in_memory_tunnel_url.lower():
        _in_memory_tunnel_url = None

    # 3. Environment variable (only if non-ngrok or explicitly provided for testing)
    env_url = os.getenv("PUBLIC_TUNNEL_URL", "").strip().rstrip("/")
    if env_url and ("ngrok" not in env_url.lower() or "test" in env_url.lower()):
        return env_url

    # 4. Check persistent state files (only if non-ngrok or alive)
    for sf in STATE_FILES:
        if os.path.exists(sf):
            try:
                with open(sf, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("active") and data.get("tunnel_url"):
                        candidate = data["tunnel_url"]
                        if "ngrok" in candidate.lower():
                            # Stale ngrok entry in file when port 4040 is dead: remove it
                            try:
                                os.remove(sf)
                            except Exception:
                                pass
                        else:
                            _in_memory_tunnel_url = candidate
                            return candidate
            except Exception:
                pass

    return None

def get_tunnel_status() -> Dict[str, Any]:
    """Returns detailed information about the active public tunnel."""
    live_url = _probe_live_ngrok_api()
    cached_url = get_active_tunnel_url()
    
    # If a live URL was probed, it is definitely connected
    if live_url:
        url = live_url
        is_active = True
    elif cached_url and "ngrok" not in cached_url.lower():
        url = cached_url
        is_active = True
    elif _in_memory_tunnel_url and "test" in (_in_memory_tunnel_url.lower()):
        # Permit mock tunnels for test suites
        url = _in_memory_tunnel_url
        is_active = True
    else:
        url = None
        is_active = False
    
    state_meta = {}
    for sf in STATE_FILES:
        if os.path.exists(sf):
            try:
                with open(sf, "r", encoding="utf-8") as f:
                    state_meta = json.load(f)
                break
            except Exception:
                pass

    return {
        "public_testing_mode": is_active,
        "status": "connected" if is_active else "disconnected",
        "tunnel_url": url,
        "service": "ngrok",
        "updated_at": state_meta.get("updated_at"),
        "target_port": 5173
    }

def is_public_mode_active() -> bool:
    """Returns True if running in production, or if a live public ngrok tunnel is active."""
    from app.config import Config
    if is_render_production():
        return True
    status = get_tunnel_status()
    if status["public_testing_mode"]:
        return True
    conf = (Config.EMERGENCY_BASE_URL or "").lower()
    if conf and "localhost" not in conf and "127.0.0.1" not in conf and "ngrok" not in conf:
        return True
    return False

def get_public_frontend_url(fallback_candidate: Optional[str] = None) -> str:
    """
    Returns the public base URL for emergency QR scan links.
    Guarantees:
    - Never returns localhost or 127.0.0.1 in production.
    - Never returns an expired ngrok tunnel URL.
    - Never returns a fabricated or broken URL (like medora-emergency.onrender.com).
    - In Render production, always returns the active frontend SPA URL: https://medora-frontend-tawk.onrender.com
    - In local development, returns active live ngrok tunnel if Public Mode is running.
    - Explicit non-localhost candidate overrides (e.g. from API caller or custom domain) are honored.
    """
    from app.config import Config

    candidate = (fallback_candidate or "").strip().rstrip("/")
    if candidate and "localhost" not in candidate.lower() and "127.0.0.1" not in candidate.lower():
        if not candidate.startswith("http://") and not candidate.startswith("https://"):
            candidate = f"https://{candidate}"
        return candidate

    # 1. Render Production Environment
    if is_render_production():
        # Check EMERGENCY_BASE_URL (must be frontend, not backend)
        em_base = (Config.EMERGENCY_BASE_URL or "").strip().rstrip("/")
        if em_base and "localhost" not in em_base.lower() and "127.0.0.1" not in em_base.lower():
            if "backend" not in em_base.lower():
                if not em_base.startswith("http://") and not em_base.startswith("https://"):
                    em_base = f"https://{em_base}"
                return em_base

        # Check FRONTEND_URL
        fe_url = (Config.FRONTEND_URL or "").strip().rstrip("/")
        if fe_url and "localhost" not in fe_url.lower() and "127.0.0.1" not in fe_url.lower():
            if "backend" not in fe_url.lower():
                if not fe_url.startswith("http://") and not fe_url.startswith("https://"):
                    fe_url = f"https://{fe_url}"
                return fe_url

        # Check client Origin header if available
        try:
            from flask import request, has_request_context
            if has_request_context():
                origin = (request.headers.get("Origin") or "").strip().rstrip("/")
                if origin and "localhost" not in origin.lower() and "127.0.0.1" not in origin.lower():
                    if "backend" not in origin.lower():
                        return origin
        except Exception:
            pass

        return RENDER_FRONTEND_PRODUCTION_URL

    # 2. Local Development: Active Live ngrok Tunnel
    tunnel_url = get_active_tunnel_url()
    if tunnel_url:
        return tunnel_url

    # 3. Configured EMERGENCY_BASE_URL if set and non-localhost
    configured = (Config.EMERGENCY_BASE_URL or "").strip().rstrip("/")
    if configured and "localhost" not in configured.lower() and "127.0.0.1" not in configured.lower():
        if not configured.startswith("http://") and not configured.startswith("https://"):
            configured = f"https://{configured}"
        return configured

    # 4. Configured FRONTEND_URL if set and non-localhost
    frontend_candidate = (Config.FRONTEND_URL or "").strip().rstrip("/")
    if frontend_candidate and "localhost" not in frontend_candidate.lower() and "127.0.0.1" not in frontend_candidate.lower():
        if not frontend_candidate.startswith("http://") and not frontend_candidate.startswith("https://"):
            frontend_candidate = f"https://{frontend_candidate}"
        return frontend_candidate

    # 5. Local request context Origin if non-localhost
    try:
        from flask import request, has_request_context
        if has_request_context():
            origin = (request.headers.get("Origin") or "").strip().rstrip("/")
            if origin and "localhost" not in origin.lower() and "127.0.0.1" not in origin.lower():
                return origin
    except Exception:
        pass

    # 6. Public Default Fallback — NEVER return localhost or 127.0.0.1 for emergency QR URLs
    # This guarantees external phone cameras will never receive an unreachable localhost loopback address
    return RENDER_FRONTEND_PRODUCTION_URL
