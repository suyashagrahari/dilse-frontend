"use client";

// The home screen: a camera. Full-bleed viewfinder (their photos stand in for
// the live feed — "flip" cycles through them), the tool rail on the right, the
// lens carousel hugging the capture button, and the daily prompt up top. The
// capture button is the whole mechanic: tap it, add today's word, send.

import { useState, type CSSProperties } from "react";
import type { Ctx } from "./ctx";
import { C, photoStyle } from "./tokens";
import Bitmoji from "./Bitmoji";
import {
  IcAddFriend,
  IcChevDown,
  IcFlash,
  IcFlip,
  IcLens,
  IcMemories,
  IcMusic,
  IcSearch,
  IcTimer,
} from "./icons";
import { rnd as rnd0 } from "../../../_love/LetterReveal";

/** Rounded so the server and client render identical style strings. */
const rnd = (i: number, salt: number) => rnd0(i, salt);
const n2 = (x: number) => Math.round(x * 100) / 100;

export interface Lens {
  id: string;
  name: string;
  emoji: string;
  filter: string;
  fx: "none" | "hearts" | "sparkle" | "golden" | "vintage" | "butterfly" | "blush";
}

export const LENSES: Lens[] = [
  { id: "none", name: "Normal", emoji: "", filter: "none", fx: "none" },
  { id: "hearts", name: "Heart Eyes", emoji: "😍", filter: "saturate(1.15) contrast(1.02)", fx: "hearts" },
  { id: "golden", name: "Golden Hour", emoji: "🌅", filter: "sepia(.28) saturate(1.35) brightness(1.06) hue-rotate(-8deg)", fx: "golden" },
  { id: "blush", name: "Blush", emoji: "🥰", filter: "saturate(1.2) brightness(1.05) hue-rotate(-6deg)", fx: "blush" },
  { id: "sparkle", name: "Sparkle", emoji: "✨", filter: "brightness(1.08) contrast(1.05)", fx: "sparkle" },
  { id: "vintage", name: "Film '09", emoji: "📼", filter: "grayscale(.35) sepia(.35) contrast(1.1) brightness(.98)", fx: "vintage" },
  { id: "butterfly", name: "Butterflies", emoji: "🦋", filter: "saturate(1.1) hue-rotate(8deg)", fx: "butterfly" },
];

/** The lens overlay: CSS-only particles, deterministic positions. */
export function LensFx({ fx, today }: { fx: Lens["fx"]; today?: string }) {
  if (fx === "none") return null;
  if (fx === "golden") return <div className="snFxGolden" aria-hidden />;
  if (fx === "vintage") {
    return (
      <div className="snFxVintage" aria-hidden>
        <span className="snFxDate">{(today ?? "").slice(2).replace(/-/g, " ")}</span>
      </div>
    );
  }
  if (fx === "blush") {
    return (
      <div className="snFxBlush" aria-hidden>
        <i style={{ left: "18%", top: "58%" }}>💗</i>
        <i style={{ right: "16%", top: "54%" }}>💗</i>
        <i style={{ left: "44%", top: "14%", fontSize: 44 }}>🎀</i>
      </div>
    );
  }
  const glyph = fx === "hearts" ? "♥" : fx === "sparkle" ? "✦" : "🦋";
  return (
    <div className={`snFxRain snFxRain--${fx}`} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: `${n2(rnd(i, 3) * 100)}%`,
              animationDelay: `${n2(rnd(i, 5) * 5)}s`,
              animationDuration: `${n2(4 + rnd(i, 7) * 4)}s`,
              fontSize: `${n2(14 + rnd(i, 9) * 22)}px`,
              "--dx": `${n2(rnd(i, 11) * 60 - 30)}px`,
            } as CSSProperties
          }
        >
          {glyph}
        </i>
      ))}
    </div>
  );
}

export default function Camera({ ctx, framed }: { ctx: Ctx; framed?: boolean }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lens, setLens] = useState(1);
  const [flash, setFlash] = useState(false);
  const [shutter, setShutter] = useState(0);
  const photos = ctx.photos;
  const photo = photos.length ? photos[photoIdx % photos.length] : undefined;
  const L = LENSES[lens];
  const { todayView, view } = ctx;
  const count = view.count;

  const capture = () => {
    setShutter((s) => s + 1);
    window.setTimeout(() => ctx.openCompose(photoIdx, lens), ctx.reduced ? 0 : 260);
  };

  const prompt = todayView.mineIn
    ? todayView.theirsIn
      ? `✓ you both snapped today · 🔥 ${count}`
      : `sent ✓ waiting on ${ctx.themP.name || "them"} 👀`
    : view.status === "dormant"
      ? `🔥 paused at ${count} · snap to pick it back up`
      : count > 0
        ? `⌛ snap ${ctx.themP.name || "them"} today · 🔥 ${count}`
        : `snap ${ctx.themP.name || "them"} to start your 🔥`;

  return (
    <div className={`snCam${framed ? " is-framed" : ""}`}>
      <div className="snCamFeed" style={{ filter: L.filter }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={photo.url} src={photo.url} alt="" draggable={false} className="snCamImg" style={photoStyle(photo)} />
        ) : (
          <div className="snCamEmpty">
            <Bitmoji preset={ctx.themAvatar} side={ctx.them} size={120} />
            <Bitmoji preset={ctx.meAvatar} side={ctx.me} size={120} mood="love" />
          </div>
        )}
      </div>
      <LensFx fx={L.fx} today={ctx.today} />
      <div className="snCamShade" aria-hidden />
      {shutter > 0 && <div key={shutter} className="snShutter" aria-hidden />}
      {flash && <div className="snFlashTint" aria-hidden />}

      {/* top bar */}
      <div className="snCamTop">
        <button type="button" className="snCamAv" onClick={ctx.openProfile} aria-label="Friendship profile">
          <Bitmoji preset={ctx.meAvatar} side={ctx.me} photoUrl={ctx.meP.photoUrl} size={38} />
        </button>
        <button type="button" className="snGlass" onClick={() => ctx.go("chat")} aria-label="Search">
          <IcSearch size={20} color="#fff" />
        </button>
        <div className="snFlex" />
        <button type="button" className="snGlass" onClick={() => ctx.toast("you already have the only friend that matters 💛")} aria-label="Add friends">
          <IcAddFriend size={21} color="#fff" />
        </button>
      </div>

      <div className="snCamRail">
        <button type="button" className="snRailBtn" onClick={() => setPhotoIdx((i) => i + 1)} aria-label="Flip camera">
          <IcFlip size={22} color="#fff" />
        </button>
        <button type="button" className={`snRailBtn${flash ? " is-on" : ""}`} onClick={() => setFlash((f) => !f)} aria-label="Flash">
          <IcFlash size={22} color={flash ? C.yellow : "#fff"} fill={flash} />
        </button>
        <button type="button" className="snRailBtn" onClick={() => ctx.toast("timer set: forever ⏳💛")} aria-label="Timer">
          <IcTimer size={22} color="#fff" />
        </button>
        <button type="button" className="snRailBtn" onClick={() => ctx.toast("now playing: your voice note 🎧")} aria-label="Music">
          <IcMusic size={22} color="#fff" />
        </button>
        <button type="button" className="snRailBtn" onClick={() => ctx.go("map")} aria-label="More">
          <IcChevDown size={22} color="#fff" />
        </button>
      </div>

      <button type="button" className={`snPrompt${todayView.mineIn ? " is-done" : ""}`} onClick={todayView.mineIn ? ctx.openConvo : capture}>
        {prompt}
      </button>

      {/* lens carousel + capture */}
      <div className="snCamBottom">
        {L.name !== "Normal" && <p className="snLensName">{L.emoji} {L.name}</p>}
        <div className="snLensRow">
          <div className="snLensClip">
          <div className="snLensStrip" style={{ transform: `translateX(${-lens * 64}px)` }} role="listbox" aria-label="Lenses">
            {LENSES.map((l, i) => (
              <button
                key={l.id}
                type="button"
                role="option"
                aria-selected={i === lens}
                className={`snLens${i === lens ? " is-on" : ""}`}
                onClick={() => (i === lens ? capture() : setLens(i))}
                aria-label={l.name}
                tabIndex={i === lens ? -1 : 0}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.url} alt="" draggable={false} style={{ ...photoStyle(photo), filter: l.filter }} />
                ) : null}
                <span className="snLensEmoji">{l.emoji || "○"}</span>
              </button>
            ))}
          </div>
          </div>
          <button type="button" className="snCapture" onClick={capture} aria-label="Take a snap">
            <span className="snCaptureRing" />
            {L.emoji && <span className="snCaptureLens">{L.emoji}</span>}
          </button>
          <button type="button" className="snCamSide is-left" onClick={ctx.openMemories} aria-label="Memories">
            <IcMemories size={24} color="#fff" />
          </button>
          <button type="button" className="snCamSide is-right" onClick={() => setLens((l) => (l + 1) % LENSES.length)} aria-label="Explore lenses">
            <IcLens size={24} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
