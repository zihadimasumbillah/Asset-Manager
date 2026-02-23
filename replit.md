# FinPulse - Financial Health & Anomaly Dashboard

## Overview
A micro-SaaS application that processes P&L (Profit & Loss) CSV files through an AI-powered pipeline. Users upload financial statements, which are dispatched to an external n8n webhook for AI analysis, then results are displayed in a rich dashboard with charts, health scoring, and anomaly detection.

## Architecture
- **Frontend**: React (Vite) + TailwindCSS + Recharts + Framer Motion
- **Backend**: Node.js / Express.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **File Uploads**: Multer (stored in /uploads directory)
- **External Integration**: n8n webhook (N8N_WEBHOOK_URL env var)

## Key Data Models
- **Users**: Basic user table (id, username, password)
- **FinancialReports**: Main report table with status (processing/completed/failed), healthScore, anomalies (jsonb), chartData (jsonb), expenseBreakdown (jsonb), aiCommentary

## API Endpoints
- `POST /api/upload-ledger` - Upload CSV file, creates report with "processing" status, dispatches to n8n
- `POST /api/webhook/n8n-response` - Receives analyzed data from n8n, updates report to "completed"
- `GET /api/reports/latest?userId=` - Get latest report for a user
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports?userId=` - Get all reports for a user
- `GET /api/files/:filename` - Serve uploaded files

## Frontend Structure
- `client/src/pages/dashboard.tsx` - Main dashboard page
- `client/src/components/file-upload.tsx` - CSV upload with drag & drop
- `client/src/components/health-score-card.tsx` - Animated health score ring
- `client/src/components/revenue-expenses-chart.tsx` - Line chart (Revenue vs Expenses)
- `client/src/components/expense-breakdown-chart.tsx` - Donut chart
- `client/src/components/anomaly-feed.tsx` - Anomaly list with severity badges
- `client/src/components/ai-commentary.tsx` - AI insights display
- `client/src/components/report-history.tsx` - Past reports list
- `client/src/components/processing-overlay.tsx` - Processing state indicator

## Polling Mechanism
Frontend polls `/api/reports/:id` every 5 seconds when a report is in "processing" status. Stops polling once status becomes "completed".

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session secret
- `N8N_WEBHOOK_URL` - (Optional) External n8n webhook URL for AI processing
