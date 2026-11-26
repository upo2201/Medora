import hashlib
import json
import uuid
from datetime import datetime, timezone
from app.database import get_db
from app.services.email_service import send_emergency_scan_alert_async

def parse_user_agent(ua_string: str):
    """Classifies user agent into clean privacy-conscious category (no IP, no fingerprinting)."""
    if not ua_string:
        return "Unknown Device", "Unknown Browser"
        
    ua_lower = ua_string.lower()
    
    # Device category
    if "iphone" in ua_lower or "ipad" in ua_lower:
        device = "Mobile (iOS)"
    elif "android" in ua_lower:
        device = "Mobile (Android)"
    elif "macintosh" in ua_lower or "mac os" in ua_lower:
        device = "Desktop (macOS)"
    elif "windows" in ua_lower:
        device = "Desktop (Windows)"
    elif "linux" in ua_lower:
        device = "Desktop (Linux)"
    else:
        device = "Mobile Browser"
        
    # Browser
    if "edg" in ua_lower:
        browser = "Microsoft Edge"
    elif "chrome" in ua_lower and "safari" in ua_lower and "crios" not in ua_lower:
        browser = "Chrome"
    elif "crios" in ua_lower:
        browser = "Chrome iOS"
    elif "safari" in ua_lower and "chrome" not in ua_lower:
        browser = "Safari"
    elif "firefox" in ua_lower or "fxios" in ua_lower:
        browser = "Firefox"
    else:
        browser = "Mobile Browser"
        
    return device, browser

def get_public_emergency_profile(raw_token: str, user_agent_str: str):
    """
    Public emergency endpoint handler.
    1. Hashes token with SHA-256
    2. Verifies status (active vs revoked vs invalid)
    3. Filters private fields based strictly on user's emergency_visibility toggles
    4. Records privacy-conscious access log
    5. Generates simulated notification for demonstration with cooldown
    """
    token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
    now_iso = datetime.now(timezone.utc).isoformat()
    now_dt = datetime.now(timezone.utc)
    
    device_type, browser = parse_user_agent(user_agent_str)
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Look up token by hash
        cursor.execute("SELECT * FROM qr_tokens WHERE token_hash = ?", (token_hash,))
        token_record = cursor.fetchone()
        
        if not token_record:
            return {
                "status": "invalid",
                "message": "This emergency link is not recognized or may have been mistyped."
            }, 404
            
        profile_id = token_record["profile_id"]
        token_id = token_record["id"]
        
        # Check if revoked
        if token_record["status"] == "revoked":
            # Record revoked scan attempt for profile owner's awareness
            log_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO access_logs (id, qr_token_id, profile_id, accessed_at, device_type, browser, access_status)
                   VALUES (?, ?, ?, ?, ?, ?, 'revoked_attempt')""",
                (log_id, token_id, profile_id, now_iso, device_type, browser)
            )
            conn.commit()
            return {
                "status": "revoked",
                "message": "This QR code is no longer active. Please contact the individual or their caregiver for assistance."
            }, 403
            
        # Token is active! Fetch medical profile and visibility
        cursor.execute("SELECT * FROM medical_profiles WHERE id = ?", (profile_id,))
        med_profile = cursor.fetchone()
        if not med_profile:
            return {"status": "invalid", "message": "Associated medical profile was not found."}, 404
            
        cursor.execute("SELECT * FROM emergency_visibility WHERE profile_id = ?", (profile_id,))
        visibility = cursor.fetchone()
        
        # Default visibility if not configured
        vis_dict = {
            "show_name": bool(visibility["show_name"]) if visibility else True,
            "show_age": bool(visibility["show_age"]) if visibility else True,
            "show_blood_group": bool(visibility["show_blood_group"]) if visibility else True,
            "show_allergies": bool(visibility["show_allergies"]) if visibility else True,
            "show_medications": bool(visibility["show_medications"]) if visibility else True,
            "show_conditions": bool(visibility["show_conditions"]) if visibility else True,
            "show_doctor_details": bool(visibility["show_doctor_details"]) if visibility else False,
            "show_emergency_contact": bool(visibility["show_emergency_contact"]) if visibility else True,
        }
        
        # Build filtered public payload
        sec_lang = med_profile["emergency_second_language"] if "emergency_second_language" in med_profile.keys() else None
        public_data = {
            "status": "active",
            "last_updated": med_profile["updated_at"],
            "scan_timestamp": now_iso,
            "emergency_second_language": sec_lang
        }
        
        if vis_dict["show_name"]:
            public_data["full_name"] = med_profile["full_name"]
            if "full_name_secondary" in med_profile.keys() and med_profile["full_name_secondary"]:
                public_data["full_name_secondary"] = med_profile["full_name_secondary"]
            elif sec_lang in ("bn", "hi") and med_profile["full_name"]:
                from app.utils.transliteration import transliterate_name
                public_data["full_name_secondary"] = transliterate_name(med_profile["full_name"], sec_lang)
            
        if vis_dict["show_age"] and med_profile["age"] is not None:
            public_data["age"] = med_profile["age"]
            
        if vis_dict["show_blood_group"] and med_profile["blood_group"]:
            public_data["blood_group"] = med_profile["blood_group"]
            
        if vis_dict["show_conditions"]:
            try:
                public_data["medical_conditions"] = json.loads(med_profile["medical_conditions"])
            except Exception:
                public_data["medical_conditions"] = []
                
        if vis_dict["show_allergies"]:
            public_data["no_known_allergies"] = bool(med_profile["no_known_allergies"])
            try:
                public_data["allergies"] = json.loads(med_profile["allergies"])
            except Exception:
                public_data["allergies"] = []
                
        if vis_dict["show_medications"]:
            try:
                public_data["current_medications"] = json.loads(med_profile["current_medications"])
            except Exception:
                public_data["current_medications"] = []
                
        if vis_dict["show_doctor_details"]:
            public_data["doctor_name"] = med_profile["doctor_name"] or None
            public_data["doctor_contact"] = med_profile["doctor_contact"] or None
            
        if vis_dict["show_emergency_contact"]:
            ec_payload = {
                "name": med_profile["emergency_contact_name"],
                "relationship": med_profile["emergency_contact_relationship"],
                "phone": med_profile["emergency_contact_phone"]
            }
            if "emergency_contact_name_secondary" in med_profile.keys() and med_profile["emergency_contact_name_secondary"]:
                ec_payload["name_secondary"] = med_profile["emergency_contact_name_secondary"]
            elif sec_lang in ("bn", "hi") and med_profile["emergency_contact_name"]:
                from app.utils.transliteration import transliterate_name
                ec_payload["name_secondary"] = transliterate_name(med_profile["emergency_contact_name"], sec_lang)
            public_data["emergency_contact"] = ec_payload
            
        # Update token last_accessed_at
        cursor.execute("UPDATE qr_tokens SET last_accessed_at = ? WHERE id = ?", (now_iso, token_id))
        
        # Insert Access Log
        log_id = str(uuid.uuid4())
        cursor.execute(
            """INSERT INTO access_logs (id, qr_token_id, profile_id, accessed_at, device_type, browser, access_status)
               VALUES (?, ?, ?, ?, ?, ?, 'success')""",
            (log_id, token_id, profile_id, now_iso, device_type, browser)
        )
        
        # Check for duplicate processing of the same request (< 2.0s identical client/token)
        cursor.execute(
            """SELECT accessed_at FROM access_logs 
               WHERE qr_token_id = ? AND device_type = ? AND browser = ? AND access_status = 'success'
               ORDER BY accessed_at DESC LIMIT 1 OFFSET 1""",
            (token_id, device_type, browser)
        )
        prev_access = cursor.fetchone()
        is_duplicate_request = False
        if prev_access:
            try:
                prev_time = datetime.fromisoformat(prev_access["accessed_at"])
                if (now_dt - prev_time).total_seconds() < 2.0:
                    is_duplicate_request = True
            except Exception:
                pass
                
        if not is_duplicate_request:
            notif_id = str(uuid.uuid4())
            formatted_time = now_dt.strftime("%d %B %Y at %I:%M %p UTC")
            
            # Determine target emergency notification email (no verification flag required)
            target_email = (med_profile["emergency_notification_email"] or med_profile["emergency_contact_email"] or "").strip()
            
            if target_email:
                alert_msg = (
                    f"Emergency QR for {med_profile['full_name']} was accessed on {formatted_time} ({device_type}). "
                    f"Email alert queued for dispatch to {target_email}."
                )
                cursor.execute(
                    """INSERT INTO notifications (id, profile_id, access_log_id, notification_type, recipient, delivery_status, message, created_at)
                       VALUES (?, ?, ?, 'EMAIL', ?, 'PENDING', ?, ?)""",
                    (notif_id, profile_id, log_id, target_email, alert_msg, now_iso)
                )
                
                # Dispatch asynchronous email via transactional provider (never delays HTTP response)
                try:
                    send_emergency_scan_alert_async(
                        notification_id=notif_id,
                        recipient_email=target_email,
                        patient_name=med_profile["full_name"],
                        access_time_str=formatted_time,
                        device_type=device_type,
                        browser=browser
                    )
                except Exception as dispatch_err:
                    import logging
                    logging.getLogger("medora.email").error(f"Failed to initiate async scan alert: {dispatch_err}")
            else:
                unconfigured_msg = (
                    f"Emergency QR for {med_profile['full_name']} was accessed on {formatted_time} ({device_type}). "
                    "Email alert could not be sent because no emergency notification email is configured."
                )
                cursor.execute(
                    """INSERT INTO notifications (id, profile_id, access_log_id, notification_type, recipient, delivery_status, message, error_message, created_at)
                       VALUES (?, ?, ?, 'EMAIL', 'None', 'FAILED', ?, 'No emergency notification email configured.', ?)""",
                    (notif_id, profile_id, log_id, unconfigured_msg, now_iso)
                )
            
        conn.commit()
        return public_data, 200

