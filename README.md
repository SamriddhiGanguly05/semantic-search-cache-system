# Trademarkia - Semantic Search API

A high-performance semantic search engine using FastAPI, SentenceTransformers, Faiss indexing, and Scikit-Learn (GMM). It includes a semantic caching layer designed to quickly return cached responses for semantically similar queries.

## 🚀 Features

- **FastAPI Backend:** Provides robust and fast REST APIs endpoints for querying, cache stats, and cache flushing. Added CORS support for the web dashboard.
- **Semantic Caching (`SemanticCache`):** Compares inbound query embeddings to cached requests using Cosine Similarity (`threshold = 0.85`), preventing expensive pipeline tasks and returning near-instant results for similar intents.
- **Faiss Vector Indexing:** For fast nearest-neighbor search of unstructured text embeddings.
- **Gaussian Mixture Model (GMM):** Predicts dominating cluster labels for queries using pre-trained `scikit-learn` models.
- **Semantic Explorer Dashboard:** A premium dark-mode, animated HTML/JS frontend application built to easily visualize and test API endpoints natively in your browser.

## 📂 Project Structure

```bash
Trademarkia/
├── api/             # FastAPI App configuration & routing
│   └── main.py      # Core backend API endpoints (POST /query, GET /cache/stats...)
├── cache/           # Semantic Cache module (skips computation for similar intents)
│   └── semantic_cache.py
├── models/          # Persistent embeddings, clustering models, and vectors
│   ├── cluster_model.pkl
│   ├── news_index.faiss
│   └── news_embeddings.npy
├── utils/           # Search Logic bindings 
│   └── search_engine.py
├── dashboard/       # 🎨 Custom Premium UI to Test APIs
│   ├── index.html
│   ├── style.css
│   └── app.js
├── README.md
└── requirements.txt # Python dependencies
```

## ⚙️ Getting Started

### 1. Install Requirements
Create a virtual environment (recommended) and install the requirements:
```bash
pip install -r requirements.txt
```

### 2. Run the Backend API Server
Start the FastAPI server via Uvicorn. The `api.main` file contains the `app` instance.
```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
*The API will be locally served at [http://localhost:8000](http://localhost:8000)*

### 3. Open the Dashboard
Navigate to the `dashboard/` directory and open the `index.html` file in any modern web browser to interact with the API effortlessly. 

Because CORS configuration has been applied to the FastAPI backend, you can literally just double-click `dashboard/index.html` on your computer—no local server needed for the frontend!

---

## 🔌 API Endpoints Reference

### 1. Search Query
- **URL**: `/query`
- **Method**: `POST`
- **Body**: `{"query": "your topic here"}`
- **Description**: Returns nearest neighbor document indices and assigns a GMM cluster. Will check `SemanticCache` first utilizing cosine similarity > 0.85 threshold.

### 2. Cache Statistics
- **URL**: `/cache/stats`
- **Method**: `GET`
- **Description**: Returns total records stored, hits, misses, and the overall hit rate efficiency in the cache.

### 3. Clear Cache
- **URL**: `/cache`
- **Method**: `DELETE`
- **Description**: Flushes and resets the system's `SemanticCache` memory store.
