import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Set it in your environment or .env file. " +
      "Example: postgres://postgres:password@localhost:5432/finpulse"
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });

process.on("SIGTERM", () => {
  void pool.end().catch((err: unknown) => {
    console.error("[db] Error draining connection pool on SIGTERM:", err);
  });
});
