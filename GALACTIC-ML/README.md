# 🌌 GALACTIC ML — One Universe, Four Missions, Powered by Gemma 4

> **Tagline for jury:** *"From raw CSV to job-ready ML engineer — in one sci-fi universe."*

All 4 repos (G1–G4) downloaded, upgraded from Gemini to **Gemma 4 (`gemma-4-12b-it`)**, and arranged as a single story you can demo in 5 minutes.

## 🚀 The 4 Modules (in demo order)

| # | Code | New Name | What it does | Old model → New |
|---|------|----------|--------------|-----------------|
| 1 | `../G1` | **01-Notebook-Forge** | Upload CSV → get production Jupyter notebook (18 cells) + AI theory + GridSearchCV tuning | `gemini-pro` → `gemma-4-12b-it` |
| 2 | `../G2` | **02-Dracarys-3D** | 3D ML visualization studio (Three.js) — neural nets, clustering, decision boundaries, loss landscapes + AI chat | `gemini-2.5-flash` → `gemma-4-12b-it` |
| 3 | `../G3` | **03-NOVA-7-Learn** | Sci-fi tutor: study guide (5 tabs), radar charts, hyperparam simulator, quizzes, XP | `gemini-2.5-flash` → `gemma-4-12b-it` |
| 4 | `../G4` | **04-Interview-Architect** | Generates exactly 100 interview Q&A + coding challenge, streams + PDF export | `gemini-3-pro-preview` → `gemma-4-12b-it` |

**User journey:** Create → Visualize → Learn → Get Hired.

## 🧠 Why Gemma 4? (say this to jury in 30 sec)

- **Open + Apache 2.0** (Gemini is closed) — you can self-host, fine-tune, show weights on HuggingFace `google/gemma-4-12b-it`.
- **256K context** (vs 32K on old gemini-pro) — critical for 100-Q interview + full notebook generation.
- **Multimodal + multilingual (140+ langs)** — text/image/audio in, text out. Encoder-free 12B Unified = fast on consumer GPU.
- **Same API** — `await ai.models.generateContent({ model: "gemma-4-12b-it", ... })` via `@google/genai`. One-line switch, zero rewrite.
- **Family:** `e2b/e4b` (edge) → `12b` (balanced, our default) → `26b-a4b` (MoE efficient) → `31b` (max quality).

## 📁 Repo Layout

```
HACKTOBERFEST/
├── G1/                  # patched — Notebook Forge (Gemma 4)
├── G2/                  # patched — Dracarys 3D (Gemma 4)
├── G3/                  # patched — NOVA-7 Learn (Gemma 4)
├── G4/                  # patched — Interview Architect (Gemma 4)
└── GALACTIC-ML/
    ├── README.md            # you are here
    ├── ARCHITECTURE.md      # diagrams + data flow
    ├── JURY-GUIDE.md        # 5-min pitch script + Q&A
    ├── GEMMA-4-MIGRATION.md # exact files changed
    ├── DEMO-CHECKLIST.md    # pre-demo checks
    ├── .env.example         # one key for all 4
    ├── run-all.sh           # run all 4 with one command
    ├── shared/
    │   ├── gemma.config.ts  # single source of truth (TS)
    │   └── gemma.config.py  # single source of truth (Py)
    └── modules/README.md    # per-module run instructions
```

## ⚡ Quick Start (all 4)

```bash
# 1. One key for everything (get at https://aistudio.google.com/)
cp GALACTIC-ML/.env.example .env
# edit: GEMMA_API_KEY=AIza...  GEMMA_MODEL=gemma-4-12b-it

# 2. Run each (4 terminals):
cd G1 && npm install && npm run dev        # :5173 — Notebook Forge
cd G2 && npm install && npm run dev        # :3000 — Dracarys 3D
cd G3 && npm install && npm run dev        # :3000 — NOVA-7 Learn
cd G4 && npm install && npm run dev        # :3000 — Interview Architect

# or:
bash GALACTIC-ML/run-all.sh
```

Python part (G1 registry):
```bash
pip install -r G1/requirements.txt
python G1/comprehensive_model_registry.py
```

## 🎤 5-Minute Jury Flow

1. **Hook (30s):** "ML learning is broken — tutorials → black-box models → interview fear. Galactic ML fixes end-to-end."
2. **G1 (1m):** Upload CSV → show 18-cell notebook + Gemma theory + comparison chart.
3. **G2 (1m):** Type "ResNet" → 3D neural net appears, rotate, AI explains overfitting.
4. **G3 (1m):** "Search Transformer" → 5-tab study guide, radar, simulator, quiz.
5. **G4 (1m):** "Machine Learning" → streams 100 Q&A, export PDF.
6. **Close (30s):** "One Gemma 4 brain across all four. Open, 256K, multimodal. Create → See → Learn → Hired."

Full script: see `JURY-GUIDE.md`.

## 🔑 Env (unified)

```env
GEMMA_API_KEY=your_key_here
GEMMA_MODEL=gemma-4-12b-it
# fallbacks still work: GEMINI_API_KEY, VITE_GEMMA_API_KEY, etc.
```

See `.env.example` + `shared/gemma.config.ts`.

## ✅ What was changed (Gemma 4 migration)

See `GEMMA-4-MIGRATION.md` for file-by-file diff. TL;DR:
- `G1/src/services/geminiService.ts` → REST URL now `.../gemma-4-12b-it:generateContent`
- `G2/services/geminiService.ts` → `MODEL_NAME='gemma-4-12b-it'`
- `G3/constants.ts` → `MODEL_NAME='gemma-4-12b-it'` + NOVA prompt mentions Gemma 4
- `G4/services/geminiService.ts` → `gemini-3-pro-preview` → `gemma-4-12b-it`, `maxOutputTokens` 8192→16384
- All `vite.config.ts` now accept `GEMMA_API_KEY` + `GEMMA_MODEL`
- UI: "Powered by Gemini" → "Powered by Gemma 4", "GEMINI UPLINK" → "GEMMA 4 UPLINK"
