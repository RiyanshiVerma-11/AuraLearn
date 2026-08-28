# 📑 AuraLearn — Solution Architecture & AI Specification Document

> **Competition Deliverable 3**: Comprehensive Solution Documentation  
> **System Name**: AuraLearn (AI-Powered Personalized Learning Path Recommender)  
> **Version**: 2.0.0 Production Release  

---

## 📋 Executive Summary

Online learning platforms host thousands of courses across diverse domains. However, learners face the **Sequencing & Personalization Paradox**: even when relevant courses are recommended, learners struggle to identify the correct prerequisite sequence, estimate required time commitments, and select appropriate learning modalities (hands-on code labs vs. theory vs. case studies) suited to their background.

**AuraLearn** bridges this gap by acting as an autonomous **Principal AI Learning Architect**. Powered by **Google Gemini 3.7 Flash** with structured JSON schemas, AuraLearn builds **explainable, prerequisite-aware Directed Acyclic Graph (DAG) roadmaps**, dynamically computes **Skill Gap Radar vectors**, projects **Learning Velocity burn-up curves**, and evaluates learner code submissions with an **AI Code Reviewer**.

---

## 🎯 1. Problem Understanding & Solution Approach

### The Core Problem
1. **Ineffective One-Size-Fits-All Curricula**: Generic pathways ignore a learner's current baseline vs. target skill requirements.
2. **Prerequisite Ambiguity**: Learners waste time on advanced topics without mastering foundational prerequisites.
3. **Lack of AI Explainability**: Recommendations feel like "black boxes" without justification for why a course or milestone was assigned.
4. **Static Schedules**: Rigid timelines fail when learners have fluctuating weekly availability (e.g., 5h/week vs 25h/week).

### The AuraLearn Solution Architecture
AuraLearn delivers a personalized, adaptive learning ecosystem built around five core capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AuraLearn Solution Matrix                          │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ 1. Learner Profiling     │ Captures domain baseline, target role, weekly    │
│    Engine                │ hours, completed courses, and learning styles.   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 2. DAG Roadmap           │ Generates 3-5 sequential phases with strict step │
│    Generator             │ prerequisites, deliverables, and duration metrics│
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 3. Transparent AI        │ Provides explicit reasoning (aiWhyRecommended)   │
│    Explainability        │ referencing the user's skill gap delta vector.   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 4. Dynamic Analytics     │ Recharts-powered Skill Gap Radar, Velocity       │
│    Dashboard             │ Projections, and Modality Allocation Matrix.     │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 5. Code Reviewer &       │ Rubric grading for student code deliverables     │
│    Step Deep-Dive        │ and step-level interactive diagnostic quizzes.   │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 🏛️ 2. Technical Architecture & Component Design

### System Overview
AuraLearn follows a modular, decoupled full-stack architecture:

```
[ React 18/19 Client ] <── REST / JSON ──> [ Express Node.js Server ]
        │                                          │
        ├── Recharts Visualizers                   ├── Gemini 3.7 AI Engine
        ├── Tailwind CSS v4                        ├── Server-Side Schema Enforcer
        └── State Persistence                      └── Offline Fallback Engine
```

### Backend Components (`/server`)
1. **`server.ts` & `server/app.ts`**: Express application entry point configured with CORS headers middleware, JSON body parsing, and Vite middleware integration.
2. **`server/gemini.ts`**: Lazy-initialized `@google/genai` client executing Gemini operations within `executeWithGeminiFailover` wrappers.
3. **`server/schemas.ts`**: Rigid JSON Schema definitions (`RoadmapResponseSchema`, `ChatAdvisorResponseSchema`, `DeepdiveResponseSchema`) guaranteeing strict output structures.
4. **`server/routes/authRoutes.ts`**: User authentication supporting OTP email delivery, persistent JSON storage (`server/data/store.json`), and PBKDF2 password hashing.
5. **`server/fallbacks/*`**: Air-gapped fallback generators executing deterministic mock routines if external AI quotas or network connections drop.

### Frontend Components (`/src`)
1. **`LearnerProfileEngine.tsx`**: Multi-step interactive engine for configuring baseline vs target skills and weekly commitments.
2. **`RoadmapGraphView.tsx`**: Interactive DAG visualization rendering milestone nodes, phase groupings, and prerequisite connectors.
3. **`DashboardView.tsx`**: Executive analytics hub orchestrating:
   * `SkillGapVisualizer.tsx`: Radar chart comparing current proficiency vs target.
   * `LearningVelocityChart.tsx`: Burn-up chart forecasting completion timeline based on weekly hours.
   * `CurriculumModalityMatrix.tsx`: Pie and bar breakdown of hands-on, video, and theory content.
4. **`ConversationalAdvisor.tsx`**: Real-time AI chat side-panel allowing natural language roadmap re-calibration.
5. **`StepDetailModal.tsx` & `MilestoneLearningView.tsx`**: Step deep-dives, challenge specs, and code deliverable review interface.

---

## 🧠 3. AI/ML Engineering & Schema Enforcement

### Gemini API Integration
AuraLearn proxies all AI interaction server-side via `@google/genai`. Structured JSON outputs are strictly enforced using response schemas:

```typescript
// Sample Schema Definition Excerpt (server/schemas.ts)
export const RoadmapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    totalEstimatedWeeks: { type: Type.NUMBER },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          currentProficiency: { type: Type.NUMBER },
          targetProficiency: { type: Type.NUMBER },
          gapSeverity: { type: Type.STRING },
        },
        required: ["skill", "currentProficiency", "targetProficiency", "gapSeverity"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING },
          aiWhyRecommended: { type: Type.STRING },
        },
        required: ["id", "title", "reasoning", "aiWhyRecommended"],
      },
    },
  },
  required: ["title", "totalEstimatedWeeks", "skillGaps", "steps"],
};
```

### AI Code Review Rubric Evaluator
When a learner submits code for a milestone deliverable, `/api/review-deliverable` evaluates the code across four key criteria:
1. **Functionality (30%)**: Does the code satisfy the deliverable specification?
2. **Architecture & Design Patterns (25%)**: Is the code modular, maintainable, and properly structured?
3. **Cleanliness & Standards (25%)**: Does the code adhere to language conventions?
4. **Security & Edge Cases (20%)**: Are input validations, edge cases, and error handlings present?

---

## 🛡️ 4. Air-Gapped Resiliency & Offline Fallback Engine

To satisfy enterprise reliability standards, AuraLearn implements a **Dual-Engine Architecture**:

```
                  ┌──────────────────────────────┐
                  │    API Request Triggered     │
                  └──────────────┬───────────────┘
                                 │
                   Is GEMINI_API_KEY Available?
                   ┌─────────────┴─────────────┐
                   │ YES                       │ NO / Error
                   ▼                           ▼
        ┌─────────────────────┐     ┌─────────────────────┐
        │  Gemini 3.7 Engine  │     │ Deterministic Local │
        │  Schema Generation  │     │  Fallback Generator │
        └─────────────────────┘     └─────────────────────┘
```

If the Gemini API key is unconfigured, rate-limited (HTTP 429), or offline, the failover engine catches the exception and returns structurally identical JSON from deterministic fallbacks (`server/fallbacks/*`), ensuring **zero crashes**.

---

## 📊 5. Evaluation & Judging Criteria Alignment

| Criteria | Weight | AuraLearn Implementation Summary |
| :--- | :--- | :--- |
| **Problem Understanding & Solution Design** | **20%** | Full DAG prerequisite sequencing, multi-dimensional profiling, and velocity calculation. |
| **Functionality & Feature Completeness** | **25%** | All 6 engines fully operational: Profile, Generator, AI Explainability, Conversational Advisor, Dashboard, Code Reviewer. |
| **AI/ML Implementation** | **20%** | Server-side Gemini 3.7 integration with rigid schema enforcement and fallback failovers. |
| **Innovation & Creativity** | **15%** | AI Code Reviewer, dynamic velocity burn-up curves, and interactive milestone deep-dives. |
| **User Experience & Interface** | **10%** | Modern glassmorphism UI, Recharts visualizers, custom onboarding checklist, and PWA manifest. |
| **Performance & Code Quality** | **10%** | Clean TypeScript (`tsc --noEmit` 0 errors), CORS headers, persistent storage, and multi-stage Docker containerization. |

---

## 🐳 6. Containerization & Deployment

AuraLearn includes a production-ready `Dockerfile` and `docker-compose.yml`:
* **Multi-Stage Build**: Separates TypeScript compilation & Vite bundling from the lightweight production Node.js runner stage.
* **Health Monitoring**: Integrated container health check endpoint (`/api/health`).
* **Single Command Execution**: `docker-compose up --build -d`.

---

## 🔚 Conclusion

AuraLearn provides a complete, robust, enterprise-grade solution to the challenge of personalized learning path recommendation. Combining cutting-edge generative AI, strict schema enforcement, transparent explainability, and quantitative radar analytics, AuraLearn sets a new standard for AI-powered education.
