# ✅ DEMO CHECKLIST — Night Before + Morning Of

## Night Before
- [ ] `GEMMA_API_KEY` from https://aistudio.google.com/ — test with `curl` or one module
- [ ] `npm install` in G1/G2/G3/G4 (Node 18+)
- [ ] Sample CSV ready (e.g., Iris / Titanic — small, <1MB)
- [ ] Test prompts ready: "ResNet", "Transformer", "Machine Learning"
- [ ] Chrome 90+ with WebGL2 (for G2 3D)
- [ ] PDFs export works (disable ad-blocker)
- [ ] Ports free: G1 :5173, G2/G3/G4 :3000 (run one at a time or change `--port`)

## Morning Of (30 min before)
- [ ] `cp GALACTIC-ML/.env.example G1/.env` (and G2/G3/G4) — same key everywhere
- [ ] Run G1, open, upload CSV once to warm cache
- [ ] Run G2, search "MLP", check 3D rotates at 60fps
- [ ] Run G3, search "Random Forest", check 5 tabs + quiz
- [ ] Run G4, generate "Python" (short test), check streaming
- [ ] Close extra tabs, hide bookmarks, zoom 125% for projector
- [ ] Print `JURY-GUIDE.md` Q&A on phone as backup

## If Internet Dies
- Show pre-generated `.ipynb` from G1 + pre-exported PDF from G4 + screenshots of 3D.
- Say: "Gemma 4 also runs locally via Ollama `ollama run gemma4:12b` / LM Studio — open weights advantage over Gemini."

## If API Quota Hits
- Switch `GEMMA_MODEL=gemma-4-e4b-it` (lighter) or show cached outputs.
- Say: "That's why env override exists — one var, no code change."
