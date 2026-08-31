# 📑 AuraLearn — Comprehensive Solution Architecture & Technical Documentation

> **Project Name**: AuraLearn (AI-Powered Personalized Learning Path Recommender)  
> **System Category**: AI/ML Personalized Education, Adaptive Curricula & Career Transition  
> **Version**: 2.0.0 Production Release  
> **Core AI Models**: Google Gemini 3.7 Flash & 2.5 Flash with Strict JSON Schema Enforcement  

---

## 📋 Executive Summary

In today's digital landscape, online learning platforms host millions of courses and tutorials across hundreds of engineering and technology domains. However, self-directed learners face the **Sequencing & Personalization Paradox**:
1. **Curriculum Fragmentation**: Disconnected tutorials with no clear prerequisite mapping or knowledge graph.
2. **Skill Gap Ambiguity**: Inability to quantify the exact mathematical distance between a learner's baseline and industry role requirements.
3. **Black-Box AI Recommendations**: Generic recommendations that fail to explain *why* a course was recommended and how it directly bridges a specific competency gap.
4. **Static Timelines**: Inflexible schedules that fail to adapt when real-world availability fluctuates.

**AuraLearn** solves this challenge by serving as an autonomous **Principal AI Learning Architect**. Built on a high-performance modern web stack with server-side **Google Gemini AI**, AuraLearn ingests a learner's background (via manual input, GitHub repo analysis, or AI resume parsing), constructs **explainable, prerequisite-aware Directed Acyclic Graph (DAG) roadmaps**, dynamically computes **Skill Gap Radar vectors**, forecasts completion timelines via a live **Learning Velocity burn-up model**, evaluates code deliverables with an **AI Code Reviewer**, and supports real-time conversational roadmap adaptation.

---

## 🎯 1. Problem Understanding & Solution Approach

### The Core Challenges
* **One-Size-Fits-All Inefficiency**: Static syllabi assume all students start from the same baseline and learn at uniform velocity.
* **Prerequisite Traps**: Skipping foundational requirements leads to high dropout rates when learners hit advanced concepts.
* **Lack of Diagnostic Depth**: Asking users "What do you know?" without granular rubrics results in noisy, inaccurate inputs.
* **Non-Explainable AI**: Opaque recommendations erode learner trust and commitment.

### The AuraLearn Solution Pillars

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         AuraLearn Core Solution Matrix                           │
├──────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. Diagnostic Profiling  │ Multi-modal onboarding via manual 1–5 rubrics, GitHub │
│    & Ingestion Engine    │ repo language parsing, and AI resume/bio extraction.  │
├──────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. DAG Roadmap           │ Multi-phase prerequisite architecture sequencing      │
│    Generator             │ milestones, estimated hours, and deliverables.       │
├──────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Transparent AI        │ Mathematical skill gap vectors (Current % vs Target %) │
│    Explainability        │ with human-readable rationale callouts per step.      │
├──────────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Executive Telemetry   │ Recharts-powered Skill Gap Radar, dynamic Learning    │
│    & Analytics Dashboard │ Velocity Burn-up curve, and Modality Matrix.          │
├──────────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Interactive Learning  │ Step syllabus, diagnostic assessments with instant    │
│    & AI Code Reviewer    │ reasoning feedback, and 4-tier rubric code review.    │
├──────────────────────────┼───────────────────────────────────────────────────────┤
│ 6. Conversational AI     │ Natural language chat assistant (Aura) allowing       │
│    Roadmap Adaptation    │ dynamic timeline and milestone recalibration on-demand│
└──────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 🏛️ 2. Technical Architecture & System Design

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AuraLearn Architecture                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [ Client Layer: Modern React 19 SPA ]
   │
   ├── UI Components: Tailwind CSS v4, Motion Transitions, Lucide Icons
   ├── Data Visualizations: Recharts (Radar, Area Burn-up, Modality Composed Charts)
   ├── Interactive Engines: DAG Visualizer, Quiz Evaluator, Code Review Playground
   └── Persistence Layer: Browser localStorage + State Synchronization
   │
   ▼ HTTP REST / JSON
 [ Server Layer: Node.js Express API Server ]
   │
   ├── Middleware: CORS, JSON Parsing, Vite SPA Integration, Error Handlers
   ├── Security & Auth: PBKDF2 Password Hashing, Session Store, SMTP OTP Delivery
   ├── Strict Schema Enforcer: Server-side JSON schema validation (@google/genai)
   │
   ├──► [ Primary AI Engine: Google Gemini 3.7 / 2.5 Flash API ]
   │      • Structured System Prompts & Rigid JSON Schemas
   │      • Low-Latency Structured Reasoning & Explainability Generation
   │
   ├──► [ Secondary Failover: Groq Inference Engine ]
   │      • High-speed backup for uninterrupted uptime
   │
   └──► [ Air-Gapped Resiliency: Local Deterministic Fallback Generator ]
          • Zero-crash offline guarantee when external networks/keys are absent
```

---

## 🔬 3. Detailed Component Breakdown

### 1. Ingestion & Diagnostic Profiling (`LearnerProfileEngine.tsx`)
* **Standardized 1–5 Skill Rubrics**: Replaces vague self-assessments with concrete competency levels (Level 1: Novice, Level 2: Beginner, Level 3: Intermediate, Level 4: Proficient, Level 5: Expert).
* **GitHub Repository Scraping**: Direct integration with the GitHub Public API to analyze up to 20 user repositories, calculate language byte distributions, and automatically assign skill levels based on production repo counts.
* **AI Resume / Bio Extraction (`POST /api/extract-skills`)**: Server-side Gemini model that processes raw resume text, CV markdown, or LinkedIn bios to extract technical skills and confidence scores.

### 2. Explainable DAG Roadmap Generator (`RoadmapGraphView.tsx`)
* **Milestone Dependency Graph**: Visual Directed Acyclic Graph (DAG) displaying phases, milestone nodes, locks, and prerequisite connectors.
* **Explainable AI (XAI) Callouts**: Every milestone contains an `aiWhyRecommended` statement explicitly detailing the mathematical gap vector (e.g., *"Recommended because your baseline in Vector Databases is 25% while your target role requires 85%"*).
* **Concrete Deliverables**: Hands-on project artifacts for portfolio building (e.g., CLI tools, microservice APIs, semantic search engines).

### 3. Executive Telemetry & Analytics Dashboard (`DashboardView.tsx`)
* **360° Skill Gap Radar (`SkillGapVisualizer.tsx`)**: Multi-axis radar comparing the user's current baseline against target industry standards across 4–6 competency vectors.
* **Dynamic Learning Velocity Burn-Up Chart (`LearningVelocityChart.tsx`)**: Interactive hours-per-week slider (e.g., 5h → 15h → 25h/week) that dynamically calculates project burn-up trajectory and updates the projected target completion date in real time.
* **Curriculum Modality Matrix (`CurriculumModalityMatrix.tsx`)**: Visual breakdown of pedagogical delivery (Hands-on Labs, Video Courses, RFC / Academic Reading, Diagnostic Checks).

### 4. Interactive Learning & Milestone Assessment (`MilestoneLearningView.tsx`)
* **Deep-Dive Syllabus**: In-depth conceptual breakdowns, key takeaways, and curated external resources (Coursera, DeepLearning.AI, GitHub repos).
* **Milestone Diagnostic Quizzes**: 3-question conceptual quizzes with immediate AI explanation feedback upon answering, confetti celebratory animations on passing, and real-time milestone status progression.
* **Live AI Deliverable & Code Reviewer**: Multi-language code submission playground (TypeScript, Python, Go, Rust, Java, C++) graded by Gemini on 4 criteria: Functionality (30%), Architecture (25%), Cleanliness (25%), and Security (20%).

### 5. Conversational AI Advisor & Adaptive Recalibration (`ConversationalAdvisor.tsx`)
* **Aura AI Advisor**: Context-aware assistant that maintains the user's active roadmap state.
* **Dynamic Pathway Adaptation (`POST /api/adapt-roadmap`)**: Allows users to issue natural language instructions (e.g., *"I already know PyTorch well. Focus more on LLM evals and RLHF."*) and instantly re-indexes upcoming milestones while preserving completed milestones.

### 6. Calendar Export & Executive Certificate (`ExportRoadmapModal.tsx` & `CertificateModal.tsx`)
* **Calendar Sync**: Exports customized `.ics` calendar schedules compatible with Google Calendar, Apple Calendar, and Outlook based on the user's weekly study allocation.
* **Executive Completion Certificate**: Generates a verifiable, personalized certificate with learner name, career path target, credential tier, and completion timestamp.

---

## 🧠 4. AI/ML Engineering & Schema Enforcement

All generative AI workflows run server-side to secure API credentials and guarantee JSON schema integrity.

```typescript
// Strict Response Schema for Structured AI Roadmap Generation
export const RoadmapResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    targetRole: { type: Type.STRING },
    totalEstimatedWeeks: { type: Type.NUMBER },
    totalEstimatedHours: { type: Type.NUMBER },
    difficulty: { type: Type.STRING },
    summary: { type: Type.STRING },
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
        required: ["skill", "category", "currentProficiency", "targetProficiency", "gapSeverity", "importance", "recommendedFocus"],
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
          reasoning: { type: Type.STRING },
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
                url: { type: Type.STRING },
                type: { type: Type.STRING },
                estimatedHours: { type: Type.NUMBER },
                isFree: { type: Type.BOOLEAN },
              },
              required: ["id", "title", "provider", "url", "type", "estimatedHours", "isFree"],
            },
          },
        },
        required: ["id", "title", "shortSummary", "detailedDescription", "phaseIndex", "phaseName", "estimatedHours", "order", "prerequisites", "skillsAcquired", "deliverable", "reasoning", "aiWhyRecommended", "resources"],
      },
    },
  },
  required: ["title", "targetRole", "totalEstimatedWeeks", "totalEstimatedHours", "difficulty", "summary", "aiPersonalizationNotes", "skillGaps", "phases", "steps"],
};
```

---

## 🛡️ 5. Resiliency, Security & Multi-Tier Failover

AuraLearn is engineered for zero downtime and enterprise fault tolerance:
1. **Primary Model**: Google Gemini 3.7 Flash / Gemini 2.5 Flash via `@google/genai`.
2. **Secondary Failover**: Groq Llama 3.3 70B inference engine for API rate-limit resilience.
3. **Deterministic Local Fallbacks**: Offline fallback generators in `server/fallbacks/*` guaranteeing zero-crash operation even in complete air-gapped environments.
4. **Authentication & SMTP Delivery**: Cryptographic password hashing (PBKDF2 with salt) and real-world SMTP HTML verification emails with 6-digit auto-focusing OTP inputs.

---

## 📊 6. Hackathon & Submission Criteria Matrix

| Evaluation Criteria | Weight | How AuraLearn Exceeds Requirements |
| :--- | :--- | :--- |
| **Problem Understanding & Solution Design** | **20%** | Comprehensive Directed Acyclic Graph (DAG) learning paths, granular 1–5 rubrics, and dynamic hours velocity modeling. |
| **Functionality & Feature Completeness** | **25%** | Complete end-to-end implementation: Profiling, DAG Roadmap, Explainable AI, Telemetry Dashboard, Live Code Reviewer, Conversational Advisor, and Calendar Sync. |
| **AI/ML Technical Implementation** | **20%** | Server-side Gemini 3.7/2.5 integration with rigid TypeScript schemas, automated resume skill extraction, and multi-tier failover. |
| **Innovation & User Experience** | **20%** | Modern glassmorphism UI, real-time Learning Velocity projections, instant quiz explanation feedback, and GitHub repository skill scraping. |
| **Code Quality, Testing & DevOps** | **15%** | 100% clean TypeScript build (`tsc --noEmit` 0 errors), Vitest test suite, multi-stage Docker containerization, and automated GitHub Actions CI/CD pipeline. |

---

## 🚀 7. Quickstart & Deployment Guide

### Local Development Setup
```bash
# 1. Clone the repository
git clone https://github.com/RiyanshiVerma-11/AuraLearn.git
cd AuraLearn

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000

# 4. Start full-stack development server
npm run dev
# App will run at http://localhost:4000
```

### Automated Testing & Linting
```bash
# Run TypeScript compilation check
npm run lint

# Run Vitest unit test suite
npm run test
```

### Docker Deployment
```bash
docker compose up --build
```

---

## 🏁 Conclusion

AuraLearn sets a new benchmark for **AI-powered education and career transitions**. By combining **Explainable AI (XAI)**, **prerequisite-aware graph architecture**, **automated skill ingestion**, and **data-driven velocity tracking**, AuraLearn empowers learners worldwide to reach their career goals with clarity, precision, and confidence.
