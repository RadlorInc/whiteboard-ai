"use client";
// Inside Instagram, Facebook, LinkedIn or Snapchat a link opens in the app's own small browser, where the voice and
// sound work worse (founder, 26 Oct 2026: "use Chrome for the better experience"). Only there, a thin bar suggests the
// real browser: on Android one tap opens Chrome; on an iPhone no page can leave the app, so it says how. Dismissible.
import { useEffect, useState } from "react";

const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|LinkedInApp|Snapchat/i;
const KEY = "wb.inAppTip";

export function InAppTip() {
  const [show, setShow] = useState<null | "android" | "ios">(null);
  useEffect(() => {
    const ua = navigator.userAgent;
    let gone = false; try { gone = sessionStorage.getItem(KEY) === "1"; } catch {}
    // Reading the user agent is only possible after hydration, so it has to happen in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!gone && IN_APP.test(ua)) setShow(/Android/i.test(ua) ? "android" : "ios");
  }, []);
  if (!show) return null;
  const close = () => { try { sessionStorage.setItem(KEY, "1"); } catch {} setShow(null); };
  // Chrome on Android opens an intent:// link to the same page; the rest of the address is this page's own
  const chrome = () => { location.href = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;end`; };
  return (
    <div className="in-app-tip" role="note">
      <span>{show === "android" ? "For the best experience, open this page in Chrome." : "For the best experience, open this page in Safari: tap ••• and choose Open in browser."}</span>
      {show === "android" && <button type="button" className="btn sm" onClick={chrome}>Open in Chrome</button>}
      <button type="button" className="btn ghost sm" onClick={close} aria-label="Close this tip">Not now</button>
    </div>
  );
}
