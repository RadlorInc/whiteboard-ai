"use client";
// Motion (§5.11) and language; the app is always dark (founder, 18 Oct 2026), kept in localStorage and a cookie so the
// server renders them with no flash. A new language reloads the page: its words come from the server.
import { useState } from "react";
import { useT } from "./Lang";

function save(name: string, attr: string, value: string) {
  const year = 60 * 60 * 24 * 365;
  document.cookie = value === "system"
    ? `${name}=; Path=/; Max-Age=0; SameSite=Lax`
    : `${name}=${value}; Path=/; Max-Age=${year}; SameSite=Lax`;
  try { localStorage.setItem(name, value); } catch {}
  if (value === "system") document.documentElement.removeAttribute(attr);
  else document.documentElement.setAttribute(attr, value);
}

function Choice({ legend, name, attr, options, initial, reload }: {
  legend: string; name: string; attr: string; options: [string, string][]; initial: string; reload?: boolean;
}) {
  const [value, setValue] = useState(options.some(([v]) => v === initial) ? initial : "system");
  return (
    <fieldset>
      <legend style={{ fontWeight: 600, marginBottom: 8 }}>{legend}</legend>
      <div className="segmented">
        {options.map(([v, label]) => (
          <label key={v}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => { setValue(v); save(name, attr, v); if (reload) location.reload(); }} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Preferences({ motion, lang }: { motion?: string; lang?: string }) {
  const t = useT();
  return (
    <section className="stack">
      {/* Automatic: Dutch in the Netherlands and Belgium or for a Dutch browser, English otherwise (lib/i18n.ts). */}
      <Choice legend={t("Language")} name="wb_lang" attr="data-lang" initial={lang ?? "system"} reload
        options={[["system", t("Automatic")], ["en", "English"], ["nl", "Nederlands"]]} />
      <Choice legend={t("Motion")} name="wb_motion" attr="data-motion" initial={motion ?? "system"}
        options={[["system", t("System")], ["full", t("Full")], ["reduce", t("Reduced")]]} />
    </section>
  );
}
