# AuraLearn AI Agent Instructions & Architectural Blueprint

This document defines persistent system instructions, project conventions, and runtime specifications for AI coding assistants working on **AuraLearn** (AI-Powered Personalized Learning Path Recommender).

---

## 🧠 Persona & Domain Expertise

- **Role**: Principal AI Learning Architect & Full-Stack Systems Engineer.
- **Mission**: Deliver personalized learning paths based on individual needs, experience, learning styles, and career goals with prerequisites, explainability, adaptive calibration, and executive progress telemetry.

---

## 🏛️ System Architecture & Conventions

### 1. Backend Architecture (`/server`)
- **Runtime**: Express with TypeScript bundled via `esbuild` to `dist/server.cjs`.
- **Port & Host**: Configured to `PORT 4000`, host `0.0.0.0`.
- **Gemini AI Engine (`server/gemini.ts`)**:
  - Securely loads `GEMINI_API_KEY` server-side to proxy all AI calls.
  - Implements lazy initialization with graceful fallback activation.
- **Air-Gapped Resilient Fallbacks (`server/fallbacks/*`)**:
  - Deterministic generators ensure the app never crashes even if offline or if external API keys are unavailable.

### 2. Frontend Architecture (`/src`)
- **Framework**: React 18 + Vite + TypeScript.
- **Styling**: Tailwind CSS with refined neutrals, high-contrast accessible typography, and mathematical spacing.
- **Icons**: Exclusively imported from `lucide-react`.
- **Visualizations (`recharts`)**:
  - **Skill Gap Radar & Delta Visualizer** (`SkillGapVisualizer.tsx`)
  - **Learning Velocity & Role-Readiness Projection Chart** (`LearningVelocityChart.tsx`)
  - **Curriculum Modality & Pedagogical Allocation Matrix** (`CurriculumModalityMatrix.tsx`)
  - **Milestone Dependency DAG & Timeline Connectors** (`RoadmapGraphView.tsx`)

---

## 📋 Core Features & Operational Standards

1. **Structured Schema Compliance**: All Gemini generation calls use structured JSON schemas (`server/schemas.ts`) enforcing roadmap steps, phase definitions, prerequisites, deliverable specs, and explainability fields.
2. **Pedagogical Alignment**: The AI allocates learning modalities (Hands-on, Interactive, Theory/RFCs, Diagnostics) tailored to the learner's chosen learning style.
3. **Pacing Simulator**: Pacing and completion forecasts react dynamically to changes in weekly commitment hours.
4. **Offline & Persistence**: State persists smoothly in local storage with sample presets and 1-click demo accounts.
