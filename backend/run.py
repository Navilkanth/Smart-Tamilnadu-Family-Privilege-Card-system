import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env before any app imports that read config
load_dotenv(Path(__file__).resolve().parent / ".env", override=True)

from app import create_app
from app.extensions import db
from app.seed import seed_database

app = create_app(os.getenv("FLASK_ENV", "development"))


@app.cli.command("init-db")
def init_db():
    """Create tables and seed initial data."""
    db.create_all()
    seed_database()
    print("Database initialized and seeded.")


if __name__ == "__main__":
    with app.app_context():
        try:
            db.create_all()
            seed_database()
            print("Database connected. Tables ready.")
        except Exception as exc:
            print("\n*** DATABASE ERROR ***")
            print(str(exc))
            print("\nFix backend/.env -> DATABASE_URL (PostgreSQL user, password, database name).")
            print("Create DB: CREATE DATABASE smart_privilege_card;\n")
            raise SystemExit(1) from exc
    app.run(host="0.0.0.0", port=5000, debug=True)
