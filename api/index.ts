import { createServer } from "http";

import express from "express";

import { registerRoutes } from "../server/routes.js";

const app = express();
const httpServer = createServer(app);

console.log("[api] initializing...");

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

registerRoutes(httpServer, app);

console.log("[api] routes registered");

export default app;
