# MEDORA
### *Essential Medical Information. One Scan Away.*

**An Emergency Medical Information & QR Access Platform**

---

## 1. Executive Summary & Problem Statement

During medical crises, especially those involving elderly individuals, people with severe drug allergies, or patients with chronic ailments such as cardiovascular disease or diabetes, the ability to rapidly communicate vital clinical information can be life-saving. 

Often, individuals in distress cannot speak, bystanders do not know the patient's identity or blood group, and emergency responders risk administering contraindicated pharmaceuticals (e.g. penicillin to an allergic patient) before medical history is located.

**Medora** is a production-quality, privacy-conscious digital safety platform. Profile owners or their caregivers can curate an emergency medical snapshot and generate a unique, cryptographically secured QR code.

When scanned by any bystander or paramedic using a standard smartphone camera:
- A public, lightweight, read-only emergency webpage opens immediately **without requiring login, password, or application download**.
- It exposes **only** the clinical fields explicitly approved by the profile owner (e.g. blood group, allergies, medications, and primary physician).
- It provides a prominent **one-tap emergency contact dialing button** (`tel:` link).
- The entire interface seamlessly switches between **English**, **বাংলা (Bengali)**, and **हिन्दी (Hindi)**.
- The system logs the scan event in a privacy-conscious audit trail (device category and timestamp, never raw IP or precise GPS coordinates) and automatically dispatches an immediate email alert to the registered emergency notification address.

---

## 2. Product Philosophy & Design Identity

The user interface follows an editorial, reassuring aesthetic inspired by modern SaaS and healthcare design tokens:
- **Primary Burgundy (`#791E32`)** and **Deep Burgundy (`#4C1423`)**: Evokes dignity, warmth, and clinical authority rather than generic hospital blue.
- **Medical Red (`#B83A45`)**: Highlights critical emergency actions and allergies.
- **Warm Cream (`#FFF8F0`)** & **Pale Beige (`#F1E7DC`)**: Soft, elder-friendly backgrounds designed for low eye-strain.
- **Typography**: Editorial headings using *Playfair Display* and *DM Serif Display*, paired with crisp *Inter* body typography.
- **Accessibility & Performance**: Designed mobile-first, adhering to WCAG contrast standards, respecting `prefers-reduced-motion`, with an ultra-light emergency scanning bundle.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Router:** React Router DOM v6
- **Effects:** Canvas Confetti (celebratory feedback on save & QR generation)

### Backend
- **Framework:** Python Flask (RESTful JSON API)
- **Security & Headers:** Flask-CORS, Flask-Limiter
- **QR Generation:** Python `qrcode[pil]` with Error Correction Level H and custom center medical cross badge
- **Graphics & Documents:** Pillow (PIL) for 1080x2400 smartphone lock-screen wallpapers, ReportLab for high-res PDF printable wallet cards with cutting guides
- **Authentication & Cryptography:** PyJWT, Werkzeug password hashing, Python `secrets` (256-bit entropy tokens), `hashlib.sha256` for one-way token hashing

### Database & Persistence
- **Primary/Cloud:** Supabase PostgreSQL with Row Level Security (RLS) policies, triggers, and indices (schema provided in `backend/migrations/schema.sql`)
- **Local/Demo Fallback:** Built-in SQLite relational engine (`backend/medora.db`) with identical constraints, foreign keys (`PRAGMA foreign_keys = ON;`), and transactions, guaranteeing zero friction for immediate offline or local evaluation.

---

## 4. Architecture & Directory Tree

```text
Medora/
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   │   ├── authentication.py     # JWT token verification & ownership check
│   │   │   ├── error_handler.py      # Clean sanitized JSON error handlers
│   │   │   └── rate_limit.py         # Flask-Limiter configuration (IP-based)
│   │   ├── routes/
│   │   │   ├── access_logs.py        # /api/access-logs (audit history & statistics)
│   │   │   ├── auth.py               # /api/auth (register, login, me, password, delete)
│   │   │   ├── emergency.py          # /api/emergency/<token> (public read-only scan)
│   │   │   ├── notifications.py      # /api/notifications (scan alerts & notifications)
│   │   │   ├── profiles.py           # /api/profile (medical data & privacy toggles)
│   │   │   └── qr.py                 # /api/qr (generation, revoke, PNG, PDF, wallpaper)
│   │   ├── services/
│   │   │   ├── emergency_service.py  # Public filtering, rate limiting, audit logging
│   │   │   └── qr_service.py         # 256-bit token hashing, PIL QR, PDF, wallpaper
│   │   ├── config.py                 # Application configuration & env loader
│   │   ├── database.py               # Database initialization & connection pooling
│   │   └── __init__.py               # Flask app factory
│   ├── migrations/
│   │   └── schema.sql                # Production Supabase PostgreSQL DDL + RLS
│   ├── tests/
│   │   └── test_api.py               # Automated unit & integration test suite
│   ├── requirements.txt              # Pinned Python package dependencies
│   ├── run.py                        # Backend entrypoint with auto-seed
│   ├── seed.py                       # Synthetic demonstration profile seeder
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Navbar, Sidebar, DashboardLayout
│   │   │   └── ui/                   # Button, Card, Input, Badge, Modal, Toast
│   │   ├── contexts/                 # AuthContext
│   │   ├── pages/
│   │   │   ├── AccessLogs.tsx        # Audit timeline and device breakdown
│   │   │   ├── Dashboard.tsx         # User overview, live counts, preparedness
│   │   │   ├── EmergencyPage.tsx     # Public multilingual emergency view
│   │   │   ├── Home.tsx              # Editorial split-hero landing page & FAQ
│   │   │   ├── Login.tsx             # Split-screen authentication with demo shortcut
│   │   │   ├── Notifications.tsx     # Emergency scan alerts and in-app logs
│   │   │   ├── Profile.tsx           # Multi-section medical editor & privacy toggles
│   │   │   ├── QRManagement.tsx      # QR preview, downloads, phone mockup, revoke
│   │   │   ├── Settings.tsx          # Password, credentials, account deletion
│   │   │   └── Signup.tsx            # Elder & caregiver account registration
│   │   ├── services/
│   │   │   └── api.ts                # Typed HTTP API client
│   │   ├── types/
│   │   │   └── index.ts              # MedicalProfile, Visibility, QRToken types
│   │   ├── utils/
│   │   │   ├── cn.ts                 # Class merger utility
│   │   │   └── translations.ts       # English, Bengali, Hindi dictionary
│   │   ├── App.tsx                   # Client router & protected routes
│   │   ├── index.css                 # Custom Tailwind layer styling
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   └── .env.example
└── README.md
```

---

## 5. Security & Privacy Architecture

1. **Cryptographic Token Generation:**
   - QR tokens are generated using Python's `secrets.token_urlsafe(32)`, providing at least 256 bits of cryptographic entropy.
   - Brute-force guessing of a token is computationally infeasible ($2^{256}$ possibilities).

2. **Zero Plaintext Storage:**
   - **The raw token is never stored in the database.**
   - Only the SHA-256 cryptographic digest (`hashlib.sha256(raw_token).hexdigest()`) is stored in the `qr_tokens` table.
   - When an emergency link is scanned, the backend hashes the incoming token parameter and looks up the active hash record.

3. **Zero Plaintext Medical Data in QR:**
   - No medical records, names, or diagnosis strings are encoded inside the physical QR matrix.
   - The QR only contains the secure web URL (`https://<domain>/emergency/<token>`).

4. **Instant Revocation:**
   - If a card or device is lost, clicking "Revoke QR" marks the token hash as `revoked` and sets `revoked_at = NOW()`.
   - Any subsequent scans immediately return HTTP 403 Forbidden with a clear notification: *"This QR code is no longer active. Please contact the individual or their caregiver for assistance."*

5. **Granular Privacy Visibility Filtering:**
   - The public emergency endpoint executes server-side field redaction based on the user's `emergency_visibility` settings.
   - If a user disables `show_doctor_details` or `show_age`, those JSON keys are completely omitted from the API response.

6. **Rate Limiting:**
   - Public scan routes are rate-limited via `Flask-Limiter` (15 requests/minute per client) to thwart automated scrapers while ensuring immediate access during genuine crises.

7. **Privacy-Conscious Audit Logging:**
   - The platform never collects, stores, or logs raw IP addresses or precise GPS coordinates.
   - Access logs capture only the high-level device category (e.g. `Mobile (Android)`, `Mobile (iOS)`, `Desktop`) and browser family.

---

## 6. Demonstration Data (ISI Internship Fictional Profile)

The application automatically seeds a synthetic, fictional demonstration profile on initial startup:
- **Email:** `ananya.sen@example.com`
- **Password:** `DemoPassword123!`
- **Patient:** Ananya Sen, 72 years old, Blood Group `B+`
- **Conditions:** Hypertension (Stage 2), Type 2 Diabetes Mellitus
- **Allergies:** Penicillin (Severe rash), Peanuts (Anaphylaxis)
- **Current Medications:** Metformin (500 mg, twice daily), Amlodipine (5 mg, once daily)
- **Primary Doctor:** Dr. R. Chatterjee (`+91 98765 12345` - Fictional)
- **Emergency Contact:** Ritu Sen, Daughter (`+91 98765 43210` - Fictional non-operational demonstration number)
- **Permanent Demo Emergency Token:** `demo-ananya-sen-emergency-2026`
- **Direct Emergency Scan URL:** `http://localhost:5173/emergency/demo-ananya-sen-emergency-2026`

*(A one-click "Fill Demo Account" shortcut button is provided directly on the Login page).*

---

## 7. Local Installation & Running Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### Step 1: Set Up and Run the Backend
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the automated API test suite (Verifies health, public scans, revocation, and rate limiting)
python -m unittest tests/test_api.py

# Launch the Flask API server (runs on http://localhost:5000)
python run.py
```

### Step 2: Set Up and Run the Frontend
```bash
# Open a new terminal in the frontend directory
cd frontend

# Install npm dependencies
npm install

# Run the development server (runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 8. Public Testing Mode (Cross-Device Phone Scanning via ngrok)

For real-world testing from physical smartphones without deploying to cloud infrastructure:

### 1-Click Launch (Windows)
Double-click `start_public_mode.bat` or run in PowerShell:
```powershell
.\start_public_mode.ps1
```

### What this does automatically:
1. Starts the **Flask API backend** on `http://127.0.0.1:5000`.
2. Starts the **Vite dev server** on `http://localhost:5173` with single-origin `/api` proxying and `allowedHosts: true`.
3. Establishes a secure public HTTPS tunnel using **ngrok** forwarding to port 5173.
4. Auto-detects the public ngrok domain (e.g. `https://your-session-id.ngrok-free.dev`) and registers it in the background.
5. All newly generated QR codes automatically encode the public HTTPS URL.
6. The user interface remains completely clean and distraction-free (no dev banners or raw tunnel URLs displayed).
7. If your public tunnel changes upon restarting, an in-place refresh button updates the QR image and emergency link without altering your cryptographic token or privacy settings.
8. Scanning the QR code with any smartphone camera instantly opens the dedicated read-only emergency page without login.

### Note on ngrok Browser Warning Screen (Free Tier Interstitial)
When opening `*.ngrok-free.dev` links from a phone camera or browser for the first time, ngrok displays an intermediate security screen (*"You are about to visit... This website is served for free through ngrok.com... Visit site"*):
- **Why this occurs:** This is ngrok's edge-level anti-phishing safeguard for all free-tier accounts during initial top-level browser navigation. It is not an application error or 404.
- **Handling during testing:** Tapping the blue **"Visit site"** button once sets an `__ngrok_free_token` session cookie on the phone's browser. All subsequent scans and emergency page navigations open immediately.
- **Production & Custom Domains:** In production (e.g., deployed to Render, AWS, Vercel) or on paid ngrok plans with custom branded domains (e.g., `emergency.medora.health`), this interstitial screen is completely absent.

---

## 9. Built-in Transactional Email Infrastructure & Scan Alerts

Medora features a permanent, server-side transactional email notification architecture. Ordinary end users (patients and caregivers) **never configure SMTP, Gmail passwords, or technical settings**. The application developer or deployment administrator configures a transactional email provider **once** on the backend using standard server environment variables.

### Key Architecture Features:
1. **Mandatory Emergency Notification Email:**
   - Required during account registration (`/signup`), distinct from the account login email.
   - Can belong to the patient, an adult child, spouse, or primary caregiver.
   - Saves directly to the profile with scan alerts enabled immediately (zero OTP or verification code friction).
2. **Permanent Server-Side Email Providers Supported:**
   - **Brevo** (Recommended API): `BREVO_API_KEY=xkeysib-...`
   - **Resend**: `RESEND_API_KEY=re_...`
   - **SendGrid**: `SENDGRID_API_KEY=SG....`
   - **Custom SMTP Fallback**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   - **Honest Provider Status Reporting:** If no provider is configured on the backend, Medora never pretends emails were delivered; it logs `[EMAIL INFRASTRUCTURE UNCONFIGURED]` with actionable administrator guidance in the server logs and returns `PROVIDER_NOT_CONFIGURED`.
3. **Automatic Emergency Scan Alerts:**
   - Every successful public access to an active QR emergency page automatically triggers a high-priority alert email to the emergency notification address.
   - **Zero Clinical Data:** In accordance with strict medical privacy, diagnoses, medications, allergies, and blood group are **strictly excluded** from notification emails. The alert includes only the patient's name, UTC timestamp, high-level device category (e.g. `Mobile (iOS)`), and browser family.
   - **No Cooldown Suppressing Legitimate Scans:** Legitimately separate scans made minutes or seconds apart each generate an alert. Only rapid duplicate requests (< 2.0 seconds with identical client fingerprint) caused by browser pre-fetching or double-taps are deduplicated.
   - **Asynchronous Non-Blocking Execution:** Emails are dispatched asynchronously in background daemon threads, ensuring the public emergency page loads instantaneously for first responders.
4. **Safe Address Updates:**
   - Caregivers can update their notification email at any time in **My Profile** (`/profile`).
   - The updated address saves immediately to the profile and receives subsequent emergency alerts.
5. **Developer Configuration in `backend/.env`:**
   ```bash
   # Option A: Brevo (Recommended API)
   BREVO_API_KEY=xkeysib-your_brevo_api_key
   EMAIL_FROM="Medora Safety Alerts <alerts@yourdomain.com>"

   # Option B: Resend
   # RESEND_API_KEY=re_your_api_key_here

   # Option C: SendGrid
   # SENDGRID_API_KEY=SG.your_api_key_here

   # Option D: Standard SMTP
   # SMTP_HOST=smtp.mailgun.org
   # SMTP_PORT=587
   # SMTP_USER=postmaster@yourdomain.com
   # SMTP_PASSWORD=your_secret_password
   # SMTP_FROM="Medora Safety Alerts <alerts@yourdomain.com>"
   ```

---

## 10. Verification & End-to-End User Journey

You can verify the complete acceptance criteria across all three roles:

### A. The Profile Owner / Caregiver
1. Open `http://localhost:5173`. Review the editorial landing page, 4-step flow, and FAQ.
2. Click **Log In** and tap the **"Fill Demo Account (Ananya Sen)"** shortcut.
3. Arrive at the **User Dashboard** with deep burgundy navigation, real backend metrics, and preparedness banner.
4. Navigate to **My Profile** (`/profile`). Modify medications, add a condition, toggle public visibility switches, and click **Save Changes** (triggers celebratory confetti and PostgreSQL/SQLite persistence).
5. Navigate to **My QR Code** (`/qr`):
   - Click **Download QR (PNG)** to save the high-res QR code.
   - Click **Print QR Card (PDF)** to generate the wallet card with cutting lines.
   - Click **Lock-Screen Wallpaper** to preview the phone mockup and download the 1080x2400 mobile wallpaper.
6. Click **Revoke QR** and confirm. Observe the badge update to `Revoked`.

### B. The Emergency Bystander / First Responder
1. Open the public emergency link in an incognito window or smartphone browser without logging in:  
   `http://localhost:5173/emergency/<YOUR_GENERATED_TOKEN>`  
   *(or the active public ngrok tunnel link generated in Public Testing Mode)*
2. Notice the rapid loading time, clean burgundy header, and visible patient details (Ananya Sen, Age 72, B+).
3. Test the language switcher in the header:
   - Click **বাংলা** to see the entire emergency interface translated into authentic Bengali.
   - Click **हिंदी** to see the interface rendered in authentic Hindi.
   - Click **EN** to return to English.
4. Tap the **CALL EMERGENCY CONTACT** button to test the `tel:+919876543210` protocol link.
5. If the QR was revoked by the owner, reload the page to observe the graceful deactivated screen:  
   *"This QR code has been revoked by the profile owner or caregiver. It can no longer display emergency medical information."*

### C. The System
1. Go to **Access Logs** (`/access-logs`) in the logged-in dashboard. Observe the new audit entry showing device family and timestamp.
2. Go to **Notifications** (`/notifications`) to inspect the emergency scan alert entry, and verify receipt of the alert email sent to the stored emergency notification address.

---

## 11. Demonstration Disclaimer

Medora is a prototype emergency medical information platform. All sample patient data, medical conditions, medication regimens, and phone numbers are strictly synthetic demonstrations. No actual medical data is exposed.

