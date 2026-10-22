import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PLANS_ON } from "@/product";
import { freeVideos } from "@/lib/session";

export const metadata: Metadata = { title: "Help" };
const QA: [string, string][] = [
  ["How many videos do I get?", "Your first {free} videos are free. After that each video comes from a plan: Plus has 40 a month, Pro 100. A video that fails is never counted."],
  ["How do I get more free videos?", "Invite a friend from your Account page: when they make their first video you get 10 more free (up to 2 friends)."],
  ["My video failed. Was I charged?", "No. Failed, refused and timed-out videos are always free."],
  ["The video looks wrong.", "Open it from Your videos and use Contact with the link. Wrong or broken plan videos reported within 7 days are given back."],
  ["Can I watch a video again?", "Yes, as often as you like, for free, from Your videos."],
  ["How do I share a video?", "Open it and press Share. Anyone with the link can watch; they can't see who made it. Stop sharing turns the link off."],
  ["There's no sound.", "Check your phone isn't on silent and the volume is up. Voices come from your device for now."],
  ["How do I cancel my plan?", "Account → Manage plan and payment. You keep your plan videos until the end of the period."],
  ["How do I delete my data?", "Account → Download my data, or Delete account."],
];

export default async function Help() {
  const free = String(await freeVideos());
  const qa = QA
    .filter(([q]) => PLANS_ON || q !== "How do I cancel my plan?")
    .map(([q, a]): [string, string] => [q, (PLANS_ON ? a : a.replace(/ After that each video comes from a plan[^.]*\./, "")).replace("{free}", free)]);
  return (
    <main className="page narrow stack">
      <h1>Help</h1>
      <div className="faq">
        {qa.map(([q, a]) => (
          <details key={q}><summary>{q}<Icon name="chevronDown" size={18} /></summary><p>{a}</p></details>
        ))}
      </div>
      <p className="muted">Still stuck? <Link href="/contact">Contact us</Link>.</p>
    </main>
  );
}
