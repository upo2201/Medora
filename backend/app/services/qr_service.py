import secrets
import hashlib
import uuid
import io
import base64
from datetime import datetime, timezone
from PIL import Image, ImageDraw
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from cryptography.fernet import Fernet
from app.config import Config
from app.database import get_db

def get_cipher():
    """Derives a deterministic 32-byte Fernet key from Config.SECRET_KEY."""
    key_bytes = hashlib.sha256(Config.SECRET_KEY.encode('utf-8')).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)

def encrypt_token(raw_token: str) -> str:
    """Encrypts raw token with Fernet so it can only be decrypted with server secret."""
    cipher = get_cipher()
    return cipher.encrypt(raw_token.encode('utf-8')).decode('utf-8')

def decrypt_token(encrypted_token: str) -> str:
    """Decrypts encrypted token for the authenticated profile owner."""
    if not encrypted_token:
        return ""
    try:
        cipher = get_cipher()
        return cipher.decrypt(encrypted_token.encode('utf-8')).decode('utf-8')
    except Exception:
        return ""

def sanitize_base_url(url: str) -> str:
    """
    Sanitizes the base URL used to construct the emergency scan link.
    Delegates to get_public_frontend_url which handles explicit overrides,
    active ngrok public tunnels, configured EMERGENCY_BASE_URL, and fallbacks.
    """
    from app.services.tunnel_service import get_public_frontend_url
    return get_public_frontend_url(fallback_candidate=url)

def get_emergency_url(raw_token: str, base_url_override: str = None) -> str:
    base = sanitize_base_url(base_url_override or Config.EMERGENCY_BASE_URL)
    return f"{base}/emergency/{raw_token}"

def generate_secure_token() -> str:
    """Generates a cryptographically secure token with at least 256 bits of entropy."""
    return secrets.token_urlsafe(32)

def hash_token(raw_token: str) -> str:
    """Computes SHA-256 hex digest of the raw token."""
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

def get_active_qr_token(profile_id: str, base_url_override: str = None):
    """
    Retrieves the active QR token record for a given medical profile.
    Decrypts the token for the authenticated owner so the unique QR is preserved across sessions.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT id, profile_id, token_hash, token_encrypted, created_at, revoked_at, last_accessed_at, status 
               FROM qr_tokens 
               WHERE profile_id = ? AND status = 'active' 
               ORDER BY created_at DESC LIMIT 1""",
            (profile_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None

        encrypted_val = row["token_encrypted"] if "token_encrypted" in row.keys() else None
        raw_token = decrypt_token(encrypted_val) if encrypted_val else ""

        token_dict = dict(row)
        token_dict["raw_token"] = raw_token
        token_dict["emergency_url"] = get_emergency_url(raw_token, base_url_override) if raw_token else ""
        return token_dict

def create_or_regenerate_qr(profile_id: str, base_url_override: str = None):
    """
    Revokes any existing active token and generates a new secure QR token.
    Stores SHA-256 hash for public scan lookup and encrypted token for owner retrieval.
    """
    raw_token = generate_secure_token()
    token_hash = hash_token(raw_token)
    token_encrypted = encrypt_token(raw_token)
    token_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    emergency_url = get_emergency_url(raw_token, base_url_override)
    
    with get_db() as conn:
        cursor = conn.cursor()
        # Revoke existing tokens for this profile
        cursor.execute(
            "UPDATE qr_tokens SET status = 'revoked', revoked_at = ? WHERE profile_id = ? AND status = 'active'",
            (now, profile_id)
        )
        # Insert new token hash and encrypted token
        cursor.execute(
            """INSERT INTO qr_tokens (id, profile_id, token_hash, token_encrypted, created_at, status)
               VALUES (?, ?, ?, ?, ?, 'active')""",
            (token_id, profile_id, token_hash, token_encrypted, now)
        )
        conn.commit()
        
    return {
        "id": token_id,
        "profile_id": profile_id,
        "raw_token": raw_token,
        "token_hash": token_hash,
        "created_at": now,
        "status": "active",
        "emergency_url": emergency_url
    }

def revoke_qr_token(profile_id: str):
    """Immediately revokes the active QR token for a profile."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE qr_tokens SET status = 'revoked', revoked_at = ? WHERE profile_id = ? AND status = 'active'",
            (now, profile_id)
        )
        revoked_count = cursor.rowcount
        conn.commit()
    return revoked_count > 0

def render_styled_qr_image(url: str, add_cross: bool = True) -> Image.Image:
    """
    Renders an elegant high-resolution QR code with burgundy color palette
    and an emergency medical cross badge embedded in the center.
    Uses Error Correction Level H so the QR remains fully scannable with the badge.
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_H,
        box_size=12,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Render with Primary Burgundy (#791E32) on pure white background
    img = qr.make_image(fill_color="#791E32", back_color="#FFFFFF").convert("RGBA")
    
    if add_cross:
        width, height = img.size
        badge_size = int(width * 0.22)
        badge = Image.new("RGBA", (badge_size, badge_size), (255, 255, 255, 0))
        draw = ImageDraw.Draw(badge)
        
        # Rounded white background with subtle border
        draw.rounded_rectangle(
            [(0, 0), (badge_size - 1, badge_size - 1)],
            radius=badge_size // 4,
            fill="#FFFFFF",
            outline="#791E32",
            width=3
        )
        
        # Medical red cross in center
        margin = badge_size // 4
        bar_thickness = max(4, badge_size // 5)
        center = badge_size // 2
        
        # Horizontal bar
        draw.rectangle(
            [margin, center - bar_thickness // 2, badge_size - margin, center + bar_thickness // 2],
            fill="#B83A45"
        )
        # Vertical bar
        draw.rectangle(
            [center - bar_thickness // 2, margin, center + bar_thickness // 2, badge_size - margin],
            fill="#B83A45"
        )
        
        # Paste badge in center
        pos = ((width - badge_size) // 2, (height - badge_size) // 2)
        img.paste(badge, pos, badge)
        
    return img

def generate_qr_png_bytes(url: str) -> bytes:
    """Generates PNG bytes for the styled QR code."""
    img = render_styled_qr_image(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def generate_printable_card_pdf(patient_name: str, emergency_url: str) -> bytes:
    """
    Generates a professional, high-resolution printable emergency document in PDF format
    using ReportLab containing:
    1) Emergency Medical Wallet Card (3.5 x 4.5 in)
    2) Compact Phone-Back Sticker (2.2 x 2.2 in) for attaching directly to phone or case
    Both with clean cutting guidelines.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.lib.utils import ImageReader
    
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    page_w, page_h = letter
    
    # Render QR code image
    qr_img = render_styled_qr_image(emergency_url)
    qr_buf = io.BytesIO()
    qr_img.save(qr_buf, format="PNG")
    qr_buf.seek(0)
    img_reader = ImageReader(qr_buf)
    
    # -------------------------------------------------------------
    # ITEM 1: Emergency Medical Wallet Card (Left Side)
    # -------------------------------------------------------------
    card_w = 260
    card_h = 360
    card_x = 54
    card_y = page_h - card_h - 70
    
    # Cutting guidelines
    c.setDash(3, 3)
    c.setStrokeColor(colors.HexColor("#766A69"))
    c.setLineWidth(0.8)
    c.rect(card_x - 8, card_y - 8, card_w + 16, card_h + 16)
    c.setDash()
    
    # Card background (Warm Cream)
    c.setFillColor(colors.HexColor("#FFF8F0"))
    c.setStrokeColor(colors.HexColor("#791E32"))
    c.setLineWidth(2)
    c.roundRect(card_x, card_y, card_w, card_h, 12, fill=1, stroke=1)
    
    # Header Burgundy Banner
    banner_h = 55
    c.setFillColor(colors.HexColor("#791E32"))
    c.roundRect(card_x, card_y + card_h - banner_h, card_w, banner_h, 12, fill=1, stroke=0)
    c.rect(card_x, card_y + card_h - banner_h, card_w, 15, fill=1, stroke=0)
    
    # Banner Text
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(card_x + card_w / 2, card_y + card_h - 26, "MEDORA")
    c.setFont("Helvetica", 9)
    c.drawCentredString(card_x + card_w / 2, card_y + card_h - 42, "EMERGENCY MEDICAL ID CARD")
    
    # Draw QR code
    qr_dim = 175
    qr_x = card_x + (card_w - qr_dim) / 2
    qr_y = card_y + 95
    c.drawImage(img_reader, qr_x, qr_y, width=qr_dim, height=qr_dim)
    
    # Patient name
    c.setFillColor(colors.HexColor("#281D20"))
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(card_x + card_w / 2, card_y + 70, f"Emergency Profile: {patient_name}")
    
    # Instructions
    c.setFont("Helvetica-Oblique", 8.5)
    c.setFillColor(colors.HexColor("#766A69"))
    c.drawCentredString(card_x + card_w / 2, card_y + 48, "Scan with any smartphone camera for vital info.")
    c.drawCentredString(card_x + card_w / 2, card_y + 35, "No app or login required. Works offline.")
    
    # Footer red indicator
    c.setFillColor(colors.HexColor("#B83A45"))
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(card_x + card_w / 2, card_y + 14, "[!] FOR EMERGENCY ASSISTANCE ONLY")
    
    # Label for Item 1
    c.setFillColor(colors.HexColor("#791E32"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(card_x + card_w / 2, card_y - 24, "Option 1: Wallet Card (Cut along dashed line)")
    
    # -------------------------------------------------------------
    # ITEM 2: Phone-Back Sticker (Right Side)
    # Compact square designed to attach to the back of a phone or case
    # -------------------------------------------------------------
    sticker_w = 175
    sticker_h = 220
    sticker_x = 350
    sticker_y = page_h - sticker_h - 70
    
    # Cutting guidelines for sticker
    c.setDash(3, 3)
    c.setStrokeColor(colors.HexColor("#766A69"))
    c.setLineWidth(0.8)
    c.rect(sticker_x - 8, sticker_y - 8, sticker_w + 16, sticker_h + 16)
    c.setDash()
    
    # Sticker background
    c.setFillColor(colors.white)
    c.setStrokeColor(colors.HexColor("#791E32"))
    c.setLineWidth(1.5)
    c.roundRect(sticker_x, sticker_y, sticker_w, sticker_h, 8, fill=1, stroke=1)
    
    # Sticker Top Header
    c.setFillColor(colors.HexColor("#791E32"))
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(sticker_x + sticker_w / 2, sticker_y + sticker_h - 20, "MEDORA")
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#B83A45"))
    c.drawCentredString(sticker_x + sticker_w / 2, sticker_y + sticker_h - 32, "EMERGENCY MEDICAL ID")
    
    # Sticker QR Image
    sqr_dim = 120
    sqr_x = sticker_x + (sticker_w - sqr_dim) / 2
    sqr_y = sticker_y + 45
    c.drawImage(img_reader, sqr_x, sqr_y, width=sqr_dim, height=sqr_dim)
    
    # Sticker Footer
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.HexColor("#281D20"))
    c.drawCentredString(sticker_x + sticker_w / 2, sticker_y + 28, "SCAN IN EMERGENCY")
    c.setFont("Helvetica", 7)
    c.setFillColor(colors.HexColor("#766A69"))
    c.drawCentredString(sticker_x + sticker_w / 2, sticker_y + 14, "Attach to back of phone or case")
    
    # Label for Item 2
    c.setFillColor(colors.HexColor("#791E32"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(sticker_x + sticker_w / 2, sticker_y - 24, "Option 2: Phone-Back Sticker (Compact)")
    
    # Bottom page explanation
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#766A69"))
    c.drawCentredString(page_w / 2, 40, "Cut along the dashed lines. Use clear tape to stick the phone sticker directly to the back of your phone or case.")
    
    c.showPage()
    c.save()
    buf.seek(0)
    return buf.getvalue()

def generate_lockscreen_wallpaper(patient_name: str, emergency_url: str) -> bytes:
    """
    Generates a smartphone lock-screen wallpaper (1080 x 2400 portrait)
    with deep burgundy editorial gradient, clock area padding, and centered QR card.
    """
    width = 1080
    height = 2400
    
    # Base image with Deep Burgundy (#4C1423)
    img = Image.new("RGBA", (width, height), "#4C1423")
    draw = ImageDraw.Draw(img)
    
    # Subtle gradient top to bottom
    for i in range(height):
        ratio = i / height
        r = int(76 * (1 - ratio * 0.4))
        g = int(20 * (1 - ratio * 0.4))
        b = int(35 * (1 - ratio * 0.4))
        draw.line([(0, i), (width, i)], fill=(r, g, b, 255))
        
    # Card in center (allowing generous top space for system clock / notifications)
    card_w = 820
    card_h = 1050
    card_x = (width - card_w) // 2
    card_y = 750  # Positioned comfortably below system lock-screen clock
    
    # White card with rounded corners
    draw.rounded_rectangle(
        [(card_x, card_y), (card_x + card_w, card_y + card_h)],
        radius=48,
        fill="#FFFFFF",
        outline="#F4D9D9",
        width=4
    )
    
    # Render QR code
    qr_img = render_styled_qr_image(emergency_url)
    qr_resized = qr_img.resize((560, 560), Image.Resampling.LANCZOS)
    img.paste(qr_resized, ((width - 560) // 2, card_y + 150), qr_resized)
    
    # Card Header Pill
    pill_w = 460
    pill_h = 60
    draw.rounded_rectangle(
        [(width // 2 - pill_w // 2, card_y + 50), (width // 2 + pill_w // 2, card_y + 50 + pill_h)],
        radius=30,
        fill="#F4D9D9"
    )
    
    # Add bottom caution label
    draw.rounded_rectangle(
        [(card_x + 60, card_y + card_h - 180), (card_x + card_w - 60, card_y + card_h - 70)],
        radius=24,
        fill="#FFF8F0",
        outline="#F1E7DC",
        width=2
    )
    
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG", quality=95)
    buf.seek(0)
    return buf.getvalue()
