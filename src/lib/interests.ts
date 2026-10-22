// What a person asks about and at what level (founder, 22 Oct 2026): chosen under the birth date, changed on /settings.
import { SUBJECT_GROUPS, type Subject } from "@/components/Chats";
import { LEVELS, type Level } from "@/lib/videos";

export const SUBJECTS: Subject[] = SUBJECT_GROUPS.flatMap(([, list]) => list);
export const isStudy = (s: Subject) => s !== "home" && s !== "car";
export type Interests = { subjects: Subject[]; level: Level };

/** The form's `subject` checkboxes and `level` select; null when no subject is ticked. */
export function readInterests(form: FormData): Interests | null {
  const ticked = form.getAll("subject");
  const subjects = SUBJECTS.filter((s) => ticked.includes(s));
  if (!subjects.length) return null;
  const level = LEVELS.find((l) => l === form.get("level")) ?? "school";
  return { subjects, level };
}
