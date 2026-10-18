import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAccount } from "@/lib/session";
import { Preferences } from "@/components/Preferences";
import { VoicePicker, VoiceProgress } from "@/components/Voice";

export const metadata: Metadata = { title: "Settings" };

// The narration voice and motion. Both kept on this device.
export default async function Settings() {
  await requireAccount("/settings");
  const jar = await cookies();
  return (
    <main className="page narrow stack">
      <div>
        <h1>Settings</h1>
        <p className="page-sub">Kept on this device.</p>
      </div>
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
