import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // ── Global settings ──────────────────────────────────────
    globals: true,
    clearMocks: true,
    restoreMocks: true,

    // ── Environments ─────────────────────────────────────────
    // Default: node (for server tests)
    // Override per-file with: @vitest-environment jsdom
    environment: "node",

    // ── Setup files ──────────────────────────────────────────
    setupFiles: ["./tests/setup.ts"],

    // ── Test file patterns ───────────────────────────────────
    include: [
      "server/**/*.test.ts",
      "shared/**/*.test.ts",
      "client/src/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules", "dist", "coverage"],

    // ── Coverage ─────────────────────────────────────────────
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["server/**/*.ts", "shared/**/*.ts", "client/src/**/*.{ts,tsx}"],
      exclude: [
        "server/seed.ts",
        "server/vite.ts",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/index.ts",
        "client/src/main.tsx",
      ],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },

  // ── Path aliases (mirrors tsconfig.json) ─────────────────────
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
});
