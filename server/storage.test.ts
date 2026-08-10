import { describe, expect, it } from "vitest";

import { MemStorage } from "./storage";

describe("MemStorage unit tests", () => {
  it("should create and retrieve users", async () => {
    const mem = new MemStorage();
    const created = await mem.createUser({ username: "testuser", password: "hashedpassword" });
    expect(created.id).toBeDefined();
    expect(created.username).toBe("testuser");

    const fetchedById = await mem.getUser(created.id);
    expect(fetchedById).toEqual(created);

    const fetchedByUsername = await mem.getUserByUsername("testuser");
    expect(fetchedByUsername).toEqual(created);

    const nonExistent = await mem.getUser("invalid-id");
    expect(nonExistent).toBeUndefined();
  });

  it("should create, update, and list financial reports", async () => {
    const mem = new MemStorage();
    const report = await mem.createReport({
      userId: "user-123",
      status: "processing",
      fileName: "statement.csv",
    });

    expect(report.id).toBeDefined();
    expect(report.status).toBe("processing");
    expect(report.fileName).toBe("statement.csv");

    const fetched = await mem.getReport(report.id);
    expect(fetched).toEqual(report);

    const fetchedByFile = await mem.getReportByFileName("statement.csv");
    expect(fetchedByFile).toEqual(report);

    const latest = await mem.getLatestReportByUser("user-123");
    expect(latest?.id).toBe(report.id);

    const reportsList = await mem.getReportsByUser("user-123", 10, 0);
    expect(reportsList).toHaveLength(1);

    const updated = await mem.updateReportWithResults(report.id, {
      reportId: report.id,
      healthScore: 88,
      chartData: [{ month: "Jan", revenue: 100, expenses: 50 }],
      anomalies: [],
      expenseBreakdown: [{ category: "Payroll", amount: 50, percentage: 100 }],
      aiCommentary: "Solid performance.",
    });

    expect(updated?.status).toBe("completed");
    expect(updated?.healthScore).toBe(88);

    await mem.updateReportStatus(report.id, "failed");
    const afterFailed = await mem.getReport(report.id);
    expect(afterFailed?.status).toBe("failed");
  });
});
