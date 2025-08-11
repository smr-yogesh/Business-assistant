import os, smtplib, secrets, hashlib
from datetime import datetime, timedelta
from email.message import EmailMessage

from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import func
from werkzeug.security import generate_password_hash

from utils.extensions import db
from model.user import User, PasswordResetToken
from utils.sendMail import send_reset_email

password_reset_bp = Blueprint("password_reset", __name__, url_prefix="/api")
RESET_TOKEN_TTL_MIN = int(os.getenv("RESET_TOKEN_TTL_MIN", "30"))
APP_BASE_URL = os.getenv("APP_BASE_URL", "").rstrip("/")


def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


@password_reset_bp.post("/forgot")
def forgot_password():
    """
    Body: { "email": "<user@example.com>" }
    Always returns 200 to avoid user enumeration.
    Creates a single-use, 30-min token (configurable) and emails link.
    Basic rate guard: max 3 unexpired tokens per user per 24h.
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    # Always behave the same outwardly
    generic_ok = jsonify({"ok": True}), 200

    if not email or "@" not in email:
        return generic_ok

    user = User.query.filter(func.lower(User.email) == email).first()
    if not user:
        return generic_ok

    # Basic rate limit: max 3 active tokens in last 24h
    day_ago = datetime.utcnow() - timedelta(hours=24)
    active_count = (
        PasswordResetToken.query.filter(PasswordResetToken.user_id == user.id)
        .filter(PasswordResetToken.created_at >= day_ago)
        .filter(PasswordResetToken.used_at.is_(None))
        .count()
    )
    if active_count >= 3:
        # Still return generic OK (frontend will show “check your email”)
        return generic_ok

    # Create token
    raw_token = secrets.token_urlsafe(32)
    token_hash = _sha256_hex(raw_token)
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MIN)

    prt = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        request_ip=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=(request.headers.get("User-Agent") or "")[:256],
    )
    db.session.add(prt)
    db.session.commit()

    # Build reset link
    base = APP_BASE_URL or (request.host_url.rstrip("/"))
    reset_url = f"{base}/reset?token={raw_token}"

    try:
        send_reset_email(user.email, reset_url)
    except Exception as e:
        current_app.logger.exception(f"Password reset email send failed: {e}")
        # Still return generic OK (don’t leak info)
        return generic_ok

    return generic_ok


@password_reset_bp.post("/reset")
def reset_password():
    """
    Body: { "token": "<rawtoken>", "password": "<newpass>" }
    Returns 200 on success; errors: 400 invalid, 410 expired/used, 422 weak pass.
    """
    data = request.get_json(silent=True) or {}
    raw_token = (data.get("token") or "").strip()
    new_password = (data.get("password") or "").strip()

    print(raw_token)
    if not raw_token or not new_password:
        return jsonify({"error": "invalid_request"}), 400

    # Minimal password policy (match your UI)
    if len(new_password) < 8:
        return jsonify({"error": "weak_password"}), 422

    token_hash = _sha256_hex(raw_token)
    prt = (
        PasswordResetToken.query.filter_by(token_hash=token_hash)
        .order_by(PasswordResetToken.created_at.desc())
        .first()
    )

    if not prt:
        return jsonify({"error": "invalid_token"}), 400
    if prt.used_at is not None:
        return jsonify({"error": "token_used"}), 410
    if prt.expires_at < datetime.utcnow():
        return jsonify({"error": "token_expired"}), 410

    # Update password
    user = User.query.get(prt.user_id)

    if not user:
        return jsonify({"error": "invalid_token"}), 400

    user.set_password(new_password)
    # or your existing hash field
    db.session.add(user)

    # Mark this token used and optionally invalidate others
    prt.used_at = datetime.utcnow()
    # (Optional) expire all other active tokens for this user
    (
        PasswordResetToken.query.filter(PasswordResetToken.user_id == user.id)
        .filter(PasswordResetToken.used_at.is_(None))
        .filter(PasswordResetToken.id != prt.id)
        .update({PasswordResetToken.used_at: datetime.utcnow()})
    )

    db.session.commit()
    return jsonify({"ok": True}), 200
