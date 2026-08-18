// ─── HeaderBlock — icon, name, and the install pill ──────────────────────────
//
// The first 200px of the page. Three things have to be right or nothing below
// them is believed:
//
//   1. THE ICON NEVER BREAKS. A listing whose icon is a browser's broken-image
//      glyph is a listing that failed to load, and the reader stops reading.
//      `onError` swaps in a rounded square with the first letter in the accent.
//      An empty/whitespace `iconUrl` takes the same path without a round trip.
//
//   2. THE NAME TRUNCATES AFTER TWO LINES. Real names run long. Two lines then
//      an ellipsis, with `overflowWrap: anywhere` so a single 40-character word
//      breaks instead of pushing the install pill off the right edge.
//
//   3. THE INSTALL CANNOT STACK. Every tap on GET is a call to `onInstall`, and
//      a thumb produces three of those in half a second. The guard is on the
//      state, not on a ref: `installState !== "idle"` means the tap does
//      nothing at all, so the 2s ring is started exactly once by exactly the
//      transition that put us into `installing`.
//
// ── THE PILL IS 28px AND THE TARGET IS 44px ──────────────────────────────────
//
// The visual pill is 28px tall because that is what the design asks for, and
// 28px is not a tap target. So the <button> is 44px tall and transparent, and
// the 28px pill is a span inside it. The finger gets 44, the eye gets 28.
//
// ── STATE LIVES IN THE PARENT ────────────────────────────────────────────────
//
// This component renders `installState` and calls back; it owns no timer. The
// parent starts the 2s clock when it moves to `installing` and flips to
// `installed` when the clock ends, which keeps the ring and the state machine
// from drifting apart under a re-render.

"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AP, AP_GUTTER, AP_TAP } from "./theme";
import type { AppMeta, InstallState } from "./types";

const ICON_SIZE = 96;
const PILL_HEIGHT = 28;
const RING_SIZE = 28;
const RING_STROKE = 2.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** First visible character, uppercased. "" for a nameless app — never "undefined". */
function initial(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "";
}

/**
 * The icon, or the letter square that replaces it.
 *
 * `broken` is reset whenever the URL changes so that an edit from a bad URL to
 * a good one recovers — without that, one typo in the editor permanently pins
 * the fallback for the rest of the session.
 */
function AppIcon({ name, iconUrl }: { name: string; iconUrl: string }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [iconUrl]);

  const frame: React.CSSProperties = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    flex: "none",
    borderRadius: 24,
    overflow: "hidden",
    background: AP.card,
    // Inset hairline rather than a border, so it sits inside the 110px box and
    // the icon art is not nudged by a pixel of outline.
    boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.10)`,
  };

  if (!iconUrl.trim() || broken) {
    return (
      <div
        style={{
          ...frame,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: AP.accent,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        {initial(name)}
      </div>
    );
  }

  return (
    <div style={frame}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconUrl}
        alt=""
        width={ICON_SIZE}
        height={ICON_SIZE}
        draggable={false}
        decoding="async"
        onError={() => setBroken(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

/** The 2s ring. Under reduced motion it is drawn complete on the first frame. */
function InstallRing({ instant }: { instant: boolean }) {
  return (
    <span
      role="progressbar"
      aria-label="Installing"
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden="true"
        focusable="false"
        // −90° so the fill starts at twelve o'clock rather than three.
        style={{ transform: "rotate(-90deg)", display: "block" }}
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={AP.edge}
          strokeWidth={RING_STROKE}
        />
        <motion.circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={AP.accent}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          initial={{ strokeDashoffset: instant ? 0 : RING_CIRCUMFERENCE }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: instant ? 0 : 2, ease: "linear" }}
        />
      </svg>
      {/* The generic "cancel" square every progress control puts in the middle. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 7,
          height: 7,
          borderRadius: 1.5,
          background: AP.accent,
        }}
      />
    </span>
  );
}

export function HeaderBlock({
  app,
  installState,
  onInstall,
  onOpen,
}: {
  app: AppMeta;
  installState: InstallState;
  onInstall: () => void;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const installing = installState === "installing";
  const installed = installState === "installed";

  // The whole rapid-tap guard, in one expression. `installing` swallows taps so
  // a second ring can never be started; `installed` routes to `onOpen`.
  function handlePress() {
    if (installing) return;
    if (installed) onOpen();
    else onInstall();
  }

  const label = installed ? "OPEN" : "GET";

  return (
    <section
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        // The top gap matters: the sticky bar above is translucent, so content
        // flush against it reads as one stuck-together block rather than as a
        // bar with a page under it.
        padding: `14px ${AP_GUTTER}px 0`,
        fontFamily: AP.font,
      }}
    >
      <AppIcon name={app.name} iconUrl={app.iconUrl} />

      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 19,
            lineHeight: "23px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: AP.ink,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            // A 40-character single word must break rather than shove the pill
            // past the right edge of a 380px screen.
            overflowWrap: "anywhere",
          }}
        >
          {app.name}
        </h1>

        <p
          style={{
            margin: "2px 0 0",
            fontSize: 13,
            lineHeight: "17px",
            color: AP.inkSoft,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {app.subtitle}
        </p>

        <p
          style={{
            margin: "2px 0 0",
            fontSize: 13,
            lineHeight: "17px",
            color: AP.inkSoft,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {app.developer}
        </p>

        <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start" }}>
          <span
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 84,
            }}
          >
            <button
              type="button"
              onClick={handlePress}
              aria-live="polite"
              aria-label={
                installing ? "Installing" : installed ? `Open ${app.name}` : `Get ${app.name}`
              }
              style={{
                // 44px of finger around a 28px pill. See the header note.
                height: AP_TAP,
                minWidth: AP_TAP,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                margin: 0,
                border: "none",
                background: "transparent",
                cursor: installing ? "default" : "pointer",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {installing ? (
                <InstallRing instant={!!reduced} />
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: PILL_HEIGHT,
                    minWidth: 74,
                    padding: "0 20px",
                    borderRadius: 14,
                    background: AP.accent,
                    color: AP.accentInk,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              )}
            </button>

            <span
              style={{
                marginTop: -4,
                fontSize: 10,
                lineHeight: "13px",
                color: AP.inkSoft,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              In-App Purchases
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default HeaderBlock;
