import { storage } from "./storage";
import type { Anomaly, ChartDataPoint, ExpenseBreakdown } from "@shared/schema";

const DEMO_USER_ID = "demo-user";

const sampleChartData: ChartDataPoint[] = [
  { month: "Jan", revenue: 42500, expenses: 31200 },
  { month: "Feb", revenue: 45800, expenses: 33100 },
  { month: "Mar", revenue: 48200, expenses: 35600 },
  { month: "Apr", revenue: 44100, expenses: 32800 },
  { month: "May", revenue: 51300, expenses: 38200 },
  { month: "Jun", revenue: 53700, expenses: 36400 },
  { month: "Jul", revenue: 49800, expenses: 41200 },
  { month: "Aug", revenue: 55200, expenses: 37800 },
  { month: "Sep", revenue: 58400, expenses: 39100 },
  { month: "Oct", revenue: 54600, expenses: 42500 },
  { month: "Nov", revenue: 61200, expenses: 40300 },
  { month: "Dec", revenue: 64800, expenses: 43700 },
];

const sampleAnomalies: Anomaly[] = [
  {
    severity: "High",
    description: "Office supplies expense spiked 340% in October compared to trailing 3-month average",
    variance: 340,
  },
  {
    severity: "Medium",
    description: "Revenue dip in April deviates 12% from seasonal forecast model",
    variance: -12,
  },
  {
    severity: "Low",
    description: "Travel expenses gradually increasing — 5% month-over-month trend since August",
    variance: 5,
  },
  {
    severity: "High",
    description: "Consulting fees in July exceeded budget allocation by $8,400",
    variance: 210,
  },
  {
    severity: "Medium",
    description: "Payroll costs trending 8% above projected growth rate for Q3",
    variance: 8,
  },
];

const sampleExpenseBreakdown: ExpenseBreakdown[] = [
  { category: "Payroll", amount: 186400, percentage: 42 },
  { category: "Operations", amount: 75600, percentage: 17 },
  { category: "Marketing", amount: 62300, percentage: 14 },
  { category: "Technology", amount: 53100, percentage: 12 },
  { category: "Office & Admin", amount: 35400, percentage: 8 },
  { category: "Travel", amount: 22000, percentage: 5 },
  { category: "Other", amount: 8900, percentage: 2 },
];

export async function seedDatabase() {
  try {
    const existing = await storage.getReportsByUser(DEMO_USER_ID);
    if (existing.length > 0) {
      console.log("Seed data already exists, skipping...");
      return;
    }

    await storage.createReport({
      userId: DEMO_USER_ID,
      status: "completed",
      healthScore: 78,
      anomalies: sampleAnomalies,
      chartData: sampleChartData,
      expenseBreakdown: sampleExpenseBreakdown,
      aiCommentary:
        "Overall financial health is solid with consistent revenue growth throughout the year. Key areas of concern include the significant office supplies spike in October and consulting fee overruns in July. Revenue shows a healthy upward trajectory with a minor seasonal dip in Q2. Recommend reviewing vendor contracts for office supplies and implementing tighter approval workflows for consulting engagements.",
      fileName: "Q4_2024_PnL_Report.csv",
    });

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
