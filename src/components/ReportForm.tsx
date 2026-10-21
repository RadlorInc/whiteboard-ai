"use client";
import { useActionState } from "react";
import { reportVideo } from "@/app/(app)/v/[slug]/actions";
import { useT } from "./Lang";

const REASONS: [string, string][] = [
  ["wrong", "It's wrong"], ["offensive", "Offensive or harmful"], ["personal_info", "Shows someone's personal information"],
  ["spam", "Spam or advertising"], ["other", "Something else"],
];

export function ReportForm({ slug }: { slug: string }) {
  const t = useT();
  const [s, act, pending] = useActionState(reportVideo, undefined);
  if (s?.ok) return <p className="muted small" role="status">{t("Thanks. We'll look at this video.")}</p>;
  return (
    <details className="report">
      <summary>{t("Report this video")}</summary>
      <form action={act} className="stack" style={{ marginTop: 8 }}>
        <input type="hidden" name="slug" value={slug} />
        <fieldset className="stack" style={{ gap: 4 }}>
          <legend className="small">{t("What's the problem?")}</legend>
          {REASONS.map(([v, label]) => (
            <label key={v} className="row small" style={{ gap: 8 }}><input type="radio" name="reason" value={v} required /> {t(label)}</label>
          ))}
        </fieldset>
        <label className="stack small" style={{ gap: 4 }}>{t("Anything to add (optional)")}
          <textarea name="note" maxLength={500} rows={2} />
        </label>
        <button className="btn secondary" disabled={pending}>{t("Send report")}</button>
        {s?.error && <p className="error small" role="alert">{s.error}</p>}
      </form>
    </details>
  );
}
