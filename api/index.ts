import { createServer } from "http";

import express, { json, urlencoded } from "express";

import { registerRoutes } from "../server/routes.js";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

app.use(
  json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(urlencoded({ extended: false }));

registerRoutes(httpServer, app);

let seeded = false;
app.use(async (_req, res, next) => {
  if (!seeded) {
    seeded = true;
    try {
      const { seedDatabase } = await import("../server/seed.js");
      await seedDatabase();
    } catch (error) {
      console.error("[seed] Failed to seed database:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to initialize database." });
      }
      return;
    }
  }
  next();
});

export default app;
