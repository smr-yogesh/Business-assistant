from utils.extensions import db  # or from flask_sqlalchemy import SQLAlchemy


class ClientSite(db.Model):
    __tablename__ = "client_site"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    business_id = db.Column(db.Integer, nullable=False)
    site_url = db.Column(db.String(255), nullable=False)
    subscription_type = db.Column(db.String(50), nullable=False)
    subscription_start = db.Column(db.DateTime, nullable=False)
    subscription_end = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "business_id": self.business_id,
            "site_url": self.site_url,
            "subscription_type": self.subscription_type,
            "subscription_start": (
                self.subscription_start.isoformat() if self.subscription_start else None
            ),
            "subscription_end": (
                self.subscription_end.isoformat() if self.subscription_end else None
            ),
        }
