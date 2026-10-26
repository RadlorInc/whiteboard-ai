"use client";
// The question box (PLAN.md §5.6), shaped like Claude's (founder, 18 Oct 2026): the text on top; below it the subject
// on the left and the send button on the right. The voice is picked on /settings.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { startVoice } from "@/lib/voice";
import { VoiceProgress } from "./Voice";
import { Icon } from "./Icon";
import { NEW_SUBJECTS, SUBJECT_GROUPS, SUBJECT_NAME, type Subject } from "./Chats";

import { PLANS_ON } from "@/product";
import { FRIENDS_MAX, LEVEL_NAME, canAsk, taughtLevel, videos, type Allowance, type Level } from "@/lib/videos";
const EXAMPLES: Record<Subject, string[]> = {
  biology: ["How does the heart pump blood?", "How do we breathe?", "What does DNA do?"],
  physics: ["How does a rainbow form?", "Why do things fall?", "How does a car engine work?"],
  chemistry: ["Why does salt dissolve in water?", "What is an atom made of?", "How does fire burn?"],
  cs: ["How does a computer add two numbers?", "How does the internet send a message?", "How does sorting work?"],
  finance: ["How does a shop make a profit?", "How do I make a monthly budget?", "How does a cash machine work?"],
  home: ["How do I tie a tie?", "Why did my breaker trip?", "How do I fix a leak under the sink?"],
  car: ["How do I change a flat tire?", "How do I check my oil?", "How do I change my oil?"],
};
const MAX = 500;

// onAsk: the chat takes the question; busy holds the button while its video is made (one video at a time).
// onSubject: the subject can still change (a new chat); without it the subject is fixed and only shown. subjects: the
// person's categories, the only ones offered (founder, 22 Oct 2026). The level is chosen on /settings, not here.
export function AskComposer({ allowance: a, firstRun, onAsk, busy = false, placeholder = "Ask anything…", subject, subjects, onSubject, level = "school" }: {
  allowance: Allowance; firstRun: boolean; onAsk: (question: string, explore: boolean) => void; busy?: boolean;
  placeholder?: string; subject: Subject; subjects?: Subject[]; onSubject?: (s: Subject) => void; level?: Level;
}) {
  const groups = SUBJECT_GROUPS.map(([g, list]) => [g, list.filter((s) => !subjects || subjects.includes(s) || NEW_SUBJECTS.includes(s))] as const)
    .filter(([, list]) => list.length);
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

  const study = subject !== "home" && subject !== "car";
  const enough = canAsk(a);
  // What is left (founder, 20 Oct 2026: show it): free first, then the plan. Admins see nothing.
  const left = a.admin ? null
    : a.freeLeft > 0 ? `${a.freeLeft} of ${a.freeTotal} free videos left${a.plan > 0 ? ` · ${videos(a.plan)} from your plan` : ""}`
    : a.plan > 0 ? `${videos(a.plan)} left from your plan` : null;
  // Free videos used up: a plan pays, and teaches at its level (generate.ts caps it the same way).
  const taught = taughtLevel(level, a.planLevel);
  const capped = study && !a.admin && a.freeLeft === 0 && a.plan > 0 && taught !== level;
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
          {onSubject && groups.flatMap(([, l]) => l).length > 1 ? (
            <label className="subject-pick">
              <span className="sr-only">Subject</span>
              <select value={subject} onChange={(e) => onSubject(e.target.value as Subject)}>
                {groups.map(([group, list]) => (
                  <optgroup key={group} label={group}>{list.map((s) => <option key={s} value={s}>{SUBJECT_NAME[s]}</option>)}</optgroup>
                ))}
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
          ) : PLANS_ON ? (
            <Link href="/start" className="btn sm send-buy">Get more videos</Link>
          ) : (
            <button type="submit" className="send" aria-label="Ask" disabled><Icon name="arrowUp" size={18} /></button>
          )}
        </div>
      </div>
      {!enough && <p className="composer-note">You&apos;ve used your {a.freeTotal} free videos.{a.friends < FRIENDS_MAX && <> <Link href="/account">Invite a friend</Link> for 10 more free.</>}{PLANS_ON ? <> Or <Link href="/buy">get a plan</Link>.</> : null}</p>}
      {enough && left && <p className="composer-note">{left}</p>}
      {capped && <p className="composer-note">Your plan teaches at {LEVEL_NAME[taught].toLowerCase()} level, so these videos will be {LEVEL_NAME[taught].toLowerCase()} lessons. <Link href="/buy">Get a {LEVEL_NAME[level].toLowerCase()} plan</Link> for {LEVEL_NAME[level].toLowerCase()} depth.</p>}
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
