import json
import logging
import smtplib
import ssl
import threading
import urllib.request
import urllib.error
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone
from app.config import Config
from app.database import get_db

logger = logging.getLogger("medora.email")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] [%(name)s] %(levelname)s: %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

def get_email_provider_info() -> dict:
    """
    Detects which permanent server-side transactional email provider is configured.
    Order of precedence: Brevo -> Resend -> SendGrid -> SMTP.
    """
    if Config.BREVO_API_KEY:
        return {"configured": True, "provider": "brevo", "name": "Brevo API"}
    if Config.RESEND_API_KEY:
        return {"configured": True, "provider": "resend", "name": "Resend API"}
    if Config.SENDGRID_API_KEY:
        return {"configured": True, "provider": "sendgrid", "name": "SendGrid API"}
    if Config.SMTP_HOST:
        return {"configured": True, "provider": "smtp", "name": f"SMTP ({Config.SMTP_HOST}:{Config.SMTP_PORT})"}
    return {"configured": False, "provider": "none", "name": "Unconfigured"}

def build_verification_email_html(patient_name: str, code: str, verify_url: str) -> str:
    """HTML template for emergency notification email verification."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Emergency Notification Email</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FFF8F0; margin: 0; padding: 24px; color: #2D181C; }}
    .container {{ max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #F1E7DC; overflow: hidden; box-shadow: 0 4px 20px rgba(121, 30, 50, 0.08); }}
    .header {{ background: linear-gradient(135deg, #791E32, #4C1423); padding: 28px 24px; text-align: center; color: #FFFFFF; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; }}
    .content {{ padding: 28px 24px; font-size: 13px; line-height: 1.6; color: #2D181C; }}
    .code-box {{ background-color: #FFF2F4; border: 2px dashed #B83A45; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }}
    .code-digit {{ font-family: monospace, Courier, sans-serif; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #791E32; }}
    .btn {{ display: inline-block; background-color: #791E32; color: #FFFFFF !important; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 13px; margin: 12px 0; }}
    .note {{ background-color: #F8EFE6; border-radius: 12px; padding: 14px 16px; font-size: 11px; color: #6E5358; margin-top: 20px; }}
    .footer {{ background-color: #FFF8F0; padding: 16px 24px; text-align: center; font-size: 11px; color: #9C8589; border-top: 1px solid #F1E7DC; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Medora Safety System</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#F1E7DC;">Email Verification Required</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>This email address was designated as the <strong>Emergency Notification Email</strong> for <strong>{patient_name}</strong> on Medora.</p>
      <p>To enable instant scan notifications whenever the emergency QR code is accessed, please verify this email address using the 6-digit security code below:</p>
      
      <div class="code-box">
        <div style="font-size:11px;text-transform:uppercase;color:#B83A45;font-weight:700;margin-bottom:6px;">Your 6-Digit Verification Code</div>
        <div class="code-digit">{code}</div>
      </div>

      <p style="text-align:center;">
        Or click the button below to verify automatically in your browser:
      </p>
      <p style="text-align:center;">
        <a href="{verify_url}" class="btn">Verify Emergency Email</a>
      </p>

      <div class="note">
        <strong>Why is verification required?</strong><br>
        Medora ensures that all emergency scan alerts reach a verified, monitored address without risk of misdelivery or typo. Clinical medical data is never included in alerts.
      </div>
    </div>
    <div class="footer">
      Medora Emergency Information Platform • Essential Medical Information. One Scan Away.
    </div>
  </div>
</body>
</html>
"""

def build_verification_email_text(patient_name: str, code: str, verify_url: str) -> str:
    return f"""[MEDORA EMERGENCY EMAIL VERIFICATION]

Hello,

This email address was registered as the Emergency Notification Email for {patient_name} on Medora.

Your 6-Digit Verification Code:
>>> {code} <<<

Or verify directly by clicking this link:
{verify_url}

Why is verification required?
Verification confirms that emergency scan notifications will reach a valid inbox. Clinical medical data is never included in email notifications.

Medora Emergency Information Platform
"""

def build_emergency_alert_html(patient_name: str, access_time_str: str, device_type: str, browser: str) -> str:
    """Creates a secure, professional HTML email alert. Zero medical data is exposed."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Emergency Medical QR Code Accessed</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF8F0; margin: 0; padding: 24px; color: #2D181C; }}
    .container {{ max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #F1E7DC; overflow: hidden; box-shadow: 0 4px 20px rgba(121, 30, 50, 0.08); }}
    .header {{ background: linear-gradient(135deg, #791E32, #4C1423); padding: 28px 24px; text-align: center; color: #FFFFFF; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }}
    .header p {{ margin: 6px 0 0; font-size: 13px; color: #F1E7DC; opacity: 0.9; }}
    .badge {{ display: inline-block; background-color: #B83A45; color: #FFFFFF; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }}
    .content {{ padding: 28px 24px; }}
    .alert-banner {{ background-color: #FFF2F4; border: 1px solid #F8D0D6; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 13px; color: #791E32; line-height: 1.5; }}
    .details-table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; }}
    .details-table td {{ padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #F8EFE6; }}
    .details-table td.label {{ font-weight: 600; color: #6E5358; width: 38%; }}
    .details-table td.value {{ color: #2D181C; font-weight: 500; }}
    .privacy-notice {{ background-color: #F8EFE6; border-radius: 12px; padding: 14px 16px; font-size: 11px; color: #6E5358; line-height: 1.5; margin-bottom: 24px; }}
    .privacy-notice strong {{ color: #4C1423; }}
    .footer {{ background-color: #FFF8F0; padding: 18px 24px; text-align: center; font-size: 11px; color: #9C8589; border-top: 1px solid #F1E7DC; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Security Notification</div>
      <h1>Emergency QR Code Accessed</h1>
      <p>Medora Safety System</p>
    </div>
    <div class="content">
      <div class="alert-banner">
        An emergency responder or bystander has just opened the emergency medical card for <strong>{patient_name}</strong>.
      </div>
      
      <table class="details-table">
        <tr>
          <td class="label">Patient Name:</td>
          <td class="value"><strong>{patient_name}</strong></td>
        </tr>
        <tr>
          <td class="label">Access Timestamp:</td>
          <td class="value">{access_time_str}</td>
        </tr>
        <tr>
          <td class="label">Device Category:</td>
          <td class="value">{device_type}</td>
        </tr>
        <tr>
          <td class="label">Web Browser:</td>
          <td class="value">{browser}</td>
        </tr>
        <tr>
          <td class="label">Access Method:</td>
          <td class="value">Direct QR Code Scan</td>
        </tr>
      </table>

      <div class="privacy-notice">
        <strong>Privacy & Security Protection:</strong><br>
        For patient confidentiality, specific clinical medical data (such as diagnoses, active medications, or allergy lists) is never transmitted over email. If this scan was initiated during an active incident, your registered emergency phone number was prominently displayed on the emergency card for immediate one-tap calling.<br><br>
        If this scan was not initiated by you or your caregiver, you can immediately deactivate or regenerate this QR code from your Medora dashboard.
      </div>
    </div>
    <div class="footer">
      This is an automated safety alert from Medora. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
"""

def build_emergency_alert_text(patient_name: str, access_time_str: str, device_type: str, browser: str) -> str:
    """Plaintext fallback version for mail clients that do not render HTML."""
    return f"""[MEDORA EMERGENCY ACCESS ALERT]

The public emergency QR code for {patient_name} was accessed.

Access Details:
- Patient Name: {patient_name}
- Date & Time: {access_time_str}
- Device: {device_type}
- Browser: {browser}
- Access Type: Direct Public QR Scan

PRIVACY NOTICE:
For patient confidentiality, specific clinical medical information is never included in email notifications. If this scan was expected (testing or routine preparedness), no action is required. If this access was unauthorized, you can immediately revoke this QR code from your Medora dashboard.

This is an automated safety alert from Medora.
"""

def _dispatch_email(to_email: str, subject: str, text_content: str, html_content: str) -> tuple[bool, str, str]:
    """
    Delivers an email using the configured permanent transactional email provider.
    Returns: (success: bool, status: str, detail_message: str)
    """
    provider_info = get_email_provider_info()
    sender = Config.EMAIL_FROM or "Medora Alerts <alerts@medora.app>"

    # 1. Unconfigured check — DO NOT claim success when provider is unconfigured
    if not provider_info["configured"]:
        msg = "No transactional email provider configured on server. Developer must set RESEND_API_KEY, BREVO_API_KEY, or SENDGRID_API_KEY."
        logger.warning(f"[EMAIL INFRASTRUCTURE UNCONFIGURED] Target: {to_email} | Subject: '{subject}' | {msg}")
        return False, "PROVIDER_NOT_CONFIGURED", msg

    provider = provider_info["provider"]

    # 2. Resend API
    if provider == "resend":
        try:
            req_data = json.dumps({
                "from": sender,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "text": text_content
            }).encode("utf-8")
            
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {Config.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                    "User-Agent": "Medora-App/2.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_body = json.loads(resp.read().decode("utf-8"))
                msg_id = resp_body.get("id", "delivered")
                logger.info(f"[EMAIL DELIVERED - RESEND] To: {to_email} | Message ID: {msg_id}")
                return True, "DELIVERED", f"Delivered via Resend (ID: {msg_id})"
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"[EMAIL FAILED - RESEND] HTTP {e.code}: {err_body}")
            return False, "FAILED", f"Resend API Error {e.code}: {err_body}"
        except Exception as e:
            logger.error(f"[EMAIL FAILED - RESEND] {str(e)}")
            return False, "FAILED", f"Resend Error: {str(e)}"

    # 3. Brevo (Sendinblue) API
    if provider == "brevo":
        try:
            # Parse sender name and email
            sender_name = "Medora Alerts"
            sender_email = sender
            if "<" in sender and ">" in sender:
                sender_name = sender.split("<")[0].strip()
                sender_email = sender.split("<")[1].split(">")[0].strip()

            req_data = json.dumps({
                "sender": {"name": sender_name, "email": sender_email},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=req_data,
                headers={
                    "api-key": Config.BREVO_API_KEY,
                    "Content-Type": "application/json",
                    "User-Agent": "Medora-App/2.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_body = json.loads(resp.read().decode("utf-8"))
                msg_id = resp_body.get("messageId", "delivered")
                logger.info(f"[EMAIL DELIVERED - BREVO] To: {to_email} | Message ID: {msg_id}")
                return True, "DELIVERED", f"Delivered via Brevo (ID: {msg_id})"
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"[EMAIL FAILED - BREVO] HTTP {e.code}: {err_body}")
            return False, "FAILED", f"Brevo API Error {e.code}: {err_body}"
        except Exception as e:
            logger.error(f"[EMAIL FAILED - BREVO] {str(e)}")
            return False, "FAILED", f"Brevo Error: {str(e)}"

    # 4. SendGrid API
    if provider == "sendgrid":
        try:
            sender_email = sender.split("<")[1].split(">")[0].strip() if "<" in sender else sender
            req_data = json.dumps({
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": sender_email, "name": "Medora Alerts"},
                "subject": subject,
                "content": [
                    {"type": "text/plain", "value": text_content},
                    {"type": "text/html", "value": html_content}
                ]
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {Config.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                    "User-Agent": "Medora-App/2.0"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                logger.info(f"[EMAIL DELIVERED - SENDGRID] To: {to_email} | Status: {resp.status}")
                return True, "DELIVERED", f"Delivered via SendGrid (HTTP {resp.status})"
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"[EMAIL FAILED - SENDGRID] HTTP {e.code}: {err_body}")
            return False, "FAILED", f"SendGrid API Error {e.code}: {err_body}"
        except Exception as e:
            logger.error(f"[EMAIL FAILED - SENDGRID] {str(e)}")
            return False, "FAILED", f"SendGrid Error: {str(e)}"

    # 5. SMTP Fallback
    if provider == "smtp":
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = sender
            msg["To"] = to_email

            msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            if Config.SMTP_USE_SSL:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(Config.SMTP_HOST, Config.SMTP_PORT, timeout=Config.SMTP_TIMEOUT, context=context) as server:
                    if Config.SMTP_USER and Config.SMTP_PASSWORD:
                        server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=Config.SMTP_TIMEOUT) as server:
                    server.ehlo()
                    if Config.SMTP_USE_TLS:
                        context = ssl.create_default_context()
                        server.starttls(context=context)
                        server.ehlo()
                    if Config.SMTP_USER and Config.SMTP_PASSWORD:
                        server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                    server.send_message(msg)

            logger.info(f"[EMAIL DELIVERED - SMTP] Successfully sent email to {to_email} via SMTP {Config.SMTP_HOST}:{Config.SMTP_PORT}")
            return True, "DELIVERED", f"Sent via SMTP {Config.SMTP_HOST}:{Config.SMTP_PORT}"
        except Exception as e:
            err = str(e)
            logger.error(f"[EMAIL FAILED - SMTP] Could not send email to {to_email}: {err}")
            return False, "FAILED", err

    return False, "PROVIDER_NOT_CONFIGURED", "Unknown provider configuration"

def send_verification_email_async(
    notification_id: str,
    recipient_email: str,
    patient_name: str,
    code: str,
    verify_url: str
):
    """Asynchronously dispatches the email verification code in a background thread."""
    def _worker():
        subject = f"[Medora] Verify Your Emergency Notification Email — Code: {code}"
        html_body = build_verification_email_html(patient_name, code, verify_url)
        text_body = build_verification_email_text(patient_name, code, verify_url)

        success, status, detail = _dispatch_email(recipient_email, subject, text_body, html_body)

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                if success:
                    final_msg = f"Verification code sent to {recipient_email}. Accepted by email provider."
                elif status == "PROVIDER_NOT_CONFIGURED":
                    final_msg = f"Verification code could not be sent to {recipient_email}. No transactional email provider is configured."
                else:
                    final_msg = f"Failed to deliver verification code to {recipient_email}."

                cursor.execute(
                    """UPDATE notifications 
                       SET delivery_status = ?, error_message = ?, message = ?
                       WHERE id = ?""",
                    (status, None if success else detail, final_msg, notification_id)
                )
                conn.commit()
        except Exception as db_err:
            logger.error(f"Failed to update verification notification delivery status in DB: {db_err}")

    thread = threading.Thread(target=_worker, name=f"verify-email-{notification_id}", daemon=True)
    thread.start()

def send_emergency_scan_alert_async(
    notification_id: str,
    recipient_email: str,
    patient_name: str,
    access_time_str: str,
    device_type: str,
    browser: str
):
    """
    Asynchronously sends an emergency scan alert in a separate background thread.
    Never blocks or delays the public emergency page response.
    """
    def _worker():
        subject = f"[Medora Alert] Emergency Medical QR Accessed — {patient_name}"
        html_body = build_emergency_alert_html(patient_name, access_time_str, device_type, browser)
        text_body = build_emergency_alert_text(patient_name, access_time_str, device_type, browser)

        success, status, detail = _dispatch_email(recipient_email, subject, text_body, html_body)

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                if success:
                    final_msg = f"Emergency QR for {patient_name} was accessed on {access_time_str} ({device_type}). Safety alert delivered to {recipient_email}."
                elif status == "PROVIDER_NOT_CONFIGURED":
                    final_msg = f"Emergency QR for {patient_name} was accessed on {access_time_str} ({device_type}). Alert could not be delivered because no transactional email provider is configured on server."
                else:
                    final_msg = f"Emergency QR for {patient_name} was accessed on {access_time_str} ({device_type}). Email alert delivery failed."

                cursor.execute(
                    """UPDATE notifications 
                       SET delivery_status = ?, error_message = ?, message = ?
                       WHERE id = ?""",
                    (status, None if success else detail, final_msg, notification_id)
                )
                conn.commit()
        except Exception as db_err:
            logger.error(f"Failed to update alert notification delivery status in DB: {db_err}")

    thread = threading.Thread(target=_worker, name=f"email-alert-{notification_id}", daemon=True)
    thread.start()

def send_test_email(recipient_email: str, patient_name: str = "Patient", profile_id: str = None) -> dict:
    """
    Sends a test verification email and logs the event in the database.
    Reports real delivery status or unconfigured status.
    """
    subject = f"[Medora Test] Emergency Alert Notification Test — {patient_name}"
    html_body = f"""<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #FFF8F0; padding: 20px;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #F1E7DC;">
    <h2 style="color: #791E32; margin-top:0;">Medora Alert Delivery Test</h2>
    <p>This is a test notification confirming that <strong>{recipient_email}</strong> is configured as the Emergency Notification Email for <strong>{patient_name}</strong>.</p>
    <p>When an emergency responder or bystander scans the active QR code, an alert indicating the timestamp and device category will be sent to this inbox.</p>
    <div style="font-size: 11px; color: #6E5358; border-top: 1px solid #F1E7DC; padding-top: 12px; margin-top: 20px;">
      Medora Safety System • Transactional Test Notification
    </div>
  </div>
</body>
</html>"""
    text_body = f"[MEDORA ALERT TEST]\nThis is a test notification confirming that {recipient_email} is configured for {patient_name}."

    success, status, detail = _dispatch_email(recipient_email, subject, text_body, html_body)
    provider_info = get_email_provider_info()

    notif_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    if profile_id:
        try:
            with get_db() as conn:
                cursor = conn.cursor()
                if success:
                    test_notif_msg = f"Test notification successfully sent to {recipient_email} via {provider_info['name']}."
                elif status == "PROVIDER_NOT_CONFIGURED":
                    test_notif_msg = f"Test notification could not be sent to {recipient_email}. No transactional email provider is configured."
                else:
                    test_notif_msg = f"Test notification failed to deliver to {recipient_email}."

                cursor.execute(
                    """INSERT INTO notifications (id, profile_id, notification_type, recipient, delivery_status, message, error_message, created_at)
                       VALUES (?, ?, 'EMAIL_TEST', ?, ?, ?, ?, ?)""",
                    (
                        notif_id,
                        profile_id,
                        recipient_email,
                        status,
                        test_notif_msg,
                        None if success else detail,
                        now_iso
                    )
                )
                conn.commit()
        except Exception as db_err:
            logger.error(f"Failed to insert test notification in DB: {db_err}")

    return {
        "success": success,
        "recipient": recipient_email,
        "provider": provider_info["provider"],
        "status": status,
        "message": detail if not success else f"Test email successfully sent via {provider_info['name']}.",
        "detail": detail
    }
