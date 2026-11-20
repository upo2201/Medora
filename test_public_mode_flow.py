import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app import create_app
from app.services.tunnel_service import set_active_tunnel, clear_active_tunnel, get_active_tunnel_url
from app.services.qr_service import sanitize_base_url, get_emergency_url
from seed import seed_demo_data

class TestPublicModeTunnelFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        seed_demo_data()

    def tearDown(self):
        clear_active_tunnel()

    def test_tunnel_service_lifecycle(self):
        # 1. Initially no active tunnel
        clear_active_tunnel()
        self.assertIsNone(get_active_tunnel_url())

        # 2. Set active tunnel
        fake_ngrok = "https://medora-test-tunnel.ngrok-free.app"
        set_active_tunnel(fake_ngrok)
        self.assertEqual(get_active_tunnel_url(), fake_ngrok)

        # 3. Verify sanitize_base_url automatically uses the active ngrok tunnel!
        base = sanitize_base_url("")
        self.assertEqual(base, fake_ngrok)

        base_local = sanitize_base_url("http://localhost:5173")
        self.assertEqual(base_local, fake_ngrok)

        # 4. Verify endpoint GET /api/dev/tunnel-status
        res = self.client.get("/api/dev/tunnel-status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["public_testing_mode"])
        self.assertEqual(data["tunnel_url"], fake_ngrok)

        # 5. Clear tunnel
        clear_active_tunnel()
        self.assertIsNone(get_active_tunnel_url())
        res_after = self.client.get("/api/dev/tunnel-status")
        self.assertFalse(res_after.get_json()["public_testing_mode"])

    def test_qr_generation_with_active_tunnel(self):
        # Set tunnel
        fake_ngrok = "https://active-demo-scan.ngrok-free.app"
        set_active_tunnel(fake_ngrok)

        # Login as demo user
        login_res = self.client.post("/api/auth/login", json={
            "email": "ananya.sen@example.com",
            "password": "DemoPassword123!"
        })
        token = login_res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Generate QR without passing any base_url (default behavior)
        gen_res = self.client.post("/api/qr/generate", headers=headers, json={})
        self.assertEqual(gen_res.status_code, 201)
        qr_data = gen_res.get_json()["token"]
        
        # Must automatically use the active ngrok tunnel URL!
        self.assertTrue(qr_data["emergency_url"].startswith(f"{fake_ngrok}/emergency/"))
        self.assertNotIn("localhost", qr_data["emergency_url"])

        # Test in-place URL refresh when ngrok URL changes (Requirement 10)
        new_ngrok = "https://restarted-session-new.ngrok-free.app"
        set_active_tunnel(new_ngrok)

        refresh_res = self.client.post("/api/dev/refresh-qr-url", headers=headers, json={"base_url": new_ngrok})
        self.assertEqual(refresh_res.status_code, 200)
        refreshed_data = refresh_res.get_json()["token"]

        # The token is the exact same, but the emergency_url now uses the new tunnel!
        self.assertEqual(refreshed_data["raw_token"], qr_data["raw_token"])
        self.assertTrue(refreshed_data["emergency_url"].startswith(f"{new_ngrok}/emergency/"))

if __name__ == "__main__":
    unittest.main()

