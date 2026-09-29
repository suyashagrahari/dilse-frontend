"use client";

// Three overlays: Memories (the sheet that rises from the camera), the streak
// celebration (fire burst + count-up + milestone line), and a milestone letter
// opened from chat, laid out like a saved message.

import { useState, type CSSProperties } from "react";
import type { Ctx } from "./ctx";
import { photoStyle } from "./tokens";
import Bitmoji from "./Bitmoji";
import { IcChevDown, IcLock } from "./icons";
import { milestoneLine } from "../skin";
import { rnd as rnd0 } from "../../../_love/LetterReveal";

/** Rounded so the server and client render identical style strings. */
const rnd = (i: number, salt: number) => rnd0(i, salt);
const n2 = (x: number) => Math.round(x * 100) / 100;

const TABS = ["All", "Snaps", "Camera Roll", "My Eyes Only"] as const;

export function Memories({ ctx, onClose }: { ctx: Ctx; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const photos = ctx.photos;
  const open = (i: number) =>
    ctx.openViewer({
      kind: "memory",
      from: "a",
      time: photos[i]?.caption || "Memories",
      items: photos.map((p) => ({ photo: p, caption: p.caption, sub: p.note, secs: 7 })),
      start: i,
    });
  const list = tab === "Snaps" ? photos.filter((_, i) => i % 2 === 0) : photos;

  return (
    <div className="snSheetWrap" onClick={onClose}>
      <div className="snMem" role="dialog" aria-modal="true" aria-label="Memories" onClick={(e) => e.stopPropagation()}>
        <header className="snMemHead">
          <button type="button" className="snRound" onClick={onClose} aria-label="Close memories">
            <IcChevDown size={22} />
          </button>
          <h2>Memories</h2>
          <span className="snRoundGhost" />
        </header>
        <div className="snMemTabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>
              {t === "My Eyes Only" ? "🔒 " : ""}
              {t}
            </button>
          ))}
        </div>

        {tab === "My Eyes Only" ? (
          <div className="snEyes">
            <span className="snEyesLock"><IcLock size={34} color="#fff" /></span>
            <b>My Eyes Only</b>
            <p>{ctx.data.letter.trim() ? `${ctx.data.pair.a.name || "someone"} hid a letter in here. just for you.` : "nothing hidden in here… yet 👀"}</p>
            {ctx.data.letter.trim() && (
              <button type="button" className="snPill is-blue" onClick={() => { onClose(); ctx.openLetter(); }}>
                unlock 💌
              </button>
            )}
          </div>
        ) : photos.length === 0 ? (
          <div className="snEyes is-empty">
            <b>No memories yet</b>
            <p>photos you add in the editor live here</p>
          </div>
        ) : (
          <div className="snMemScroll">
            <button type="button" className="snFlash" onClick={() => open(0)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[0].url} alt="" draggable={false} style={photoStyle(photos[0])} />
              <span className="snFlashShade" />
              <span className="snFlashTx">
                <small>Flashback</small>
                <b>{photos[0].caption || "on this day"} 💛</b>
              </span>
            </button>
            <p className="snMemMonth">{tab === "Camera Roll" ? "Recents" : "Our favourites"}</p>
            <div className="snMemGrid">
              {list.map((p) => {
                const i = photos.indexOf(p);
                return (
                  <button key={i} type="button" className="snMemTile" onClick={() => open(i)} aria-label={p.caption || `Memory ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" draggable={false} style={photoStyle(p)} />
                    {p.caption && <span>{p.caption}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Celebration({
  ctx,
  from,
  to,
  onDone,
  letterAt,
}: {
  ctx: Ctx;
  from: number;
  to: number;
  onDone: () => void;
  /** A sealed letter that this day just unlocked. */
  letterAt?: number;
}) {
  const line = milestoneLine(to);
  const name = ctx.themP.name || "them";
  return (
    <div className={`snCele${line ? " is-milestone" : ""}`} role="dialog" aria-modal="true" aria-label={`Streak ${to}`} onClick={onDone}>
      <div className="snCeleRain" aria-hidden>
        {Array.from({ length: line ? 34 : 20 }, (_, i) => (
          <i
            key={i}
            style={
              {
                left: `${n2(rnd(i, 2) * 100)}%`,
                animationDelay: `${n2(rnd(i, 4) * 1.2)}s`,
                animationDuration: `${n2(2.2 + rnd(i, 6) * 1.8)}s`,
                fontSize: `${n2(16 + rnd(i, 8) * 26)}px`,
                "--dx": `${n2(rnd(i, 10) * 80 - 40)}px`,
              } as CSSProperties
            }
          >
            {["🔥", "💛", "✨", "🔥", "💕"][i % 5]}
          </i>
        ))}
      </div>
      <div className="snCeleBody" onClick={(e) => e.stopPropagation()}>
        <div className="snCeleAvs">
          <Bitmoji preset={ctx.themAvatar} side={ctx.them} photoUrl={ctx.themP.photoUrl} size={64} />
          <span className="snCeleFire" aria-hidden>🔥</span>
          <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={64} mood="love" />
        </div>
        <div className="snCeleNum" aria-hidden>
          <span className="snCeleFrom">{from}</span>
          <span className="snCeleTo">{to}</span>
        </div>
        <b className="snCeleTitle">
          {to} day streak with {name}!
        </b>
        <p className="snCeleLine">{line ?? "you both snapped today. the fire lives 🔥"}</p>
        <div className="snCeleActs">
          {letterAt ? (
            <button type="button" className="snPill is-yellow" onClick={() => { onDone(); ctx.openMilestone(letterAt); }}>
              💌 open your {letterAt}-day letter
            </button>
          ) : null}
          <button type="button" className={`snPill ${letterAt ? "is-ghost" : "is-yellow"}`} onClick={onDone}>
            keep it going 🔥
          </button>
        </div>
      </div>
    </div>
  );
}

export function MilestoneLetter({ ctx, atDay, onClose }: { ctx: Ctx; atDay: number; onClose: () => void }) {
  const m = ctx.data.milestones.find((x) => x.atDay === atDay);
  if (!m) return null;
  const from = ctx.data.pair.a.name || "them";
  return (
    <div className="snSheetWrap is-center" onClick={onClose}>
      <div className="snMilestone" role="dialog" aria-modal="true" aria-label={`${atDay}-day letter`} onClick={(e) => e.stopPropagation()}>
        <div className="snMilestoneTop">
          <span className="snMilestoneFire">🔥 {atDay}</span>
          <button type="button" className="snRound" onClick={onClose} aria-label="Close">
            <IcChevDown size={22} />
          </button>
        </div>
        <p className="snGroupName" style={{ color: ctx.me === "a" ? "#F23C57" : "#0EADFF" }}>{from.toUpperCase()}</p>
        <div className="snMilestoneText">
          {m.letter.split(/\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="snMilestoneFoot">Saved in Chat 💛 · unlocked at a {atDay}-day streak</p>
      </div>
    </div>
  );
}
