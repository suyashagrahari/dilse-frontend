"use client";

// ─── The case file ───────────────────────────────────────────────────────────
//
// The Registrar of Hearts' side of the story, in love-kit colours:
//
//   Ceremony    the live "court log" that plays before the reveal — ID check,
//               objections read out and slapped OVERRULED, witnesses' ink
//               drawing in, the registrar's stamp.
//   ObjectionCourt   every objection on record as a card the recipient taps
//                    to slam the gavel and stamp OVERRULED.
//   RegisterSigning  the witnesses' ink draws in, then the recipient signs a
//                    pad themselves (or taps to sign with a heart).
//
// Everything is deterministic (no clock, no Math.random) so the server and the
// browser render the same thing.

import { useEffect, useRef, useState } from "react";

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
@keyframes cm-gavel { 0% { transform: rotate(-60deg) translateY(-10px); opacity: 0 } 40% { transform: rotate(10deg); opacity: 1 } 70% { transform: rotate(-4deg) } 100% { transform: rotate(0deg); opacity: 0 } }
.cm-gavel { animation: cm-gavel .7s cubic-bezier(.3,1.4,.5,1) forwards; transform-origin: 80% 80%; pointer-events: none; }
.cm-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: cm-draw 1.4s ease-out forwards; }
.cm-blink { animation: cm-blink 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .cm-draw { animation: none; stroke-dashoffset: 0; } .cm-blink, .cm-gavel { animation: none; } }
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

// ─── Objections: the recipient overrules them ────────────────────────────────

/** Each objection is a card; tapping it slams the gavel and stamps OVERRULED. */
export function ObjectionCourt({ count, reduceMotion, onAllOverruled }: { count: number; reduceMotion: boolean; onAllOverruled: () => void }) {
  const list = objectionsFor(count).slice(0, 4);
  const [ruled, setRuled] = useState<Set<number>>(() => new Set());
  const [gavel, setGavel] = useState<number | null>(null);
  const reported = useRef(false);

  // No objections at all: nothing to overrule, the chapter is complete.
  useEffect(() => {
    if (list.length === 0 && !reported.current) {
      reported.current = true;
      onAllOverruled();
    }
  }, [list.length, onAllOverruled]);

  const overrule = (i: number) => {
    if (ruled.has(i)) return;
    setGavel(i);
    const next = new Set(ruled).add(i);
    setRuled(next);
    if (next.size === list.length && !reported.current) {
      reported.current = true;
      onAllOverruled();
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 620, margin: "0 auto" }}>
      <p style={{ margin: "0 0 14px", textAlign: "center", fontSize: 15, color: V.soft, fontWeight: 700 }} aria-live="polite">
        {list.length === 0
          ? "Not a single objection. The clerk needed a moment. 🥹"
          : ruled.size === list.length
            ? `All ${list.length} overruled. Court is pleased. ⚖️`
            : `${list.length - ruled.size} objection${list.length - ruled.size === 1 ? "" : "s"} left · tap to overrule`}
      </p>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((o, i) => {
          const on = ruled.has(i);
          return (
            <li key={i} className={reduceMotion ? "" : "lv-pop"} style={{ animationDelay: `${i * 90}ms` }}>
              <button
                type="button"
                onClick={() => overrule(i)}
                aria-pressed={on}
                aria-label={on ? `Objection ${i + 1} overruled` : `Overrule objection ${i + 1}: ${o.text}`}
                className="lv-focus"
                style={{
                  position: "relative",
                  width: "100%",
                  textAlign: "left",
                  padding: "16px 16px 16px 18px",
                  borderRadius: 18,
                  border: "none",
                  cursor: on ? "default" : "pointer",
                  background: V.paper,
                  color: V.paperInk,
                  boxShadow: `0 18px 36px -22px ${V.shadow}`,
                  overflow: "hidden",
                  fontFamily: GROTESK,
                  opacity: on ? 0.82 : 1,
                  transition: "opacity .3s ease",
                }}
              >
                <span style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: V.paperSoft }}>objection no. {i + 1}</span>
                <span style={{ display: "block", margin: "6px 0 0", paddingRight: on ? 100 : 56, fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, lineHeight: 1.25, textDecorationLine: on ? "line-through" : "none", textDecorationColor: "color-mix(in srgb, var(--lv-a1) 60%, transparent)" }}>“{o.text}”</span>
                <span style={{ display: "block", margin: "6px 0 0", fontSize: 12.5, fontWeight: 600, color: V.paperSoft }}>— filed by {o.by}</span>
                {on ? (
                  <span style={{ position: "absolute", right: 12, top: "50%", marginTop: -20 }}>
                    <Stamp label="overruled" slap={!reduceMotion} size={0.8} tilt={-14} />
                  </span>
                ) : (
                  <span aria-hidden style={{ position: "absolute", right: 14, top: "50%", marginTop: -20, width: 40, height: 40, borderRadius: "50%", background: V.grad, display: "grid", placeItems: "center", fontSize: 20 }}>
                    🔨
                  </span>
                )}
                {gavel === i && !reduceMotion && (
                  <span aria-hidden className="cm-gavel" style={{ position: "absolute", right: 70, top: 6, fontSize: 34 }}>
                    🔨
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      {count > list.length && ruled.size === list.length && (
        <p style={{ margin: "14px 0 0", textAlign: "center", fontSize: 13, color: V.faint }}>…and {count - list.length} more, overruled in bulk.</p>
      )}
    </div>
  );
}

// ─── Register: the witnesses sign, then the recipient does ───────────────────

/** Witness lines draw in one by one; then a pad where the recipient signs. */
export function RegisterSigning({ data, signer, reduceMotion, onSigned }: { data: CertificateData; signer: string; reduceMotion: boolean; onSigned: () => void }) {
  const witnesses = padWitnesses(data.witnesses);
  const [points, setPoints] = useState<string[]>([]);
  const [stroke, setStroke] = useState<[number, number][]>([]);
  const [signed, setSigned] = useState(false);
  const drawing = useRef(false);
  const inked = useRef(0);
  const padRef = useRef<SVGSVGElement>(null);

  const finish = () => {
    if (signed) return;
    setSigned(true);
    onSigned();
  };

  const at = (e: React.PointerEvent): [number, number] => {
    const r = padRef.current!.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / r.width) * 320), Math.round(((e.clientY - r.top) / r.height) * 110)];
  };
  const down = (e: React.PointerEvent) => {
    if (signed) return;
    drawing.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setStroke([at(e)]);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = at(e);
    setStroke((s) => {
      const last = s[s.length - 1];
      if (last) inked.current += Math.hypot(p[0] - last[0], p[1] - last[1]);
      return [...s, p];
    });
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (stroke.length > 1) setPoints((ps) => [...ps, stroke.map((p) => p.join(",")).join(" ")]);
    setStroke([]);
    // Enough ink is a signature.
    if (inked.current > 160) finish();
  };
  const autoSign = () => {
    setPoints(["20,70 40,40 55,75 70,35 90,72 105,50 125,70 150,38 170,70 190,55 215,72 240,45 262,66", "250,30 262,22 274,30 262,46 250,30"]);
    finish();
  };

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 22, padding: "16px 18px", background: V.glass, border: `1px solid ${V.edge}` }}>
        <Eyebrow color={V.a1}>signed in the presence of</Eyebrow>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
          {witnesses.map((w, i) => {
            const on = Boolean(w.name.trim() && w.signaturePath);
            return (
              <div key={i} style={{ minWidth: 0 }}>
                <div style={{ borderBottom: `1.5px solid ${V.edge}`, color: V.ink }}>
                  <Signature d={on ? w.signaturePath : ""} draw={!reduceMotion} delay={300 + i * 700} height={38} />
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: on ? V.ink : V.faint }}>{on ? w.name : "awaiting"}</p>
                <p style={{ margin: 0, fontSize: 10.5, color: V.faint, fontWeight: 600 }}>witness {i + 1}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "relative", borderRadius: 22, padding: "16px 18px 14px", background: V.paper, color: V.paperInk, boxShadow: `0 22px 44px -26px ${V.shadow}` }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>
          {signed ? `signed by ${signer} ✓` : `your turn, ${signer} — sign here ✍️`}
        </p>
        <svg
          ref={padRef}
          viewBox="0 0 320 110"
          role="img"
          aria-label={signed ? `${signer}'s signature` : "Signature pad: draw your signature"}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ marginTop: 8, width: "100%", height: "auto", aspectRatio: "320 / 110", display: "block", touchAction: "none", cursor: signed ? "default" : "crosshair", borderRadius: 14, background: "color-mix(in srgb, var(--lv-paper-ink) 4%, transparent)" }}
        >
          <line x1="16" y1="88" x2="304" y2="88" style={{ stroke: "color-mix(in srgb, var(--lv-paper-ink) 30%, transparent)" }} strokeWidth="1.2" strokeDasharray="4 5" />
          {!signed && points.length === 0 && stroke.length === 0 && (
            <text x="160" y="62" textAnchor="middle" style={{ fill: "color-mix(in srgb, var(--lv-paper-ink) 35%, transparent)", fontFamily: "var(--font-di-serif), Georgia, serif", fontStyle: "italic", fontSize: 22 }}>
              draw your signature here
            </text>
          )}
          {[...points, stroke.map((p) => p.join(",")).join(" ")].filter(Boolean).map((pts, i) => (
            <polyline key={i} points={pts} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--lv-a1)" }} />
          ))}
        </svg>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          {!signed ? (
            <button type="button" onClick={autoSign} className="lv-focus" style={{ background: "none", border: "none", padding: "8px 0", color: V.paperSoft, fontWeight: 700, fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", fontFamily: GROTESK }}>
              or tap to sign with a heart
            </button>
          ) : (
            <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: V.paperSoft }}>witnessed, sealed & signed</span>
          )}
          {signed && <Stamp label="registered" sub="office of hearts ✓" slap={!reduceMotion} size={0.8} />}
        </div>
      </div>
    </div>
  );
}
