import { Type } from "@google/genai";

export const RoadmapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    targetRole: { type: Type.STRING },
    totalEstimatedWeeks: { type: Type.NUMBER },
    totalEstimatedHours: { type: Type.NUMBER },
    difficulty: { type: Type.STRING },
    aiPersonalizationNotes: { type: Type.STRING },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          category: { type: Type.STRING },
          currentProficiency: { type: Type.NUMBER },
          targetProficiency: { type: Type.NUMBER },
          gapSeverity: { type: Type.STRING },
          importance: { type: Type.STRING },
          recommendedFocus: { type: Type.STRING },
        },
        required: [
          "skill",
          "currentProficiency",
          "targetProficiency",
          "gapSeverity",
          "importance",
          "recommendedFocus",
        ],
      },
    },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseIndex: { type: Type.NUMBER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedHours: { type: Type.NUMBER },
        },
        required: ["phaseIndex", "title", "description", "estimatedHours"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          shortSummary: { type: Type.STRING },
          detailedDescription: { type: Type.STRING },
          phaseIndex: { type: Type.NUMBER },
          phaseName: { type: Type.STRING },
          estimatedHours: { type: Type.NUMBER },
          order: { type: Type.NUMBER },
          prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillsAcquired: { type: Type.ARRAY, items: { type: Type.STRING } },
          deliverable: { type: Type.STRING },
          reasoning: {
            type: Type.STRING,
            description:
              "Explicit AI Explainability justification detailing why this milestone is recommended based on the user's specific Skill Gap Vector and Learner Profile.",
          },
          aiWhyRecommended: { type: Type.STRING },
          aiTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                provider: { type: Type.STRING },
                type: { type: Type.STRING },
                url: { type: Type.STRING },
                duration: { type: Type.STRING },
                cost: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                rating: { type: Type.NUMBER },
                skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
                aiRecommendationRationale: { type: Type.STRING },
              },
              required: [
                "id",
                "title",
                "provider",
                "type",
                "duration",
                "cost",
                "difficulty",
                "rating",
                "skillsCovered",
                "aiRecommendationRationale",
              ],
            },
          },
          assessment: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                  },
                  required: ["question", "options", "correctIndex", "explanation"],
                },
              },
            },
            required: ["title", "questions"],
          },
        },
        required: [
          "id",
          "title",
          "shortSummary",
          "detailedDescription",
          "phaseIndex",
          "phaseName",
          "estimatedHours",
          "order",
          "skillsAcquired",
          "deliverable",
          "resources",
          "assessment",
          "reasoning",
          "aiWhyRecommended",
          "aiTips",
        ],
      },
    },
  },
  required: [
    "id",
    "title",
    "summary",
    "targetRole",
    "totalEstimatedWeeks",
    "totalEstimatedHours",
    "difficulty",
    "skillGaps",
    "phases",
    "steps",
    "aiPersonalizationNotes",
  ],
};

export const ChatAdvisorResponseSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    extractedProfileUpdates: {
      type: Type.OBJECT,
      properties: {
        targetRole: { type: Type.STRING },
        experienceLevel: { type: Type.STRING },
        weeklyCommitmentHours: { type: Type.NUMBER },
        learningStyle: { type: Type.STRING },
      },
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          action: { type: Type.STRING },
          payload: { type: Type.OBJECT },
        },
        required: ["label", "action"],
      },
    },
  },
  required: ["text"],
};

export const DeepdiveResponseSchema = {
  type: Type.OBJECT,
  properties: {
    keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
    challengeProject: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
        techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["name", "description", "milestones", "techStack"],
    },
    productionPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["keyTakeaways", "challengeProject", "productionPitfalls", "interviewQuestions"],
};
