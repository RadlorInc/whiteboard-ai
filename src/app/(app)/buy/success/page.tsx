import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { PLANS_ON } from "@/product";
import { redirect } from "next/navigation";

// After Stripe: credits arrive when the webhook lands, usually within seconds (§8.8). The sidebar shows the balance.
export default async function BuySuccess() {
  if (!PLANS_ON) redirect("/ask");
  await requireAccount("/buy/success");
  return (
    <main className="page narrow stack" style={{ textAlign: "center" }}>
      <h1>Thanks for your purchase</h1>
      <p className="muted">Your videos usually appear within a few seconds. If they don&apos;t, refresh this page.</p>
      <Link className="btn" href="/ask">Ask a question</Link>
    </main>
  );
}
