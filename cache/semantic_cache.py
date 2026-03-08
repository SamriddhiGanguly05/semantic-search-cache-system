import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class SemanticCache:

    def __init__(self, threshold=0.85):
        self.cache = []
        self.threshold = threshold
        self.hit_count = 0
        self.miss_count = 0

    def lookup(self, query_embedding):

        if len(self.cache) == 0:
            return None, 0

        cached_embeddings = np.array([c["embedding"] for c in self.cache])

        sims = cosine_similarity([query_embedding], cached_embeddings)[0]

        best_idx = np.argmax(sims)
        best_score = sims[best_idx]

        if best_score >= self.threshold:
            self.hit_count += 1
            return self.cache[best_idx], best_score

        self.miss_count += 1
        return None, best_score

    def store(self, query, embedding, result, cluster):

        self.cache.append({
            "query": query,
            "embedding": embedding,
            "result": result,
            "cluster": cluster
        })

    def stats(self):

        total = self.hit_count + self.miss_count

        hit_rate = self.hit_count / total if total else 0

        return {
            "total_entries": len(self.cache),
            "hit_count": self.hit_count,
            "miss_count": self.miss_count,
            "hit_rate": hit_rate
        }

    def clear(self):
        self.cache = []
        self.hit_count = 0
        self.miss_count = 0