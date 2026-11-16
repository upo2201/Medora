import subprocess
import time
import urllib.request
import json
import sys
import os

def probe():
    print("Starting Flask backend process...")
    py_exe = os.path.abspath("backend/venv/Scripts/python.exe")
    run_script = os.path.abspath("backend/run.py")
    
    proc = subprocess.Popen([py_exe, run_script], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2.5)
    
    try:
        # 1. Probe health
        print("1. Probing /api/health...")
        req = urllib.request.urlopen("http://127.0.0.1:5000/api/health", timeout=5)
        health_data = json.loads(req.read().decode())
        print("Health OK:", health_data)
        assert health_data["status"] == "healthy"

        # 2. Probe public emergency scan
        print("2. Probing /api/emergency/demo-ananya-sen-emergency-2026...")
        req = urllib.request.urlopen("http://127.0.0.1:5000/api/emergency/demo-ananya-sen-emergency-2026", timeout=5)
        scan_data = json.loads(req.read().decode())
        print("Emergency Data Returned:")
        print(f"  Patient: {scan_data.get('full_name')}")
        print(f"  Blood Group: {scan_data.get('blood_group')}")
        print(f"  Allergies: {scan_data.get('allergies')}")
        print(f"  Emergency Contact: {scan_data.get('emergency_contact')}")
        assert scan_data["full_name"] == "Ananya Sen"
        assert scan_data["blood_group"] == "B+"

        # 3. Probe QR image download endpoint
        print("3. Probing /api/qr/download?token=demo-ananya-sen-emergency-2026...")
        req = urllib.request.urlopen("http://127.0.0.1:5000/api/qr/download?token=demo-ananya-sen-emergency-2026", timeout=5)
        img_bytes = req.read()
        print(f"  QR PNG downloaded successfully: {len(img_bytes)} bytes")
        assert len(img_bytes) > 500

        # 4. Probe printable card PDF download
        print("4. Probing /api/qr/download-card?token=demo-ananya-sen-emergency-2026&name=Ananya+Sen...")
        req = urllib.request.urlopen("http://127.0.0.1:5000/api/qr/download-card?token=demo-ananya-sen-emergency-2026&name=Ananya+Sen", timeout=5)
        pdf_bytes = req.read()
        print(f"  PDF Emergency Card downloaded successfully: {len(pdf_bytes)} bytes")
        assert len(pdf_bytes) > 1000

        print("\nALL SERVER ENDPOINT PROBES PASSED PERFECTLY!")

    finally:
        print("Stopping backend process...")
        proc.terminate()
        proc.wait(timeout=3)

if __name__ == "__main__":
    probe()

