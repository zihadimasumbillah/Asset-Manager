/**
 * Integration tests for server routes.
 *
 * Strategy: Mock the `storage` layer so we test routing + validation
 * logic without needing a live database. This keeps tests fast and
 * deterministic.
 *
 * For true E2E tests against a real DB, see tests/e2e/ (future).
 */

import crypto from "crypto";
import { createServer } from "http";

import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest"; // [FIX-T1] explicit vi import


// [FIX-T1] Correct relative path — this file lives in server/, so storage is a sibling
vi.mock("./storage", () => ({
  storage: {
    createReport: vi.fn(),
    getReport: vi.fn(),
    getLatestReportByUser: vi.fn(),
    getReportsByUser: vi.fn(),
    updateReportWithResults: vi.fn(),
    updateReportStatus: vi.fn(),
  },
}));

// Import after mock is set up
import { registerRoutes } from "./routes";
import { storage } from "./storage";

const mockedStorage = vi.mocked(storage);

// ── Webhook signature helper ──────────────────────────────────────────────────
// Generates a valid x-n8n-signature header for a given payload,
// using the test secret set in tests/setup.ts
function signPayload(payload: unknown): string {
  const secret = process.env.N8N_WEBHOOK_SECRET ?? "";
  const body = JSON.stringify(payload);
  const digest = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return `sha256=${digest}`;
}

// ── Test app factory ──────────────────────────────────────────────────────────
async function buildTestApp() {
  const app = express();
  // Mirror the rawBody capture from index.ts — required for HMAC verification
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody: Buffer }).rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: false }));
  registerRoutes(httpServer, app);
  return { app, httpServer };
}

// ── Fixture data ──────────────────────────────────────────────────────────────
const mockReport = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // valid UUID
  userId: "demo-user",
  status: "completed" as const,
  healthScore: 82,
  anomalies: [],
  chartData: [],
  expenseBreakdown: [],
  aiCommentary: "Strong growth.",
  fileName: "test.csv",
  createdAt: new Date(),
};

// ─────────────────────────────────────────────────────────────
// GET /api/reports
// ─────────────────────────────────────────────────────────────
describe("GET /api/reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns reports array for a user", async () => {
    mockedStorage.getReportsByUser.mockResolvedValue([mockReport]);
    const { app } = await buildTestApp();

    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(mockReport.id);
  });

  it("returns empty array when no reports exist", async () => {
    mockedStorage.getReportsByUser.mockResolvedValue([]);
    const { app } = await buildTestApp();

    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("passes limit and offset to storage", async () => {
    mockedStorage.getReportsByUser.mockResolvedValue([]);
    const { app } = await buildTestApp();

    await request(app).get("/api/reports?limit=10&offset=20");
    expect(mockedStorage.getReportsByUser).toHaveBeenCalledWith("demo-user", 10, 20);
  });

  it("caps limit at 100", async () => {
    mockedStorage.getReportsByUser.mockResolvedValue([]);
    const { app } = await buildTestApp();

    await request(app).get("/api/reports?limit=9999");
    expect(mockedStorage.getReportsByUser).toHaveBeenCalledWith("demo-user", 100, 0);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/reports/:id
// ─────────────────────────────────────────────────────────────
describe("GET /api/reports/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with report when found", async () => {
    mockedStorage.getReport.mockResolvedValue(mockReport);
    const { app } = await buildTestApp();

    const res = await request(app).get(`/api/reports/${mockReport.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(mockReport.id);
  });

  it("returns 404 when report does not exist", async () => {
    mockedStorage.getReport.mockResolvedValue(undefined);
    const { app } = await buildTestApp();

    const res = await request(app).get("/api/reports/nonexistent-id");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/reports/latest
// ─────────────────────────────────────────────────────────────
describe("GET /api/reports/latest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with the latest report", async () => {
    mockedStorage.getLatestReportByUser.mockResolvedValue(mockReport);
    const { app } = await buildTestApp();

    const res = await request(app).get("/api/reports/latest");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(mockReport.id);
  });

  it("returns 404 when no reports exist for user", async () => {
    mockedStorage.getLatestReportByUser.mockResolvedValue(undefined);
    const { app } = await buildTestApp();

    const res = await request(app).get("/api/reports/latest");
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/webhook/n8n-response
// ─────────────────────────────────────────────────────────────
describe("POST /api/webhook/n8n-response", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validWebhookPayload = {
    reportId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // valid UUID
    healthScore: 75,
    anomalies: [{ severity: "Medium", description: "Some anomaly", variance: 10 }],
    chartData: [{ month: "Jan", revenue: 100000, expenses: 80000 }],
    expenseBreakdown: [{ category: "Payroll", amount: 50000, percentage: 50 }],
    aiCommentary: "Moderate health.",
  };

  it("returns 200 for a valid signed webhook payload", async () => {
    mockedStorage.updateReportWithResults.mockResolvedValue(mockReport);
    const { app } = await buildTestApp();

    const res = await request(app)
      .post("/api/webhook/n8n-response")
      .set("x-n8n-signature", signPayload(validWebhookPayload))
      .send(validWebhookPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("reportId");
    expect(mockedStorage.updateReportWithResults).toHaveBeenCalledWith(
      validWebhookPayload.reportId,
      expect.objectContaining({ healthScore: 75 })
    );
  });

  it("returns 401 when x-n8n-signature header is missing", async () => {
    const { app } = await buildTestApp();
    const res = await request(app)
      .post("/api/webhook/n8n-response")
      .send(validWebhookPayload); // no signature header

    expect(res.status).toBe(401);
  });

  it("returns 401 when x-n8n-signature is invalid", async () => {
    const { app } = await buildTestApp();
    const res = await request(app)
      .post("/api/webhook/n8n-response")
      .set("x-n8n-signature", "sha256=deadbeef")
      .send(validWebhookPayload);

    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid payload (missing required fields)", async () => {
    const { app } = await buildTestApp();
    const badPayload = { reportId: "not-a-uuid" };

    const res = await request(app)
      .post("/api/webhook/n8n-response")
      .set("x-n8n-signature", signPayload(badPayload))
      .send(badPayload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 when healthScore exceeds 100", async () => {
    const { app } = await buildTestApp();
    const badPayload = { ...validWebhookPayload, healthScore: 101 };

    const res = await request(app)
      .post("/api/webhook/n8n-response")
      .set("x-n8n-signature", signPayload(badPayload))
      .send(badPayload);

    expect(res.status).toBe(400);
  });

  it("returns 404 when reportId does not match any report", async () => {
    mockedStorage.updateReportWithResults.mockResolvedValue(undefined);
    const { app } = await buildTestApp();
    const notFoundPayload = {
      ...validWebhookPayload,
      reportId: "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    };

    const res = await request(app)
      .post("/api/webhook/n8n-response")
      .set("x-n8n-signature", signPayload(notFoundPayload))
      .send(notFoundPayload);

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/files/:filename — path traversal protection
// ─────────────────────────────────────────────────────────────
describe("GET /api/files/:filename", () => {
  it("returns 404 for a non-existent file", async () => {
    const { app } = await buildTestApp();
    const res = await request(app).get("/api/files/does-not-exist.csv");
    expect(res.status).toBe(404);
  });

  // [FIX-C1] Regression test — path traversal must be blocked.
  // This test PASSES after the path traversal fix is applied.
  it("blocks path traversal attempts (should return 400 or 404, never 200)", async () => {
    const { app } = await buildTestApp();
    const res = await request(app).get("/api/files/..%2F..%2Fpackage.json");
    expect(res.status).not.toBe(200);
    // After the fix, path.basename strips ".." — resolves to "package.json" which
    // does not exist in the uploads/ dir, so we get 404
    expect([400, 404]).toContain(res.status);
  });
});
