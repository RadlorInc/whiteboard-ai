import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { VideoView } from "@/components/VideoView";
import { Icon } from "@/components/Icon";
import { getLang, getT } from "@/lib/lang";
import { LOCALE, tFor } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await getT();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: t("Video") };
  const { data } = await (await createClient()).from("generations").select("question").eq("id", id).maybeSingle();   // RLS: own only
  return { title: data?.question ?? t("Video") };
}

// §5.9: one of your own videos. Watching it again costs nothing (no generation).
export default async function Video({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  await requireAccount(`/videos/${id}`);
  const lang = await getLang(), t = tFor(lang);
  const sb = await createClient();
  const { data: g } = await sb.from("generations")
    .select("id, style, question, status, script, created_at, conversation_id")
    .eq("id", id).is("content_deleted_at", null).maybeSingle();
  if (!g) notFound();
  const [{ data: share }, { data: siblings }] = await Promise.all([
    sb.from("shares").select("slug, explore_at").eq("generation_id", id).maybeSingle(),
    // Its chat, in order (founder, 18 Oct 2026): what came before and after it. RLS: own only.
    g.conversation_id
      ? sb.from("generations").select("id, question").eq("conversation_id", g.conversation_id).is("content_deleted_at", null)
          .not("question", "is", null).order("created_at", { ascending: true })
      : Promise.resolve({ data: null }),
  ]);
  const chat = (siblings ?? []) as { id: string; question: string }[];
  const at = chat.findIndex((v) => v.id === id);
  const before = at > 0 ? chat[at - 1] : null, after = at >= 0 && at < chat.length - 1 ? chat[at + 1] : null;
  return (
    <main className="page stack">
      <div>
        <h1>{g.question}</h1>
        <p className="page-sub small">
          {new Date(g.created_at).toLocaleDateString(LOCALE[lang], { month: "long", day: "numeric", year: "numeric" })}
          {chat.length > 1 && <> · {t("Video {i} of {n} in", { i: at + 1, n: chat.length })} <Link href={`/c/${g.conversation_id}`}>{t("its chat")}</Link></>}
        </p>
      </div>
      {g.status === "succeeded" && g.script
        ? <VideoView id={g.id} style={g.style} script={g.script} slug={share?.slug ?? null} inExplore={!!share?.explore_at} />
        : <div className="card"><p>{t(g.status === "failed" || g.status === "refunded" ? "This video didn't finish, so nothing was charged." : "This video is still being made. Refresh in a moment.")}</p></div>}
      {(before || after) && (
        <nav className="seq-nav" aria-label={t("In this chat")}>
          {before ? (
            <Link href={`/videos/${before.id}`} className="seq-link">
              <span className="seq-dir"><Icon name="chevronDown" size={14} /> {t("Before this")}</span>
              <span className="seq-q">{before.question}</span>
            </Link>
          ) : <span />}
          {after && (
            <Link href={`/videos/${after.id}`} className="seq-link next">
              <span className="seq-dir">{t("After this")} <Icon name="chevronDown" size={14} /></span>
              <span className="seq-q">{after.question}</span>
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
