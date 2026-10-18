"use client";
// The signed-in frame (founder, 18 Oct 2026: "like Claude"): a sidebar with New chat, Explore, Your videos, the chat
// list and the account at the bottom; the page beside it. Phones get a top bar and the sidebar as a drawer.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_NAME } from "@/product";
import { SignOutButton } from "./SignOutButton";
import { ChatList, type ChatRow } from "./Chats";
import { Icon, type IconName } from "./Icon";

const HOLD_CREDITS = 6; // same value as lib/session.ts (server)

function Brand() {
  return (
    <Link href="/ask" className="brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={36} height={25} />
      <span>{PRODUCT_NAME}</span>
    </Link>
  );
}

export function AppFrame({ email, available, chats, children }: {
  email: string; available: number; chats: ChatRow[]; children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(path);
  const menu = useRef<HTMLDetailsElement>(null);
  // A new page closes the drawer and the account menu.
  if (seen !== path) { setSeen(path); setOpen(false); }
  useEffect(() => { if (menu.current) menu.current.open = false; }, [path]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const low = available < HOLD_CREDITS;
  const nav: [string, IconName, string][] = [["/explore", "compass", "Explore"], ["/library", "videos", "Your videos"]];
  const active = path.startsWith("/c/") ? path.slice(3) : undefined;

  return (
    <div className="app">
      <aside id="sidebar" className={`sidebar${open ? " open" : ""}`} aria-label="Sidebar">
        <div className="side-head">
          <Brand />
          <button type="button" className="icon-btn side-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <Icon name="close" />
          </button>
        </div>
        {/* a full load, so a chat in progress starts over clean */}
        <a href="/ask" className="side-new"><Icon name="newChat" size={18} /> New chat</a>
        <nav className="side-nav" aria-label="Main">
          {nav.map(([href, icon, label]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
              <Icon name={icon} size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="side-recents">
          <p className="side-label">Recents</p>
          <ChatList chats={chats} active={active} />
          {chats.length >= 30 && <Link href="/chats" className="side-all">All chats</Link>}
        </div>
        <div className="side-foot">
          <Link href="/buy" className={`pill${low ? " low" : ""}`} aria-label={`${available} credits. Buy credits`}>
            <Icon name="card" size={16} /> {available} {available === 1 ? "credit" : "credits"}
          </Link>
          <details className="menu up" ref={menu}>
            <summary aria-label="Account menu">
              <span className="avatar" aria-hidden="true">{email.slice(0, 1).toUpperCase()}</span>
              <span className="who">{email}</span>
              <Icon name="chevronUp" size={16} />
            </summary>
            <div className="menu-list">
              <Link href="/settings"><Icon name="settings" size={18} /> Settings</Link>
              <Link href="/account"><Icon name="user" size={18} /> Account</Link>
              <Link href="/buy"><Icon name="card" size={18} /> Buy credits</Link>
              <Link href="/help"><Icon name="help" size={18} /> Help</Link>
              <Link href="/legal/terms"><Icon name="file" size={18} /> Terms and privacy</Link>
              <hr />
              <SignOutButton className="" label="Sign out" icon />
            </div>
          </details>
        </div>
      </aside>
      {open && <div className="scrim" aria-hidden="true" onClick={() => setOpen(false)} />}
      <div className="app-main">
        <header className="topbar">
          <button type="button" className="icon-btn" aria-label="Open menu" aria-expanded={open} aria-controls="sidebar"
            onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
          <Brand />
          <a href="/ask" className="icon-btn" aria-label="New chat"><Icon name="newChat" /></a>
        </header>
        {children}
      </div>
    </div>
  );
}

// Signed out: the brand on the left, Explore and Sign in on the right.
export function PublicHeader() {
  return (
    <header className="public-header">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={36} height={25} />
        <span>{PRODUCT_NAME}</span>
      </Link>
      <nav aria-label="Main" className="public-nav">
        <Link href="/explore">Explore</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/signin" className="btn secondary sm">Sign in</Link>
      </nav>
    </header>
  );
}
