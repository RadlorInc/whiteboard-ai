import Link from "next/link";
import { Icon } from "./Icon";

export type VideoRow = { id: string; created_at: string; style: string; question: string | null; status: string; credits_charged: number | null };
export const VIDEO_COLUMNS = "id, created_at, style, question, status, credits_charged";

// Rows of videos: your own (/library) or Explore's (public share pages). One line each: play mark, question, date.
export function VideoRows({ rows }: { rows: { href: string; question: string; meta: string }[] }) {
  return (
    <ul className="video-list list-card">
      {rows.map(r => (
        <li key={r.href}>
          <Link href={r.href}>
            <span className="video-thumb"><Icon name="play" size={14} /></span>
            <span className="video-text">
              <span className="video-q">{r.question}</span>
              <span className="video-meta">{r.meta}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const day = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

// The signed-in person's own videos (RLS returns only their rows).
export function VideoList({ rows }: { rows: VideoRow[] }) {
  return <VideoRows rows={rows.map(r => ({
    href: `/videos/${r.id}`,
    question: r.question ?? "(deleted)",
    meta: `${day(r.created_at)} · ${r.status === "succeeded" ? `${r.credits_charged} credits` : r.status === "failed" || r.status === "refunded" ? "Not charged" : "Being made"}`,
  }))} />;
}
