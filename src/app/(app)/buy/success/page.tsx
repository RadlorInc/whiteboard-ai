import Link from "next/link";
import { requireAccount } from "@/lib/session";

// After Stripe: credits arrive when the webhook lands, usually within seconds (§8.8). The sidebar shows the balance.
export default async function BuySuccess() {
  await requireAccount("/buy/success");
  return (
    <main className="page narrow stack" style={{ textAlign: "center" }}>
      <h1>Thanks for your purchase</h1>
      <p className="muted">Your credits usually appear within a few seconds. If they don&apos;t, refresh this page.</p>
      <Link className="btn" href="/ask">Ask a question</Link>
    </main>
  );
}
