import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  financialReports,
  type User,
  type InsertUser,
  type FinancialReport,
  type InsertFinancialReport,
  type N8nResponse,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReport(report: InsertFinancialReport): Promise<FinancialReport>;
  getReport(id: string): Promise<FinancialReport | undefined>;
  getLatestReportByUser(userId: string): Promise<FinancialReport | undefined>;
  getReportsByUser(userId: string): Promise<FinancialReport[]>;
  updateReportWithResults(reportId: string, data: N8nResponse): Promise<FinancialReport | undefined>;
  updateReportStatus(reportId: string, status: string): Promise<void>;
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
    const [report] = await db.select().from(financialReports).where(eq(financialReports.id, id));
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

  async getReportsByUser(userId: string): Promise<FinancialReport[]> {
    return db
      .select()
      .from(financialReports)
      .where(eq(financialReports.userId, userId))
      .orderBy(desc(financialReports.createdAt));
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
        aiCommentary: data.aiCommentary || null,
      })
      .where(eq(financialReports.id, reportId))
      .returning();
    return updated;
  }

  async updateReportStatus(reportId: string, status: string): Promise<void> {
    await db
      .update(financialReports)
      .set({ status })
      .where(eq(financialReports.id, reportId));
  }
}

export const storage = new DatabaseStorage();
