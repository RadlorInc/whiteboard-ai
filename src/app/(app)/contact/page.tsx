import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/product";

export const metadata: Metadata = { title: "Contact" };

// §11.10: email support until the address and a form exist (A11: replies within 2 business days).
export default function Contact() {
  return (
    <main className="page narrow stack">
      <h1>Contact</h1>
      <div className="card stack">
        <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We reply within 2 business days.</p>
        <p className="muted small">For a video, include its link. Please don&apos;t send card numbers or passwords.</p>
      </div>
    </main>
  );
}
