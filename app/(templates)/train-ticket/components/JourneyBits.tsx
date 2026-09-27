"use client";

// ─── The ticket's own story pieces ───────────────────────────────────────────
//
//   JourneyRide    the relationship as a ride: a little train moves station to
//                  station each time "next station" is tapped, each stop's note
//                  unfolding as it's reached; Terminus brings the hug and the
//                  delay notice.
//   FareReceipt    the fare lines as a receipt, plus the forwardable SMS copy.
//   FinePrint      the terms & conditions, finally readable.

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { templateMediaBase } from "@/lib/templateMedia";
import { Eyebrow, Glass, GROTESK, ITALIC, Sticker } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { useCountdown } from "../hooks/useTicketClock";
import Loop from "./Loop";
import { MONO } from "./StatusCheck";
import { type TicketData, buildSmsCopy } from "./types";

const ASSET = templateMediaBase("train-ticket");

export function JourneyRide({ data, reduceMotion, onArrive }: { data: TicketData; reduceMotion: boolean; onArrive: () => void }) {
  const { elapsed: departed } = useCountdown(data.departureAt);
  const stops = data.stations.length ? data.stations : [{ name: data.to.name, label: "", at: "", detail: "", status: "upcoming" as const }];
  const last = stops.length - 1;
  const [at, setAt] = useState(0);
  const arrived = at >= last;
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  const advance = () => {
    if (arrived) return;
    const next = at + 1;
    setAt(next);
    if (next >= last) onArrive();
    window.setTimeout(() => rowRefs.current[next]?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }), 80);
  };

  return (
    <div style={{ width: "100%", maxWidth: 620, margin: "0 auto" }}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {stops.map((s, i) => {
          const passed = i < at;
          const here = i === at;
          const reached = i <= at;
          return (
            <li key={i} ref={(el) => { rowRefs.current[i] = el; }} style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr)", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  style={{
                    position: "relative",
                    width: 30,
                    height: 30,
                    marginTop: 6,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    background: passed ? V.chip : here ? "transparent" : "transparent",
                    color: V.chipInk,
                    border: passed || here ? "none" : `2px dashed ${V.faint}`,
                    flexShrink: 0,
                  }}
                >
                  {passed ? "✓" : ""}
                  {here && (
                    <motion.span
                      layoutId="tt-train"
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 20 }}
                      className="lv-pulse"
                      style={{ position: "absolute", inset: -4, borderRadius: "50%", background: V.grad, display: "grid", placeItems: "center", fontSize: 20 }}
                    >
                      🚆
                    </motion.span>
                  )}
                </span>
                {i < last && (
                  <span
                    aria-hidden
                    style={{
                      flex: 1,
                      width: 4,
                      minHeight: 26,
                      margin: "6px 0",
                      borderRadius: 4,
                      background: passed ? V.chip : `repeating-linear-gradient(${V.faint} 0 6px, transparent 6px 12px)`,
                      transition: "background .4s ease",
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: i === last ? 0 : 14 }}>
                <motion.div
                  initial={false}
                  animate={{ opacity: reached ? 1 : 0.45, scale: here ? 1 : 0.98 }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 18,
                    background: here ? V.grad : V.glass,
                    color: here ? "#fff" : V.ink,
                    border: here ? "none" : `1px ${reached ? "solid" : "dashed"} ${V.edge}`,
                    transformOrigin: "left center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 16 }}>
                      {s.name || "Unnamed stop"}
                      {s.label && reached && <span style={{ fontWeight: 600, fontSize: 12.5, opacity: 0.85 }}> ({s.label})</span>}
                    </b>
                    <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.85 }}>{here ? (i === last ? "🏁 arrived" : "📍 you are here") : passed ? "departed" : "upcoming"}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {reached && s.detail && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 0.9, height: "auto" }}
                        style={{ margin: "3px 0 0", fontSize: 13, overflow: "hidden" }}
                      >
                        {s.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </li>
          );
        })}
      </ol>

      {!arrived ? (
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={advance}
            className="lv-cta lv-focus"
            style={{ minHeight: 52, padding: "0 24px", borderRadius: 999, border: "none", background: V.grad, color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: `0 14px 28px -14px ${V.shadow}` }}
          >
            {at + 1 >= last ? `arrive at ${stops[last].name || "Terminus"} 🏁` : "next station 🚆"}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
            <span style={{ padding: 4, borderRadius: 18, background: "#fff", flexShrink: 0 }}>
              <Loop src={`${ASSET}/hug.webm`} width={104} />
            </span>
            <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.25, maxWidth: 280 }}>no ETA. no rush. just us, finally.</p>
          </div>
          {(data.delay.amount || data.delay.reason) && (
            <Glass style={{ marginTop: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <Loop src={`${ASSET}/cryingpuddle.webm`} width={56} />
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 14.5 }}>{departed ? `Arrived. Late by ${data.delay.amount || "some time"}.` : `Running late by ${data.delay.amount || "some time"}.`}</b>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: V.soft }}>
                  Reason: {data.delay.reason || "circumstances beyond our control"}. Delay compensation is not admissible. We looked into it.
                </p>
              </div>
            </Glass>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function FareReceipt({ data }: { data: TicketData }) {
  const sms = buildSmsCopy(data);
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sms);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard denied — the text is selectable */
    }
  }, [sms]);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ position: "relative", background: V.paper, color: V.paperInk, borderRadius: 22, padding: "20px 18px 18px", boxShadow: `0 26px 50px -26px ${V.shadow}` }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>fare details · non-refundable</p>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
          {data.fare.map((f, i) => {
            const total = i === data.fare.length - 1;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: total ? "12px 0 0" : "9px 0",
                  borderTop: total ? `2px solid ${V.paperInk}` : undefined,
                  borderBottom: total ? undefined : `1px dashed color-mix(in srgb, var(--lv-paper-ink) 22%, transparent)`,
                  marginTop: total ? 6 : 0,
                }}
              >
                <span style={{ fontSize: total ? 16 : 14, fontWeight: total ? 800 : 600 }}>{f.label}</span>
                <span style={{ fontSize: total ? 18 : 14, fontWeight: 800, textAlign: "right", color: total ? V.a1 : undefined }}>{f.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Glass style={{ marginTop: 16, padding: 16 }}>
        <Eyebrow>sms copy · forward it anywhere</Eyebrow>
        <pre style={{ margin: "10px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: MONO, fontSize: 12, lineHeight: 1.55 }}>{sms}</pre>
        <button
          type="button"
          onClick={copy}
          className="lv-focus"
          style={{ marginTop: 12, minHeight: 44, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", background: copied ? V.chip : V.grad, color: copied ? V.chipInk : "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 14 }}
        >
          {copied ? "copied ✓" : "copy the SMS 📋"}
        </button>
      </Glass>
    </div>
  );
}

export function FinePrint({ lines }: { lines: string[] }) {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <Sticker tilt={-2}>📜 terms &amp; conditions apply</Sticker>
      <ol style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {lines.filter((l) => l.trim()).map((l, i) => (
          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: 18, background: V.glass, border: `1px solid ${V.edge}` }}>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 10, background: V.grad, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>{i + 1}</span>
            <span style={{ fontSize: 15, lineHeight: 1.45, paddingTop: 3 }}>{l}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
