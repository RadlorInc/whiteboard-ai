import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAccount } from "@/lib/session";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Preferences } from "@/components/Preferences";
import { VoicePicker, VoiceProgress } from "@/components/Voice";

export const metadata: Metadata = { title: "Settings" };

// The narration voice, theme and motion. All kept on this device.
export default async function Settings() {
  const account = await requireAccount("/settings");
  const jar = await cookies();
  return (
    <>
      <Header available={account.available} />
      <main className="page narrow stack">
        <h1>Settings</h1>
        <section className="card stack">
          <h2>Voice</h2>
          <VoicePicker />
          <VoiceProgress />
        </section>
        <Preferences theme={jar.get("wb_theme")?.value} motion={jar.get("wb_motion")?.value} />
      </main>
      <Footer />
    </>
  );
}
