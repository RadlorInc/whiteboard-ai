import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/product";
import { getT } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Contact") }; }

// §11.10: email support until the address and a form exist (A11: replies within 2 business days).
export default async function Contact() {
  const t = await getT();
  return (
    <main className="page narrow stack">
      <h1>{t("Contact")}</h1>
      <div className="card stack">
        <p>{t("Email")} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. {t("We reply within 2 business days.")}</p>
        <p className="muted small">{t("For a video, include its link. Please don't send card numbers or passwords.")}</p>
      </div>
    </main>
  );
}
