"use client";

// ─── Flags — small shared pieces ─────────────────────────────────────────────
//
//   FlagSticker   the rotated, filled sticker every verdict is printed on
//   Photo         a love-kit photo, framed exactly as the sender cropped it
//   Initials      the no-photo fallback (old pages, or a sender with no pics)
//   isTyping      true when a key event belongs to a form field, so the deck's
//                 keyboard shortcuts never eat a space typed in the edit sheet

import type { CSSProperties, ReactNode } from "react";

import { cropStyle, photoCrop } from "../../dedication/components/types";
import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { GROTESK, ITALIC } from "./flagsTheme";

export function FlagSticker({
  children,
  color,
  rotate = -6,
  size = 15,
  style,
  className,
}: {
  children: ReactNode;
  color: string;
  rotate?: number;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: `${Math.round(size * 0.42)}px ${Math.round(size * 0.9)}px`,
        borderRadius: 999,
        background: color,
        color: "var(--fl-on)",
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        transform: `rotate(${rotate}deg)`,
        boxShadow: `0 0 0 3px ${V.paper}, 0 10px 24px -8px color-mix(in srgb, ${color} 70%, transparent)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Photo({ photo, alt = "", eager }: { photo: LovePhoto; alt?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo.url} alt={alt} draggable={false} loading={eager ? "eager" : "lazy"} style={{ ...cropStyle(photoCrop(photo)), display: "block" }} />
  );
}

export function Initials({ name, size = "min(38vw, 180px)" }: { name: string; size?: string }) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: `radial-gradient(90% 70% at 30% 20%, color-mix(in srgb, ${V.a2} 70%, transparent), transparent 70%), ${V.grad}`,
      }}
    >
      <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: size, lineHeight: 1, color: "rgba(255,255,255,.94)", textShadow: "0 12px 40px rgba(0,0,0,.25)" }}>
        {initial}
      </span>
    </div>
  );
}

export function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable || !!t.closest?.("[role=dialog],[data-flags-sheet]");
}
