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

export default app;
