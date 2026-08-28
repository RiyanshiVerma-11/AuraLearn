import { Router, Request, Response } from "express";
import { getGeminiClient, executeWithGeminiFailover } from "../gemini";
import { ChatAdvisorResponseSchema } from "../schemas";
import { generateFallbackChatReply } from "../fallbacks/chatFallback";
import { ChatAdvisorRequest } from "../types";

export const chatRouter = Router();

// POST /api/chat-advisor
chatRouter.post("/chat-advisor", async (req: Request, res: Response) => {
  try {
    const { message, profile, currentRoadmap, chatHistory }: ChatAdvisorRequest = req.body;

    const systemPrompt = `You are "Aura", an intelligent AI Personalized Learning Path Advisor.
Your job is to guide learners, discover their learning goals, identify their hidden skill gaps, explain why certain courses/projects are recommended, provide actionable career advice, and adjust their learning path.

Current Learner Profile:
${JSON.stringify(profile, null, 2)}

Active Learning Roadmap (if any):
Title: ${currentRoadmap?.title || "None yet"}
Target Role: ${currentRoadmap?.targetRole || "None yet"}
Total Steps: ${currentRoadmap?.steps?.length || 0}
Skill Gaps identified: ${(currentRoadmap?.skillGaps || []).map((g: any) => `${g.skill} (${g.currentProficiency}% -> ${g.targetProficiency}%)`).join(", ")}

Instructions:
1. Be empathetic, pedagogically sound, encouraging, and structured.
2. If the user shares new skills, time constraints, or role goals, extract them and offer suggested quick actions.
3. If they ask "Why did you recommend X?", provide a crystal-clear rationale matching their prior knowledge to the new concept.
4. Keep explanations concise, with bullet points when listing steps or recommendations.
5. If appropriate, suggest 2-3 short interactive quick action buttons the user can click.

Respond in JSON format:
{
  "text": "Your markdown formatted conversational response",
  "extractedProfileUpdates": { "targetRole": "optional updated role", "experienceLevel": "optional", "weeklyCommitmentHours": 15 },
  "suggestedActions": [
    { "label": "Adapt Roadmap for 5h/week", "action": "adapt_hours", "payload": { "hours": 5 } },
    { "label": "Add Cloud Deployment Phase", "action": "add_topic", "payload": { "topic": "AWS & Kubernetes" } }
  ]
}`;

    const formattedContents = [
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: `User message: ${message}` }],
      },
    ];

    const response = await executeWithGeminiFailover(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: ChatAdvisorResponseSchema,
        },
      });
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({
      success: true,
      reply: parsed,
    });
  } catch (error: any) {
    console.error("Chat advisor error (using fallback):", error);
    const { message, profile, currentRoadmap } = req.body;
    res.json({
      success: true,
      isFallback: true,
      reply: generateFallbackChatReply(message, profile, currentRoadmap),
    });
  }
});
