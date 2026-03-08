import streamlit as st
import requests
import json
import os

# Define the API endpoint base url
API_BASE = os.environ.get("API_URL", "http://localhost:8000")

st.set_page_config(
    page_title="Semantic Search Dashboard",
    page_icon="🔍",
    layout="wide"
)

st.title("🔍 Semantic Search Dashboard")
st.markdown("A lightweight, interactive UI for exploring the FastAPI semantic search engine and caching layer.")

# --- Sidebar: Cache Operations ---
st.sidebar.header("⚙️ Cache Management")

# fetch cache stats
if st.sidebar.button("Refresh Cache Stats"):
    try:
        res = requests.get(f"{API_BASE}/cache/stats")
        if res.status_code == 200:
            stats = res.json()
            st.sidebar.metric("Total Entries", stats.get("total_entries", 0))
            st.sidebar.metric("Cache Hits", stats.get("hit_count", 0))
            st.sidebar.metric("Cache Misses", stats.get("miss_count", 0))
            st.sidebar.metric("Hit Rate", f"{stats.get('hit_rate', 0.0) * 100:.2f}%")
        else:
            st.sidebar.error("Failed to fetch stats.")
    except Exception as e:
        st.sidebar.error(f"Error connecting to backend: {e}")

# clear cache
if st.sidebar.button("Clear Cache", type="primary"):
    try:
        res = requests.delete(f"{API_BASE}/cache")
        if res.status_code == 200:
            st.sidebar.success("Cache cleared successfully!")
        else:
            st.sidebar.error("Failed to clear cache.")
    except Exception as e:
        st.sidebar.error(f"Error connecting to backend: {e}")

# --- Main Page: Search Interface ---
st.subheader("Explore the Semantic Cache")
query_text = st.text_input("Enter your natural language query:", placeholder="e.g., artificial intelligence models")

if st.button("Search", type="primary"):
    if not query_text.strip():
        st.warning("Please enter a query.")
    else:
        with st.spinner("Analyzing query and checking semantic cache..."):
            try:
                response = requests.post(
                    f"{API_BASE}/query",
                    json={"query": query_text.strip()},
                    timeout=10
                )
                if response.status_code == 200:
                    data = response.json()
                    
                    # Columns to display key flags
                    col1, col2, col3 = st.columns(3)
                    
                    cache_hit = data.get("cache_hit", False)
                    
                    if cache_hit:
                        col1.success("⚡ Cache Hit!")
                        col2.metric("Similarity Score", f"{data.get('similarity_score', 0.0) * 100:.2f}%")
                        col3.info(f"Matched Query: {data.get('matched_query')}")
                    else:
                        col1.warning("💽 Cache Miss")
                        col2.metric("Similarity Score", "N/A (New search)")
                        col3.info(f"Matched Query: None")
                    
                    st.divider()
                    
                    # Additional Details
                    st.markdown(f"**Dominant Cluster Segment:** `{data.get('dominant_cluster')}`")
                    
                    st.markdown("**Nearest Neighbor Results (Indices):**")
                    results = data.get("result", [])
                    if results:
                        st.json(results)
                    else:
                        st.write("No matching results found in index.")
                        
                else:
                    st.error(f"API Error - Status Code {response.status_code}: {response.text}")
                    
            except requests.exceptions.ConnectionError:
                st.error("Failed to connect to the backend API. Is FastAPI running on http://localhost:8000?")
            except Exception as e:
                st.error(f"An error occurred: {e}")
