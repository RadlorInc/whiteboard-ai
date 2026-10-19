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

// onAsk: a chat takes the question itself (founder, 18 Oct 2026) instead of this composer playing it; busy holds the
// Ask button while that chat's video is being made (one video at a time).
export function AskComposer({ available, firstRun, onAsk, busy = false, placeholder = "Ask anything…" }: {
  available: number; firstRun: boolean; onAsk?: (question: string, explore: boolean) => void; busy?: boolean; placeholder?: string;
}) {
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

  // No draft is restored: the box starts empty every time (founder, 15 Oct 2026). localStorage can be missing.
  useEffect(() => {
    try {
      localStorage.removeItem("wb.askDraft");
      // Storage is only readable after hydration, so reading it has to happen in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("wb.explore") === "off") setExploreTick(false);
    } catch {}
    loaded.current = true;
    if (matchMedia("(pointer: fine)").matches) box.current?.focus();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try { localStorage.setItem("wb.explore", explore ? "on" : "off"); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [explore]);

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
    if (empty || !enough || busy) return;
    box.current?.blur();
    setNote(null);
    if (onAsk) { onAsk(question.trim(), explore); setQuestion(""); return; }
    setAsking({ question: question.trim(), explore, n: Date.now() });
    // Asked, so no longer a draft: leaving mid-video and coming back must not bring the question back.
    setQuestion("");
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
      <label className="field ask-field">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={36} height={45} />
        <span className="sr-only">Your question</span>
        <textarea
          autoComplete="off"
          ref={box}
          name="question"
          rows={1}
          maxLength={MAX}
          enterKeyHint="go"
          placeholder={placeholder}
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
      {question.length >= 400 && (
        <div className="muted small" style={{ textAlign: "right", marginTop: 6 }}>{question.length} / {MAX}</div>
      )}
      <VoiceProgress />

      {enough ? (
        <button type="submit" className="btn block" disabled={empty || busy}>
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
