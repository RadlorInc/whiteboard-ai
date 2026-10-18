import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth stack" id="main" style={{ textAlign: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={96} height={66} className="auth-mark" style={{ width: 96 }} />
      <h1>Lost in space</h1>
      <p className="muted">This page doesn&apos;t exist, or it isn&apos;t yours to see.</p>
      <div><Link className="btn" href="/">Go home</Link></div>
    </main>
  );
}
