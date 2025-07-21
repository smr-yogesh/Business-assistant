from flask import jsonify, request, Blueprint, render_template
from email_validator import validate_email, EmailNotValidError
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from routes.validator import validate_password
from datetime import datetime, timedelta
from model.user import User
from utils.extensions import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name:
            return jsonify({"error": "Name is required"}), 400

        if not email:
            return jsonify({"error": "Email is required"}), 400

        if not password:
            return jsonify({"error": "Password is required"}), 400

        # Validate email format
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({"error": message}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 409

        # Create new user
        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Create access token
        access_token = create_access_token(identity=user.id)

        return (
            jsonify(
                {
                    "message": "User created successfully",
                    "user": user.to_dict(),
                    "access_token": access_token,
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


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
