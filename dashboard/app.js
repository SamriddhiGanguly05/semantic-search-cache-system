const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
    // Initial fetch of stats
    fetchStats();
    
    // Event Listeners
    document.getElementById("search-btn").addEventListener("click", performSearch);
    document.getElementById("query-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") performSearch();
    });
    
    document.getElementById("refresh-stats-btn").addEventListener("click", () => {
        const btn = document.getElementById("refresh-stats-btn");
        const icon = btn.querySelector("i");
        icon.classList.add("fa-spin");
        fetchStats().then(() => {
            setTimeout(() => icon.classList.remove("fa-spin"), 500);
        });
    });
    
    document.getElementById("clear-cache-btn").addEventListener("click", clearCache);
});

async function fetchStats() {
    try {
        const res = await fetch(`${API_BASE}/cache/stats`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Update DOM
        document.getElementById("stat-entries").innerText = data.total_entries;
        
        // Animate counting for hits/misses for better UX
        animateValue(document.getElementById("stat-hits"), parseInt(document.getElementById("stat-hits").innerText), data.hit_count, 500);
        animateValue(document.getElementById("stat-misses"), parseInt(document.getElementById("stat-misses").innerText), data.miss_count, 500);
        
        const ratePercent = (data.hit_rate * 100).toFixed(1);
        document.getElementById("stat-rate").innerText = ratePercent + "%";
        document.getElementById("hit-rate-bar").style.width = ratePercent + "%";
        
    } catch (err) {
        console.error("Error fetching stats:", err);
    }
}

async function clearCache() {
    if (!confirm("Are you sure you want to clear the semantic cache?")) return;
    try {
        await fetch(`${API_BASE}/cache`, { method: "DELETE" });
        fetchStats();
        // Reset query view
        document.getElementById("results-section").classList.add("hidden");
        document.getElementById("query-input").value = "";
    } catch (err) {
        console.error("Error clearing cache:", err);
    }
}

async function performSearch() {
    const queryInput = document.getElementById("query-input");
    const query = queryInput.value.trim();
    if (!query) return;
    
    const uiLoading = document.getElementById("loading");
    const uiResults = document.getElementById("results-section");
    const searchBtn = document.getElementById("search-btn");
    
    // UI Loading state
    uiLoading.classList.remove("hidden");
    uiResults.classList.add("hidden");
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    try {
        // Send actual query to FastAPI backend
        const res = await fetch(`${API_BASE}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });
        
        if (!res.ok) throw new Error("API returned an error");
        
        const data = await res.json();
        
        // Render UI
        renderResults(data);
        
        // Update stats automatically
        fetchStats();
        
    } catch (err) {
        console.error("Search failed:", err);
        alert("Failed to connect to the backend. Is FastAPI running on port 8000?");
    } finally {
        // Restore UI
        uiLoading.classList.add("hidden");
        searchBtn.disabled = false;
        searchBtn.innerHTML = 'Analyze';
    }
}

function renderResults(data) {
    const uiResults = document.getElementById("results-section");
    
    // 1. Cache Badge
    const badge = document.getElementById("cache-badge");
    badge.className = "badge " + (data.cache_hit ? "hit" : "miss");
    badge.innerHTML = data.cache_hit ? '<i class="fa-solid fa-bolt"></i> Cache Hit' : '<i class="fa-solid fa-microchip"></i> Cache Miss';
    
    // 2. Query Info
    document.getElementById("res-query").innerText = data.query;
    document.getElementById("res-matched").innerText = data.matched_query || "N/A (Computed Live)";
    
    // Similarity Score Formatting
    const scoreVal = document.getElementById("res-score");
    if (data.cache_hit) {
        scoreVal.innerText = (data.similarity_score * 100).toFixed(2) + "% Match";
        scoreVal.style.color = "var(--success)";
    } else {
        scoreVal.innerText = "New Embedding Analyzed";
        scoreVal.style.color = "var(--text-muted)";
    }
    
    // 3. Cluster Info
    document.getElementById("res-cluster").innerText = data.dominant_cluster;
    
    // 4. Documents (Indices)
    const indicesContainer = document.getElementById("res-indices");
    indicesContainer.innerHTML = "";
    
    if (data.result && data.result.length > 0) {
        data.result.forEach((idx, i) => {
            const card = document.createElement("div");
            card.className = "doc-card";
            card.style.animationDelay = `${i * 0.1}s`;
            card.style.animation = "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards";
            card.style.opacity = "0";
            
            card.innerHTML = `
                <div class="doc-icon"><i class="fa-regular fa-file-lines"></i></div>
                <div>
                    <div class="doc-label">Document Index</div>
                    <div class="doc-id">#${idx}</div>
                </div>
            `;
            indicesContainer.appendChild(card);
        });
    } else {
        indicesContainer.innerHTML = "<p class='subtitle'>No relevant documents found.</p>";
    }
    
    // Reveal results
    uiResults.classList.remove("hidden");
}

// Utility for smooth number counting animation
function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
