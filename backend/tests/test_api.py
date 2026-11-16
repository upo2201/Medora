import unittest
import json
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.config import Config
from app.database import get_db, init_db
from seed import seed_demo_data

class TestMedoraAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        seed_demo_data(reset=True)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "Medora API")

    def test_02_new_user_starts_with_no_qr(self):
        # 1. Register a fresh user with dummy data and unique email
        import uuid
        unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
        reg_res = self.client.post("/api/auth/register", json={
            "full_name": "Vikram Malhotra",
            "email": unique_email,
            "password": "Password123!",
            "emergency_notification_email": "vikram.emergency@example.com"
        })
        self.assertEqual(reg_res.status_code, 201)
        token = reg_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Check QR status immediately after signup
        qr_res = self.client.get("/api/qr/current", headers=headers)
        self.assertEqual(qr_res.status_code, 200)
        qr_data = qr_res.get_json()
        self.assertFalse(qr_data["has_active_qr"])
        self.assertIsNone(qr_data["qr"])

    def test_03_complete_e2e_lifecycle(self):
        # Step 1: Login as Ananya Sen (seeded dummy profile)
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        self.assertEqual(login_res.status_code, 200)
        jwt_token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {jwt_token}"}

        # Step 2: Update Profile and Visibility Settings
        vis_res = self.client.put("/api/profile/visibility", headers=headers, json={
            "show_name": True,
            "show_age": True,
            "show_blood_group": True,
            "show_allergies": True,
            "show_medications": True,
            "show_conditions": True,
            "show_doctor_details": True,
            "show_emergency_contact": True
        })
        self.assertEqual(vis_res.status_code, 200)

        # Step 3: Explicitly click Generate QR
        gen_res = self.client.post("/api/qr/generate", headers=headers, json={
            "base_url": "https://medora-emergency.onrender.com"
        })
        self.assertEqual(gen_res.status_code, 201)
        gen_data = gen_res.get_json()
        self.assertIn("token", gen_data)
        raw_token = gen_data["token"]["raw_token"]
        emergency_url = gen_data["token"]["emergency_url"]

        self.assertTrue(len(raw_token) >= 32)
        self.assertTrue(emergency_url.startswith("https://medora-emergency.onrender.com/emergency/"))
        self.assertNotIn("localhost", emergency_url)
        self.assertNotIn("127.0.0.1", emergency_url)

        # Step 4: Verify QR persists when owner revisits dashboard
        current_res = self.client.get("/api/qr/current", headers=headers)
        self.assertEqual(current_res.status_code, 200)
        current_data = current_res.get_json()
        self.assertTrue(current_data["has_active_qr"])
        self.assertEqual(current_data["qr"]["raw_token"], raw_token)

        # Step 5: Simulate scanning QR code from external phone (Mobile User-Agent)
        mobile_headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            "X-Forwarded-For": "203.0.113.195"
        }
        scan_res = self.client.get(f"/api/emergency/{raw_token}", headers=mobile_headers)
        self.assertEqual(scan_res.status_code, 200)
        scan_data = scan_res.get_json()

        # Step 6: Verify read-only public medical card contents
        self.assertEqual(scan_data["full_name"], "Ananya Sen")
        self.assertEqual(scan_data["age"], 72)
        self.assertEqual(scan_data["blood_group"], "B+")
        self.assertTrue(any("Penicillin" in a for a in scan_data["allergies"]))
        self.assertEqual(scan_data["emergency_contact"]["name"], "Ritu Sen")
        self.assertEqual(scan_data["emergency_contact"]["relationship"], "Daughter")
        self.assertEqual(scan_data["emergency_contact"]["phone"], "+91 98765 43210")

        # Step 7: Check owner's Access Logs to verify access event was recorded
        logs_res = self.client.get("/api/access-logs", headers=headers)
        self.assertEqual(logs_res.status_code, 200)
        logs_data = logs_res.get_json()
        self.assertTrue(len(logs_data["logs"]) > 0)
        latest_log = logs_data["logs"][0]
        self.assertEqual(latest_log["access_status"], "success")

        # Step 8: Check simulated notification in owner's dashboard
        notif_res = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(notif_res.status_code, 200)
        notif_data = notif_res.get_json()
        self.assertTrue(len(notif_data["notifications"]) > 0)

        # Step 9: Revoke QR code
        revoke_res = self.client.post("/api/qr/revoke", headers=headers)
        self.assertEqual(revoke_res.status_code, 200)

        # Step 10: Verify public scan now returns 403 Revoked
        scan_revoked = self.client.get(f"/api/emergency/{raw_token}", headers=mobile_headers)
        self.assertEqual(scan_revoked.status_code, 403)
        self.assertEqual(scan_revoked.get_json()["status"], "revoked")

    def test_04_invalid_token_returns_404(self):
        res = self.client.get("/api/emergency/definitely-invalid-token-12345")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertEqual(data["status"], "invalid")

    def test_05_download_endpoints_generate_valid_media(self):
        # 1. Login as Ananya Sen and generate QR
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
        self.assertEqual(gen_res.status_code, 201)
        raw_token = gen_res.get_json()["token"]["raw_token"]

        # 2. Test PNG QR download
        png_res = self.client.get(f"/api/qr/download?token={raw_token}", headers=headers)
        self.assertEqual(png_res.status_code, 200)
        self.assertEqual(png_res.headers.get("Content-Type"), "image/png")
        self.assertTrue(len(png_res.data) > 100)

        # 3. Test PDF printable card & phone sticker download
        pdf_res = self.client.get(f"/api/qr/download-card?token={raw_token}&name=Ananya+Sen", headers=headers)
        self.assertEqual(pdf_res.status_code, 200)
        self.assertEqual(pdf_res.headers.get("Content-Type"), "application/pdf")
        self.assertTrue(len(pdf_res.data) > 500)

        # 4. Test Lock-Screen Wallpaper download
        wall_res = self.client.get(f"/api/qr/download-wallpaper?token={raw_token}&name=Ananya+Sen", headers=headers)
        self.assertEqual(wall_res.status_code, 200)
        self.assertEqual(wall_res.headers.get("Content-Type"), "image/png")
        self.assertTrue(len(wall_res.data) > 500)

    def test_06_localhost_disallowed_in_qr_generation(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        headers = {"Authorization": f"Bearer {login_res.get_json()['token']}"}

        # Set configured EMERGENCY_BASE_URL
        Config.EMERGENCY_BASE_URL = "https://medora-production.example.com"

        # Attempt to pass localhost or 127.0.0.1
        gen_res = self.client.post("/api/qr/generate", headers=headers, json={
            "base_url": "http://localhost:5173"
        })
        self.assertEqual(gen_res.status_code, 201)
        emergency_url = gen_res.get_json()["token"]["emergency_url"]
        
        # Must fall back to safe EMERGENCY_BASE_URL and NOT encode localhost
        self.assertNotIn("localhost", emergency_url)
        self.assertNotIn("127.0.0.1", emergency_url)
        self.assertTrue(emergency_url.startswith("https://medora-production.example.com"))

        # Reset
        Config.EMERGENCY_BASE_URL = ""

if __name__ == "__main__":
    unittest.main()
