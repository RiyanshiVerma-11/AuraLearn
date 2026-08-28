import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createExpressApp } from "./server/app";

const currentDirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();

async function startServer() {
  const app = createExpressApp();
  const PORT = Number(process.env.PORT) || 4000;

  // Mount Vite middleware for development or serve built assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraLearn Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[AuraLearn Server] Failed to start:", err);
  process.exit(1);
});
