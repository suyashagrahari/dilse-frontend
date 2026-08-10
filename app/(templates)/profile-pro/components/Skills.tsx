"use client";

// ─── Skills — the centrepiece, and the reason the whole template works ───────
//
// A list of skills with endorsement counts beside them. That is the entire
// component, and the restraint is the point.
//
// ── THE JOKE IS IN THE NUMBERS, SO THE STYLING IS FLAT ───────────────────────
//
// "Punctuality (2)" is drawn with the IDENTICAL treatment as "Being Right (47)".
// Same weight, same colour, same size, same separator, same button. No colour
// ramp, no bar chart, no de-emphasis on the small number, no confetti on the big
// one. The contrast between those two numbers sitting in the same deadpan row IS
// the comedy; any styling that editorialises it is the design explaining the
// joke, and an explained joke is not one.
//
// The only thing that varies between rows is the `isTop3` pill, because that is
// data, not commentary.
//
// ── ZERO IS AN OPENING, NOT A FAILURE ────────────────────────────────────────
//
// `endorsements: 0` renders the label and the Endorse button and NOTHING else —
// no count, no endorser line. "0 endorsements" reads as a thing nobody wanted;
// a bare row with a button beside it reads as a thing waiting to be first at.
//
// ── MOTION ───────────────────────────────────────────────────────────────────
//
// When one lands: the count runs up over 300ms, the new face slides into the
// avatar row, and the row holds an accent tint for 400ms. All three are how a
// contribution from somebody else two seconds ago becomes visible without a
// reload. All three are switched off under `prefers-reduced-motion: reduce`,
// where the count snaps and nothing moves — nothing here is gated on an
// animation finishing, so nothing is lost with them off.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from "react";

import { Avatar } from "./Avatar";
import { ACCENT_EDGE, ACCENT_TINT, PP, Card } from "./theme";
import type { ProfileSkill } from "./types";

/* ── Local tokens ──────────────────────────────────────────────────────────── */

/** The one grey in this section. Counts and the endorser line share it exactly. */
const MUTED = "#666666";
const INK = "#191919";

/** Rows past this fold into "Show all N skills". 3 skills and 20 both lay out. */
const COLLAPSE_AT = 5;
const FLASH_MS = 400;
const COUNT_MS = 300;

/** Every tap target in here. The pill inside is 30px; the target around it is not. */
const TAP = 44;

const WRAP: CSSProperties = { overflowWrap: "anywhere", minWidth: 0 };

const KEYFRAMES = `
@keyframes pp-face-in {
  from { opacity: 0; transform: translateX(-10px) scale(0.72); }
  to   { opacity: 1; transform: none; }
}
.pp-face-new { animation: pp-face-in ${COUNT_MS}ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .pp-face-new { animation: none; }
}
`;

/* ── Hooks ─────────────────────────────────────────────────────────────────── */

/**
 * Starts `false` so the server render and the first client render agree, then
 * corrects itself in an effect. Nothing is set during render.
 */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * The count-up. Interpolates from whatever was last shown to the new target
 * over 300ms, and snaps under reduce.
 *
 * It animates on CHANGE only — mounting with 47 shows 47, because a page that
 * counts all of its numbers up on load is a dashboard, not a profile.
 */
function useCountUp(target: number, reduced: boolean): number {
  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = target;

    if (reduced || from === target) {
      setShown(target);
      return;
    }

    let raf = 0;
    const started = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - started) / COUNT_MS);
      const eased = 1 - (1 - p) * (1 - p);
      setShown(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);

  return shown;
}

/** The 400ms accent hold. `nonce` lets the same row flash twice in a row. */
function useFlash(active: boolean, nonce: number): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!active) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), FLASH_MS);
    return () => clearTimeout(t);
  }, [active, nonce]);
  return on;
}

/* ── Copy ──────────────────────────────────────────────────────────────────── */

/**
 * "Sneha, Karan and 45 others have endorsed this".
 *
 * Two names at most, then the remainder as a number. Returns "" for zero, which
 * is what suppresses the whole line — see the note at the top of the file.
 */
function endorserLine(skill: ProfileSkill): string {
  const total = skill.endorsements;
  if (total <= 0) return "";

  const named = skill.topEndorsers.map((n) => n.trim()).filter(Boolean).slice(0, 2);

  if (named.length === 0) {
    return total === 1 ? "1 person has endorsed this" : `${total} people have endorsed this`;
  }

  const others = Math.max(0, total - named.length);
  if (others === 0) {
    const joined = named.length === 1 ? named[0] : `${named[0]} and ${named[1]}`;
    return `${joined} ${named.length === 1 ? "has" : "have"} endorsed this`;
  }
  return `${named.join(", ")} and ${others} ${others === 1 ? "other has" : "others have"} endorsed this`;
}

/* ── Pieces ────────────────────────────────────────────────────────────────── */

function PlusGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path
        d="M6 1.5v9M1.5 6h9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Overlapping faces. 24px, pulled together by 8px, each ringed in white so the
 * stack reads as a stack rather than a smudge.
 */
function EndorserFaces({ names, fresh }: { names: string[]; fresh: boolean }) {
  if (names.length === 0) return null;
  return (
    <span style={{ display: "inline-flex", flex: "none", paddingLeft: 2 }} aria-hidden="true">
      {names.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className={fresh && i === 0 ? "pp-face-new" : undefined}
          style={{
            display: "inline-flex",
            marginLeft: i === 0 ? 0 : -8,
            borderRadius: "50%",
            border: "2px solid #FFFFFF",
            background: "#FFFFFF",
            zIndex: names.length - i,
          }}
        >
          <Avatar name={name} size={24} />
        </span>
      ))}
    </span>
  );
}

function TopSkillPill() {
  return (
    <span
      style={{
        flex: "none",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "16px",
        padding: "1px 8px",
        borderRadius: 100,
        color: PP.accent,
        background: ACCENT_TINT,
        whiteSpace: "nowrap",
      }}
    >
      Top skill
    </span>
  );
}

/* ── The row ───────────────────────────────────────────────────────────────── */

function SkillRow({
  skill,
  onEndorse,
  flashing,
  last,
}: {
  skill: ProfileSkill;
  onEndorse: (skillId: string) => void;
  flashing: boolean;
  last: boolean;
}) {
  const reduced = useReducedMotion();
  const count = useCountUp(skill.endorsements, reduced);
  const flash = useFlash(flashing, skill.endorsements);

  const line = endorserLine(skill);
  const faces = skill.topEndorsers.map((n) => n.trim()).filter(Boolean).slice(0, 3);

  const press = useCallback(() => onEndorse(skill.id), [onEndorse, skill.id]);

  return (
    <li
      style={{
        listStyle: "none",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        // 12px vertical padding, per the spec. The horizontal padding and the
        // matching negative margin exist only so the 400ms tint has room to
        // breathe without indenting the text.
        padding: "12px 8px",
        margin: "0 -8px",
        borderRadius: 8,
        borderBottom: last ? "1px solid transparent" : `1px solid ${PP.edge}`,
        background: flash ? ACCENT_TINT : "transparent",
        transition: reduced ? "none" : "background 220ms ease",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}
          aria-live="polite"
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: INK, ...WRAP }}>{skill.label}</span>
          {/* Identical for 2 and for 47. That is the whole design decision. */}
          {skill.endorsements > 0 ? (
            <span
              style={{ fontSize: 14, color: MUTED, fontVariantNumeric: "tabular-nums" }}
              aria-label={`${skill.endorsements} endorsements`}
            >
              ({count})
            </span>
          ) : null}
          {skill.isTop3 ? <TopSkillPill /> : null}
        </div>

        {line ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <EndorserFaces names={faces} fresh={flash} />
            <span style={{ fontSize: 14, lineHeight: "19px", color: MUTED, ...WRAP }}>{line}</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={press}
        aria-label={`Endorse ${skill.label}`}
        style={{
          flex: "none",
          minHeight: TAP,
          display: "inline-flex",
          alignItems: "center",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          style={{
            height: 30,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "0 12px",
            borderRadius: 100,
            border: `1px solid ${ACCENT_EDGE}`,
            color: PP.accent,
            background: PP.card,
            fontSize: 13.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <PlusGlyph />
          Endorse
        </span>
      </button>
    </li>
  );
}

/* ── The section ───────────────────────────────────────────────────────────── */

export function Skills({
  skills,
  onEndorse,
  justEndorsed,
}: {
  skills: ProfileSkill[];
  onEndorse: (skillId: string) => void;
  /** Skill id to flash. The parent clears it; this component never owns it. */
  justEndorsed?: string | null;
}): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  // Top three first, everything else in the order it was given.
  const ordered = useMemo(
    () => [...skills.filter((s) => s.isTop3), ...skills.filter((s) => !s.isTop3)],
    [skills]
  );

  const collapsible = ordered.length > COLLAPSE_AT;
  const visible = collapsible && !expanded ? ordered.slice(0, COLLAPSE_AT) : ordered;

  return (
    <Card>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 600, color: INK }}>Skills</h2>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {visible.map((skill, i) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            onEndorse={onEndorse}
            flashing={justEndorsed === skill.id}
            last={i === visible.length - 1}
          />
        ))}
      </ul>

      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{
            width: "100%",
            minHeight: TAP,
            marginTop: 4,
            border: "none",
            borderTop: `1px solid ${PP.edge}`,
            background: "transparent",
            color: MUTED,
            fontSize: 14.5,
            fontWeight: 600,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          {expanded ? "Show less" : `Show all ${ordered.length} skills`}
        </button>
      ) : null}
    </Card>
  );
}

export default Skills;
