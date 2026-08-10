import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ── Report status enum ────────────────────────────────────────────────────────
// Using a pgEnum enforces the allowed values at the DB level, not just the app level.

export const reportStatusEnum = pgEnum("report_status", ["processing", "completed", "failed"]);

export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];

// ── Shared Zod schemas (client + server) ─────────────────────────────────────

export const anomalySchema = z.object({
  severity: z.enum(["High", "Medium", "Low"]),
  // Bounded strings prevent a spoofed webhook from storing megabytes in JSONB
  description: z.string().min(1).max(500),
  // Percentages are finite; clamp to a sane range
  variance: z.number().finite().min(-100).max(1_000),
});

export const chartDataPointSchema = z.object({
  month: z.string().min(1).max(20),
  revenue: z.number().finite().nonnegative(),
  expenses: z.number().finite().nonnegative(),
});

export const expenseBreakdownSchema = z.object({
  category: z.string().min(1).max(100),
  amount: z.number().finite().nonnegative(),
  percentage: z.number().finite().min(0).max(100),
});

export type Anomaly = z.infer<typeof anomalySchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
export type ExpenseBreakdown = z.infer<typeof expenseBreakdownSchema>;

// ── Financial Reports ─────────────────────────────────────────────────────────

export const financialReports = pgTable(
  "financial_reports",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    status: reportStatusEnum("status").notNull().default("processing"),
    healthScore: integer("health_score"),
    anomalies: jsonb("anomalies").$type<Anomaly[]>(),
    chartData: jsonb("chart_data").$type<ChartDataPoint[]>(),
    expenseBreakdown: jsonb("expense_breakdown").$type<ExpenseBreakdown[]>(),
    aiCommentary: text("ai_commentary"),
    fileName: text("file_name"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    // Composite index for the two most common queries:
    //   WHERE user_id = $1 ORDER BY created_at DESC
    //   WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
    userIdCreatedAtIdx: index("idx_reports_user_id_created_at").on(
      table.userId,
      table.createdAt.desc()
    ),
    // Index for fast filename lookup during secure file downloads
    fileNameIdx: index("idx_reports_file_name").on(table.fileName),
  })
);

export const insertFinancialReportSchema = createInsertSchema(financialReports).omit({
  id: true,
  createdAt: true,
});

export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;
export type FinancialReport = typeof financialReports.$inferSelect;

// ── n8n Webhook Response ──────────────────────────────────────────────────────

export const n8nResponseSchema = z.object({
  // Enforce UUID format — reject garbage/enumeration attempts
  reportId: z.string().uuid(),
  healthScore: z.number().int().min(0).max(100),
  // Cap array sizes to prevent storage exhaustion via spoofed webhook
  anomalies: z.array(anomalySchema).max(50),
  chartData: z.array(chartDataPointSchema).max(120), // 10 years of monthly data
  expenseBreakdown: z.array(expenseBreakdownSchema).max(50),
  aiCommentary: z.string().max(5_000).optional(),
});

export type N8nResponse = z.infer<typeof n8nResponseSchema>;
