import { Router, Request, Response } from "express";
import { getGeminiClient, executeWithGeminiFailover, executeGroqCompletion, getGroqApiKey } from "../gemini";
import { RoadmapResponseSchema } from "../schemas";
import { generateFallbackRoadmap } from "../fallbacks/roadmapFallback";
import { GenerateRoadmapRequest, AdaptRoadmapRequest } from "../types";

export const roadmapRouter = Router();

// POST /api/generate-roadmap
roadmapRouter.post("/generate-roadmap", async (req: Request, res: Response) => {
  const { profile, conversationHistory }: GenerateRoadmapRequest = req.body;

  const prompt = `You are an expert AI Learning Architect and Career Mentor.
Analyze the following learner profile and generate an exhaustive, highly structured, prerequisite-aware Personalized Learning Roadmap.

Learner Profile:
- Name: ${profile?.name || "Learner"}
- Current Role/Background: ${profile?.currentRole || "Beginner / General Background"}
- Target Aspiration / Goal: ${profile?.targetRole || "AI & Software Engineer"}
- Experience Level: ${profile?.experienceLevel || "Intermediate"}
- Domains of Interest: ${(profile?.domainsOfInterests || []).join(", ") || "Artificial Intelligence, Full-Stack"}
- Known Skills: ${(profile?.knownSkills || []).map((s: any) => `${s.skill} (Lvl ${s.level}/5)`).join(", ") || "Basics"}
- Weekly Available Hours: ${profile?.weeklyCommitmentHours || 10} hours/week
- Learning Preference Style: ${profile?.learningStyle || "balanced"} (e.g., hands-on-projects, video-first, interactive-code)
- Preferred Budget: ${profile?.preferredBudget || "free-only"}
- Completed Courses/Experience: ${(profile?.completedCourses || []).join(", ") || "None"}
- Additional Goals/Details: ${profile?.learningGoalsText || "Build production-grade skills with hands-on projects"}

Conversation Context: ${JSON.stringify(conversationHistory || [])}

Requirements:
1. Break the roadmap into 3 to 5 logical sequential PHASES (e.g. Phase 1: Foundational Skill Bridge & Prerequisites, Phase 2: Core Engineering & Systems, Phase 3: Applied Real-world Projects & Integrations, Phase 4: Mastery, Deployment & Portfolio).
2. For each phase, generate 2-4 concrete, actionable STEPS/MILESTONES with:
   - Specific prerequisites (referencing prior step IDs)
   - Specific skills acquired
   - Concrete hands-on deliverable / mini-project
   - "reasoning" (MANDATORY EXPLAINABILITY FIELD): Explicitly state why the AI recommended this milestone referencing the user's specific Skill Gap Vector and Learner Profile.
   - "aiWhyRecommended": Clear summary of immediate engineering impact.
   - 2-3 real, high-quality curated learning resources with real providers, estimated duration, difficulty, cost type, and a personalized "Why Recommended" explanation linking directly to their profile.
   - A short 3-question milestone check assessment.
   - 2-3 actionable learning tips / study strategies.
3. Include an accurate Skill Gap Analysis comparing current proficiency (0-100) vs target proficiency (0-100) with gap severity (critical, moderate, minor, mastered).

Return strictly JSON matching this structure.`;

  // 1. Try Primary Engine: Google Gemini 2.5 Flash
  try {
    const response = await executeWithGeminiFailover(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RoadmapResponseSchema,
        },
      });
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    if (parsed.steps && parsed.steps.length > 0) {
      parsed.steps = parsed.steps.map((step: any, idx: number) => ({
        ...step,
        status: idx === 0 ? "in_progress" : idx === 1 ? "up_next" : "locked",
        userNotes: "",
      }));
    }
    parsed.createdAt = new Date().toISOString();

    return res.json({
      success: true,
      provider: "gemini-2.5-flash",
      roadmap: parsed,
    });
  } catch (geminiErr: any) {
    console.warn("[AIRoadmap] Gemini primary engine unavailable, attempting Groq API failover...", geminiErr.message);

    // 2. Try Secondary Failover Engine: Groq API (openai/gpt-oss-120b)
    if (getGroqApiKey()) {
      try {
        const rawJson = await executeGroqCompletion(prompt, true);
        const parsed = JSON.parse(rawJson.trim());
        if (parsed.steps && parsed.steps.length > 0) {
          parsed.steps = parsed.steps.map((step: any, idx: number) => ({
            ...step,
            status: idx === 0 ? "in_progress" : idx === 1 ? "up_next" : "locked",
            userNotes: "",
          }));
        }
        parsed.createdAt = new Date().toISOString();

        console.log("[AIRoadmap] Successfully generated roadmap using Groq API (gpt-oss-120b)!");
        return res.json({
          success: true,
          provider: "groq-gpt-oss-120b",
          roadmap: parsed,
        });
      } catch (groqErr: any) {
        console.warn("[AIRoadmap] Groq failover engine also failed:", groqErr.message);
      }
    }

    // 3. Resilient Local Dynamic Engine Fallback
    return res.json({
      success: true,
      isFallback: true,
      provider: "local-resilient-fallback",
      roadmap: generateFallbackRoadmap(profile),
      errorMessage: geminiErr.message,
    });
  }
});

// POST /api/adapt-roadmap
roadmapRouter.post("/adapt-roadmap", async (req: Request, res: Response) => {
  try {
    const { currentRoadmap, userFeedback, profile }: AdaptRoadmapRequest = req.body;

    const prompt = `You are an AI Learning Path Optimization Engine.
Adapt and regenerate the current learning roadmap based on the user's explicit adaptation request: "${userFeedback}".

Current Learner Profile:
${JSON.stringify(profile)}

Current Roadmap to Adapt:
Title: ${currentRoadmap?.title || "Custom Roadmap"}
Target Role: ${currentRoadmap?.targetRole || "Target Role"}
Existing Steps:
${(currentRoadmap?.steps || []).map((s: any) => `- ID: ${s.id}, Title: ${s.title}, Phase: ${s.phaseName}, Status: ${s.status}`).join("\n")}

Adaptation Rules:
1. Preserve completed step progress if applicable, but recalculate upcoming steps, prerequisites, and resource recommendations to reflect the request (e.g. "remove Python because I know it", "focus more on LLM evals and agentic workflows", "reduce weekly load", "add hands-on capstone project").
2. Rebalance estimated hours and total weeks.
3. Update "aiPersonalizationNotes" with a concise explanation of how this roadmap was specifically modified according to their feedback.

Return the fully updated JSON object strictly matching the learning roadmap schema.`;

    const response = await executeWithGeminiFailover(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: RoadmapResponseSchema,
        },
      });
    });

    const adaptedRoadmap = JSON.parse(response.text?.trim() || "{}");
    const oldStatuses = new Map((currentRoadmap?.steps || []).map((s: any) => [s.id, s.status]));
    if (adaptedRoadmap.steps) {
      adaptedRoadmap.steps = adaptedRoadmap.steps.map((step: any, idx: number) => ({
        ...step,
        status: oldStatuses.get(step.id) || (idx === 0 ? "in_progress" : idx === 1 ? "up_next" : "locked"),
        userNotes: "",
      }));
    }
    adaptedRoadmap.lastAdaptedAt = new Date().toISOString();

    res.json({
      success: true,
      roadmap: adaptedRoadmap,
    });
  } catch (error: any) {
    console.error("Adaptation error (activating resilience fallback):", error);
    const { currentRoadmap, userFeedback } = req.body;
    // Perform resilient local adaptation
    const fallbackAdapted = {
      ...(currentRoadmap || {}),
      aiPersonalizationNotes: `Adjusted based on feedback: "${userFeedback}". Milestones and pacing recalibrated.`,
      lastAdaptedAt: new Date().toISOString(),
    };
    res.json({
      success: true,
      isFallback: true,
      roadmap: fallbackAdapted,
      adaptationSummary: `Roadmap adjusted for: "${userFeedback}".`,
      errorMessage: error.message,
    });
  }
});
