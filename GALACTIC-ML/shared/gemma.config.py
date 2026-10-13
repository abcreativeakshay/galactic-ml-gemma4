"""
GALACTIC ML — Single source of truth for Gemma 4 (Python)
Canonical: gemma-4-26b-a4b-it
"""
import os

GEMMA_MODEL = os.getenv("GEMMA_MODEL") or os.getenv("GEMINI_MODEL") or "gemma-4-26b-a4b-it"
GEMMA_API_KEY = os.getenv("GEMMA_API_KEY") or os.getenv("GEMINI_API_KEY") or ""

GEMMA_INFO = {
    "model": GEMMA_MODEL,
    "family": "Gemma 4 (Google DeepMind, Apache 2.0)",
    "context": "256K tokens",
    "variants": ["gemma-4-26b-a4b-it", "gemma-4-31b-it", "gemma-4-31b-it"],
    "api_url": f"https://generativelanguage.googleapis.com/v1beta/models/{GEMMA_MODEL}:generateContent",
}

def call_gemma(prompt: str, temperature: float = 0.7, max_tokens: int = 8192) -> str:
    """Minimal REST call to Gemma 4 via Gemini API. Same key works."""
    import json, urllib.request
    if not GEMMA_API_KEY:
        raise ValueError("Set GEMMA_API_KEY env var")
    url = f"{GEMMA_INFO['api_url']}?key={GEMMA_API_KEY}"
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens},
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
    return data["candidates"][0]["content"]["parts"][0]["text"]

if __name__ == "__main__":
    print(f"GALACTIC ML Gemma config OK: {GEMMA_MODEL}")
    print(f"URL: {GEMMA_INFO['api_url']}")
