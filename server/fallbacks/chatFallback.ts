import { BackendUserProfile } from "../types";

export function generateFallbackChatReply(message: string, profile: BackendUserProfile = {}, currentRoadmap: any = null) {
  const lower = (message || "").toLowerCase();

  if (lower.includes("why") || lower.includes("recommend") || lower.includes("reason")) {
    return {
      text: `### 🎯 Why These Recommendations Were Personalized For You:

1. **Target Role Alignment**: Your goal is **${profile?.targetRole || "Full-Stack Generative AI Engineer"}**, which demands hands-on mastery of LLM APIs, vector retrieval, and production deployment.
2. **Identified Skill Gap**: Your current proficiency in Semantic Retrieval and Agentic Systems has the highest gap severity. We sequenced foundations first so you won't encounter blockers during the capstone.
3. **Pace & Modality**: Curated for **${profile?.weeklyCommitmentHours || 10} hours/week**, prioritizing **interactive project deliverables** rather than passive video lectures.

Would you like me to adjust any milestone or add more domain-specific projects?`,
      suggestedActions: [
        { label: "Show Next Milestone Actions", action: "view_milestone", payload: { stepId: "step-1" } },
        { label: "Add Real-Time Speech/Vision Module", action: "add_topic", payload: { topic: "Multimodal Live API" } },
        { label: "Adapt For 5 Hours/Week", action: "adapt_hours", payload: { hours: 5 } },
      ],
    };
  }

  if (lower.includes("5") || lower.includes("hours") || lower.includes("time") || lower.includes("busy")) {
    return {
      text: `Understood! I've noted that you'd like to adjust your weekly schedule. I can recalibrate your roadmap to compress foundational steps and focus exclusively on core deliverables.`,
      extractedProfileUpdates: {
        weeklyCommitmentHours: 5,
      },
      suggestedActions: [
        { label: "Adapt Roadmap for 5h/week", action: "adapt_hours", payload: { hours: 5 } },
        { label: "View Updated Timeline", action: "tab_roadmap" },
      ],
    };
  }

  return {
    text: `Hello ${profile?.name || "there"}! I'm **Aura**, your AI Learning Path Advisor. 

I can help you:
- **Discover & Refine Goals**: Clarify your dream role and target competencies.
- **Explain Recommendations**: Dive into why each course, project, or prerequisite was chosen.
- **Dynamically Adapt Roadmaps**: Speed up, condense, or add specialized topics (e.g. System Design, Kubernetes, Cloud AI).
- **Assess Milestones**: Take quick quizzes and unlock next steps.

What would you like to explore or customize today?`,
    suggestedActions: [
      { label: "Generate Roadmap For My Goal", action: "generate_roadmap" },
      { label: "Analyze My Skill Gaps", action: "analyze_gaps" },
      { label: "Browse Preset Career Paths", action: "browse_presets" },
    ],
  };
}
