import os
import sys
import json
import unittest
import time
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app import create_app
from app.config import Config
from app.database import get_db
from app.services.email_service import (
    build_emergency_alert_html,
    build_emergency_alert_text,
    get_email_provider_info,
    send_test_email
)
from app.services.emergency_service import get_public_emergency_profile
from seed import seed_demo_data

class TestSimplifiedEmailInfrastructure(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_demo_data(reset=True)
        with get_db() as conn:
            conn.cursor().execute("DELETE FROM users WHERE email != 'ananya.sen@example.com'")
            conn.commit()
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_01_registration_mandatory_emergency_notification_email(self):
        """Verifies that registration requires Emergency Notification Email and saves it directly without verification codes."""
        # 1. Missing emergency_notification_email -> must fail HTTP 400
        fail_res = self.client.post("/api/auth/register", json={
            "first_name": "Test",
            "last_name": "User",
            "email": "user_without_alert@example.com",
            "password": "Password123!"
        })
        self.assertEqual(fail_res.status_code, 400)
        self.assertIn("Emergency Notification Email", fail_res.get_json()["error"])

        # 2. Invalid emergency_notification_email -> must fail HTTP 400
        fail_res2 = self.client.post("/api/auth/register", json={
            "first_name": "Test",
            "last_name": "User",
            "email": "user_with_bad_alert@example.com",
            "emergency_notification_email": "not-an-email",
            "password": "Password123!"
        })
        self.assertEqual(fail_res2.status_code, 400)

        # 3. Valid registration with emergency notification email -> HTTP 201
        success_res = self.client.post("/api/auth/register", json={
            "first_name": "Soma",
            "last_name": "Mukherjee",
            "email": "soma.m@example.com",
            "emergency_notification_email": "caregiver.soma@example.com",
            "password": "SecurePassword123!"
        })
        self.assertEqual(success_res.status_code, 201)
        data = success_res.get_json()
        self.assertIn("token", data)

        # 4. Verify medical profile has emergency notification email saved directly
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM medical_profiles WHERE user_id = ?", (data["user"]["id"],))
            p = cursor.fetchone()
            self.assertEqual(p["emergency_notification_email"], "caregiver.soma@example.com")
            # No verification codes generated
            self.assertIsNone(p["emergency_email_verification_code"])
            self.assertIsNone(p["emergency_email_verification_token"])

    def test_02_immediate_scan_alert_eligibility_without_verification(self):
        """Verifies that an active QR scan sends alerts immediately without requiring an email_verified check."""
        # Login as Soma (newly registered user)
        login_res = self.client.post("/api/auth/login", json={
            "email": "soma.m@example.com",
            "password": "SecurePassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Set emergency contact details
        self.client.put("/api/profile", headers=headers, json={
            "full_name": "Soma Mukherjee",
            "emergency_contact_name": "Rahul Mukherjee",
            "emergency_contact_phone": "+91 98300 11223"
        })

        # Generate QR
        gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
        self.assertEqual(gen_res.status_code, 201)
        raw_token = gen_res.get_json()["token"]["raw_token"]

        # Mock email provider dispatch to verify target recipient
        dispatched_recipients = []
        def mock_dispatch(to_email, subject, text, html):
            dispatched_recipients.append(to_email)
            return True, "DELIVERED", "Sent via Mock Resend"

        with patch("app.services.email_service._dispatch_email", side_effect=mock_dispatch):
            # Scan QR
            scan_res, code = get_public_emergency_profile(raw_token, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")
            self.assertEqual(code, 200)

            # Wait briefly for background thread
            time.sleep(0.3)

            # Alert was dispatched directly to Soma's registered email
            self.assertIn("caregiver.soma@example.com", dispatched_recipients)

    def test_03_provider_status_and_unconfigured_behavior(self):
        """Verifies provider status detection and ensures unconfigured server doesn't pretend sent."""
        orig_resend = Config.RESEND_API_KEY
        orig_brevo = Config.BREVO_API_KEY
        orig_sendgrid = Config.SENDGRID_API_KEY
        orig_smtp = Config.SMTP_HOST
        try:
            Config.RESEND_API_KEY = ""
            Config.BREVO_API_KEY = ""
            Config.SENDGRID_API_KEY = ""
            Config.SMTP_HOST = ""

            info = get_email_provider_info()
            self.assertFalse(info["configured"])
            self.assertEqual(info["provider"], "none")

            # Attempt test email: must return failure and PROVIDER_NOT_CONFIGURED status
            test_res = send_test_email("nobody@example.com", "Test Patient")
            self.assertFalse(test_res["success"])
            self.assertEqual(test_res["status"], "PROVIDER_NOT_CONFIGURED")
            self.assertIn("No transactional email provider configured", test_res["detail"])

            # Test provider endpoint
            dev_res = self.client.get("/api/dev/email-provider-status")
            self.assertEqual(dev_res.status_code, 200)
            self.assertFalse(dev_res.get_json()["configured"])

        finally:
            Config.RESEND_API_KEY = orig_resend
            Config.BREVO_API_KEY = orig_brevo
            Config.SENDGRID_API_KEY = orig_sendgrid
            Config.SMTP_HOST = orig_smtp

    def test_04_email_content_excludes_medical_data(self):
        """Ensures emergency alert emails NEVER contain diagnoses, allergies, or medications."""
        html = build_emergency_alert_html("Ananya Sen", "16 Nov 2026 at 02:00 PM UTC", "Mobile (iOS)", "Safari")
        text = build_emergency_alert_text("Ananya Sen", "16 Nov 2026 at 02:00 PM UTC", "Mobile (iOS)", "Safari")

        for content in [html, text]:
            self.assertIn("Ananya Sen", content)
            self.assertIn("Mobile (iOS)", content)
            self.assertIn("Safari", content)
            # Must strictly exclude medical details
            self.assertNotIn("Penicillin", content)
            self.assertNotIn("Metformin", content)
            self.assertNotIn("Hypertension", content)
            self.assertNotIn("Diabetes", content)
            self.assertNotIn("Blood Group", content)

    def test_05_separate_repeated_scans_each_generate_notification(self):
        """Verifies that legitimate separate scans each generate their own notification."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Generate QR
        gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
        raw_token = gen_res.get_json()["token"]["raw_token"]

        # Initial notification count
        notifs_before = self.client.get("/api/notifications", headers=headers).get_json()["notifications"]
        init_count = len(notifs_before)

        with patch("app.services.email_service._dispatch_email", return_value=(True, "DELIVERED", "Sent via Mock Resend")):
            # Scan 1: from Mobile (iOS)
            res1, code1 = get_public_emergency_profile(raw_token, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")
            self.assertEqual(code1, 200)

            # Wait 2.1 seconds (separate legitimate scan)
            time.sleep(2.1)

            # Scan 2: from Mobile (Android)
            res2, code2 = get_public_emergency_profile(raw_token, "Mozilla/5.0 (Linux; Android 14; Pixel 8)")
            self.assertEqual(code2, 200)

            # Wait 0.3s for async threads
            time.sleep(0.3)

            notifs_after = self.client.get("/api/notifications", headers=headers).get_json()["notifications"]
            self.assertEqual(len(notifs_after), init_count + 2, "Every legitimate separate scan must generate a notification")

    def test_06_duplicate_requests_within_2_seconds_are_deduplicated(self):
        """Verifies rapid duplicate requests (< 2.0s with identical client) do NOT create duplicate emails."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        gen_res = self.client.get("/api/qr/current", headers=headers)
        raw_token = gen_res.get_json()["qr"]["raw_token"]

        notifs_before = self.client.get("/api/notifications", headers=headers).get_json()["notifications"]
        init_count = len(notifs_before)

        with patch("app.services.email_service._dispatch_email", return_value=(True, "DELIVERED", "Mock Sent")):
            # First request
            res1, code1 = get_public_emergency_profile(raw_token, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")
            self.assertEqual(code1, 200)

            # Immediate duplicate (e.g. 50ms later browser prefetch / duplicate)
            time.sleep(0.05)
            res2, code2 = get_public_emergency_profile(raw_token, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")
            self.assertEqual(code2, 200)

            time.sleep(0.3)

            notifs_after = self.client.get("/api/notifications", headers=headers).get_json()["notifications"]
            self.assertEqual(len(notifs_after), init_count + 1, "Duplicate request must be deduplicated into a single notification")

    def test_07_revoked_and_invalid_tokens_never_trigger_emails(self):
        """Verifies revoked or invalid tokens never create email notifications."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        notifs_before = self.client.get("/api/notifications", headers=headers).get_json()["notifications"]
        init_count = len(notifs_before)

        # 1. Invalid scan
        inv_res, inv_code = get_public_emergency_profile("fake-invalid-token", "Mozilla/5.0")
        self.assertEqual(inv_code, 404)

        # 2. Revoke current QR
        self.client.post("/api/qr/revoke", headers=headers)

        # 3. Attempt scanning revoked token
        rev_res, rev_code = get_public_emergency_profile("demo-ananya-sen-emergency-2026", "Mozilla/5.0")
        self.assertIn(rev_code, [403, 404])

        time.sleep(0.3)

        notifs_after = self.client.get("/api/notifications", headers=headers).get_json()["notifications"]
        self.assertEqual(len(notifs_after), init_count, "No notifications for invalid or revoked scans")

    def test_08_profile_email_update_directly_updates_recipient(self):
        """Verifies that updating emergency notification email updates recipient directly without verification."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update to a new email address
        update_res = self.client.put("/api/profile", headers=headers, json={
            "full_name": "Ananya Sen",
            "emergency_notification_email": "new.daughter@example.com",
            "emergency_contact_name": "Ritu Sen",
            "emergency_contact_relationship": "Daughter",
            "emergency_contact_phone": "+91 98765 43210"
        })
        self.assertEqual(update_res.status_code, 200)

        # Check profile: active email is immediately new.daughter@example.com!
        prof_res = self.client.get("/api/profile", headers=headers).get_json()["profile"]
        self.assertEqual(prof_res["emergency_notification_email"], "new.daughter@example.com")

        # Generate fresh QR and scan to verify alert goes to new email
        gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
        raw_token = gen_res.get_json()["token"]["raw_token"]

        dispatched = []
        def mock_dispatch(to_email, subject, text, html):
            dispatched.append(to_email)
            return True, "DELIVERED", "Sent via Mock Resend"

        with patch("app.services.email_service._dispatch_email", side_effect=mock_dispatch):
            get_public_emergency_profile(raw_token, "Mozilla/5.0")
            time.sleep(0.3)
            self.assertIn("new.daughter@example.com", dispatched)

    def test_09_qr_uses_active_public_tunnel_url(self):
        """Verifies that QR URLs dynamically use the active ngrok tunnel URL."""
        from app.services.tunnel_service import set_active_tunnel, clear_active_tunnel
        mock_tunnel = "https://active-public-ngrok-test.ngrok-free.dev"

        try:
            set_active_tunnel(mock_tunnel)

            login_res = self.client.post("/api/auth/login", json={
                "email": "ananya.sen@example.com",
                "password": "DemoPassword123!"
            })
            headers = {"Authorization": f"Bearer {login_res.get_json()['token']}"}

            gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
            self.assertEqual(gen_res.status_code, 201)
            qr_url = gen_res.get_json()["token"]["emergency_url"]
            self.assertTrue(qr_url.startswith(f"{mock_tunnel}/emergency/"))
            self.assertNotIn("localhost", qr_url)

        finally:
            clear_active_tunnel()

    def test_10_emergency_card_loads_even_when_email_provider_fails(self):
        """Verifies that public emergency card loads immediately (HTTP 200) even if email provider throws an error."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
        raw_token = gen_res.get_json()["token"]["raw_token"]

        with patch("app.services.emergency_service.send_emergency_scan_alert_async") as mock_alert:
            mock_alert.side_effect = Exception("Simulated provider outage / network timeout")

            scan_res = self.client.get(f"/api/emergency/{raw_token}", headers={
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
            })

            self.assertEqual(scan_res.status_code, 200)
            data = scan_res.get_json()
            self.assertEqual(data["status"], "active")
            self.assertEqual(data["full_name"], "Ananya Sen")
            self.assertIn("emergency_contact", data)

    def test_11_test_notification_feature(self):
        """Verifies that Test Notification feature functions and dispatches to registered address."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        with patch("app.services.email_service.get_email_provider_info", return_value={"configured": True, "provider": "resend", "name": "Resend API"}), \
             patch("app.services.email_service._dispatch_email", return_value=(True, "DELIVERED", "Accepted by Resend API")):

            test_res = self.client.post("/api/notifications/test-email", headers=headers, json={})
            self.assertEqual(test_res.status_code, 200)
            data = test_res.get_json()
            self.assertTrue(data["success"])
            self.assertEqual(data["recipient"], "new.daughter@example.com")

    def test_12_notification_statuses_are_accurate_and_not_misleading(self):
        """Verifies that notification messages and delivery statuses accurately report reality."""
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        notif_res = self.client.get("/api/notifications", headers=headers)
        self.assertEqual(notif_res.status_code, 200)
        notifs = notif_res.get_json()["notifications"]

        for n in notifs:
            if n["delivery_status"] in ("PROVIDER_NOT_CONFIGURED", "FAILED"):
                self.assertNotIn("Safety alert delivered to", n["message"])

    @classmethod
    def tearDownClass(cls):
        seed_demo_data(reset=True)

if __name__ == "__main__":
    unittest.main()
