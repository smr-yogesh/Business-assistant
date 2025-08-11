from app import app
from utils.extensions import db
from sqlalchemy import text


def run_migrations():
    with app.app_context():
        stmts = [
            """
                CREATE TABLE IF NOT EXISTS password_reset_token (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    token_hash VARCHAR(64) NOT NULL,           -- SHA-256 hex
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    expires_at TIMESTAMP NOT NULL,
                    used_at TIMESTAMP,
                    request_ip VARCHAR(64),
                    user_agent VARCHAR(256)
                );
                """,
            "CREATE INDEX IF NOT EXISTS ix_prt_user_id ON password_reset_token(user_id);",
            "CREATE INDEX IF NOT EXISTS ix_prt_token_hash ON password_reset_token(token_hash);",
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
