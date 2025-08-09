from app import app
from utils.extensions import db
from sqlalchemy import text


def run_migrations():
    with app.app_context():
        stmts = [
            # 1) Normalize any existing uppercase statuses
            "UPDATE subscription SET status = LOWER(status) WHERE status <> LOWER(status);",
            # 2) Replace the check constraint with a case-insensitive version
            "ALTER TABLE subscription DROP CONSTRAINT IF EXISTS subscription_status_check;",
            """
            ALTER TABLE subscription
            ADD CONSTRAINT subscription_status_check
            CHECK (LOWER(status) IN (
                'incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid'
            ));
            """,
        ]
        for sql in stmts:
            try:
                db.session.execute(text(sql))
                db.session.commit()
                print("OK:", sql.splitlines()[0][:80], "...")
            except Exception as e:
                print("ERR:", e)
                db.session.rollback()


if __name__ == "__main__":
    run_migrations()
