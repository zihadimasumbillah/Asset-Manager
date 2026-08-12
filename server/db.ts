import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../shared/schema.ts";

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null;

process.on("SIGTERM", () => {
  if (pool) {
    void pool.end().catch((err: unknown) => {
      console.error("[db] Error draining connection pool on SIGTERM:", err);
    });
  }
});
