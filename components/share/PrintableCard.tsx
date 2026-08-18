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
// ── WHY EVERY BLOCK IS flexShrink: 0 ─────────────────────────────────────────
//
// The card is a fixed 620×877 column, so its children have a finite budget. In a
// column flex container every item defaults to `flex-shrink: 1`, which means an
// overflow is not reported as an overflow — the browser quietly compresses each
// block's HEIGHT to make the sum fit, and `overflow: hidden` on the frame crops
// whatever no longer has room.
//
// That failure is invisible in the worst possible way. Adding the password block
// pushed the stack ~76px over budget, and instead of spilling, the headline was
// sliced through the middle of its letterforms, "For <name>" vanished outright,
// and the sender's name became a two-pixel sliver. All of it still looked like a
// deliberate design until you read it.
//
// So every real block is `flexShrink: 0` and only the two spacers flex. The
// layout can now only fail by overflowing, which is loud and obvious, and
// `QR_PX` below is the knob that keeps it inside the budget.
//
// ── THE PASSWORD, WHEN IT IS PRINTED ─────────────────────────────────────────
//
// A card carrying a code to a locked page, with no way in, is worse than no card
// at all — the recipient scans it, hits a password box, and the gift is a dead
// end. So when the page has one, the sender is offered the option of printing it
// and it defaults to on.
//
// It is set in a system monospace, which is the one exception to the font rule
// above: `ui-monospace` and `Courier New` are already on the machine, so there
// is no webfont to decline. Every other line on this card is prose, where a
// substituted face is a cosmetic difference; a password is the one string where
// l/1 and 0/O have to be told apart or the card does not work.
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
/** System faces only — nothing to download, so nothing that can be declined. */
const MONO = "ui-monospace, SFMono-Regular, Menlo, 'Courier New', monospace";

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
  /** The unlock word, printed under the code. Omitted entirely when absent. */
  password?: string;
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
    { qrDataUrl, kicker, title, note, line, password, recipientName, senderName, accent, logoSrc },
    ref,
  ) {
    const pass = (password || "").trim();

    // ── Keeping the stack inside 773px of usable height ──────────────────────
    //
    // Four things vary with content and every one of them costs vertical space:
    // the headline can wrap to two lines, the recipient and sender lines may or
    // may not exist, the note runs to three, and a long password wraps. Sized
    // for the friendly case they overflow together on the awkward one, which is
    // exactly the card someone with a long name and a strong password gets.
    //
    // So the three that can be absorbed are, and the measurements live in the
    // harness these numbers were tuned against — do not nudge them by eye.

    // The QR gives up the most, and misses it least: 262 CSS px exports at 4× to
    // 1048 device px, which is 8.9cm of printed code. Enormous for something
    // scanned from arm's length.
    const QR_PX = pass ? 262 : 330;

    // A long headline takes the smaller face rather than a second line at full
    // size. Reads as a deliberate choice; a clipped 32px headline does not.
    const titleLong = title.length > 26;
    const titleSize = titleLong ? 26 : 32;
    const titleLine = titleLong ? 33 : 40;

    // Same bargain for the password: it must stay on ONE line, because the
    // second one is 26px this layout has not got. Shrinking the glyphs is the
    // cheaper loss — it stays legible well below the point where it stops fitting.
    const passSize = pass.length > 16 ? 15 : pass.length > 11 ? 17 : 20;
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
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
              margin: "20px 0 0",
              flexShrink: 0,
              fontFamily: DISPLAY,
              fontSize: titleSize,
              lineHeight: `${titleLine}px`,
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
                flexShrink: 0,
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
              marginTop: 18,
              flexShrink: 0,
              alignSelf: "center",
              background: "#FFFFFF",
              borderRadius: 24,
              padding: 18,
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
                width={QR_PX}
                height={QR_PX}
                style={{ display: "block", width: QR_PX, height: QR_PX }}
              />
            ) : (
              <div
                style={{
                  width: QR_PX,
                  height: QR_PX,
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
                maxWidth: QR_PX,
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

            {/* The way in. Sits inside the QR panel rather than below it,
                because the code and the word that opens it are one instruction
                — split across the fold of a layout they read as two. */}
            {pass ? (
              <div
                style={{
                  marginTop: 12,
                  width: QR_PX,
                  boxSizing: "border-box",
                  padding: "9px 14px",
                  borderRadius: 14,
                  border: `1.5px dashed ${alpha(decor, 0.5)}`,
                  background: alpha(decor, 0.07),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span
                  style={{
                    fontFamily: BODY,
                    fontSize: 9.5,
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: alpha(deep, 0.65),
                  }}
                >
                  Password
                </span>
                <span
                  style={{
                    maxWidth: "100%",
                    fontFamily: MONO,
                    fontSize: passSize,
                    lineHeight: "26px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: deep,
                    // One line, always. A password that will not fit even at the
                    // smallest size is truncated rather than allowed to wrap and
                    // silently push the sender's name off the bottom of the card.
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                  }}
                >
                  {pass}
                </span>
              </div>
            ) : null}
          </div>

          {/* ── Instruction ── */}
          <div style={{ marginTop: 16, flexShrink: 0, textAlign: "center" }}>
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
          <div style={{ flex: 1, minHeight: 6 }} />

          <div
            aria-hidden="true"
            style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.85, flexShrink: 0 }}
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

          <div style={{ flex: 1, minHeight: 6 }} />

          {senderName ? (
            <p
              style={{
                margin: 0,
                flexShrink: 0,
                textAlign: "center",
                fontFamily: DISPLAY,
                fontSize: 15,
                lineHeight: "22px",
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
              marginTop: 12,
              paddingTop: 11,
              flexShrink: 0,
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
