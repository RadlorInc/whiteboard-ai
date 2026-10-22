"use client";
import { useActionState, useState } from "react";
import { submitAge } from "@/app/actions";
import { InterestsFields } from "./InterestsFields";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December"];

// §5.4: neutral, two selects with no default, Continue disabled until both are chosen; nothing hints that 13 matters.
export function AgeForm({ src, next, initialError }: { src?: string; next?: string | null; initialError?: string }) {
  const [state, action, pending] = useActionState(submitAge, initialError ? { error: initialError } : undefined);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [picked, setPicked] = useState(0);
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, i) => thisYear - i);
  return (
    <form action={action} className="stack">
      {src && <input type="hidden" name="src" value={src} />}
      {next && <input type="hidden" name="next" value={next} />}
      <label className="field">
        <span>Month</span>
        <select name="month" value={month} onChange={(e) => setMonth(e.target.value)} required>
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Year</span>
        <select name="year" value={year} onChange={(e) => setYear(e.target.value)} required>
          <option value="" disabled>
            Year
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <InterestsFields onChange={setPicked} />
      <button type="submit" className="btn block" disabled={!month || !year || !picked || pending}>
        Continue
      </button>
      {state?.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
    </form>
  );
}
