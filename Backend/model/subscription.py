# models/subscription.py
from utils.extensions import db
from datetime import datetime
from enum import Enum


class SubStatus(str, Enum):
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    UNPAID = "unpaid"


class Subscription(db.Model):
    __tablename__ = "subscription"

    id = db.Column(db.Integer, primary_key=True)

    # Link to your User/Business/ClientSite
    user_id = db.Column(db.Integer, nullable=False, index=True)
    business_id = db.Column(db.String(128), nullable=False, index=True)
    client_site_id = db.Column(db.Integer, nullable=True, index=True)

    # Stripe references (source of truth)
    stripe_customer_id = db.Column(db.String(64), nullable=False, index=True)
    stripe_subscription_id = db.Column(
        db.String(64), unique=True, index=True, nullable=False
    )
    stripe_price_id = db.Column(
        db.String(64), nullable=False
    )  # e.g. price_monthly, price_yearly
    stripe_product_id = db.Column(db.String(64), nullable=False)

    # State
    status = db.Column(db.Enum(SubStatus), nullable=False, default=SubStatus.INCOMPLETE)
    current_period_start = db.Column(db.DateTime, nullable=True)
    current_period_end = db.Column(db.DateTime, nullable=True)
    cancel_at_period_end = db.Column(db.Boolean, default=False)
    canceled_at = db.Column(db.DateTime, nullable=True)
    trial_end = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        db.Index("ix_sub_unique_business_active", "business_id", "status"),
    )

    def is_active(self, grace_days: int = 0) -> bool:
        """Paywall check used throughout your app."""
        if self.status in (SubStatus.ACTIVE, SubStatus.TRIALING, SubStatus.PAST_DUE):
            if self.current_period_end:
                from datetime import timedelta

                return datetime.utcnow() <= (
                    self.current_period_end + timedelta(days=grace_days)
                )
        return False
