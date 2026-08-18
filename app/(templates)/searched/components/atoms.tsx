"use client";

import React, { memo, useCallback, useState } from "react";
import { colorForIndex, initialCircle, PALETTE, UI } from "./types";
import { parseSnippet } from "./demoData";

// ─── The small parts, all greyscale except the two colours the contract allows.
//
// Nothing in this file may grow a gradient or a shadow. The page has to look
// like a utility; every ornament costs a laugh.

/* ── Wordmark ──────────────────────────────────────────────────────────────
   The recipient's name as a multi-colour logotype. Five colours from the
   contract, cycled per visible character — clearly not a four-colour sequence,
   and it is their name, not anybody's trademark. */

export const Wordmark = memo(function Wordmark({
  name,
  size,
  weight = 500,
  nowrap = false,
}: {
  name: string;
  /** px, or any CSS length — the landing passes a `clamp()`. */
  size: number | string;
  weight?: number;
  /** Header use: one line, ellipsised. A 25-character name must not eat the box. */
  nowrap?: boolean;
}) {
  const chars = Array.from(name || "");
  let visible = -1;
  return (
    <span
      // Long names have to survive here: wrap rather than overflow, and let the
      // caller clamp the size.
      style={{
        fontFamily: UI,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.05,
        display: "inline-block",
        maxWidth: "100%",
        ...(nowrap
          ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
          : { overflowWrap: "anywhere" }),
      }}
    >
      {chars.map((ch, i) => {
        if (ch.trim().length === 0) {
          return (
            <span key={i} style={{ display: "inline-block", width: "0.28em" }}>
              {" "}
            </span>
          );
        }
        visible += 1;
        return (
          <span key={i} style={{ color: colorForIndex(visible) }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
});

/* ── Generated avatars. Never a fetched favicon. ─────────────────────────── */

export function InitialCircle({
  name,
  size,
  fontScale = 0.46,
}: {
  name: string;
  size: number;
  fontScale?: number;
}) {
  const { initial, bg } = initialCircle(name || "?");
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "inline-grid",
        placeItems: "center",
        fontFamily: UI,
        fontSize: Math.round(size * fontScale),
        fontWeight: 600,
        lineHeight: 1,
        flex: "0 0 auto",
      }}
    >
      {initial}
    </span>
  );
}

/**
 * A photo that is never allowed to be broken. On any load failure it becomes
 * the generated initial circle, which is also what a blank `photoUrl` gets.
 */
export function SafePhoto({
  src,
  name,
  size,
  radius,
  className,
}: {
  src: string;
  name: string;
  size: number;
  radius: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const { initial, bg } = initialCircle(name || "?");

  if (!src || failed) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          width: "100%",
          height: size,
          borderRadius: radius,
          background: bg,
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontFamily: UI,
          fontSize: Math.round(size * 0.4),
          fontWeight: 600,
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    // Plain <img>: the src is already routed through the same-origin optimiser
    // by `sameOrigin` below, which is what keeps the PNG export from tainting
    // its canvas. next/image would fight the fixed-pixel share card.
    <img
      src={src}
      alt={name}
      className={className}
      onError={onError}
      style={{ width: "100%", height: size, objectFit: "cover", borderRadius: radius, display: "block" }}
    />
  );
}

/**
 * The optimiser rejects any `w` that is not one of the configured device or
 * image sizes with a 400, which shows up as a silently broken photograph. This
 * is that list; requests snap UP to the next entry.
 */
const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

/**
 * Route a remote image through the app's own optimiser so it is same-origin.
 * A cross-origin `<img>` taints the export canvas and the whole PNG throws.
 * Anything already local, or a data URL, is returned untouched.
 */
export function sameOrigin(url: string, width = 640): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("/")) return url;
  const w = ALLOWED_WIDTHS.find((x) => x >= width) ?? 3840;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;
}

/* ── Snippets ──────────────────────────────────────────────────────────────
   `<b>` on the matched terms is the real convention. The markup is parsed into
   tokens here — never handed to `dangerouslySetInnerHTML`. */

export function Snippet({
  text,
  lines = 2,
  color = PALETTE.grey,
  size = 14,
}: {
  text: string;
  /** 0 = no clamp. */
  lines?: number;
  color?: string;
  size?: number;
}) {
  const tokens = parseSnippet(text);
  const clamp: React.CSSProperties =
    lines > 0
      ? {
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }
      : {};
  return (
    <p style={{ fontFamily: UI, fontSize: size, lineHeight: 1.58, color, margin: 0, ...clamp }}>
      {tokens.map((t, i) =>
        t.bold ? (
          <b key={i} style={{ fontWeight: 700, color: PALETTE.ink }}>
            {t.text}
          </b>
        ) : (
          <React.Fragment key={i}>{t.text}</React.Fragment>
        ),
      )}
    </p>
  );
}

/* ── Toast ─────────────────────────────────────────────────────────────────
   One line, grey, bottom-centre. It is a system message, not a celebration. */

export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="sr-search-toast"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 500,
        background: "#202124",
        color: "#fff",
        fontFamily: UI,
        fontSize: 13.5,
        lineHeight: 1.4,
        padding: "11px 16px",
        borderRadius: 4,
        maxWidth: "min(420px, calc(100vw - 32px))",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {message}
    </div>
  );
}
