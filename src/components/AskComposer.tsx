"use client";
// The question box (PLAN.md §5.6), shaped like Claude's (founder, 18 Oct 2026): the text on top; below it the subject
// on the left and the send button on the right. The voice is picked on /settings.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { startVoice } from "@/lib/voice";
import { VoiceProgress } from "./Voice";
import { Icon } from "./Icon";
import { SUBJECT_NAME, type Subject } from "./Chats";

const HOLD_CREDITS = 6; // same value as lib/session.ts (server); ponytail: one constants module once M3 adds it
const EXAMPLES: Record<Subject, string[]> = {
  biology: ["How does the heart pump blood?", "How do we breathe?", "What does DNA do?"],
  physics: ["How does a rainbow form?", "Why do things fall?", "How does a car engine work?"],
  chemistry: ["Why does salt dissolve in water?", "What is an atom made of?", "How does fire burn?"],
};
const MAX = 500;

// onAsk: the chat takes the question; busy holds the button while its video is made (one video at a time).
// onSubject: the subject can still change (a new chat); without it the subject is fixed and only shown.
export function AskComposer({ available, firstRun, onAsk, busy = false, placeholder = "Ask anything…", subject, onSubject }: {
  available: number; firstRun: boolean; onAsk: (question: string, explore: boolean) => void; busy?: boolean;
  placeholder?: string; subject: Subject; onSubject?: (s: Subject) => void;
}) {
  const [question, setQuestion] = useState("");
  const [explore, setExploreTick] = useState(true);   // every new video goes to Explore (founder, 15 Oct 2026)
  const box = useRef<HTMLTextAreaElement>(null);

  // The voice model starts loading as soon as a signed-in user reaches /ask (sign-in lands here), while they type.
  useEffect(() => { startVoice(); }, []);

  // No draft is restored: the box starts empty every time (founder, 15 Oct 2026). localStorage can be missing.
  useEffect(() => {
    try {
      localStorage.removeItem("wb.askDraft");
      // Storage is only readable after hydration, so reading it has to happen in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("wb.explore") === "off") setExploreTick(false);
    } catch {}
    if (matchMedia("(pointer: fine)").matches) box.current?.focus();
  }, []);

  // Grow 1–6 rows.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    el.style.height = `${Math.min(el.scrollHeight, line * 6)}px`;
  }, [question]);

  const enough = available >= HOLD_CREDITS;
  const empty = question.trim().length === 0;

  function submit() {
    if (empty || !enough || busy) return;
    if (!matchMedia("(pointer: fine)").matches) box.current?.blur();   // phones: put the keyboard away to watch
    onAsk(question.trim(), explore);
    setQuestion("");
  }

  return (
    <form className="composer-wrap" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="composer">
        <label htmlFor="question" className="sr-only">Your question</label>
        <textarea
          id="question"
          autoComplete="off"
          ref={box}
          name="question"
          rows={1}
          maxLength={MAX}
          enterKeyHint="send"
          placeholder={placeholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="composer-bar">
          {onSubject ? (
            <label className="subject-pick">
              <span className="sr-only">Subject</span>
              <select value={subject} onChange={(e) => onSubject(e.target.value as Subject)}>
                {(Object.keys(SUBJECT_NAME) as Subject[]).map((s) => <option key={s} value={s}>{SUBJECT_NAME[s]}</option>)}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
          ) : (
            <span className="subject-pick locked" title="A chat keeps its subject. Start a new chat for another.">{SUBJECT_NAME[subject]}</span>
          )}
          {question.length >= 400 && <span className="count">{question.length} / {MAX}</span>}
          {enough ? (
            <button type="submit" className="send" aria-label="Ask" disabled={empty || busy}>
              {busy ? <span className="spinner sm" aria-hidden="true" /> : <Icon name="arrowUp" size={18} />}
            </button>
          ) : (
            <Link href="/start" className="btn sm send-buy">Buy credits</Link>
          )}
        </div>
      </div>
      {!enough && <p className="composer-note">A video needs up to {HOLD_CREDITS} credits. You have {available}.</p>}
      <VoiceProgress />
      {firstRun && (
        <div className="examples" aria-label="Example questions">
          {EXAMPLES[subject].map((q) => (
            <button key={q} type="button" className="chip" onClick={() => { setQuestion(q); box.current?.focus(); }}>{q}</button>
          ))}
        </div>
      )}
      <p className="composer-note">Written by AI. It can be wrong.</p>
    </form>
  );
}
