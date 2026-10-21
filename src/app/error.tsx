"use client";
// Something broke while rendering a page: say so plainly and offer the two ways out. The error itself is in the logs.
import Link from "next/link";
import { useT } from "@/components/Lang";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <main className="auth stack" id="main" style={{ textAlign: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={96} height={66} className="auth-mark" style={{ width: 96 }} />
      <h1>{t("Something went wrong")}</h1>
      <p className="muted">{t("This page didn't load. Nothing was charged. Try again, or start a new chat.")}</p>
      <div className="toolbar" style={{ justifyContent: "center" }}>
        <button type="button" className="btn" onClick={reset}>{t("Try again")}</button>
        <Link className="btn secondary" href="/ask">{t("New chat")}</Link>
      </div>
    </main>
  );
}
