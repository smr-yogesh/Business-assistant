# Business Chatbot System 🧠💬

A full-stack AI chatbot platform where business owners can submit their company information, and customers can chat with an intelligent assistant that understands that specific business. This system uses OpenAI embeddings and ChromaDB to provide document-aware responses.

---

## 🚀 Features

### ✅ Implemented So Far
- **Flask Backend API** for:
  - Adding business-specific content
  - Chatting with contextual understanding
- **OpenAI Embeddings** (`text-embedding-ada-002`)
- **ChromaDB** as vector database (per-business collections)
- **Text chunking + semantic search**
- Input normalization (handles smart quotes, symbols, etc.)
- Clean API routes (`/add_document`, `/chat`)
- Modular backend (utils, embeddings, vector store separated)
- Basic frontend folder structure initialized
- Ready for multi-business separation (`business_id` tagging)

---

## 🏗️ Upcoming (In Progress / Planned)

### 🔧 Backend
- ✅ Authentication system (JWT / API keys) to isolate businesses
- ⏳ Rate limiting, logging, and error monitoring
- 🔐 Admin dashboard (Flask or separate frontend)

### 💻 Frontend
- ✅ **Customer Chat Widget** (embed into external websites)
- ⏳ **Business Owner UI** (submit/edit content, view conversations)
- ⏳ Real-time feedback (streamed answers, status indicators)

### 🌐 Deployment
- 🔄 Dockerized backend
- ☁️ Deployment to AWS (EC2 or Elastic Beanstalk) or Railway
- 🔐 Secret management with `.env` and Git ignore

---

## 📦 File Structure

project-root/
├── Backend/
│ ├── app.py # Main Flask app
│ ├── routes/ # API routes
│ ├── utils/
│ │ ├── embeddings.py # OpenAI embedding logic
│ │ ├── chroma_utils.py # ChromaDB collection handling
│ │ └── text_utils.py # Unicode/quote normalization
│ ├── templates/ # Future use (Flask frontend)
│ ├── static/ # JS/CSS for owner interface
│ └── .env # (ignored) contains API key
│
├── Frontend/
│ ├── chat-widget/ # Public embed chat
│ ├── owner-ui/ # Business dashboard (in progress)
│ └── templates/ # HTML templates if using Flask
│
└── README.md

---

## 🧪 API Usage

### ➕ Add Business Content

``` http
POST /add_document
Content-Type: application/json

{
  "business_id": "nimbus-noodles",
  "content": "Nimbus Noodles is a futuristic, cloud-themed noodle bar..."
}
```

### 💬Chat with Assistant

``` http
POST /chat
Content-Type: application/json

{
  "business_id": "nimbus-noodles",
  "query": "What exactly is a cloud-themed noodle bar?"
}

```
### 💡 Tech Stack

- Python 3 / Flask

- ChromaDB (vector DB)

- OpenAI Embeddings

- HTML/CSS/JS (Frontend in progress)

- PostgreSQL (optional for business metadata later)

- Planned: AWS S3, OpenSearch (replaced due to cost), Auth0/Firebase

### ✅ To Run Locally
cd Backend
pip install -r requirements.txt
python app.py

Backend runs at: http://localhost:5000