"use client";
// Theme and motion (§5.11), kept in localStorage and a cookie so the server renders them with no flash.
import { useState } from "react";

function save(name: string, attr: string, value: string) {
  const year = 60 * 60 * 24 * 365;
  document.cookie = value === "system"
    ? `${name}=; Path=/; Max-Age=0; SameSite=Lax`
    : `${name}=${value}; Path=/; Max-Age=${year}; SameSite=Lax`;
  try { localStorage.setItem(name, value); } catch {}
  if (value === "system") document.documentElement.removeAttribute(attr);
  else document.documentElement.setAttribute(attr, value);
}

function Choice({ legend, name, attr, options, initial }: {
  legend: string; name: string; attr: string; options: [string, string][]; initial: string;
}) {
  const [value, setValue] = useState(options.some(([v]) => v === initial) ? initial : "system");
  return (
    <fieldset>
      <legend style={{ fontWeight: 600, marginBottom: 6 }}>{legend}</legend>
      <div className="segmented">
        {options.map(([v, label]) => (
          <label key={v}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => { setValue(v); save(name, attr, v); }} />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Preferences({ theme, motion }: { theme?: string; motion?: string }) {
  return (
    <section className="stack">
      <Choice legend="Theme" name="wb_theme" attr="data-theme" initial={theme ?? "system"}
        options={[["system", "System"], ["light", "Light"], ["dark", "Dark"]]} />
      <Choice legend="Motion" name="wb_motion" attr="data-motion" initial={motion ?? "system"}
        options={[["system", "System"], ["full", "Full"], ["reduce", "Reduced"]]} />
    </section>
  );
}
