import { desc, eq } from "drizzle-orm";

import {
  type FinancialReport,
  type InsertFinancialReport,
  type InsertUser,
  type N8nResponse,
  type ReportStatus,
  type User,
  financialReports,
  users,
} from "@shared/schema";

import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReport(report: InsertFinancialReport): Promise<FinancialReport>;
  getReport(id: string): Promise<FinancialReport | undefined>;
  getReportByFileName(fileName: string): Promise<FinancialReport | undefined>;
  getLatestReportByUser(userId: string): Promise<FinancialReport | undefined>;
  // [FIX-H1] Pagination parameters prevent unbounded result sets
  getReportsByUser(userId: string, limit?: number, offset?: number): Promise<FinancialReport[]>;
  updateReportWithResults(
    reportId: string,
    data: N8nResponse
  ): Promise<FinancialReport | undefined>;
  // [FIX-M3] status is now strongly typed via the ReportStatus union — no freeform strings
  updateReportStatus(reportId: string, status: ReportStatus): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createReport(report: InsertFinancialReport): Promise<FinancialReport> {
    const [created] = await db.insert(financialReports).values(report).returning();
    return created;
  }


  async getReport(id: string): Promise<FinancialReport | undefined> {
    const [report] = await db
      .select()
      .from(financialReports)
      .where(eq(financialReports.id, id));
    return report;
  }

  async getReportByFileName(fileName: string): Promise<FinancialReport | undefined> {
    const [report] = await db
      .select()
      .from(financialReports)
      .where(eq(financialReports.fileName, fileName));
    return report;
  }

  async getLatestReportByUser(userId: string): Promise<FinancialReport | undefined> {
    const [report] = await db
      .select()
      .from(financialReports)
      .where(eq(financialReports.userId, userId))
      .orderBy(desc(financialReports.createdAt))
      .limit(1);
    return report;
  }

  // [FIX-H1] Default limit of 50, capped in the route handler at 100.
  // The composite index idx_reports_user_id_created_at makes this query efficient.
  async getReportsByUser(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<FinancialReport[]> {
    return db
      .select()
      .from(financialReports)
      .where(eq(financialReports.userId, userId))
      .orderBy(desc(financialReports.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateReportWithResults(
    reportId: string,
    data: N8nResponse
  ): Promise<FinancialReport | undefined> {
    const [updated] = await db
      .update(financialReports)
      .set({
        status: "completed",
        healthScore: data.healthScore,
        anomalies: data.anomalies,
        chartData: data.chartData,
        expenseBreakdown: data.expenseBreakdown,
        aiCommentary: data.aiCommentary ?? null,
      })
      .where(eq(financialReports.id, reportId))
      .returning();
    return updated;
  }

  // [FIX-M3] ReportStatus (union type from pgEnum) replaces the freeform `string` parameter
  async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    await db
      .update(financialReports)
      .set({ status })
      .where(eq(financialReports.id, reportId));
  }
}

export const storage = new DatabaseStorage();
