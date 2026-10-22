import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAccount } from "@/lib/session";
import { Preferences } from "@/components/Preferences";
import { InterestsForm } from "@/components/InterestsForm";
import { VoicePicker, VoiceProgress } from "@/components/Voice";

export const metadata: Metadata = { title: "Settings" };

// Your categories and level (on your account), then the narration voice and motion (kept on this device).
export default async function Settings() {
  const account = await requireAccount("/settings");
  const jar = await cookies();
  return (
    <main className="page narrow stack">
      <div>
        <h1>Settings</h1>
      </div>
      <section className="card stack">
        <h2>Your categories</h2>
        <p className="muted small">What you ask about, and the level for biology, physics and chemistry. Add more any time.</p>
        <InterestsForm initial={account.interests} />
      </section>
      <p className="muted small">Voice and motion are kept on this device.</p>
      <section className="card stack">
        <h2>Voice</h2>
        <VoicePicker />
        <VoiceProgress />
      </section>
      <section className="card">
        <Preferences motion={jar.get("wb_motion")?.value} />
      </section>
    </main>
  );
}
