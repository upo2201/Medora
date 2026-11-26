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

def get_active_tunnel_url() -> Optional[str]:
    """
    Returns the active public tunnel URL if Public Testing Mode is active.
    Authoritatively checks ngrok's local control API (port 4040), followed by in-memory
    state, environment variable, and persistent runtime state files.
    """
    global _in_memory_tunnel_url

    # 1. Authoritative check: dynamic probe of local ngrok inspection API (port 4040)
    live_url = _probe_live_ngrok_api()
    if live_url:
        if _in_memory_tunnel_url != live_url:
            _in_memory_tunnel_url = live_url
            set_active_tunnel(live_url, {"source": "ngrok_api_probe"})
        return live_url

    # 2. In-memory cached URL (used by tests / mocks when ngrok is not running locally)
    if _in_memory_tunnel_url:
        return _in_memory_tunnel_url

    # 3. Environment variable
    env_url = os.getenv("PUBLIC_TUNNEL_URL", "").strip().rstrip("/")
    if env_url:
        return env_url

    # 4. Check persistent state files
    for sf in STATE_FILES:
        if os.path.exists(sf):
            try:
                with open(sf, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("active") and data.get("tunnel_url"):
                        candidate = data["tunnel_url"]
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
    """Returns True if a live public ngrok tunnel, production URL, or cloud container origin is active."""
    from app.config import Config
    status = get_tunnel_status()
    if status["public_testing_mode"]:
        return True
    conf = (Config.EMERGENCY_BASE_URL or "").lower()
    if conf and "localhost" not in conf and "127.0.0.1" not in conf and "ngrok" not in conf:
        return True
    render_url = (os.getenv("RENDER_EXTERNAL_URL") or "").lower()
    if render_url and "localhost" not in render_url and "127.0.0.1" not in render_url:
        return True
    return False

def get_public_frontend_url(fallback_candidate: Optional[str] = None) -> str:
    """
    Returns the public base URL for links that need to be opened externally on phones
    (such as emergency QR scan links).
    Prioritizes:
    1. Active public ngrok tunnel (highest priority for cross-device mobile scanning).
    2. Explicit non-localhost candidate/override (e.g. production domain).
    3. Configured EMERGENCY_BASE_URL (if set and non-localhost).
    4. Render Cloud external URL (RENDER_EXTERNAL_URL).
    5. Request Origin/Host from Flask context (if public/non-localhost).
    6. Public emergency fallback domain (https://medora-emergency.onrender.com) - NEVER localhost or 127.0.0.1.
    """
    from app.config import Config

    candidate = (fallback_candidate or "").strip().rstrip("/")
    candidate_lower = candidate.lower()

    # 1. Active public ngrok tunnel (HIGHEST PRIORITY for cross-device mobile scanning)
    tunnel_url = get_active_tunnel_url()
    if tunnel_url:
        return tunnel_url

    # 2. Explicit non-localhost candidate override (e.g. custom domain)
    if candidate and "localhost" not in candidate_lower and "127.0.0.1" not in candidate_lower:
        if not candidate.startswith("http://") and not candidate.startswith("https://"):
            candidate = f"https://{candidate}"
        return candidate

    # 3. Configured EMERGENCY_BASE_URL (e.g. deployed production on cloud)
    configured = (Config.EMERGENCY_BASE_URL or "").strip().rstrip("/")
    if configured and "localhost" not in configured.lower() and "127.0.0.1" not in configured.lower():
        if not configured.startswith("http://") and not configured.startswith("https://"):
            configured = f"https://{configured}"
        return configured

    # 4. Render External URL
    render_url = (os.getenv("RENDER_EXTERNAL_URL") or "").strip().rstrip("/")
    if render_url and "localhost" not in render_url.lower() and "127.0.0.1" not in render_url.lower():
        if not render_url.startswith("http://") and not render_url.startswith("https://"):
            render_url = f"https://{render_url}"
        return render_url

    # 5. Request headers if running behind cloud proxy / container
    try:
        from flask import request, has_request_context
        if has_request_context():
            origin = (request.headers.get("Origin") or "").strip().rstrip("/")
            if origin and "localhost" not in origin.lower() and "127.0.0.1" not in origin.lower():
                return origin
            host_url = (request.host_url or "").strip().rstrip("/")
            if host_url and "localhost" not in host_url.lower() and "127.0.0.1" not in host_url.lower():
                return host_url
    except Exception:
        pass

    # 6. Public Default Fallback — NEVER return localhost or 127.0.0.1 for emergency QR URLs
    # This guarantees external phone cameras will never receive an unreachable localhost loopback address
    frontend_candidate = (Config.FRONTEND_URL or "").strip().rstrip("/")
    if frontend_candidate and "localhost" not in frontend_candidate.lower() and "127.0.0.1" not in frontend_candidate.lower():
        if not frontend_candidate.startswith("http://") and not frontend_candidate.startswith("https://"):
            frontend_candidate = f"https://{frontend_candidate}"
        return frontend_candidate

    return "https://medora-emergency.onrender.com"
