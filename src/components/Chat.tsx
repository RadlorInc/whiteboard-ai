"use client";
// A conversation of videos (founder, 18 Oct 2026): like a chat, each question is answered below the last, and a
// follow-up ("what was this part?") gets a new video made with the earlier questions and narration as context.
// The subject is chosen when the chat starts and stays for all its questions.
import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AskComposer } from "./AskComposer";
import { Player, Watch, type Style } from "./Watch";
import { startConversation } from "@/app/c/actions";
import { SUBJECT_NAME, type Subject } from "./Chats";

export type Turn = { id: string; question: string; style: Style; status: string; script: Record<string, unknown> | null };
type Live = { n: number; question: string; explore: boolean; conv: string; id?: string };

// An earlier answer: it plays only when asked, so opening a chat does not start every video at once.
function PastTurn({ t }: { t: Turn }) {
  const [play, setPlay] = useState(false);
  const ok = (t.status === "succeeded" || t.status === "refunded") && t.script;
  return (
    <section className="stack">
      <p className="chat-q">{t.question}</p>
      {!ok ? <p className="muted small">{t.status === "failed" ? "This one didn't finish, so nothing was charged." : "Still being made. Refresh in a moment."}</p>
        : play ? <Player style={t.style} script={t.script} />
        : <div className="row">
            <button type="button" className="btn secondary" onClick={() => setPlay(true)}>▶ Play this answer</button>
            <Link href={`/videos/${t.id}`} className="muted small">Open</Link>
          </div>}
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

  return (
    <div className="stack chat">
      {empty ? (
        <div className="stack">
          <h1>What do you want to understand?</h1>
          <div className="chips" role="radiogroup" aria-label="Subject">
            {(Object.keys(SUBJECT_NAME) as Subject[]).map(s => (
              <button key={s} type="button" role="radio" aria-checked={subject === s}
                className={`chip${subject === s ? " on" : ""}`} onClick={() => setSubject(s)}>{SUBJECT_NAME[s]}</button>
            ))}
          </div>
        </div>
      ) : <p className="muted small">{SUBJECT_NAME[subject]}</p>}
      {past.map(t => <PastTurn key={t.id} t={t} />)}
      {live.map(l => (
        <Watch key={l.n} question={l.question} style="whiteboard" explore={l.explore} conversationId={l.conv} onDone={done(l.n)} />
      ))}
      {note && <p role="alert" className="error">{note}</p>}
      <AskComposer available={available} firstRun={firstRun && empty} onAsk={ask} busy={busy}
        placeholder={empty ? "Ask anything…" : "Ask a follow-up…"} />
    </div>
  );
}
