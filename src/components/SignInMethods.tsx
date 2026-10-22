"use client";
import { OTP_LENGTH } from "@/product";
// The sign-in methods (PLAN.md §5.4): Google (hidden in in-app browsers and until NEXT_PUBLIC_GOOGLE_ENABLED=1) and a
// 6-digit email code. The code is sent from the browser (Supabase's per-IP limits see the user) and checked on the
// server (verifyCode: per-email limit, then complete_signup in the same request).
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { verifyCode } from "@/app/actions";
import { EMAIL_PROBLEM, emailProblem } from "@/lib/email-check";

const RESEND_SECONDS = 60;
const OTP_KEY = "wb.otp";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Turnstile = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  reset: (id: string) => void;
};
declare global {
  interface Window { turnstile?: Turnstile }
}

export function SignInMethods({ next, showGoogle, inApp }: { next: string; showGoogle: boolean; inApp: boolean }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [sentAt, setSentAt] = useState(0);
  const [pending, startTransition] = useTransition();
  const [captchaEl, captchaMount] = useState<HTMLDivElement | null>(null);
  const captcha = useCaptcha(captchaEl);
  const codeRef = useRef<HTMLInputElement>(null);

  // A reload (Instagram's browser reloads when you switch to Mail) lands back on the code field.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(OTP_KEY) ?? "null");
      if (saved && Date.now() - saved.sentAt < 10 * 60_000) {
        // Storage is only readable after hydration, so this sync has to happen in an effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(saved.email);
        setSentAt(saved.sentAt);
        setStep("code");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (step !== "code") return;
    codeRef.current?.focus();
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step]);

  const wait = Math.max(0, RESEND_SECONDS - Math.floor((now - sentAt) / 1000));

  async function send() {
    setError(null);
    const address = email.trim().toLowerCase();
    if (!address.includes("@")) return setError("Enter your email address.");
    if (TURNSTILE_SITE_KEY && !captcha.token) {
      return setError(captcha.failed
        ? "We couldn't check this browser. Try again, or open this page in Safari or Chrome."
        : "Checking this browser… try again in a moment.");
    }
    setSending(true);
    // An alias or throwaway address may still sign in to an account it already has, but never makes a new one.
    const problem = emailProblem(address);
    const { error } = await createClient().auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: !problem, captchaToken: captcha.token ?? undefined },
    });
    setSending(false);
    captcha.reset();
    if (error) {
      return setError(problem && error.status !== 429 ? EMAIL_PROBLEM : error.status === 429
        ? "Too many codes sent. Wait a minute and try again."
        : "We couldn't send the code. Try again.");
    }
    const at = Date.now();
    try { sessionStorage.setItem(OTP_KEY, JSON.stringify({ email: address, sentAt: at })); } catch {}
    setEmail(address);
    setSentAt(at);
    setNow(at);
    setCode("");
    setStep("code");
  }

  function check(value: string) {
    setError(null);
    startTransition(async () => {
      try { sessionStorage.removeItem(OTP_KEY); } catch {}
      const res = await verifyCode(email, value, next); // redirects on success
      if (res?.error) {
        try { sessionStorage.setItem(OTP_KEY, JSON.stringify({ email, sentAt })); } catch {}
        setError(res.error);
        setCode("");
        codeRef.current?.focus();
      }
    });
  }

  async function google() {
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`, scopes: "openid email profile" },
    });
    if (error) setError("Sign-in didn't finish. Try again.");
  }

  return (
    <div className="stack">
      {step === "email" ? (
        <>
          {showGoogle && (
            <>
              <button type="button" className="btn secondary block" onClick={google}>
                Continue with Google
              </button>
              <p className="muted small" style={{ textAlign: "center" }}>or</p>
            </>
          )}
          {inApp && <InAppNote />}
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <p className="muted small">Use an email you&apos;ll keep. We&apos;ll send you a {OTP_LENGTH}-digit code.</p>
            <button type="submit" className="btn block" disabled={sending}>
              {sending ? "Sending…" : "Continue with email"}
            </button>
          </form>
        </>
      ) : (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === OTP_LENGTH) check(code);
          }}
        >
          <p>
            We sent a {OTP_LENGTH}-digit code to <strong>{email}</strong>.
          </p>
          {/* Outlook/Hotmail file our code under Junk while radlor.com's sender reputation is new (22 Oct 2026). */}
          <p className="muted small">Can&apos;t find it? Check your Junk or Spam folder for an email from askRadlor.</p>
          <label className="field">
            <span>Code</span>
            <input
              ref={codeRef}
              className="code-input"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern={`[0-9]{${OTP_LENGTH}}`}
              maxLength={OTP_LENGTH}
              value={code}
              disabled={pending}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
                setCode(v);
                if (v.length === OTP_LENGTH) check(v);
              }}
            />
          </label>
          <button type="submit" className="btn block" disabled={pending || code.length !== OTP_LENGTH}>
            {pending ? "Checking…" : "Continue"}
          </button>
          <p className="muted small">
            Didn&apos;t get it? Check spam, or{" "}
            {wait > 0 ? (
              <span>resend in {Math.floor(wait / 60)}:{String(wait % 60).padStart(2, "0")}</span>
            ) : (
              <button type="button" className="btn link" onClick={send} disabled={sending}>
                send a new code
              </button>
            )}
            . School email sometimes blocks codes; a personal email works best.
          </p>
          <button
            type="button"
            className="btn link"
            onClick={() => {
              try { sessionStorage.removeItem(OTP_KEY); } catch {}
              setStep("email");
              setError(null);
            }}
          >
            Wrong email?
          </button>
        </form>
      )}
      {TURNSTILE_SITE_KEY && <div ref={captchaMount} />}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p className="muted small">
        By continuing you agree to the <Link href="/legal/terms">Terms</Link> and{" "}
        <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}

function InAppNote() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card small">
      <p>Use email, or open this page in Safari or Chrome to use Google.</p>
      <button
        type="button"
        className="btn link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setCopied(true);
          } catch {}
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

/** Cloudflare Turnstile, only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; otherwise inert. */
function useCaptcha(el: HTMLDivElement | null) {
  const id = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !el) return;
    const render = () => {
      if (!window.turnstile || id.current) return;
      id.current = window.turnstile.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: "interaction-only",
        callback: (t: string) => { setToken(t); setFailed(false); },
        "expired-callback": () => setToken(null),
        "error-callback": () => { setToken(null); setFailed(true); },
      });
    };
    if (window.turnstile) return render();
    // Loaded by this (nonce-trusted) bundle, so 'strict-dynamic' allows it.
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = render;
    s.onerror = () => setFailed(true);
    document.head.appendChild(s);
  }, [el]);

  return {
    token,
    failed,
    reset: () => {
      setToken(null);
      if (id.current && window.turnstile) window.turnstile.reset(id.current);
    },
  };
}
