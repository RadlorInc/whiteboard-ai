import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LEGAL } from "@/content/legal";

// §11.8: beta drafts; the attorney reviews them before public launch (C9).
export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const { doc } = await params;
  return { title: LEGAL[doc]?.title ?? "Not found" };
}

export default async function Legal({ params }: PageProps<"/legal/[doc]">) {
  const { doc } = await params;
  const d = LEGAL[doc];
  if (!d) notFound();
  return (
    <>
      <main className="page narrow stack">
        <h1>{d.title}</h1>
        <p className="card small">Beta draft. Not yet reviewed by a lawyer; it may change before public launch.</p>
        {d.sections.map(([h, ps]) => (
          <section key={h} className="stack">
            <h2>{h}</h2>
            {ps.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
