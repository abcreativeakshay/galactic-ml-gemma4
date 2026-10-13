// GALACTIC ML — Single source of truth for Gemma 4 (TypeScript)
// Copy this into any module, or import from here.
// Canonical: gemma-4-26b-a4b-it | Alts: gemma-4-31b-it, gemma-4-26b-a4b-it, gemma-4-e4b-it

export const GEMMA_MODEL =
  (import.meta as any)?.env?.VITE_GEMMA_MODEL ||
  (import.meta as any)?.env?.VITE_GEMINI_MODEL ||
  (typeof process !== "undefined" ? (process as any)?.env?.GEMMA_MODEL : "") ||
  (typeof process !== "undefined" ? (process as any)?.env?.GEMINI_MODEL : "") ||
  "gemma-4-26b-a4b-it";

export const GEMMA_API_KEY =
  (import.meta as any)?.env?.VITE_GEMMA_API_KEY ||
  (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
  (typeof process !== "undefined" ? (process as any)?.env?.GEMMA_API_KEY : "") ||
  (typeof process !== "undefined" ? (process as any)?.env?.API_KEY : "") ||
  "";

export const GEMMA_INFO = {
  model: GEMMA_MODEL,
  family: "Gemma 4 (Google DeepMind, Apache 2.0)",
  context: "256K tokens",
  modalities: "text+image (+audio on E2B/E4B/12B) in → text out",
  variants: ["gemma-4-26b-a4b-it", "gemma-4-31b-it", "gemma-4-31b-it"],
  api: "generativelanguage.googleapis.com via @google/genai",
  usage: `ai.models.generateContent({ model: "${GEMMA_MODEL}", contents: prompt })`,
};

// Backwards compat
export const MODEL_NAME = GEMMA_MODEL;
export const GEMINI_MODEL = GEMMA_MODEL;
export default GEMMA_MODEL;
