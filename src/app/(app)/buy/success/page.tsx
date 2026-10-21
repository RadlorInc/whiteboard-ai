import Link from "next/link";
import { requireAccount } from "@/lib/session";
import { getT } from "@/lib/lang";

// After Stripe: credits arrive when the webhook lands, usually within seconds (§8.8). The sidebar shows the balance.
export default async function BuySuccess() {
  await requireAccount("/buy/success");
  const t = await getT();
  return (
    <main className="page narrow stack" style={{ textAlign: "center" }}>
      <h1>{t("Thanks for your purchase")}</h1>
      <p className="muted">{t("Your videos usually appear within a few seconds. If they don't, refresh this page.")}</p>
      <Link className="btn" href="/ask">{t("Ask a question")}</Link>
    </main>
  );
}
