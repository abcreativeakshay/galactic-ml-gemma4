# 🌌 Galactic ML — Gemma 4 (G1+G2+G3+G4 Unified)

> From raw CSV to job-ready ML engineer — in one sci-fi universe.

This repo merges 4 projects and upgrades **every model to Gemma 4 (`gemma-4-12b-it`)**.

- `G1/` — 01-Notebook-Forge: CSV → production Jupyter notebook (18 cells) + GridSearchCV
- `G2/` — 02-Dracarys-3D: Three.js ML visualization studio + AI chat
- `G3/` — 03-NOVA-7-Learn: sci-fi tutor, 5-tab study guides, quizzes, XP
- `G4/` — 04-Interview-Architect: exactly 100 interview Q&A + PDF
- `GALACTIC-ML/` — jury-ready docs: start here → `GALACTIC-ML/README.md`

## Quick start

```bash
cp GALACTIC-ML/.env.example G1/.env   # same for G2/G3/G4, set GEMMA_API_KEY
# get key: https://aistudio.google.com/

cd G1 && npm install && npm run dev        # :5173
cd G2 && npm install && npm run dev -- --port 3001
cd G3 && npm install && npm run dev -- --port 3002
cd G4 && npm install && npm run dev -- --port 3003
```

Docs: `GALACTIC-ML/README.md` (overview) → `ARCHITECTURE.md` → `JURY-GUIDE.md` (5-min pitch) → `GEMMA-4-MIGRATION.md` (what changed) → `DEMO-CHECKLIST.md`.

One model everywhere: `GEMMA_MODEL=gemma-4-12b-it` (alts: `gemma-4-31b-it`, `gemma-4-26b-a4b-it`, `gemma-4-e4b-it`).
