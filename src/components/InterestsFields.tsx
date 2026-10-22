"use client";
// The categories and level pickers (founder, 22 Oct 2026), for the birth-date step and /settings. The level is asked only
// when a study subject is ticked; home improvements and auto repairs have one level.
import { useState } from "react";
import { SUBJECT_GROUPS, SUBJECT_NAME, type Subject } from "./Chats";
import { LEVELS, LEVEL_NAME, type Level } from "@/lib/videos";
import { isStudy } from "@/lib/interests";

export function InterestsFields({ initial = [], level: initialLevel = "school", onChange }: {
  initial?: Subject[]; level?: Level; onChange?: (count: number) => void;
}) {
  const [picked, setPicked] = useState<Subject[]>(initial);
  const [level, setLevel] = useState<Level>(initialLevel);
  const toggle = (s: Subject) => {
    const next = picked.includes(s) ? picked.filter((x) => x !== s) : [...picked, s];
    setPicked(next);
    onChange?.(next.length);
  };
  return (
    <>
      <fieldset className="stack">
        <legend className="field-label">Choose your categories</legend>
        {SUBJECT_GROUPS.map(([group, list]) => (
          <div key={group} className="chips" role="group" aria-label={group}>
            {list.map((s) => (
              <label key={s} className={`chip${picked.includes(s) ? " on" : ""}`}>
                <input type="checkbox" name="subject" value={s} className="sr-only" checked={picked.includes(s)} onChange={() => toggle(s)} />
                {SUBJECT_NAME[s]}
              </label>
            ))}
          </div>
        ))}
      </fieldset>
      {picked.some(isStudy) ? (
        <label className="field">
          <span>Explanation level for biology, physics and chemistry</span>
          <select name="level" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
            {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_NAME[l]}</option>)}
          </select>
        </label>
      ) : <input type="hidden" name="level" value={level} />}
    </>
  );
}
