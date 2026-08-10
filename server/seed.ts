import { storage } from "./storage";

const DEMO_USER_ID = "demo-user";

const regionalReports = [
  {
    fileName: "US_FarWest_TechStartup_2024.csv",
    healthScore: 82,
    aiCommentary:
      "This Far West US tech startup shows strong financial health with consistent revenue growth from $165K to $238K monthly (44% annual growth). The region leads US quarterly revenue at $165,190 average. Key strength: technology and marketing investments are well-proportioned at 8-12% each. Watch for the July revenue dip (-5.7%) which correlates with the typical Q3 SaaS slowdown. October saw elevated COGS (+98% vs September) likely from a one-time infrastructure upgrade. Payroll at 45% of expenses is within healthy range for tech companies. Recommend optimizing Q3 retention strategies and budgeting for infrastructure costs quarterly rather than as lump sums.",
    chartData: [
      { month: "Jan", revenue: 165190, expenses: 128248 },
      { month: "Feb", revenue: 171800, expenses: 131456 },
      { month: "Mar", revenue: 183200, expenses: 138960 },
      { month: "Apr", revenue: 176400, expenses: 135828 },
      { month: "May", revenue: 192500, expenses: 146300 },
      { month: "Jun", revenue: 198700, expenses: 149025 },
      { month: "Jul", revenue: 187300, expenses: 146094 },
      { month: "Aug", revenue: 205400, expenses: 154050 },
      { month: "Sep", revenue: 213800, expenses: 159585 },
      { month: "Oct", revenue: 208600, expenses: 160622 },
      { month: "Nov", revenue: 221500, expenses: 163310 },
      { month: "Dec", revenue: 238400, expenses: 172256 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description: "COGS spiked 57% in October ($5,170) vs trailing 3-month average ($2,803) — likely a one-time infrastructure purchase not amortized properly",
        variance: 57,
      },
      {
        severity: "Medium" as const,
        description: "Revenue dipped 5.7% in July ($187K vs $199K in June) — consistent with industry-wide Q3 SaaS slowdown reported across Far West region",
        variance: -5.7,
      },
      {
        severity: "Low" as const,
        description: "Travel expenses increasing at 4.2% month-over-month since August — above the 2.1% industry average for tech startups in the region",
        variance: 4.2,
      },
      {
        severity: "Medium" as const,
        description: "Marketing spend as a percentage of revenue dropped from 12% to 11.5% in Q4 despite accelerating growth — potential under-investment risk",
        variance: -4.2,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 817391, percentage: 45 },
      { category: "Marketing", amount: 283735, percentage: 16 },
      { category: "Technology", amount: 189385, percentage: 10 },
      { category: "Rent", amount: 148668, percentage: 8 },
      { category: "Operations", amount: 158911, percentage: 9 },
      { category: "Travel", amount: 93116, percentage: 5 },
      { category: "Insurance", amount: 69810, percentage: 4 },
      { category: "COGS", amount: 36329, percentage: 2 },
    ],
  },
  {
    fileName: "Europe_UK_Retail_2024.csv",
    healthScore: 68,
    aiCommentary:
      "This UK retail business shows moderate financial health with tight margins typical of the European retail sector (3-5% net margin). Revenue grew steadily from $89K to $148K (66% annual growth), with a strong Q4 holiday surge. Payroll dominates at 45% of expenses — consistent with European labor regulations requiring higher benefit contributions. The December spike to $148K revenue represents heavy seasonal dependency that introduces cash flow risk in Q1. COGS averaging 9.4% suggests a service-heavy retail model. Rent remains fixed at $9,812/month which is favorable given UK commercial property trends showing 6% increases in 2024. Recommend building a 3-month cash reserve to buffer the Q1 seasonal drop.",
    chartData: [
      { month: "Jan", revenue: 89200, expenses: 83384 },
      { month: "Feb", revenue: 92500, expenses: 85100 },
      { month: "Mar", revenue: 98700, expenses: 89630 },
      { month: "Apr", revenue: 95100, expenses: 87392 },
      { month: "May", revenue: 104300, expenses: 93870 },
      { month: "Jun", revenue: 108700, expenses: 96743 },
      { month: "Jul", revenue: 112400, expenses: 98992 },
      { month: "Aug", revenue: 106800, expenses: 95436 },
      { month: "Sep", revenue: 115200, expenses: 100224 },
      { month: "Oct", revenue: 119800, expenses: 103428 },
      { month: "Nov", revenue: 135600, expenses: 114156 },
      { month: "Dec", revenue: 148200, expenses: 121524 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description: "Revenue dropped 5% in August ($106.8K vs $112.4K) — correlates with post-summer UK retail slump, but decline is 2x the sector average of 2.5%",
        variance: -5.0,
      },
      {
        severity: "High" as const,
        description: "Q4 revenue concentration risk — Nov-Dec accounts for 22% of annual revenue, creating severe cash flow dependency on holiday season",
        variance: 22,
      },
      {
        severity: "Medium" as const,
        description: "COGS percentage increased from 9.1% to 9.8% between Q3 and Q4 — supplier cost inflation above the 0.3% European wholesale average",
        variance: 7.7,
      },
      {
        severity: "Low" as const,
        description: "Technology spend at 5% of expenses is below European SMB average of 8% — potential under-investment in digital transformation",
        variance: -37.5,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 501658, percentage: 45 },
      { category: "COGS", amount: 109330, percentage: 10 },
      { category: "Operations", amount: 133845, percentage: 12 },
      { category: "Rent", amount: 117744, percentage: 11 },
      { category: "Marketing", amount: 96408, percentage: 9 },
      { category: "Technology", amount: 60750, percentage: 5 },
      { category: "Insurance", amount: 42960, percentage: 4 },
      { category: "Travel", amount: 36246, percentage: 3 },
    ],
  },
  {
    fileName: "AsiaPacific_Manufacturing_2024.csv",
    healthScore: 74,
    aiCommentary:
      "This Asia-Pacific manufacturing firm demonstrates solid growth with revenue climbing from $312K to $415K monthly (33% annual growth), consistent with the region's 26% share of global SMB IT spending and rapid industrialization. COGS at 27% of expenses reflects heavy raw materials dependency — a key risk given 2024's commodity price volatility. Payroll at 34% is lower than Western counterparts due to regional labor cost advantages. The April revenue dip (-6.5%) aligns with Lunar New Year production slowdowns. Operations costs at 18% indicate significant facility and logistics overhead typical of manufacturing. Recommend hedging raw material costs and diversifying supplier base across ASEAN markets to mitigate single-source risks.",
    chartData: [
      { month: "Jan", revenue: 312500, expenses: 278125 },
      { month: "Feb", revenue: 325800, expenses: 286304 },
      { month: "Mar", revenue: 341200, expenses: 296244 },
      { month: "Apr", revenue: 318900, expenses: 281292 },
      { month: "May", revenue: 356700, expenses: 303195 },
      { month: "Jun", revenue: 368200, expenses: 313970 },
      { month: "Jul", revenue: 345600, expenses: 300672 },
      { month: "Aug", revenue: 372400, expenses: 316540 },
      { month: "Sep", revenue: 389100, expenses: 327248 },
      { month: "Oct", revenue: 378500, expenses: 322725 },
      { month: "Nov", revenue: 396800, expenses: 333312 },
      { month: "Dec", revenue: 415200, expenses: 344160 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description: "April revenue dropped 6.5% ($318.9K vs $341.2K March) — exceeds the typical 3% Lunar New Year production slowdown, indicating potential supply chain disruption",
        variance: -6.5,
      },
      {
        severity: "High" as const,
        description: "COGS volatility — ranged from $74.7K to $94.8K (27% swing) indicating raw material price instability across APAC commodity markets in 2024",
        variance: 27,
      },
      {
        severity: "Medium" as const,
        description: "Operations costs at 18% of total expenses — 3 percentage points above APAC manufacturing benchmark of 15%, suggesting logistics inefficiencies",
        variance: 20,
      },
      {
        severity: "Low" as const,
        description: "Technology investment at 3.4% is below the 53% cloud adoption rate target recommended for APAC SMBs by 2024 analyst reports",
        variance: -36,
      },
      {
        severity: "Medium" as const,
        description: "July production dip (-6.1%) correlates with monsoon season disruptions affecting 34% of APAC supply chains per 2024 industry data",
        variance: -6.1,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 1259278, percentage: 34 },
      { category: "COGS", amount: 1007460, percentage: 27 },
      { category: "Operations", amount: 668143, percentage: 18 },
      { category: "Rent", amount: 262500, percentage: 7 },
      { category: "Marketing", amount: 217045, percentage: 6 },
      { category: "Technology", amount: 131427, percentage: 4 },
      { category: "Travel", amount: 90018, percentage: 2 },
      { category: "Insurance", amount: 76292, percentage: 2 },
    ],
  },
  {
    fileName: "US_GreatLakes_Hospitality_2024.csv",
    healthScore: 55,
    aiCommentary:
      "This Great Lakes hospitality business shows concerning financial health with razor-thin margins averaging 6.8% — below the 7-10% healthy range for small businesses. Strong seasonality is evident with peak revenue in July ($115.4K) versus the January trough ($62.3K), a 85% swing that creates significant cash flow management challenges. The Great Lakes region showed the fastest revenue growth at 1.96% in Q3 2024, but this business's fixed costs (rent at $7,476/month, 10% of average expenses) create a high breakeven point. Payroll at 53% of expenses reflects the labor-intensive nature of hospitality. COGS variance of 139% between peak and trough months indicates poor inventory management during off-season. Recommend implementing dynamic pricing strategies and exploring winter event programming to flatten the seasonal revenue curve.",
    chartData: [
      { month: "Jan", revenue: 62300, expenses: 59785 },
      { month: "Feb", revenue: 58900, expenses: 57528 },
      { month: "Mar", revenue: 67200, expenses: 63168 },
      { month: "Apr", revenue: 78500, expenses: 71265 },
      { month: "May", revenue: 93200, expenses: 81508 },
      { month: "Jun", revenue: 108700, expenses: 91308 },
      { month: "Jul", revenue: 115400, expenses: 94678 },
      { month: "Aug", revenue: 112800, expenses: 93924 },
      { month: "Sep", revenue: 98600, expenses: 84798 },
      { month: "Oct", revenue: 82400, expenses: 75812 },
      { month: "Nov", revenue: 64800, expenses: 61776 },
      { month: "Dec", revenue: 71500, expenses: 67025 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description: "February revenue hit annual low at $58.9K — 49% below July peak, with net margin compressing to 2.4% (critically below the 7% healthy threshold per 2024 SMB benchmarks)",
        variance: -49,
      },
      {
        severity: "High" as const,
        description: "Payroll costs remained at 53% of expenses year-round despite 85% revenue seasonality — indicates inability to flex staffing, costing an estimated $18K in avoidable winter labor",
        variance: 53,
      },
      {
        severity: "Medium" as const,
        description: "COGS peaked in August ($7,730) at 139% above February levels ($2,952) — inventory purchasing not aligned with declining post-peak demand curve",
        variance: 139,
      },
      {
        severity: "Medium" as const,
        description: "Insurance costs at 4% of expenses are above the hospitality industry average of 3.1% — potential for savings through group purchasing or policy renegotiation",
        variance: 29,
      },
      {
        severity: "Low" as const,
        description: "Marketing spend at 6% is flat across all months — missing opportunity to increase winter marketing to combat seasonal revenue decline",
        variance: 0,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 486857, percentage: 53 },
      { category: "Operations", amount: 128916, percentage: 14 },
      { category: "Rent", amount: 89712, percentage: 10 },
      { category: "COGS", amount: 64004, percentage: 7 },
      { category: "Marketing", amount: 61200, percentage: 7 },
      { category: "Insurance", amount: 37324, percentage: 4 },
      { category: "Technology", amount: 30429, percentage: 3 },
      { category: "Travel", amount: 22786, percentage: 2 },
    ],
  },
];

export async function seedDatabase() {
  try {
    const existing = await storage.getReportsByUser(DEMO_USER_ID);
    if (existing.length > 0) {
      console.log("Seed data already exists, skipping...");
      return;
    }

    for (const report of regionalReports) {
      await storage.createReport({
        userId: DEMO_USER_ID,
        status: "completed",
        healthScore: report.healthScore,
        anomalies: report.anomalies,
        chartData: report.chartData,
        expenseBreakdown: report.expenseBreakdown,
        aiCommentary: report.aiCommentary,
        fileName: report.fileName,
      });
    }

    console.log(`Seeded ${regionalReports.length} regional financial reports`);
  } catch (error) {
    console.error("Seed error:", error);
  }
}
