import numpy as np
import faiss
import joblib
from sentence_transformers import SentenceTransformer

from cache.semantic_cache import SemanticCache

# load models
model = SentenceTransformer("all-MiniLM-L6-v2")

index = faiss.read_index("models/news_index.faiss")

gmm = joblib.load("models/cluster_model.pkl")

cache = SemanticCache()


def search(query):

    query_embedding = model.encode(query)

    cached, score = cache.lookup(query_embedding)

    if cached:
        return {
            "query": query,
            "cache_hit": True,
            "matched_query": cached["query"],
            "similarity_score": float(score),
            "result": cached["result"],
            "dominant_cluster": cached["cluster"]
        }

    distances, indices = index.search(np.array([query_embedding]), 5)

    results = indices[0].tolist()

    cluster = int(np.argmax(gmm.predict_proba([query_embedding])))

    cache.store(query, query_embedding, results, cluster)

    return {
        "query": query,
        "cache_hit": False,
        "matched_query": None,
        "similarity_score": 0,
        "result": results,
        "dominant_cluster": cluster
    }