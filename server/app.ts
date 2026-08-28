import express, { Express } from "express";
import { roadmapRouter } from "./routes/roadmapRoutes";
import { chatRouter } from "./routes/chatRoutes";
import { deepdiveRouter } from "./routes/deepdiveRoutes";
import { healthRouter } from "./routes/healthRoutes";
import { reviewRouter } from "./routes/reviewRoutes";
import { authRouter } from "./routes/authRoutes";
import { feedbackRouter } from "./routes/feedbackRoutes";

/**
 * Creates and configures the Express application with all API routers.
 */
export function createExpressApp(): Express {
  const app = express();

  // Middleware for CORS & body parsing
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API Route Mounting
  app.use("/api", healthRouter);
  app.use("/api", roadmapRouter);
  app.use("/api", chatRouter);
  app.use("/api", deepdiveRouter);
  app.use("/api", reviewRouter);
  app.use("/api", authRouter);
  app.use("/api", feedbackRouter);

  return app;
}
