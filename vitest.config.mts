import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests (PLAN.md §12.2). e2e/ is Playwright's; supabase/tests/ is pgTAP's.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)), "server-only": fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)) } },
  test: {
    include: ["{src,scripts,tests}/**/*.test.{ts,tsx,mjs}"],
    environment: "node",
  },
});
