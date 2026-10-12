import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MfaStep } from "@/components/MfaStep";

export const metadata: Metadata = { title: "Admin check", robots: { index: false } };

// §11.3: admin pages need an authenticator-app code on every sign-in (aal2). First time: enrol the app here.
export default async function AdminMfa() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin?next=/admin");
  const { data } = await sb.auth.mfa.listFactors();
  const factor = data?.totp?.find(f => f.status === "verified");
  return (
    <main className="page narrow stack">
      <h1>Authenticator code</h1>
      <MfaStep factorId={factor?.id ?? null} />
    </main>
  );
}
