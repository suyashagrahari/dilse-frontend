"use client";

// ─── Act 3 — the ask ─────────────────────────────────────────────────────────
// The viral mechanic. Everything interactive lives inside one measured "arena"
// div, and the "No" button is positioned absolutely *within that arena only*.
//
// Why an arena instead of the viewport: the No button's coordinates are then
// bounded by a box we measured ourselves (`clientWidth`/`clientHeight`), so it is
// impossible for it to land off-screen, under the fixed brand badge (top-right),
// under the fixed mute toggle (top-left) or beneath the YES button. The arena is
// also re-measured on resize and orientation change, and any existing position
// is re-clamped into the new bounds — which is the case that normally strands
// these buttons off-screen after a device rotation.

import { useCallback, useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { HERO_ART, REACTIONS } from "./assets";
import { dodgeRung, MAX_DODGES, yesScale, type ProposalData } from "./types";
import { heartPuff } from "./burst";
import { chip, DISPLAY, INK, INK_SOFT, PINK_DEEP, PINK_GLOW, PINK_GRADIENT, SCRIPT } from "./theme";
import { clamp } from "./motion";

/** Breathing room kept between the No button and every arena edge. */
const PAD = 8;
/**
 * Viewport band reserved for the fixed controls (mute toggle top-left, brand
 * badge top-right). On a tall phone the arena starts far below this, so it costs
 * nothing; on a short/landscape viewport where the page scrolls, it is what stops
 * the No button being placed underneath one of them.
 */
const SAFE_TOP = 68;
/** Extra clearance kept around the YES button so No can never hide behind it. */
const YES_MARGIN = 14;
/** Candidate positions tried before falling back to "furthest from YES". */
const TRIES = 24;
const REACTION_SIZE = 76;
/** Two events can describe one poke (pointerdown + touchstart) — collapse them. */
const DEBOUNCE_MS = 180;

export default function TheAsk({
  data,
  dodges,
  onDodge,
  onYes,
  reduced,
}: {
  data: ProposalData;
  dodges: number;
  onDodge: () => void;
  onYes: () => void;
  reduced: boolean;
}) {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [arena, setArena] = useState<{ w: number; h: number } | null>(null);
  const lastFleeRef = useRef(0);

  const rung = dodgeRung(dodges);
  const gaveUp = dodges >= MAX_DODGES;
  const reaction = rung.art ? REACTIONS[rung.art] : null;

  /** The arena's usable box, minus the No button's own footprint. */
  const bounds = useCallback(() => {
    const box = arenaRef.current;
    const btn = noRef.current;
    if (!box) return null;
    // offsetWidth/Height is the *layout* size, unaffected by the button's scale
    // transform. Since the button only ever scales down and around its centre,
    // clamping the layout box keeps the smaller visual box inside it too.
    const bw = btn?.offsetWidth || 104;
    const bh = btn?.offsetHeight || 44;
    const maxY = Math.max(PAD, box.clientHeight - bh - PAD);
    // How far down the arena we must start to clear the fixed top controls,
    // expressed in arena-local coordinates. Negative (the common case) when the
    // arena already sits below them.
    const clearFixed = SAFE_TOP - box.getBoundingClientRect().top;
    return {
      bw,
      bh,
      w: box.clientWidth,
      h: box.clientHeight,
      maxX: Math.max(PAD, box.clientWidth - bw - PAD),
      maxY,
      // Always satisfiable: never above PAD, never past maxY.
      minY: clamp(clearFixed, PAD, maxY),
    };
  }, []);

  // Initial placement + re-clamp on any viewport change.
  useEffect(() => {
    const settle = () => {
      const b = bounds();
      if (!b) return;
      setArena({ w: b.w, h: b.h });
      setPos((prev) =>
        prev
          ? { x: clamp(prev.x, PAD, b.maxX), y: clamp(prev.y, b.minY, b.maxY) }
          : // First resting place: just below and to the right of YES.
            { x: clamp(b.w / 2 - b.bw / 2 + 46, PAD, b.maxX), y: clamp(b.h * 0.78, b.minY, b.maxY) },
      );
    };
    settle();
    // A second pass once fonts have settled and the button has its real width.
    const t = setTimeout(settle, 260);
    window.addEventListener("resize", settle);
    window.addEventListener("orientationchange", settle);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", settle);
      window.removeEventListener("orientationchange", settle);
    };
  }, [bounds]);

  /** Teleport No somewhere random, inside the arena, and clear of YES. */
  const teleport = useCallback(() => {
    const b = bounds();
    const box = arenaRef.current;
    if (!b || !box) return;

    const roll = () => ({
      x: PAD + Math.random() * (b.maxX - PAD),
      y: b.minY + Math.random() * (b.maxY - b.minY),
    });

    // YES carries a scale transform, so its *visual* box is what we must avoid —
    // getBoundingClientRect already includes ancestor transforms.
    const yesEl = yesRef.current;
    let yesBox: { x: number; y: number; w: number; h: number } | null = null;
    if (yesEl) {
      const a = box.getBoundingClientRect();
      const y = yesEl.getBoundingClientRect();
      yesBox = { x: y.left - a.left, y: y.top - a.top, w: y.width, h: y.height };
    }

    let best = roll();
    if (yesBox) {
      // Random rolls first (so the movement feels chaotic), then the four edges
      // and corners. Once YES has grown to 1.7x inside a short arena, a random
      // roll can genuinely have almost nowhere legal to land — the deterministic
      // edge candidates are what guarantee we still find a free spot when one
      // exists, instead of shrugging and hiding No behind YES.
      const candidates: { x: number; y: number }[] = [];
      for (let i = 0; i < TRIES; i++) candidates.push(roll());
      const midX = PAD + Math.random() * (b.maxX - PAD);
      const midY = b.minY + Math.random() * (b.maxY - b.minY);
      candidates.push(
        { x: midX, y: b.maxY },
        { x: midX, y: b.minY },
        { x: b.maxX, y: midY },
        { x: PAD, y: midY },
        { x: b.maxX, y: b.maxY },
        { x: PAD, y: b.maxY },
        { x: b.maxX, y: b.minY },
        { x: PAD, y: b.minY },
      );

      let bestDist = -1;
      for (const c of candidates) {
        const overlaps =
          c.x < yesBox.x + yesBox.w + YES_MARGIN &&
          c.x + b.bw > yesBox.x - YES_MARGIN &&
          c.y < yesBox.y + yesBox.h + YES_MARGIN &&
          c.y + b.bh > yesBox.y - YES_MARGIN;
        if (!overlaps) {
          best = c;
          break;
        }
        // Nothing legal yet — keep whichever candidate at least sits furthest
        // from YES's centre rather than falling back to an arbitrary value.
        const d = Math.hypot(
          c.x + b.bw / 2 - (yesBox.x + yesBox.w / 2),
          c.y + b.bh / 2 - (yesBox.y + yesBox.h / 2),
        );
        if (d > bestDist) {
          bestDist = d;
          best = c;
        }
      }
    }

    // Final belt-and-braces clamp. Nothing past this point can be out of bounds.
    setPos({ x: clamp(best.x, PAD, b.maxX), y: clamp(best.y, b.minY, b.maxY) });
    setArena({ w: b.w, h: b.h });
  }, [bounds]);

  const flee = useCallback(
    (e?: SyntheticEvent) => {
      // Stops a tap from also resolving into a click (and, on iOS, from selecting
      // the label text or firing a 300ms-delayed synthetic click).
      e?.preventDefault();
      if (gaveUp) return;
      const now = Date.now();
      if (now - lastFleeRef.current < DEBOUNCE_MS) return;
      lastFleeRef.current = now;

      // A puff of hearts where they *thought* they had it.
      const btn = noRef.current;
      if (btn && !reduced) {
        const r = btn.getBoundingClientRect();
        heartPuff(r.left + r.width / 2, r.top + r.height / 2);
      }
      teleport();
      onDodge();
    },
    [gaveUp, onDodge, reduced, teleport],
  );

  // Touch needs a NON-passive listener for preventDefault to actually apply —
  // React attaches its own touchstart passively, so we bind this one by hand.
  const fleeRef = useRef<(e?: SyntheticEvent) => void>(flee);
  useEffect(() => {
    fleeRef.current = flee;
  }, [flee]);
  useEffect(() => {
    const el = noRef.current;
    if (!el) return;
    const onTouchStart = (ev: TouchEvent) => {
      ev.preventDefault();
      fleeRef.current();
    };
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => el.removeEventListener("touchstart", onTouchStart);
  }, []);

  const art = HERO_ART[data.heroArt];
  const grow = yesScale(dodges);
  const noScale = Math.max(1 - dodges * 0.06, 0.55);
  const noOpacity = gaveUp ? 0 : Math.max(1 - dodges * 0.045, 0.42);

  // Reaction art hovers just above the button, flipping below it near the top.
  let reactX = 0;
  let reactY = 0;
  if (pos && arena) {
    const above = pos.y - REACTION_SIZE - 8;
    reactX = clamp(pos.x - 8, PAD, Math.max(PAD, arena.w - REACTION_SIZE - PAD));
    reactY = clamp(
      above < PAD ? pos.y + 50 : above,
      PAD,
      Math.max(PAD, arena.h - REACTION_SIZE - PAD),
    );
  }

  return (
    <section
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "74px 14px 30px",
        width: "100%",
      }}
    >
      <p style={{ ...chip("rgba(255,255,255,.66)", PINK_DEEP), marginBottom: 10 }}>
        <span aria-hidden>{art.emoji}</span> the actual question
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={reduced ? undefined : "ps-bob"}
        src={art.src}
        alt={art.alt}
        style={{
          height: "clamp(96px,19vh,168px)",
          width: "auto",
          maxWidth: "76%",
          objectFit: "contain",
          filter: "drop-shadow(0 14px 24px rgba(200,110,150,.3))",
        }}
      />

      <h2
        className="ps-rise"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: "clamp(25px,7.2vw,42px)",
          lineHeight: 1.14,
          color: INK,
          textAlign: "center",
          margin: "10px 0 2px",
          maxWidth: 560,
          textWrap: "balance",
        }}
      >
        {data.askHeadline}
      </h2>

      <p
        style={{
          fontFamily: SCRIPT,
          fontSize: "clamp(17px,4.6vw,21px)",
          color: PINK_DEEP,
          margin: "0 0 4px",
          textAlign: "center",
        }}
      >
        — {data.senderName || "me"}, holding their breath
      </p>

      {/* Fixed-height status row: never lets the nudge line shift the arena. */}
      <div
        style={{
          minHeight: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
          padding: "2px 0",
        }}
      >
        {gaveUp ? (
          <span key="gaveup" style={chip("rgba(255,255,255,.8)", PINK_DEEP)}>
            <span aria-hidden>🫠</span> the No button has left the building
          </span>
        ) : rung.nudge ? (
          <span key={`nudge-${dodges}`} className="ps-pop" style={chip("rgba(255,255,255,.8)", INK)}>
            {rung.nudge}
          </span>
        ) : (
          <span style={{ ...chip("rgba(255,255,255,.5)", INK_SOFT), opacity: 0.85 }}>
            <span aria-hidden>👀</span> only one of these buttons works
          </span>
        )}
        {dodges > 0 && (
          <span style={chip("rgba(255,214,228,.6)", PINK_DEEP)}>
            escape attempts: {dodges}
          </span>
        )}
      </div>

      {/* ── the arena — every absolute coordinate below is bounded by this box ── */}
      <div
        ref={arenaRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 560,
          height: "clamp(220px,38vh,360px)",
          marginTop: 4,
          touchAction: "manipulation",
        }}
      >
        {/* soft dotted playfield so the empty space reads as intentional */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            background:
              "radial-gradient(circle at 1px 1px, rgba(239,83,125,.14) 1px, transparent 0) 0 0/16px 16px, rgba(255,255,255,.34)",
            border: "1px dashed rgba(255,182,205,.75)",
            maskImage: "radial-gradient(120% 100% at 50% 50%, #000 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(120% 100% at 50% 50%, #000 55%, transparent 100%)",
          }}
        />

        {reaction && !gaveUp && pos && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`react-${dodges}`}
            className="ps-pop"
            src={reaction.src}
            alt={reaction.alt}
            loading="lazy"
            style={{
              position: "absolute",
              left: reactX,
              top: reactY,
              width: REACTION_SIZE,
              height: REACTION_SIZE,
              objectFit: "contain",
              pointerEvents: "none",
              zIndex: 2,
              filter: "drop-shadow(0 10px 18px rgba(200,110,150,.34))",
            }}
          />
        )}

        {/* YES — absolutely centred, so growing it can never reflow anything */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "44%",
            transform: `translate(-50%,-50%) scale(${grow})`,
            transformOrigin: "center",
            transition: reduced ? "none" : "transform .55s cubic-bezier(.2,1.35,.35,1)",
            zIndex: 4,
          }}
        >
          <button
            ref={yesRef}
            type="button"
            onClick={onYes}
            className={reduced ? "ps-btn" : "ps-btn ps-pulse"}
            style={{
              border: "none",
              cursor: "pointer",
              width: "clamp(148px,44vw,208px)",
              padding: "17px 18px",
              borderRadius: 999,
              background: PINK_GRADIENT,
              color: "#fff",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(19px,5vw,25px)",
              lineHeight: 1.15,
              boxShadow: PINK_GLOW,
            }}
          >
            {data.yesLabel}
          </button>
        </div>

        {/* NO — uncatchable. Translated, never re-laid-out. */}
        <button
          ref={noRef}
          type="button"
          aria-label={gaveUp ? "The no button has given up" : `${rung.label} (this button runs away)`}
          aria-hidden={gaveUp}
          disabled={gaveUp}
          onPointerEnter={(e) => {
            // Touch fires pointerenter immediately before pointerdown; only let a
            // real mouse dodge on hover, otherwise the tap path double-fires.
            if (e.pointerType === "mouse") flee(e);
          }}
          onPointerDown={flee}
          onClick={flee}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate3d(${pos?.x ?? 0}px, ${pos?.y ?? 0}px, 0) scale(${noScale})`,
            transformOrigin: "center",
            opacity: pos ? noOpacity : 0,
            transition: reduced
              ? "opacity .3s ease"
              : "transform .34s cubic-bezier(.2,1.5,.35,1), opacity .35s ease",
            pointerEvents: gaveUp ? "none" : "auto",
            zIndex: 3,
            border: "1px solid rgba(160,140,150,.28)",
            cursor: "pointer",
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(246,242,244,.9)",
            color: "#8d8189",
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: "clamp(13px,3.6vw,15px)",
            whiteSpace: "nowrap",
            maxWidth: "70%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxShadow: "0 8px 18px -12px rgba(90,60,75,.4)",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {rung.label}
        </button>

        {gaveUp && (
          <div
            className="ps-pop"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              pointerEvents: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={REACTIONS.sadWhy.src}
              alt={REACTIONS.sadWhy.alt}
              loading="lazy"
              style={{ width: 64, height: 64, objectFit: "contain", opacity: 0.95 }}
            />
            <span style={chip("rgba(255,255,255,.85)", PINK_DEEP)}>
              it&rsquo;s just you and YES now <span aria-hidden>💘</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
