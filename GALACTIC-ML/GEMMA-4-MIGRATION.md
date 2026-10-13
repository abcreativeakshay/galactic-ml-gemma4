# 🔄 GEMMA 4 Migration — Exact Changes

**Canonical model:** `gemma-4-12b-it` (12B Unified, encoder-free, 256K ctx, Apache 2.0)
**Alternatives:** `gemma-4-31b-it` (dense max), `gemma-4-26b-a4b-it` (MoE efficient), `gemma-4-e4b-it`/`e2b-it` (edge)
**API:** Same Gemini API (`generativelanguage.googleapis.com` + `@google/genai`). Same key works.

## Files Changed

### G1 — Notebook Forge
- `G1/src/services/geminiService.ts` **rewritten**:
  - BEFORE: `const GEMINI_API_URL='.../gemini-pro:generateContent'`
  - AFTER: `export const GEMMA_MODEL = import.meta.env.VITE_GEMMA_MODEL || ... || 'gemma-4-12b-it'`
  - `const GEMMA_API_URL = .../models/${GEMMA_MODEL}:generateContent`
  - Added `generationConfig: { temperature:0.7, maxOutputTokens:8192 }`
  - Prompts prefixed "You are powered by Gemma 4..."
  - Errors: `Gemma 4 API error`
  - Added backwards exports `GEMINI_MODEL`, `MODEL_NAME`
- `G1/src/services/gemmaService.ts` **created** (copy, canonical name)
- `G1/src/App.tsx:947`:
  - BEFORE: `Powered by Gemini AI`
  - AFTER: `Powered by Gemma 4 (gemma-4-12b-it)`

### G2 — Dracarys 3D
- `G2/services/geminiService.ts` **rewritten**:
  - BEFORE: `const MODEL_NAME='gemini-2.5-flash'`, `new GoogleGenAI({apiKey: process.env.API_KEY})`
  - AFTER: `export const GEMMA_MODEL = process.env.GEMMA_MODEL || process.env.GEMINI_MODEL || 'gemma-4-12b-it'`, `export const MODEL_NAME=GEMMA_MODEL`, apiKey fallback `API_KEY||GEMMA_API_KEY||GEMINI_API_KEY`, all `model: MODEL_NAME` → `model: GEMMA_MODEL`, systemInstruction mentions Gemma 4
- `G2/services/gemmaService.ts` **created**
- `G2/vite.config.ts`:
  - BEFORE: only `GEMINI_API_KEY`
  - AFTER: exposes `GEMMA_API_KEY`, `GEMMA_MODEL`, `GEMINI_MODEL` (all fallback to `gemma-4-12b-it`)
- `G2/App.tsx:320`: `Google Gemini APIs` → `Gemma 4 (gemma-4-12b-it, Google DeepMind open model) APIs`
- `G2/App.tsx:925`: `GEMINI UPLINK` → `GEMMA 4 UPLINK`

### G3 — NOVA-7 Learn
- `G3/constants.ts` **rewritten**:
  - BEFORE: `export const MODEL_NAME="gemini-2.5-flash"`
  - AFTER: `export const GEMMA_MODEL="gemma-4-12b-it"`, `MODEL_NAME=GEMMA_MODEL`, `GEMINI_MODEL=GEMMA_MODEL`, `NOVA_SYSTEM_PROMPT` starts "powered by Gemma 4..."
- `G3/gemma.config.ts` **created** (copy for clarity)
- `G3/services/geminiService.ts` **rewritten**: uses `ACTIVE_MODEL = process.env.GEMMA_MODEL || MODEL_NAME || ...`, apiKey fallback, error `Gemma 4 Uplink Error`
- `G3/services/gemmaService.ts` **created**
- `G3/vite.config.ts`: same GEMMA env exposure as G2

### G4 — Interview Architect
- `G4/services/geminiService.ts` **rewritten**:
  - BEFORE: `const model="gemini-3-pro-preview"`, `maxOutputTokens:8192`
  - AFTER: `export const GEMMA_MODEL = process.env.GEMMA_MODEL || ... || "gemma-4-12b-it"`, `model=GEMMA_MODEL`, `maxOutputTokens:16384` (Gemma 4 long output for 100-Q), systemInstruction suffix "powered by Gemma 4 (256K context)"
- `G4/services/gemmaService.ts` **created**
- `G4/vite.config.ts`: same GEMMA env exposure

## How to Switch Variant (one env var)
```bash
GEMMA_MODEL=gemma-4-31b-it       # max quality
GEMMA_MODEL=gemma-4-26b-a4b-it   # MoE efficient, great for 100-Q
GEMMA_MODEL=gemma-4-e4b-it       # edge / fast demo
```
No code change needed.

## Verification
```bash
grep -Rni "gemini-2.5-flash|gemini-3-pro-preview|gemini-pro" --exclude-dir=.git --exclude="*.md" G1 G2 G3 G4
# → should return only comments, no functional code
```
