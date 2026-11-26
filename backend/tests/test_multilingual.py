import unittest
import json
import uuid
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.database import get_db, init_db
from app.services.qr_service import generate_secure_token, hash_token, encrypt_token

class MultilingualPrivacyTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from app.test_db_guard import setup_isolated_test_db, assert_not_dev_db
        cls.test_db_path, cls.temp_dir, cls.orig_db = setup_isolated_test_db("multilingual")
        assert_not_dev_db(cls.test_db_path)

    @classmethod
    def tearDownClass(cls):
        from app.test_db_guard import teardown_isolated_test_db
        teardown_isolated_test_db(cls.temp_dir, cls.orig_db)

    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.app.config["DATABASE_PATH"] = self.test_db_path
        self.client = self.app.test_client()
        with self.app.app_context():
            init_db(db_path=self.test_db_path)

    def test_multilingual_registration_and_defaults(self):
        """Test registration with explicit languages and default fallback for legacy users."""
        # 1. Registration with explicit language options
        reg_payload = {
            "first_name": "Debashis",
            "last_name": "Roy",
            "email": f"debashis_{uuid.uuid4().hex[:6]}@example.com",
            "password": "SecurePassword123!",
            "emergency_notification_email": "alerts@example.com",
            "preferred_language": "bn",
            "emergency_second_language": "hi",
            "full_name_secondary": "দেবাশিস রায়"
        }
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["user"]["preferred_language"], "bn")
        self.assertEqual(data["user"]["emergency_second_language"], "hi")

        token = data["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Verify profile has the secondary full name
        prof_res = self.client.get("/api/profile", headers=headers)
        self.assertEqual(prof_res.status_code, 200)
        p = prof_res.get_json()["profile"]
        self.assertEqual(p["full_name"], "Debashis Roy")
        self.assertEqual(p["full_name_secondary"], "দেবাশিস রায়")
        self.assertEqual(p["preferred_language"], "bn")
        self.assertEqual(p["emergency_second_language"], "hi")

        # 2. Registration without language fields (legacy default)
        leg_payload = {
            "first_name": "Default",
            "last_name": "User",
            "email": f"default_{uuid.uuid4().hex[:6]}@example.com",
            "password": "SecurePassword123!",
            "emergency_notification_email": "default_alert@example.com"
        }
        leg_res = self.client.post("/api/auth/register", json=leg_payload)
        self.assertEqual(leg_res.status_code, 201)
        leg_user = leg_res.get_json()["user"]
        self.assertEqual(leg_user["preferred_language"], "en")
        self.assertIsNone(leg_user["emergency_second_language"])

    def test_profile_update_multilingual_fields(self):
        """Test updating secondary script name and emergency contact secondary name."""
        email = f"updater_{uuid.uuid4().hex[:6]}@example.com"
        reg = self.client.post("/api/auth/register", json={
            "first_name": "Vikram",
            "last_name": "Malhotra",
            "email": email,
            "password": "SecurePassword123!",
            "emergency_notification_email": "vikram_alert@example.com"
        })
        token = reg.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update profile with Hindi secondary scripts
        update_payload = {
            "full_name": "Vikram Malhotra",
            "full_name_secondary": "विक्रम मल्होत्रा",
            "preferred_language": "hi",
            "emergency_second_language": "hi",
            "age": 68,
            "blood_group": "O+",
            "medical_conditions": ["Hypertension"],
            "allergies": ["Penicillin"],
            "no_known_allergies": False,
            "current_medications": [{"name": "Amlodipine", "dosage": "5 mg", "frequency": "Once daily"}],
            "emergency_contact_name": "Pooja Malhotra",
            "emergency_contact_name_secondary": "पूजा मल्होत्रा",
            "emergency_contact_relationship": "Spouse",
            "emergency_contact_phone": "+91 98765 00000"
        }
        up_res = self.client.put("/api/profile", headers=headers, json=update_payload)
        self.assertEqual(up_res.status_code, 200)

        # Verify get profile returns updated values
        get_res = self.client.get("/api/profile", headers=headers)
        p = get_res.get_json()["profile"]
        self.assertEqual(p["full_name_secondary"], "विक्रम मल्होत्रा")
        self.assertEqual(p["emergency_contact_name_secondary"], "पूजा मल्होत्रा")
        self.assertEqual(p["preferred_language"], "hi")
        self.assertEqual(p["emergency_second_language"], "hi")

    def test_public_privacy_filtering_secondary_fields(self):
        """Confirm secondary script names strictly obey visibility settings."""
        email = f"privacy_{uuid.uuid4().hex[:6]}@example.com"
        reg = self.client.post("/api/auth/register", json={
            "first_name": "Amit",
            "last_name": "Ghosh",
            "email": email,
            "password": "SecurePassword123!",
            "emergency_notification_email": "amit_alert@example.com",
            "emergency_second_language": "bn",
            "full_name_secondary": "অমিত ঘোষ"
        })
        token = reg.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Set up full profile
        self.client.put("/api/profile", headers=headers, json={
            "full_name": "Amit Ghosh",
            "full_name_secondary": "অমিত ঘোষ",
            "age": 65,
            "blood_group": "A+",
            "medical_conditions": ["Asthma"],
            "allergies": ["Aspirin"],
            "no_known_allergies": False,
            "emergency_contact_name": "Shreya Ghosh",
            "emergency_contact_name_secondary": "শ্রেয়া ঘোষ",
            "emergency_contact_relationship": "Daughter",
            "emergency_contact_phone": "+91 98765 99999"
        })

        # Generate QR code
        qr_res = self.client.post("/api/qr/generate", headers=headers)
        raw_token = qr_res.get_json()["token"]["raw_token"]

        # Case A: show_name = True, show_emergency_contact = True
        res_a = self.client.get(f"/api/emergency/{raw_token}")
        self.assertEqual(res_a.status_code, 200)
        data_a = res_a.get_json()
        self.assertEqual(data_a["full_name"], "Amit Ghosh")
        self.assertEqual(data_a["full_name_secondary"], "অমিত ঘোষ")
        self.assertIn("emergency_contact", data_a)
        self.assertEqual(data_a["emergency_contact"]["name"], "Shreya Ghosh")
        self.assertEqual(data_a["emergency_contact"]["name_secondary"], "শ্রেয়া ঘোষ")
        self.assertEqual(data_a["emergency_second_language"], "bn")

        # Case B: Hide name (show_name = False)
        self.client.put("/api/profile/visibility", headers=headers, json={
            "show_name": False,
            "show_age": True,
            "show_blood_group": True,
            "show_allergies": True,
            "show_medications": True,
            "show_conditions": True,
            "show_doctor_details": False,
            "show_emergency_contact": True
        })

        res_b = self.client.get(f"/api/emergency/{raw_token}")
        self.assertEqual(res_b.status_code, 200)
        data_b = res_b.get_json()
        # Both full_name AND full_name_secondary must NOT be in data_b
        self.assertNotIn("full_name", data_b)
        self.assertNotIn("full_name_secondary", data_b)
        # Contact should still be visible
        self.assertIn("emergency_contact", data_b)

        # Case C: Hide emergency contact (show_emergency_contact = False)
        self.client.put("/api/profile/visibility", headers=headers, json={
            "show_name": True,
            "show_age": True,
            "show_blood_group": True,
            "show_allergies": True,
            "show_medications": True,
            "show_conditions": True,
            "show_doctor_details": False,
            "show_emergency_contact": False
        })

        res_c = self.client.get(f"/api/emergency/{raw_token}")
        self.assertEqual(res_c.status_code, 200)
        data_c = res_c.get_json()
        self.assertIn("full_name", data_c)
        # emergency_contact (including name_secondary) must NOT be in data_c
        self.assertNotIn("emergency_contact", data_c)

    def test_automatic_transliteration_when_secondary_empty(self):
        """Verify that if user provides only English name, secondary script is automatically transliterated."""
        email = f"translit_{uuid.uuid4().hex[:6]}@example.com"
        reg = self.client.post("/api/auth/register", json={
            "first_name": "Ananya",
            "last_name": "Sen",
            "email": email,
            "password": "SecurePassword123!",
            "emergency_notification_email": "ananya_alert@example.com",
            "emergency_second_language": "hi",
            # Note: full_name_secondary is deliberately omitted!
        })
        token = reg.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update profile with English-only details
        self.client.put("/api/profile", headers=headers, json={
            "full_name": "Ananya Sen",
            "emergency_second_language": "hi",
            "age": 70,
            "blood_group": "B+",
            "medical_conditions": ["Hypertension"],
            "allergies": ["Peanuts", "Penicillin"],
            "no_known_allergies": False,
            "emergency_contact_name": "Ritu Sen",
            "emergency_contact_relationship": "Daughter",
            "emergency_contact_phone": "+91 98765 11111"
        })

        # Generate QR code
        qr_res = self.client.post("/api/qr/generate", headers=headers)
        raw_token = qr_res.get_json()["token"]["raw_token"]

        # Request public emergency profile
        res = self.client.get(f"/api/emergency/{raw_token}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        # Both English name and Hindi transliterated name must be present!
        self.assertEqual(data["full_name"], "Ananya Sen")
        self.assertEqual(data["full_name_secondary"], "अनन्या सेन")
        self.assertEqual(data["emergency_contact"]["name"], "Ritu Sen")
        self.assertEqual(data["emergency_contact"]["name_secondary"], "ऋतु सेन")
        self.assertEqual(data["allergies"], ["Peanuts", "Penicillin"])

    def test_qr_never_resolves_to_localhost(self):
        """Verify emergency QR URLs never encode localhost or loopback addresses."""
        from app.services.qr_service import sanitize_base_url, get_emergency_url

        # When given localhost or empty, it must resolve to a valid public HTTPS URL
        url_local = sanitize_base_url("http://localhost:5173")
        self.assertNotIn("localhost", url_local)
        self.assertNotIn("127.0.0.1", url_local)
        self.assertTrue(url_local.startswith("https://"))

        url_empty = sanitize_base_url("")
        self.assertNotIn("localhost", url_empty)
        self.assertNotIn("127.0.0.1", url_empty)
        self.assertTrue(url_empty.startswith("https://"))

        # Verify emergency url
        em_url = get_emergency_url("test-token-xyz", "http://localhost:5173")
        self.assertNotIn("localhost", em_url)
        self.assertNotIn("127.0.0.1", em_url)
        self.assertTrue(em_url.startswith("https://"))
        self.assertTrue(em_url.endswith("/emergency/test-token-xyz"))

if __name__ == "__main__":
    unittest.main()
