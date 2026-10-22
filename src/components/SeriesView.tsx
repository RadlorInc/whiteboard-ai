"use client";
// A shared video and the rest of its chat (founder, 18 Oct 2026): the videos in order, the first one playing; each
// one that ends starts the next. A tap on any of them plays it (again).
import { useRef, useState } from "react";
import { Player, type Style } from "./Watch";
import { VoiceProgress } from "./Voice";
import { BoardPreview } from "./BoardPreview";
import Link from "next/link";
import { Icon } from "./Icon";

export type SeriesItem = { slug: string; question: string; style: Style; script: Record<string, unknown> };

// signUpAfter: signed out, the items hold half a video; when it ends a sign-up popup opens, coming back to this path.
export function SeriesView({ items, start, signUpAfter }: { items: SeriesItem[]; start: number; signUpAfter?: string }) {
  const [at, setAt] = useState({ i: start, n: 0 });
  const play = (i: number) => setAt((a) => ({ i, n: a.n + 1 }));
  const popup = useRef<HTMLDialogElement>(null);
  return (
    <div className="thread">
      <VoiceProgress />
      {items.map((v, i) => (
        <section key={v.slug} className="turn" id={v.slug}>
          {(i > 0 || items.length > 1) && <p className="chat-q">{v.question}</p>}
          {at.i === i ? (
            <>
              <Player key={at.n} style={v.style} script={v.script} onEnded={i + 1 < items.length ? () => play(i + 1) : signUpAfter ? () => popup.current?.showModal() : undefined} />
              <p className="answer-meta">
                <button type="button" className="btn ghost sm" onClick={() => play(i)}><Icon name="replay" size={16} /> Replay</button>
                {i + 1 < items.length && <span>Next starts when this one ends.</span>}
              </p>
            </>
          ) : (
            <button type="button" className="poster has-preview" onClick={() => play(i)} aria-label={`Play: ${v.question}`}>
              <BoardPreview style={v.style} script={v.script} label="" />
              <span className="poster-play"><Icon name="play" size={22} /></span>
            </button>
          )}
        </section>
      ))}
      {signUpAfter && (
        <dialog ref={popup} className="signup-popup" aria-labelledby="half-title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={56} height={39} />
          <h2 id="half-title">Sign up to watch the rest</h2>
          <p className="muted small">That was the first half. Sign up free to see the whole video and ask your own questions.</p>
          <div className="toolbar" style={{ justifyContent: "center" }}>
            <Link className="btn" href={`/signup?src=share&next=${encodeURIComponent(signUpAfter)}`}>Sign up</Link>
            <Link className="btn secondary" href={`/signin?next=${encodeURIComponent(signUpAfter)}`}>Log in</Link>
          </div>
          <form method="dialog"><button className="btn ghost sm">Not now</button></form>
        </dialog>
      )}
    </div>
  );
}

// Signed out: the chat's other videos, blurred and not playable (their scripts are not on the page), under a card that
// asks to sign up or log in. Logging in comes back here.
export function SeriesGate({ questions, next }: { questions: string[]; next: string }) {
  const more = questions.length;
  return (
    <section className="gate-zone" aria-labelledby="gate-title">
      <div className="gate-blur" aria-hidden="true">
        {questions.map((q, i) => (
          <div key={i} className="turn">
            <p className="chat-q">{q}</p>
            <div className="gate-board" />
          </div>
        ))}
      </div>
      <div className="gate-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={56} height={39} />
        <h2 id="gate-title">Sign up to watch the rest</h2>
        <p className="muted small">{more} more {more === 1 ? "video" : "videos"} in this lesson. Watching is free with an account.</p>
        <div className="toolbar" style={{ justifyContent: "center" }}>
          <Link className="btn" href={`/signup?src=share&next=${encodeURIComponent(next)}`}>Sign up</Link>
          <Link className="btn secondary" href={`/signin?next=${encodeURIComponent(next)}`}>Log in</Link>
        </div>
      </div>
    </section>
  );
}
