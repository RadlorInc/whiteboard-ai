"use client";
// The /ask composer (PLAN.md §5.6): question box, cost line. The voice is picked on /settings.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Watch } from "./Watch";
import { startVoice } from "@/lib/voice";
import { VoiceProgress } from "./Voice";

const HOLD_CREDITS = 6; // same value as lib/session.ts (server); ponytail: one constants module once M3 adds it
// Only whiteboard is offered for now (founder, 14 Oct 2026). Paper and match-cut videos already made still play.
const style = "whiteboard";
const EXAMPLES = [
  "How does the heart pump blood?",
  "What is compound interest?",
  "How does a rainbow form?",
  "How does a car engine work?",
];
const MAX = 500;

export function AskComposer({ available, firstRun }: { available: number; firstRun: boolean }) {
  const [question, setQuestion] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [asking, setAsking] = useState<{ question: string; explore: boolean; n: number } | null>(null);
  const [explore, setExploreTick] = useState(true);   // "Show in Explore", ticked by default (founder, 13 Oct 2026)
  const router = useRouter();
  const box = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  // The voice model starts loading as soon as a signed-in user reaches /ask (sign-in lands here), while they type.
  // (VoicePicker starts it too; this keeps it starting even where the picker is hidden.)
  useEffect(() => { startVoice(); }, []);

  // Restore the draft (§5.6). localStorage can be missing (private mode); the page works without it.
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("wb.askDraft") ?? "null");
      // Storage is only readable after hydration, so restoring the draft has to happen in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (d?.question) setQuestion(String(d.question).slice(0, MAX));
      if (localStorage.getItem("wb.explore") === "off") setExploreTick(false);
    } catch {}
    loaded.current = true;
    if (matchMedia("(pointer: fine)").matches) box.current?.focus();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem("wb.askDraft", JSON.stringify({ question }));
        localStorage.setItem("wb.explore", explore ? "on" : "off");
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [question, explore]);

  // Grow 1–4 rows.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    el.style.height = `${Math.min(el.scrollHeight, line * 4 + 22)}px`;
  }, [question]);

  const enough = available >= HOLD_CREDITS;
  const empty = question.trim().length === 0;

  function submit() {
    if (empty || !enough) return;
    box.current?.blur();
    setNote(null);
    setAsking({ question: question.trim(), explore, n: Date.now() });
  }

  if (asking) return (
    <Watch key={asking.n} question={asking.question} style={style} explore={asking.explore}
      onDone={() => router.refresh()} onExit={() => { setAsking(null); setQuestion(""); }} />
  );

  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="field">
        <span className="sr-only">Your question</span>
        <textarea
          ref={box}
          name="question"
          rows={1}
          maxLength={MAX}
          enterKeyHint="go"
          placeholder="Ask anything, e.g. How does the heart pump blood?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
      </label>
      <div className="muted small" style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span>Answers are in English.</span>
        {question.length >= 400 && <span>{question.length} / {MAX}</span>}
      </div>

      <label className="row small" style={{ gap: 8, alignItems: "center" }}>
        <input type="checkbox" checked={explore} onChange={(e) => setExploreTick(e.target.checked)} />
        Show in Explore — anyone can watch it there, without seeing who made it. You can remove it later.
      </label>
      <VoiceProgress />

      <p className="small">
        Up to {HOLD_CREDITS} credits · 1 credit = 10 s · You have {available}.
      </p>

      {enough ? (
        <button type="submit" className="btn block" disabled={empty}>
          Ask
        </button>
      ) : (
        <>
          <Link href="/start" className="btn block">
            Buy credits
          </Link>
          <p className="small">
            A video needs up to {HOLD_CREDITS} credits; you have {available}.
          </p>
        </>
      )}
      {note && (
        <p role="status" className="muted">
          {note}
        </p>
      )}

      {firstRun && (
        <div className="stack" style={{ paddingTop: 8 }}>
          <p className="muted small">Try one. One question per video works best.</p>
          <div className="chips">
            {EXAMPLES.map((q) => (
              <button key={q} type="button" className="chip" onClick={() => setQuestion(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="muted small">Written by AI. It can be wrong.</p>
    </form>
  );
}
