# FinPulse — Technical Documentation

## Overview

FinPulse is an AI-powered financial health dashboard that analyzes P&L statements, detects anomalies, and provides actionable insights. This document specifies the data schemas, types, API contracts, and environment configuration required to run and extend the application.

---

## Data Schemas & Types

All schemas are defined in `shared/schema.ts` using Drizzle ORM and Zod for runtime validation.

### Users

```ts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
```

### Financial Reports

```ts
export const financialReports = pgTable("financial_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  status: reportStatusEnum("status").notNull().default("processing"),
  healthScore: integer("health_score"),
  anomalies: jsonb("anomalies").$type<Anomaly[]>(),
  chartData: jsonb("chart_data").$type<ChartDataPoint[]>(),
  expenseBreakdown: jsonb("expense_breakdown").$type<ExpenseBreakdown[]>(),
  aiCommentary: text("ai_commentary"),
  fileName: text("file_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;
```

### Shared Types

```ts
export const anomalySchema = z.object({
  severity: z.enum(["High", "Medium", "Low"]),
  description: z.string().min(1).max(500),
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
```

### n8n / AI Response

```ts
export const n8nResponseSchema = z.object({
  reportId: z.string().uuid(),
  healthScore: z.number().int().min(0).max(100),
  anomalies: z.array(anomalySchema).max(50),
  chartData: z.array(chartDataPointSchema).max(120),
  expenseBreakdown: z.array(expenseBreakdownSchema).max(50),
  aiCommentary: z.string().max(5_000).optional(),
});

export type N8nResponse = z.infer<typeof n8nResponseSchema>;
```

---

## API Contracts

### Authentication

All protected endpoints require a Bearer session key in the `Authorization` header.

#### POST /api/auth/login

Request:
```json
{
  "username": "demo",
  "password": "demo-password"
}
```

Response:
```json
{
  "message": "Login successful.",
  "sessionKey": "<hex>.<hash>",
  "user": { "id": "demo-user", "username": "demo" }
}
```

#### POST /api/auth/logout

Response:
```json
{ "message": "Logout successful. Discard your session key." }
```

### Reports

#### GET /api/reports

Returns all reports for the authenticated user.

Response: `FinancialReport[]`

#### GET /api/reports/latest

Returns the most recent completed report for the authenticated user.

Response: `FinancialReport`

#### GET /api/reports/:id

Returns a single report. Returns 403 if the report does not belong to the authenticated user.

Response: `FinancialReport`

#### GET /api/reports/search

Query parameters:
- `q` (string): filename search term
- `minScore` (number): minimum health score
- `maxScore` (number): maximum health score
- `status` (string): `processing` | `completed` | `failed`
- `limit` (number): max results (default 50, max 100)
- `offset` (number): pagination offset

Response: `FinancialReport[]`

#### DELETE /api/reports/:id

Deletes a report. Returns 403 if the report does not belong to the authenticated user.

Response: `{ message: string, reportId: string }`

#### GET /api/reports/export/:id

Exports a completed report as JSON.

Response: JSON file download

#### GET /api/stats

Returns aggregate statistics for the authenticated user.

Response:
```json
{
  "totalReports": number,
  "completedReports": number,
  "processingReports": number,
  "failedReports": number,
  "avgHealthScore": number | null,
  "totalAnomalies": number,
  "highSeverityAnomalies": number
}
```

### Upload

#### POST /api/upload-ledger

Multipart form upload with field name `file`. Returns 202 with `reportId` and `status: "processing"`.

### Webhook

#### POST /api/webhook/n8n-response

Accepts n8n callback with `X-Hub-Signature-256` verification.

---

## Environment Variables

### Server

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` \| `production` \| `test` |
| `SERVER_BASE_URL` | No | Public base URL for file links |
| `SESSION_SECRET` | Yes (prod) | Secret for signing session keys |
| `N8N_WEBHOOK_URL` | No | n8n workflow webhook URL |
| `N8N_WEBHOOK_SECRET` | No | Shared secret for n8n webhook verification |
| `AI_API_KEY` | No | API key for aihubmax |
| `AI_API_BASE_URL` | No | Base URL for AI API (default: `https://api.aihumax.com/v1`) |
| `AI_MODEL` | No | Model identifier (default: `gpt-4o-mini`) |

### Client (Vite)

Prefix with `VITE_` to expose to the browser:
- `VITE_API_BASE_URL`

---

## Session Key Format

Session keys are generated as `<raw_hex>.<hmac_hash>` where:
- `raw_hex` is the hex-encoded user ID prefixed with `user:`
- `hmac_hash` is an HMAC-SHA256 of `raw_hex` using `SESSION_SECRET`

Example:
```
756e69645f3132333435363738393061626364.abcdef123456...
```

---

## AI Integration (aihubmax)

The application uses aihubmax as the AI provider. The integration is located in `server/ai/aihubmax.ts`.

### Endpoint

`POST {AI_API_BASE_URL}/chat/completions`

### Request Shape

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "response_format": { "type": "json_object" },
  "temperature": 0.3,
  "max_tokens": 2500
}
```

### Response Handling

The AI response is expected to be valid JSON matching `n8nResponseSchema`. The server parses and validates it before persisting.

---

## Deployment

### Vercel

- Build command: `npm run build`
- Output directory: `dist/public`
- Node version: `22.x` (enforced via `.node-version` and `package.json` engines)
- API entry: `api/index.ts` (serverless)
- Rewrites: `/api/*` → `/api/index`, `/*` → `/index.html`

### Environment Separation

- **Development**: Seeds demo data via `seedDatabase()`. Uses `demo-user` with mock reports.
- **Production**: Skips seeding. Requires real `DATABASE_URL` and `SESSION_SECRET`.
- **Test**: Uses in-memory storage (`MemStorage`).

Never commit `.env`. Use `.env.example` as a template.

---

## Known Limitations

1. **Session keys are stateless**: The server does not maintain a session store. Keys are validated via HMAC.
2. **Single user per session key**: Each session key maps to one user ID.
3. **AI fallback**: If aihubmax is unavailable, the server falls back to local CSV parsing.
4. **File storage**: Uploaded files are stored in `uploads/` (dev) or `os.tmpdir()/uploads` (Vercel).

---

## Extending the Application

### Adding a New Report Field

1. Update `shared/schema.ts` to add the column to `financialReports`.
2. Run `npm run db:push` to migrate the database.
3. Update `InsertFinancialReport` and `FinancialReport` types as needed.
4. Update the n8n response schema if the field comes from AI analysis.

### Adding a New AI Provider

1. Create a new file in `server/ai/` (e.g., `openai.ts`, `anthropic.ts`).
2. Implement `analyzeWith<Provider>(csvContent, fileName, config): Promise<N8nResponse>`.
3. Update `server/routes.ts` to select the provider based on `AI_API_BASE_URL` or a new env var.

### Adding Client-Side Features

- Components live in `client/src/components/`.
- Pages live in `client/src/pages/`.
- Shared types are imported from `@shared/schema`.
- UI components are built with shadcn/ui (Radix primitives + Tailwind).
