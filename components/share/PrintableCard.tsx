"use client";

// ─── PrintableCard — the thing you print and hand over ───────────────────────
//
// A 620×877 poster at exact A4 proportions, exported at pixelRatio 4, which
// lands at 2480×3508 — a true 300dpi A4, the size a home printer actually
// takes. It exists because a gift link that only travels through WhatsApp
// cannot be put inside a card, taped to a box, or left on a pillow, and that is
// the moment most of these templates are actually for.
//
// The design size is 620×877 rather than a rounder number because A4 is
// 1:√2 and the export has to be a whole-number multiple: 620×4 = 2480 and
// 877×4 = 3508, exactly. Pick a friendlier width and the export either
// letterboxes or stretches, and a stretched QR is a QR that does not scan.
//
// ── FONTS: ONLY "swap" FACES ARE SAFE HERE ───────────────────────────────────
//
// The root layout registers most faces with `display: "optional"`, which the
// browser is allowed to DECLINE outright to protect CLS. `document.fonts.ready`
// resolves either way, so a card set in Playfair would silently export in
// Times on any visit where the face was declined — and the sender would never
// know, because the screen they were looking at was fine.
//
// So this file uses only the faces registered with `display: "swap"`, which are
// guaranteed to arrive: Cinzel for display and Fredoka for body. Do not
// "upgrade" either of these to Playfair or Outfit.
//
// ── THE LINE UNDER THE CODE IS WRITTEN, NOT PRINTED ──────────────────────────
//
// The share address used to sit there, in a monospace face, as a fallback for a
// creased or photocopied code. It was the wrong trade. Nobody has ever typed a
// 36-character UUID off a piece of paper, and a raw URL is machine text on an
// object someone hands to a person they love. The space now carries a written
// line chosen per template — see `lib/share/cardCopy.ts`.
//
// ── THE QR ARRIVES AS A BITMAP ───────────────────────────────────────────────
//
// `qrDataUrl` is drawn on a canvas at an exact integer module scale by
// `qrPng.ts` before it gets here, so `html-to-image` composites an already-
// correct bitmap instead of resampling vector modules onto fractional pixel
// boundaries. See the note at the top of `qrPng.ts`.

import { forwardRef } from "react";
import { alpha, shade, tint, readableInk, isMuted, DEFAULT_ACCENT } from "./qrTheme";

export const CARD_W = 620;
export const CARD_H = 877;

const DISPLAY = "'Cinzel', Georgia, serif";
const BODY = "'Fredoka', 'Trebuchet MS', sans-serif";

function Heart({
  size,
  left,
  top,
  rotate,
  color,
  opacity,
}: {
  size: number;
  left: number;
  top: number;
  rotate: number;
  color: string;
  opacity: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        position: "absolute",
        left,
        top,
        opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <path
        d="M12 21s-7.5-4.7-9.4-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.4 12c-1.9 4.3-9.4 9-9.4 9Z"
        fill={color}
      />
    </svg>
  );
}

export interface PrintableCardProps {
  /** The QR as a PNG data URL, already rasterised. Null renders the frame only. */
  qrDataUrl: string | null;
  /** Small line above the headline. */
  kicker: string;
  title: string;
  note: string;
  /** The written line under the code, where the address used to be. */
  line: string;
  recipientName?: string;
  senderName?: string;
  accent: string;
  /** Same-origin logo. Cross-origin would taint the capture canvas. */
  logoSrc: string;
}

/**
 * The poster itself, and nothing about where it lives.
 *
 * It is deliberately unpositioned so the sheet can mount it twice from one set
 * of props: once offscreen at true size for the capture, and once inside a
 * scaled wrapper for the on-screen preview. Baking `position: fixed` in here —
 * as the per-template share cards do — would make the preview impossible
 * without a second near-identical component to drift out of sync with this one.
 */
export const PrintableCard = forwardRef<HTMLDivElement, PrintableCardProps>(
  function PrintableCard(
    { qrDataUrl, kicker, title, note, line, recipientName, senderName, accent, logoSrc },
    ref,
  ) {
    const deep = shade(accent, 0.45);
    const ink = readableInk(accent);

    // The DECORATION only — the gradient ground, the blooms, the hearts, the
    // dashed cut line. An achromatic accent stays itself everywhere it carries
    // meaning (the headline, the "point your camera" pill, the QR ink); it is
    // just not allowed to turn the whole poster grey. A card that comes out of
    // a printer the colour of a receipt is not something anyone tapes to a
    // present, which is the only reason this surface exists.
    const decor = isMuted(accent) ? DEFAULT_ACCENT : accent;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
          boxSizing: "border-box",
          overflow: "hidden",
          padding: 24,
          background: `linear-gradient(158deg, ${tint(decor, 0.82)} 0%, #FFF8F3 46%, ${tint(
            decor,
            0.72,
          )} 100%)`,
        }}
      >
        {/* Soft colour blooms. Kept behind everything and never over the QR
            panel, which has to stay flat white for the scanner. */}
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -110,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: alpha(decor, 0.26),
            filter: "blur(48px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -140,
            bottom: -130,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: alpha(decor, 0.22),
            filter: "blur(56px)",
          }}
        />

        <Heart size={26} left={46} top={132} rotate={-18} color={alpha(decor, 0.3)} opacity={1} />
        <Heart size={16} left={92} top={186} rotate={12} color={alpha(decor, 0.24)} opacity={1} />
        <Heart size={20} left={556} top={214} rotate={20} color={alpha(decor, 0.28)} opacity={1} />
        <Heart size={13} left={520} top={168} rotate={-8} color={alpha(decor, 0.22)} opacity={1} />
        <Heart size={22} left={62} top={706} rotate={14} color={alpha(decor, 0.24)} opacity={1} />
        <Heart size={15} left={548} top={742} rotate={-16} color={alpha(decor, 0.22)} opacity={1} />

        {/* The dashed frame doubles as a cut line for anyone trimming it out. */}
        <div
          style={{
            position: "relative",
            height: "100%",
            boxSizing: "border-box",
            borderRadius: 30,
            border: `2px dashed ${alpha(decor, 0.38)}`,
            background: "rgba(255,255,255,0.58)",
            padding: 26,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Header. The logo sits top-right on every share surface. ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: alpha(deep, 0.72),
              }}
            >
              {kicker}
            </span>
            <span style={{ flex: 1 }} />
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px 5px 6px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                border: `1px solid ${alpha(decor, 0.28)}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt=""
                width={28}
                height={28}
                style={{ borderRadius: 7, display: "block", objectFit: "cover" }}
              />
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  color: deep,
                }}
              >
                SubhSandesh
              </span>
            </span>
          </div>

          {/* ── Headline ── */}
          <h2
            style={{
              margin: "22px 0 0",
              fontFamily: DISPLAY,
              fontSize: 32,
              lineHeight: "40px",
              fontWeight: 700,
              letterSpacing: "-0.005em",
              color: deep,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </h2>

          {recipientName ? (
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: BODY,
                fontSize: 16,
                lineHeight: "22px",
                color: alpha(deep, 0.82),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              For {recipientName}
            </p>
          ) : null}

          {/* ── The QR panel. Flat white, no gradient, no texture. ── */}
          <div
            style={{
              marginTop: 20,
              alignSelf: "center",
              background: "#FFFFFF",
              borderRadius: 24,
              padding: 20,
              boxShadow: `0 14px 34px ${alpha(deep, 0.16)}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {qrDataUrl ? (
              // Smooth resampling, deliberately — NOT `image-rendering:
              // pixelated`. The source bitmap is 1024px and this box is 330 CSS
              // px, which the pixelRatio-3 export lands at 990 device pixels: a
              // 1.03× downscale that is visually lossless. Nearest-neighbour at
              // that ratio is the harmful option — it drops a module here and
              // doubles one there, and thin single-module runs can disappear
              // outright.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt=""
                width={330}
                height={330}
                style={{ display: "block", width: 330, height: 330 }}
              />
            ) : (
              <div
                style={{
                  width: 330,
                  height: 330,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: BODY,
                  fontSize: 13,
                  color: "#9A93A3",
                  textAlign: "center",
                  padding: 20,
                  boxSizing: "border-box",
                }}
              >
                Use the printed address below
              </div>
            )}

            {/* The way in when the code will not scan. See the header note. */}
            {/* Where the share address used to be printed.
                A raw URL is machine text on an object a person hands to
                someone they love, and nobody has ever typed a 36-character
                UUID off a piece of paper. The written line earns the space;
                the address does not. */}
            <p
              style={{
                margin: "12px 0 0",
                maxWidth: 330,
                fontFamily: DISPLAY,
                fontSize: 15,
                lineHeight: "20px",
                letterSpacing: "0.06em",
                color: alpha(deep, 0.82),
                textAlign: "center",
              }}
            >
              {line}
            </p>
          </div>

          {/* ── Instruction ── */}
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: 999,
                background: accent,
                color: ink,
                fontFamily: BODY,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.03em",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3"
                  stroke={ink}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Point your camera here
            </span>

            <p
              style={{
                margin: "12px auto 0",
                maxWidth: 440,
                fontFamily: BODY,
                fontSize: 14,
                lineHeight: "21px",
                color: "#4C4556",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {note}
            </p>
          </div>

          {/* The card is a fixed A5 and the content above it is not, so there
              is always slack here — how much depends on whether the headline
              wrapped to two lines and whether the note ran long. Splitting the
              slack around an ornament keeps a short card from reading as a
              layout that ran out of things to say, and lets a long one close up
              to nothing without any of it overlapping. */}
          <div style={{ flex: 1, minHeight: 10 }} />

          <div
            aria-hidden="true"
            style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.85 }}
          >
            <span style={{ flex: 1, height: 1, background: alpha(decor, 0.28) }} />
            <svg width="13" height="13" viewBox="0 0 24 24">
              <path
                d="M12 21s-7.5-4.7-9.4-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.4 12c-1.9 4.3-9.4 9-9.4 9Z"
                fill={alpha(decor, 0.55)}
              />
            </svg>
            <span style={{ flex: 1, height: 1, background: alpha(decor, 0.28) }} />
          </div>

          <div style={{ flex: 1, minHeight: 10 }} />

          {senderName ? (
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontFamily: DISPLAY,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: deep,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              From {senderName}
            </p>
          ) : null}

          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px dashed ${alpha(decor, 0.38)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              fontFamily: BODY,
              fontSize: 12,
              letterSpacing: "0.05em",
              color: alpha(deep, 0.7),
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 21s-7.5-4.7-9.4-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.4 12c-1.9 4.3-9.4 9-9.4 9Z"
                fill={decor}
              />
            </svg>
            made with subhsandesh.in
          </div>
        </div>
      </div>
    );
  },
);

export default PrintableCard;
