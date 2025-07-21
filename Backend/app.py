from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from utils.embeddings import get_embedding
from utils.chunking import chunk_text
from utils.chroma_utils import get_or_create_collection, query_chunks, add_chunks
from utils.llm import get_answer
from datetime import datetime
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
CORS(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/signup")
def signup():
    return render_template("signup.html")


@app.route("/signin")
def signin():
    return render_template("signin.html")


@app.route("/widget")
def widget():
    return render_template("chat_widget.html")


@app.route("/add_document", methods=["POST"])
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


@app.route("/chat", methods=["POST"])
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


@app.context_processor
def inject_now():
    return {"now": datetime.now()}


if __name__ == "__main__":
    app.run(debug=True)
