"use client";

// ─── The case file ───────────────────────────────────────────────────────────
//
// The Registrar of Hearts' side of the story, in love-kit colours:
//
//   Ceremony    the live "court log" that plays before the reveal — ID check,
//               objections read out and slapped OVERRULED, witnesses' ink
//               drawing in, the registrar's stamp.
//   Objections  every objection on record, each one overruled.
//   Register    the dot-leader entries, the three witness lines and the
//               registrar's hand.
//
// Everything is deterministic (no clock, no Math.random) so the server and the
// browser render the same thing.

import { useEffect, useState } from "react";

import { Eyebrow, GROTESK, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { type CertificateData, padWitnesses, splitRegisteredOn } from "./types";

/** Funny, fond, fixed. The first `objectionCount` are read out — all overruled. */
const OBJECTIONS = [
  { text: "He snores like a pressure cooker on its third whistle.", by: "the neighbours" },
  { text: "She steals the entire blanket every single night.", by: "a very cold witness" },
  { text: "Both of them eat Maggi at 3 AM and call it dinner.", by: "the hostel warden" },
  { text: "He still hasn't returned my phone charger.", by: "his best friend" },
  { text: "She takes 45 minutes to “get ready in 5”.", by: "everyone, ever" },
  { text: "They are too cute together. It is honestly annoying.", by: "the group chat" },
  { text: "Mummy had shortlisted a doctor.", by: "a concerned aunty" },
];

export function objectionsFor(count: number) {
  return OBJECTIONS.slice(0, Math.max(0, Math.min(OBJECTIONS.length, Math.round(count))));
}

export const firstName = (name: string): string => name.trim().split(/\s+/)[0] || name || "—";

export function registeredLabel(iso: string): string {
  const d = splitRegisteredOn(iso);
  return d.day === "—" ? "today" : `${d.day} ${d.month} ${d.year}`;
}

export const CASE_CSS = `
@keyframes cm-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
@keyframes cm-blink { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
.cm-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: cm-draw 1.4s ease-out forwards; }
.cm-blink { animation: cm-blink 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .cm-draw { animation: none; stroke-dashoffset: 0; } .cm-blink { animation: none; } }
`;

// ─── Ink ─────────────────────────────────────────────────────────────────────

/** A signature in the 0 0 160 48 box. `draw` animates the pen stroke in. */
export function Signature({ d, draw, delay = 0, color = "currentColor", height = 44 }: { d: string; draw: boolean; delay?: number; color?: string; height?: number }) {
  if (!d) return <span style={{ display: "block", height }} />;
  return (
    <svg viewBox="0 0 160 48" style={{ width: "100%", height, display: "block", overflow: "visible" }} aria-hidden>
      <path
        d={d}
        pathLength={1}
        fill="none"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={draw ? "cm-draw" : undefined}
        style={{ stroke: color, animationDelay: `${delay}ms` }}
      />
    </svg>
  );
}

/** The big rubber stamp. `slap` plays the thump-in. */
export function Stamp({ label, sub, slap, tone = "a1", size = 1, tilt = -10 }: { label: string; sub?: string; slap?: boolean; tone?: "a1" | "a3" | "ok"; size?: number; tilt?: number }) {
  const color = tone === "ok" ? "#1f9d55" : tone === "a3" ? V.a3 : V.a1;
  return (
    <span
      className={slap ? "lv-slap" : undefined}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${6 * size}px ${14 * size}px`,
        border: `${3 * size}px double ${color}`,
        borderRadius: 10 * size,
        color,
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 18 * size,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        lineHeight: 1.05,
        transform: `rotate(${tilt}deg)`,
        background: "color-mix(in srgb, var(--lv-base) 35%, transparent)",
        mixBlendMode: "normal",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {sub && <span style={{ fontSize: 9 * size, letterSpacing: ".2em", marginTop: 2, opacity: 0.85 }}>{sub}</span>}
    </span>
  );
}

// ─── The ceremony ────────────────────────────────────────────────────────────

type LogLine = { key: string; icon: string; text: string; done?: string; stamp?: string; by?: string; sign?: boolean };

export function Ceremony({ data, reduceMotion, onDone }: { data: CertificateData; reduceMotion: boolean; onDone: () => void }) {
  const a = firstName(data.partyA.name);
  const b = firstName(data.partyB.name);
  const objections = objectionsFor(data.objectionCount).slice(0, 3);
  const witnesses = padWitnesses(data.witnesses);
  const signed = witnesses.filter((w) => w.name.trim() && w.signaturePath).length;
  const registered = data.certificateState === "registered";

  const lines: LogLine[] = [
    { key: "id", icon: "🪪", text: `Verifying ${a} & ${b}'s ID proofs`, done: "Instagram thoroughly stalked ✓" },
    { key: "obj", icon: "📣", text: "Calling for objections…", done: data.objectionCount ? `${data.objectionCount} received. Reading them out.` : "Silence. Even the clerk teared up." },
    ...objections.map((o, i) => ({ key: `o${i}`, icon: "🙅", text: `“${o.text}”`, by: o.by, stamp: "overruled" })),
    { key: "sign", icon: "✍️", text: signed ? `${signed} witness${signed === 1 ? "" : "es"} signing…` : "Witnesses? Signing later, apparently.", sign: true },
    { key: "seal", icon: "🏛️", text: registered ? "The Registrar reaches for the stamp…" : "Registrar waiting on the last witness…" },
  ];

  const [shown, setShown] = useState(reduceMotion ? lines.length : 1);
  const step = 950;

  useEffect(() => {
    if (shown >= lines.length) {
      const t = window.setTimeout(onDone, reduceMotion ? 500 : 1300);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setShown((n) => n + 1), step);
    return () => window.clearTimeout(t);
  }, [shown, lines.length, onDone, reduceMotion]);

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }} aria-live="polite">
      <Eyebrow color={V.a1} style={{ textAlign: "center" }}>
        <span className="cm-blink" style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: V.a1, marginRight: 8, verticalAlign: "middle" }} />
        live from the registrar&apos;s office · {data.certificateNo}
      </Eyebrow>
      <ol style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {lines.slice(0, shown).map((l) => (
          <li
            key={l.key}
            className={reduceMotion ? "" : "lv-pop"}
            style={{
              position: "relative",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "12px 14px",
              borderRadius: 18,
              background: V.glass,
              border: `1px solid ${V.edge}`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1.1 }} aria-hidden>
              {l.icon}
            </span>
            <span style={{ flex: 1, minWidth: 0, paddingRight: l.stamp ? 96 : 0 }}>
              <span style={{ display: "block", fontWeight: 800, fontSize: 15.5, lineHeight: 1.3, fontFamily: l.stamp ? ITALIC : GROTESK, fontStyle: l.stamp ? "italic" : "normal", ...(l.stamp ? { fontWeight: 400, fontSize: 19 } : {}) }}>{l.text}</span>
              {l.by && <span style={{ display: "block", marginTop: 2, fontSize: 12, color: V.faint, fontWeight: 600 }}>— objection by {l.by}</span>}
              {l.done && <span style={{ display: "block", marginTop: 2, fontSize: 13, color: V.soft, fontWeight: 600 }}>{l.done}</span>}
              {l.sign && (
                <span style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 8, color: V.ink }}>
                  {witnesses.map((w, i) => (
                    <span key={i} style={{ borderBottom: `1.5px solid ${V.edge}`, paddingBottom: 2 }}>
                      <Signature d={w.name.trim() ? w.signaturePath : ""} draw={!reduceMotion} delay={i * 350} height={30} />
                    </span>
                  ))}
                </span>
              )}
            </span>
            {l.stamp && (
              <span style={{ position: "absolute", right: 10, top: "50%", marginTop: -18 }}>
                <Stamp label={l.stamp} slap={!reduceMotion} size={0.72} tilt={-12} />
              </span>
            )}
          </li>
        ))}
      </ol>
      <div style={{ marginTop: 16, height: 8, borderRadius: 99, background: "color-mix(in srgb, var(--lv-ink) 12%, transparent)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${Math.round((shown / lines.length) * 100)}%`, borderRadius: 99, background: V.grad, transition: "width .6s ease" }} />
      </div>
    </div>
  );
}

// ─── Objections sheet ────────────────────────────────────────────────────────

export function ObjectionsList({ count, reduceMotion }: { count: number; reduceMotion: boolean }) {
  const list = objectionsFor(count);
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <p style={{ margin: "0 0 14px", textAlign: "center", fontSize: 15, color: V.soft, fontWeight: 600 }}>
        Objections received: <b style={{ color: V.ink }}>{count}</b> · upheld: <b style={{ color: V.ink }}>0</b>
      </p>
      {list.length === 0 && (
        <p style={{ textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, color: V.ink }}>Not a single objection. The clerk needed a moment. 🥹</p>
      )}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((o, i) => (
          <li
            key={i}
            className={reduceMotion ? "" : "lv-pop"}
            style={{ animationDelay: `${i * 90}ms`, position: "relative", padding: "16px 16px 16px 18px", borderRadius: 18, background: V.paper, color: V.paperInk, boxShadow: `0 18px 36px -22px ${V.shadow}`, overflow: "hidden" }}
          >
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: V.paperSoft }}>objection no. {i + 1}</p>
            <p style={{ margin: "6px 0 0", paddingRight: 104, fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.25 }}>“{o.text}”</p>
            <p style={{ margin: "6px 0 0", fontSize: 12.5, fontWeight: 600, color: V.paperSoft }}>— filed by {o.by}</p>
            <span style={{ position: "absolute", right: 12, top: "50%", marginTop: -20 }}>
              <Stamp label="overruled" slap={!reduceMotion} size={0.8} tilt={-14} />
            </span>
          </li>
        ))}
      </ol>
      {count > list.length && (
        <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 13, color: V.faint }}>…and {count - list.length} more, all overruled in bulk.</p>
      )}
    </div>
  );
}

// ─── Register sheet ──────────────────────────────────────────────────────────

export function Register({ data, reduceMotion }: { data: CertificateData; reduceMotion: boolean }) {
  const witnesses = padWitnesses(data.witnesses);
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ borderRadius: 22, padding: "20px 18px", background: V.paper, color: V.paperInk, boxShadow: `0 22px 44px -26px ${V.shadow}` }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>
          register entry · {data.certificateNo}
        </p>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {([data.partyA, data.partyB] as const).map((p, i) => (
            <div key={i} style={{ borderRadius: 14, padding: "10px 12px", background: "color-mix(in srgb, var(--lv-paper-ink) 5%, transparent)" }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: V.paperSoft }}>party {i ? "B" : "A"}</p>
              <p style={{ margin: "3px 0 0", fontWeight: 800, fontSize: 16, lineHeight: 1.2, overflowWrap: "anywhere" }}>{p.name || "—"}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: V.paperSoft }}>
                {p.age ? `${p.age} yrs` : ""}
                {p.age && p.city ? " · " : ""}
                {p.city}
              </p>
            </div>
          ))}
        </div>
        <dl style={{ margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {data.fields.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 15 }}>
              <dt style={{ fontWeight: 600, flexShrink: 1, minWidth: 0 }}>{f.label}</dt>
              <span aria-hidden style={{ flex: 1, minWidth: 16, borderBottom: `2px dotted ${V.paperSoft}`, opacity: 0.6, transform: "translateY(-4px)" }} />
              <dd style={{ margin: 0, fontWeight: 800, fontFamily: "var(--font-courier-prime), ui-monospace, monospace", whiteSpace: "nowrap" }}>{f.value}</dd>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 15 }}>
            <dt style={{ fontWeight: 600 }}>Registered on</dt>
            <span aria-hidden style={{ flex: 1, minWidth: 16, borderBottom: `2px dotted ${V.paperSoft}`, opacity: 0.6, transform: "translateY(-4px)" }} />
            <dd style={{ margin: 0, fontWeight: 800, fontFamily: "var(--font-courier-prime), ui-monospace, monospace", whiteSpace: "nowrap" }}>{registeredLabel(data.registeredOn)}</dd>
          </div>
        </dl>
      </div>

      <div style={{ borderRadius: 22, padding: "18px", background: V.glass, border: `1px solid ${V.edge}` }}>
        <Eyebrow color={V.a1}>signed in the presence of</Eyebrow>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          {witnesses.map((w, i) => {
            const on = Boolean(w.name.trim() && w.signaturePath);
            return (
              <div key={i} style={{ minWidth: 0 }}>
                <div style={{ borderBottom: `1.5px solid ${V.edge}`, color: V.ink }}>
                  <Signature d={on ? w.signaturePath : ""} draw={!reduceMotion} delay={i * 400} height={40} />
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: on ? V.ink : V.faint }}>{on ? w.name : "awaiting signature"}</p>
                <p style={{ margin: 0, fontSize: 10.5, color: V.faint, fontWeight: 600 }}>witness {i + 1}</p>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ width: "min(220px, 60%)", color: V.a3 }}>
            <Signature d={data.registrarSignaturePath} draw={!reduceMotion} delay={1300} height={44} color="var(--lv-a3)" />
            <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: V.faint, letterSpacing: ".08em", textTransform: "uppercase" }}>Registrar of Hearts</p>
          </div>
          <Stamp
            label={data.certificateState === "registered" ? "registered" : "pending"}
            sub={data.certificateState === "registered" ? "office of hearts ✓" : "awaiting witnesses"}
            slap={!reduceMotion}
            tone={data.certificateState === "registered" ? "a1" : "a3"}
            size={0.9}
          />
        </div>
      </div>
    </div>
  );
}
