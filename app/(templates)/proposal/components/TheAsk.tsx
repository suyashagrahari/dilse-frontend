"use client";

// ─── Act 3 — the ask ─────────────────────────────────────────────────────────
// The viral mechanic. Everything interactive lives inside one measured "arena"
// div, and the "No" button is positioned absolutely *within that arena only*.
//
// Why an arena instead of the viewport: the No button's coordinates are then
// bounded by a box we measured ourselves (`clientWidth`/`clientHeight`), so it is
// impossible for it to land off-screen, under the fixed brand badge (top-right)
// or beneath the YES button. The arena is also re-measured on resize and
// orientation change, and any existing position is re-clamped into the new
// bounds — which is the case that normally strands these buttons off-screen
// after a device rotation.
//
// ── WHAT COUNTS AS OCCUPIED ─────────────────────────────────────────────────
//
// Two things, and both are MEASURED rather than assumed: the YES button (which
// carries a scale transform, so only its rendered rect is meaningful) and the
// music dock, which is fixed to the bottom-right and can overlap the arena on a
// short viewport. `occupied()` returns them as arena-local rects and every
// placement decision — the No button AND its reaction art — is checked against
// the same list.
//
// The reaction art is the part that was wrong: it was positioned purely
// relative to the No button, so once YES had grown, the sad bear could sit
// squarely on top of it. It now picks from candidate slots around the button
// and takes the first one that is clear.

import { useCallback, useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { HERO_ART, REACTIONS } from "./assets";
import { dodgeRung, MAX_DODGES, yesScale, type ProposalData } from "./types";
import { heartPuff } from "./burst";
import { chip, DISPLAY, INK, INK_SOFT, PINK_DEEP, PINK_GLOW, PINK_GRADIENT, SCRIPT } from "./theme";
import { clamp } from "./motion";
import { DOCK_ID } from "./MusicDock";
import { copyFor } from "./copy";

/** Breathing room kept between the No button and every arena edge. */
const PAD = 8;
/**
 * Viewport band reserved for the fixed controls at the top (the back chip
 * top-left, the brand badge top-right). On a tall phone the arena starts far
 * below this, so it costs nothing; on a short or landscape viewport where the
 * page scrolls, it is what stops the No button being placed underneath one.
 */
const SAFE_TOP = 68;
/** Extra clearance kept around the YES button so No can never hide behind it. */
const YES_MARGIN = 14;
/** Candidate positions tried before falling back to "furthest from YES". */
const TRIES = 24;
const REACTION_SIZE = 76;
/** Clearance kept around the reaction art, same idea as YES_MARGIN. */
const REACT_MARGIN = 6;
/** Two events can describe one poke (pointerdown + touchstart) — collapse them. */
const DEBOUNCE_MS = 180;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Axis-aligned overlap. Used for every placement decision in this file. */
function hits(x: number, y: number, w: number, h: number, r: Rect): boolean {
  return x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y;
}

interface Bounds {
  bw: number;
  bh: number;
  w: number;
  h: number;
  maxX: number;
  maxY: number;
  minY: number;
}

/**
 * A resting place for the No button: random, inside the arena, clear of
 * everything.
 *
 * Random rolls first so the movement feels chaotic, then the edges and corners.
 * Once YES has grown to 1.7x inside a short arena a random roll can genuinely
 * have almost nowhere legal to land; the deterministic edge candidates are what
 * guarantee a free spot is still found when one exists, instead of shrugging
 * and hiding No behind YES. If nothing is legal, the candidate furthest from
 * the nearest obstacle wins.
 */
function pickSpot(b: Bounds, blocked: Rect[]): { x: number; y: number } {
  const roll = () => ({
    x: PAD + Math.random() * (b.maxX - PAD),
    y: b.minY + Math.random() * (b.maxY - b.minY),
  });

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

  let best = candidates[0];
  let bestGap = -1;
  for (const c of candidates) {
    if (!blocked.some((r) => hits(c.x, c.y, b.bw, b.bh, r))) {
      best = c;
      bestGap = Infinity;
      break;
    }
    const d = blocked.length
      ? Math.min(
          ...blocked.map((r) =>
            Math.hypot(c.x + b.bw / 2 - (r.x + r.w / 2), c.y + b.bh / 2 - (r.y + r.h / 2)),
          ),
        )
      : Infinity;
    if (d > bestGap) {
      bestGap = d;
      best = c;
    }
  }
  // Belt and braces. Nothing past this point can be out of bounds.
  return { x: clamp(best.x, PAD, b.maxX), y: clamp(best.y, b.minY, b.maxY) };
}

/**
 * Where the sad reaction art goes, given where the No button landed — or null
 * when there is nowhere for it.
 *
 * It used to be "just above the No button, or below it near the top", with no
 * awareness of anything else on the arena. Once YES had grown, that put the sad
 * bear squarely on top of the one button that matters.
 *
 * Four slots — above, below, right, left — and the first that clears every
 * obstacle wins.
 *
 * ── WHY IT GIVES UP INSTEAD OF PICKING THE LEAST-BAD SLOT ───────────────────
 *
 * Measured on a 360×640 screen: the arena is 328×243, YES at its full 1.7x is
 * about 250×95, and once the No button is somewhere in what is left, all four
 * slots genuinely overlap YES. An earlier version fell back to "furthest from
 * trouble", which meant the bear sat on the YES button on seven of eleven
 * pokes on that screen.
 *
 * A guilt-trip GIF is a delight; YES is the function. When the two cannot both
 * fit, the delight is the one that goes. Nobody misses a sad bear they never
 * knew was coming; everybody notices a button they cannot press.
 */
function placeReaction(
  pos: { x: number; y: number },
  arenaW: number,
  arenaH: number,
  noW: number,
  noH: number,
  blocked: Rect[],
): { x: number; y: number } | null {
  const maxX = Math.max(PAD, arenaW - REACTION_SIZE - PAD);
  const maxY = Math.max(PAD, arenaH - REACTION_SIZE - PAD);
  const slots = [
    { x: pos.x - 8, y: pos.y - REACTION_SIZE - 8 },
    { x: pos.x - 8, y: pos.y + noH + 8 },
    { x: pos.x + noW + 8, y: pos.y - REACTION_SIZE / 2 },
    { x: pos.x - REACTION_SIZE - 8, y: pos.y - REACTION_SIZE / 2 },
  ].map((c) => ({ x: clamp(c.x, PAD, maxX), y: clamp(c.y, PAD, maxY) }));

  const size = REACTION_SIZE + REACT_MARGIN * 2;
  for (const c of slots) {
    if (!blocked.some((r) => hits(c.x - REACT_MARGIN, c.y - REACT_MARGIN, size, size, r))) return c;
  }
  return null;
}

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
  /** Where the sad reaction art sits. Chosen in an effect — see below. */
  /** Where the sad art sits, or null when there is no room for it at all. */
  const [react, setReact] = useState<{ x: number; y: number } | null>(null);
  const lastFleeRef = useRef(0);
  /**
   * The obstacle list as of the last placement.
   *
   * Held in a ref and read during render rather than measured during render:
   * calling getBoundingClientRect in the render body forces layout on every
   * pass, and the values would be stale by a frame anyway because YES animates
   * its scale over 550ms. Refreshed in the same handlers that move the button.
   */
  const blockedRef = useRef<Rect[]>([]);

  const rung = dodgeRung(dodges);
  const gaveUp = dodges >= MAX_DODGES;
  const reaction = rung.art ? REACTIONS[rung.art] : null;

  /**
   * Everything the arena must route around, in arena-local coordinates.
   *
   * `getBoundingClientRect` on both, so transforms and fixed positioning are
   * already baked in and nothing here has to know how either element is laid
   * out. The dock is found by id rather than passed down as a ref: it lives
   * three components away, and threading a ref through the template for one
   * geometry read would couple the two far harder than a documented id does.
   */
  const occupied = useCallback((growTo: number): Rect[] => {
    const box = arenaRef.current;
    if (!box) return [];
    const out: Rect[] = [];

    // ── YES, computed rather than measured ────────────────────────────────
    //
    // Its rect is animating: the scale transition runs for 550ms, and a dodge
    // asks for a new position on frame one. Measuring would therefore route the
    // No button around where YES USED to be and drop it exactly where YES is
    // travelling to. The layout is fixed and known — centred at 50%/44% of the
    // arena with a scale transform — so the destination box is arithmetic.
    const yesEl = yesRef.current;
    if (yesEl && yesEl.offsetWidth > 0) {
      const w = yesEl.offsetWidth * growTo;
      const h = yesEl.offsetHeight * growTo;
      const cx = box.clientWidth * 0.5;
      const cy = box.clientHeight * 0.44;
      out.push({
        x: cx - w / 2 - YES_MARGIN,
        y: cy - h / 2 - YES_MARGIN,
        w: w + YES_MARGIN * 2,
        h: h + YES_MARGIN * 2,
      });
    }

    // ── The music dock, measured ──────────────────────────────────────────
    //
    // Fixed to the bottom-right of the viewport and not animating, so its rect
    // is honest. Found by id rather than threaded down as a ref: it lives three
    // components away, and passing a ref through the template for one geometry
    // read would couple them far harder than a documented id does.
    const dock = typeof document === "undefined" ? null : document.getElementById(DOCK_ID);
    if (dock) {
      const a = box.getBoundingClientRect();
      const r = dock.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        out.push({
          x: r.left - a.left - PAD,
          y: r.top - a.top - PAD,
          w: r.width + PAD * 2,
          h: r.height + PAD * 2,
        });
      }
    }
    return out;
  }, []);

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
      const blocked = occupied(yesScale(dodges));
      blockedRef.current = blocked;
      setPos((prev) => {
        // ── WHY THIS RE-CLAMPS *AND* RE-CHECKS ──────────────────────────
        //
        // This runs on resize, on rotation, and on every dodge — and on a
        // dodge the button's own width has just changed, because the label
        // did: "No" is 57px and "You're breaking me" is 139px. The teleport
        // that placed it was working from the OLD width, so the new box can
        // both overflow the arena and, once clamped back inside, land on top
        // of YES. Clamping alone fixes the first and causes the second.
        //
        // So: clamp, and if the clamped spot is now occupied, place it again
        // properly with the width it actually has.
        const clamped = prev
          ? { x: clamp(prev.x, PAD, b.maxX), y: clamp(prev.y, b.minY, b.maxY) }
          : // First resting place: just below and to the right of YES.
            { x: clamp(b.w / 2 - b.bw / 2 + 46, PAD, b.maxX), y: clamp(b.h * 0.78, b.minY, b.maxY) };
        const next = blocked.some((r) => hits(clamped.x, clamped.y, b.bw, b.bh, r))
          ? pickSpot(b, blocked)
          : clamped;
        setReact(placeReaction(next, b.w, b.h, b.bw, b.bh, blocked));
        return next;
      });
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
  }, [bounds, dodges, occupied]);

  /** Teleport No somewhere random, inside the arena, and clear of everything. */
  const teleport = useCallback(
    (growTo: number) => {
      const b = bounds();
      if (!b) return;
      const blocked = occupied(growTo);
      blockedRef.current = blocked;
      const landed = pickSpot(b, blocked);
      setPos(landed);
      setReact(placeReaction(landed, b.w, b.h, b.bw, b.bh, blocked));
    },
    [bounds, occupied],
  );

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
      // The scale YES is about to become, not the one it currently has.
      teleport(yesScale(dodges + 1));
      onDodge();
    },
    [dodges, gaveUp, onDodge, reduced, teleport],
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
  const voice = copyFor(data.perspective);
  const grow = yesScale(dodges);
  const noScale = Math.max(1 - dodges * 0.06, 0.55);
  const noOpacity = gaveUp ? 0 : Math.max(1 - dodges * 0.045, 0.42);

  return (
    <section
      className="ps-act"
      style={{
        // ── SAFE CENTRING ──────────────────────────────────────────────────
        //
        // `justify-content: center` on a flex column clips BOTH ends once the
        // content is taller than the box, and the overflow above the start edge
        // cannot be scrolled to. On a short phone that cut the top off the hero
        // animation — it looked like the art was hanging off the screen.
        //
        // `margin: auto` on the child does the same centring and degrades to
        // flex-start when there is not enough room, which is the behaviour
        // `safe center` would give if it were reliably supported.
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "74px 14px 104px",
      }}
    >
      <div
        style={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
      <p style={{ ...chip("rgba(255,255,255,.66)", PINK_DEEP), marginBottom: 10 }}>
        <span aria-hidden>{art.emoji}</span> {voice.askChip}
      </p>

      {/*
        A FIXED frame, and the art does not bob.

        Two separate complaints, one cause. The bob moved the image inside a box
        sized to the image, so on a short viewport it drifted in and out of the
        clipped region and read as "dangling". And because the box had no
        reserved height, the art's own load shifted every element under it.

        The frame is now a fixed height that the image is centred inside, and it
        holds still. The page has plenty of motion already — the hearts, the
        pulse on YES, the button that runs away. The one thing being looked at
        does not need to move as well.
      */}
      <div
        style={{
          height: "clamp(96px,19vh,168px)",
          width: "100%",
          maxWidth: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={art.src}
          alt={art.alt}
          style={{
            height: "100%",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 14px 24px rgba(200,110,150,.3))",
          }}
        />
      </div>

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
        — {data.senderName || "me"}, {voice.askByline}
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

        {reaction && !gaveUp && react && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`react-${dodges}`}
            className="ps-pop"
            src={reaction.src}
            alt={reaction.alt}
            loading="lazy"
            style={{
              position: "absolute",
              left: react.x,
              top: react.y,
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

      </div>

      {/*
        ── THE GIVE-UP NOTICE LIVES OUTSIDE THE ARENA ──────────────────────

        It used to be absolutely positioned at the arena's bottom edge, which
        is fine on a tall screen and wrong on a short one: by the twelfth dodge
        YES is at its full 1.7x and on a 360x640 viewport it fills the arena
        entirely, so the notice landed on top of it every single time.

        Nothing about this is part of the chase — the chase is over, that is
        what it says. So it sits below the playfield, in normal flow, where it
        cannot collide with anything by construction.
      */}
      {gaveUp && (
        <div
          className="ps-pop"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            marginTop: 12,
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