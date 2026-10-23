import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/product";
import { getAccount } from "@/lib/session";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

// §11.10: a form (founder, 23 Oct 2026; messages show on /admin) and the email address. Replies within 2 business days.
export default async function Contact() {
  const account = await getAccount();
  return (
    <main className="page narrow stack">
      <h1>Contact</h1>
      <div className="card stack">
        <ContactForm signedInEmail={account?.user.email ?? null} />
        <p className="muted small">Or email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Please don&apos;t send card numbers or passwords.</p>
      </div>
    </main>
  );
}
