"use client";
// A conversation of videos (founder, 18 Oct 2026): like a chat, each question is answered below the last, and a
// follow-up ("what was this part?") gets a new video made with the earlier questions and narration as context.
// The subject is chosen when the chat starts and stays for all its questions.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AskComposer } from "./AskComposer";
import { Player, Watch, type Style } from "./Watch";
import { deleteChat, startConversation } from "@/app/(app)/c/actions";
import { ShareButton } from "./ShareButton";
import { SUBJECT_NAME, type Subject } from "./Chats";
import { Icon } from "./Icon";
import { BoardPreview } from "./BoardPreview";
import { PRODUCT_NAME } from "@/product";

export type Turn = { id: string; question: string; style: Style; status: string; script: Record<string, unknown> | null };
type Live = { n: number; question: string; explore: boolean; conv: string; id?: string };

// An earlier answer: it plays only when asked, so opening a chat does not start every video at once.
function PastTurn({ t }: { t: Turn }) {
  const [play, setPlay] = useState(false);
  const ok = (t.status === "succeeded" || t.status === "refunded") && t.script;
  return (
    <section className="turn">
      <p className="chat-q">{t.question}</p>
      {!ok ? <p className="answer-meta">{t.status === "failed" ? "This one didn't finish, so nothing was charged." : "Still being made. Refresh in a moment."}</p>
        : <>
            {play ? <Player style={t.style} script={t.script} />
              : <button type="button" className="poster has-preview" onClick={() => setPlay(true)} aria-label="Play this answer">
                  <BoardPreview style={t.style} script={t.script} label="" />
                  <span className="poster-play"><Icon name="play" size={22} /></span>
                </button>}
            <p className="answer-meta">
              <ShareButton id={t.id} title={t.question} />
              <Link href={`/videos/${t.id}`} className="btn ghost sm"><Icon name="external" size={16} /> Open</Link>
            </p>
          </>}
    </section>
  );
}

export function Chat({ conversationId, subject: initialSubject, turns, available, firstRun }: {
  conversationId: string | null; subject: Subject | null; turns: Turn[]; available: number; firstRun: boolean;
}) {
  const router = useRouter();
  const [conv, setConv] = useState(conversationId);
  const [subject, setSubject] = useState<Subject>(initialSubject ?? "biology");
  const [live, setLive] = useState<Live[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const lastLive = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(true);
  // A new question scrolls its video into view (founder, 18 Oct 2026); reduced motion jumps instead of gliding.
  useEffect(() => {
    if (!live.length) return;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    lastLive.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }, [live.length]);

  const ask = useCallback(async (question: string, explore: boolean) => {
    setBusy(true); setNote(null);
    let id = conv;
    if (!id) {
      const r = await startConversation(subject);
      if (!r.id) { setBusy(false); setNote("Couldn't start a chat. Try again."); return; }
      id = r.id; setConv(id);
    }
    setLive(l => [...l, { n: Date.now(), question, explore, conv: id }]);
  }, [conv, subject]);

  // A finished (or failed) video frees the composer; the refresh brings the credits and the chat list up to date.
  const done = useCallback((n: number) => (_available: number | null, id?: string) => {
    setBusy(false);
    if (id) setLive(l => l.map(x => (x.n === n ? { ...x, id } : x)));
    router.refresh();
  }, [router]);

  const liveIds = new Set(live.map(l => l.id).filter(Boolean));
  const past = turns.filter(t => !liveIds.has(t.id));
  const empty = past.length === 0 && live.length === 0;
  // "Jump to latest" shows while the end of the chat is out of view.
  useEffect(() => {
    const el = end.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), { rootMargin: "0px 0px -120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [empty]);

  return (
    <main className={`chat${empty ? " empty" : ""}`}>
      <div className="chat-col">
        {empty ? (
          <div className="hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={96} height={66} />
            <h1>What do you want to understand?</h1>
            <p className="muted">Ask {PRODUCT_NAME} a question. It draws and explains the answer, step by step.</p>
          </div>
        ) : (
          <header className="chat-head">
            <div className="chat-head-text">
              <h1>{past[0]?.question ?? live[0]?.question}</h1>
              <span className="chat-subject">{SUBJECT_NAME[subject]}</span>
            </div>
            {conv && past[0] && (
              <div className="chat-head-actions">
                <ShareButton id={past[0].id} title={past[0].question} />
                <button type="button" className="icon-btn" aria-label="Delete chat" title="Delete chat" onClick={async () => {
                  if (window.confirm("Delete this chat and all its videos? This can't be undone. Used videos aren't given back.")) await deleteChat(conv);
                }}><Icon name="trash" size={18} /></button>
              </div>
            )}
          </header>
        )}
        {!empty && (
          <div className="thread">
            {past.map(t => <PastTurn key={t.id} t={t} />)}
            {live.map((l, i) => (
              <div key={l.n} ref={i === live.length - 1 ? lastLive : undefined} className="turn-live">
                <Watch question={l.question} style="whiteboard" explore={l.explore} conversationId={l.conv} onDone={done(l.n)} />
              </div>
            ))}
            <div ref={end} aria-hidden="true" />
          </div>
        )}
        {note && <p role="alert" className="error">{note}</p>}
        <div className="dock">
          {!empty && !atEnd && (
            <button type="button" className="jump" aria-label="Jump to latest"
              onClick={() => end.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}>
              <Icon name="chevronDown" size={18} />
            </button>
          )}
          <AskComposer available={available} firstRun={firstRun && empty} onAsk={ask} busy={busy}
            placeholder={empty ? "Ask anything…" : "Ask a follow-up…"} subject={subject}
            onSubject={conv ? undefined : setSubject} />
        </div>
      </div>
    </main>
  );
}
