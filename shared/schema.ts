import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const anomalySchema = z.object({
  severity: z.enum(["High", "Medium", "Low"]),
  description: z.string(),
  variance: z.number(),
});

export const chartDataPointSchema = z.object({
  month: z.string(),
  revenue: z.number(),
  expenses: z.number(),
});

export const expenseBreakdownSchema = z.object({
  category: z.string(),
  amount: z.number(),
  percentage: z.number(),
});

export type Anomaly = z.infer<typeof anomalySchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
export type ExpenseBreakdown = z.infer<typeof expenseBreakdownSchema>;

export const financialReports = pgTable("financial_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("processing"),
  healthScore: integer("health_score"),
  anomalies: jsonb("anomalies").$type<Anomaly[]>(),
  chartData: jsonb("chart_data").$type<ChartDataPoint[]>(),
  expenseBreakdown: jsonb("expense_breakdown").$type<ExpenseBreakdown[]>(),
  aiCommentary: text("ai_commentary"),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialReportSchema = createInsertSchema(financialReports).omit({
  id: true,
  createdAt: true,
});

export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;
export type FinancialReport = typeof financialReports.$inferSelect;

export const n8nResponseSchema = z.object({
  reportId: z.string(),
  healthScore: z.number().min(0).max(100),
  anomalies: z.array(anomalySchema),
  chartData: z.array(chartDataPointSchema),
  expenseBreakdown: z.array(expenseBreakdownSchema),
  aiCommentary: z.string().optional(),
});

export type N8nResponse = z.infer<typeof n8nResponseSchema>;
