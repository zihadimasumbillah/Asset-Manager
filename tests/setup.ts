/**
 * Global test setup — runs before every test file.
 *
 * - Sets required environment variables so server modules
 *   (db.ts, index.ts) don't throw on import in test context.
 * - Use vi.mock() in individual test files to mock DB calls.
 */

import "@testing-library/jest-dom"; // [FIX-T2] Extend expect with DOM matchers

// Set env vars before any module is imported
process.env["NODE_ENV"] = "test";
process.env["DATABASE_URL"] =
  process.env["DATABASE_URL"] ?? "postgres://postgres:postgres@localhost:5432/finpulse_test";
process.env["SESSION_SECRET"] = "test-session-secret-not-for-production";
process.env["SERVER_BASE_URL"] = "http://localhost:5000";
process.env["PORT"] = "5000";
// [FIX-T4] Provide a webhook secret for tests that exercise the webhook endpoint
process.env["N8N_WEBHOOK_SECRET"] = "test-webhook-secret-32-bytes-hex-x";
