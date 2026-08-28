import { describe, it, expect } from "vitest";
import { generateFallbackRoadmap } from "../fallbacks/roadmapFallback";
import { generateFallbackChatReply } from "../fallbacks/chatFallback";
import { generateFallbackDeepdive } from "../fallbacks/deepdiveFallback";
import { RoadmapResponseSchema, ChatAdvisorResponseSchema, DeepdiveResponseSchema } from "../schemas";

describe("Air-Gapped Resilient Fallback Engine Tests", () => {
  const sampleProfile = {
    name: "Test Learner",
    targetRole: "AI Engineer",
    weeklyCommitmentHours: 10,
    experienceLevel: "Intermediate" as const,
    learningStyle: "Hands-on projects" as const,
    knownSkills: [
      { skill: "Python", level: 3 },
      { skill: "Machine Learning", level: 2 },
    ],
    completedCourses: [],
    learningGoalsText: "Master LLMs and Vector DBs",
  };

  it("should generate a complete, valid roadmap fallback matching schema types", () => {
    const roadmap = generateFallbackRoadmap(sampleProfile);

    expect(roadmap).toBeDefined();
    expect(roadmap.id).toBeDefined();
    expect(roadmap.title).toContain("AI Engineer");
    expect(roadmap.steps.length).toBeGreaterThan(0);
    expect(roadmap.skillGaps.length).toBeGreaterThan(0);
    expect(roadmap.phases.length).toBeGreaterThan(0);

    // Verify first step has required pedagogical keys
    const firstStep = roadmap.steps[0];
    expect(firstStep.id).toBeDefined();
    expect(firstStep.title).toBeDefined();
    expect(firstStep.reasoning).toBeDefined();
    expect(firstStep.aiWhyRecommended).toBeDefined();
    expect(firstStep.resources.length).toBeGreaterThan(0);
  });

  it("should generate conversational chat advisor responses", () => {
    const chatRes = generateFallbackChatReply("How do I learn PyTorch?", sampleProfile, null);

    expect(chatRes).toBeDefined();
    expect(chatRes.text).toBeDefined();
    expect(chatRes.text.length).toBeGreaterThan(10);
    expect(Array.isArray(chatRes.suggestedActions)).toBe(true);
  });

  it("should generate step deep-dive syllabi with takeaways and interview questions", () => {
    const deepdive = generateFallbackDeepdive("Building Vector DB Index");

    expect(deepdive).toBeDefined();
    expect(deepdive.keyTakeaways.length).toBeGreaterThan(0);
    expect(deepdive.challengeProject.name).toBeDefined();
    expect(deepdive.interviewQuestions.length).toBeGreaterThan(0);
  });
});

describe("Server JSON Schema Validation Tests", () => {
  it("should define valid Gemini response schemas", () => {
    expect(RoadmapResponseSchema.type).toBe("OBJECT");
    expect(RoadmapResponseSchema.properties.steps).toBeDefined();
    expect(ChatAdvisorResponseSchema.type).toBe("OBJECT");
    expect(DeepdiveResponseSchema.type).toBe("OBJECT");
  });
});
