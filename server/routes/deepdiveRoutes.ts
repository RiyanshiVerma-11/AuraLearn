import { Router, Request, Response } from "express";
import { getGeminiClient, executeWithGeminiFailover } from "../gemini";
import { DeepdiveResponseSchema } from "../schemas";
import { generateFallbackDeepdive } from "../fallbacks/deepdiveFallback";
import { StepDeepdiveRequest } from "../types";

export const deepdiveRouter = Router();

// POST /api/generate-step-deepdive
deepdiveRouter.post("/generate-step-deepdive", async (req: Request, res: Response) => {
  try {
    const { stepTitle, stepSkills, userLevel }: StepDeepdiveRequest = req.body;

    const response = await executeWithGeminiFailover(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Provide an advanced learning deep dive for the milestone "${stepTitle}" targeting skills: ${(stepSkills || []).join(", ")} for a ${userLevel || "Intermediate"} learner.
Include:
1. 3 Essential mental models / core takeaways.
2. 1 Hands-on challenge project with step-by-step implementation milestones.
3. 2 Practical common pitfalls to avoid in production.
4. 2 Key interview/conceptual questions with model answers.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: DeepdiveResponseSchema,
        },
      });
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ success: true, deepdive: parsed });
  } catch (error: any) {
    console.error("Deepdive error (using fallback):", error);
    const { stepTitle } = req.body;
    res.json({
      success: true,
      isFallback: true,
      deepdive: generateFallbackDeepdive(stepTitle || "Milestone"),
    });
  }
});
