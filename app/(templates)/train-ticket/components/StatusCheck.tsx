"use client";

// ─── Stage 1 — the PNR status check ──────────────────────────────────────────
//
// Still the heart of the template: every Indian has refreshed a PNR page with a
// knot in their stomach watching a waitlist refuse to move. The ladder below
// keeps the original machine exactly — the irregular 900/700/1100/600 gaps, the
// 400ms dead hold, the typewritten seat line — and dresses it as a neon station
// departure board instead of a government portal.
//
// In live mode the check is a real poll: before `chartPreparedAt` the server
// sends no names, seats, letter or photos at all.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { templateMediaBase } from "@/lib/templateMedia";
import { CandyButton, Eyebrow, GhostButton, Glass, GradText, GROTESK, HeartBurst, ITALIC, Sticker } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { useClick, useCountdown, usePrefersReducedMotion } from "../hooks/useTicketClock";
import Loop from "./Loop";
import { PnrGlyphs } from "./marks";
import {
  type ChartGate,
  type TicketData,
  CNF_HOLD_MS,
  FETCH_MS,
  SEQUENCE_GAPS,
  fmtDateTime,
  seatAllotmentLine,
  statusSequence,
} from "./types";

const ASSET = templateMediaBase("train-ticket");
export const MONO = "var(--font-courier-prime), 'Courier New', ui-monospace, monospace";

/** -1 nothing yet · 0..n a rung · HOLD the dead beat before the last flip. */
const HOLD = -2;

type Phase = "idle" | "fetching" | "not-prepared" | "ticking" | "confirmed";

/** One split-flap tile: the seam + two half-flaps sliding past each other. */
function SplitFlap({ value, reduced }: { value: string; reduced: boolean }) {
  const anim = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 } }
    : {
        initial: { y: "105%" },
        animate: { y: "0%" },
        exit: { y: "-105%" },
        transition: { duration: 0.2, ease: [0.22, 0.9, 0.25, 1] as [number, number, number, number] },
      };
  return (
    <div
      style={{
        position: "relative",
        height: 76,
        overflow: "hidden",
        borderRadius: 18,
        background: "linear-gradient(180deg, #1b1b22 0 50%, #111117 50% 100%)",
        border: "2px solid rgba(255,255,255,.12)",
        minWidth: 200,
        boxShadow: `0 18px 36px -18px ${V.shadow}`,
      }}
    >
      <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(0,0,0,.6)", zIndex: 2 }} />
      <AnimatePresence initial={false}>
        <motion.div
          key={value || "__hold__"}
          {...anim}
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontFamily: MONO,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#ffc24a",
            textShadow: "0 0 18px rgba(255,194,74,.55)",
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function StatusCheck({
  data,
  gate,
  onCheck,
  onOpenTicket,
  demo,
}: {
  data: TicketData;
  gate: ChartGate;
  onCheck?: () => Promise<{ data: TicketData; gate: ChartGate }>;
  /** Called with the freshest snapshot once the status lands on CNF. */
  onOpenTicket: (snap: { data: TicketData; gate: ChartGate }) => void;
  /** The sender's preview: offers a skip straight to the ticket. */
  demo: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const playClick = useClick();

  const [polled, setSnap] = useState<{ data: TicketData; gate: ChartGate }>({ data, gate });
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState<number>(-1);
  // `typing` arms the typewriter once; `typed` is the cursor it advances. Kept
  // separate so the effect never tears down on every character.
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runToken = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // While idle, follow the props so the sender's edits show up immediately.
  const snap = phase === "idle" ? { data, gate } : polled;

  const seq = statusSequence(snap.data.passengers);
  const chartAt = snap.data.chartPreparedAt;
  const chartCountdown = useCountdown(chartAt);
  const seatLine = seatAllotmentLine(snap.data.passengers);

  const run = useCallback(async () => {
    const token = ++runToken.current;
    clearTimers();
    playClick();
    setPhase("fetching");
    setStep(-1);
    setTyping(false);
    setTyped(0);

    const started = Date.now();
    let next = { data, gate };
    if (onCheck) {
      try {
        next = await onCheck();
      } catch {
        /* keep the last snapshot */
      }
    }
    if (runToken.current !== token) return;

    // Pad the real request to a full 1.2s: faster reads canned, slower reads broken.
    const wait = Math.max(0, FETCH_MS - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    if (runToken.current !== token) return;

    setSnap(next);

    const at = next.data.chartPreparedAt;
    const timeReached = !at || Date.parse(at) <= Date.now();
    // Both must agree: the server's verdict (the reason the names are not in this
    // bundle) and the local clock (so a stale payload never opens a beat early).
    if (!next.gate.chartPrepared || !timeReached) {
      setPhase("not-prepared");
      return;
    }

    setPhase("ticking");
    setStep(0);
    playClick();

    const push = (ms: number, fn: () => void) => {
      timers.current.push(
        setTimeout(() => {
          if (runToken.current !== token) return;
          fn();
        }, ms),
      );
    };

    // The ladder. The irregular gaps are the whole point — do not tidy them.
    let t = 0;
    const last = SEQUENCE_GAPS.length - 1;
    SEQUENCE_GAPS.forEach((gap, i) => {
      t += gap;
      if (i < last) {
        push(t, () => {
          setStep(i + 1);
          playClick();
        });
      } else {
        push(t, () => {
          setStep(HOLD);
          playClick();
        });
        push(t + CNF_HOLD_MS, () => {
          setStep(last + 1);
          setPhase("confirmed");
          playClick();
        });
        push(t + CNF_HOLD_MS + 300, () => setTyping(true));
      }
    });
  }, [clearTimers, data, gate, onCheck, playClick]);

  // Typewriter for the seat allotment.
  useEffect(() => {
    if (!typing || !seatLine || reduced) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setTyped(n);
      if (n > seatLine.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [typing, seatLine, reduced]);

  // Reduced motion: the whole line at once.
  const shownChars = reduced && typing ? seatLine.length + 1 : typed;
  const flapValue = step === HOLD ? "" : step >= 0 ? (seq[step] ?? "") : "";
  const confirmed = phase === "confirmed";
  const busy = phase === "fetching" || phase === "ticking";
  const d = snap.data;

  return (
    <main className="tt-wrap" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 88, paddingBottom: demo ? 120 : 56, textAlign: "center" }}>
      <span
        className={reduced ? "" : "lv-pop"}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontSize: 13, fontWeight: 700, color: V.soft }}
      >
        🚆 Indian Hearts Railway · PNR enquiry
      </span>
      <h1 style={{ margin: "14px 0 0", fontWeight: 800, fontSize: "clamp(38px, 10.5vw, 72px)", lineHeight: 0.95, letterSpacing: "-0.04em" }}>
        is our seat
        <br />
        <GradText>confirmed?</GradText>
      </h1>

      {/* ── the board ───────────────────────────────────────────────────── */}
      <Glass style={{ marginTop: 26, width: "100%", maxWidth: 460, padding: "18px 18px 20px", textAlign: "left", position: "relative" }}>
        {confirmed && !reduced && <HeartBurst glyphs={["💘", "🎫", "💖", "✨", "🚆"]} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Eyebrow color={V.a1}>pnr number</Eyebrow>
          <span style={{ fontSize: 12, fontWeight: 700, color: V.soft }}>
            {d.trainNo} · {d.trainName}
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            padding: "12px 14px",
            borderRadius: 16,
            background: "rgba(0,0,0,.22)",
            border: `1px dashed ${V.edge}`,
            fontFamily: MONO,
            fontSize: "clamp(22px, 6.4vw, 30px)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: V.ink,
          }}
        >
          <PnrGlyphs pnr={d.pnr} />
        </div>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18 }}>
          <span>{d.from.code}</span>
          <span aria-hidden style={{ flex: 1, height: 2, background: `repeating-linear-gradient(90deg, ${V.faint} 0 6px, transparent 6px 12px)` }} />
          <span aria-hidden>🚆</span>
          <span aria-hidden style={{ flex: 1, height: 2, background: `repeating-linear-gradient(90deg, ${V.faint} 0 6px, transparent 6px 12px)` }} />
          <span>{d.to.code}</span>
        </div>

        {/* status area */}
        <div aria-live="polite" style={{ marginTop: 16 }}>
          {phase === "idle" && (
            <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, color: V.soft }}>
              Someone booked you a seat. Check the status… if you dare 👀
            </p>
          )}

          {phase === "fetching" && (
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: V.soft }}>
              Fetching current status<span className="tt-blink">…</span>
            </p>
          )}

          {phase === "not-prepared" && (
            <div>
              <Sticker tilt={-2}>⏳ chart not prepared</Sticker>
              <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: V.soft }}>
                Status unlocks after {chartAt ? fmtDateTime(chartAt) : "the chart is prepared"} IST.
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: ".06em" }}>
                {chartCountdown.ready ? chartCountdown.text : "--d --h --m --s"}
              </p>
              {snap.gate.passengerCount > 0 && (
                <p style={{ margin: "6px 0 0", fontSize: 12.5, color: V.faint }}>
                  {snap.gate.passengerCount} passenger{snap.gate.passengerCount > 1 ? "s" : ""} booked. Names, seats &amp; memories are released with the chart.
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <Loop src={`${ASSET}/waiting.webm`} width={80} />
                <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: V.soft }}>patience is romantic, apparently.</p>
              </div>
            </div>
          )}

          {(phase === "ticking" || confirmed) && (
            <div>
              <Eyebrow>current status</Eyebrow>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {confirmed ? (
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { scale: 1.6, rotate: -14, opacity: 0 }}
                    animate={{ scale: 1, rotate: -6, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 18,
                      background: V.chip,
                      color: V.chipInk,
                      fontFamily: MONO,
                      fontSize: 38,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                      boxShadow: `0 16px 30px -14px ${V.shadow}`,
                    }}
                  >
                    {seq[seq.length - 1]} ✓
                  </motion.div>
                ) : (
                  <SplitFlap value={flapValue} reduced={reduced} />
                )}
                {confirmed && <Loop src={`${ASSET}/dancing.webm`} width={84} />}
              </div>
              {confirmed && seatLine && (
                <p style={{ margin: "14px 0 0", minHeight: 22, fontFamily: MONO, fontWeight: 700, fontSize: 14, letterSpacing: ".05em", lineHeight: 1.5, wordBreak: "break-word" }}>
                  {seatLine.slice(0, shownChars)}
                  {typing && shownChars <= seatLine.length && <span className="tt-blink">_</span>}
                </p>
              )}
            </div>
          )}
        </div>
      </Glass>

      <div style={{ marginTop: 20, width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 10 }}>
        {confirmed ? (
          <CandyButton onClick={() => onOpenTicket(snap)}>
            open my ticket <span aria-hidden>🎟️</span>
          </CandyButton>
        ) : (
          <CandyButton onClick={run} disabled={busy}>
            {phase === "fetching" ? "checking…" : busy ? "the board is thinking…" : phase === "not-prepared" ? "check again 🔁" : "check PNR status 🚆"}
          </CandyButton>
        )}
        {demo && !confirmed && (
          <GhostButton onClick={() => onOpenTicket({ data, gate })}>skip to the ticket (preview only) →</GhostButton>
        )}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: V.faint, fontFamily: GROTESK }}>
        Fictional railway. Very real feelings. No refunds.
      </p>
    </main>
  );
}
