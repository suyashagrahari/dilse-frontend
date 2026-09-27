"use client";

// ─── What the ticket's own hub tiles open ────────────────────────────────────
//
//   JourneyRoute   the relationship as a running-status timeline: passed stops
//                  ticked, the current one pulsing, upcoming ones dashed, the
//                  delay notice, and the hug waiting at Terminus.
//   FareReceipt    the fare lines as a receipt, plus the forwardable SMS copy.
//   FinePrint      the terms & conditions, finally readable.
//   RouteArt       the tile preview: a tiny line with station dots.

import { useCallback, useState } from "react";

import { templateMediaBase } from "@/lib/templateMedia";
import { Eyebrow, Glass, GROTESK, ITALIC, Sticker } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { useCountdown } from "../hooks/useTicketClock";
import Loop from "./Loop";
import { MONO } from "./StatusCheck";
import { type TicketData, buildSmsCopy } from "./types";

const ASSET = templateMediaBase("train-ticket");

export function JourneyRoute({ data }: { data: TicketData }) {
  const { elapsed: departed } = useCountdown(data.departureAt);
  const stops = data.stations;
  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Loop src={`${ASSET}/bunnyonatrain.webm`} width={96} />
        <div style={{ minWidth: 0 }}>
          <Eyebrow color={V.a1}>spot your train</Eyebrow>
          <p style={{ margin: "4px 0 0", fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
            {data.trainNo} · {data.trainName}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: V.soft }}>
            {data.from.name} → {data.to.name}
          </p>
        </div>
      </div>

      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {stops.map((s, i) => {
          const passed = s.status === "passed";
          const current = s.status === "current";
          const last = i === stops.length - 1;
          return (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr)", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  className={current ? "lv-pulse" : ""}
                  style={{
                    width: current ? 30 : 24,
                    height: current ? 30 : 24,
                    marginTop: current ? 4 : 7,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: current ? 15 : 12,
                    fontWeight: 800,
                    background: passed ? V.chip : current ? V.grad : "transparent",
                    color: passed ? V.chipInk : "#fff",
                    border: passed || current ? "none" : `2px dashed ${V.faint}`,
                    flexShrink: 0,
                  }}
                >
                  {passed ? "✓" : current ? "🚆" : ""}
                </span>
                {!last && (
                  <span
                    aria-hidden
                    style={{
                      flex: 1,
                      width: 3,
                      minHeight: 28,
                      margin: "4px 0",
                      borderRadius: 3,
                      background: passed ? V.chip : `repeating-linear-gradient(${V.faint} 0 6px, transparent 6px 12px)`,
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: last ? 0 : 16 }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 18,
                    background: current ? V.grad : V.glass,
                    color: current ? "#fff" : V.ink,
                    border: current ? "none" : `1px ${passed ? "solid" : "dashed"} ${V.edge}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 16 }}>
                      {s.name || "Unnamed stop"}
                      {s.label && <span style={{ fontWeight: 600, fontSize: 12.5, opacity: 0.8 }}> ({s.label})</span>}
                    </b>
                    <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.85 }}>{current ? "📍 you are here" : passed ? "departed" : "upcoming"}</span>
                  </div>
                  {s.detail && <p style={{ margin: "3px 0 0", fontSize: 13, opacity: 0.85 }}>{s.detail}</p>}
                </div>
                {last && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ padding: 4, borderRadius: 18, background: "#fff", flexShrink: 0 }}>
                      <Loop src={`${ASSET}/hug.webm`} width={110} />
                    </span>
                    <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.25 }}>no ETA. no rush. just us, finally.</p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {(data.delay.amount || data.delay.reason) && (
        <Glass style={{ marginTop: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Loop src={`${ASSET}/cryingpuddle.webm`} width={64} />
          <div style={{ minWidth: 0 }}>
            <b style={{ fontSize: 15 }}>{departed ? `Arrived. Late by ${data.delay.amount || "some time"}.` : `Running late by ${data.delay.amount || "some time"}.`}</b>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: V.soft }}>
              Reason: {data.delay.reason || "circumstances beyond our control"}. Delay compensation is not admissible. We looked into it.
            </p>
          </div>
        </Glass>
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

/** A tiny route line with the stations as dots — the route tile's preview. */
export function RouteArt({ data }: { data: TicketData }) {
  const stops = data.stations.slice(0, 7);
  return (
    <span aria-hidden style={{ position: "absolute", inset: "18px 18px 62px", display: "flex", alignItems: "center" }}>
      <span style={{ position: "relative", flex: 1, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ position: "absolute", left: 8, right: 8, top: "50%", height: 4, marginTop: -2, borderRadius: 4, background: `repeating-linear-gradient(90deg, ${V.faint} 0 8px, transparent 8px 14px)` }} />
        {stops.map((s, i) => {
          const passed = s.status === "passed";
          const current = s.status === "current";
          return (
            <span
              key={i}
              style={{
                position: "relative",
                width: current ? 34 : 18,
                height: current ? 34 : 18,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 15,
                background: passed ? V.chip : current ? V.grad : V.base,
                border: passed || current ? "none" : `2px dashed ${V.faint}`,
              }}
            >
              {current ? "🚆" : ""}
            </span>
          );
        })}
      </span>
    </span>
  );
}
