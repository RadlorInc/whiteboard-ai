// Before the e2e suite: clear the sign-in code limits in the LOCAL database only (the app allows 5 code checks per
// email per 10 minutes, and back-to-back runs sign the seed users in more often than that). The app's server key
// cannot delete from rate_limits (SELECT only, by design), so this goes through the local container's psql.
import { execFileSync } from "node:child_process";

export default function globalSetup() {
  execFileSync("docker", ["exec", "-i", "supabase_db_whiteboard-ai", "psql", "-U", "postgres", "-d", "postgres", "-qAt",
    "-c", "delete from public.rate_limits where key like 'otp:%'"], { stdio: "ignore" });
}
