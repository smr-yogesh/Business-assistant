from flask import Blueprint, jsonify, request, url_for
from email_validator import validate_email, EmailNotValidError
from datetime import datetime, timedelta
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies,
)
from routes.validator import validate_password
from utils.embeddings import get_embedding
from utils.chunking import chunk_text
from utils.chroma_utils import get_or_create_collection, query_chunks, add_chunks
from utils.llm import get_answer
from utils.extensions import db
from utils.sendMail import send_mail
from model.user import User
import uuid

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/add_document", methods=["POST"])
def add_document():
    data = request.get_json(force=True)
    content = data.get("content", "")
    business_id = data.get("business_id", "default")
    if not content:
        return jsonify({"error": "No content provided"}), 400

    chunks = chunk_text(content)
    embeddings = [get_embedding(chunk) for chunk in chunks]
    collection = get_or_create_collection(f"biz_{business_id}")
    add_chunks(chunks, embeddings, collection)

    return jsonify({"status": "Document added", "chunks": len(chunks)})


@api_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    query = data.get("query", "")
    business_id = data.get("business_id", "default")

    if not query:
        return jsonify({"error": "No query provided"}), 400

    collection = get_or_create_collection(f"biz_{business_id}")

    query_embedding = get_embedding(query)
    relevant_chunks = query_chunks(query_embedding, k=5, collection=collection)

    answer = get_answer(query, relevant_chunks)
    return jsonify({"answer": answer})


@api_bp.route("/signup", methods=["POST"])
def api_signup():
    try:
        data = request.get_json()

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

        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"error": "Invalid email format"}), 400

        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({"error": message}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 409

        verification_token = str(uuid.uuid4())
        user = User(
            name=name,
            email=email,
            is_verified=False,
            verification_token=verification_token,
        )
        user.set_password(password)
        verify_url = url_for(
            "auth.verify_email", token=verification_token, _external=True
        )
        if send_mail(name, email, verify_url):
            db.session.add(user)
            db.session.commit()
            access_token = create_access_token(identity=user.id)
            resp = jsonify(
                {"message": "User created successfully", "user": user.to_dict()}
            )
            set_access_cookies(resp, access_token)
            return resp, 201
        return jsonify({"error": "Internal server error"}), 500

    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    return jsonify({"message": "User created"})


@api_bp.route("/signin", methods=["POST"])
def signin():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        remember_me = data.get("remember_me", False)

        if not email:
            return jsonify({"error": "Email is required"}), 400

        if not password:
            return jsonify({"error": "Password is required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401
        user.last_login = datetime.utcnow()
        db.session.commit()
        expires = timedelta(days=30) if remember_me else timedelta(hours=24)
        access_token = create_access_token(identity=user.id, expires_delta=expires)

        resp = jsonify(
            {
                "message": "Login successful",
                "user": user.to_dict(),
            }
        )

        set_access_cookies(resp, access_token)
        return resp, 200

    except Exception as e:
        print(f"Signin error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/resend-verification", methods=["POST"])
@jwt_required()
def resend_verification():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.is_verified:
        return jsonify({"message": "Already verified"}), 400
    # Generate new token
    user.verification_token = str(uuid.uuid4())
    db.session.commit()
    verify_url = url_for(
        "auth.verify_email", token=user.verification_token, _external=True
    )
    if send_mail(user.name, user.email, verify_url):
        return jsonify({"message": "Verification email sent!"}), 200
    print(f"something went wrong")


@api_bp.route("/update_profile", methods=["POST"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    updated_fields = {}

    # Check and validate each field if present
    name = data.get("name")
    email = data.get("email")
    website = data.get("website")

    if name:
        user.name = name.strip()
        updated_fields["name"] = user.name

    if email:
        try:
            validate_email(email)
        except EmailNotValidError:
            return jsonify({"message": "Invalid email format"}), 400
        # Optionally check if email is already taken by another user
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({"message": "Email already in use"}), 409
        user.email = email.strip().lower()
        updated_fields["email"] = user.email
        user.is_verified = False

    if website:
        user.website = website.strip()
        updated_fields["website"] = user.website

    if not updated_fields:
        return jsonify({"message": "No valid fields to update"}), 400

    db.session.commit()
    return (
        jsonify({"message": "Profile updated successfully", "user": user.to_dict()}),
        200,
    )


@api_bp.route("/change_password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    current_password = data.get("currentPassword", "")
    new_password = data.get("newPassword", "")

    if not current_password or not new_password:
        return jsonify({"error": "Current and new password are required"}), 400

    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    is_valid, message = validate_password(new_password)
    if not is_valid:
        return jsonify({"error": message}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"}), 200


@api_bp.route("/signout", methods=["POST"])
@jwt_required()
def signout():
    resp = jsonify({"message": "Sign out successful"})
    unset_jwt_cookies(resp)
    return resp, 200


@api_bp.route("/delete_account", methods=["POST"])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    resp = jsonify({"message": "Account deleted successfully"})
    unset_jwt_cookies(resp)
    return resp, 200
