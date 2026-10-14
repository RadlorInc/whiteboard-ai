"use client";
// The /ask composer (PLAN.md §5.6), shell only: question box, style picker, cost line. Asking arrives in M3.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Watch } from "./Watch";
import { startVoice } from "@/lib/voice";
import { VoicePicker, VoiceProgress } from "./Voice";

const HOLD_CREDITS = 6; // same value as lib/session.ts (server); ponytail: one constants module once M3 adds it
const STYLES = [
  { id: "whiteboard", label: "Whiteboard", desc: "Numbered steps on a board. Best for how things work, sums and diagrams." },
  { id: "paper", label: "Paper", desc: "Cut-paper scenes with no writing. Best for journeys into and out of things." },
  { id: "matchcut", label: "Match-cut", desc: "One object turns into the next. Best for how something changed over time." },
] as const;
type Style = (typeof STYLES)[number]["id"];
const EXAMPLES: [string, Style][] = [
  ["How does the heart pump blood?", "whiteboard"],
  ["What is compound interest?", "whiteboard"],
  ["How does food become energy?", "paper"],
  ["How does a rainbow form?", "paper"],
  ["How did phones change?", "matchcut"],
  ["How did cars change?", "matchcut"],
];
const MAX = 500;

export function AskComposer({ available, firstRun }: { available: number; firstRun: boolean }) {
  const [question, setQuestion] = useState("");
  const [style, setStyle] = useState<Style>("whiteboard");
  const [note, setNote] = useState<string | null>(null);
  const [asking, setAsking] = useState<{ question: string; style: Style; explore: boolean; n: number } | null>(null);
  const [explore, setExploreTick] = useState(true);   // "Show in Explore", ticked by default (founder, 13 Oct 2026)
  const router = useRouter();
  const box = useRef<HTMLTextAreaElement>(null);
  const loaded = useRef(false);

  // The voice model starts loading as soon as a signed-in user reaches /ask (sign-in lands here), while they type.
  // (VoicePicker starts it too; this keeps it starting even where the picker is hidden.)
  useEffect(() => { startVoice(); }, []);

  // Restore the draft and the last style (§5.6). localStorage can be missing (private mode); the page works without it.
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("wb.askDraft") ?? "null");
      const s = localStorage.getItem("wb.style");
      // Storage is only readable after hydration, so restoring the draft has to happen in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (d?.question) setQuestion(String(d.question).slice(0, MAX));
      const st = (d?.style ?? s) as Style;
      if (STYLES.some((x) => x.id === st)) setStyle(st);
      if (localStorage.getItem("wb.explore") === "off") setExploreTick(false);
    } catch {}
    loaded.current = true;
    if (matchMedia("(pointer: fine)").matches) box.current?.focus();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem("wb.askDraft", JSON.stringify({ question, style }));
        localStorage.setItem("wb.style", style);
        localStorage.setItem("wb.explore", explore ? "on" : "off");
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [question, style, explore]);

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
    setAsking({ question: question.trim(), style, explore, n: Date.now() });
    // Asked, so no longer a draft: leaving mid-video and coming back must not bring the question back.
    setQuestion("");
    try { localStorage.removeItem("wb.askDraft"); } catch {}
  }

  if (asking) return (
    <Watch key={asking.n} question={asking.question} style={asking.style} explore={asking.explore}
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

      <fieldset>
        <legend className="sr-only">Style</legend>
        <div className="segmented">
          {STYLES.map((s) => (
            <label key={s.id}>
              <input type="radio" name="style" value={s.id} checked={style === s.id} onChange={() => setStyle(s.id)} />
              {s.label}
            </label>
          ))}
        </div>
        <p className="muted small" style={{ marginTop: 6 }}>
          {STYLES.find((s) => s.id === style)!.desc}
        </p>
      </fieldset>

      <VoicePicker />
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
            {EXAMPLES.map(([q, s]) => (
              <button
                key={q}
                type="button"
                className="chip"
                onClick={() => {
                  setQuestion(q);
                  setStyle(s);
                }}
              >
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
