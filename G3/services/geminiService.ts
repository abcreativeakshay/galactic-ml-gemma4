import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NOVA_SYSTEM_PROMPT, MODEL_NAME, GEMMA_MODEL } from '../constants';
import { StudyGuideData } from '../types';

// Initialize the API client — Gemma 4 via Gemini API (same key works)
declare const process: any;
const apiKey =
  process.env.API_KEY ||
  process.env.GEMMA_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';
const ai = new GoogleGenAI({ apiKey: apiKey as string });

// Canonical Gemma 4 model
const ACTIVE_MODEL = process.env.GEMMA_MODEL || MODEL_NAME || GEMMA_MODEL || 'gemma-4-12b-it';

export const generateResponse = async (
  prompt: string, 
  history: { role: 'user' | 'model'; content: string }[]
): Promise<{ text: string; studyGuide: StudyGuideData | null }> => {
  
  if (!apiKey) {
    throw new Error("Uplink Failure: API Key not detected in environment variables. Set GEMMA_API_KEY.");
  }

  try {
    const isSearchQuery = prompt.toLowerCase().startsWith('search') || 
                         prompt.toLowerCase().includes('study') || 
                         prompt.toLowerCase().includes('analyze') ||
                         prompt.length < 50; 

    const model = ACTIVE_MODEL;
    
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

    const responseText = response.text || "";

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
  if (!apiKey) return [];
  
  const prompt = `Generate 6 diverse, high-tech, and distinct Machine Learning study missions for a sci-fi interface.
  Return strictly a JSON array (no markdown formatting) of objects with this exact schema:
  {
    "title": "string (Max 3-4 words, e.g., 'Quantum Neural Networks')",
    "desc": "string (Max 10 words, sci-fi military style description)",
    "query": "string (The search query, e.g., 'Search Quantum ML')",
    "icon": "string (one of: 'zap', 'cpu', 'shield', 'globe', 'database', 'search', 'brain', 'eye', 'network', 'lock')"
  }
  
  Ensure varied topics (e.g., Vision, NLP, RL, Ethics, Hardware, Generative).`;

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
