import Link from "next/link";
import { getT } from "@/lib/lang";

export default async function NotFound() {
  const t = await getT();
  return (
    <main className="auth stack" id="main" style={{ textAlign: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={96} height={66} className="auth-mark" style={{ width: 96 }} />
      <h1>{t("Lost in space")}</h1>
      <p className="muted">{t("This page doesn't exist, or it isn't yours to see.")}</p>
      <div><Link className="btn" href="/">{t("Go home")}</Link></div>
    </main>
  );
}
