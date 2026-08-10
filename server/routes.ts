import crypto from "crypto";
import fs from "fs";
import path from "path";

import type { Express } from "express";
import rateLimit from "express-rate-limit";
import type { Server } from "http";
import { createServer } from "http";
import multer from "multer";

import { n8nResponseSchema } from "@shared/schema";
import { verifyN8nSignature } from "./middleware/verifyN8nSignature";
import { toClientError } from "./utils/errors";
import { storage } from "./storage";

// ── Upload directory ──────────────────────────────────────────────────────────

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Multer configuration ──────────────────────────────────────────────────────

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, _file, cb) => {
      // [FIX-C5/N-5] Use a UUID as the stored filename.
      // - Never embed originalname in the stored filename (attacker-controlled).
      // - UUID provides sufficient collision resistance under concurrent uploads.
      // - The original filename is preserved in the DB report.fileName column.
      const uniqueName = `${crypto.randomUUID()}.csv`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    // [FIX-HIGH] Require BOTH mimetype AND extension to match (AND, not OR).
    // An attacker cannot bypass this by renaming a file to ".csv".
    const isCSV =
      file.mimetype === "text/csv" && file.originalname.toLowerCase().endsWith(".csv");
    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed."));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Rate limiters ─────────────────────────────────────────────────────────────

// [FIX-C5] Prevent disk-exhaustion DoS via unbounded upload requests.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // max 10 uploads per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload requests. Please try again later." },
});

// General API rate limiter to protect database pool from excessive polling
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// [FIX-C3] Identity comes from the server, never from the client.
// TODO: Replace with req.session.userId once passport auth is implemented.
const DEFAULT_USER_ID = "demo-user";

// ── Route registration ────────────────────────────────────────────────────────

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Apply general API rate limiting to all /api/ endpoints
  app.use("/api", apiLimiter);

  // ── POST /api/upload-ledger ────────────────────────────────────────────────
  app.post("/api/upload-ledger", uploadLimiter, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded." });
      }

      // [FIX-C3] userId is server-controlled. In this demo build it is fixed.
      // TODO: Replace with req.session.userId after auth is implemented.
      const userId = DEFAULT_USER_ID;

      // [FIX-M6] fileUrl is built from a trusted env var, not the attacker-controlled Host header.
      const baseUrl =
        process.env.SERVER_BASE_URL ?? `http://localhost:${process.env.PORT ?? "5000"}`;
      const fileUrl = `${baseUrl}/api/files/${req.file.filename}`;

      const report = await storage.createReport({
        userId,
        status: "processing",
        healthScore: null,
        anomalies: null,
        chartData: null,
        expenseBreakdown: null,
        aiCommentary: null,
        // Store the original filename for display; the stored filename is a UUID.
        fileName: req.file.originalname,
      });

      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
        // [FIX-H2] The outer fetch is intentionally fire-and-forget (non-blocking 202).
        // The .catch handler now properly awaits the status update and logs both failures.
        void fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10_000),
          body: JSON.stringify({
            reportId: report.id,
            userId,
            fileUrl,
            fileName: req.file.originalname,
          }),
        }).catch(async (dispatchErr: unknown) => {
          console.error("[n8n dispatch] Failed to send to n8n:", dispatchErr);
          try {
            await storage.updateReportStatus(report.id, "failed");
          } catch (dbErr: unknown) {
            console.error(
              "[n8n dispatch] CRITICAL: Could not mark report as failed after dispatch error:",
              dbErr
            );
          }
        });
      }

      return res.status(202).json({
        message: "File uploaded and processing started.",
        reportId: report.id,
        status: "processing",
      });
    } catch (error: unknown) {
      console.error("[upload-ledger]", error);
      const { status, message } = toClientError(error);
      return res.status(status).json({ message });
    }
  });

  // ── GET /api/files/:filename ───────────────────────────────────────────────
  app.get("/api/files/:filename", (req, res) => {
    // [FIX-C1] Path traversal fix.
    // path.basename strips ALL directory components:
    //   "../../etc/passwd" → "passwd"
    //   "..%2F..%2Fdb.ts" → already decoded by Express → "db.ts" (then basename → "db.ts")
    const safeFilename = path.basename(req.params.filename);

    const resolvedPath = path.resolve(path.join(uploadDir, safeFilename));
    const resolvedUploadDir = path.resolve(uploadDir);

    // Belt-and-suspenders: verify the resolved path stays inside uploadDir
    if (!resolvedPath.startsWith(resolvedUploadDir + path.sep)) {
      return res.status(400).json({ message: "Invalid filename." });
    }
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: "File not found." });
    }
    return res.sendFile(resolvedPath);
  });

  // ── POST /api/webhook/n8n-response ────────────────────────────────────────
  // [FIX-C2] verifyN8nSignature middleware: validates HMAC-SHA256 x-n8n-signature header.
  // Requests without a valid signature are rejected with 401 before reaching the handler.
  app.post("/api/webhook/n8n-response", verifyN8nSignature, async (req, res) => {
    try {
      const parsed = n8nResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid payload.",
          errors: parsed.error.flatten(),
        });
      }

      const updated = await storage.updateReportWithResults(parsed.data.reportId, parsed.data);

      if (!updated) {
        return res.status(404).json({ message: "Report not found." });
      }

      return res.json({ message: "Report updated successfully.", reportId: updated.id });
    } catch (error: unknown) {
      console.error("[webhook/n8n-response]", error);
      const { status, message } = toClientError(error);
      return res.status(status).json({ message });
    }
  });

  // ── GET /api/reports/latest ────────────────────────────────────────────────
  // [FIX-C3] userId is server-controlled.
  // TODO: Replace DEFAULT_USER_ID with req.session.userId after auth is implemented.
  app.get("/api/reports/latest", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const report = await storage.getLatestReportByUser(userId);
      if (!report) {
        return res.status(404).json({ message: "No reports found." });
      }
      return res.json(report);
    } catch (error: unknown) {
      console.error("[reports/latest]", error);
      const { status, message } = toClientError(error);
      return res.status(status).json({ message });
    }
  });

  // ── GET /api/reports/:id ───────────────────────────────────────────────────
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found." });
      }
      // TODO: Add ownership check: if (report.userId !== req.session.userId) return 403
      return res.json(report);
    } catch (error: unknown) {
      console.error("[reports/:id]", error);
      const { status, message } = toClientError(error);
      return res.status(status).json({ message });
    }
  });

  // ── GET /api/reports ───────────────────────────────────────────────────────
  // [FIX-C3] userId is server-controlled.
  // [FIX-H1] Pagination params added — prevents unbounded DB result sets.
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = DEFAULT_USER_ID;
      const limit = Math.min(Number(req.query.limit) || 50, 100); // cap at 100
      const offset = Number(req.query.offset) || 0;
      const reports = await storage.getReportsByUser(userId, limit, offset);
      return res.json(reports);
    } catch (error: unknown) {
      console.error("[reports]", error);
      const { status, message } = toClientError(error);
      return res.status(status).json({ message });
    }
  });

  return httpServer;
}

// Re-export createServer so callers that import from routes still compile
export { createServer };
