"use client";

// ─── Screen 1 — the lookup ───────────────────────────────────────────────────
//
// The e-challan portal of the (entirely invented) Department of Heart Traffic.
// It keeps every beat of the portal joke — search by challan or vehicle number,
// a skewed captcha that accepts anything, a "server" that takes a second and a
// half, and the one red line: "1 challan found." — but it is dressed in the
// theme the sender picked, so the page feels like a gift from the first frame.
//
// The captcha is decorative. Any input is accepted, including none: gating a
// joke behind a puzzle the user can fail is a worse joke.
//
// No storage of any kind lives in this screen.

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CandyButton, Eyebrow, GradText, GROTESK, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { CH, chCaptcha, chWobble } from "./theme";

type Phase = "idle" | "fetching" | "found";

/** How long the "server" takes. Long enough to be believed, short enough to sit through. */
const FETCH_MS = 1600;
/** The beat that lets the red "1 challan found." line be read before the hand-off. */
const HANDOFF_MS = 1100;

/** What the portal pretends to be doing while it "fetches". */
const SCAN_LINES = ["Connecting to Heart Traffic servers…", "Scanning 1,204 cameras…", "Matching number plate…"];

/* ── The skewed captcha ──────────────────────────────────────────────────────
   Drawn, never an image request and never a font the browser might not have.
   Letters, angles and the strike-through are all derived from the challan
   number, so the same challan always shows the same captcha. */

function Captcha({ text }: { text: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const chars = text.split("");
  const stepX = 132 / (chars.length + 1);

  return (
    <svg
      width={132}
      height={44}
      viewBox="0 0 132 44"
      role="img"
      aria-label={`Verification code, ${chars.join(" ")}`}
      style={{ display: "block", background: "#ffffff", borderRadius: 12, border: `1.5px solid ${V.edge}`, flex: "none" }}
    >
      <defs>
        <pattern id={`ch-cap-${uid}`} width={6} height={6} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.6} fill="rgba(0,0,0,.16)" />
          <circle cx={4} cy={4} r={0.5} fill="rgba(0,0,0,.11)" />
        </pattern>
      </defs>
      <rect width={132} height={44} rx={12} fill={`url(#ch-cap-${uid})`} />
      <path
        d={`M2 ${28 + chWobble(text, 91, 6)} Q 44 ${12 + chWobble(text, 92, 8)} 66 ${24 + chWobble(text, 93, 6)} T 130 ${20 + chWobble(text, 94, 7)}`}
        fill="none"
        stroke="rgba(0,0,0,.34)"
        strokeWidth={1}
      />
      <path
        d={`M2 ${16 + chWobble(text, 95, 5)} Q 50 ${32 + chWobble(text, 96, 7)} 88 ${18 + chWobble(text, 97, 6)} T 130 ${28 + chWobble(text, 98, 5)}`}
        fill="none"
        stroke="rgba(0,0,0,.22)"
        strokeWidth={1}
      />
      {chars.map((c, i) => {
        const x = stepX * (i + 1);
        const y = 30 + chWobble(text, i, 3.4);
        const rot = chWobble(text, i + 40, 17);
        const skew = chWobble(text, i + 70, 13);
        return (
          <text
            key={`${c}-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            transform={`rotate(${rot.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}) skewX(${skew.toFixed(2)})`}
            style={{ fontFamily: CH.mono, fontSize: 21, fontWeight: 700, fill: "#2a2a2a", letterSpacing: 1 }}
          >
            {c}
          </text>
        );
      })}
    </svg>
  );
}

export function LookupScreen({ challanNo, vehicleNo, onFound }: { challanNo: string; vehicleNo: string; onFound: () => void }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<"challan" | "vehicle">("challan");
  const [value, setValue] = useState(challanNo);
  const [captchaInput, setCaptchaInput] = useState("");
  const [scan, setScan] = useState(0);
  const [lastNo, setLastNo] = useState(challanNo);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const foundRef = useRef(onFound);

  const captcha = useMemo(() => chCaptcha(challanNo), [challanNo]);

  // The prop is the source of truth until the user starts typing over it.
  if (lastNo !== challanNo) {
    setLastNo(challanNo);
    setValue(challanNo);
  }

  useEffect(() => {
    foundRef.current = onFound;
  }, [onFound]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach(clearTimeout);
      list.length = 0;
    };
  }, []);

  function pickMode(m: "challan" | "vehicle") {
    if (phase !== "idle") return;
    setMode(m);
    setValue(m === "challan" ? challanNo : vehicleNo);
  }

  function go() {
    if (phase !== "idle") return;
    setPhase("fetching");
    const step = FETCH_MS / SCAN_LINES.length;
    SCAN_LINES.forEach((_, i) => {
      if (i > 0) timers.current.push(setTimeout(() => setScan(i), step * i));
    });
    timers.current.push(
      setTimeout(() => {
        setPhase("found");
        timers.current.push(setTimeout(() => foundRef.current(), HANDOFF_MS));
      }, FETCH_MS),
    );
  }

  const busy = phase !== "idle";

  const label: React.CSSProperties = { fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: V.soft };

  return (
    <div className="ch-wrap" style={{ maxWidth: 460, paddingTop: 8 }}>
      <header className="lv-pop" style={{ textAlign: "center", marginBottom: 18 }}>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontSize: 12, fontWeight: 700, color: V.soft }}
        >
          <span className="ch-siren-dot" aria-hidden />
          Dept. of Heart Traffic · e-Challan portal
        </span>
        <h1 style={{ margin: "14px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(34px, 9vw, 52px)", lineHeight: 0.98, letterSpacing: "-0.045em", color: V.ink }}>
          Check your <GradText>challan</GradText> status
        </h1>
        <p style={{ margin: "10px auto 0", maxWidth: 340, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.3, color: V.soft }}>
          a camera caught something. let&apos;s see what you did.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        style={{ background: V.glass, border: `1px solid ${V.edge}`, borderRadius: 26, padding: "18px 16px 16px", boxShadow: `0 30px 60px -34px ${V.shadow}` }}
      >
        {/* Search by — a segmented control, not two radio dots. */}
        <div role="radiogroup" aria-label="Search by" style={{ display: "flex", padding: 4, borderRadius: 999, background: `color-mix(in srgb, ${V.ink} 7%, transparent)`, gap: 4 }}>
          {(
            [
              ["challan", "Challan no."],
              ["vehicle", "Vehicle no."],
            ] as const
          ).map(([id, text]) => {
            const on = mode === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={busy}
                onClick={() => pickMode(id)}
                className="lv-focus"
                style={{
                  flex: 1,
                  minHeight: 42,
                  borderRadius: 999,
                  border: "none",
                  cursor: busy ? "default" : "pointer",
                  background: on ? V.paper : "transparent",
                  color: on ? V.paperInk : V.soft,
                  fontFamily: GROTESK,
                  fontWeight: 800,
                  fontSize: 14,
                  boxShadow: on ? `0 6px 16px -10px ${V.shadow}` : "none",
                }}
              >
                {text}
              </button>
            );
          })}
        </div>

        {/* The number, typed onto a plate. */}
        <label htmlFor={`ch-no-${uid}`} style={{ ...label, display: "block", margin: "16px 0 7px" }}>
          {mode === "challan" ? "Challan number" : "Vehicle number"} <span style={{ color: V.a1 }}>*</span>
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            borderRadius: 14,
            overflow: "hidden",
            border: "2.5px solid #111",
            background: mode === "vehicle" ? "#ffe45c" : "#ffffff",
            boxShadow: "inset 0 -3px 0 rgba(0,0,0,.08)",
          }}
        >
          <span aria-hidden style={{ flex: "none", width: 34, display: "grid", placeItems: "center", background: "#1d3fb8", color: "#fff", fontSize: 14 }}>
            ♥
          </span>
          <input
            id={`ch-no-${uid}`}
            value={value}
            disabled={busy}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            style={{ flex: 1, minWidth: 0, height: 52, padding: "0 12px", border: "none", background: "transparent", fontFamily: CH.mono, fontSize: 19, fontWeight: 700, letterSpacing: 1.5, color: "#111", textTransform: "uppercase", outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 16 }}>
          <div style={{ flex: "none" }}>
            <div style={{ ...label, marginBottom: 7 }}>Enter the code</div>
            <Captcha text={captcha} />
          </div>
          <input
            aria-label="Verification code"
            value={captchaInput}
            disabled={busy}
            placeholder="any code works"
            onChange={(e) => setCaptchaInput(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              height: 44,
              padding: "0 12px",
              borderRadius: 12,
              border: `1.5px solid ${V.edge}`,
              background: "rgba(255,255,255,.92)",
              fontFamily: CH.mono,
              fontSize: 16,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#111",
            }}
          />
        </div>

        <div style={{ marginTop: 18 }}>
          <CandyButton onClick={go} disabled={busy} ariaLabel="Get challan details">
            {phase === "idle" ? "🔍 Get details" : phase === "fetching" ? "Fetching…" : "🚨 Found"}
          </CandyButton>
        </div>

        {/* Status. One region, so a screen reader hears what a sighted user watches. */}
        <div role="status" aria-live="polite" style={{ minHeight: 54, marginTop: 14, textAlign: "center" }}>
          {phase === "fetching" && (
            <div>
              <div style={{ height: 6, borderRadius: 99, background: `color-mix(in srgb, ${V.ink} 10%, transparent)`, overflow: "hidden" }}>
                <div className="ch-scanbar" style={{ height: "100%", borderRadius: 99, background: V.grad, animationDuration: `${FETCH_MS}ms` }} />
              </div>
              <p style={{ margin: "10px 0 0", fontFamily: CH.mono, fontSize: 13, color: V.soft }}>{SCAN_LINES[scan]}</p>
            </div>
          )}
          {phase === "found" && (
            <p className="lv-slap" style={{ display: "inline-block", margin: "4px 0 0", padding: "8px 16px", borderRadius: 12, border: "2.5px solid var(--ch-red)", color: "var(--ch-red)", background: V.paper, fontFamily: GROTESK, fontSize: 17, fontWeight: 800, letterSpacing: ".04em" }}>
              🚨 1 challan found.
            </p>
          )}
        </div>
      </form>

      <Eyebrow color={V.faint} style={{ textAlign: "center", marginTop: 16, fontSize: 10, letterSpacing: ".16em", lineHeight: 1.6 }}>
        parody portal · issues no real notices · the feelings are real
      </Eyebrow>
    </div>
  );
}

export default LookupScreen;
