/**
 * Unit tests for Zod schemas in shared/schema.ts
 *
 * These tests have zero external dependencies (no DB, no network)
 * and should always be fast and reliable.
 */

import { describe, it, expect } from "vitest";

import {
  n8nResponseSchema,
  anomalySchema,
  chartDataPointSchema,
  expenseBreakdownSchema,
  insertUserSchema,
} from "./schema";

// ────────────────────────────────────────────────────────────
// anomalySchema
// ────────────────────────────────────────────────────────────
describe("anomalySchema", () => {
  it("accepts valid anomaly data", () => {
    const result = anomalySchema.safeParse({
      severity: "High",
      description: "Revenue dropped 50%",
      variance: -50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity value", () => {
    const result = anomalySchema.safeParse({
      severity: "Critical", // not in enum
      description: "Something bad",
      variance: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = anomalySchema.safeParse({ severity: "Low" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid severity levels", () => {
    for (const severity of ["High", "Medium", "Low"] as const) {
      const result = anomalySchema.safeParse({
        severity,
        description: "Test anomaly",
        variance: 5,
      });
      expect(result.success, `severity ${severity} should be valid`).toBe(true);
    }
  });
});

// ────────────────────────────────────────────────────────────
// chartDataPointSchema
// ────────────────────────────────────────────────────────────
describe("chartDataPointSchema", () => {
  it("accepts valid chart data", () => {
    const result = chartDataPointSchema.safeParse({
      month: "Jan",
      revenue: 150000,
      expenses: 120000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-numeric revenue", () => {
    const result = chartDataPointSchema.safeParse({
      month: "Jan",
      revenue: "150k",
      expenses: 120000,
    });
    expect(result.success).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// expenseBreakdownSchema
// ────────────────────────────────────────────────────────────
describe("expenseBreakdownSchema", () => {
  it("accepts valid expense breakdown", () => {
    const result = expenseBreakdownSchema.safeParse({
      category: "Payroll",
      amount: 500000,
      percentage: 45,
    });
    expect(result.success).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// n8nResponseSchema
// ────────────────────────────────────────────────────────────
describe("n8nResponseSchema", () => {
  const validPayload = {
    reportId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // valid UUID

    healthScore: 82,
    anomalies: [{ severity: "High", description: "Spike in COGS", variance: 57 }],
    chartData: [{ month: "Jan", revenue: 165190, expenses: 128248 }],
    expenseBreakdown: [{ category: "Payroll", amount: 817391, percentage: 45 }],
    aiCommentary: "Strong financial health.",
  };

  it("accepts a fully valid n8n response", () => {
    const result = n8nResponseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts missing optional aiCommentary", () => {
    const withoutCommentary = { ...validPayload, aiCommentary: undefined };
    const result = n8nResponseSchema.safeParse(withoutCommentary);
    expect(result.success).toBe(true);
  });

  it("rejects healthScore below 0", () => {
    const result = n8nResponseSchema.safeParse({ ...validPayload, healthScore: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects healthScore above 100", () => {
    const result = n8nResponseSchema.safeParse({ ...validPayload, healthScore: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects missing reportId", () => {
    const withoutId = { ...validPayload, reportId: undefined };
    const result = n8nResponseSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("rejects anomalies with invalid severity", () => {
    const result = n8nResponseSchema.safeParse({
      ...validPayload,
      anomalies: [{ severity: "Extreme", description: "bad", variance: 99 }],
    });
    expect(result.success).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// insertUserSchema
// ────────────────────────────────────────────────────────────
describe("insertUserSchema", () => {
  it("accepts valid user credentials", () => {
    const result = insertUserSchema.safeParse({
      username: "alice",
      password: "securepassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = insertUserSchema.safeParse({ username: "alice" });
    expect(result.success).toBe(false);
  });
});
