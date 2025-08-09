# payment.py
import os
from datetime import datetime, timedelta
from urllib.parse import urlparse

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

import stripe

from utils.extensions import db

from model.user import User  # needs stripe_customer_id column
from model.subscription import Subscription, SubStatus
from model.pending_content import PendingContent

from utils.chunking import chunk_text
from utils.embeddings import get_embedding
from utils.chroma_utils import get_or_create_collection, add_chunks

payment_bp = Blueprint("payment", __name__)

# --- Stripe config (env-driven) ---
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
PRICE_MONTHLY = os.getenv("STRIPE_PRICE_MONTHLY")  # e.g., price_123
PRICE_YEARLY = os.getenv("STRIPE_PRICE_YEARLY")  # e.g., price_456
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
APP_BASE_URL = os.getenv(
    "APP_BASE_URL"
)  # e.g., https://yourapp.com (no trailing slash)


# ---------- Helpers ----------


def _price_for(billing: str) -> str:
    return PRICE_YEARLY if (billing or "").lower() == "yearly" else PRICE_MONTHLY


def _parse_client_ref(ref: str | None):
    # format: "business_id:pending_id"
    if not ref:
        return None, None
    parts = (ref or "").split(":")
    business_id = parts[0] or None
    pending_id = parts[1] if len(parts) > 1 else None
    return business_id, pending_id


def _extract_domain(site_url: str | None) -> str | None:
    if not site_url:
        return None
    try:
        netloc = urlparse(site_url).netloc
        return netloc.lower() if netloc else None
    except Exception:
        return None


# ---------- Create Checkout Session (SUBSCRIPTION) ----------
@payment_bp.route("/payment/create-checkout-session", methods=["POST"])
@jwt_required()
def create_checkout_session():
    if not stripe.api_key or not WEBHOOK_SECRET:
        return jsonify({"error": "Stripe not configured on server"}), 500

    data = request.get_json() or {}
    billing = (data.get("billing") or "monthly").lower()
    site_url = (data.get("url") or "").strip()
    content = (data.get("content") or "").strip()

    if not site_url or not content:
        return jsonify({"error": "Both 'url' and 'content' are required"}), 400

    price_id = _price_for(billing)
    if not price_id:
        return jsonify({"error": "Stripe price not configured"}), 500

    # Identify business by domain (adjust if you use numeric business IDs)
    business_id = _extract_domain(site_url) or "default"

    # Current user
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Create/ensure Stripe Customer once
    if not getattr(user, "stripe_customer_id", None):
        customer = stripe.Customer.create(
            email=user.email, metadata={"user_id": user.id}
        )
        user.stripe_customer_id = customer.id
        db.session.commit()

    # 1) Persist PendingContent (durable, idempotent later)
    pending = PendingContent(
        user_id=user.id,
        business_id=business_id,
        site_url=site_url,
        content=content,
    )
    db.session.add(pending)
    db.session.commit()  # need pending.id

    # 2) Create Subscription Checkout Session
    base_url = APP_BASE_URL or request.host_url.rstrip("/")
    success_url = f"{base_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{base_url}/billing/cancel"

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=user.stripe_customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        allow_promotion_codes=True,
        client_reference_id=f"{business_id}:{pending.id}",
        success_url=success_url,
        cancel_url=cancel_url,
    )

    # optional: store session id for support/debug
    pending.session_id = session.id
    db.session.commit()

    return jsonify({"url": session.url, "sessionId": session.id}), 200


# ---------- Stripe Webhook ----------
@payment_bp.route("/payment/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")

    if not WEBHOOK_SECRET:
        return "Stripe webhook secret not configured", 500

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        return "Invalid signature", 400
    except Exception:
        return "Invalid payload", 400

    etype = event["type"]
    obj = event["data"]["object"]

    # --- 1) Checkout completion: new subscription + fulfill content ---
    if etype == "checkout.session.completed":
        sub_id = obj.get("subscription")
        customer_id = obj.get("customer")
        business_id, pending_id = _parse_client_ref(obj.get("client_reference_id"))

        # If we have a subscription, mirror it locally
        if sub_id and customer_id:
            sub = stripe.Subscription.retrieve(
                sub_id, expand=["items.data.price.product"]
            )

            # Find user by customer
            user = User.query.filter_by(stripe_customer_id=customer_id).first()
            user_id = user.id if user else None

            s = Subscription.query.filter_by(stripe_subscription_id=sub.id).first()
            if not s:
                s = Subscription(
                    user_id=user_id,
                    business_id=business_id if business_id else None,
                    client_site_id=None,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=sub.id,
                    stripe_price_id=sub["items"]["data"][0]["price"]["id"],
                    stripe_product_id=sub["items"]["data"][0]["price"]["product"]["id"],
                )
                db.session.add(s)

            s.status = (sub.status or "").lower()

            cps = getattr(sub, "current_period_start", None)
            cpe = getattr(sub, "current_period_end", None)
            s.current_period_start = datetime.fromtimestamp(cps) if cps else None
            s.current_period_end = datetime.fromtimestamp(cpe) if cpe else None
            if not cps or not cpe:
                current_app.logger.warning(
                    f"[Stripe] {sub.id} status={sub.status} missing period dates at checkout completion. "
                    "Will be filled by later subscription/invoice events."
                )

            s.cancel_at_period_end = bool(sub.cancel_at_period_end)
            s.trial_end = (
                datetime.fromtimestamp(sub.trial_end) if sub.trial_end else None
            )
            db.session.commit()

        # Fulfill the pending content ONCE (idempotent)
        if pending_id:
            pending = PendingContent.query.get(pending_id)
            if pending and not pending.processed_at:
                try:
                    # Same logic as /api/add_document
                    chunks = chunk_text(pending.content)
                    embeddings = [get_embedding(c) for c in chunks]
                    collection = get_or_create_collection(f"biz_{pending.business_id}")
                    add_chunks(chunks, embeddings, collection)

                    pending.processed_at = datetime.utcnow()
                    db.session.commit()
                except Exception as e:
                    # Log error; Stripe will retry the webhook. Keep it 200 to avoid duplicate heavy retries
                    current_app.logger.exception(
                        f"PendingContent fulfillment failed id={pending_id}: {e}"
                    )

        return "", 200

    # --- 2) Subscription lifecycle updates ---
    if etype in ("customer.subscription.updated", "customer.subscription.deleted"):
        sub_id = obj.get("id")
        if sub_id:
            full = stripe.Subscription.retrieve(sub_id)  # full object with dates
            s = Subscription.query.filter_by(stripe_subscription_id=sub_id).first()
            if s:
                s.status = SubStatus(full.status).lower()
                s.current_period_start = (
                    datetime.fromtimestamp(full.current_period_start)
                    if full.current_period_start
                    else None
                )
                s.current_period_end = (
                    datetime.fromtimestamp(full.current_period_end)
                    if full.current_period_end
                    else None
                )
                s.cancel_at_period_end = bool(full.cancel_at_period_end)
                s.canceled_at = (
                    datetime.fromtimestamp(full.canceled_at)
                    if full.canceled_at
                    else None
                )
                s.trial_end = (
                    datetime.fromtimestamp(full.trial_end) if full.trial_end else None
                )
                db.session.commit()

        return "", 200

    # --- 3) Invoices: payment failed/succeeded ---
    if etype == "invoice.payment_failed":
        sub_id = obj.get("subscription")
        if sub_id:
            s = Subscription.query.filter_by(stripe_subscription_id=sub_id).first()
            if s and s.status != SubStatus.CANCELED:
                s.status = SubStatus.PAST_DUE.lower()
                db.session.commit()
        return "", 200

    if etype == "invoice.payment_succeeded":
        sub_id = obj.get("subscription")
        if sub_id:
            full = stripe.Subscription.retrieve(sub_id)
            s = Subscription.query.filter_by(stripe_subscription_id=sub_id).first()
            if s:
                s.status = SubStatus(full.status).lower()
                s.current_period_start = (
                    datetime.fromtimestamp(full.current_period_start)
                    if full.current_period_start
                    else None
                )
                s.current_period_end = (
                    datetime.fromtimestamp(full.current_period_end)
                    if full.current_period_end
                    else None
                )
                db.session.commit()
        return "", 200

    # Unhandled event types
    return "", 200
