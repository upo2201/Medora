#!/usr/bin/env python3
"""
Medora — Public Testing Mode Launcher
Launches Vite Frontend (port 5173), ngrok Tunnel (forwarding to 5173), and Flask Backend (port 5000).
Automatically detects the public HTTPS URL and registers it with the application.
"""

import os
import sys
import time
import json
import signal
import shutil
import urllib.request
import urllib.error
import subprocess
from typing import Optional

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
BIN_DIR = os.path.join(ROOT_DIR, "bin")
NGROK_EXE = os.path.join(BIN_DIR, "ngrok.exe")

VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable

backend_proc: Optional[subprocess.Popen] = None
frontend_proc: Optional[subprocess.Popen] = None
active_tunnel_url: Optional[str] = None

def print_banner():
    print("=" * 72)
    print("        MEDORA — PUBLIC TESTING MODE (CROSS-DEVICE SCANNING)")
    print("=" * 72)

def check_requirements():
    """Validates Node.js and ngrok binary availability."""
    npm_path = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_path:
        print("[!] Error: Node.js / npm is not found in PATH.")
        print("    Please install Node.js (https://nodejs.org) to run the Medora frontend.")
        sys.exit(1)

    if not os.path.exists(NGROK_EXE):
        print(f"[!] ngrok binary not found at {NGROK_EXE}. Downloading official binary...")
        os.makedirs(BIN_DIR, exist_ok=True)
        import zipfile
        import io
        url = "https://bin.ngrok.com/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as res:
            with zipfile.ZipFile(io.BytesIO(res.read())) as z:
                with open(NGROK_EXE, "wb") as f:
                    f.write(z.read("ngrok.exe"))
        print(f"✓ Downloaded ngrok executable to: {NGROK_EXE}")

def ensure_ngrok_authtoken():
    """Checks for ngrok authtoken; prompts user if missing."""
    env_file = os.path.join(BACKEND_DIR, ".env")
    token_found = os.getenv("NGROK_AUTHTOKEN", "").strip()

    if not token_found and os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("NGROK_AUTHTOKEN="):
                    token_found = line.split("=", 1)[1].strip()

    if not token_found:
        res = subprocess.run([NGROK_EXE, "config", "check"], capture_output=True, text=True)
        if res.returncode == 0 and "valid" in res.stdout.lower():
            return True

    if not token_found:
        print("\n" + "-" * 72)
        print("  [!] ONE-TIME NGROK AUTHENTICATION REQUIRED")
        print("-" * 72)
        print("  ngrok requires a free personal authtoken to establish public tunnels.")
        print("  1. Create a free account at: https://dashboard.ngrok.com/signup")
        print("  2. Copy your token from:     https://dashboard.ngrok.com/get-started/your-authtoken")
        print("-" * 72)
        try:
            user_input = input("  Paste your ngrok Auth Token here (or press Enter to skip): ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nSetup cancelled.")
            sys.exit(1)

        if user_input:
            token_found = user_input
            subprocess.run([NGROK_EXE, "config", "add-authtoken", token_found], check=False)
            with open(env_file, "a", encoding="utf-8") as f:
                f.write(f"\nNGROK_AUTHTOKEN={token_found}\n")
            print("  ✓ Authtoken saved successfully!")
        else:
            print("  [!] Continuing without authtoken. Note: ngrok v3 requires authentication.")

    if token_found:
        subprocess.run([NGROK_EXE, "config", "add-authtoken", token_found], check=False, capture_output=True)

def wait_for_http(url: str, timeout: int = 15, name: str = "Service") -> bool:
    """Polls an HTTP endpoint until it returns a successful response."""
    start = time.time()
    print(f"[*] Waiting for {name} ({url})...", end="", flush=True)
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=1) as res:
                if res.status < 500:
                    print(" Ready!")
                    return True
        except Exception:
            pass
        time.sleep(0.5)
        print(".", end="", flush=True)
    print(" Timed out.")
    return False

def free_port(port: int):
    """Gracefully terminates any stale process listening on the specified port on Windows."""
    if sys.platform != "win32":
        return
    try:
        out = subprocess.check_output(f"netstat -ano -p tcp | findstr :{port}", shell=True, text=True, stderr=subprocess.DEVNULL)
        for line in out.strip().splitlines():
            parts = line.split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pid = parts[-1]
                if pid and pid != "0" and int(pid) != os.getpid():
                    subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)
                    time.sleep(0.3)
    except Exception:
        pass

def kill_stale_ngrok():
    """Kills any orphaned ngrok.exe processes on Windows."""
    if sys.platform == "win32":
        try:
            subprocess.run(["taskkill", "/F", "/IM", "ngrok.exe"], capture_output=True)
            time.sleep(0.5)
        except Exception:
            pass

def start_frontend():
    """Starts Vite Dev Server on port 5173."""
    global frontend_proc
    cmd = ["npm.cmd" if sys.platform == "win32" else "npm", "run", "dev"]
    frontend_proc = subprocess.Popen(
        cmd,
        cwd=FRONTEND_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    if not wait_for_http("http://127.0.0.1:5173", timeout=20, name="Vite Frontend"):
        print("[!] Failed to verify Vite frontend startup.")
        cleanup_and_exit(1)

def start_ngrok() -> str:
    """Starts ngrok tunnel on port 5173 using pyngrok pointing to bin/ngrok.exe."""
    global active_tunnel_url
    print("[*] Establishing secure public ngrok HTTPS tunnel to port 5173...")
    
    try:
        from pyngrok import ngrok, conf
        from pyngrok.exception import PyngrokNgrokError

        conf.get_default().ngrok_path = NGROK_EXE

        # Check if an existing tunnel is already connected
        try:
            tunnels = ngrok.get_tunnels()
            for t in tunnels:
                if t.public_url and "ngrok" in t.public_url:
                    active_tunnel_url = t.public_url
                    break
        except Exception:
            pass

        if not active_tunnel_url:
            tunnel = ngrok.connect(5173)
            active_tunnel_url = tunnel.public_url

        # Persist runtime state files in both backend and root directories
        for sf in [os.path.join(BACKEND_DIR, ".tunnel_state.json"), os.path.join(ROOT_DIR, ".tunnel_state.json")]:
            try:
                with open(sf, "w", encoding="utf-8") as f:
                    json.dump({
                        "active": True,
                        "tunnel_url": active_tunnel_url,
                        "updated_at": int(time.time()),
                        "metadata": {"source": "launcher_direct"}
                    }, f, indent=2)
            except Exception:
                pass

        print(f"✓ Public ngrok tunnel active: {active_tunnel_url}")
        return active_tunnel_url

    except Exception as e:
        err_msg = str(e)
        if "ERR_NGROK_4018" in err_msg or "authentication failed" in err_msg.lower():
            print("\n[!] Authentication Error: ngrok authtoken is invalid or missing.")
            print("    Please run: bin\\ngrok.exe config add-authtoken <your_token>")
            print("    Or set NGROK_AUTHTOKEN in backend/.env")
        else:
            print(f"\n[!] Error starting ngrok: {err_msg}")
        cleanup_and_exit(1)
        return ""

def start_backend(public_tunnel_url: Optional[str] = None):
    """Starts Flask API backend on port 5000, pre-seeded with the active public tunnel URL."""
    global backend_proc
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["PUBLIC_MODE"] = "1"

    # Explicitly load backend/.env and root .env into env dict so child process has them
    from dotenv import dotenv_values
    for env_file in [os.path.join(ROOT_DIR, ".env"), os.path.join(BACKEND_DIR, ".env")]:
        if os.path.exists(env_file):
            for k, v in dotenv_values(env_file).items():
                if v is not None:
                    env[k] = v

    # Pass the active public tunnel URL directly to Flask environment
    if public_tunnel_url:
        env["PUBLIC_TUNNEL_URL"] = public_tunnel_url
        env["EMERGENCY_BASE_URL"] = public_tunnel_url

    cmd = [VENV_PYTHON, os.path.join(BACKEND_DIR, "run.py")]
    backend_proc = subprocess.Popen(
        cmd,
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    if not wait_for_http("http://127.0.0.1:5000/api/health", timeout=15, name="Flask Backend"):
        print("[!] Failed to verify Flask backend startup.")
        cleanup_and_exit(1)

    # Register tunnel with local Flask backend in-memory cache
    if public_tunnel_url:
        try:
            req = urllib.request.Request(
                "http://127.0.0.1:5000/api/dev/set-tunnel",
                data=json.dumps({"url": public_tunnel_url}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception:
            pass

def cleanup_and_exit(code: int = 0):
    """Gracefully terminates backend, frontend, and ngrok tunnel."""
    print("\n[*] Shutting down Medora Public Testing Mode...")

    # 1. Disconnect ngrok
    try:
        from pyngrok import ngrok
        ngrok.kill()
    except Exception:
        pass
    kill_stale_ngrok()

    # 2. Clear tunnel state files
    for sf in [os.path.join(BACKEND_DIR, ".tunnel_state.json"), os.path.join(ROOT_DIR, ".tunnel_state.json")]:
        if os.path.exists(sf):
            try:
                os.remove(sf)
            except Exception:
                pass

    # 3. Terminate Frontend
    global frontend_proc
    if frontend_proc:
        try:
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], capture_output=True)
            else:
                frontend_proc.terminate()
        except Exception:
            pass

    # 4. Terminate Backend
    global backend_proc
    if backend_proc:
        try:
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], capture_output=True)
            else:
                backend_proc.terminate()
        except Exception:
            pass

    print("✓ All processes safely stopped.")
    sys.exit(code)

def main():
    print_banner()
    check_requirements()
    ensure_ngrok_authtoken()

    # Pre-flight: free ports and terminate orphaned ngrok daemons
    free_port(5000)
    free_port(5173)
    free_port(4040)
    kill_stale_ngrok()

    # Register signal handlers for clean exit
    signal.signal(signal.SIGINT, lambda s, f: cleanup_and_exit(0))
    signal.signal(signal.SIGTERM, lambda s, f: cleanup_and_exit(0))

    # Optimal startup order:
    # 1. Start Vite Frontend (port 5173)
    start_frontend()
    # 2. Start ngrok tunnel forwarding to port 5173 (discovers active public URL)
    public_url = start_ngrok()
    # 3. Start Flask Backend with PUBLIC_TUNNEL_URL injected into its environment
    start_backend(public_url)

    # Query email provider configuration status
    email_status_str = "Unconfigured"
    try:
        req = urllib.request.Request("http://127.0.0.1:5000/api/dev/email-provider-status", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=2) as r:
            ep_data = json.loads(r.read().decode("utf-8"))
            if ep_data.get("configured"):
                email_status_str = f"Active ({ep_data.get('name')})"
            else:
                email_status_str = "Awaiting Server Key (Configure BREVO_API_KEY in backend/.env)"
    except Exception:
        pass

    print("\n" + "=" * 72)
    print("✓ MEDORA IS NOW RUNNING IN PUBLIC TESTING MODE!")
    print("=" * 72)
    print(f"  ● Local Dashboard:       http://localhost:5173")
    print(f"  ● Local Flask API:       http://127.0.0.1:5000/api")
    print(f"  ● Public ngrok URL:      {public_url}")
    print(f"  ● Transactional Email:   {email_status_str}")
    print("-" * 72)
    print("  HOW TO TEST CROSS-DEVICE WITH YOUR PHONE:")
    print("  1. Open http://localhost:5173 on your computer.")
    print("  2. Log in and go to 'Emergency QR Code' (/qr).")
    print("  3. Click 'Generate QR Code' — it automatically encodes the active public link.")
    print("  4. Point your phone camera at the QR code on your monitor.")
    print("  5. Tap 'Visit site' once if prompted by ngrok's free-tier safety screen.")
    print("  6. The read-only emergency card opens immediately without login!")
    print("  7. Check your email or dashboard notifications for the instant access alert.")
    print("-" * 72)
    print("  Press Ctrl+C to stop all servers and close the public tunnel.")
    print("=" * 72 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup_and_exit(0)

if __name__ == "__main__":
    main()
