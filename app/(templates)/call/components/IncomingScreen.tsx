// ─── Screen 1 — the incoming call ────────────────────────────────────────────
//
// Her photo blurred behind a heavy scrim, the pulsing rings, the identification
// card, and the two buttons everybody's thumb already knows the position of.
//
// ── THE TAG ROW IS THE HERO ──────────────────────────────────────────────────
//
// Verified, spam 0%, a location — those are the chrome that makes the card
// recognisable. The row that carries the joke is "Tagged by 2,481 people as
// 'Pick Up. Now.'", so it is set larger than its neighbours and the tag itself
// is the only accent-coloured 600-weight text on the card.
//
// ── ANSWERING ────────────────────────────────────────────────────────────────
//
// Swipe up to answer, with a real gesture: Pointer Events, `touch-action:none`,
// committed at a quarter of the viewport OR on upward velocity, springing back
// under that. AND A TAP ALSO WORKS. Gating the only way forward behind a
// gesture is how a template becomes a puzzle — the swipe is a flourish for the
// people who find it, never a lock.
//
// The one trap: a `pointerup` that commits is followed by a `click` on the same
// button. `gestureHandled` swallows that second event; a genuine tap leaves the
// flag alone and the click is what answers.

"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckBadgeGlyph,
  ChevronUpGlyph,
  CheckGlyph,
  PhoneDownGlyph,
  PhoneGlyph,
  PinGlyph,
  ShieldGlyph,
  TagGlyph,
} from "./icons";
import { Avatar, DARK, FONT, TAP, TAP_BIG, useCountUp, useReducedMotion } from "./theme";
import { WORDMARK, spamLabel, type CallData, type CallerTag } from "./types";

export interface IncomingScreenProps {
  data: CallData;
  /** Merged with anything her friends have had approved. Sorted by the caller. */
  tags: readonly CallerTag[];
  /** How many times he has declined so far. Drives the label, and the joke. */
  declines: number;
  /** True until a gesture has been seen, so the ring can be honest about silence. */
  needsGesture: boolean;
  onAnswer: () => void;
  onDecline: () => void;
  onToast: (message: string) => void;
}

/** The line at the top. It gets funnier the more he refuses. */
export function ringLabel(declines: number): string {
  if (declines <= 0) return "Incoming call";
  if (declines === 1) return "Incoming call (2)";
  if (declines === 2) return "Incoming call (3) — she is not going to stop.";
  return `Incoming call (${declines + 1})`;
}

/** Sorted by count, ties broken alphabetically. Never throws on an empty list. */
export function heroTag(tags: readonly CallerTag[]): CallerTag | null {
  if (tags.length === 0) return null;
  return [...tags].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))[0];
}

const groupsOf = (n: number): string => n.toLocaleString("en-IN");

/** One row of the identification card. */
function CardRow({
  glyph,
  children,
  hero,
}: {
  glyph: React.ReactNode;
  children: React.ReactNode;
  hero?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: hero ? "10px 0" : "7px 0",
        minWidth: 0,
      }}
    >
      <span style={{ width: 20, height: 20, flex: "none", marginTop: 1 }}>{glyph}</span>
      <div
        style={{
          minWidth: 0,
          flex: 1,
          fontSize: hero ? 15.5 : 14,
          lineHeight: 1.4,
          color: DARK.dim,
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The 4-segment spam meter. Zero is a statement, so zero paints all four. */
function SpamMeter({ risk }: { risk: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(risk)));
  const bad = Math.ceil(clamped / 25);
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 7 }} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i < bad ? DARK.danger : DARK.accentWarm,
            opacity: i < bad ? 0.9 : 0.85,
          }}
        />
      ))}
    </div>
  );
}

/** Our own mark, top-left of the card. The tick is part of it. */
function Wordmark() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px 3px 7px",
        borderRadius: 999,
        background: "rgba(29,163,98,0.14)",
        border: `1px solid rgba(29,163,98,0.34)`,
        color: DARK.accentWarm,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      <CheckGlyph size={11} color={DARK.accentWarm} />
      {WORDMARK}
    </span>
  );
}

export default function IncomingScreen({
  data,
  tags,
  declines,
  needsGesture,
  onAnswer,
  onDecline,
  onToast,
}: IncomingScreenProps) {
  const reduced = useReducedMotion();
  const top = heroTag(tags);
  // Counts up when a friend's tag is approved while the page is open.
  const shownCount = useCountUp(top?.count ?? 0, !reduced);

  // ── The swipe ──────────────────────────────────────────────────────────────
  const [lift, setLift] = useState(0);
  const [springing, setSpringing] = useState(false);
  const drag = useRef<{ id: number; startY: number; lastY: number; lastT: number; v: number; moved: number } | null>(null);
  /** Set when a pointer gesture already decided; swallows the trailing click. */
  const gestureHandled = useRef(false);

  const commitThreshold = useCallback(
    () => (typeof window === "undefined" ? 160 : window.innerHeight * 0.25),
    []
  );

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const now = e.timeStamp || Date.now();
    drag.current = { id: e.pointerId, startY: e.clientY, lastY: e.clientY, lastT: now, v: 0, moved: 0 };
    setSpringing(false);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const now = e.timeStamp || Date.now();
      const dt = Math.max(1, now - d.lastT);
      // Upward is positive, in px/ms.
      d.v = (d.lastY - e.clientY) / dt;
      d.lastY = e.clientY;
      d.lastT = now;
      d.moved = Math.max(d.moved, Math.abs(e.clientY - d.startY));

      const dy = d.startY - e.clientY;
      setLift(Math.max(0, Math.min(commitThreshold() * 1.25, dy)));
    },
    [commitThreshold]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;

      const committed = !cancelled && (lift >= commitThreshold() || d.v > 0.5);
      if (committed) {
        gestureHandled.current = true;
        setLift(0);
        setSpringing(false);
        onAnswer();
        return;
      }

      // A drag that went nowhere is a tap: leave the flag alone and let the
      // click that follows do the answering.
      if (d.moved > 8 || cancelled) gestureHandled.current = true;
      setSpringing(true);
      setLift(0);
    },
    [lift, commitThreshold, onAnswer]
  );

  const onAnswerClick = useCallback(() => {
    if (gestureHandled.current) {
      gestureHandled.current = false;
      return;
    }
    onAnswer();
  }, [onAnswer]);

  const progress = Math.min(1, lift / Math.max(1, commitThreshold()));
  const nameSize = data.caller.name.length > 20 ? 24 : data.caller.name.length > 15 ? 27 : 30;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: DARK.bg,
        color: DARK.text,
        fontFamily: FONT,
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
      }}
    >
      {/* Her photo, blurred, under a heavy scrim. Decorative only. */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {data.caller.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.caller.photoUrl}
            alt=""
            style={{
              position: "absolute",
              inset: "-8%",
              width: "116%",
              height: "116%",
              objectFit: "cover",
              filter: "blur(26px)",
              opacity: 0.3,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(16,20,24,0.82) 0%, rgba(16,20,24,0.9) 42%, rgba(16,20,24,0.97) 100%)",
          }}
        />
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, padding: "0 16px" }}>
        {/* Whose phone this is — the lock-screen line above the call. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            letterSpacing: "0.06em",
            color: "rgba(154,164,174,0.7)",
            textTransform: "uppercase",
          }}
        >
          <span>{data.caller.carrier}</span>
          <span>{data.recipient.name}&rsquo;s phone</span>
        </div>

        <p
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: DARK.dim,
            lineHeight: 1.5,
          }}
          aria-live="polite"
        >
          {ringLabel(declines)}
        </p>

        {/* ── Photo + rings ─────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            margin: "22px auto 0",
            display: "grid",
            placeItems: "center",
          }}
        >
          {reduced ? (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2px solid ${DARK.accentWarm}`,
                opacity: 0.26,
                transform: "scale(1.22)",
              }}
            />
          ) : (
            <>
              <span className="call-ring" aria-hidden="true" />
              <span className="call-ring call-ring-b" aria-hidden="true" />
            </>
          )}
          <Avatar name={data.caller.name} src={data.caller.photoUrl} size={120} ring={2} ringColor={DARK.accentWarm} />
        </div>

        <h1
          style={{
            margin: "18px 0 0",
            textAlign: "center",
            fontSize: nameSize,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            overflowWrap: "anywhere",
          }}
        >
          {data.caller.name}
        </h1>
        <p style={{ margin: "6px 0 0", textAlign: "center", fontSize: 15, color: DARK.dim, lineHeight: 1.45 }}>
          {data.caller.number}
          {data.caller.carrier ? ` · ${data.caller.carrier}` : ""}
        </p>

        {/* ── The identification card ───────────────────────────────────── */}
        <section
          aria-label="Caller identification"
          style={{
            width: "90%",
            maxWidth: 340,
            margin: "20px auto 0",
            padding: 16,
            borderRadius: 14,
            background: DARK.card,
            border: `1px solid ${DARK.edge}`,
            minWidth: 0,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Wordmark />
          </div>

          <CardRow glyph={<CheckBadgeGlyph size={20} color={data.verified ? DARK.accentWarm : DARK.dim} />}>
            {data.verified ? (
              <span style={{ color: DARK.accentWarm, fontWeight: 600 }}>Verified</span>
            ) : (
              <span>Not verified</span>
            )}
          </CardRow>

          <CardRow glyph={<TagGlyph size={20} color={DARK.dim} />} hero>
            {top ? (
              <>
                Tagged by {groupsOf(shownCount)} {top.count === 1 ? "person" : "people"} as{" "}
                <span style={{ color: DARK.accentWarm, fontWeight: 600 }}>&ldquo;{top.label}&rdquo;</span>
              </>
            ) : (
              <>Not yet tagged. Be the first.</>
            )}
          </CardRow>

          <CardRow glyph={<ShieldGlyph size={20} color={DARK.dim} />}>
            {/* `spamLabel` is the frozen contract's own wording for this row —
                0 reads as "0% spam · verified", never as an empty bar. */}
            <span>{spamLabel(data)}</span>
            <SpamMeter risk={data.spamRisk} />
          </CardRow>

          <CardRow glyph={<PinGlyph size={20} color={DARK.dim} />}>{data.caller.location}</CardRow>
        </section>

        <div style={{ flex: 1, minHeight: 18 }} />

        {/* ── Controls ──────────────────────────────────────────────────── */}
        {needsGesture ? (
          <p
            style={{
              margin: "0 auto 14px",
              textAlign: "center",
              fontSize: 12.5,
              lineHeight: 1.5,
              color: DARK.dim,
              maxWidth: 280,
            }}
          >
            Tap to answer — your phone keeps the sound off until you touch the screen.
          </p>
        ) : (
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              marginBottom: 10,
              opacity: reduced ? 0.35 : Math.max(0.18, 0.75 - progress * 0.6),
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={reduced ? undefined : "call-chevron"}
                style={{ animationDelay: `${i * 0.18}s` }}
              >
                <ChevronUpGlyph size={16} color={DARK.dim} />
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 80 }}>
          <button
            type="button"
            onClick={onDecline}
            aria-label="Decline the call"
            style={{
              width: TAP_BIG,
              height: TAP_BIG,
              borderRadius: "50%",
              border: "none",
              background: DARK.danger,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              touchAction: "manipulation",
              boxShadow: "0 6px 18px rgba(229,72,77,0.34)",
            }}
          >
            <PhoneDownGlyph size={28} color="#fff" />
          </button>

          <button
            type="button"
            onClick={onAnswerClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endDrag(e, false)}
            onPointerCancel={(e) => endDrag(e, true)}
            aria-label="Answer the call — tap, or swipe up"
            style={{
              width: TAP_BIG,
              height: TAP_BIG,
              borderRadius: "50%",
              border: "none",
              background: DARK.accentWarm,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              // The gesture owns vertical movement; without this the page scrolls
              // under the thumb and the drag never starts on Android.
              touchAction: "none",
              transform: `translateY(${-lift}px)`,
              transition: springing ? "transform 320ms cubic-bezier(0.34, 1.4, 0.64, 1)" : "none",
              boxShadow: "0 6px 18px rgba(29,163,98,0.36)",
            }}
          >
            <PhoneGlyph size={28} color="#fff" />
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 14 }}>
          {["Message", "Remind me"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onToast("you are going to answer.")}
              style={{
                minHeight: TAP,
                padding: "0 10px",
                background: "transparent",
                border: "none",
                color: DARK.dim,
                fontFamily: FONT,
                fontSize: 14,
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .call-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid ${DARK.accentWarm};
          animation: call-ring-pulse 2s linear infinite;
          pointer-events: none;
        }
        .call-ring-b { animation-delay: 1s; }
        @keyframes call-ring-pulse {
          from { transform: scale(1);   opacity: 0.5; }
          to   { transform: scale(1.6); opacity: 0;   }
        }
        .call-chevron { animation: call-chevron-drift 1.6s ease-in-out infinite; }
        @keyframes call-chevron-drift {
          0%   { transform: translateY(6px);  opacity: 0.15; }
          45%  { opacity: 0.9; }
          100% { transform: translateY(-8px); opacity: 0; }
        }
        /* Frozen for the share-card capture, and by the OS preference. */
        .call-frozen .call-ring,
        .call-frozen .call-chevron { animation: none !important; }
        @media (prefers-reduced-motion: reduce) {
          .call-ring, .call-chevron { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
