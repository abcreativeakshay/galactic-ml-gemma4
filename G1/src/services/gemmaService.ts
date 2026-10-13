// ============================================================
// GALACTIC ML — Gemma 4 Service (G1: Notebook Forge)
// Default: gemma-4-26b-a4b-it (MoE, 256K context — SUPPORTED on Gemini API)
// Docs: https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api
// API supports ONLY: gemma-4-26b-a4b-it, gemma-4-31b-it
//  - gemma-4-12b-it is HF/local-only (404 on Gemini API) — do NOT use as default
//  - gemma-4-31b-it (dense, max quality, API-supported alt)
// Via Gemini API (generativelanguage.googleapis.com) — needs fresh key.
// ============================================================

export const GEMMA_MODEL =
  (import.meta as any)?.env?.VITE_GEMMA_MODEL ||
  (import.meta as any)?.env?.VITE_GEMINI_MODEL ||
  'gemma-4-26b-a4b-it';

const GEMMA_API_KEY =
  (import.meta as any)?.env?.VITE_GEMMA_API_KEY ||
  (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
  '';

// NOTE: old hardcoded key AIzaSyAcK2... was revoked by Google (403 leaked).
// Set VITE_GEMMA_API_KEY in G1/.env from https://aistudio.google.com/

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

async function callGemma(prompt: string): Promise<string> {
  if (!GEMMA_API_KEY) {
    throw new Error(
      `Missing VITE_GEMMA_API_KEY. Create G1/.env with VITE_GEMMA_API_KEY=... from https://aistudio.google.com/ (model=${GEMMA_MODEL})`
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
        maxOutputTokens: 8192,
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

export async function generateTheoryContent(modelName: string, context: string): Promise<string> {
  const prompt = `You are powered by Gemma 4 (${GEMMA_MODEL}), Google DeepMind open model.
Generate a comprehensive theory section for the ${modelName} machine learning model. Include:

1. **Mathematical Foundation**: Core equations and principles
2. **Algorithm Explanation**: How the model works step-by-step
3. **Key Parameters**: Important hyperparameters and their effects
4. **Use Cases**: When to use this model vs alternatives
5. **Advantages**: Strengths of this approach
6. **Limitations**: Weaknesses and considerations
7. **Best Practices**: Tips for optimal performance

Context: ${context}

Format the response in clear markdown with tables where appropriate. Be concise but comprehensive.`;

  try {
    const text = await callGemma(prompt);
    return text || 'Theory generation failed';
  } catch (error) {
    console.error('Error generating theory with Gemma 4:', error);
    return `# ${modelName} Theory\n\nError generating theory content. Using default template.`;
  }
}

export async function generateCheatSheet(category: string): Promise<string> {
  const prompt = `You are powered by Gemma 4 (${GEMMA_MODEL}).
Create a comprehensive cheat sheet table for ${category} in machine learning.

Include:
- Technique names
- When to use
- Key parameters
- Code snippets (Python)
- Common pitfalls

Format as a markdown table that is easy to read and reference.`;

  try {
    const text = await callGemma(prompt);
    return text || 'Cheat sheet generation failed';
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
    const text = await callGemma(prompt);

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
