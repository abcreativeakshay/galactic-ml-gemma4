#!/bin/bash
# GALACTIC ML — run all 4 modules (each in background, Gemma 4 ready)
# Usage: bash GALACTIC-ML/run-all.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "🌌 GALACTIC ML — starting all 4 (model: ${GEMMA_MODEL:-gemma-4-26b-a4b-it})"

check_env() {
  if [ ! -f "$1/.env" ]; then
    echo "⚠️  $1/.env missing — copying from GALACTIC-ML/.env.example (set GEMMA_API_KEY!)"
    cp "$ROOT/GALACTIC-ML/.env.example" "$1/.env"
  fi
}

for d in G1 G2 G3 G4; do check_env "$ROOT/$d"; done

# G1 Vite default 5173, others override to avoid clash
(cd "$ROOT/G1" && npm install && npm run dev) &
(cd "$ROOT/G2" && npm install && npm run dev -- --port 3001) &
(cd "$ROOT/G3" && npm install && npm run dev -- --port 3002) &
(cd "$ROOT/G4" && npm install && npm run dev -- --port 3003) &

echo ""
echo "✅ Started:"
echo "  G1 Notebook Forge      → http://localhost:5173"
echo "  G2 Dracarys 3D         → http://localhost:3001"
echo "  G3 NOVA-7 Learn        → http://localhost:3002"
echo "  G4 Interview Architect → http://localhost:3003"
echo ""
echo "Press Ctrl+C to stop all."
wait
