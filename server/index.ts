import { createServer } from "http";

import express, { json, urlencoded, type NextFunction, type Request, type Response } from "express";

import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed";
import { serveStatic } from "./static";

const app = express();
const httpServer = createServer(app);

// [FIX-C2] rawBody must be Buffer, not unknown — required for HMAC signature verification.
// The verify callback receives a Buffer from the Node.js stream; the type declaration was lying.
declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer;
  }
}

app.use(
  json({
    verify: (req, _res, buf) => {
      // Store the raw request body so the webhook middleware can compute HMAC over it.
      req.rawBody = buf;
    },
  })
);

app.use(urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // eslint-disable-next-line no-console
  console.log(`${formattedTime} [${source}] ${message}`);
}

// [FIX-N-6/M7] Logging middleware — logs method, path, status, duration, and response SIZE.
// Previously logged the entire JSON body (financial report data = 2-10 KB per request).
// Never log full response bodies — they contain financial data and PII.
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  // [FIX-N-6] Replace `Record<string, any>` with `Record<string, unknown>`
  let responseBodySize = 0;

  const originalResJson = res.json;
  res.json = function (bodyJson: unknown, ..._args: unknown[]) {
    try {
      responseBodySize = JSON.stringify(bodyJson).length;
    } catch {
      responseBodySize = -1;
    }
    return originalResJson.apply(res, [bodyJson] as Parameters<typeof originalResJson>);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      const sizeLabel = responseBodySize > 0 ? ` [${responseBodySize}b]` : "";
      log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms${sizeLabel}`);
    }
  });

  next();
});

void (async () => {
  registerRoutes(httpServer, app);

  await seedDatabase();

  // [FIX-C4] Global error handler — uses toClientError pattern.
  // err.status/statusCode are set by Express/multer for known HTTP errors (e.g., 413 Too Large).
  // For unknown errors, return 500 with a generic message — never expose error.message.
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    console.error("[global error handler]", err);

    if (res.headersSent) {
      return next(err);
    }

    // multer and express set status/statusCode on their error objects
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status: number }).status
        : typeof err === "object" && err !== null && "statusCode" in err
          ? (err as { statusCode: number }).statusCode
          : 500;

    // Expose only pre-approved user-facing messages (multer file filter errors, etc.)
    // Everything else is a generic 500
    const isKnownClientError = status >= 400 && status < 500;
    const message =
      isKnownClientError && err instanceof Error ? err.message : "An unexpected error occurred.";

    return res.status(status).json({ message });
  });

  // Serve Vite in development, static bundle in production
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n[CRITICAL] Port ${port} is already in use by another process.`);
      console.error(`To fix this, stop the running process or run: lsof -i :${port}\n`);
      process.exit(1);
    }
    throw err;
  });

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      ...(process.platform === "linux" ? { reusePort: true } : {}),
    },
    () => {
      log(`serving on port ${port}`);
    }
  );

  const shutdown = () => {
    log("Shutting down HTTP server...");
    httpServer.close(() => {
      log("HTTP server closed cleanly.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch(console.error);
