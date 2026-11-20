import os
from app import create_app
from seed import seed_demo_data

app = create_app()

# Auto-seed synthetic demonstration profile (Ananya Sen) on boot if not already present
try:
    with app.app_context():
        seed_demo_data()
except Exception as e:
    print(f"[!] Startup auto-seed notice: {e}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Medora Backend starting on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)

