"use client";

// ─── Catch — the side panels (wide screens only) ─────────────────────────────
//
// On a laptop the playfield stays phone-shaped in the middle, like a real
// portrait arcade game, and the space either side becomes the cabinet: the
// letter stacking itself up live on the left, the memory collection and the
// scoreboard on the right.

import type { CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { CatchData } from "./types";

export function LeftPanel({ data, caught, playing }: { data: CatchData; caught: number[]; playing: boolean }) {
  const set = new Set(caught);
  return (
    <aside className="ct-side ct-side--l" aria-label="The letter so far">
      <div className="ct-sideCard">
        <p className="ct-sideKick">the letter so far</p>
        <p className="ct-sideBig">
          {set.size}
          <small>/{data.goodItems.length} pieces</small>
        </p>
        <div className="ct-sideBar"><i style={{ width: `${(set.size / Math.max(1, data.goodItems.length)) * 100}%` }} /></div>
        <ol className="ct-sideLines">
          {data.goodItems.map((g, i) => (
            <li key={g.id || i} className={set.has(i) ? "is-on" : ""} style={{ "--i": i } as CSSProperties}>
              <span>{g.emoji}</span>
              <p>{set.has(i) ? g.line : playing ? "still falling…" : "catch it to read it"}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="ct-sideCard ct-how">
        <p className="ct-sideKick">how to play</p>
        <ul>
          <li><b>🖱️ / ← →</b> move {data.recipientName || "your"}&apos;s face</li>
          <li><b>💌</b> letter piece · 100</li>
          {data.photos.length > 0 && <li><b>📸</b> memory · 250</li>}
          <li><b>💗</b> heart · 10</li>
          {data.badItems.length > 0 && <li><b>💬</b> the ick · −1 life</li>}
          <li><b>🧲 ✨ 🛡️</b> magnet · ×2 · shield</li>
          <li><b>P</b> pause</li>
        </ul>
      </div>
    </aside>
  );
}

export function RightPanel({ data, photosCaught, best, streak }: { data: CatchData; photosCaught: number[]; best: number; streak: number }) {
  const set = new Set(photosCaught);
  return (
    <aside className="ct-side ct-side--r" aria-label="Memories and scores">
      {data.photos.length > 0 && (
        <div className="ct-sideCard">
          <p className="ct-sideKick">memory collection</p>
          <div className="ct-sideGrid">
            {data.photos.map((p, i) => (
              <span key={i} className={`ct-sideSlot${set.has(i) ? " is-on" : ""}`}>
                {set.has(i) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={p.caption || ""} draggable={false} style={cropStyle(photoCrop(p))} />
                ) : (
                  <b>?</b>
                )}
              </span>
            ))}
          </div>
          <p className="ct-sideNote">{set.size}/{data.photos.length} caught — each one opens a little note</p>
        </div>
      )}
      <div className="ct-sideCard">
        <p className="ct-sideKick">this cabinet</p>
        <div className="ct-sideStats">
          <span><b>{best.toLocaleString("en-IN")}</b>best score</span>
          <span><b>🔥 {Math.max(1, streak)}</b>day streak</span>
        </div>
        <p className="ct-sideNote">made by {data.senderName || "someone"} for {data.recipientName || "you"} 💘</p>
      </div>
    </aside>
  );
}
