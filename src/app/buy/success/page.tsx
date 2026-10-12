import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { Header } from "@/components/Header";

// After Stripe: credits arrive when the webhook lands, usually within seconds (§8.8). The header shows the balance.
export default async function BuySuccess() {
  const account = await requireAccount("/buy/success");
  return (
    <>
      <Header available={account.available} />
      <main className="page narrow stack">
        <h1>Thanks for your purchase</h1>
        <p>Your credits usually appear within a few seconds. If they don&apos;t, refresh this page.</p>
        <Link className="btn block" href="/ask">Ask a question</Link>
      </main>
    </>
  );
}
