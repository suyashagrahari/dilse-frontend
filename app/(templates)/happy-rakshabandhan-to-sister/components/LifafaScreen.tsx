"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RS, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "./theme";
import { sisterWord, type SisterData } from "./types";
import { PetalFall, Rangoli, Seal, ThreadRule } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";
import type { Entry } from "./SisterTemplate";

// ─── The lifafa ──────────────────────────────────────────────────────────────
//
// Two beats: a sealed envelope she tears open, then whatever he put in it.
//
// ── WHY THIS SCREEN IS "PART PAYMENT" AND NOT "YOUR GIFT" ───────────────────
//
// The screen before this one is the statement of account, and it closes on a
// balance that cannot be settled. That is the entire reason this screen is
// allowed to be about money. Read on its own, an envelope with a rupee figure in
// it is a payment card with a festival skin; read as the instalment that follows
// an unpayable balance, it is what shagun actually is — a token against a debt
// nobody is pretending to clear. Every string below is written from that side. If
// a future edit makes this screen self-contained ("Here is your gift!") the
// account screen loses its punchline and this one loses its reason to exist.
//
// ── THERE IS NO PAYMENT RAIL HERE, AND ITS ABSENCE IS DELIBERATE ────────────
//
// This screen once showed a UPI QR, a copyable handle and an "Open in a UPI app"
// deep link. All three are gone and none of them was an oversight, so do not add
// one back. A QR and a `upi://pay` link both encode a PAYEE and open the
// SCANNER's app to PAY — so his handle on her screen built a rail running
// backwards, asking the sister to pay her brother on the day he is giving her
// money. Putting her handle there instead publishes her bank identifier on a page
// built to be forwarded and still gives her nothing to scan. The full argument,
// including why this is the one asymmetry with the brother template that is
// correct, is on the `Lifafa` interface in `types.ts`.
//
// What is left is the whole of the giving direction: the figure, his line, and a
// transfer that happens in his own banking app, where it was always going to.
//
// ── THE EMPTY CASE IS THE COMMON ONE ────────────────────────────────────────
//
// `SAMPLE` ships `amount` filled but many brothers will clear it — the money
// already went last week, or it is being handed over in person. So the no-amount
// path is not a degraded state to be apologised for: it is a mithai-and-blessing
// beat that stands on its own, and it must never render as an empty payment card
// with a hole where the figure goes. Test that path first, not last.
//
// ── WHAT IS DELIBERATELY ABSENT ─────────────────────────────────────────────
//
// No "did you get it?", no countdown, no "only today", no confirmation, and no
// state anywhere recording that she read this at all. Raksha Bandhan is peak
// UPI-scam season, and a forwarded page carrying a payment code is precisely the
// shape of the fraud — which is the other half of why this screen carries none.
// The forward button is always live and never mentions the money, and she can
// walk straight past the envelope. Read every string here before adding one: none
// of them push, and none of them imply she owes the page an action. A shagun is a
// gift, not an invoice.

type Beat = "sealed" | "open";

/** How far she has to drag before the strip comes away. */
const TEAR_PX = 120;

/**
 * Anything under this and a pointerup is a tap, not an abandoned drag.
 *
 * Without it the tap path and the drag path fight: a 60px drag released halfway
 * would spring the strip back AND then fire the button's click, so a deliberate
 * half-tear would open the envelope anyway and the gesture would be theatre.
 */
const TAP_PX = 10;

/**
 * The envelope body. Drawn rather than fetched, like everything else in this
 * template — a lifafa is four straight lines and a foil band, and an image would
 * be one more thing to load on the one screen that must not stutter.
 */
function EnvelopeBody({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 300 200" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="rs-lifafa-face" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={RS.rani} />
          <stop offset="100%" stopColor={RS.raniDeep} />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="296" height="196" rx="10" fill="url(#rs-lifafa-face)" />
      <rect
        x="2"
        y="2"
        width="296"
        height="196"
        rx="10"
        fill="none"
        stroke={RS.haldi}
        strokeWidth="3"
      />

      {/* The foil band every real lifafa has, and the fold lines under the flap. */}
      <rect x="2" y="128" width="296" height="16" fill={RS.haldi} opacity="0.85" />
      <path d="M2 40 L150 118 L298 40" fill="none" stroke={RS.haldiSoft} strokeWidth="2" opacity="0.55" />

      {/* A brass diamond lattice — the block print, not a texture library. */}
      {[70, 150, 230].map((x) => (
        <path
          key={x}
          d={`M${x} 158 l12 12 l-12 12 l-12 -12 z`}
          fill="none"
          stroke={RS.brassSoft}
          strokeWidth="1.6"
          opacity="0.7"
        />
      ))}

      <text
        x="150"
        y="186"
        textAnchor="middle"
        fill={RS.haldiSoft}
        fontSize="11"
        letterSpacing="2.4"
      >
        {name.toUpperCase()}
      </text>
    </svg>
  );
}

/**
 * The strip that comes away along the top. This is the piece the gesture moves,
 * so its transform is written as a single string — the compositor takes the whole
 * thing, whereas framer-motion's independent `x`/`rotate` props compile to CSS
 * variables recalculated on the main thread on every pointermove.
 */
function TearStrip({ progress, animate }: { progress: number; animate: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "21%",
        transform: `translateX(${progress * 116}%) rotate(${progress * 7}deg)`,
        transformOrigin: "left center",
        opacity: 1 - progress * 0.35,
        transition: animate ? "transform 260ms cubic-bezier(0.22,1,0.36,1), opacity 260ms" : "none",
        willChange: "transform",
      }}
    >
      <svg viewBox="0 0 300 44" width="100%" height="100%" preserveAspectRatio="none">
        {/* A ragged lower edge, so the strip reads as torn and not as cut. */}
        <path
          d="M0 0 H300 V30 l-12 6 l-13 -5 l-14 7 l-13 -6 l-14 6 l-13 -5 l-14 7 l-13 -6 l-14 6 l-13 -5
             l-14 7 l-13 -6 l-14 6 l-13 -5 l-14 7 l-13 -6 l-14 6 l-13 -5 l-14 7 l-13 -6 z"
          fill={RS.rani}
          stroke={RS.haldi}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/**
 * Two laddoos on a leaf plate. The whole artwork of the empty case, and it has to
 * carry the screen on its own — see the note at the top about why that path is
 * the common one rather than the sad one.
 */
function Mithai({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} aria-hidden>
      <ellipse cx="100" cy="112" rx="82" ry="20" fill={RS.mehendi} opacity="0.18" />
      <path
        d="M18 108 Q100 78 182 108 Q100 130 18 108 Z"
        fill={RS.mehendi}
        opacity="0.85"
      />
      {[
        { cx: 72, cy: 84, r: 30 },
        { cx: 130, cy: 88, r: 26 },
      ].map((c) => (
        <g key={c.cx}>
          <circle cx={c.cx} cy={c.cy} r={c.r} fill={RS.haldi} />
          <circle cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke={RS.brass} strokeWidth="2" />
          {/* The pitted surface of a besan laddoo, placed by hand rather than
              randomised — a re-rolled pattern would twitch on every repaint. */}
          {[
            [-12, -8],
            [4, -14],
            [12, 2],
            [-6, 9],
            [0, -2],
          ].map(([dx, dy]) => (
            <circle
              key={`${dx}-${dy}`}
              cx={c.cx + dx * (c.r / 30)}
              cy={c.cy + dy * (c.r / 30)}
              r={2.4}
              fill={RS.brass}
              opacity="0.5"
            />
          ))}
        </g>
      ))}
      <circle cx="100" cy="60" r="5" fill={RS.rani} />
    </svg>
  );
}

export default function LifafaScreen({
  data,
  entry = "first",
  onContinue,
  onBack,
}: {
  data: SisterData;
  /** "last" when she walks back from the memories — see Entry in SisterTemplate. */
  entry?: Entry;
  onContinue: () => void;
  onBack: () => void;
}) {
  // Read once, on mount, and never again. Coming back from the photos lands on
  // what was inside the envelope, not on an envelope she already tore.
  const [beat, setBeat] = useState<Beat>(entry === "last" ? "open" : "sealed");

  /** 0 → sealed, 1 → torn. Driven directly by the pointer, hence not motion state. */
  const [tear, setTear] = useState(0);
  const [springBack, setSpringBack] = useState(false);

  const startX = useRef(0);
  const moved = useRef(0);
  const dragging = useRef(false);

  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();

  const her = data.sisterName || sisterWord(data);
  const him = data.brotherName || "Bhai";

  const amount = data.lifafa.amount.trim();
  const note = data.lifafa.note.trim();

  /**
   * `amount` is a string because the auspicious figures are written plainly —
   * "501", "1101", "5001" — and because some brothers write "जितना chahiye". So
   * the rupee sign is prefixed only when what he typed is actually a number, and
   * the digits are printed exactly as he grouped them. Reformatting "1101" to
   * "₹1,101" would be tidier and would also stop it looking like shagun.
   */
  const numeric = /^\d[\d,\s]*$/.test(amount);

  /** Nothing in the envelope but the blessing. The common path. */
  const bare = amount.length === 0;

  const open = () => {
    setBeat("open");
    setTear(0);
    setSpringBack(false);
  };

  // ── The tear ───────────────────────────────────────────────────────────────
  //
  // Pointer events, not touch events, so a mouse and a stylus get the identical
  // path; `setPointerCapture` so dragging off the strip does not abort halfway.
  // `touch-action: none` comes from `.rs-drag` and is scoped to this element
  // alone — on the page it would kill pinch-zoom, which is a regression and not
  // a styling choice.
  //
  // The tap path is the primary, labelled affordance and the drag is the bonus:
  // a torn strip is a lovely gesture and a completely undiscoverable one, so the
  // element is a real <button> that opens on click, which means Enter, Space and
  // every screen reader get there too. An unfinishable ritual is a dead page.
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    startX.current = e.clientX;
    moved.current = 0;
    dragging.current = true;
    setSpringBack(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    moved.current = Math.max(moved.current, Math.abs(dx));
    const p = Math.min(Math.max(dx / TEAR_PX, 0), 1);
    setTear(p);
    if (p >= 1) {
      dragging.current = false;
      open();
    }
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    // Springs back rather than resetting hard, so an abandoned tear reads as the
    // paper holding rather than as the page refusing her.
    setSpringBack(true);
    setTear(0);
  };

  const onClick = () => {
    // A completed drag has already opened it; an abandoned one must not be
    // rescued by the click that follows the same pointerup.
    //
    // The counter is cleared on the way out rather than only on pointerdown,
    // because a keyboard activation never sets it — leaving a stale value here
    // after an abandoned drag would swallow the next Enter press.
    const dragged = moved.current > TAP_PX;
    moved.current = 0;
    if (dragged) return;
    open();
  };

  // No `letterSpacing` here — see the note on `.rs-deva` in sister.css.
  const kicker = (
    <p className="rs-deva" style={{ fontSize: 13, color: RS.brass, margin: 0 }}>
      शगुन
    </p>
  );

  // ── SEALED ────────────────────────────────────────────────────────────────
  if (beat === "sealed") {
    return (
      <Stage
        behind={
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 0,
            }}
          >
            <Rangoli size={isDesktop ? 560 : 340} opacity={0.05} />
          </div>
        }
        head={
          <>
            {kicker}
            <h2
              className="rs-display rs-name"
              style={{
                fontSize: isDesktop ? 40 : 27,
                fontWeight: 700,
                color: RS.rani,
                margin: "6px 0 0",
              }}
            >
              Part payment
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: RS.muted,
                margin: "7px 0 0",
                lineHeight: 1.55,
                maxWidth: 320,
              }}
            >
              Against the column that does not balance. It is not a settlement.
            </p>
          </>
        }
        art={
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", display: "grid", placeItems: "center" }}
          >
            <button
              type="button"
              className="rs-drag"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onClick={onClick}
              aria-label={`Open the lifafa ${him} left for you. Tap, or drag the top strip across.`}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: isDesktop ? 360 : 300,
                aspectRatio: "3 / 2",
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "block",
              }}
            >
              <EnvelopeBody name={her} />

              {/* The wax seal, fading out of the way as the strip travels. */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: "38%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 1 - tear,
                  transition: springBack ? "opacity 260ms" : "none",
                }}
              >
                <Seal size={72} color={RS.haldi} text={him} />
              </span>

              {/* Transitioned only on the way back. During the drag the strip
                  tracks her finger, which is direct manipulation and stays on
                  under reduced motion; the spring-back is the only part that is
                  animation rather than response, so that is the part `reduce`
                  turns off. */}
              <TearStrip progress={tear} animate={springBack && !reduce} />

              {/* The tear guide. It is the only instruction on the envelope, and
                  it stops nudging the moment she starts pulling. */}
              {tear < 0.04 && (
                <span
                  aria-hidden
                  className="rs-nudge"
                  style={{
                    position: "absolute",
                    top: "24%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 11,
                    letterSpacing: 1.6,
                    color: RS.haldiSoft,
                    whiteSpace: "nowrap",
                  }}
                >
                  PHAAD →
                </span>
              )}
            </button>
          </motion.div>
        }
        body={
          <>
            <p
              style={{
                fontSize: 13.5,
                color: RS.muted,
                margin: 0,
                maxWidth: 320,
                lineHeight: 1.6,
              }}
            >
              Tear the top off, or just tap it. Nobody in this family has ever opened
              a lifafa neatly.
            </p>

            <button
              type="button"
              onClick={open}
              className="rs-display"
              style={{
                width: "100%",
                maxWidth: 320,
                minHeight: 56,
                padding: "16px 28px",
                borderRadius: 999,
                background: BRAND_GRADIENT,
                color: "#fffdf8",
                border: CARD_BORDER,
                boxShadow: CARD_SHADOW,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Kholo
            </button>

            <BackLink onClick={onBack} />
          </>
        }
      />
    );
  }

  // ── OPEN ──────────────────────────────────────────────────────────────────
  return (
    <Stage
      className="rs-tall"
      behind={
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={isDesktop ? 560 : 340} opacity={0.05} />
        </div>
      }
      overlay={<PetalFall count={12} />}
      head={
        <>
          {kicker}
          <h2
            className="rs-display rs-name"
            style={{
              fontSize: isDesktop ? 40 : 27,
              fontWeight: 700,
              color: RS.rani,
              margin: "6px 0 0",
            }}
          >
            {bare ? "Mithai first" : "Part payment"}
          </h2>
        </>
      }
      art={
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.34, 1.4, 0.64, 1] }}
          style={{
            width: "100%",
            maxWidth: 330,
            padding: "26px 22px",
            borderRadius: 20,
            background: RS.surface,
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {bare ? (
            <Mithai size={isDesktop ? 230 : 190} />
          ) : (
            <>
              <p
                className="rs-display"
                style={{
                  fontSize: numeric ? (isDesktop ? 68 : 54) : isDesktop ? 34 : 27,
                  fontWeight: 700,
                  color: RS.rani,
                  margin: 0,
                  lineHeight: 1.05,
                  overflowWrap: "anywhere",
                  textAlign: "center",
                }}
              >
                {numeric ? "₹" : ""}
                {amount}
              </p>
              <ThreadRule width={200} />
            </>
          )}

          {note && (
            <p
              className="rs-hand"
              style={{
                fontSize: 19,
                lineHeight: 1.45,
                color: RS.ink,
                margin: 0,
                textAlign: "center",
              }}
            >
              {note}
            </p>
          )}
        </motion.div>
      }
      body={
        <>
          {/* The one line that ties this screen to the one before it. It forks on
              birth order because his posture does: to a didi this is an admission,
              to a behna it is a statement of fact. */}
          <p
            style={{
              fontSize: 14,
              color: RS.muted,
              margin: 0,
              maxWidth: 330,
              lineHeight: 1.65,
            }}
          >
            {bare
              ? `Some of it does not go by UPI. The barfi, the argument about the last piece, all of it — ${
                  data.sisterIsElder ? "I bring that myself." : "I am bringing that myself."
                }`
              : data.sisterIsElder
                ? `This does not touch your column, ${sisterWord(data)}. It is an instalment, and I know it.`
                : `Part payment, ${sisterWord(data)}. The rest of it is not payable and you know that.`}
          </p>

          {/* Forward is always live and never mentions the envelope — there is
              nothing to complete here and the button must not imply there is. */}
          <button
            type="button"
            onClick={onContinue}
            className="rs-display"
            style={{
              width: "100%",
              maxWidth: 320,
              minHeight: 56,
              padding: "16px 28px",
              borderRadius: 999,
              background: BRAND_GRADIENT,
              color: "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Aage badho →
          </button>

          <BackLink onClick={onBack} />
        </>
      }
    />
  );
}
