# models/pending_content.py
from utils.extensions import db
from datetime import datetime
import uuid


class PendingContent(db.Model):
    __tablename__ = "pending_content"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, nullable=False, index=True)
    business_id = db.Column(
        db.String(128), nullable=False, index=True
    )  # e.g. "acme_com" or numeric id
    site_url = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=False)

    session_id = db.Column(
        db.String(255), nullable=True, index=True
    )  # Stripe session (optional)
    processed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def mark_processed(self):
        self.processed_at = datetime.utcnow()
