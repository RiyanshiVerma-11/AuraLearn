# AuraLearn Context & Configuration for Gemini

## Overview
AuraLearn is a full-stack, AI-powered personalized learning path recommender that creates customized curriculum roadmaps, prerequisites, deep-dive syllabi, and multi-dimensional analytics.

## Core Rules for Gemini Operations
1. Always maintain TypeScript type safety (`npm run lint` / `tsc --noEmit`).
2. Keep all Gemini API calls server-side in `/server/routes/` and execute them via `executeWithGeminiFailover` in `server/gemini.ts`.
3. Adhere to the single-source-of-truth schema definitions in `server/schemas.ts` and `src/types.ts`.
4. Ensure all user modifications to roadmaps (calibration, pace adjustments) update the milestone DAG, skill gap deltas, and burn-up forecast curves in sync.
