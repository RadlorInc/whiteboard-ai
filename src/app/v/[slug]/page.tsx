import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SharedPlayer } from "@/components/SharedPlayer";
import { PRODUCT_NAME } from "@/product";

// §5.10: a public share page. No login, no owner identity, not indexed.
export const metadata: Metadata = { title: "Shared video", robots: { index: false, follow: false } };

export default async function Shared({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[A-Za-z0-9_-]{22}$/.test(slug)) notFound();
  const { data } = await (await createClient()).rpc("get_shared_video", { p_slug: slug });
  const v = Array.isArray(data) ? data[0] : data;
  if (!v?.script) notFound();
  return (
    <main className="page stack">
      <h1>{v.question}</h1>
      <SharedPlayer style={v.style} script={v.script} />
      <p>Made with {PRODUCT_NAME}. <Link href="/">Ask your own question</Link>.</p>
    </main>
  );
}
