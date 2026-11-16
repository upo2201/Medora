import os
import json
import time
import urllib.request
import urllib.error
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

def get_active_tunnel_url() -> Optional[str]:
    """
    Returns the active public tunnel URL if Public Testing Mode is active.
    Checks environment variable, in-memory state, runtime state files,
    and dynamically queries ngrok's local control API (port 4040).
    """
    global _in_memory_tunnel_url
    # 1. Environment variable
    env_url = os.getenv("PUBLIC_TUNNEL_URL", "").strip().rstrip("/")
    if env_url:
        return env_url
        
    # 2. In-memory cached URL
    if _in_memory_tunnel_url:
        return _in_memory_tunnel_url

    # 3. Check persistent state files
    for sf in STATE_FILES:
        if os.path.exists(sf):
            try:
                with open(sf, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("active") and data.get("tunnel_url"):
                        _in_memory_tunnel_url = data["tunnel_url"]
                        return _in_memory_tunnel_url
            except Exception:
                pass

    # 4. Dynamic probe of local ngrok inspection API (port 4040)
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:4040/api/tunnels",
            headers={"User-Agent": "Medora-App/2.0"}
        )
        with urllib.request.urlopen(req, timeout=0.5) as res:
            tunnels_data = json.loads(res.read().decode("utf-8"))
            tunnels = tunnels_data.get("tunnels", [])
            for t in tunnels:
                p_url = t.get("public_url", "").strip().rstrip("/")
                if p_url.startswith("https://"):
                    _in_memory_tunnel_url = p_url
                    set_active_tunnel(p_url, {"source": "ngrok_api_probe"})
                    return p_url
            if tunnels:
                first_url = tunnels[0].get("public_url", "").strip().rstrip("/")
                if first_url:
                    _in_memory_tunnel_url = first_url
                    set_active_tunnel(first_url, {"source": "ngrok_api_probe"})
                    return first_url
    except Exception:
        pass

    return None

def get_tunnel_status() -> Dict[str, Any]:
    """Returns detailed information about the active public tunnel."""
    url = get_active_tunnel_url()
    is_active = bool(url)
    
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

def get_public_frontend_url(fallback_candidate: Optional[str] = None) -> str:
    """
    Returns the public base URL for links that need to be opened externally on phones
    (such as emergency QR scan links).
    Prioritizes:
    1. Active public ngrok tunnel (highest priority for cross-device camera scanning).
    2. Explicit non-localhost candidate/override (e.g. production domain).
    3. Configured EMERGENCY_BASE_URL (if set and non-localhost).
    4. Request Origin/Host from Flask context (if public/non-localhost).
    5. Fallback candidate or Config.FRONTEND_URL (http://localhost:5173).
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
        return candidate

    # 3. Configured EMERGENCY_BASE_URL (e.g. deployed production on cloud)
    configured = (Config.EMERGENCY_BASE_URL or "").strip().rstrip("/")
    if configured and "localhost" not in configured.lower() and "127.0.0.1" not in configured.lower():
        return configured

    # 4. Request headers if running behind cloud proxy / container
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

    # 5. Fallback candidate or configured FRONTEND_URL
    return (Config.FRONTEND_URL or "http://localhost:5173").strip().rstrip("/")
