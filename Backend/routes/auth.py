from flask import jsonify, request, Blueprint, render_template, url_for
from email_validator import validate_email, EmailNotValidError
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from routes.validator import validate_password
from datetime import datetime, timedelta
from model.user import User
from utils.extensions import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup")
def signup():
    return render_template("signup.html", dashboard_url=url_for("dash.dashboard"))


@auth_bp.route("/signin", methods=["POST"])
def signin():
    """User login endpoint"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        remember_me = data.get("remember_me", False)

        if not email:
            return jsonify({"error": "Email is required"}), 400

        if not password:
            return jsonify({"error": "Password is required"}), 400

        # Find user by email
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Create access token with extended expiry if remember_me is True
        expires = timedelta(days=30) if remember_me else timedelta(hours=24)
        access_token = create_access_token(identity=user.id, expires_delta=expires)

        return (
            jsonify(
                {
                    "message": "Login successful",
                    "user": user.to_dict(),
                    "access_token": access_token,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Signin error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
