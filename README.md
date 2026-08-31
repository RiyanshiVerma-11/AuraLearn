<div align="center">

<img src="public/logo.png" width="110" height="110" alt="AuraLearn Logo" style="border-radius: 22px; shadow: 0 10px 25px rgba(0,0,0,0.3);" />

# AuraLearn

### **Autonomous AI Learning Architect, Skill Gap Engine & PWA**

*Personalized, Prerequisite-Aware Curriculum Pathways powered by Dual Gemini + Groq AI Resilience, React 19, Tailwind CSS v4, and Express Node.js.*

<br/>

[![Live App Demo](https://img.shields.io/badge/🚀_Live_App_Demo-aura--learn--wine.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aura-learn-wine.vercel.app/)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Docker Container](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![GitHub Actions CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions)](https://github.com/RiyanshiVerma-11/AuraLearn/actions)
[![Dual AI Engine](https://img.shields.io/badge/AI-Gemini%20%2B%20Groq-8E75FF?logo=google)](https://ai.google.dev/)

---

[Features](#-key-features) • [Architecture](#-system-architecture) • [Local Setup](#-step-by-step-local-setup) • [Docker Setup](#-docker-container-setup) • [API Specs](#-api-endpoints-reference) • [Offline Resilience](#-air-gapped-resilience) • [License](#-license)

</div>

---

## 📖 Overview

Standard online learning recommendation platforms recommend isolated videos or generic playlists without understanding **prerequisites**, **skill gap vectors**, or **learner weekly availability**. 

**AuraLearn** is an enterprise-grade AI learning architect platform. It acts as an autonomous Principal AI Learning Architect—ingesting a learner's background via **GitHub public repository analysis**, **AI resume/bio extraction**, or **standardized 1–5 rubrics**, analyzing target roles, baseline vs target skills, weekly commitment hours, and preferred learning modalities to build **explainable, milestone-driven Directed Acyclic Graph (DAG) learning roadmaps**.

---

## ✨ Key Features

### 🔍 1. Automated Diagnostic Skill Ingestion & Profiling
- **GitHub Repository Analysis**: Connects with the GitHub API to parse up to 20 public repositories, analyzes language byte distributions, and algorithmically estimates skill levels based on production code footprint.
- **AI Resume & Bio Extraction (`POST /api/extract-skills`)**: LLM-powered extraction from resume snippets, LinkedIn bios, or self-descriptions with automated proficiency rating.
- **Standardized 1–5 Skill Rubrics**: Concrete competency descriptors from Novice (Level 1) to Expert (Level 5) with interactive tooltips and pre-merge review.

### 🗺️ 2. Prerequisite-Aware DAG Roadmap Generator
- Generates 3–5 logical sequential phases (Foundational Bridge $\rightarrow$ Core Systems $\rightarrow$ Applied Capstones $\rightarrow$ Mastery).
- Explicit prerequisite binding between milestone steps to eliminate sequencing confusion.
- Assigns actionable hands-on deliverables, skills acquired, and estimated hours per step.

### 🧠 3. Transparent AI Explainability Engine
- Every milestone step and recommended resource includes explicit AI rationale (`reasoning` & `aiWhyRecommended`).
- Explains *why* a topic was included by referencing the user's specific skill gap delta vector (e.g., *"Recommended because your baseline in Vector DBs is at 20% while your target role demands 85%"*).

### 📊 4. Executive Telemetry & Radar Analytics
- **Skill Gap Radar (`SkillGapVisualizer`)**: Quantitative 0–100 comparison between current capabilities vs target role requirements.
- **Learning Velocity & Role Readiness (`LearningVelocityChart`)**: Dynamic completion forecast burn-up curves reacting in real-time to weekly hour adjustments.
- **Curriculum Modality Matrix (`CurriculumModalityMatrix`)**: Visual allocation across hands-on labs, video courses, RFCs/theory, and case studies.

### 💬 5. Conversational AI Learning Advisor (Aura)
- Contextual side-panel AI mentor for real-time path calibration powered by full GFM markdown rendering (`react-markdown` + `remark-gfm`).
- Rich, beautifully formatted responses with category badges, structured bullet lists, code syntax blocks, and styled external link cards.
- Full context injection: Aura retains your exact profile, active roadmap, skill gap vector, and chat history across turns.
- Interactive quick-action buttons allowing learners to instantly adapt timelines, view free resources, or trigger capstone project builds.

### 📝 6. Milestone Assessments & Code Review Evaluator
- Embedded 3-question diagnostic check quizzes with immediate explanation feedback per step.
- **AI Code Review Evaluator (`reviewRoutes.ts`)**: Automated rubric grading for code submissions (Functionality, Architecture, Cleanliness, Security).

### 📱 7. Progressive Web App (PWA) Support
- Fully installable PWA with custom service worker, offline web manifest, and iOS/Android home screen support.
- Offline caching fallback ensures user profile, active roadmaps, and learning progress remain available without internet connectivity.

### 📅 8. Calendar Export & Executive Certificate
- One-click `.ics` Calendar Export for Google Calendar, Apple Calendar, and Outlook with customized milestone scheduling.
- **Executive Completion Certificate**: Generates verifiable, personalized certificates with learner name, career path target, credential tier, and completion date.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |         React 19 Client (PWA)         |
                                  |  (Vite + Tailwind CSS v4 + Recharts)  |
                                  +-------------------+-------------------+
                                                      |
                                                      |  HTTP / REST API (JSON)
                                                      v
                                  +---------------------------------------+
                                  |        Express Node.js Server         |
                                  |  (Bundled via esbuild to server.cjs)  |
                                  +-------------------+-------------------+
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                  |                                  |
                   v                                  v                                  v
 +-----------------------------------+ +-----------------------------------+ +-----------------------------------+
 |     Primary AI Engine (Gemini)    | |    Failover AI Engine (Groq)    | |    Air-Gapped Resilient Engine    |
 |      (gemini-2.5-flash)           | |       (openai/gpt-oss-120b)       | |     Local Deterministic Engine    |
 |  Server Schema Enforcement        | |  Full Profile & Roadmap Context | |    (Zero Downtime Offline Mode) |
 +-----------------------------------+ +-----------------------------------+ +-----------------------------------+
```

---

## ⚡ Step-by-Step Local Setup

### Prerequisites

- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/RiyanshiVerma-11/AuraLearn.git
cd AuraLearn
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root directory (or use default configuration):

```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: SMTP Email Configuration for Auth OTP Delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=AuraLearn <your_email@gmail.com>
```

> **Note**: If `GEMINI_API_KEY` is omitted or invalid, AuraLearn automatically activates its **Air-Gapped Resilient Fallback Engine**, ensuring the platform remains 100% operational offline.

### Step 3: Run Development Server

```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:4000`**.

### Step 4: Verify System Health

You can verify the backend status by calling:
```bash
curl http://localhost:4000/api/health
```

---

## 🐳 Docker Container Setup

AuraLearn is fully containerized with a production multi-stage Docker build.

### Option A: Using Docker Compose (Recommended)

To launch the complete application with Docker Compose:

```bash
# Build and start container in detached mode
docker-compose up --build -d
```

Access the application at **`http://localhost:4000`**.

To view logs:
```bash
docker-compose logs -f
```

To stop the container:
```bash
docker-compose down
```

### Option B: Using Standalone Docker Commands

```bash
# 1. Build Docker Image
docker build -t auralearn:latest .

# 2. Run Container
docker run -d -p 4000:4000 --name auralearn_app --env-file .env auralearn:latest
```

---

## 🚀 Production Build (Without Docker)

```bash
# 1. Typecheck & Validate
npx tsc --noEmit

# 2. Build Production Bundle (Vite Frontend + Express Server)
npm run build

# 3. Start Production Server
npm run start
```

---

## 🔌 API Endpoints Reference

All API routes are hosted under the `/api` namespace:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user and issue an email/dev OTP. |
| `POST` | `/api/auth/verify-otp` | Verify OTP code and activate account. |
| `POST` | `/api/auth/login` | Authenticate user via password or magic link. |
| `GET`  | `/api/auth/me` | Retrieve authenticated user session details. |
| `POST` | `/api/extract-skills` | Extracts structured technical skills and 1–5 proficiency levels from resume or bio text via Gemini. |
| `POST` | `/api/generate-roadmap` | Accepts user profile JSON and generates a full DAG roadmap with skill gaps and quizzes. |
| `POST` | `/api/adapt-roadmap` | Re-optimizes an existing roadmap based on natural language feedback. |
| `POST` | `/api/chat-advisor` | Contextual conversational agent returning messages & profile updates. |
| `POST` | `/api/generate-step-deepdive` | Generates deep-dive lesson syllabi, code snippets, and takeaways for a step. |
| `POST` | `/api/review-deliverable` | Evaluates submitted code against a multi-point quality rubric. |
| `GET`  | `/api/health` | Health check endpoint returning system & AI status. |

---

## 🛡️ Air-Gapped Resilience & Fallback Mode

AuraLearn is built for zero downtime:
- **Zero Crash Guarantee**: If network connectivity drops or the AI API quota is exceeded, the server seamlessly degrades to deterministic local fallback generators (`server/fallbacks/*`).
- **Schema Validation**: All Gemini responses are parsed and validated against rigid JSON Schemas (`server/schemas.ts`) to prevent malformed data structures.

---

## 📁 Repository Structure

```
├── docs/                # Architecture, AI specifications & persona documentation
│   ├── AuraLearn_Solution_Documentation.md  # Formal solution architecture & AI specs
│   ├── AGENTS.md        # System persona & engineering conventions
│   └── GEMINI.md        # Gemini configuration & context
├── server/
│   ├── routes/          # Express API route handlers (auth, roadmap, chat, deepdive, review, skills)
│   ├── fallbacks/       # Deterministic offline fallback generators
│   ├── data/            # Persistent JSON file storage (store.json)
│   ├── app.ts           # Express application initialization with CORS
│   ├── gemini.ts        # Lazy Gemini AI client & failover execution engine
│   └── schemas.ts       # Single-source JSON Schemas for Gemini outputs
├── src/
│   ├── components/      # React UI component library (24+ modular components)
│   ├── services/        # Frontend REST API client (`apiService.ts`)
│   ├── utils/           # Calendar export (.ics), statistics & helper utilities
│   ├── data/            # Career presets & sample profile templates
│   ├── types.ts         # Central TypeScript interfaces & domain types
│   ├── App.tsx          # Root application container & view manager
│   └── index.css        # Tailwind CSS v4 styling & tokens
├── Dockerfile           # Multi-stage production container manifest
├── docker-compose.yml   # Container orchestration manifest
├── server.ts            # Main Node.js server entry point (Vite dev middleware / static dist)
├── package.json         # Project dependencies & scripts
├── tsconfig.json        # TypeScript compiler configuration
└── vite.config.ts       # Vite build configuration
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
