// ─── Caller ID — small shared pieces ─────────────────────────────────────────
//
// The status bar, the framed photo, the glyphs the phone UI needs beyond the
// ones in icons.tsx, and two tiny hooks (a live clock and a layout switch).
// Everything here is drawn — no brand marks, no icon font.

"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { initialsOf, seededInk } from "./theme";
import type { LovePhoto } from "./types";

/* ── Layout ───────────────────────────────────────────────────────────────── */

export type Layout = "phone" | "tablet" | "desktop";

/**
 * Phone below 760px, a device + side panel up to 1180px, the full web app
 * above. Starts at "phone" on the server and the first client paint, then
 * corrects in an effect so hydration never disagrees.
 */
export function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>("phone");
  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      setLayout(w >= 1180 ? "desktop" : w >= 760 ? "tablet" : "phone");
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return layout;
}

/** "9:41" — the real clock, ticking once a minute. Blank until mounted. */
export function useClock(): string {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);
  return now || "9:41";
}

/** Seconds → "04:12". */
export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ── Photos ───────────────────────────────────────────────────────────────── */

/**
 * A framed photo filling its box, with exactly the crop the sender set in the
 * editor. The box decides the shape; the crop decides what is in it.
 */
export function Pic({ photo, alt = "", className, style }: { photo: Pick<LovePhoto, "url" | "cropX" | "cropY" | "scale">; alt?: string; className?: string; style?: CSSProperties }) {
  return (
    <span className={`cxPic${className ? ` ${className}` : ""}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={alt} draggable={false} loading="lazy" style={cropStyle(photoCrop(photo))} />
    </span>
  );
}

/** The caller's portrait as a round avatar (or initials when there is none). */
export function Face({
  name,
  photo,
  size,
  className,
  style,
}: {
  name: string;
  photo: { url: string; cropX?: number; cropY?: number; scale?: number } | null;
  size: number;
  className?: string;
  style?: CSSProperties;
}) {
  const box: CSSProperties = { width: size, height: size, ...style };
  if (!photo?.url) {
    return (
      <span className={`cxFace cxFace--init${className ? ` ${className}` : ""}`} style={{ ...box, background: seededInk(name), fontSize: size * 0.36 }} aria-hidden>
        {initialsOf(name)}
      </span>
    );
  }
  return <Pic photo={photo} alt={name} className={`cxFace${className ? ` ${className}` : ""}`} style={box} />;
}

/* ── Status bar ───────────────────────────────────────────────────────────── */

export function StatusBar({ tone = "light", pill }: { tone?: "light" | "dark"; pill?: ReactNode }) {
  const time = useClock();
  const c = tone === "light" ? "#fff" : "#0B0E12";
  return (
    <div className="cxStatus" style={{ color: c }} aria-hidden>
      <span className="cxStatusTime">{pill ?? time}</span>
      <span className="cxStatusIcons">
        <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill={c} /><rect x="5" y="5" width="3" height="6" rx="1" fill={c} /><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill={c} /><rect x="15" y="0" width="3" height="11" rx="1" fill={c} /></svg>
        <span className="cxStatus5g">5G</span>
        <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke={c} strokeOpacity=".45" /><rect x="2" y="2" width="16" height="8" rx="2" fill={c} /><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill={c} fillOpacity=".5" /></svg>
      </span>
    </div>
  );
}

/* ── Glyphs ───────────────────────────────────────────────────────────────── */

type G = { size?: number; color?: string };
const box = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const, focusable: "false" as const, style: { display: "block", flex: "none" } as CSSProperties });
const line = (color: string, w = 2) => ({ stroke: color, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" });

export const MicOff = ({ size = 26, color = "currentColor" }: G) => (
  <svg {...box(size)}><rect x="9" y="3" width="6" height="11" rx="3" {...line(color)} /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16" {...line(color)} /></svg>
);
export const Keypad = ({ size = 26, color = "currentColor" }: G) => (
  <svg {...box(size)}>{[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}${y}`} cx={x} cy={y - 1} r="1.7" fill={color} />))}<circle cx="12" cy="22" r="1.7" fill={color} /></svg>
);
export const Speaker = ({ size = 26, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...line(color)} /></svg>
);
export const PlusPerson = ({ size = 26, color = "currentColor" }: G) => (
  <svg {...box(size)}><circle cx="10" cy="8" r="3.6" {...line(color)} /><path d="M3.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M19 8v6M16 11h6" {...line(color)} /></svg>
);
export const Video = ({ size = 26, color = "currentColor" }: G) => (
  <svg {...box(size)}><rect x="2.5" y="6" width="13" height="12" rx="3" {...line(color)} /><path d="M15.5 10.5l5.5-3.5v10l-5.5-3.5z" {...line(color)} /></svg>
);
export const Pause = ({ size = 26, color = "currentColor" }: G) => (
  <svg {...box(size)}><rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill={color} /><rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill={color} /></svg>
);
export const Play = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M8 5.5v13c0 .8.9 1.3 1.6.9l10.2-6.5c.6-.4.6-1.4 0-1.8L9.6 4.6C8.9 4.2 8 4.7 8 5.5z" fill={color} /></svg>
);
export const Alarm = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><circle cx="12" cy="13" r="7.5" {...line(color)} /><path d="M12 9v4.2l2.6 1.6M4 5l3-2.5M20 5l-3-2.5" {...line(color)} /></svg>
);
export const Bubble = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M12 4c4.7 0 8.5 3.1 8.5 7s-3.8 7-8.5 7c-1 0-1.9-.1-2.8-.4L5 19.5l1.2-3.6C4.5 14.6 3.5 12.9 3.5 11 3.5 7.1 7.3 4 12 4z" {...line(color)} /></svg>
);
export const Ban = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><circle cx="12" cy="12" r="8.5" {...line(color)} /><path d="M6 6l12 12" {...line(color)} /></svg>
);
export const Flag = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M5 21V4M5 4.5c4-2 7 2 11 0v8.5c-4 2-7-2-11 0" {...line(color)} /></svg>
);
export const SavePerson = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><circle cx="12" cy="8" r="3.8" {...line(color)} /><path d="M4.5 20.5c.9-4 3.9-6 7.5-6s6.6 2 7.5 6" {...line(color)} /></svg>
);
export const Eye = ({ size = 20, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...line(color)} /><circle cx="12" cy="12" r="3" {...line(color)} /></svg>
);
export const Crown = ({ size = 16, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-1.8 10H4.8z" fill={color} /></svg>
);
export const Heart = ({ size = 18, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M12 20.5s-7.6-4.6-9.5-9.3C1.1 7.8 3.3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.6 2.6h1.4c1-1.5 2.5-2.6 4.6-2.6 3.4 0 5.6 3.3 4.2 6.7-1.9 4.7-9.5 9.3-9.5 9.3z" fill={color} /></svg>
);
export const Dots = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><circle cx="12" cy="5.5" r="1.8" fill={color} /><circle cx="12" cy="12" r="1.8" fill={color} /><circle cx="12" cy="18.5" r="1.8" fill={color} /></svg>
);
export const Search = ({ size = 20, color = "currentColor" }: G) => (
  <svg {...box(size)}><circle cx="11" cy="11" r="6.5" {...line(color)} /><path d="M20 20l-4.2-4.2" {...line(color)} /></svg>
);
export const Back = ({ size = 22, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M15 5l-7 7 7 7" {...line(color, 2.3)} /></svg>
);
export const Pin = ({ size = 16, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" {...line(color)} /><circle cx="12" cy="10" r="2.3" fill={color} /></svg>
);
export const SimCard = ({ size = 16, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M7 3h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" {...line(color)} /><rect x="8.5" y="11" width="7" height="6" rx="1" {...line(color, 1.6)} /></svg>
);
export const Lock = ({ size = 12, color = "currentColor" }: G) => (
  <svg {...box(size)}><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill={color} /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...line(color, 2.4)} /></svg>
);
export const Bell = ({ size = 18, color = "currentColor", off }: G & { off?: boolean }) => (
  <svg {...box(size)}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0" {...line(color)} />{off && <path d="M4 4l16 16" {...line(color)} />}</svg>
);
export const Mic = ({ size = 18, color = "currentColor" }: G) => (
  <svg {...box(size)}><rect x="9" y="3" width="6" height="11" rx="3" fill={color} /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" {...line(color)} /></svg>
);
export const Sparkle = ({ size = 14, color = "currentColor" }: G) => (
  <svg {...box(size)}><path d="M12 2.5l1.9 6.1 6.1 1.9-6.1 1.9L12 18.5l-1.9-6.1L4 10.5l6.1-1.9z" fill={color} /></svg>
);
