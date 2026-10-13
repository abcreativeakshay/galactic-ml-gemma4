import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NOVA_SYSTEM_PROMPT, MODEL_NAME, GEMMA_MODEL } from '../constants';
import { StudyGuideData } from '../types';

// ============================================================
// NOVA-7 Learn — Gemma 4 via OpenRouter (primary) + Google fallback
// Default: gemma-4-26b-a4b-it. OpenRouter paid IDs (NOT :free):
//   google/gemma-4-26b-a4b-it (default) | google/gemma-4-31b-it
// ============================================================
declare const process: any;

// Initialize the API client — Gemma 4 via Gemini API (same key works)
const apiKey =
  process.env.API_KEY ||
  process.env.GEMMA_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';
const ai = new GoogleGenAI({ apiKey: apiKey as string });

const openRouterKey = process.env.OPENROUTER_API_KEY || '';

// Canonical Gemma 4 model
const ACTIVE_MODEL = process.env.GEMMA_MODEL || MODEL_NAME || GEMMA_MODEL || 'gemma-4-26b-a4b-it';

function toOpenRouterModel(gemmaModel: string): string {
  const override = process.env.OPENROUTER_MODEL;
  if (override) return override;
  if ((gemmaModel || '').includes('31b')) return 'google/gemma-4-31b-it';
  return 'google/gemma-4-26b-a4b-it';
}

async function callOpenRouter(
  systemInstruction: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 4096
): Promise<string> {
  const model = toOpenRouterModel(ACTIVE_MODEL);
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://galactic-ml-nova-7.pages.dev',
      'X-Title': 'NOVA-7-Learn',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map((m) => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      provider: { sort: 'throughput' },
    }),
  });
  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch { /* ignore */ }
    throw new Error(`Gemma 4 via OpenRouter error ${response.status} (model=${model}) :: ${body.slice(0, 500)}`);
  }
  const data: any = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text === 'string' && text.trim()) return text;
  throw new Error(`Gemma 4 via OpenRouter empty response (model=${model})`);
}

export const generateResponse = async (
  prompt: string, 
  history: { role: 'user' | 'model'; content: string }[]
): Promise<{ text: string; studyGuide: StudyGuideData | null }> => {
  
  if (!apiKey && !openRouterKey) {
    throw new Error("Uplink Failure: API Key not detected. Set OPENROUTER_API_KEY or GEMMA_API_KEY.");
  }

  try {
    const isSearchQuery = prompt.toLowerCase().startsWith('search') || 
                         prompt.toLowerCase().includes('study') || 
                         prompt.toLowerCase().includes('analyze') ||
                         prompt.length < 50; 

    const model = ACTIVE_MODEL;
    
    let responseText: string;
    if (openRouterKey) {
      try {
        responseText = await callOpenRouter(
          NOVA_SYSTEM_PROMPT,
          [...history, { role: 'user' as const, content: prompt }],
          4096
        );
      } catch (err) {
        console.error("Gemma 4 OpenRouter Error (falling back to Google):", err);
        if (!apiKey) throw err;
        const response = await ai.models.generateContent({
          model: model,
          contents: [
            ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
            { role: 'user', parts: [{ text: prompt }] }
          ],
          config: {
            systemInstruction: NOVA_SYSTEM_PROMPT,
            temperature: 0.7,
          }
        });
        responseText = response.text || "";
      }
    } else {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: NOVA_SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });
      responseText = response.text || "";
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let studyGuide: StudyGuideData | null = null;

    if (jsonMatch) {
      try {
        const potentialJson = jsonMatch[0];
        const parsed = JSON.parse(potentialJson);
        if (parsed.modelName && parsed.coreMechanics) {
          studyGuide = parsed as StudyGuideData;
        }
      } catch (e) {
        console.warn("Detected JSON structure but failed to parse:", e);
      }
    }

    return {
      text: responseText,
      studyGuide
    };

  } catch (error) {
    console.error("Gemma 4 Uplink Error:", error);
    throw error;
  }
};

export const fetchDashboardMissions = async (): Promise<any[]> => {
  const prompt = `Generate 6 diverse, high-tech, and distinct Machine Learning study missions for a sci-fi interface.
  Return strictly a JSON array (no markdown formatting) of objects with this exact schema:
  {
    "title": "string (Max 3-4 words, e.g., 'Quantum Neural Networks')",
    "desc": "string (Max 10 words, sci-fi military style description)",
    "query": "string (The search query, e.g., 'Search Quantum ML')",
    "icon": "string (one of: 'zap', 'cpu', 'shield', 'globe', 'database', 'search', 'brain', 'eye', 'network', 'lock')"
  }
  
  Ensure varied topics (e.g., Vision, NLP, RL, Ethics, Hardware, Generative).`;

  // Prefer OpenRouter (Google project quota is 0 for this account).
  if (openRouterKey) {
    try {
      const text = await callOpenRouter(
        'Return strictly a JSON array, no markdown.',
        [{ role: 'user', content: prompt }],
        1500
      );
      const cleanText = text.replace(/```json|```/g, '');
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Gemma 4 Mission uplink failed (OpenRouter)", e);
      if (!apiKey) return [];
    }
  }

  if (!apiKey) return [];

  try {
     const response = await ai.models.generateContent({
      model: ACTIVE_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.9 
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    // Clean up if markdown is present despite instructions
    const cleanText = text.replace(/```json|```/g, '');
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemma 4 Mission uplink failed", e);
    return [];
  }
};
