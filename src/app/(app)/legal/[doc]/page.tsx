import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL } from "@/content/legal";
import { LEGAL_NL } from "@/content/legal-nl";
import { getLang, getT } from "@/lib/lang";

// §11.8: beta drafts; the attorney reviews them before public launch (C9).
export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  const nl = (await getLang()) === "nl";
  return { title: (nl ? LEGAL_NL : LEGAL)[doc]?.title ?? (await getT())("Not found") };
}

export default async function Legal({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const nl = (await getLang()) === "nl";
  const t = await getT();
  const d = (nl ? LEGAL_NL : LEGAL)[doc];
  if (!d) notFound();
  return (
    <main className="page narrow stack prose">
      <h1>{d.title}</h1>
      {nl && <p className="notice">Dit is een vertaling. Bij verschillen geldt de Engelse versie.</p>}
      <p className="notice">{t("Beta draft. Not yet reviewed by a lawyer; it may change before public launch.")}</p>
      {d.sections.map(([h, ps]) => (
        <section key={h} className="stack">
          <h2>{h}</h2>
          {ps.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
    </main>
  );
}
