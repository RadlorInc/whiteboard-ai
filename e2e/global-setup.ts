// Before the e2e suite (local stack only):
// 1. Clear the sign-in code limits in the LOCAL database (5 code checks per email per 10 minutes; back-to-back runs
//    sign the seed users in more often). The server key cannot delete from rate_limits (SELECT only, by design), so
//    this goes through the local container's psql.
// 2. Compile every route once. The dev server compiles a route on first visit and hot-reloads open pages while it
//    does; in CI (cold) that reloaded the share page's player iframe mid-test (21 Fast Refresh events, measured 12 Oct).
import { execFileSync } from "node:child_process";

const ROUTES = ["/", "/signin", "/signup", "/age", "/start", "/ask", "/library", "/buy", "/buy/success", "/account",
  "/pricing", "/help", "/contact", "/legal/terms", "/admin", "/admin/mfa", "/videos/00000000-0000-4000-8000-000000000000",
  "/v/AAAAAAAAAAAAAAAAAAAAAA", "/api/health", "/api/health/db", "/player/index.html"];

export default async function globalSetup() {
  execFileSync("docker", ["exec", "-i", "supabase_db_whiteboard-ai", "psql", "-U", "postgres", "-d", "postgres", "-qAt",
    "-c", "delete from public.rate_limits where key like 'otp:%'"], { stdio: "ignore" });
  for (const r of ROUTES) await fetch(`http://localhost:3100${r}`, { redirect: "manual" }).catch(() => {});
}
