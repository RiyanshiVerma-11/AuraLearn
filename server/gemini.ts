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

export function getGroqApiKey(): string | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("YOUR_")) {
    return null;
  }
  return apiKey.trim();
}

/**
 * Executes an AI completion using the Groq API (openai/gpt-oss-120b or groq/compound) as an ultra-fast failover provider.
 */
export async function executeGroqCompletion(prompt: string, jsonMode: boolean = true): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured or invalid");
  }

  const model = "openai/gpt-oss-120b";
  const body: any = {
    model,
    messages: [
      {
        role: "system",
        content: jsonMode
          ? "You are an expert AI Learning Architect. You MUST output strictly valid JSON matching the requested schema without any markdown formatting or commentary."
          : "You are an expert AI Learning Architect.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Groq API Error: ${data.error?.message || res.statusText}`);
  }

  return data.choices?.[0]?.message?.content || "";
}

/**
 * Executes an AI operation with dual Gemini + Groq resilience.
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
