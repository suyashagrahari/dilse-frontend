"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Gavel, Share2, Download, FileText, RotateCcw, Loader2, Check } from "lucide-react";

import CourtGif, { preloadAsset } from "./CourtGif";
import StampPaperCertificate from "./StampPaperCertificate";
import {
  ASSETS,
  WRONG_REACTIONS,
  REACTION_SIZE,
  type Reaction,
  reactionFor,
  encouragementFor,
} from "./assets";
import { caseNumber, isCorrect, PASS_RATIO, type CourtOfLoveData } from "./types";

/* ── SubhSandesh theme tokens (see the subhsandesh-theme skill) ────────────── */
const BG = "#FAFAF7";
const SURFACE = "#FFFFFF";
const TEXT = "#0E0E12";
const MUTED = "#5B5B66";
const BORDER = "#ECEAE3";
const INDIGO = "#6C5CE7";
const PINK = "#F72585";
const LIME = "#C6FF3D";
const GREEN = "#3AA76D";

const HEAD = "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";
const BODY = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const SCRIPT = "var(--font-caveat), ui-rounded, cursive";

const CARD_SHADOW = "0 8px 24px rgba(14,14,18,.06)";

type Phase =
  | "summons"
  | "session"
  | "hearing"
  | "reaction"
  /** A cheer-them-on beat before the final cross-examination. */
  | "recess"
  | "verdict"
  | "letter"
  | "certificate";

/* ── Small shared pieces ───────────────────────────────────────────────────── */

/** Soft corner glows that give the cream canvas depth. */
function CanvasGlow() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        backgroundImage: `
          radial-gradient(60% 44% at 6% 2%, rgba(108,92,231,.16), transparent 62%),
          radial-gradient(52% 40% at 96% 8%, rgba(247,37,133,.13), transparent 60%),
          radial-gradient(60% 44% at 50% 104%, rgba(198,255,61,.20), transparent 62%)
        `,
      }}
    />
  );
}

/** The recipient's route to making their own — required on every live viewer. */
function BrandBadge() {
  return (
    <Link
      href="/templates"
      aria-label="Create your own on SubhSandesh"
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 10px)",
        right: 12,
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px 6px 7px",
        borderRadius: 999,
        background: "rgba(255,255,255,.86)",
        border: `1px solid ${BORDER}`,
        boxShadow: CARD_SHADOW,
        backdropFilter: "blur(14px)",
        textDecoration: "none",
      }}
    >
      <Image src="/logo.webp" alt="" width={20} height={20} style={{ borderRadius: 6 }} />
      <span style={{ fontFamily: HEAD, fontSize: 12, fontWeight: 700, color: TEXT, letterSpacing: -0.1 }}>
        SubhSandesh
      </span>
    </Link>
  );
}

/** Five gavels — one per hearing, filled as the trial proceeds. */
function ProgressPips({ total, done }: { total: number; done: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label={`Hearing ${Math.min(done + 1, total)} of ${total}`}
      style={{ display: "flex", gap: 7, justifyContent: "center", alignItems: "center" }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={{ scale: i === done ? 1.18 : 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          style={{
            width: i === done ? 22 : 9,
            height: 9,
            borderRadius: 999,
            background: i < done ? INDIGO : i === done ? PINK : "#E2DFF6",
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}

/** A tilted white sticker card — the template's primary surface. */
function StickerCard({
  children,
  tilt = -1.2,
  className = "",
  style,
  onClick,
}: {
  children: React.ReactNode;
  tilt?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 28,
        boxShadow: CARD_SHADOW,
        transform: `rotate(${tilt}deg)`,
        padding: "22px 18px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function LimeButton({
  children,
  onClick,
  disabled,
  full = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: full ? "100%" : undefined,
        padding: "14px 22px",
        borderRadius: 999,
        background: LIME,
        color: TEXT,
        fontFamily: HEAD,
        fontWeight: 700,
        fontSize: 15,
        border: "none",
        boxShadow: "0 6px 18px rgba(198,255,61,.42)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 48,
      }}
    >
      {children}
    </motion.button>
  );
}

/* ── Typewriter ────────────────────────────────────────────────────────────── */

function useTypewriter(text: string, active: boolean, speed = 26, forceComplete = false) {
  const reduce = useReducedMotion();
  // Anyone who asked for less motion gets the whole letter at once — a
  // character-by-character reveal is exactly what they opted out of. Same for
  // anyone who taps to skip ahead.
  const instant = reduce || !active || forceComplete;

  // Text and progress live in one state object so switching text resets the
  // count in the same update, with no synchronous setState inside the effect.
  const [progress, setProgress] = useState<{ text: string; count: number }>({ text, count: 0 });
  const timerRef = useRef<number | null>(null);

  const count = progress.text === text ? progress.count : 0;
  const done = instant || count >= text.length;

  useEffect(() => {
    if (instant) return;
    const timer = window.setInterval(() => {
      setProgress((p) => {
        if (p.text !== text) return { text, count: 1 };
        // Same reference once complete → React bails out instead of re-rendering.
        if (p.count >= text.length) return p;
        return { text, count: p.count + 1 };
      });
    }, speed);
    timerRef.current = timer;
    return () => window.clearInterval(timer);
  }, [text, speed, instant]);

  // Stop ticking the moment the letter is fully revealed.
  useEffect(() => {
    if (done && timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [done]);

  return { shown: instant ? (active ? text : "") : text.slice(0, count), done };
}

/* ── Screens ───────────────────────────────────────────────────────────────── */

/**
 * The oath screen. The "No" button dodges the pointer — but only three times.
 *
 * A permanently un-clickable button is a cute demo and a terrible experience: on
 * touch devices it reads as a broken page, and it traps anyone who genuinely
 * wants to back out. After three dodges it settles down, becomes tappable, and
 * answers with a joke. It also never dodges on keyboard focus, so tab-and-enter
 * always works.
 */
function SummonsScreen({
  data,
  caseNo,
  onAccept,
}: {
  data: CourtOfLoveData;
  caseNo: string;
  onAccept: () => void;
}) {
  const reduce = useReducedMotion();
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [joke, setJoke] = useState(false);

  const MAX_DODGES = 3;
  const caught = dodges >= MAX_DODGES;

  const dodge = useCallback(() => {
    if (caught || reduce) return;
    setDodges((d) => d + 1);
    // Keep the jump inside a small box so the button never lands off-screen.
    setOffset({ x: (Math.random() - 0.5) * 130, y: (Math.random() - 0.5) * 70 });
  }, [caught, reduce]);

  const accused = data.accusedName?.trim() || "You";

  return (
    <motion.div
      key="summons"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.42 }}
      style={{ width: "100%", maxWidth: 440 }}
    >
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 13px",
            borderRadius: 999,
            background: "rgba(108,92,231,.10)",
            border: `1px solid rgba(108,92,231,.22)`,
            fontFamily: BODY,
            fontSize: 11,
            fontWeight: 600,
            color: INDIGO,
            letterSpacing: 0.3,
          }}
        >
          <Gavel size={12} /> CASE NO. {caseNo}
        </div>
      </div>

      <StickerCard tilt={-1.4}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <CourtGif
            src={ASSETS.scales}
            alt="Two penguins sitting perfectly balanced on the golden scales of justice"
            size={200}
            priority
          />
        </div>

        <p
          style={{
            fontFamily: SCRIPT,
            fontSize: 21,
            color: PINK,
            textAlign: "center",
            margin: "0 0 8px",
            lineHeight: 1.15,
          }}
        >
          before this Court, all lovers are equal
        </p>

        <h1
          style={{
            fontFamily: HEAD,
            fontSize: 25,
            lineHeight: 1.2,
            fontWeight: 700,
            color: TEXT,
            textAlign: "center",
            margin: "0 0 10px",
            letterSpacing: -0.5,
          }}
        >
          {data.headline?.trim() || "You have been summoned to The Court of Love"}
        </h1>

        <p
          style={{
            fontFamily: BODY,
            fontSize: 14,
            lineHeight: 1.62,
            color: MUTED,
            textAlign: "center",
            margin: "0 0 4px",
          }}
        >
          <strong style={{ color: TEXT }}>{accused}</strong>, you stand accused of being
          loved a great deal. Five hearings. Answer honestly.
        </p>

        <div
          style={{
            marginTop: 16,
            padding: "13px 15px",
            borderRadius: 20,
            background: "#F3F1EA",
            border: `1px solid ${BORDER}`,
          }}
        >
          <p style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6, color: TEXT, margin: 0 }}>
            {data.oathText?.trim() ||
              "Do you swear to answer every question with your whole heart?"}
          </p>
        </div>
      </StickerCard>

      {/* Oath buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 22,
          minHeight: 96,
        }}
      >
        <motion.button
          onClick={onAccept}
          whileTap={{ scale: 0.96 }}
          animate={reduce ? {} : { scale: [1, 1 + dodges * 0.05 + 0.04, 1] }}
          transition={reduce ? {} : { duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            padding: "15px 26px",
            borderRadius: 999,
            background: LIME,
            color: TEXT,
            fontFamily: HEAD,
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            boxShadow: "0 8px 22px rgba(198,255,61,.5)",
            cursor: "pointer",
            minHeight: 50,
          }}
        >
          Yes, I swear 🫱
        </motion.button>

        <motion.button
          onMouseEnter={dodge}
          onTouchStart={dodge}
          onClick={() => (caught ? setJoke(true) : dodge())}
          animate={{ x: offset.x, y: offset.y, scale: caught ? 1 : Math.max(0.5, 1 - dodges * 0.16) }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          style={{
            padding: "13px 20px",
            borderRadius: 999,
            background: SURFACE,
            color: MUTED,
            fontFamily: HEAD,
            fontWeight: 600,
            fontSize: 14,
            border: `1px solid ${BORDER}`,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          No
        </motion.button>
      </div>

      <AnimatePresence>
        {joke && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: "center", marginTop: 4 }}
          >
            <p style={{ fontFamily: SCRIPT, fontSize: 20, color: INDIGO, margin: "0 0 10px" }}>
              Objection overruled 😏 you&apos;re already here.
            </p>
            <LimeButton onClick={onAccept} full={false}>
              Fine, let&apos;s go ⚖️
            </LimeButton>
          </motion.div>
        )}
      </AnimatePresence>

      {!joke && (
        <p
          style={{
            fontFamily: BODY,
            fontSize: 11.5,
            color: MUTED,
            textAlign: "center",
            marginTop: 10,
            opacity: 0.75,
          }}
        >
          {caught ? "…the No button gave up." : "Good luck clicking No."}
        </p>
      )}
    </motion.div>
  );
}

/** Gavel bang — "court is now in session". Auto-advances. */
function SessionScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(onDone, reduce ? 900 : 2400);
    return () => window.clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <motion.div
      key="session"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: [0, -7, 7, -4, 4, 0] }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.6 }}
      style={{ width: "100%", maxWidth: 400, textAlign: "center" }}
    >
      <CourtGif
        src={ASSETS.gavel}
        alt="A penguin judge banging a gavel at the podium"
        size={250}
        priority
      />
      <h2
        style={{
          fontFamily: HEAD,
          fontSize: 27,
          fontWeight: 700,
          color: TEXT,
          margin: "12px 0 6px",
          letterSpacing: -0.6,
        }}
      >
        Court is now in session
      </h2>
      <p style={{ fontFamily: SCRIPT, fontSize: 22, color: PINK, margin: 0 }}>
        all rise… okay, you can stay seated
      </p>
    </motion.div>
  );
}

/** One hearing: the charge and four pleas. */
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
  const [locked, setLocked] = useState(false);

  // Guard against a double-tap registering two answers and skipping a hearing.
  const choose = (i: number) => {
    if (locked) return;
    setLocked(true);
    onAnswer(i);
  };

  return (
    <motion.div
      key={`hearing-${index}`}
      initial={{ opacity: 0, x: 44 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -44 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      style={{ width: "100%", maxWidth: 440 }}
    >
      <div style={{ marginBottom: 16 }}>
        <ProgressPips total={total} done={index} />
      </div>

      <StickerCard tilt={index % 2 === 0 ? -1.1 : 1.1}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          {/* The clerk GIF has an opaque pink backdrop — clip it so it reads as an avatar. */}
          <div
            style={{
              flexShrink: 0,
              width: 54,
              height: 54,
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${BORDER}`,
            }}
          >
            <CourtGif src={ASSETS.clerk} alt="" size={54} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: BODY,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 1.3,
                color: INDIGO,
                textTransform: "uppercase",
              }}
            >
              {exhibit || `Hearing ${index + 1}`}
            </div>
            <div style={{ fontFamily: BODY, fontSize: 11, color: MUTED }}>
              Hearing {index + 1} of {total}
            </div>
          </div>
        </div>

        <h2
          style={{
            fontFamily: HEAD,
            fontSize: 20,
            lineHeight: 1.34,
            fontWeight: 700,
            color: TEXT,
            margin: "0 0 16px",
            letterSpacing: -0.3,
          }}
        >
          {question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => choose(i)}
              disabled={locked}
              whileTap={{ scale: 0.985 }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 15px",
                borderRadius: 18,
                background: "#F3F1EA",
                border: `1px solid ${BORDER}`,
                fontFamily: BODY,
                fontSize: 14.5,
                lineHeight: 1.45,
                color: TEXT,
                cursor: locked ? "default" : "pointer",
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                minHeight: 50,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 23,
                  height: 23,
                  borderRadius: 999,
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: HEAD,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: INDIGO,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </motion.button>
          ))}
        </div>
      </StickerCard>
    </motion.div>
  );
}

/**
 * A thin ring that drains over the dwell time. Without it, a 3.4 s hold on a
 * GIF reads as "the app froze"; with it, the pause reads as deliberate and
 * obviously skippable.
 */
function DwellRing({ ms, label }: { ms: number; label: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="#E2DFF6" strokeWidth="2.4" />
        <motion.circle
          cx="10"
          cy="10"
          r="8.5"
          fill="none"
          stroke={INDIGO}
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={{ pathLength: 1 }}
          animate={{ pathLength: 0 }}
          transition={{ duration: ms / 1000, ease: "linear" }}
          style={{ rotate: -90, transformOrigin: "center" }}
        />
      </svg>
      <span style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, opacity: 0.85 }}>{label}</span>
    </div>
  );
}

/**
 * The reaction between hearings — a GIF plus a handwritten line.
 *
 * `kind` distinguishes the three roles the art plays: celebrating a right
 * answer, comforting a wrong one, and cheering the accused on at the recess.
 * Each reaction carries its own dwell time because most of these GIFs have
 * words drawn into them and loop in well under a second.
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
  /** Stable per-appearance key so the ring restarts and React remounts cleanly. */
  slot: string;
  onContinue: () => void;
  continueLabel: string;
}) {
  const reduce = useReducedMotion();
  const dwell = reduce ? 1100 : reaction.dwell;

  const badge =
    kind === "correct"
      ? { text: "✓ Sustained", fg: GREEN, bg: "rgba(58,167,109,.13)", bd: "rgba(58,167,109,.3)" }
      : kind === "wrong"
        ? { text: "✗ Overruled", fg: PINK, bg: "rgba(247,37,133,.11)", bd: "rgba(247,37,133,.26)" }
        : { text: "⏸ Brief recess", fg: INDIGO, bg: "rgba(108,92,231,.1)", bd: "rgba(108,92,231,.24)" };

  // Auto-advance, but the whole screen is a tap target so nobody has to wait.
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
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onContinue(); }}
      aria-label={`${badge.text}. ${note} Activate to continue.`}
      style={{ width: "100%", maxWidth: 400, textAlign: "center", cursor: "pointer" }}
    >
      <div
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 15px",
          borderRadius: 999,
          background: badge.bg,
          border: `1px solid ${badge.bd}`,
          fontFamily: HEAD,
          fontSize: 12.5,
          fontWeight: 700,
          color: badge.fg,
          marginBottom: 12,
          letterSpacing: 0.2,
        }}
      >
        {badge.text}
      </div>

      {/* Framed so the GIFs with opaque backdrops read as a deliberate card
          rather than a stray rectangle floating on the cream canvas. */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 28,
          boxShadow: CARD_SHADOW,
          padding: 10,
          overflow: "hidden",
        }}
      >
        <CourtGif src={reaction.src} alt={reaction.alt} size={reaction.size ?? REACTION_SIZE} priority />
      </div>

      <p
        style={{
          fontFamily: SCRIPT,
          fontSize: 24,
          lineHeight: 1.3,
          color: kind === "correct" ? GREEN : INDIGO,
          margin: "16px auto 0",
          maxWidth: 330,
        }}
      >
        {note}
      </p>

      <div style={{ marginTop: 14 }}>
        <DwellRing ms={dwell} label={`tap to ${continueLabel} →`} />
      </div>
    </motion.div>
  );
}

/** The verdict — won or retrial. */
function VerdictScreen({
  passed,
  score,
  total,
  onNext,
  onRetry,
}: {
  passed: boolean;
  score: number;
  total: number;
  onNext: () => void;
  onRetry: () => void;
}) {
  const reduce = useReducedMotion();
  // The verdict clip spends its first seconds drawing out "THE COURT HAS DECIDED
  // I LOVE YOU MORE / THERE WILL BE NO APPEALS". Showing the CTA immediately
  // invites a tap straight past the line the whole trial was building to, so it
  // fades in once the message has landed. The clip keeps looping either way, so
  // this delays the button — it never traps anyone.
  const [ctaReady, setCtaReady] = useState(!passed || reduce);
  useEffect(() => {
    if (ctaReady) return;
    const t = window.setTimeout(() => setCtaReady(true), 6000);
    return () => window.clearTimeout(t);
  }, [ctaReady]);

  return (
    <motion.div
      key={`verdict-${passed}`}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45 }}
      style={{ width: "100%", maxWidth: 420, textAlign: "center" }}
    >
      <div
        aria-live="polite"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 15px",
          borderRadius: 999,
          background: "rgba(108,92,231,.1)",
          border: `1px solid rgba(108,92,231,.24)`,
          fontFamily: BODY,
          fontSize: 11.5,
          fontWeight: 700,
          color: INDIGO,
          letterSpacing: 1,
          marginBottom: 14,
        }}
      >
        <Gavel size={12} /> VERDICT · {score}/{total}
      </div>

      {passed ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              borderRadius: 24,
              overflow: "hidden",
              border: `1px solid ${BORDER}`,
              boxShadow: CARD_SHADOW,
              background: SURFACE,
            }}
          >
            <CourtGif
              src={ASSETS.verdict}
              alt="A cartoon cat judge banging a gavel beside the words: the court has decided I love you more"
              size={420}
              priority
            />
          </div>
          <h2
            style={{
              fontFamily: HEAD,
              fontSize: 26,
              fontWeight: 700,
              color: TEXT,
              margin: "16px 0 6px",
              letterSpacing: -0.6,
            }}
          >
            Case won. 💗
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: MUTED, margin: "0 0 20px" }}>
            The Court finds you guilty of being loved beyond all reasonable doubt.
          </p>
          <div style={{ minHeight: 48 }}>
            <AnimatePresence mode="wait">
              {ctaReady ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <LimeButton onClick={onNext}>Read the sealed letter 💌</LimeButton>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontFamily: SCRIPT, fontSize: 21, color: PINK, margin: 0 }}
                >
                  the Court is still speaking…
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <>
          <CourtGif
            src={WRONG_REACTIONS[0].src}
            alt={WRONG_REACTIONS[0].alt}
            size={WRONG_REACTIONS[0].size ?? REACTION_SIZE}
            priority
          />
          <h2
            style={{
              fontFamily: HEAD,
              fontSize: 25,
              fontWeight: 700,
              color: TEXT,
              margin: "14px 0 6px",
              letterSpacing: -0.5,
            }}
          >
            Retrial granted
          </h2>
          <p style={{ fontFamily: SCRIPT, fontSize: 23, color: INDIGO, margin: "0 0 8px" }}>
            insufficient evidence… but this Court believes in second chances
          </p>
          <p style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6, color: MUTED, margin: "0 0 20px" }}>
            You scored {score} of {total}. You need {Math.ceil(total * PASS_RATIO)} to win the case.
          </p>
          <LimeButton onClick={onRetry}>
            <RotateCcw size={15} /> Appeal the verdict
          </LimeButton>
        </>
      )}
    </motion.div>
  );
}

/** The typewriter love letter. */
function LetterScreen({ data, onNext }: { data: CourtOfLoveData; onNext: () => void }) {
  const letter = data.secretLetter?.trim() || "The Court rests. I love you — no further evidence required.";
  const [skipped, setSkipped] = useState(false);
  const { shown, done } = useTypewriter(letter, true, 26, skipped);

  return (
    <motion.div
      key="letter"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45 }}
      style={{ width: "100%", maxWidth: 440 }}
    >
      {/* Tapping the letter finishes it instantly — a long note should never hold
          an impatient reader hostage to the animation. */}
      <StickerCard
        tilt={1}
        onClick={() => setSkipped(true)}
        style={{ cursor: done ? "default" : "pointer" }}
      >
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <div
            style={{
              fontFamily: BODY,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: INDIGO,
              textTransform: "uppercase",
            }}
          >
            Sealed exhibit · read aloud
          </div>
        </div>

        <p
          style={{
            fontFamily: BODY,
            fontSize: 15,
            lineHeight: 1.78,
            color: TEXT,
            margin: 0,
            whiteSpace: "pre-wrap",
            minHeight: 150,
          }}
        >
          {shown}
          {!done && (
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ color: PINK }}
            >
              ▌
            </motion.span>
          )}
        </p>

        {/* Held back until the letter has finished typing, so "I LOVE YOU THIS
            MUCH" lands as the closing beat instead of competing with the words
            still appearing above it. */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.25 }}
              style={{ display: "flex", justifyContent: "center", marginTop: 12 }}
            >
              {/* This GIF's backdrop is off-white, which shows as a grey block on
                  the card's pure white. Framing it makes that edge deliberate. */}
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  border: `1px solid ${BORDER}`,
                  background: "#FCFCFA",
                  padding: 6,
                  lineHeight: 0,
                }}
              >
                <CourtGif
                  src={ASSETS.loveThisMuch}
                  alt="A cartoon dinosaur stretching its arms wide beside the words “I love you this much”"
                  size={230}
                  priority
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p
          style={{
            fontFamily: SCRIPT,
            fontSize: 23,
            color: PINK,
            textAlign: "center",
            margin: "6px 0 0",
          }}
        >
          — {data.signatureName?.trim() || data.plaintiffName?.trim() || "yours, always"}
        </p>
      </StickerCard>

      <div style={{ marginTop: 20, minHeight: 48 }}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="collect"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              <LimeButton onClick={onNext}>Collect your stamp paper 📜</LimeButton>
            </motion.div>
          ) : (
            <motion.p
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: BODY,
                fontSize: 11.5,
                color: MUTED,
                textAlign: "center",
                margin: 0,
                opacity: 0.8,
              }}
            >
              tap the letter to read it all at once
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── The experience ────────────────────────────────────────────────────────── */

export default function CourtOfLove({
  data,
  mode,
  shareId,
}: {
  data: CourtOfLoveData;
  /** "preview" = inside the editor; "live" = the recipient's published page. */
  mode: "preview" | "live";
  shareId?: string;
}) {
  const reduce = useReducedMotion();
  // Memoised so the answer callback isn't rebuilt on every render.
  const questions = useMemo(() => data.questions ?? [], [data.questions]);
  const total = questions.length;

  const [phase, setPhase] = useState<Phase>("summons");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastNote, setLastNote] = useState("");

  const certRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "share" | "png" | "pdf">(null);
  const [flash, setFlash] = useState("");

  const caseNo = useMemo(() => caseNumber(shareId), [shareId]);
  const dateStr = useMemo(
    () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    [],
  );

  const passed = total > 0 && score / total >= PASS_RATIO;

  // Warm the next screen's animation one step ahead, so a transition never waits
  // on a network fetch. Nothing is fetched that the trial won't reach.
  useEffect(() => {
    if (phase === "summons") {
      preloadAsset(ASSETS.gavel);
    } else if (phase === "session") {
      preloadAsset(ASSETS.clerk);
    } else if (phase === "hearing") {
      // Either reaction could be next and both are small, so warm both — the
      // reaction screen must never open on a half-loaded GIF.
      preloadAsset(reactionFor(true, index).src);
      preloadAsset(reactionFor(false, index).src);
      if (index + 2 === total && total >= 3) preloadAsset(encouragementFor(score, index + 1).src);
      if (index === total - 1) preloadAsset(ASSETS.verdict);
    } else if (phase === "verdict" && passed) {
      preloadAsset(ASSETS.win);
      preloadAsset(ASSETS.loveThisMuch);
    }
  }, [phase, index, total, passed, score]);

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
    if (index + 1 >= total) { setPhase("verdict"); return; }
    // One hearing left → take a recess and cheer them on. Only worth it in a
    // trial long enough to have a middle (3+ hearings).
    if (index + 2 === total && total >= 3) { setPhase("recess"); return; }
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

  // Confetti for the winning verdict, and again when the certificate lands.
  useEffect(() => {
    if (reduce) return;
    if (!(phase === "verdict" && passed) && phase !== "certificate") return;
    let cancelled = false;
    (async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        if (cancelled) return;
        const shoot = (x: number) =>
          confetti({
            particleCount: 46,
            spread: 74,
            startVelocity: 42,
            origin: { x, y: 0.62 },
            colors: [INDIGO, PINK, LIME, "#FFB020", "#FFFFFF"],
            disableForReducedMotion: true,
          });
        shoot(0.22);
        window.setTimeout(() => !cancelled && shoot(0.78), 220);
        window.setTimeout(() => !cancelled && shoot(0.5), 440);
      } catch {
        // Confetti is decorative; a chunk-load failure must not break the verdict.
      }
    })();
    return () => { cancelled = true; };
  }, [phase, passed, reduce]);

  const say = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(""), 2600);
  }, []);

  const doShare = useCallback(async () => {
    if (!certRef.current) return;
    setBusy("share");
    try {
      const { shareCertificatePng } = await import("./certificateExport");
      const result = await shareCertificatePng(
        certRef.current,
        caseNo,
        mode === "live" && shareId ? window.location.href : null,
      );
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

  // A page saved with every question blank would otherwise render an empty trial.
  if (total === 0) {
    return (
      <div style={{ minHeight: "100dvh", background: BG, display: "grid", placeItems: "center", padding: 24 }}>
        <p style={{ fontFamily: BODY, color: MUTED, textAlign: "center" }}>
          This case file has no hearings yet.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: BG,
        position: "relative",
        overflowX: "clip",
        fontFamily: BODY,
        color: TEXT,
      }}
    >
      <CanvasGlow />
      {mode === "live" && <BrandBadge />}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Clears the editor's floating top bar and the live page's brand badge.
          padding: "calc(env(safe-area-inset-top, 0px) + 72px) 18px calc(env(safe-area-inset-bottom, 0px) + 36px)",
        }}
      >
        <AnimatePresence mode="wait">
          {phase === "summons" && (
            <SummonsScreen data={data} caseNo={caseNo} onAccept={() => setPhase("session")} />
          )}

          {phase === "session" && <SessionScreen onDone={() => setPhase("hearing")} />}

          {phase === "hearing" && questions[index] && (
            <HearingScreen
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
              reaction={encouragementFor(score, index + 1)}
              kind="recess"
              note="One hearing left. The Court believes in you."
              slot="recess"
              onContinue={afterRecess}
              continueLabel="face the final question"
            />
          )}

          {phase === "verdict" && (
            <VerdictScreen
              passed={passed}
              score={score}
              total={total}
              onNext={() => setPhase("letter")}
              onRetry={retry}
            />
          )}

          {phase === "letter" && <LetterScreen data={data} onNext={() => setPhase("certificate")} />}

          {phase === "certificate" && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%", maxWidth: 460 }}
            >
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <CourtGif
                  src={ASSETS.win}
                  alt="A penguin on the winner's podium wearing a gold medal, surrounded by confetti"
                  size={150}
                  priority
                />
                <h2
                  style={{
                    fontFamily: HEAD,
                    fontSize: 24,
                    fontWeight: 700,
                    color: TEXT,
                    margin: "4px 0 2px",
                    letterSpacing: -0.5,
                  }}
                >
                  You won the case
                </h2>
                <p style={{ fontFamily: SCRIPT, fontSize: 21, color: PINK, margin: 0 }}>
                  duly signed, sealed &amp; stamped
                </p>
              </div>

              <StampPaperCertificate
                ref={certRef}
                data={data}
                score={score}
                total={total}
                caseNo={caseNo}
                dateStr={dateStr}
              />

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                <LimeButton onClick={doShare} disabled={busy !== null}>
                  {busy === "share" ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
                  {busy === "share" ? "Preparing…" : "Share your award"}
                </LimeButton>

                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { key: "png" as const, icon: <Download size={14} />, label: "PNG", onClick: doPng },
                    { key: "pdf" as const, icon: <FileText size={14} />, label: "PDF", onClick: doPdf },
                  ].map((b) => (
                    <motion.button
                      key={b.key}
                      whileTap={{ scale: 0.97 }}
                      onClick={b.onClick}
                      disabled={busy !== null}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 999,
                        background: SURFACE,
                        border: `1px solid ${BORDER}`,
                        fontFamily: HEAD,
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: TEXT,
                        cursor: busy ? "default" : "pointer",
                        opacity: busy ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        minHeight: 46,
                      }}
                    >
                      {busy === b.key ? <Loader2 size={14} className="animate-spin" /> : b.icon}
                      {b.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {mode === "live" && (
                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <Link
                    href="/templates"
                    style={{
                      fontFamily: BODY,
                      fontSize: 13,
                      fontWeight: 600,
                      color: INDIGO,
                      textDecoration: "none",
                      borderBottom: `1px solid rgba(108,92,231,.35)`,
                      paddingBottom: 1,
                    }}
                  >
                    Make one for someone you love →
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* status flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
              zIndex: 200,
              padding: "11px 18px",
              borderRadius: 999,
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 12px 30px rgba(14,14,18,.14)",
              fontFamily: BODY,
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              maxWidth: "90vw",
            }}
          >
            <Check size={14} style={{ color: GREEN, flexShrink: 0 }} />
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
