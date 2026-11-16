import os
import sys
import json
import uuid

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app import create_app
from seed import seed_demo_data

def run_e2e_verification():
    print("=" * 60)
    print("MEDORA COMPLETE END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Reset database to demo state
    seed_demo_data()
    print("✓ Step 1: Database re-seeded with clean fictional demo dataset")

    app = create_app()
    client = app.test_client()

    # 2. Register fresh dummy account with mandatory Emergency Notification Email
    unique_email = f"caregiver_{uuid.uuid4().hex[:6]}@example.com"
    alert_email = f"alert_{unique_email}"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Devika Sen",
        "email": unique_email,
        "emergency_notification_email": alert_email,
        "password": "SecurePassword123!"
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.get_json()}"
    jwt_token = reg_res.get_json()["token"]
    headers = {"Authorization": f"Bearer {jwt_token}"}
    print(f"✓ Step 2: Registered new account ({unique_email}) with emergency alert email ({alert_email})")

    # 3. Check QR state before generation: MUST BE EMPTY
    qr_init = client.get("/api/qr/current", headers=headers)
    assert qr_init.status_code == 200
    init_data = qr_init.get_json()
    assert init_data["has_active_qr"] is False, "New account should NOT have an active QR!"
    assert init_data["qr"] is None, "New account QR data must be None!"
    print("✓ Step 3: Verified clean empty state before generation (no demo QR, no active token)")

    # 4. Fill medical profile
    prof_update = client.put("/api/profile", headers=headers, json={
        "full_name": "Devika Sen",
        "age": 68,
        "blood_group": "O+",
        "allergies": ["Sulfa Drugs", "Aspirin"],
        "no_known_allergies": False,
        "current_medications": [{"name": "Metformin", "dosage": "500 mg", "frequency": "Twice daily"}],
        "medical_conditions": ["Type 2 Diabetes", "Mild Hypertension"],
        "emergency_contact_name": "Arjun Sen",
        "emergency_contact_relationship": "Son",
        "emergency_contact_phone": "+91 98111 22334"
    })
    assert prof_update.status_code == 200
    print("✓ Step 4: Completed medical profile with dummy clinical data & emergency contact")

    # 5. Set visibility toggles
    vis_res = client.put("/api/profile/visibility", headers=headers, json={
        "show_name": True,
        "show_age": True,
        "show_blood_group": True,
        "show_allergies": True,
        "show_medications": True,
        "show_conditions": True,
        "show_doctor_details": False,
        "show_emergency_contact": True
    })
    assert vis_res.status_code == 200
    print("✓ Step 5: Updated visibility toggles (doctor hidden, allergies & contact public)")

    # 6. Generate QR Code with public base URL
    gen_res = client.post("/api/qr/generate", headers=headers, json={
        "base_url": "https://medora-emergency.onrender.com"
    })
    assert gen_res.status_code == 201, f"QR generation failed: {gen_res.get_json()}"
    gen_data = gen_res.get_json()
    raw_token = gen_data["token"]["raw_token"]
    emergency_url = gen_data["token"]["emergency_url"]
    
    assert len(raw_token) >= 32, "Token does not have sufficient cryptographic entropy"
    assert "localhost" not in emergency_url, "QR URL must not contain localhost!"
    assert "127.0.0.1" not in emergency_url, "QR URL must not contain 127.0.0.1!"
    print(f"✓ Step 6: Generated unique QR token ({raw_token[:12]}...) linked to URL: {emergency_url}")

    # 7. Verify QR persistence across visits
    persist_res = client.get("/api/qr/current", headers=headers)
    assert persist_res.status_code == 200
    persist_data = persist_res.get_json()
    assert persist_data["has_active_qr"] is True
    assert persist_data["qr"]["raw_token"] == raw_token, "Decrypted raw token must match!"
    print("✓ Step 7: Verified active QR code and raw token persist across sessions")

    # 8. Simulate scanning the QR code from external phone
    mobile_scan = client.get(f"/api/emergency/{raw_token}", headers={
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
        "X-Forwarded-For": "157.240.231.35"
    })
    assert mobile_scan.status_code == 200, f"Emergency scan failed: {mobile_scan.get_json()}"
    card_data = mobile_scan.get_json()
    assert card_data["full_name"] == "Devika Sen"
    assert card_data["blood_group"] == "O+"
    assert card_data["age"] == 68
    assert "Sulfa Drugs" in card_data["allergies"]
    assert card_data["emergency_contact"]["phone"] == "+91 98111 22334"
    assert "doctor_name" not in card_data or card_data["doctor_name"] is None, "Doctor details should be hidden"
    print("✓ Step 8: Public scan succeeded: mobile-first emergency card displays permitted fields only")

    # 9. Verify Access Logs
    logs_res = client.get("/api/access-logs", headers=headers)
    assert logs_res.status_code == 200
    logs_data = logs_res.get_json()
    assert len(logs_data["logs"]) >= 1
    latest = logs_data["logs"][0]
    assert latest["device_type"] in ["Mobile", "Mobile (iOS)", "Mobile (iPhone)"]
    print(f"✓ Step 9: Access log recorded access event from {latest['device_type']} ({latest['browser']})")

    # 10. Verify Notification
    notif_res = client.get("/api/notifications", headers=headers)
    assert notif_res.status_code == 200
    notif_data = notif_res.get_json()
    assert len(notif_data["notifications"]) >= 1
    print(f"✓ Step 10: Verified simulated emergency notification created: '{notif_data['notifications'][0]['message']}'")

    # 11. Test downloads (PNG, PDF Card + Sticker, Wallpaper)
    png_res = client.get(f"/api/qr/download?token={raw_token}", headers=headers)
    assert png_res.status_code == 200
    assert png_res.headers.get("Content-Type") == "image/png"
    print(f"✓ Step 11a: PNG QR code generated ({len(png_res.data)} bytes)")

    pdf_res = client.get(f"/api/qr/download-card?token={raw_token}&name=Devika+Sen", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers.get("Content-Type") == "application/pdf"
    print(f"✓ Step 11b: PDF Wallet Card & Phone Sticker generated ({len(pdf_res.data)} bytes)")

    wall_res = client.get(f"/api/qr/download-wallpaper?token={raw_token}&name=Devika+Sen", headers=headers)
    assert wall_res.status_code == 200
    assert wall_res.headers.get("Content-Type") == "image/png"
    print(f"✓ Step 11c: 1080x2400 Lock-Screen Wallpaper generated ({len(wall_res.data)} bytes)")

    # 12. Revoke QR
    revoke_res = client.post("/api/qr/revoke", headers=headers)
    assert revoke_res.status_code == 200
    print("✓ Step 12: Owner successfully revoked QR code")

    # 13. Verify subsequent scan is deactivated (HTTP 403)
    scan_revoked = client.get(f"/api/emergency/{raw_token}")
    assert scan_revoked.status_code == 403
    assert scan_revoked.get_json()["status"] == "revoked"
    print("✓ Step 13: Revoked QR scan returns HTTP 403 'revoked' status (zero medical data leaked)")

    # 14. Verify account returns to empty state
    post_revoke = client.get("/api/qr/current", headers=headers)
    assert post_revoke.status_code == 200
    assert post_revoke.get_json()["has_active_qr"] is False
    print("✓ Step 14: Owner QR state reflects deactivation with 'Generate QR' option ready")

    print("\n" + "=" * 60)
    print("ALL 14 END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_e2e_verification()
