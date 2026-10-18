import Link from "next/link";
import { BoardPreview } from "./BoardPreview";
import { Icon } from "./Icon";
import { SUBJECT_NAME, type Subject } from "./Chats";

export type ExploreItem = { slug: string; title: string; style: string; script: unknown; n: number; subject: string | null; latest: string };

const day = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Explore's cards: a still of the first video's board, the chat's first question, its subject and how many videos.
export function ExploreGrid({ items }: { items: ExploreItem[] }) {
  return (
    <ul className="x-grid">
      {items.map((it) => (
        <li key={it.slug}>
          <Link href={`/v/${it.slug}`} className="x-card">
            <span className="x-thumb">
              <BoardPreview style={it.style} script={it.script} label={`Board from: ${it.title}`} />
              {it.n > 1 && <span className="x-badge"><Icon name="videos" size={14} /> {it.n} videos</span>}
              <span className="x-play" aria-hidden="true"><Icon name="play" size={18} /></span>
            </span>
            <span className="x-title">{it.title}</span>
            <span className="x-meta">{it.subject ? SUBJECT_NAME[it.subject as Subject] : "Video"} · {day(it.latest)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
