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
app.use(async (_req, _res, next) => {
  if (!seeded) {
    seeded = true;
    try {
      const { seedDatabase } = await import("../server/seed.js");
      await seedDatabase();
    } catch {
      // ignore seed errors
    }
  }
  next();
});

export default app;
