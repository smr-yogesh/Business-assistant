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
from config import Config
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
app.config.from_object(Config)

app.register_blueprint(api_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(dash_bp)


CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/widget")
def widget():
    return render_template("chat_widget.html")


@app.route("/v")
def v():
    return render_template("verification.html")


@app.context_processor
def inject_now():
    return {"now": datetime.now()}


if __name__ == "__main__":
    app.run(debug=True)
