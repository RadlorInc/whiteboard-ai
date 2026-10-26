import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL } from "@/content/legal";
import { PRODUCT_NAME, SITE_URL } from "@/product";

// §11.8: beta drafts; the attorney reviews them before public launch (C9).
export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  const d = LEGAL[doc];
  return d ? { title: d.title, description: `${d.title} for ${PRODUCT_NAME}.`, alternates: { canonical: `${SITE_URL}/legal/${doc}` } }
    : { title: "Not found" };
}

export default async function Legal({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const d = LEGAL[doc];
  if (!d) notFound();
  return (
    <main className="page narrow stack prose">
      <h1>{d.title}</h1>
      <p className="notice">Beta draft. Not yet reviewed by a lawyer; it may change before public launch.</p>
      {d.sections.map(([h, ps]) => (
        <section key={h} className="stack">
          <h2>{h}</h2>
          {ps.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
    </main>
  );
}
