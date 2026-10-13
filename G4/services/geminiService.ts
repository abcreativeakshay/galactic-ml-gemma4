import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";
import { SYSTEM_PROMPT } from "../constants";

// ============================================================
// NOVA-7 Interview Architect — Gemma 4 Edition
// Default: gemma-4-26b-a4b-it (256K context — ideal for 100-Q streams)
// Primary: OpenRouter (paid Gemma, bypasses Google per-project 429) if OPENROUTER key set.
// Fallback: Google Gemini API streaming.
// OpenRouter IDs (paid, NOT :free — free pool is rate-limited upstream):
//   google/gemma-4-26b-a4b-it (default) | google/gemma-4-31b-it (max quality)
// ============================================================
declare const process: any;
export const GEMMA_MODEL =
  process.env.GEMMA_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemma-4-26b-a4b-it";

function toOpenRouterModel(gemmaModel: string): string {
  const override = process.env.OPENROUTER_MODEL;
  if (override) return override;
  if ((gemmaModel || "").includes("31b")) return "google/gemma-4-31b-it";
  return "google/gemma-4-26b-a4b-it";
}

// Backwards compat
export const MODEL_NAME = GEMMA_MODEL;

async function streamViaOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (text: string) => void
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = toOpenRouterModel(GEMMA_MODEL);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://interview-architect-ai.pages.dev",
      "X-Title": "NOVA-7-Interview-Architect",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 16384,
      stream: true,
      provider: { sort: "throughput" },
    }),
  });

  if (!response.ok || !response.body) {
    let body = "";
    try { body = await response.text(); } catch { /* ignore */ }
    throw new Error(`Gemma 4 via OpenRouter error ${response.status} (model=${model}) :: ${body.slice(0, 500)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta: string = json?.choices?.[0]?.delta?.content || "";
        if (delta) onChunk(delta);
      } catch { /* skip partial SSE frames */ }
    }
  }
}

export const streamInterviewPrep = async (
  input: UserInput,
  onChunk: (text: string) => void
) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey =
    process.env.API_KEY ||
    process.env.GEMMA_API_KEY ||
    process.env.GEMINI_API_KEY;

  // Strictly enforce the count in the user prompt
  const userPrompt = `
  SUBJECT: ${input.topic}
  
  MISSION OBJECTIVES:
  1. Generate EXACTLY 100 unique interview questions.
  2. Follow the SYSTEM_PROMPT format strictly.
  3. Ensure Q1 through Q100 are all present.
  4. Failure to reach Q100 is not an option. Prioritize brevity in later sections to ensure completion.
  
  EXECUTE PROTOCOL.`;

  const systemWithGemma = SYSTEM_PROMPT + `\n\nYou are powered by Gemma 4 (${GEMMA_MODEL}), Google DeepMind open model (256K context).`;

  // Prefer OpenRouter when key present (Google project quota is 0 for this account).
  if (openRouterKey) {
    try {
      await streamViaOpenRouter(systemWithGemma, userPrompt, onChunk);
      return;
    } catch (error) {
      console.error("Gemma 4 OpenRouter Error (falling back to Google):", error);
      if (!apiKey) throw error;
    }
  }

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY / API_KEY environment variable is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Gemma 4 — high reasoning + 256K window fits 100-Q protocol
  const model = GEMMA_MODEL;

  try {
    const streamResult = await ai.models.generateContentStream({
      model: model,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemWithGemma,
        temperature: 0.7,
        maxOutputTokens: 16384, // Gemma 4 supports long outputs — maximize for 100-Q
      },
    });

    for await (const chunk of streamResult) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Gemma 4 API Error:", error);
    throw error;
  }
};
