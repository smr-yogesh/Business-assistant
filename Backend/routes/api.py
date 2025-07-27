from flask import Blueprint, jsonify, request
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
from model.user import User

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

        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        resp = jsonify({"message": "User created successfully", "user": user.to_dict()})
        set_access_cookies(resp, access_token)
        return resp, 201

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


@api_bp.route("/signout", methods=["POST"])
def signout():
    resp = jsonify({"message": "Sign out successful"})
    unset_jwt_cookies(resp)
    return resp, 200
