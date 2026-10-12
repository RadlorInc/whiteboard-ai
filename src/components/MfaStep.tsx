"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function MfaStep({ factorId }: { factorId: string | null }) {
  const sb = createClient(), router = useRouter();
  const [enrol, setEnrol] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState(""), [error, setError] = useState<string | null>(null);
  const id = factorId ?? enrol?.id;
  return (
    <div className="stack">
      {!id && (
        <button className="btn" type="button" onClick={async () => {
          const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `admin-${Date.now()}` });
          if (error || !data) return setError("Couldn't start. Try again.");
          setEnrol({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
        }}>Set up an authenticator app</button>
      )}
      {enrol && (
        <>
          <p>Scan this with Google Authenticator, 1Password or similar, then enter the 6-digit code.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrol.qr} alt="QR code for the authenticator app" width={200} height={200} />
          <p className="muted small">Can&apos;t scan? Key: <code>{enrol.secret}</code></p>
        </>
      )}
      {id && (
        <form className="stack" onSubmit={async e => {
          e.preventDefault(); setError(null);
          const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: id, code: code.trim() });
          if (error) return setError("That code didn't work. Check the app and try again.");
          router.push("/admin"); router.refresh();
        }}>
          <label>6-digit code<input className="input" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} /></label>
          <button className="btn">Continue</button>
        </form>
      )}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  );
}
