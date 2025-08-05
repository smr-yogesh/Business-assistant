from app import app
from utils.extensions import db
from sqlalchemy import text


def run_migrations():
    """Run custom database migrations without resetting data."""
    with app.app_context():
        migrations = [
            # 1. Add new columns (safe, won't fail if already exists)
            """
            CREATE TABLE IF NOT EXISTS client_site (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                business_id INTEGER NOT NULL,
                site_url VARCHAR(255) NOT NULL,
                subscription_type VARCHAR(50) NOT NULL,
                subscription_start TIMESTAMP NOT NULL,
                subscription_end TIMESTAMP NOT NULL
            );

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
