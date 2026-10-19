import Link from "next/link";
import { PRODUCT_NAME } from "@/product";
import { HOLD_CREDITS } from "@/lib/session";
import { SignOutButton } from "@/components/SignOutButton";

// §5.2: wordmark → /ask, credits pill, account menu. No bottom tab bar.
export function Header({ available }: { available: number }) {
  const low = available > 0 && available < HOLD_CREDITS;
  return (
    <header className="site-header">
      <div className="bar">
        <Link href="/ask" className="wordmark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={28} height={35} />
          {PRODUCT_NAME}
        </Link>
        <Link href="/buy" className={`pill${low ? " low" : ""}`} aria-label={`${available} credits. Buy credits`}>
          {available} {available === 1 ? "credit" : "credits"}
        </Link>
        <details className="menu">
          <summary aria-label="Account menu">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </summary>
          <div className="menu-list">
            <Link href="/chats">Your chats</Link>
            <Link href="/library">Your videos</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/settings">Settings</Link>
            <Link href="/account">Account</Link>
            <Link href="/help">Help</Link>
            <SignOutButton className="" />
          </div>
        </details>
      </div>
    </header>
  );
}
