import Link from "next/link";

const STYLE = { whiteboard: "Whiteboard", paper: "Paper", matchcut: "Match-cut" } as Record<string, string>;
export type VideoRow = { id: string; created_at: string; style: string; question: string | null; status: string; credits_charged: number | null };
export const VIDEO_COLUMNS = "id, created_at, style, question, status, credits_charged";

// The signed-in person's own videos (RLS returns only their rows): /library lists them all, /ask the latest five.
export function VideoList({ rows }: { rows: VideoRow[] }) {
  return (
    <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
      {rows.map(r => (
        <li key={r.id} className="card">
          <Link href={`/videos/${r.id}`}><strong>{r.question ?? "(deleted)"}</strong></Link>
          <p className="muted">
            {STYLE[r.style]} · {new Date(r.created_at).toLocaleDateString()} ·{" "}
            {r.status === "succeeded" ? `${r.credits_charged} credits` : r.status === "failed" || r.status === "refunded" ? "Not charged" : "Being made"}
          </p>
        </li>
      ))}
    </ul>
  );
}
