import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAccount } from "@/lib/session";
import { Preferences } from "@/components/Preferences";
import { VoicePicker, VoiceProgress } from "@/components/Voice";
import { getT } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> { return { title: (await getT())("Settings") }; }

// The narration voice, language and motion. All kept on this device.
export default async function Settings() {
  await requireAccount("/settings");
  const jar = await cookies();
  const t = await getT();
  return (
    <main className="page narrow stack">
      <div>
        <h1>{t("Settings")}</h1>
        <p className="page-sub">{t("Kept on this device.")}</p>
      </div>
      <section className="card stack">
        <h2>{t("Voice")}</h2>
        <VoicePicker />
        <VoiceProgress />
      </section>
      <section className="card">
        <Preferences motion={jar.get("wb_motion")?.value} lang={jar.get("wb_lang")?.value} />
      </section>
    </main>
  );
}
