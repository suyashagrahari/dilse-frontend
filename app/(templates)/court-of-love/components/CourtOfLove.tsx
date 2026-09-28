"use client";

// ─── The Court of Love — the trial ───────────────────────────────────────────
//
//   summons     the oath; the "No" button dodges three times, then gives up
//   session     gavel bang — court is in session
//   hearing ×N  one question per card, read out by the clerk
//   reaction    a GIF "court cam" print + a handwritten line after each answer
//   recess      a cheer before the final question
//   verdict     GUILTY (of being loved) — or a retrial
//   evidence    the Exhibits: the sender's photos as evidence in a case file,
//               each opening to its memory note as sworn testimony
//   judgement   the main letter, sealed in wax, read after one last question
//   certificate the ₹100 stamp paper to keep
//
// The colours come from the chosen courtroom (./themes) as love-kit CSS
// variables; every surface paints with `V.*`.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Share2, Download, FileText, RotateCcw, Loader2, Check, X } from "lucide-react";

import { BrandBadge, LOVE_CSS, LoveSky, LoveThemeContext, ThemeDock } from "../../_love/LoveKit";
import { V, pickTheme, themeVars } from "../../_love/theme";
import CourtGif, { preloadAsset } from "./CourtGif";
import StampPaperCertificate from "./StampPaperCertificate";
import { EvidenceFolder } from "./Exhibits";
import Judgement from "./Judgement";
import { COURT_FONT_VARS } from "./fonts";
import { COURT_THEMES } from "./themes";
import {
  COURT_CSS,
  GavelButton,
  HAND,
  MONO,
  PAPER_RULE,
  Paper,
  PaperGhost,
  Polaroid,
  SANS,
  SERIF,
  STAMP_INK,
  Stamp,
  Typed,
} from "./courtKit";
import { ASSETS, WRONG_REACTIONS, REACTION_SIZE, REACTION_DWELL, type Reaction, reactionFor, encouragementFor } from "./assets";
import { caseNumber, dirFor, isCorrect, PASS_RATIO, type CourtOfLoveData } from "./types";

type Phase = "summons" | "session" | "hearing" | "reaction" | "recess" | "verdict" | "evidence" | "judgement" | "certificate";

/** Shared enter/exit for every screen. */
const screen = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const },
};

/* ── Small pieces ──────────────────────────────────────────────────────────── */

/** Segmented progress — one bar per question, the current one lit. */
function HearingBar({ total, done }: { total: number; done: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`Question ${Math.min(done + 1, total)} of ${total}`}
      style={{ display: "flex", gap: 4, width: "100%" }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 99,
            background: i < done ? V.a1 : i === done ? V.chip : V.edge,
            opacity: i === done ? 1 : i < done ? 0.85 : 1,
            boxShadow: i === done ? `0 0 12px ${V.a1}` : undefined,
            transition: "background-color .3s ease",
          }}
        />
      ))}
    </div>
  );
}

/** One docket line on the summons: LABEL ········ value. */
function DocketRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: MONO, fontSize: 12.5, lineHeight: 1.9 }}>
      <span style={{ color: V.paperSoft, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
      <span aria-hidden style={{ flex: 1, borderBottom: `1.5px dotted ${PAPER_RULE}`, transform: "translateY(-4px)", minWidth: 12 }} />
      <span style={{ color: V.paperInk, fontWeight: 700, textAlign: "right", overflowWrap: "anywhere", minWidth: 0 }}>{value}</span>
    </div>
  );
}

/* ── Screens ───────────────────────────────────────────────────────────────── */

/**
 * The oath screen. The "No" button dodges the pointer — but only three times.
 *
 * A permanently un-clickable button is a cute demo and a terrible experience: on
 * touch devices it reads as a broken page. After three dodges it settles down,
 * becomes tappable, and answers with a joke. It never dodges on keyboard focus.
 */
function SummonsScreen({ data, caseNo, onAccept }: { data: CourtOfLoveData; caseNo: string; onAccept: () => void }) {
  const reduce = useReducedMotion();
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [joke, setJoke] = useState(false);

  const MAX_DODGES = 3;
  const caught = dodges >= MAX_DODGES;

  const dodge = useCallback(() => {
    if (caught || reduce) return;
    setDodges((d) => d + 1);
    // A small box, so the button never lands off-screen on a 360px phone.
    setOffset({ x: (Math.random() - 0.5) * 110, y: -20 - Math.random() * 40 });
  }, [caught, reduce]);

  const accusedName = data.accusedName?.trim();
  const plaintiff = data.plaintiffName?.trim() || "Someone who loves you";
  const questionCount = data.questions.length;
  const toWin = Math.ceil(questionCount * PASS_RATIO);
  const exhibits = data.photos.length;

  return (
    <motion.div key="summons" {...screen} style={{ width: "100%", maxWidth: 460 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Typed color={V.a1} size={11.5}>
          Court of Love · No. {caseNo}
        </Typed>
      </div>

      <Paper tilt={-1} style={{ padding: "20px 20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Typed size={11} color={V.paperSoft}>
            ⚖ Summons
          </Typed>
          <Stamp r={7} size={12} delay={500}>
            urgent 💌
          </Stamp>
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "6px 0 4px" }}>
          <CourtGif src={ASSETS.scales} alt="Two penguins sitting perfectly balanced on the golden scales of justice" size={184} priority />
        </div>

        <h1
          dir="auto"
          style={{
            margin: "0 0 10px",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(31px, 8.6vw, 42px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: V.paperInk,
            textAlign: "center",
            overflowWrap: "anywhere",
          }}
        >
          {data.headline?.trim() || "You have been summoned to The Court of Love"}
        </h1>
        <p style={{ margin: "0 0 14px", fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: V.paperSoft, textAlign: "center" }}>
          {accusedName ? (
            <>
              <strong style={{ color: V.paperInk }}>{accusedName}</strong>, you
            </>
          ) : (
            "You"
          )}{" "}
          stand accused of being loved a concerning amount.
        </p>

        <div style={{ padding: "8px 14px", borderRadius: 12, border: `1px solid ${PAPER_RULE}`, background: "color-mix(in srgb, var(--lv-paper-ink) 3%, transparent)" }}>
          <DocketRow label="Filed by" value={plaintiff} />
          <DocketRow label="Hearings" value={`${questionCount} question${questionCount === 1 ? "" : "s"}`} />
          <DocketRow label="To win" value={`${toWin} right`} />
          {exhibits > 0 && <DocketRow label="Evidence" value={`${exhibits} exhibit${exhibits === 1 ? "" : "s"} 📸`} />}
        </div>

        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, border: `1.5px dashed color-mix(in srgb, var(--lv-a1) 45%, ${PAPER_RULE})` }}>
          <Typed size={10} color={STAMP_INK}>
            The oath
          </Typed>
          <p dir="auto" style={{ margin: "6px 0 0", fontFamily: SERIF, fontSize: 19, lineHeight: 1.3, color: V.paperInk }}>
            {data.oathText?.trim() || "Do you swear to answer every question with your whole heart?"}
          </p>
        </div>
      </Paper>

      {/* Oath buttons */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginTop: 24, minHeight: 64 }}>
        <motion.div
          animate={reduce ? {} : { scale: [1, 1.035 + dodges * 0.03, 1] }}
          transition={reduce ? {} : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <GavelButton onClick={onAccept} full={false} style={{ padding: "15px 28px" }}>
            Yes, I swear ✋
          </GavelButton>
        </motion.div>

        <motion.button
          type="button"
          onMouseEnter={dodge}
          onTouchStart={dodge}
          onClick={() => (caught ? setJoke(true) : dodge())}
          animate={{ x: offset.x, y: offset.y, scale: caught ? 1 : Math.max(0.6, 1 - dodges * 0.13) }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="lv-focus"
          style={{
            padding: "13px 22px",
            borderRadius: 999,
            background: "transparent",
            color: V.ink,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 15,
            border: `1.5px solid ${V.edge}`,
            cursor: "pointer",
            minHeight: 50,
          }}
        >
          No
        </motion.button>
      </div>

      <AnimatePresence>
        {joke && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center", marginTop: 6 }}>
            <p style={{ fontFamily: HAND, fontSize: 24, color: V.ink, margin: "0 0 10px" }}>Objection overruled 😏 you&apos;re already here.</p>
            <GavelButton onClick={onAccept} full={false}>
              Fine, let&apos;s go ⚖️
            </GavelButton>
          </motion.div>
        )}
      </AnimatePresence>

      {!joke && (
        <p style={{ fontFamily: HAND, fontSize: 19, color: V.soft, textAlign: "center", margin: "6px 0 0" }}>
          {caught ? "…the No button gave up." : "good luck clicking No."}
        </p>
      )}
    </motion.div>
  );
}

/** Gavel bang — "court is now in session". Auto-advances. */
function SessionScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 900 : 2600);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div key="session" {...screen} style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div
          className="col-thud"
          style={{ width: 240, height: 240, borderRadius: "50%", background: V.paper, border: `6px solid ${V.chip}`, boxShadow: `0 30px 60px -26px ${V.shadow}`, display: "grid", placeItems: "center", overflow: "hidden", animationDelay: ".5s" }}
        >
          <CourtGif src={ASSETS.gavel} alt="A penguin judge banging a gavel at the podium" size={210} priority />
        </div>
        <span className="col-bang" style={{ position: "absolute", right: -18, top: 6, animationDelay: ".45s" }}>
          <span style={{ display: "inline-block", padding: "6px 12px", background: V.chip, color: V.chipInk, fontFamily: SANS, fontWeight: 900, fontSize: 20, letterSpacing: "0.04em", borderRadius: 10, boxShadow: `0 10px 24px -10px ${V.shadow}` }}>BANG!</span>
        </span>
      </div>
      <h2 style={{ margin: "22px 0 6px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(34px, 9vw, 48px)", lineHeight: 1, color: V.ink }}>Order! Order!</h2>
      <p style={{ margin: 0, fontFamily: SANS, fontWeight: 700, fontSize: 16, color: V.ink }}>Court is now in session.</p>
      <p style={{ margin: "4px 0 0", fontFamily: HAND, fontSize: 23, color: V.soft }}>all rise… okay, you can stay seated</p>
    </motion.div>
  );
}

/** One question and its four answers. */
function HearingScreen({
  index,
  total,
  exhibit,
  question,
  options,
  onAnswer,
}: {
  index: number;
  total: number;
  exhibit: string;
  question: string;
  options: string[];
  onAnswer: (chosen: number) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  // Lock on the first tap (a double-tap must not skip a hearing), show the
  // pick for a beat, then move on.
  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    window.setTimeout(() => onAnswer(i), 380);
  };

  return (
    <motion.div
      key={`hearing-${index}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      style={{ width: "100%", maxWidth: 480 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <Typed color={V.ink} size={11.5}>
          Hearing {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Typed>
        <Typed color={V.soft} size={11}>
          {exhibit || "The Court asks"}
        </Typed>
      </div>
      <div style={{ marginBottom: 18 }}>
        <HearingBar total={total} done={index} />
      </div>

      <Paper tilt={index % 2 === 0 ? -0.8 : 0.8} style={{ padding: "18px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          {/* The clerk GIF has an opaque backdrop — clip it into a round avatar. */}
          <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: "50%", overflow: "hidden", border: `2px solid ${V.chip}`, lineHeight: 0 }}>
            <CourtGif src={ASSETS.clerk} alt="" size={50} />
          </div>
          <div style={{ minWidth: 0 }}>
            <Typed size={10} color={STAMP_INK}>
              The clerk reads
            </Typed>
            <p style={{ margin: "1px 0 0", fontFamily: HAND, fontSize: 19, lineHeight: 1, color: V.paperSoft }}>question {index + 1}, your honour —</p>
          </div>
        </div>

        <h2 dir="auto" style={{ margin: "0 0 16px", fontFamily: SANS, fontSize: 21, lineHeight: 1.28, fontWeight: 800, letterSpacing: "-0.02em", color: V.paperInk, overflowWrap: "anywhere" }}>
          {question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {options.map((opt, i) => {
            const on = picked === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={picked !== null}
                className="col-opt lv-focus"
                dir="auto"
                style={{
                  width: "100%",
                  textAlign: "start",
                  padding: "13px 14px",
                  borderRadius: 16,
                  background: on ? V.chip : "color-mix(in srgb, var(--lv-paper-ink) 4%, var(--lv-paper))",
                  border: `1.5px solid ${on ? V.chip : PAPER_RULE}`,
                  fontFamily: SANS,
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: on ? V.chipInk : V.paperInk,
                  cursor: picked !== null ? "default" : "pointer",
                  opacity: picked !== null && !on ? 0.55 : 1,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                  minHeight: 52,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: on ? "rgba(255,255,255,.25)" : V.paper,
                    border: `1.5px solid ${on ? "transparent" : PAPER_RULE}`,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: on ? V.chipInk : STAMP_INK,
                  }}
                >
                  {on ? "✓" : String.fromCharCode(65 + i)}
                </span>
                <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{opt}</span>
              </button>
            );
          })}
        </div>
      </Paper>
    </motion.div>
  );
}

/** A ring that drains over the dwell time with the seconds remaining inside it. */
function DwellCountdown({ ms, label }: { ms: number; label: string }) {
  const reduce = useReducedMotion();
  const [left, setLeft] = useState(() => Math.ceil(ms / 1000));

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ position: "relative", width: 26, height: 26, flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="13" cy="13" r="11.4" fill="none" stroke={V.edge} strokeWidth="2.2" />
          {!reduce && (
            <motion.circle
              cx="13"
              cy="13"
              r="11.4"
              fill="none"
              stroke={V.a1}
              strokeWidth="2.2"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 0 }}
              transition={{ duration: ms / 1000, ease: "linear" }}
              style={{ rotate: -90, transformOrigin: "center" }}
            />
          )}
        </svg>
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: V.ink }}>
          {left}
        </span>
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11.5, color: V.soft, letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

/**
 * The reaction between questions — the GIF as a taped "court cam" print, plus
 * a handwritten line. Framing it in paper means a GIF with an opaque backdrop
 * reads as a photo print, not a stray rectangle, on every theme.
 */
function ReactionScreen({
  reaction,
  kind,
  note,
  slot,
  onContinue,
  continueLabel,
}: {
  reaction: Reaction;
  kind: "correct" | "wrong" | "recess";
  note: string;
  slot: string;
  onContinue: () => void;
  continueLabel: string;
}) {
  const dwell = reaction.dwell ?? REACTION_DWELL;

  // Plain words on the stamp: "Correct" and "Not quite" are the only two terms
  // here that carry information, so they are never swapped for legalese.
  const stamp = kind === "correct" ? "✓ correct" : kind === "wrong" ? "✗ not quite" : "⏸ quick recess";
  const caption = kind === "correct" ? "the court is pleased" : kind === "wrong" ? "the court forgives you" : "one to go…";

  useEffect(() => {
    const t = window.setTimeout(onContinue, dwell);
    return () => window.clearTimeout(t);
  }, [onContinue, dwell]);

  return (
    <motion.div
      key={`reaction-${slot}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      onClick={onContinue}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onContinue();
      }}
      aria-label={`${stamp}. ${note} Activate to continue.`}
      style={{ width: "100%", maxWidth: 420, textAlign: "center", cursor: "pointer" }}
    >
      <div style={{ position: "relative", display: "inline-block", width: Math.min((reaction.size ?? REACTION_SIZE) + 20, 300), maxWidth: "100%" }}>
        <Polaroid tilt={kind === "wrong" ? 2 : -2} caption={caption}>
          <CourtGif src={reaction.src} alt={reaction.alt} size={reaction.size ?? REACTION_SIZE} priority />
        </Polaroid>
        <span style={{ position: "absolute", left: -10, bottom: 44, zIndex: 3 }}>
          <Stamp r={-9} size={16} style={{ background: "color-mix(in srgb, var(--lv-paper) 88%, transparent)" }}>
            {stamp}
          </Stamp>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContinue();
          }}
          aria-label="Close and continue"
          className="lv-focus"
          style={{ position: "absolute", top: -12, right: -12, zIndex: 4, width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center", background: V.paper, border: `1px solid ${PAPER_RULE}`, color: V.paperInk, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,.18)" }}
        >
          <X size={16} />
        </button>
      </div>

      <p dir="auto" style={{ fontFamily: HAND, fontSize: 27, lineHeight: 1.2, color: V.ink, margin: "22px auto 0", maxWidth: 360 }}>
        {note}
      </p>

      <div style={{ marginTop: 16 }}>
        <DwellCountdown ms={dwell} label={`tap to ${continueLabel} →`} />
      </div>
    </motion.div>
  );
}

/** The verdict — guilty (of being loved), or a retrial. */
function VerdictScreen({
  passed,
  score,
  total,
  nextLabel,
  onNext,
  onRetry,
}: {
  passed: boolean;
  score: number;
  total: number;
  nextLabel: string;
  onNext: () => void;
  onRetry: () => void;
}) {
  // The verdict clip spends its first seconds drawing out "THE COURT HAS DECIDED
  // I LOVE YOU MORE / THERE WILL BE NO APPEALS", so the CTA waits for it — the
  // clip loops either way, so this delays the button, it never traps anyone.
  const [ctaReady, setCtaReady] = useState(!passed);
  useEffect(() => {
    if (ctaReady) return;
    const t = window.setTimeout(() => setCtaReady(true), 7000);
    return () => window.clearTimeout(t);
  }, [ctaReady]);

  return (
    <motion.div key={`verdict-${passed}`} {...screen} style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
      <div aria-live="polite" style={{ marginBottom: 14 }}>
        <Typed color={V.a1} size={11.5}>
          The verdict · {score}/{total}
        </Typed>
      </div>

      {passed ? (
        <>
          <div style={{ position: "relative" }}>
            <Paper tilt={-1} style={{ padding: 10, overflow: "hidden" }}>
              <div style={{ borderRadius: 10, overflow: "hidden", lineHeight: 0, background: "#fff" }}>
                <CourtGif src={ASSETS.verdict} alt="A cartoon cat judge banging a gavel beside the words: the court has decided I love you more" size={420} priority />
              </div>
            </Paper>
            <span style={{ position: "absolute", right: -6, top: -18, zIndex: 2 }}>
              <Stamp r={9} size={28} delay={900} style={{ background: "color-mix(in srgb, var(--lv-paper) 90%, transparent)" }}>
                guilty
              </Stamp>
            </span>
          </div>
          <h2 style={{ margin: "26px 0 6px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(32px, 8.6vw, 46px)", lineHeight: 1, color: V.ink }}>
            Guilty… of being loved.
          </h2>
          <p style={{ margin: "0 0 22px", fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: V.soft }}>
            Beyond all reasonable doubt. {score === total ? "A perfect score — suspicious, honestly." : "The Court is satisfied."}
          </p>
          <div style={{ minHeight: 56 }}>
            <AnimatePresence mode="wait">
              {ctaReady ? (
                <motion.div key="cta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <GavelButton onClick={onNext} glow>
                    {nextLabel}
                  </GavelButton>
                </motion.div>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontFamily: HAND, fontSize: 23, color: V.soft, margin: 0 }}>
                  the Court is still speaking…
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "relative", width: 260, maxWidth: "100%", margin: "0 auto" }}>
            <Polaroid tilt={2} caption="it's okay, come here">
              <CourtGif src={WRONG_REACTIONS[0].src} alt={WRONG_REACTIONS[0].alt} size={WRONG_REACTIONS[0].size ?? REACTION_SIZE} priority />
            </Polaroid>
            <span style={{ position: "absolute", left: -8, top: 18, zIndex: 3 }}>
              <Stamp r={-10} size={18} style={{ background: "color-mix(in srgb, var(--lv-paper) 88%, transparent)" }}>
                retrial
              </Stamp>
            </span>
          </div>
          <h2 style={{ margin: "22px 0 6px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(30px, 8vw, 42px)", lineHeight: 1, color: V.ink }}>Retrial granted</h2>
          <p style={{ fontFamily: HAND, fontSize: 24, color: V.ink, margin: "0 0 8px" }}>insufficient evidence… but this Court believes in second chances</p>
          <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: V.soft, margin: "0 0 20px" }}>
            You scored {score} of {total}. You need {Math.ceil(total * PASS_RATIO)} to win the case.
          </p>
          <GavelButton onClick={onRetry}>
            <RotateCcw size={16} /> Appeal the verdict
          </GavelButton>
        </>
      )}
    </motion.div>
  );
}

/* ── The experience ────────────────────────────────────────────────────────── */

export default function CourtOfLove({
  data,
  mode,
  shareId,
  onThemeChange,
}: {
  data: CourtOfLoveData;
  /** "preview" = inside the editor; "live" = the recipient's published page. */
  mode: "preview" | "live";
  shareId?: string;
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const theme = pickTheme(COURT_THEMES, data.theme);
  const questions = useMemo(() => data.questions ?? [], [data.questions]);
  const total = questions.length;
  const photos = useMemo(() => data.photos ?? [], [data.photos]);
  const gifs = data.gifs ?? [];
  const hasLetter = Boolean(data.letter?.trim());
  const plaintiff = data.plaintiffName?.trim() || "The Plaintiff";
  const accused = data.accusedName?.trim() || "You";

  const [phase, setPhase] = useState<Phase>("summons");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastNote, setLastNote] = useState("");

  const certRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "share" | "png" | "pdf">(null);
  const [flash, setFlash] = useState("");

  const caseNo = useMemo(() => caseNumber(shareId), [shareId]);
  const dateStr = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), []);

  const passed = total > 0 && score / total >= PASS_RATIO;

  // After the verdict: evidence (if any photos) → judgement (if a letter) → certificate.
  const afterVerdict: Phase = photos.length ? "evidence" : hasLetter ? "judgement" : "certificate";
  const afterEvidence: Phase = hasLetter ? "judgement" : "certificate";
  const labelFor = (p: Phase) => (p === "evidence" ? "Review the evidence 📁" : p === "judgement" ? "Hear the final judgement ⚖️" : "Collect your stamp paper 📜");

  // Every phase change starts at the top of the page — a long screen (the
  // evidence folder, the judgement) must never open scrolled halfway down.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [phase, reduce]);

  // Warm the next screen's animation one step ahead.
  useEffect(() => {
    if (phase === "summons") {
      preloadAsset(ASSETS.gavel);
    } else if (phase === "session") {
      preloadAsset(ASSETS.clerk);
    } else if (phase === "hearing") {
      preloadAsset(reactionFor(true, index).src);
      preloadAsset(reactionFor(false, index).src);
      if (index + 2 === total && total >= 3) preloadAsset(encouragementFor(score, index + 1).src);
      if (index === total - 1) preloadAsset(ASSETS.verdict);
    } else if (phase === "verdict" && passed) {
      photos.slice(0, 4).forEach((p) => preloadAsset(p.url));
      preloadAsset(ASSETS.win);
    }
  }, [phase, index, total, passed, score, photos]);

  const answer = useCallback(
    (chosen: number) => {
      const q = questions[index];
      if (!q) return;
      const right = isCorrect(q, chosen);
      if (right) setScore((s) => s + 1);
      setLastCorrect(right);
      setLastNote((right ? q.correctNote : q.wrongNote) || (right ? "The Court agrees." : "Noted for the record."));
      setPhase("reaction");
    },
    [index, questions],
  );

  const afterReaction = useCallback(() => {
    if (index + 1 >= total) {
      setPhase("verdict");
      return;
    }
    if (index + 2 === total && total >= 3) {
      setPhase("recess");
      return;
    }
    setIndex((i) => i + 1);
    setPhase("hearing");
  }, [index, total]);

  const afterRecess = useCallback(() => {
    setIndex((i) => i + 1);
    setPhase("hearing");
  }, []);

  const retry = useCallback(() => {
    setIndex(0);
    setScore(0);
    setPhase("hearing");
  }, []);

  const replay = useCallback(() => {
    setIndex(0);
    setScore(0);
    setPhase("summons");
  }, []);

  // Confetti for the winning verdict, and again when the certificate lands.
  useEffect(() => {
    if (reduce) return;
    if (!(phase === "verdict" && passed) && phase !== "certificate") return;
    let cancelled = false;
    const c = theme.colors;
    (async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        if (cancelled) return;
        const shoot = (x: number) =>
          confetti({ particleCount: 46, spread: 74, startVelocity: 42, origin: { x, y: 0.62 }, colors: [c.a1, c.a2, c.a3, c.chip, "#FFFFFF"], disableForReducedMotion: true });
        shoot(0.22);
        window.setTimeout(() => !cancelled && shoot(0.78), 220);
        window.setTimeout(() => !cancelled && shoot(0.5), 440);
      } catch {
        // Decorative; a chunk-load failure must not break the verdict.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, passed, reduce, theme]);

  const say = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(""), 2600);
  }, []);

  const doShare = useCallback(async () => {
    if (!certRef.current) return;
    setBusy("share");
    try {
      const { shareCertificatePng } = await import("./certificateExport");
      const result = await shareCertificatePng(certRef.current, caseNo, mode === "live" && shareId ? window.location.href : null);
      if (result === "downloaded") say("Sharing isn't available here — saved the image instead 📥");
      else if (result === "shared") say("Shared! 💗");
    } catch {
      say("Couldn't build the image. Try the download instead.");
    } finally {
      setBusy(null);
    }
  }, [caseNo, mode, shareId, say]);

  const doPng = useCallback(async () => {
    if (!certRef.current) return;
    setBusy("png");
    try {
      const { downloadCertificatePng } = await import("./certificateExport");
      await downloadCertificatePng(certRef.current, caseNo);
      say("Saved as PNG 📥");
    } catch {
      say("Couldn't save the image. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [caseNo, say]);

  const doPdf = useCallback(async () => {
    if (!certRef.current) return;
    setBusy("pdf");
    try {
      const { downloadCertificatePdf } = await import("./certificateExport");
      await downloadCertificatePdf(certRef.current, caseNo);
      say("Certified copy saved 📄");
    } catch {
      say("Couldn't build the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [caseNo, say]);

  const wide = phase === "evidence";

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        // `lang` lets the browser pick correct fonts and pronunciation for a case
        // written in any language; `dir` flips the layout for Urdu/Arabic/Hebrew.
        lang={data.language || "en"}
        dir={dirFor(data.language)}
        className={`${COURT_FONT_VARS} lv-root`}
        style={{
          ...themeVars(theme),
          minHeight: "100dvh",
          position: "relative",
          isolation: "isolate",
          overflowX: "clip",
          background: theme.colors.base,
          fontFamily: SANS,
          color: V.ink,
        }}
      >
        <style>{LOVE_CSS + COURT_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduce} />
        {mode === "live" && <BrandBadge />}
        {mode === "preview" && onThemeChange && <ThemeDock themes={COURT_THEMES} value={theme.id} onChange={onThemeChange} />}

        {total === 0 ? (
          <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
            <p style={{ fontFamily: SANS, color: V.soft, textAlign: "center" }}>This case file has no questions yet.</p>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              minHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: wide || phase === "judgement" || phase === "certificate" ? "flex-start" : "center",
              // Clears the editor's floating top bar and the live page's brand badge.
              padding: "calc(env(safe-area-inset-top, 0px) + 78px) 16px calc(env(safe-area-inset-bottom, 0px) + 44px)",
            }}
          >
            <AnimatePresence mode="wait">
              {phase === "summons" && <SummonsScreen key="summons" data={data} caseNo={caseNo} onAccept={() => setPhase("session")} />}

              {phase === "session" && <SessionScreen key="session" onDone={() => setPhase("hearing")} />}

              {phase === "hearing" && questions[index] && (
                <HearingScreen
                  key={`hearing-${index}`}
                  index={index}
                  total={total}
                  exhibit={questions[index].exhibit}
                  question={questions[index].question}
                  options={questions[index].options}
                  onAnswer={answer}
                />
              )}

              {phase === "reaction" && (
                <ReactionScreen
                  key={`reaction-h${index}`}
                  reaction={reactionFor(lastCorrect, index)}
                  kind={lastCorrect ? "correct" : "wrong"}
                  note={lastNote}
                  slot={`h${index}-${lastCorrect ? "y" : "n"}`}
                  onContinue={afterReaction}
                  continueLabel={index + 1 >= total ? "hear the verdict" : "continue"}
                />
              )}

              {phase === "recess" && (
                <ReactionScreen
                  key="recess"
                  reaction={encouragementFor(score, index + 1)}
                  kind="recess"
                  note="One question left. You've got this."
                  slot="recess"
                  onContinue={afterRecess}
                  continueLabel="face the final question"
                />
              )}

              {phase === "verdict" && (
                <VerdictScreen
                  key={`verdict-${passed}`}
                  passed={passed}
                  score={score}
                  total={total}
                  nextLabel={labelFor(afterVerdict)}
                  onNext={() => setPhase(afterVerdict)}
                  onRetry={retry}
                />
              )}

              {phase === "evidence" && (
                <motion.div key="evidence" {...screen} style={{ width: "100%", maxWidth: 980 }}>
                  <EvidenceFolder
                    photos={photos}
                    plaintiff={plaintiff}
                    accused={accused}
                    gif={gifs[0]}
                    onDone={() => setPhase(afterEvidence)}
                    doneLabel={labelFor(afterEvidence)}
                  />
                </motion.div>
              )}

              {phase === "judgement" && (
                <motion.div key="judgement" {...screen} style={{ width: "100%", maxWidth: 520 }}>
                  <Judgement
                    letter={data.letter}
                    plaintiff={plaintiff}
                    accused={accused}
                    signature={data.signatureName?.trim() || data.plaintiffName?.trim() || "yours, always"}
                    caseNo={caseNo}
                    question={data.lockQuestion}
                    answer={data.lockAnswer}
                    sealGif={gifs[1] ?? gifs[0]}
                    stampGif={gifs[2]}
                    reduceMotion={reduce}
                    onDone={() => setPhase("certificate")}
                    doneLabel={labelFor("certificate")}
                  />
                </motion.div>
              )}

              {phase === "certificate" && (
                <motion.div key="certificate" {...screen} style={{ width: "100%", maxWidth: 480 }}>
                  <div style={{ textAlign: "center", marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 112 }}>
                        <Polaroid tilt={-5} tape={false} caption="champ 🏅">
                          <CourtGif src={ASSETS.win} alt="A penguin on the winner's podium wearing a gold medal" size={92} priority />
                        </Polaroid>
                      </div>
                      <Stamp r={8} size={17} color={V.a1}>
                        case closed 💅
                      </Stamp>
                    </div>
                    <h2 style={{ margin: "4px 0 2px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(32px, 8.6vw, 44px)", lineHeight: 1, color: V.ink }}>You won the case</h2>
                    <p style={{ fontFamily: HAND, fontSize: 23, color: V.soft, margin: 0 }}>duly signed, sealed &amp; stamped</p>
                  </div>

                  <StampPaperCertificate ref={certRef} data={data} score={score} total={total} caseNo={caseNo} dateStr={dateStr} />

                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <GavelButton onClick={doShare} disabled={busy !== null}>
                      {busy === "share" ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                      {busy === "share" ? "Preparing…" : "Share your award"}
                    </GavelButton>

                    <div style={{ display: "flex", gap: 10 }}>
                      {[
                        { key: "png" as const, icon: <Download size={15} />, label: "Save PNG", onClick: doPng },
                        { key: "pdf" as const, icon: <FileText size={15} />, label: "Save PDF", onClick: doPdf },
                      ].map((b) => (
                        <PaperGhost key={b.key} onClick={b.onClick} disabled={busy !== null}>
                          {busy === b.key ? <Loader2 size={15} className="animate-spin" /> : b.icon}
                          {b.label}
                        </PaperGhost>
                      ))}
                    </div>
                    <button type="button" onClick={replay} className="lv-focus" style={{ margin: "6px auto 0", background: "none", border: "none", color: V.soft, fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.06em", cursor: "pointer", padding: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <RotateCcw size={13} /> replay the trial
                    </button>
                  </div>

                  {mode === "live" && (
                    <div style={{ textAlign: "center", marginTop: 14 }}>
                      <Link href="/court-of-love" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: V.ink, textDecoration: "none", borderBottom: `1.5px solid ${V.a1}`, paddingBottom: 2 }}>
                        Put someone you love on trial →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* status flash — centred with a wrapper, because framer-motion owns the
            inner element's transform and would drop a translateX(-50%). */}
        <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)", zIndex: 200, display: "flex", justifyContent: "center", pointerEvents: "none", padding: "0 16px" }}>
          <AnimatePresence>
            {flash && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                role="status"
                aria-live="polite"
                style={{ padding: "11px 18px", borderRadius: 999, background: V.paper, color: V.paperInk, border: `1px solid ${PAPER_RULE}`, boxShadow: "0 12px 30px rgba(0,0,0,.2)", fontFamily: SANS, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, maxWidth: "100%" }}
              >
                <Check size={14} style={{ color: STAMP_INK, flexShrink: 0 }} />
                {flash}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LoveThemeContext.Provider>
  );
}
