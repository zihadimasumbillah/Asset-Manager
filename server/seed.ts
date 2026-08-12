import { storage } from "./storage";

const DEMO_USER_ID = "demo-user";
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo-password";

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
        description:
          "COGS spiked 57% in October ($5,170) vs trailing 3-month average ($2,803) — likely a one-time infrastructure purchase not amortized properly",
        variance: 57,
      },
      {
        severity: "Medium" as const,
        description:
          "Revenue dipped 5.7% in July ($187K vs $199K in June) — consistent with industry-wide Q3 SaaS slowdown reported across Far West region",
        variance: -5.7,
      },
      {
        severity: "Low" as const,
        description:
          "Travel expenses increasing at 4.2% month-over-month since August — above the 2.1% industry average for tech startups in the region",
        variance: 4.2,
      },
      {
        severity: "Medium" as const,
        description:
          "Marketing spend as a percentage of revenue dropped from 12% to 11.5% in Q4 despite accelerating growth — potential under-investment risk",
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
        description:
          "Revenue dropped 5% in August ($106.8K vs $112.4K) — correlates with post-summer UK retail slump, but decline is 2x the sector average of 2.5%",
        variance: -5.0,
      },
      {
        severity: "High" as const,
        description:
          "Q4 revenue concentration risk — Nov-Dec accounts for 22% of annual revenue, creating severe cash flow dependency on holiday season",
        variance: 22,
      },
      {
        severity: "Medium" as const,
        description:
          "COGS percentage increased from 9.1% to 9.8% between Q3 and Q4 — supplier cost inflation above the 0.3% European wholesale average",
        variance: 7.7,
      },
      {
        severity: "Low" as const,
        description:
          "Technology spend at 5% of expenses is below European SMB average of 8% — potential under-investment in digital transformation",
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
        description:
          "April revenue dropped 6.5% ($318.9K vs $341.2K March) — exceeds the typical 3% Lunar New Year production slowdown, indicating potential supply chain disruption",
        variance: -6.5,
      },
      {
        severity: "High" as const,
        description:
          "COGS volatility — ranged from $74.7K to $94.8K (27% swing) indicating raw material price instability across APAC commodity markets in 2024",
        variance: 27,
      },
      {
        severity: "Medium" as const,
        description:
          "Operations costs at 18% of total expenses — 3 percentage points above APAC manufacturing benchmark of 15%, suggesting logistics inefficiencies",
        variance: 20,
      },
      {
        severity: "Low" as const,
        description:
          "Technology investment at 3.4% is below the 53% cloud adoption rate target recommended for APAC SMBs by 2024 analyst reports",
        variance: -36,
      },
      {
        severity: "Medium" as const,
        description:
          "July production dip (-6.1%) correlates with monsoon season disruptions affecting 34% of APAC supply chains per 2024 industry data",
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
        description:
          "February revenue hit annual low at $58.9K — 49% below July peak, with net margin compressing to 2.4% (critically below the 7% healthy threshold per 2024 SMB benchmarks)",
        variance: -49,
      },
      {
        severity: "High" as const,
        description:
          "Payroll costs remained at 53% of expenses year-round despite 85% revenue seasonality — indicates inability to flex staffing, costing an estimated $18K in avoidable winter labor",
        variance: 53,
      },
      {
        severity: "Medium" as const,
        description:
          "COGS peaked in August ($7,730) at 139% above February levels ($2,952) — inventory purchasing not aligned with declining post-peak demand curve",
        variance: 139,
      },
      {
        severity: "Medium" as const,
        description:
          "Insurance costs at 4% of expenses are above the hospitality industry average of 3.1% — potential for savings through group purchasing or policy renegotiation",
        variance: 29,
      },
      {
        severity: "Low" as const,
        description:
          "Marketing spend at 6% is flat across all months — missing opportunity to increase winter marketing to combat seasonal revenue decline",
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
  {
    fileName: "US_HealthcareSaaS_2024.csv",
    healthScore: 91,
    aiCommentary:
      "This US healthcare SaaS platform demonstrates exceptional financial health with 91/100 score. Revenue grew from $420K to $612K monthly (46% annual growth), driven by HIPAA-compliant platform expansion into 12 new hospital networks. Gross margins remained above 78% throughout, reflecting strong software scalability. R&D investment at 18% of expenses aligns with healthcare technology innovation requirements. Sales & Marketing at 22% is slightly elevated but justified by the long healthcare sales cycles. The October revenue dip (-3.2%) coincides with typical Q3 healthcare budget planning freezes. Recommend maintaining current R&D cadence while optimizing customer acquisition costs through referral programs leveraging existing hospital network partnerships.",
    chartData: [
      { month: "Jan", revenue: 420000, expenses: 289000 },
      { month: "Feb", revenue: 445000, expenses: 295000 },
      { month: "Mar", revenue: 478000, expenses: 308000 },
      { month: "Apr", revenue: 462000, expenses: 302000 },
      { month: "May", revenue: 510000, expenses: 318000 },
      { month: "Jun", revenue: 535000, expenses: 329000 },
      { month: "Jul", revenue: 528000, expenses: 325000 },
      { month: "Aug", revenue: 565000, expenses: 338000 },
      { month: "Sep", revenue: 590000, expenses: 348000 },
      { month: "Oct", revenue: 572000, expenses: 342000 },
      { month: "Nov", revenue: 598000, expenses: 355000 },
      { month: "Dec", revenue: 612000, expenses: 362000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "R&D spending increased 22% quarter-over-quarter to $108K in Q4 — while justified for HIPAA recertification, this should be monitored against runway projections",
        variance: 22,
      },
      {
        severity: "Medium" as const,
        description:
          "Revenue variance of 3.2% in October correlates with Q3 healthcare procurement freezes — predictable but could be smoothed with multi-year contract incentives",
        variance: -3.2,
      },
      {
        severity: "Low" as const,
        description:
          "Customer acquisition cost rose 8% in H2 due to increased competition in healthcare SaaS — still within acceptable LTV:CAC ratio of 4.2:1",
        variance: 8,
      },
    ],
    expenseBreakdown: [
      { category: "R&D", amount: 1296000, percentage: 18 },
      { category: "Sales & Marketing", amount: 1584000, percentage: 22 },
      { category: "Payroll", amount: 2016000, percentage: 28 },
      { category: "Operations", amount: 864000, percentage: 12 },
      { category: "Infrastructure", amount: 576000, percentage: 8 },
      { category: "Legal & Compliance", amount: 432000, percentage: 6 },
      { category: "Travel", amount: 144000, percentage: 2 },
      { category: "Insurance", amount: 72000, percentage: 1 },
    ],
  },
  {
    fileName: "Germany_Automotive_2024.csv",
    healthScore: 62,
    aiCommentary:
      "This German automotive supplier shows moderate financial health with concerning structural pressures. Revenue declined from $2.1M to $1.85M monthly (12% annual decline) amid the European EV transition and reduced ICE component orders. Payroll at 38% reflects Germany's skilled manufacturing workforce but also creates rigidity. COGS volatility of 31% indicates raw material (aluminum, steel) price swings impacting margins. The September revenue cliff (-8.4%) aligns with major OEM production cuts. Energy costs at 6% of expenses are above German manufacturing average of 4.2% due to inefficient legacy facilities. Recommend accelerating EV component pivot and negotiating long-term raw material hedges. Government transition grants of up to EUR 50M may be available under Germany's IPCEI program.",
    chartData: [
      { month: "Jan", revenue: 2100000, expenses: 1845000 },
      { month: "Feb", revenue: 2050000, expenses: 1815000 },
      { month: "Mar", revenue: 2080000, expenses: 1836000 },
      { month: "Apr", revenue: 1980000, expenses: 1782000 },
      { month: "May", revenue: 1950000, expenses: 1764000 },
      { month: "Jun", revenue: 1920000, expenses: 1746000 },
      { month: "Jul", revenue: 1900000, expenses: 1734000 },
      { month: "Aug", revenue: 1880000, expenses: 1722000 },
      { month: "Sep", revenue: 1720000, expenses: 1658000 },
      { month: "Oct", revenue: 1880000, expenses: 1722000 },
      { month: "Nov", revenue: 1820000, expenses: 1688000 },
      { month: "Dec", revenue: 1850000, expenses: 1704000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "September revenue dropped 8.4% ($1.72M vs $1.88M August) — correlates with BMW/VW production cuts announced in Q3, indicating customer concentration risk with 3 OEMs representing 68% of revenue",
        variance: -8.4,
      },
      {
        severity: "High" as const,
        description:
          "Annual revenue decline of 12% exceeds automotive sector benchmark of -3% for ICE component suppliers in 2024",
        variance: -12,
      },
      {
        severity: "Medium" as const,
        description:
          "COGS ranged from $1.66M to $1.85M (31% swing) reflecting aluminum and steel spot price volatility on Euronext",
        variance: 31,
      },
      {
        severity: "Medium" as const,
        description:
          "Energy costs at 6% of expenses are 43% above German manufacturing average — 30% of facilities still use outdated HVAC systems",
        variance: 43,
      },
      {
        severity: "Low" as const,
        description:
          "Inventory days increased from 42 to 58 days as EV transition parts piling up while ICE demand falls",
        variance: 38,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 7980000, percentage: 38 },
      { category: "COGS", amount: 3850000, percentage: 18 },
      { category: "Operations", amount: 2520000, percentage: 12 },
      { category: "R&D", amount: 1680000, percentage: 8 },
      { category: "Energy", amount: 1260000, percentage: 6 },
      { category: "Logistics", amount: 1050000, percentage: 5 },
      { category: "Marketing", amount: 840000, percentage: 4 },
      { category: "Insurance", amount: 630000, percentage: 3 },
      { category: "Technology", amount: 420000, percentage: 2 },
      { category: "Travel", amount: 210000, percentage: 1 },
    ],
  },
  {
    fileName: "Japan_Ecommerce_2024.csv",
    healthScore: 78,
    aiCommentary:
      "This Japanese e-commerce platform shows solid financial health with strong seasonal patterns aligned to Japanese consumer behavior. Revenue peaked at $890K in December (Obon and year-end gift season) with steady baseline around $520K. Gross margins of 42% reflect the highly competitive Japanese e-commerce landscape with Amazon JP and Rakuten dominance. Logistics costs at 15% of expenses are elevated due to Japan's last-mile delivery complexity and rural reach requirements. The August revenue spike (+38%) aligns with Obon holiday shopping season. Technology investment at 8% supports the AI-driven recommendation engine that differentiates from competitors. Recommend expanding private label products to improve margins and leveraging Japan's aging population with senior-friendly UX enhancements.",
    chartData: [
      { month: "Jan", revenue: 520000, expenses: 364000 },
      { month: "Feb", revenue: 480000, expenses: 345600 },
      { month: "Mar", revenue: 540000, expenses: 367200 },
      { month: "Apr", revenue: 510000, expenses: 357000 },
      { month: "May", revenue: 530000, expenses: 363600 },
      { month: "Jun", revenue: 560000, expenses: 376800 },
      { month: "Jul", revenue: 580000, expenses: 386400 },
      { month: "Aug", revenue: 800000, expenses: 496000 },
      { month: "Sep", revenue: 620000, expenses: 408800 },
      { month: "Oct", revenue: 590000, expenses: 395800 },
      { month: "Nov", revenue: 650000, expenses: 422500 },
      { month: "Dec", revenue: 890000, expenses: 534000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "August revenue spiked 38% ($800K vs $580K July) — aligns with Obon holiday shopping but also with aggressive summer promotional campaign, creating margin compression of 4.2 percentage points",
        variance: 38,
      },
      {
        severity: "Medium" as const,
        description:
          "February revenue dip (-7.7%) consistent with post-New-Year consumer spending fatigue in Japan — but deeper than 2023's -4.1% dip, suggesting market share pressure",
        variance: -7.7,
      },
      {
        severity: "Medium" as const,
        description:
          "Logistics costs at 15% of expenses exceed Japan e-commerce average of 11% — rural delivery subsidies and Tokyo congestion surcharges driving up costs",
        variance: 36,
      },
      {
        severity: "Low" as const,
        description:
          "Technology spend at 8% supports recommendation engine but cybersecurity audit flagged 3 medium-severity vulnerabilities in payment processing",
        variance: 0,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 1980000, percentage: 25 },
      { category: "Logistics", amount: 1188000, percentage: 15 },
      { category: "COGS", amount: 1260000, percentage: 16 },
      { category: "Marketing", amount: 1008000, percentage: 13 },
      { category: "Technology", amount: 640000, percentage: 8 },
      { category: "Operations", amount: 560000, percentage: 7 },
      { category: "Customer Service", amount: 400000, percentage: 5 },
      { category: "Rent", amount: 320000, percentage: 4 },
      { category: "Insurance", amount: 240000, percentage: 3 },
      { category: "Travel", amount: 120000, percentage: 2 },
      { category: "Legal", amount: 80000, percentage: 1 },
    ],
  },
  {
    fileName: "Brazil_Agriculture_2024.csv",
    healthScore: 45,
    aiCommentary:
      "This Brazilian agribusiness shows concerning financial health with severe cash flow instability. Revenue swung from $1.2M in January to $680K in February (-43%), reflecting the volatile nature of commodity pricing and seasonal harvest cycles. The soybean harvest season (March-May) drove recovery to $1.4M peak, but drought conditions in July-August reduced output by 22%. Payroll at 28% is relatively efficient for agricultural operations, but equipment maintenance costs spiked 85% in Q3 due to aging machinery. Fertilizer costs at 12% of expenses are above South American average of 9% due to currency depreciation effects. Recommend establishing forward contracts for 60% of harvest output to stabilize revenue, and leasing newer equipment rather than maintaining aging fleet. Brazil's agricultural insurance programs (Proagro) should be fully leveraged.",
    chartData: [
      { month: "Jan", revenue: 1200000, expenses: 1050000 },
      { month: "Feb", revenue: 680000, expenses: 980000 },
      { month: "Mar", revenue: 1050000, expenses: 1035000 },
      { month: "Apr", revenue: 1250000, expenses: 1080000 },
      { month: "May", revenue: 1400000, expenses: 1120000 },
      { month: "Jun", revenue: 1350000, expenses: 1105000 },
      { month: "Jul", revenue: 950000, expenses: 1040000 },
      { month: "Aug", revenue: 820000, expenses: 1015000 },
      { month: "Sep", revenue: 1100000, expenses: 1060000 },
      { month: "Oct", revenue: 1280000, expenses: 1090000 },
      { month: "Nov", revenue: 1180000, expenses: 1070000 },
      { month: "Dec", revenue: 980000, expenses: 1035000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "February revenue crashed 43% ($680K vs $1.2M January) — post-harvest cash gap compounded by soybean price drop on CBOT, with net margin compressing to -44%",
        variance: -43,
      },
      {
        severity: "High" as const,
        description:
          "Equipment maintenance costs spiked 85% in Q3 to $180K — 40% of fleet is 12+ years old, exceeding manufacturer maintenance schedules",
        variance: 85,
      },
      {
        severity: "High" as const,
        description:
          "Fertilizer costs at 12% of expenses are 33% above South American average — BRL depreciation against USD increased import costs for phosphate and potassium",
        variance: 33,
      },
      {
        severity: "Medium" as const,
        description:
          "July-August drought reduced output by 22% — climate volatility requiring investment in irrigation infrastructure estimated at BRL 2.5M",
        variance: -22,
      },
      {
        severity: "Medium" as const,
        description:
          "Revenue volatility coefficient of 0.68 indicates extreme cash flow unpredictability — requires minimum BRL 3M working capital reserve",
        variance: 68,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 2730000, percentage: 28 },
      { category: "Fertilizer", amount: 1170000, percentage: 12 },
      { category: "Equipment", amount: 1040000, percentage: 11 },
      { category: "Logistics", amount: 880000, percentage: 9 },
      { category: "Fuel", amount: 780000, percentage: 8 },
      { category: "Land & Rent", amount: 680000, percentage: 7 },
      { category: "Insurance", amount: 580000, percentage: 6 },
      { category: "Seeds", amount: 490000, percentage: 5 },
      { category: "Operations", amount: 390000, percentage: 4 },
      { category: "Marketing", amount: 290000, percentage: 3 },
      { category: "Technology", amount: 190000, percentage: 2 },
      { category: "Travel", amount: 98000, percentage: 1 },
    ],
  },
  {
    fileName: "Canada_Energy_2024.csv",
    healthScore: 71,
    aiCommentary:
      "This Canadian oil & gas services firm shows good financial health with strong operational margins but significant commodity exposure. Revenue averaged $3.2M monthly with a Q4 surge to $4.1M driven by cold snap heating demand and Alberta rig count increases. EBITDA margins of 32% reflect efficient field operations. However, the May revenue dip (-11.4%) correlates with seasonal maintenance shutdowns. Environmental compliance costs at 5% of expenses are rising due to new federal methane regulations effective 2024. The company's carbon intensity of 18 kg CO2/boe is above the Canadian energy sector average of 14 kg. Recommend accelerating emissions reduction investments to qualify for federal clean tech incentives and hedging WTI exposure for 70% of production to reduce volatility.",
    chartData: [
      { month: "Jan", revenue: 2800000, expenses: 2120000 },
      { month: "Feb", revenue: 2950000, expenses: 2180000 },
      { month: "Mar", revenue: 3100000, expenses: 2240000 },
      { month: "Apr", revenue: 3250000, expenses: 2310000 },
      { month: "May", revenue: 2880000, expenses: 2192000 },
      { month: "Jun", revenue: 3050000, expenses: 2248000 },
      { month: "Jul", revenue: 3200000, expenses: 2304000 },
      { month: "Aug", revenue: 3150000, expenses: 2286000 },
      { month: "Sep", revenue: 3380000, expenses: 2376000 },
      { month: "Oct", revenue: 3650000, expenses: 2471000 },
      { month: "Nov", revenue: 3900000, expenses: 2607000 },
      { month: "Dec", revenue: 4100000, expenses: 2716000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "May revenue dropped 11.4% ($2.88M vs $3.25M April) — seasonal field maintenance shutdown but decline exceeds typical 7% seasonal pattern, suggesting operational inefficiency during restart",
        variance: -11.4,
      },
      {
        severity: "Medium" as const,
        description:
          "Environmental compliance costs at 5% of expenses are rising 18% year-over-year due to federal methane regulations requiring continuous monitoring installations",
        variance: 18,
      },
      {
        severity: "Medium" as const,
        description:
          "Carbon intensity of 18 kg CO2/boe exceeds Canadian sector average of 14 kg — potential carbon tax exposure of CAD 1.2M annually at $50/tonne rate",
        variance: 29,
      },
      {
        severity: "Low" as const,
        description:
          "December revenue peak of $4.1M correlates with Alberta rig count increase of 12% but also with cold snap surcharges — may not repeat in 2025",
        variance: 12,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 6720000, percentage: 26 },
      { category: "Equipment Leasing", amount: 5040000, percentage: 20 },
      { category: "Fuel & Power", amount: 2600000, percentage: 10 },
      { category: "Logistics", amount: 1800000, percentage: 7 },
      { category: "Environmental", amount: 1300000, percentage: 5 },
      { category: "Insurance", amount: 1200000, percentage: 5 },
      { category: "Rent & Land", amount: 1000000, percentage: 4 },
      { category: "Technology", amount: 900000, percentage: 3 },
      { category: "Marketing", amount: 800000, percentage: 3 },
      { category: "Operations", amount: 700000, percentage: 3 },
      { category: "Travel", amount: 400000, percentage: 2 },
      { category: "Legal", amount: 300000, percentage: 1 },
    ],
  },
  {
    fileName: "India_ITServices_2024.csv",
    healthScore: 85,
    aiCommentary:
      "This Indian IT services firm demonstrates excellent financial health with strong growth trajectory. Revenue expanded from $1.8M to $2.7M monthly (50% annual growth), driven by US financial services and UK retail digital transformation contracts. Utilization rate of 82% is above Indian IT industry average of 76%. The June revenue dip (-4.2%) coincides with monsoon season client budget freezes. Technology investment at 10% supports the proprietary automation platform that reduced delivery costs by 18%. Attrition at 14% is slightly above industry average of 11%, driven by competitive poaching from global tech firms. Recommend increasing bench training investment and establishing US nearshore delivery center to reduce timezone friction for key clients. The emerging AI services vertical now represents 22% of revenue with 65% margins.",
    chartData: [
      { month: "Jan", revenue: 1800000, expenses: 1440000 },
      { month: "Feb", revenue: 1850000, expenses: 1465000 },
      { month: "Mar", revenue: 1950000, expenses: 1512000 },
      { month: "Apr", revenue: 2050000, expenses: 1568000 },
      { month: "May", revenue: 2100000, expenses: 1602000 },
      { month: "Jun", revenue: 2010000, expenses: 1563000 },
      { month: "Jul", revenue: 2150000, expenses: 1632000 },
      { month: "Aug", revenue: 2280000, expenses: 1698000 },
      { month: "Sep", revenue: 2350000, expenses: 1736000 },
      { month: "Oct", revenue: 2420000, expenses: 1776000 },
      { month: "Nov", revenue: 2580000, expenses: 1866000 },
      { month: "Dec", revenue: 2700000, expenses: 1944000 },
    ],
    anomalies: [
      {
        severity: "Medium" as const,
        description:
          "June revenue dipped 4.2% ($2.01M vs $2.1M May) — monsoon season client budget freezes typical but deeper than 2023's -2.1% dip",
        variance: -4.2,
      },
      {
        severity: "Medium" as const,
        description:
          "Attrition at 14% exceeds industry average of 11% — senior Java and AWS architects being poached by global tech firms offering 35% premiums",
        variance: 27,
      },
      {
        severity: "Low" as const,
        description:
          "Technology investment at 10% supports automation platform but cybersecurity audit flagged need for SOC 2 Type II certification for US banking clients",
        variance: 0,
      },
      {
        severity: "Low" as const,
        description:
          "AI services vertical growing at 45% quarter-over-quarter — now 22% of revenue with 65% margins, significantly above legacy services 28% margins",
        variance: 45,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 5400000, percentage: 28 },
      { category: "Operations", amount: 2700000, percentage: 14 },
      { category: "Technology", amount: 1950000, percentage: 10 },
      { category: "Marketing", amount: 1560000, percentage: 8 },
      { category: "Facilities", amount: 1140000, percentage: 6 },
      { category: "Training", amount: 960000, percentage: 5 },
      { category: "Recruiting", amount: 780000, percentage: 4 },
      { category: "Travel", amount: 600000, percentage: 3 },
      { category: "Legal", amount: 480000, percentage: 2 },
      { category: "Insurance", amount: 300000, percentage: 2 },
    ],
  },
  {
    fileName: "Australia_RealEstate_2024.csv",
    healthScore: 58,
    aiCommentary:
      "This Australian real estate development firm shows below-average financial health amid cooling property markets. Revenue dropped from $1.5M in January to $920K in August (-39%) as Reserve Bank of Australia interest rate hikes reduced buyer activity. Property settlement delays increased average collection period from 28 to 47 days. Construction costs at 35% of expenses reflect Sydney and Melbourne labor shortages pushing wages up 8%. The April revenue cliff (-18.7%) followed RBA's 11th consecutive rate hike. Land holding costs at 12% of expenses are elevated due to 12-month average settlement delays. Recommend diversifying into affordable housing developments with government subsidies, and establishing joint ventures to share land acquisition risk. Forward pipeline of $8.2M in contracted projects provides 8-month revenue visibility.",
    chartData: [
      { month: "Jan", revenue: 1500000, expenses: 1320000 },
      { month: "Feb", revenue: 1400000, expenses: 1260000 },
      { month: "Mar", revenue: 1350000, expenses: 1235000 },
      { month: "Apr", revenue: 1100000, expenses: 1150000 },
      { month: "May", revenue: 1050000, expenses: 1125000 },
      { month: "Jun", revenue: 980000, expenses: 1098000 },
      { month: "Jul", revenue: 950000, expenses: 1085000 },
      { month: "Aug", revenue: 920000, expenses: 1072000 },
      { month: "Sep", revenue: 1050000, expenses: 1110000 },
      { month: "Oct", revenue: 1150000, expenses: 1145000 },
      { month: "Nov", revenue: 1250000, expenses: 1187500 },
      { month: "Dec", revenue: 1300000, expenses: 1210000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "April revenue dropped 18.7% ($1.1M vs $1.35M March) — RBA's 11th consecutive rate hike to 4.35% reduced buyer activity by 34% in Sydney and Melbourne markets",
        variance: -18.7,
      },
      {
        severity: "High" as const,
        description:
          "Property settlement delays increased collection period from 28 to 47 days — cash conversion cycle deterioration reducing available development capital by $420K",
        variance: 68,
      },
      {
        severity: "Medium" as const,
        description:
          "Construction costs at 35% of expenses reflect 8% wage inflation in Sydney and Melbourne trades — exacerbated by 42K skilled labor shortage nationally",
        variance: 8,
      },
      {
        severity: "Medium" as const,
        description:
          "Land holding costs at 12% of expenses are elevated — 12-month average settlement delays creating carrying costs of AUD 180K/month",
        variance: 12,
      },
    ],
    expenseBreakdown: [
      { category: "Construction", amount: 3640000, percentage: 35 },
      { category: "Land & Holding", amount: 1248000, percentage: 12 },
      { category: "Payroll", amount: 1104000, percentage: 11 },
      { category: "Marketing", amount: 840000, percentage: 8 },
      { category: "Finance", amount: 780000, percentage: 7 },
      { category: "Legal & Compliance", amount: 600000, percentage: 6 },
      { category: "Operations", amount: 480000, percentage: 4 },
      { category: "Technology", amount: 300000, percentage: 3 },
      { category: "Insurance", amount: 240000, percentage: 2 },
      { category: "Travel", amount: 120000, percentage: 1 },
    ],
  },
  {
    fileName: "Singapore_FinTech_2024.csv",
    healthScore: 88,
    aiCommentary:
      "This Singapore-based FinTech platform demonstrates excellent financial health with strong unit economics and regulatory alignment. Revenue grew from $950K to $1.45M monthly (53% annual growth), driven by cross-border payment volume expansion into ASEAN markets. Gross margins of 72% reflect the scalable nature of digital payment infrastructure. MAS licensing requirements at 3% of expenses are well-managed with zero compliance findings in annual audit. The June revenue surge (+12.5%) aligns with GrabShop integration launch capturing 340K new merchants. Customer acquisition cost of $12 per active user is among the lowest in Southeast Asian FinTech. Recommend expanding into Buy Now Pay Later (BNPL) vertical and establishing EU PCI DSS compliance for European expansion. Current cash runway of 28 months provides strategic flexibility.",
    chartData: [
      { month: "Jan", revenue: 950000, expenses: 684000 },
      { month: "Feb", revenue: 1020000, expenses: 715000 },
      { month: "Mar", revenue: 1080000, expenses: 744000 },
      { month: "Apr", revenue: 1150000, expenses: 775000 },
      { month: "May", revenue: 1200000, expenses: 798000 },
      { month: "Jun", revenue: 1350000, expenses: 867000 },
      { month: "Jul", revenue: 1250000, expenses: 825000 },
      { month: "Aug", revenue: 1280000, expenses: 835000 },
      { month: "Sep", revenue: 1320000, expenses: 850000 },
      { month: "Oct", revenue: 1380000, expenses: 871000 },
      { month: "Nov", revenue: 1420000, expenses: 885000 },
      { month: "Dec", revenue: 1450000, expenses: 898000 },
    ],
    anomalies: [
      {
        severity: "Medium" as const,
        description:
          "June revenue surged 12.5% ($1.35M vs $1.2M May) — GrabShop integration launch but server costs increased 40% requiring immediate infrastructure scaling",
        variance: 12.5,
      },
      {
        severity: "Low" as const,
        description:
          "July revenue corrected -7.4% post-integration as integration-related merchant onboarding velocity normalized — expected seasonal pattern",
        variance: -7.4,
      },
      {
        severity: "Low" as const,
        description:
          "Infrastructure costs rose 15% quarter-over-quarter due to GrabShop integration traffic — now stabilized at 8% of expenses with autoscaling in place",
        variance: 15,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 4680000, percentage: 32 },
      { category: "Infrastructure", amount: 1836000, percentage: 12 },
      { category: "Marketing", amount: 1260000, percentage: 9 },
      { category: "Compliance", amount: 438000, percentage: 3 },
      { category: "Operations", amount: 350000, percentage: 2 },
      { category: "Legal", amount: 280000, percentage: 2 },
      { category: "Insurance", amount: 200000, percentage: 1 },
    ],
  },
  {
    fileName: "UAE_Construction_2024.csv",
    healthScore: 53,
    aiCommentary:
      "This UAE construction firm shows concerning financial health amid cooling regional real estate markets. Revenue dropped from $2.8M in January to $1.6M in June (-43%) as Dubai and Abu Dhabi property oversupply concerns reduced new project starts. Material costs at 28% of expenses spiked 22% in Q2 due to global steel price increases and supply chain disruptions in the Red Sea. Labor costs at 32% reflect the high proportion of expatriate workers requiring sponsorship and accommodation. The May revenue cliff (-14.3%) followed Expo City phase completion with no immediate replacement projects. Recommend pivoting to infrastructure and renewable energy construction sectors where UAE government spending of AED 50B is planned through 2030. Establishing joint ventures with Chinese and Korean EPC firms could provide project pipeline access.",
    chartData: [
      { month: "Jan", revenue: 2800000, expenses: 2520000 },
      { month: "Feb", revenue: 2650000, expenses: 2415000 },
      { month: "Mar", revenue: 2500000, expenses: 2325000 },
      { month: "Apr", revenue: 2200000, expenses: 2200000 },
      { month: "May", revenue: 1880000, expenses: 2078000 },
      { month: "Jun", revenue: 1600000, expenses: 1960000 },
      { month: "Jul", revenue: 1700000, expenses: 1995000 },
      { month: "Aug", revenue: 1850000, expenses: 2072500 },
      { month: "Sep", revenue: 1950000, expenses: 2137500 },
      { month: "Oct", revenue: 2100000, expenses: 2235000 },
      { month: "Nov", revenue: 2250000, expenses: 2332500 },
      { month: "Dec", revenue: 2400000, expenses: 2430000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "May revenue dropped 14.3% ($1.88M vs $2.2M April) — Expo City phase completion with no immediate replacement projects in pipeline",
        variance: -14.3,
      },
      {
        severity: "High" as const,
        description:
          "Material costs spiked 22% in Q2 to $448K — Red Sea shipping disruptions increased container costs by 35% from Asia suppliers",
        variance: 22,
      },
      {
        severity: "High" as const,
        description:
          "Annual revenue decline of 43% from Jan to Jun trough — worst H1 performance since 2010 Dubai property crisis, requiring urgent pipeline diversification",
        variance: -43,
      },
      {
        severity: "Medium" as const,
        description:
          "Labor costs at 32% of expenses reflect expatriate workforce — AED 1.2M annual sponsorship and accommodation costs create fixed cost rigidity",
        variance: 32,
      },
    ],
    expenseBreakdown: [
      { category: "Labor", amount: 6720000, percentage: 32 },
      { category: "Materials", amount: 5880000, percentage: 28 },
      { category: "Subcontractors", amount: 1680000, percentage: 8 },
      { category: "Equipment", amount: 1260000, percentage: 6 },
      { category: "Logistics", amount: 1050000, percentage: 5 },
      { category: "Permits", amount: 840000, percentage: 4 },
      { category: "Operations", amount: 630000, percentage: 3 },
      { category: "Marketing", amount: 420000, percentage: 2 },
      { category: "Insurance", amount: 210000, percentage: 1 },
    ],
  },
  {
    fileName: "Sweden_CleanEnergy_2024.csv",
    healthScore: 82,
    aiCommentary:
      "This Swedish clean energy firm demonstrates excellent financial health aligned with EU Green Deal momentum. Revenue grew from $1.1M to $1.8M monthly (64% annual growth), driven by wind farm EPC contracts across Scandinavia and Baltic states. Gross margins of 45% reflect the premium pricing for carbon-neutral construction. R&D at 12% of expenses supports next-gen turbine blade materials innovation. The September revenue dip (-5.4%) coincides with typical Scandinavian construction winter slowdown. EU taxonomy alignment at 94% qualifies the firm for 20% green financing discounts under EU Sustainable Finance Strategy. Recommend expanding into battery storage system integration and hydrogen-ready infrastructure to capitalize on EU REPowerEU funding. Current order book of EUR 45M provides 18-month visibility.",
    chartData: [
      { month: "Jan", revenue: 1100000, expenses: 880000 },
      { month: "Feb", revenue: 1150000, expenses: 897000 },
      { month: "Mar", revenue: 1250000, expenses: 937500 },
      { month: "Apr", revenue: 1300000, expenses: 975000 },
      { month: "May", revenue: 1400000, expenses: 1029000 },
      { month: "Jun", revenue: 1500000, expenses: 1080000 },
      { month: "Jul", revenue: 1450000, expenses: 1053000 },
      { month: "Aug", revenue: 1520000, expenses: 1103000 },
      { month: "Sep", revenue: 1440000, expenses: 1062000 },
      { month: "Oct", revenue: 1580000, expenses: 1141000 },
      { month: "Nov", revenue: 1680000, expenses: 1202000 },
      { month: "Dec", revenue: 1800000, expenses: 1278000 },
    ],
    anomalies: [
      {
        severity: "Medium" as const,
        description:
          "September revenue dipped 5.4% ($1.44M vs $1.52M August) — Scandinavian construction winter slowdown typical but 2 percentage points deeper than 2023 due to Baltic project delays",
        variance: -5.4,
      },
      {
        severity: "Medium" as const,
        description:
          "Material costs at 18% of expenses increased 14% quarter-over-quarter due to European wind turbine component shortages",
        variance: 14,
      },
      {
        severity: "Low" as const,
        description:
          "EU taxonomy alignment at 94% qualifies for 20% green financing discounts — worth EUR 180K annually in interest savings",
        variance: 0,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 5040000, percentage: 28 },
      { category: "Materials", amount: 3240000, percentage: 18 },
      { category: "Operations", amount: 1620000, percentage: 9 },
      { category: "R&D", amount: 2160000, percentage: 12 },
      { category: "Logistics", amount: 1080000, percentage: 6 },
      { category: "Equipment", amount: 900000, percentage: 5 },
      { category: "Marketing", amount: 720000, percentage: 4 },
      { category: "Compliance", amount: 540000, percentage: 3 },
      { category: "Insurance", amount: 360000, percentage: 2 },
      { category: "Travel", amount: 180000, percentage: 1 },
    ],
  },
  {
    fileName: "UK_Logistics_2024.csv",
    healthScore: 67,
    aiCommentary:
      "This UK logistics and last-mile delivery firm shows moderate financial health with structural challenges from rising operational costs. Revenue grew from $1.3M to $1.7M monthly (31% annual growth), supported by Amazon FBA contract expansion and NHS supply chain contracts. However, net margins compressed from 8.2% in Q1 to 4.1% in Q4 due to fuel costs, driver shortages, and London congestion charges. Payroll at 35% reflects the driver wage inflation of 12% year-over-year required to retain staff. Fleet costs at 18% include EV transition investments that reduced long-term TCO but increased short-term CapEx. The February revenue dip (-5.1%) coincided with post-Christmas inventory correction. Recommend accelerating EV fleet transition to benefit from UK's 0% benefit-in-kind tax for electric vehicles and London's congestion charge exemption, projected to save GBP 180K annually by 2026.",
    chartData: [
      { month: "Jan", revenue: 1300000, expenses: 1194000 },
      { month: "Feb", revenue: 1230000, expenses: 1149600 },
      { month: "Mar", revenue: 1280000, expenses: 1181600 },
      { month: "Apr", revenue: 1350000, expenses: 1228500 },
      { month: "May", revenue: 1420000, expenses: 1278000 },
      { month: "Jun", revenue: 1480000, expenses: 1325200 },
      { month: "Jul", revenue: 1520000, expenses: 1352800 },
      { month: "Aug", revenue: 1550000, expenses: 1373500 },
      { month: "Sep", revenue: 1580000, expenses: 1394600 },
      { month: "Oct", revenue: 1620000, expenses: 1423800 },
      { month: "Nov", revenue: 1650000, expenses: 1449000 },
      { month: "Dec", revenue: 1700000, expenses: 1483000 },
    ],
    anomalies: [
      {
        severity: "High" as const,
        description:
          "Fuel costs at 15% of expenses increased 28% year-over-year due to UK diesel price volatility — 35% of fleet still diesel, EV transition 18 months behind schedule",
        variance: 28,
      },
      {
        severity: "Medium" as const,
        description:
          "Net margins compressed from 8.2% in Q1 to 4.1% in Q4 — 50% margin deterioration driven by driver wage inflation of 12% and London congestion charge expansion",
        variance: -50,
      },
      {
        severity: "Medium" as const,
        description:
          "February revenue dipped 5.1% ($1.23M vs $1.3M January) — post-Christmas inventory correction but deeper than 2023's -2.8% due to increased retailer return rates",
        variance: -5.1,
      },
      {
        severity: "Low" as const,
        description:
          "Driver attrition at 16% remains elevated despite 12% wage increases — EU labor mobility restrictions post-Brexit reducing applicant pool by 40%",
        variance: 16,
      },
    ],
    expenseBreakdown: [
      { category: "Payroll", amount: 2496000, percentage: 35 },
      { category: "Fleet", amount: 1285200, percentage: 18 },
      { category: "Fuel", amount: 1066000, percentage: 15 },
      { category: "Operations", amount: 420000, percentage: 6 },
      { category: "Insurance", amount: 350000, percentage: 5 },
      { category: "Technology", amount: 280000, percentage: 4 },
      { category: "Rent", amount: 245000, percentage: 3 },
      { category: "Marketing", amount: 210000, percentage: 3 },
      { category: "Legal", amount: 175000, percentage: 2 },
      { category: "Travel", amount: 105000, percentage: 1 },
    ],
  },
];

export async function seedDatabase() {
  try {
    const seedDemoData = process.env.SEED_DEMO_DATA !== "false";

    if (!seedDemoData) {
      return;
    }

    let demoUser = await storage.getUserByUsername(DEMO_USERNAME);
    if (!demoUser) {
      demoUser = await storage.createUser({
        username: DEMO_USERNAME,
        password: DEMO_PASSWORD,
      });
    }

    const existing = await storage.getReportsByUser(DEMO_USER_ID);
    if (existing.length > 0) {
      return;
    }

    for (const report of regionalReports) {
      if (!report.fileName || report.healthScore === undefined || report.healthScore === null) {
        continue;
      }
      if (!Array.isArray(report.chartData) || report.chartData.length === 0) {
        continue;
      }
      if (!Array.isArray(report.anomalies) || !Array.isArray(report.expenseBreakdown)) {
        continue;
      }

      const totalExpense = report.expenseBreakdown.reduce((sum, cat) => sum + (cat.amount || 0), 0);
      const normalizedBreakdown = report.expenseBreakdown.map((cat) => ({
        category: cat.category || "Other",
        amount: Math.max(0, cat.amount || 0),
        percentage: totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0,
      }));

      await storage.createReport({
        userId: DEMO_USER_ID,
        status: "completed",
        healthScore: Math.max(0, Math.min(100, report.healthScore)),
        anomalies: report.anomalies,
        chartData: report.chartData,
        expenseBreakdown: normalizedBreakdown,
        aiCommentary: report.aiCommentary,
        fileName: report.fileName,
      });
    }
  } catch (error) {
    console.error("Seed error:", error);
  }
}
