import { Router, Request, Response } from "express";
import { getGeminiClient, executeGroqCompletion, getGroqApiKey } from "../gemini";

export const skillRouter = Router();

interface ExtractedSkill {
  skill: string;
  level: number; // 1–5
  reasoning: string;
}

interface ExtractSkillsRequest {
  text: string;
}

const EXTRACTION_PROMPT = (text: string) => `
You are an expert technical recruiter and skills assessor.
Analyze the following professional bio, resume excerpt, or self-description and extract a structured list of technical skills.

For each skill you identify, assign a proficiency level from 1 to 5 using this rubric:
- Level 1 (Novice): Mentioned in passing, or the person has only heard of / read about it
- Level 2 (Beginner): Completed tutorials or small examples with it
- Level 3 (Intermediate): Has built and shipped personal or hobby projects with it
- Level 4 (Proficient): Has used it in real production systems, client work, or professional projects
- Level 5 (Expert): Deep expertise — can architect systems, mentor others, or is recognized as highly experienced

Rules:
- Only extract TECHNICAL skills (programming languages, frameworks, tools, platforms, cloud services, databases, AI/ML concepts, etc.)
- Do NOT extract soft skills (leadership, communication, teamwork, etc.)
- Do NOT invent skills that are not mentioned or clearly implied in the text
- Extract at most 20 skills
- If a skill is mentioned but no experience level is implied, default to Level 2
- Return ONLY valid JSON, no markdown formatting

Input text:
"""
${text.substring(0, 5000)}
"""

Return a JSON object with this exact shape:
{
  "skills": [
    {
      "skill": "string (e.g. React, Python, Docker)",
      "level": number (1-5),
      "reasoning": "string (1 sentence explaining why you assigned this level)"
    }
  ]
}
`;

// POST /api/extract-skills
skillRouter.post("/extract-skills", async (req: Request, res: Response) => {
  const { text }: ExtractSkillsRequest = req.body;

  if (!text || typeof text !== "string" || text.trim().length < 20) {
    return res.status(400).json({
      error: "Please provide at least 20 characters of text describing your experience.",
    });
  }

  const prompt = EXTRACTION_PROMPT(text);

  // 1. Try Primary Engine: Google Gemini 2.5 Flash
  try {
    const geminiClient = getGeminiClient();
    if (geminiClient) {
      const response = await geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const raw = response.text?.trim() || "{}";
      const parsed = JSON.parse(raw) as { skills: ExtractedSkill[] };

      if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        // Clamp levels to 1–5 and sanitize
        const sanitized: ExtractedSkill[] = parsed.skills
          .filter((s) => s.skill && typeof s.skill === "string")
          .map((s) => ({
            skill: String(s.skill).trim(),
            level: Math.max(1, Math.min(5, Math.round(Number(s.level) || 2))),
            reasoning: String(s.reasoning || "").trim(),
          }))
          .slice(0, 20);

        return res.json({ skills: sanitized, source: "gemini" });
      }
    }
  } catch (geminiError) {
    console.warn("[extract-skills] Gemini failed, trying Groq failover:", geminiError);
  }

  // 2. Failover: Groq
  try {
    if (getGroqApiKey()) {
      const raw = await executeGroqCompletion(prompt, true);
      const parsed = JSON.parse(raw) as { skills: ExtractedSkill[] };

      if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        const sanitized: ExtractedSkill[] = parsed.skills
          .filter((s) => s.skill && typeof s.skill === "string")
          .map((s) => ({
            skill: String(s.skill).trim(),
            level: Math.max(1, Math.min(5, Math.round(Number(s.level) || 2))),
            reasoning: String(s.reasoning || "").trim(),
          }))
          .slice(0, 20);

        return res.json({ skills: sanitized, source: "groq" });
      }
    }
  } catch (groqError) {
    console.warn("[extract-skills] Groq failover also failed:", groqError);
  }

  // 3. Both AI engines unavailable
  return res.status(503).json({
    error:
      "AI extraction is temporarily unavailable. Please try again in a moment, or add your skills manually.",
  });
});
