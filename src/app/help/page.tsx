import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Help" };
const QA: [string, string][] = [
  ["How do credits work?", "1 credit = 10 seconds of video. When you ask, up to 6 credits are held; you pay only for the length made, and the rest comes back at once."],
  ["My video failed. Was I charged?", "No. Failed, refused and timed-out videos are always free."],
  ["The video looks wrong.", "Open it from Your videos and use Contact with the link. Wrong or broken videos reported within 7 days get their credits back."],
  ["Can I watch a video again?", "Yes, as often as you like, for free, from Your videos."],
  ["How do I share a video?", "Open it and press Share. Anyone with the link can watch; they can't see who made it. Stop sharing turns the link off."],
  ["There's no sound.", "Check your phone isn't on silent and the volume is up. Voices come from your device for now."],
  ["How do I cancel my plan?", "Account → Manage plan and payment. You keep your plan credits until the end of the period."],
  ["How do I delete my data?", "Account → Download my data, or Delete account."],
];

export default function Help() {
  return (
    <>
      <main className="page narrow stack">
        <h1>Help</h1>
        {QA.map(([q, a]) => <details key={q} className="card"><summary><strong>{q}</strong></summary><p>{a}</p></details>)}
        <p>Still stuck? <Link href="/contact">Contact us</Link>.</p>
      </main>
      <Footer />
    </>
  );
}
