import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { n8nResponseSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const DEFAULT_USER_ID = "demo-user";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/upload-ledger", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const userId = (req.body.userId as string) || DEFAULT_USER_ID;
      const host = req.get("host") || `${req.hostname}:${process.env.PORT || "5000"}`;
      const fileUrl = `${req.protocol}://${host}/api/files/${req.file.filename}`;

      const report = await storage.createReport({
        userId,
        status: "processing",
        healthScore: null,
        anomalies: null,
        chartData: null,
        expenseBreakdown: null,
        aiCommentary: null,
        fileName: req.file.originalname,
      });

      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nWebhookUrl) {
        fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: report.id,
            userId,
            fileUrl,
            fileName: req.file.originalname,
          }),
        }).catch((err) => {
          console.error("Failed to dispatch to n8n:", err);
          storage.updateReportStatus(report.id, "failed");
        });
      }

      return res.status(202).json({
        message: "File uploaded and processing started",
        reportId: report.id,
        status: "processing",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: error.message || "Upload failed" });
    }
  });

  app.get("/api/files/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).json({ message: "File not found" });
  });

  app.post("/api/webhook/n8n-response", async (req, res) => {
    try {
      const parsed = n8nResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid payload",
          errors: parsed.error.flatten(),
        });
      }

      const updated = await storage.updateReportWithResults(
        parsed.data.reportId,
        parsed.data
      );

      if (!updated) {
        return res.status(404).json({ message: "Report not found" });
      }

      return res.json({ message: "Report updated successfully", reportId: updated.id });
    } catch (error: any) {
      console.error("Webhook error:", error);
      return res.status(500).json({ message: error.message || "Webhook processing failed" });
    }
  });

  app.get("/api/reports/latest", async (req, res) => {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;
    const report = await storage.getLatestReportByUser(userId);
    if (!report) {
      return res.status(404).json({ message: "No reports found" });
    }
    return res.json(report);
  });

  app.get("/api/reports/:id", async (req, res) => {
    const report = await storage.getReport(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    return res.json(report);
  });

  app.get("/api/reports", async (req, res) => {
    const userId = (req.query.userId as string) || DEFAULT_USER_ID;
    const reports = await storage.getReportsByUser(userId);
    return res.json(reports);
  });

  return httpServer;
}
