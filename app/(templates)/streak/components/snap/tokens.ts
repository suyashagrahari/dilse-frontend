// Design tokens for the parody camera-chat app. The real app's grammar —
// electric yellow, black camera chrome, white chat surfaces, red "me" / blue
// "them" name labels, square status glyphs — with none of its marks.

import type { CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../../dedication/components/types";
import type { LovePhoto } from "../../../_love/types";

export const C = {
  yellow: "#FFFC00",
  yellowInk: "#1A1A00",
  ink: "#16191C",
  ink2: "#5E6167",
  mute: "#8A8D91",
  line: "#ECEDEE",
  soft: "#F4F4F5",
  saved: "#EFEFF1",
  me: "#F23C57",
  them: "#0EADFF",
  chat: "#0EADFF",
  purple: "#A05DCD",
  map: "#20C064",
  spot: "#F23C57",
  snapRed: "#F23C57",
  fire: "#FF7A1A",
  black: "#000000",
  navDark: "#0B0B0C",
} as const;

export const FONT = `"Avenir Next", "Avenir", "Nunito Sans", var(--font-outfit), -apple-system, system-ui, sans-serif`;

/** Photo framed exactly as the sender cropped it. */
export const photoStyle = (p: LovePhoto | undefined): CSSProperties =>
  p ? cropStyle(photoCrop(p)) : {};

/** "2m", "3h", "Mon" — the real app's terse times. */
export function ago(iso: string | undefined, now: number): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return d < 7 ? `${d}d` : `${Math.round(d / 7)}w`;
}
