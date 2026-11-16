import os
from app import create_app
from seed import seed_demo_data

app = create_app()

if __name__ == "__main__":
    # Seed fictional demo data on launch if not present
    seed_demo_data()
    
    port = int(os.environ.get("PORT", 5000))
    print(f"Medora Backend starting on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)

