# 🛰️ Modules — How to Run Each (Gemma 4 Ready)

All modules use `GEMMA_MODEL=gemma-4-26b-a4b-it` by default. Override with env, no code change.

## 01 — Notebook Forge (`../G1`)
**Story:** Upload CSV → production notebook
```bash
cd ../G1
cp ../GALACTIC-ML/.env.example .env   # set GEMMA_API_KEY
npm install && npm run dev            # :5173
# Python registry:
pip install -r requirements.txt
python comprehensive_model_registry.py
```
Key file: `src/services/gemmaService.ts` (REST → `gemma-4-26b-a4b-it:generateContent`)

## 02 — Dracarys 3D (`../G2`)
**Story:** Words → 3D ML world
```bash
cd ../G2
cp ../GALACTIC-ML/.env.example .env
npm install && npm run dev -- --port 3001
```
Key file: `services/gemmaService.ts` (`MODEL_NAME='gemma-4-26b-a4b-it'`)
Try: "Transformer", "K-Means", "SVM"

## 03 — NOVA-7 Learn (`../G3`)
**Story:** AI Officer teaches you ML
```bash
cd ../G3
cp ../GALACTIC-ML/.env.example .env
npm install && npm run dev -- --port 3002
```
Key file: `constants.ts` (`GEMMA_MODEL="gemma-4-26b-a4b-it"`) + `services/gemmaService.ts`
Try: "Search GAN", "Search XGBoost"

## 04 — Interview Architect (`../G4`)
**Story:** 100 Q&A → PDF → job
```bash
cd ../G4
cp ../GALACTIC-ML/.env.example .env
npm install && npm run dev -- --port 3003
```
Key file: `services/gemmaService.ts` (`gemma-4-26b-a4b-it`, 16K tokens, streaming)
Try: "Machine Learning", "System Design"

## Ports (suggested for simultaneous demo)
- G1 :5173, G2 :3001, G3 :3002, G4 :3003
