# 🎤 JURY GUIDE — Say This, Show This (5 min)

## 30-sec Hook (memorize)
> "Learning ML today is fragmented — you watch tutorials, you run black-box notebooks, you fail interviews. **Galactic ML is one universe where you Create, Visualize, Learn, and Get Hired — all powered by one open brain: Gemma 4.**"

## Demo Script (4 min, 1 min per module)

### 1️⃣ Notebook Forge (G1) — "Create" (60s)
- **Say:** "I upload any CSV. Gemma 4 detects classification vs regression, suggests target + models, then writes me a full 18-cell production notebook — EDA, preprocessing, GridSearchCV tuning, comparison charts, deployment code."
- **Show:** Upload CSV → AI analysis box → select 3 models → Generate → scroll theory + cheat sheet → Download `.ipynb`.
- **Jury line:** "Old version used closed `gemini-pro`. Now `gemma-4-12b-it` — open, 256K context, same API."

### 2️⃣ Dracarys 3D (G2) — "See" (60s)
- **Say:** "ML is invisible. Here I type 'ResNet' and Gemma converts words to 3D JSON, rendered live. I rotate, tweak layers, ask AI why loss spikes."
- **Show:** Search → 3D net appears → drag to rotate → open GEMMA 4 UPLINK chat → ask "overfitting?" → show optimization.
- **Jury line:** "Three.js 60fps + Gemma reasoning. From abstract math to glowing spheres and signals."

### 3️⃣ NOVA-7 Learn (G3) — "Learn" (60s)
- **Say:** "This is my AI Officer. I say 'Search Transformer' and get a 5-tab mission: math, radar stats, runnable PyTorch skeleton, real-world pitfalls, quiz with XP."
- **Show:** Search → Core Mechanics (KaTeX) → Tactical radar → Engine Room simulator drag → Quiz answer → XP up.
- **Jury line:** "Adaptive Cadet→Overseer levels. Same Gemma 4, different system prompt."

### 4️⃣ Interview Architect (G4) — "Hired" (60s)
- **Say:** "Finally, I type 'Machine Learning' and Gemma streams exactly 100 questions — 10 deep, 40 core, 50 rapid-fire — plus coding challenge, exportable to PDF."
- **Show:** Enter topic → Start → streaming text → scroll to Q100 → Export PDF.
- **Jury line:** "Needs long context — Gemma 4's 256K window + 16K output tokens makes 100-Q possible."

## 30-sec Close (memorize)
> "Four apps, one Gemma 4 brain. Open weights, Apache 2.0, multimodal, multilingual. **Create → See → Learn → Hired.** That's Galactic ML."

## ❓ Expected Jury Q&A (with answers)

**Q: Why Gemma 4 over Gemini / GPT?**
A: Open (can fine-tune/host), 256K context for long docs, cheaper inference, same Gemini API so 1-line switch. Plus story: open science fits education.

**Q: What did you actually change?**
A: 4 service files + 1 constants + 3 vite configs + UI labels. Model string `gemini-*` → `gemma-4-12b-it`, REST URL updated, max tokens 8K→16K for 100-Q, prompts now say "powered by Gemma 4". See `GEMMA-4-MIGRATION.md`.

**Q: How does 3D help learning?**
A: Dual coding theory — visual + verbal. Seeing centroids move / signals flow builds intuition faster than equations alone. Plus AI explains what you see.

**Q: How do you ensure 100 questions?**
A: System prompt enforces Q1-Q100 + brevity tiers (detailed → concise → 1-sentence) to fit context + 16K output tokens + streaming so user sees progress.

**Q: Scaling / prod?**
A: Vercel/Netlify static, Supabase for notebooks, rate-limit API, cache theory, fallback to `gemma-4-e4b-it` on edge or `31b` for max quality. All via env `GEMMA_MODEL`.

**Q: What would you do next?**
A: Unify auth + Supabase across all 4, RAG over docs, fine-tune Gemma 4 on ML textbooks, add voice + AR/VR training viz.

## 🧠 One-slide Summary (if they ask for architecture)
"React frontends → @google/genai → Gemma 4 12B-IT (256K) → domain prompts (JSON schema / streaming) → rich render (Three.js/Recharts/KaTeX/PDF) + Python sklearn registry for real training."
