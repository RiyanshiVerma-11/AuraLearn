import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Lazy initialization of the Gemini AI client using the primary GEMINI_API_KEY.
 * Returns null if no valid API key is present, allowing fallback logic to activate seamlessly.
 */
let cachedClient: GoogleGenAI | null = null;

export function getGeminiApiKey(): string | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "" || apiKey.startsWith("YOUR_")) {
    return null;
  }
  return apiKey.trim();
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  return cachedClient;
}

/**
 * Executes a Gemini AI operation safely.
 * If no key is configured or an error occurs, the caller handles graceful fallbacks.
 */
export async function executeWithGeminiFailover<T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY not configured or invalid");
  }
  return await operation(client);
}
