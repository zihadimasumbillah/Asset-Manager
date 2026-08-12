import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// [FIX-M4] Production-grade pool configuration:
// - connectionTimeoutMillis: fail fast if the pool is exhausted, don't hang forever
// - idleTimeoutMillis: release idle connections back to Postgres promptly
// - max: explicit ceiling to prevent runaway connection growth
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });

// Graceful shutdown — drain the pool before the process exits.
// Without this, in-flight queries may be killed mid-transaction on SIGTERM.
process.on("SIGTERM", () => {
  void pool.end().catch((err: unknown) => {
    console.error("[db] Error draining connection pool on SIGTERM:", err);
  });
});
