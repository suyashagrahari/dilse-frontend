"use client";

// ─── SCREEN 1 — the PNR status check ─────────────────────────────────────────
//
// THIS IS THE PRODUCT. The slip and the running status are packaging.
//
// Every Indian has refreshed a PNR page with their stomach in a knot watching a
// waitlist number refuse to move. The whole template exists to reproduce those
// eight seconds, so this screen is deliberately plain — no branding, no hearts,
// no gradients, nothing that says "designed". A government portal that happens
// to be telling you something enormous.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("train-ticket");
import {
  type TicketData,
  type ChartGate,
  CNF_GREEN,
  CNF_HOLD_MS,
  FETCH_MS,
  SEQUENCE_GAPS,
  fmtDateTime,
  seatAllotmentLine,
  statusSequence,
} from "./types";
import { PnrGlyphs } from "./marks";
import Loop from "./Loop";
import { useCountdown, usePrefersReducedMotion, useClick } from "../hooks/useTicketClock";

const MONO = "var(--font-courier-prime), 'Courier New', monospace";

/** -1 nothing yet · 0..n a rung · HOLD the dead beat before the last flip. */
const HOLD = -2;

type Phase = "idle" | "fetching" | "not-prepared" | "ticking" | "confirmed";

/** The flap seam + the two half-flaps sliding past each other. */
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
        height: 58,
        overflow: "hidden",
        background: "#ececec",
        border: "1px solid #111",
        minWidth: 168,
      }}
    >
      {/* the seam a real flap board splits on */}
      <span
        aria-hidden
        style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "rgba(0,0,0,.22)", zIndex: 2 }}
      />
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
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#111",
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PnrStatusScreen({
  data,
  gate,
  onCheck,
  onViewSlip,
}: {
  data: TicketData;
  gate: ChartGate;
  /**
   * Re-hits the server. The chart gate is enforced there, so a retry is a real
   * poll: the passenger names simply do not exist client-side until the server
   * decides to send them.
   */
  onCheck?: () => Promise<{ data: TicketData; gate: ChartGate }>;
  onViewSlip: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const playClick = useClick();

  const [snap, setSnap] = useState<{ data: TicketData; gate: ChartGate }>({ data, gate });
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState<number>(-1);
  // `typing` arms the typewriter exactly once; `typed` is the cursor it advances.
  // They are deliberately separate — keying the effect on `typed` would make it
  // tear down and re-check its own guard on every character and stall on the first.
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runToken = useRef(0);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // Keep the local snapshot in step with the props while idle, so a sender editing
  // the form in the preview sees their own PNR immediately.
  useEffect(() => {
    if (phase === "idle") setSnap({ data, gate });
  }, [data, gate, phase]);

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
      try { next = await onCheck(); } catch { /* keep the last snapshot */ }
    }
    if (runToken.current !== token) return;

    // Pad the real request out to a full 1.2s. Faster than that and it reads as a
    // canned animation; slower and it reads as broken.
    const wait = Math.max(0, FETCH_MS - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    if (runToken.current !== token) return;

    setSnap(next);

    const at = next.data.chartPreparedAt;
    const timeReached = !at || Date.parse(at) <= Date.now();
    // Both must agree. The server's verdict is the one that matters — it is the
    // reason the names are not in this bundle — but the local clock stops a stale
    // payload from opening the gate a beat early.
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

    // ── The ladder. 900 / 700 / 1100 / 600, then a 400ms dead hold. ───────────
    // The irregularity is the entire point. Even intervals turn this into a
    // progress bar and the tension evaporates; uneven ones read as a machine
    // genuinely working the queue. Do not "tidy" these numbers.
    let t = 0;
    const last = SEQUENCE_GAPS.length - 1;
    SEQUENCE_GAPS.forEach((gap, i) => {
      t += gap;
      if (i < last) {
        push(t, () => { setStep(i + 1); playClick(); });
      } else {
        // the flap flips out and hangs blank — the longest 400ms in the template
        push(t, () => { setStep(HOLD); playClick(); });
        push(t + CNF_HOLD_MS, () => { setStep(last + 1); setPhase("confirmed"); playClick(); });
        // and only then the seat numbers, which are the thing that actually lands
        push(t + CNF_HOLD_MS + 300, () => setTyping(true));
      }
    });
  }, [clearTimers, data, gate, onCheck, playClick]);

  // Typewriter for the seat allotment.
  useEffect(() => {
    if (!typing || !seatLine) return;
    if (reduced) { setTyped(seatLine.length + 1); return; }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setTyped(n);
      if (n > seatLine.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [typing, seatLine, reduced]);

  const flapValue = step === HOLD ? "" : step >= 0 ? seq[step] ?? "" : "";
  const confirmed = phase === "confirmed";
  const busy = phase === "fetching" || phase === "ticking";

  return (
    <div style={{ fontFamily: MONO, color: "#111", padding: "0 12px 64px", maxWidth: 460, margin: "0 auto" }}>
      {/* ── enquiry box ─────────────────────────────────────────────────────── */}
      <div style={{ border: "1px solid #111", background: "#fff", marginTop: 8 }}>
        <div
          style={{
            background: "#dcdcdc",
            borderBottom: "1px solid #111",
            padding: "6px 10px",
            fontSize: 12,
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          PNR ENQUIRY
        </div>

        <div style={{ padding: 14 }}>
          <label htmlFor="tt-pnr" style={{ display: "block", fontSize: 11, marginBottom: 5, color: "#333" }}>
            Enter PNR Number
          </label>
          <div
            id="tt-pnr"
            style={{
              border: "1px solid #111",
              background: "#fff",
              padding: "9px 10px",
              fontSize: 19,
              letterSpacing: "0.16em",
              minHeight: 42,
              display: "flex",
              alignItems: "center",
            }}
          >
            <PnrGlyphs pnr={snap.data.pnr} />
          </div>

          <button
            type="button"
            onClick={run}
            disabled={busy}
            style={{
              marginTop: 12,
              width: "100%",
              minHeight: 44,
              border: "1px solid #111",
              background: busy ? "#ddd" : "#f0f0f0",
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: busy ? "default" : "pointer",
              color: "#111",
            }}
          >
            {phase === "fetching" ? "[ FETCHING... ]" : busy ? "[ ... ]" : "[ GET STATUS ]"}
          </button>
        </div>
      </div>

      {/* ── CHART NOT PREPARED ──────────────────────────────────────────────── */}
      {phase === "not-prepared" && (
        <div style={{ marginTop: 14, border: "1px solid #111", background: "#fff", padding: 14 }}>
          <p style={{ fontSize: 17, fontWeight: 700, letterSpacing: "0.06em", margin: 0 }}>CHART NOT PREPARED</p>
          <p style={{ fontSize: 12, lineHeight: 1.5, margin: "8px 0 0", color: "#333" }}>
            Status will be available after {chartAt ? fmtDateTime(chartAt) : "the chart is prepared"}.
          </p>
          <p style={{ fontSize: 12, margin: "10px 0 0", letterSpacing: "0.08em" }}>
            CHART PREPARATION IN: {chartCountdown.ready ? chartCountdown.text : "--d --h --m --s"}
          </p>
          {snap.gate.passengerCount > 0 && (
            <p style={{ fontSize: 11, margin: "8px 0 0", color: "#555" }}>
              {snap.gate.passengerCount} passenger{snap.gate.passengerCount > 1 ? "s" : ""} booked. Names and berths are
              released with the chart.
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <Loop src={`${ASSET}/waiting.webm`} width={78} />
            <button
              type="button"
              onClick={run}
              style={{
                flex: 1,
                minHeight: 44,
                border: "1px solid #111",
                background: "#f0f0f0",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                cursor: "pointer",
                color: "#111",
              }}
            >
              [ CHECK AGAIN ]
            </button>
          </div>
        </div>
      )}

      {/* ── fetching ─────────────────────────────────────────────────────────── */}
      {phase === "fetching" && (
        <p style={{ marginTop: 14, fontSize: 13, letterSpacing: "0.1em", color: "#444" }}>
          Fetching current status<span className="tt-blink">...</span>
        </p>
      )}

      {/* ── the ladder ───────────────────────────────────────────────────────── */}
      {(phase === "ticking" || confirmed) && (
        <div style={{ marginTop: 14, border: "1px solid #111", background: "#fff", padding: 14 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.14em", color: "#555", margin: "0 0 4px" }}>CURRENT STATUS</p>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {confirmed ? (
              <motion.div
                initial={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{
                  border: `2px solid ${CNF_GREEN}`,
                  color: CNF_GREEN,
                  padding: "10px 22px",
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                }}
              >
                {seq[seq.length - 1]}
              </motion.div>
            ) : (
              <SplitFlap value={flapValue} reduced={reduced} />
            )}

            {/* pure relief — fired only AFTER the box lands, beside it, never on it */}
            {confirmed && <Loop src={`${ASSET}/dancing.webm`} width={88} />}
          </div>

          {/* THE PAYLOAD. What makes CNF land is not the word CNF. */}
          {confirmed && seatLine && (
            <p
              style={{
                marginTop: 14,
                fontSize: 13,
                letterSpacing: "0.05em",
                lineHeight: 1.5,
                minHeight: 20,
                color: "#111",
                wordBreak: "break-word",
              }}
            >
              {seatLine.slice(0, typed)}
              {typing && typed <= seatLine.length && <span className="tt-blink">_</span>}
            </p>
          )}

          {confirmed && (
            <button
              type="button"
              onClick={onViewSlip}
              style={{
                marginTop: 16,
                minHeight: 44,
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: MONO,
                fontSize: 13,
                color: "#111",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              View Electronic Reservation Slip →
            </button>
          )}
        </div>
      )}

      {phase === "idle" && (
        <p style={{ marginTop: 12, fontSize: 11, color: "#666", lineHeight: 1.5 }}>
          Enquiry is available 24 hours. Chart preparation status is updated in real time.
        </p>
      )}
    </div>
  );
}
