from app import app
from utils.extensions import db
from sqlalchemy import text


def run_migrations():
    """Run custom database migrations without resetting data."""
    with app.app_context():
        migrations = [
            # 1. Add new columns (safe, won't fail if already exists)
            """
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
            """,
            # Add more migration SQL here as needed...
        ]

        for migration in migrations:
            try:
                db.session.execute(text(migration))
                db.session.commit()
                print(f"Migration executed: {migration[:60].strip()}...")
            except Exception as e:
                print(f"Migration failed: {str(e)}")
                db.session.rollback()


if __name__ == "__main__":
    run_migrations()
