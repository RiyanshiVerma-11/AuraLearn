import { Router, Request, Response } from "express";
import { getGeminiApiKey } from "../gemini";

export const healthRouter = Router();

// GET /api/health
healthRouter.get("/health", (_req: Request, res: Response) => {
  const hasKey = !!getGeminiApiKey();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "auralearn-backend",
    environment: process.env.NODE_ENV || "development",
    geminiConfigured: hasKey,
  });
});
