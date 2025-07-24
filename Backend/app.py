from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from utils.embeddings import get_embedding
from utils.chunking import chunk_text
from utils.chroma_utils import get_or_create_collection, query_chunks, add_chunks
from utils.llm import get_answer
from routes.api import api_bp
from routes.dashboard import dash_bp
from routes.auth import auth_bp
from datetime import datetime, timedelta
from utils.extensions import db, bcrypt, jwt
import os

import openai


openai.api_key = "YOUR_OPENAI_KEY"

TEMPLATE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../frontend/templates")
)
STATIC_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../frontend/static")
)
app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)
app.register_blueprint(api_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(dash_bp)
# Configuration
app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY", "your-secret-key-change-in-production"
)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "jwt-secret-string-change-in-production"
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/signup")
def signup():
    return render_template("signupp.html")


@app.route("/signin")
def signin():
    return render_template("signin.html")


@app.route("/widget")
def widget():
    return render_template("chat_widget.html")


@app.context_processor
def inject_now():
    return {"now": datetime.now()}


if __name__ == "__main__":
    app.run(debug=True)
