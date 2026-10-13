import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";
import { SYSTEM_PROMPT } from "../constants";

// ============================================================
// NOVA-7 Interview Architect — Gemma 4 Edition
// Model: gemma-4-12b-it (256K context — ideal for 100-Q streams)
// Alt for max reasoning: gemma-4-26b-a4b-it / gemma-4-31b-it
// ============================================================
declare const process: any;
export const GEMMA_MODEL =
  process.env.GEMMA_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemma-4-12b-it";

// Backwards compat
export const MODEL_NAME = GEMMA_MODEL;

export const streamInterviewPrep = async (
  input: UserInput,
  onChunk: (text: string) => void
) => {
  const apiKey =
    process.env.API_KEY ||
    process.env.GEMMA_API_KEY ||
    process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY / GEMMA_API_KEY environment variable is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Gemma 4 — high reasoning + 256K window fits 100-Q protocol
  const model = GEMMA_MODEL;

  // Strictly enforce the count in the user prompt
  const userPrompt = `
  SUBJECT: ${input.topic}
  
  MISSION OBJECTIVES:
  1. Generate EXACTLY 100 unique interview questions.
  2. Follow the SYSTEM_PROMPT format strictly.
  3. Ensure Q1 through Q100 are all present.
  4. Failure to reach Q100 is not an option. Prioritize brevity in later sections to ensure completion.
  
  EXECUTE PROTOCOL.`;

  try {
    const streamResult = await ai.models.generateContentStream({
      model: model,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT + `\n\nYou are powered by Gemma 4 (${model}), Google DeepMind open model (256K context).`,
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
