import crypto from "crypto";

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
  getReportsByUser(userId: string, limit?: number, offset?: number): Promise<FinancialReport[]>;
  updateReportWithResults(
    reportId: string,
    data: N8nResponse
  ): Promise<FinancialReport | undefined>;
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
    const [created] = await db
      .insert(financialReports)
      .values(report as typeof financialReports.$inferInsert)
      .returning();
    return created;
  }

  async getReport(id: string): Promise<FinancialReport | undefined> {
    const [report] = await db.select().from(financialReports).where(eq(financialReports.id, id));
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

  async getReportsByUser(userId: string, limit = 50, offset = 0): Promise<FinancialReport[]> {
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

  async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    await db.update(financialReports).set({ status }).where(eq(financialReports.id, reportId));
  }
}

export class MemStorage implements IStorage {
  private usersMap = new Map<string, User>();
  private reportsMap = new Map<string, FinancialReport>();

  async getUser(id: string): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const user: User = { id, ...insertUser };
    this.usersMap.set(id, user);
    return user;
  }

  async createReport(report: InsertFinancialReport): Promise<FinancialReport> {
    const id = crypto.randomUUID();
    const newReport: FinancialReport = {
      id,
      userId: report.userId,
      status: report.status ?? "processing",
      fileName: report.fileName ?? null,
      healthScore: report.healthScore ?? null,
      anomalies: (report.anomalies as any) ?? null,
      chartData: (report.chartData as any) ?? null,
      expenseBreakdown: (report.expenseBreakdown as any) ?? null,
      aiCommentary: report.aiCommentary ?? null,
      createdAt: new Date(),
    };
    this.reportsMap.set(id, newReport);
    return newReport;
  }

  async getReport(id: string): Promise<FinancialReport | undefined> {
    return this.reportsMap.get(id);
  }

  async getReportByFileName(fileName: string): Promise<FinancialReport | undefined> {
    return Array.from(this.reportsMap.values()).find((r) => r.fileName === fileName);
  }

  async getLatestReportByUser(userId: string): Promise<FinancialReport | undefined> {
    const userReports = Array.from(this.reportsMap.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    return userReports[0];
  }

  async getReportsByUser(userId: string, limit = 50, offset = 0): Promise<FinancialReport[]> {
    return Array.from(this.reportsMap.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
      .slice(offset, offset + limit);
  }

  async updateReportWithResults(
    reportId: string,
    data: N8nResponse
  ): Promise<FinancialReport | undefined> {
    const report = this.reportsMap.get(reportId);
    if (!report) return undefined;
    const updated: FinancialReport = {
      ...report,
      status: "completed",
      healthScore: data.healthScore,
      anomalies: data.anomalies as any,
      chartData: data.chartData as any,
      expenseBreakdown: data.expenseBreakdown as any,
      aiCommentary: data.aiCommentary ?? null,
    };
    this.reportsMap.set(reportId, updated);
    return updated;
  }

  async updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
    const report = this.reportsMap.get(reportId);
    if (report) {
      report.status = status;
    }
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
