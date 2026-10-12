"use client";
import { useState } from "react";
import { Player, type Style } from "./Watch";

export function SharedPlayer({ style, script }: { style: Style; script: Record<string, unknown> }) {
  const [n, setN] = useState(0);
  return (
    <section className="stack">
      <Player key={n} style={style} script={script} />
      <button className="btn" type="button" onClick={() => setN(n + 1)}>Replay</button>
    </section>
  );
}
