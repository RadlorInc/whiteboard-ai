"use client";
// The question box (PLAN.md §5.6), shaped like Claude's (founder, 18 Oct 2026): the text on top; below it the subject
// on the left and the send button on the right. The voice is picked on /settings.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { startVoice } from "@/lib/voice";
import { VoiceProgress } from "./Voice";
import { Icon } from "./Icon";
import { SUBJECT_GROUPS, SUBJECT_NAME, type Subject } from "./Chats";
import { useLang, useT } from "./Lang";

import { LEVELS, LEVEL_NAME, canAsk, resetDay, taughtLevel, videos, type Allowance, type Level } from "@/lib/videos";
const EXAMPLES: Record<Subject, string[]> = {
  biology: ["How does the heart pump blood?", "How do we breathe?", "What does DNA do?"],
  physics: ["How does a rainbow form?", "Why do things fall?", "How does a car engine work?"],
  chemistry: ["Why does salt dissolve in water?", "What is an atom made of?", "How does fire burn?"],
  home: ["How do I tie a tie?", "Why did my breaker trip?", "How do I fix a leak under the sink?"],
  car: ["How do I change a flat tire?", "How do I check my oil?", "How do I change my oil?"],
};
const MAX = 500;

// onAsk: the chat takes the question; busy holds the button while its video is made (one video at a time).
// onSubject: the subject can still change (a new chat); without it the subject is fixed and only shown. The level
// (study subjects only; founder, 20 Oct 2026) works the same way: onLevel while the chat is new.
export function AskComposer({ allowance: a, firstRun, onAsk, busy = false, placeholder = "Ask anything…", subject, onSubject, level = "school", onLevel }: {
  allowance: Allowance; firstRun: boolean; onAsk: (question: string, explore: boolean) => void; busy?: boolean;
  placeholder?: string; subject: Subject; onSubject?: (s: Subject) => void; level?: Level; onLevel?: (l: Level) => void;
}) {
  const t = useT(), lang = useLang();
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
  // What is left this month (founder, 20 Oct 2026: show it): free first, then the plan. Admins see nothing.
  const left = a.admin ? null
    : a.freeLeft > 0 ? t("{left} of {total} free videos left this month", { left: a.freeLeft, total: a.freeMonthly })
      + (a.plan > 0 ? ` · ${t("{videos} from your plan", { videos: videos(a.plan, t) })}` : "")
    : a.plan > 0 ? t("{videos} left from your plan · free videos come back {day}", { videos: videos(a.plan, t), day: resetDay(a.resetsAt, lang) }) : null;
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
        <label htmlFor="question" className="sr-only">{t("Your question")}</label>
        <textarea
          id="question"
          autoComplete="off"
          ref={box}
          name="question"
          rows={1}
          maxLength={MAX}
          enterKeyHint="send"
          placeholder={t(placeholder)}
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
              <span className="sr-only">{t("Subject")}</span>
              <select value={subject} onChange={(e) => onSubject(e.target.value as Subject)}>
                {SUBJECT_GROUPS.map(([group, list]) => (
                  <optgroup key={group} label={t(group)}>{list.map((s) => <option key={s} value={s}>{t(SUBJECT_NAME[s])}</option>)}</optgroup>
                ))}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
          ) : (
            <span className="subject-pick locked" title={t("A chat keeps its subject. Start a new chat for another.")}>{t(SUBJECT_NAME[subject])}</span>
          )}
          {study && (onLevel ? (
            <label className="subject-pick" title={t("What to teach: a high-school, college or grad-school lesson")}>
              <span className="sr-only">{t("Level")}</span>
              <select value={level} onChange={(e) => onLevel(e.target.value as Level)}>
                {LEVELS.map((l) => <option key={l} value={l}>{t(LEVEL_NAME[l])}</option>)}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
          ) : (
            <span className="subject-pick locked" title={t("A chat keeps its level. Start a new chat for another.")}>{t(LEVEL_NAME[level])}</span>
          ))}
          {question.length >= 400 && <span className="count">{question.length} / {MAX}</span>}
          {enough ? (
            <button type="submit" className="send" aria-label={t("Ask")} disabled={empty || busy}>
              {busy ? <span className="spinner sm" aria-hidden="true" /> : <Icon name="arrowUp" size={18} />}
            </button>
          ) : (
            <Link href="/start" className="btn sm send-buy">{t("Get more videos")}</Link>
          )}
        </div>
      </div>
      {!enough && <p className="composer-note">{t("You've used your {n} free videos this month. They come back on {day}, or", { n: a.freeMonthly, day: resetDay(a.resetsAt, lang) })} <Link href="/buy">{t("get a plan")}</Link> {t("for more.")}</p>}
      {enough && left && <p className="composer-note">{left}</p>}
      {capped && <p className="composer-note">{t("Your plan teaches at {taught} level, so these videos will be {taught} lessons.", { taught: t(LEVEL_NAME[taught]).toLowerCase() })} <Link href="/buy">{t("Get a {level} plan", { level: t(LEVEL_NAME[level]).toLowerCase() })}</Link> {t("for {level} depth.", { level: t(LEVEL_NAME[level]).toLowerCase() })}</p>}
      <VoiceProgress />
      {firstRun && (
        <div className="examples" aria-label={t("Example questions")}>
          {EXAMPLES[subject].map((q) => (
            <button key={q} type="button" className="chip" onClick={() => { setQuestion(t(q)); box.current?.focus(); }}>{t(q)}</button>
          ))}
        </div>
      )}
      <p className="composer-note">{t("Written by AI. It can be wrong.")}</p>
    </form>
  );
}
