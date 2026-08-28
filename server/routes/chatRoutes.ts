import { Router, Request, Response } from "express";
import {
  executeWithGeminiFailover,
  executeGroqCompletion,
  getGroqApiKey,
} from "../gemini";
import { ChatAdvisorResponseSchema } from "../schemas";
import { generateFallbackChatReply } from "../fallbacks/chatFallback";
import { ChatAdvisorRequest } from "../types";

export const chatRouter = Router();

/**
 * Builds the shared system prompt injected into BOTH Gemini and Groq.
 * Embeds the full learner profile + live roadmap context so the AI can give
 * genuinely personalised advice regardless of which provider handles the request.
 */
function buildSystemPrompt(profile: any, currentRoadmap: any): string {
  const roadmapStepsSummary = (currentRoadmap?.steps || [])
    .slice(0, 10)
    .map(
      (s: any, i: number) =>
        `  ${i + 1}. [${s.phaseName || "Phase"}] ${s.title} — ${s.shortSummary || ""}`
    )
    .join("\n");

  const skillGapsSummary = (currentRoadmap?.skillGaps || [])
    .map(
      (g: any) =>
        `  • ${g.skill}: ${g.currentProficiency}% → ${g.targetProficiency}% (${g.gapSeverity} priority)`
    )
    .join("\n");

  return `You are "Aura", an intelligent AI Personalized Learning Path Advisor for AuraLearn.
Your job is to guide learners, discover their learning goals, identify skill gaps, explain why specific courses/projects are recommended, provide actionable career advice, and adjust their learning path dynamically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEARNER PROFILE (personalise every answer around this)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${profile?.name || "Learner"}
Target Role: ${profile?.targetRole || "Not set"}
Experience Level: ${profile?.experienceLevel || "Not set"}
Known Skills: ${(profile?.knownSkills || []).join(", ") || "None listed"}
Weekly Commitment: ${profile?.weeklyCommitmentHours || "Not set"} hours/week
Learning Style: ${profile?.learningStyle || "Not specified"}
Background: ${profile?.background || "Not provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVE LEARNING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${currentRoadmap?.title || "No roadmap generated yet"}
Target Role: ${currentRoadmap?.targetRole || "None"}
Difficulty: ${currentRoadmap?.difficulty || "N/A"}
Total Steps: ${currentRoadmap?.steps?.length || 0}
Estimated Duration: ${currentRoadmap?.totalEstimatedWeeks || 0} weeks / ${currentRoadmap?.totalEstimatedHours || 0} hours

Skill Gaps Identified:
${skillGapsSummary || "  (No skill gap analysis available yet)"}

Milestone Roadmap (first 10 steps):
${roadmapStepsSummary || "  (No steps yet — suggest the user generate a roadmap first)"}

AI Personalisation Notes: ${currentRoadmap?.aiPersonalizationNotes || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Be empathetic, pedagogically sound, encouraging, and structured.
2. Always ground answers in the learner profile and roadmap above — never give generic advice.
3. If the user asks about "best/free resources", list specific free resources relevant to their target role and skill gaps.
4. If they ask "why did you recommend X?", explain using their specific skill gaps and target role.
5. If they share new constraints (time, skills, goals), extract them into extractedProfileUpdates.
6. Keep explanations concise with bullet points. Suggest 2–3 interactive quick-action buttons when appropriate.

Respond STRICTLY in JSON (no markdown wrapper, no extra text):
{
  "text": "Your markdown formatted conversational response",
  "extractedProfileUpdates": { "targetRole": "optional", "experienceLevel": "optional", "weeklyCommitmentHours": 15 },
  "suggestedActions": [
    { "label": "Button label", "action": "action_id", "payload": { "key": "value" } }
  ]
}`;
}

// POST /api/chat-advisor
chatRouter.post("/chat-advisor", async (req: Request, res: Response) => {
  const { message, profile, currentRoadmap, chatHistory }: ChatAdvisorRequest =
    req.body;

  const systemPrompt = buildSystemPrompt(profile, currentRoadmap);

  // ── 1. Try Gemini ──────────────────────────────────────────────────────────
  try {
    const formattedContents = [
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await executeWithGeminiFailover(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: ChatAdvisorResponseSchema,
        },
      });
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ success: true, reply: parsed });
  } catch (geminiError: any) {
    console.warn(
      "Gemini chat failed, trying Groq fallback:",
      geminiError?.message || geminiError
    );
  }

  // ── 2. Try Groq (real AI with full context) ────────────────────────────────
  if (getGroqApiKey()) {
    try {
      // Format chat history as a readable conversation string for Groq
      const historyText = (chatHistory || [])
        .map(
          (msg: any) =>
            `${msg.sender === "user" ? "User" : "Aura"}: ${msg.text}`
        )
        .join("\n\n");

      const groqUserContent = historyText
        ? `Previous conversation:\n${historyText}\n\nUser: ${message}`
        : `User: ${message}`;

      const groqRaw = await executeGroqCompletion(
        `${systemPrompt}\n\n${groqUserContent}`,
        true // jsonMode — forces JSON response
      );

      const parsed = JSON.parse(groqRaw.trim() || "{}");
      if (parsed.text) {
        console.log("Groq fallback succeeded for chat-advisor.");
        return res.json({ success: true, isGroqFallback: true, reply: parsed });
      }
      throw new Error("Groq returned empty text field");
    } catch (groqError: any) {
      console.warn(
        "Groq chat fallback also failed:",
        groqError?.message || groqError
      );
    }
  }

  // ── 3. Static keyword fallback (last resort) ───────────────────────────────
  console.error("Both Gemini and Groq failed — using static fallback.");
  return res.json({
    success: true,
    isFallback: true,
    reply: generateFallbackChatReply(message, profile, currentRoadmap),
  });
});
