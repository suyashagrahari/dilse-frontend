"use client";

// Small shared pieces of the watch page: avatars, the like-burst particles,
// timestamp linkifying and count formatting.

import { Fragment, type ReactNode } from "react";
import Pic from "./Pic";
import { InitialsAvatar } from "./theme";
import type { LovePhoto } from "./types";

/** A round avatar: a framed photo when there is one, else initials. */
export function Avatar({
  photo,
  url,
  name,
  size = 40,
}: {
  photo?: LovePhoto | null;
  url?: string;
  name: string;
  size?: number;
}) {
  const p: LovePhoto | null = url ? { url } : photo ?? null;
  if (!p) return <InitialsAvatar name={name} size={size} />;
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flex: "none", display: "block", position: "relative", background: "#333" }}
    >
      <Pic photo={p} />
    </span>
  );
}

/** Hearts and sparks flying out of whatever was just pressed. Remount (key) to replay. */
export function Burst({ count = 10, color = "#FF3E86" }: { count?: number; color?: string }) {
  return (
    <span className="wt-burst" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
        const r = 26 + (i % 3) * 9;
        const heart = i % 3 !== 1;
        return (
          <i
            key={i}
            style={
              {
                "--dx": `${Math.cos(a) * r}px`,
                "--dy": `${Math.sin(a) * r}px`,
                "--rot": `${(i * 47) % 90 - 45}deg`,
                color: i % 4 === 0 ? "#FFD166" : color,
                animationDelay: `${(i % 3) * 18}ms`,
              } as React.CSSProperties
            }
          >
            {heart ? "♥" : "✦"}
          </i>
        );
      })}
    </span>
  );
}

export const BURST_CSS = `
.wt-burst { position: absolute; left: 50%; top: 50%; width: 0; height: 0; pointer-events: none; z-index: 3; }
.wt-burst i {
  position: absolute; left: 0; top: 0; font-style: normal; font-size: 12px; line-height: 1;
  transform: translate(-50%, -50%) scale(.2); opacity: 0;
  animation: wt-burst .7s cubic-bezier(.15,.8,.3,1) forwards;
}
@keyframes wt-burst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(.2); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1.1); }
}
@media (prefers-reduced-motion: reduce) { .wt-burst { display: none; } }
`;

const TS_RE = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;

const toSeconds = (ts: string): number =>
  ts.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);

/** Text with every "m:ss" turned into a seek link, the way a watch page does it. */
export function Linkified({
  text,
  onSeek,
  max,
}: {
  text: string;
  onSeek?: (seconds: number) => void;
  /** Timestamps beyond this are left as plain text. */
  max?: number;
}): ReactNode {
  if (!onSeek) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TS_RE)) {
    const idx = m.index ?? 0;
    const secs = toSeconds(m[1]);
    if (max !== undefined && secs > max) continue;
    if (idx > last) out.push(<Fragment key={`t${last}`}>{text.slice(last, idx)}</Fragment>);
    out.push(
      <button key={`s${idx}`} type="button" className="wt-ts" onClick={() => onSeek(secs)}>
        {m[1]}
      </button>,
    );
    last = idx + m[1].length;
  }
  if (last < text.length) out.push(<Fragment key={`t${last}`}>{text.slice(last)}</Fragment>);
  return out;
}

/** 1284 → "1.2K", 902 → "902". */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** "2,481 views" → "2.4K views" for the compact mobile meta line. */
export function compactViews(views: string): string {
  const m = /^([\d,]+)(.*)$/.exec(views.trim());
  if (!m) return views;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? `${compact(n)}${m[2]}` : views;
}

/** A light haptic tick where the platform supports it. */
export const tick = (ms = 8) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
};
