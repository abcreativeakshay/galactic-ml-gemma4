// ============================================================
// GALACTIC ML — Gemma 4 Service (G1: Notebook Forge)
// Default: gemma-4-26b-a4b-it (MoE, 256K context — SUPPORTED on Gemini API)
// Docs: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
// API supports ONLY: gemma-4-26b-a4b-it, gemma-4-31b-it
//  - gemma-4-12b-it is HF/local-only (404 on Gemini API) — do NOT use as default
//  - gemma-4-31b-it (dense, max quality, API-supported alt)
// Primary: OpenRouter (paid Gemma, bypasses Google per-project 429) if VITE_OPENROUTER_API_KEY set.
// Fallback: Google generativelanguage.googleapis.com with VITE_GEMMA_API_KEY.
// Keys ONLY from .env — never hardcoded/committed.
// ============================================================

export const GEMMA_MODEL =
  import.meta.env.VITE_GEMMA_MODEL ||
  import.meta.env.VITE_GEMINI_MODEL ||
  'gemma-4-26b-a4b-it';

// OpenRouter model mapping — use PAID ids (":free" shared pool is rate-limited upstream).
// https://openrouter.ai/google/gemma-4-26b-a4b-it
function toOpenRouterModel(gemmaModel: string): string {
  const override = import.meta.env.VITE_OPENROUTER_MODEL;
  if (override) return override;
  if (gemmaModel.includes('31b')) return 'google/gemma-4-31b-it';
  return 'google/gemma-4-26b-a4b-it';
}

const GEMMA_API_KEY =
  import.meta.env.VITE_GEMMA_API_KEY ||
  import.meta.env.VITE_GEMINI_API_KEY ||
  '';

const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY ||
  '';

// NOTE: old hardcoded Google key was revoked (403 leaked). Set keys in G1/.env.

const GEMMA_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMMA_MODEL}:generateContent`;

interface GemmaResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

async function callGemma(prompt: string, maxTokens = 2000): Promise<string> {
  // Prefer OpenRouter (works despite Google project 429) when key present.
  if (OPENROUTER_API_KEY) {
    return callGemmaViaOpenRouter(prompt, maxTokens);
  }
  if (!GEMMA_API_KEY) {
    throw new Error(
      `Missing VITE_OPENROUTER_API_KEY and VITE_GEMMA_API_KEY. Create G1/.env with VITE_OPENROUTER_API_KEY=sk-or-... (recommended, OpenRouter paid Gemma) or VITE_GEMMA_API_KEY=AIza... from https://aistudio.google.com/ (model=${GEMMA_MODEL})`
    );
  }
  const response = await fetch(`${GEMMA_API_URL}?key=${GEMMA_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens,
      }
    })
  });

  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch { /* ignore */ }
    // 404 = wrong model ID (e.g. 12b not on Gemini API). 403 leaked = revoked key. 400 = bad key.
    throw new Error(`Gemma 4 API error ${response.status} ${response.statusText} (model=${GEMMA_MODEL}) :: ${body.slice(0, 500)}`);
  }

  const data: GemmaResponse = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

async function callGemmaViaOpenRouter(prompt: string, maxTokens = 1000): Promise<string> {
  const model = toOpenRouterModel(GEMMA_MODEL);
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'GalacticML-G1-Notebook-Forge',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
      provider: { sort: 'throughput' },
    }),
  });

  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch { /* ignore */ }
    throw new Error(`Gemma 4 via OpenRouter error ${response.status} ${response.statusText} (model=${model}) :: ${body.slice(0, 500)}`);
  }

  const data: any = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text === 'string' && text.trim()) return text;
  throw new Error(`Gemma 4 via OpenRouter empty response (model=${model})`);
}

// Fast cache: repeat generations (same model+context) resolve instantly.
const theoryCache = new Map<string, string>();
function cacheGet(key: string): string | null {
  if (theoryCache.has(key)) return theoryCache.get(key)!;
  try {
    const v = localStorage.getItem(`galactic-theory:${key}`);
    if (v) { theoryCache.set(key, v); return v; }
  } catch { /* ignore */ }
  return null;
}
function cacheSet(key: string, value: string) {
  theoryCache.set(key, value);
  try { localStorage.setItem(`galactic-theory:${key}`, value); } catch { /* ignore */ }
}

export async function generateTheoryContent(modelName: string, context: string): Promise<string> {
  const cacheKey = `${GEMMA_MODEL}|${modelName}|${context}`.slice(0, 120);
  const hit = cacheGet(cacheKey);
  if (hit) return hit;

  const prompt = `In under 200 words, bullet-only markdown theory for ${modelName} (${context}): formula (1 line), how it works (3 bullets), key params (3 bullets), when to use (1 line), 1 advantage, 1 limitation, 1 tip. No tables. Powered by Gemma 4.`;

  try {
    const text = await callGemma(prompt, 900);
    const out = text || 'Theory generation failed';
    cacheSet(cacheKey, out);
    return out;
  } catch (error) {
    console.error('Error generating theory with Gemma 4:', error);
    return `# ${modelName} Theory\n\nError generating theory content. Using default template.`;
  }
}

export async function generateCheatSheet(category: string): Promise<string> {
  const cacheKey = `${GEMMA_MODEL}|cheat|${category}`.slice(0, 120);
  const hit = cacheGet(cacheKey);
  if (hit) return hit;

  const prompt = `Under 180 words, compact markdown table cheat sheet for ${category}: columns Technique|When|Key param|Pitfall. 6 rows max. Powered by Gemma 4.`;

  try {
    const text = await callGemma(prompt, 800);
    const out = text || 'Cheat sheet generation failed';
    cacheSet(cacheKey, out);
    return out;
  } catch (error) {
    console.error('Error generating cheat sheet with Gemma 4:', error);
    return `Error generating ${category} cheat sheet.`;
  }
}

export async function analyzeDataset(datasetSample: any[]): Promise<{
  problemType: string;
  suggestedTarget: string[];
  recommendedModels: string[];
}> {
  const prompt = `You are powered by Gemma 4 (${GEMMA_MODEL}).
Analyze this dataset sample and provide:
1. Problem type (classification/regression/clustering)
2. Suggested target columns (list potential target variables)
3. Recommended ML models (5-7 models that would work well)

Dataset sample (first 5 rows):
${JSON.stringify(datasetSample, null, 2)}

Respond in JSON format:
{
  "problemType": "classification|regression|clustering",
  "suggestedTarget": ["column1", "column2"],
  "recommendedModels": ["model1", "model2"]
}`;

  try {
    const text = await callGemma(prompt, 800);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      problemType: 'classification',
      suggestedTarget: [],
      recommendedModels: ['Random Forest', 'XGBoost', 'Logistic Regression']
    };
  } catch (error) {
    console.error('Error analyzing dataset with Gemma 4:', error);
    return {
      problemType: 'classification',
      suggestedTarget: [],
      recommendedModels: ['Random Forest', 'XGBoost', 'Logistic Regression']
    };
  }
}

// Backwards-compat exports (old Gemini names still work)
export const GEMINI_MODEL = GEMMA_MODEL;
export const MODEL_NAME = GEMMA_MODEL;
