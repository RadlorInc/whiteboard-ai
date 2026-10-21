import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getT } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Help") }; }
const QA: [string, string][] = [
  ["How many videos do I get?", "10 free videos every month; they come back on the 1st (UTC). After that each video comes from a plan: Plus has 40 a month, Pro 100. A video that fails is never counted."],
  ["My video failed. Was I charged?", "No. Failed, refused and timed-out videos are always free."],
  ["The video looks wrong.", "Open it from Your videos and use Contact with the link. Wrong or broken plan videos reported within 7 days are given back."],
  ["Can I watch a video again?", "Yes, as often as you like, for free, from Your videos."],
  ["How do I share a video?", "Open it and press Share. Anyone with the link can watch; they can't see who made it. Stop sharing turns the link off."],
  ["There's no sound.", "Check your phone isn't on silent and the volume is up. Voices come from your device for now."],
  ["How do I cancel my plan?", "Account → Manage plan and payment. You keep your plan videos until the end of the period."],
  ["How do I delete my data?", "Account → Download my data, or Delete account."],
];

export default async function Help() {
  const t = await getT();
  return (
    <main className="page narrow stack">
      <h1>{t("Help")}</h1>
      <div className="faq">
        {QA.map(([q, a]) => (
          <details key={q}><summary>{t(q)}<Icon name="chevronDown" size={18} /></summary><p>{t(a)}</p></details>
        ))}
      </div>
      <p className="muted">{t("Still stuck?")} <Link href="/contact">{t("Contact us")}</Link>.</p>
    </main>
  );
}
