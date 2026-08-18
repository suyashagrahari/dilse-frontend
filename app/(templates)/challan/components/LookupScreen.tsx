"use client";

// ─── Screen 1 — the lookup ───────────────────────────────────────────────────
//
// Thirty seconds of deliberately ugly portal. This screen has one job: to be so
// unmistakably a government web form that the notice on the other side of it is
// already believed before it is read. Every instinct to soften it — a radius, a
// shadow, a nicer grey — costs the whole template. Leave it ugly.
//
// The captcha is decorative. Any input is accepted, including none: gating a
// joke behind a puzzle the user can fail is a worse joke.
//
// No storage of any kind lives in this screen.

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CH, chCaptcha, chWobble } from "./theme";

type Phase = "idle" | "fetching" | "found";

/** How long the "server" takes. Long enough to be believed, short enough to sit through. */
const FETCH_MS = 1400;
/** The beat that lets the red "1 challan found." line be read before the hand-off. */
const HANDOFF_MS = 900;

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
      height={40}
      viewBox="0 0 132 40"
      role="img"
      aria-label={`Verification code, ${chars.join(" ")}`}
      style={{ display: "block", background: "#ffffff", border: `1px solid ${CH.portalEdge}` }}
    >
      <defs>
        <pattern id={`ch-cap-${uid}`} width={6} height={6} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.6} fill="rgba(0,0,0,.16)" />
          <circle cx={4} cy={4} r={0.5} fill="rgba(0,0,0,.11)" />
        </pattern>
      </defs>
      <rect width={132} height={40} fill={`url(#ch-cap-${uid})`} />

      {/* Two struck-through noise curves, the way every portal draws them. */}
      <path
        d={`M2 ${26 + chWobble(text, 91, 6)} Q 44 ${10 + chWobble(text, 92, 8)} 66 ${
          22 + chWobble(text, 93, 6)
        } T 130 ${18 + chWobble(text, 94, 7)}`}
        fill="none"
        stroke="rgba(0,0,0,.34)"
        strokeWidth={1}
      />
      <path
        d={`M2 ${14 + chWobble(text, 95, 5)} Q 50 ${30 + chWobble(text, 96, 7)} 88 ${
          16 + chWobble(text, 97, 6)
        } T 130 ${26 + chWobble(text, 98, 5)}`}
        fill="none"
        stroke="rgba(0,0,0,.22)"
        strokeWidth={1}
      />

      {chars.map((c, i) => {
        const x = stepX * (i + 1);
        const y = 28 + chWobble(text, i, 3.4);
        const rot = chWobble(text, i + 40, 17);
        const skew = chWobble(text, i + 70, 13);
        return (
          <text
            key={`${c}-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            transform={`rotate(${rot.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}) skewX(${skew.toFixed(2)})`}
            style={{
              fontFamily: CH.mono,
              fontSize: 21,
              fontWeight: 700,
              fill: "#2a2a2a",
              letterSpacing: 1,
            }}
          >
            {c}
          </text>
        );
      })}
    </svg>
  );
}

/* ── The spinner ─────────────────────────────────────────────────────────────
   A 1px ring with one heavy quadrant. One-shot in spirit: it exists only for
   the 1.4s of the fetch and is never seen again. Reduced motion stops it dead
   and the adjacent text carries the state instead. */

function Spinner() {
  return (
    <span
      aria-hidden
      className="ch-lk-spin"
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid rgba(0,0,0,.18)",
        borderTopColor: "#333333",
        borderRadius: "50%",
        verticalAlign: "-2px",
      }}
    />
  );
}

export function LookupScreen({ challanNo, onFound }: { challanNo: string; onFound: () => void }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<"challan" | "vehicle">("challan");
  const [value, setValue] = useState(challanNo);
  const [captchaInput, setCaptchaInput] = useState("");
  const [lastNo, setLastNo] = useState(challanNo);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const foundRef = useRef(onFound);

  const captcha = useMemo(() => chCaptcha(challanNo), [challanNo]);

  // The prop is the source of truth until the user starts typing over it.
  // Adjusted during render, not in an effect, so the field never flashes the
  // previous challan number.
  if (lastNo !== challanNo) {
    setLastNo(challanNo);
    setValue(challanNo);
  }

  // The callback is read from a ref so the pending timer never fires a stale
  // one, and so re-rendering with a new handler does not restart the fetch.
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "idle") return;
    setPhase("fetching");
    timers.current.push(
      setTimeout(() => {
        setPhase("found");
        timers.current.push(setTimeout(() => foundRef.current(), HANDOFF_MS));
      }, FETCH_MS),
    );
  }

  const busy = phase !== "idle";

  const fieldLabel: React.CSSProperties = {
    fontFamily: CH.serif,
    fontSize: 12,
    color: "#222222",
    letterSpacing: 0.2,
  };

  return (
    <div
      style={{
        background: CH.portalBg,
        minHeight: "100%",
        padding: "26px 12px 40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <style>{`
        @keyframes ch-lk-rot { to { transform: rotate(360deg); } }
        .ch-lk-spin { animation: ch-lk-rot .8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ch-lk-spin { animation: none; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Portal strip. Invented body, invented service name — nothing here
            imitates a real transport department or its wordmark. */}
        <div
          style={{
            border: `1px solid ${CH.portalEdge}`,
            borderBottom: "none",
            background: "#dfe4e2",
            padding: "8px 10px",
            fontFamily: CH.serif,
            fontSize: 10.5,
            letterSpacing: 1.4,
            color: "#33413c",
            textTransform: "uppercase",
          }}
        >
          Department of Heart Traffic &mdash; Online Services
        </div>

        <form
          onSubmit={submit}
          style={{
            border: `1px solid ${CH.portalEdge}`,
            background: "#ffffff",
            padding: "16px 14px 18px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: CH.serif,
              fontSize: 17,
              fontWeight: 700,
              color: "#1b1b1b",
              letterSpacing: 0.2,
            }}
          >
            Check Challan Status
          </h2>
          <div
            style={{
              height: 1,
              background: CH.portalEdge,
              margin: "9px 0 13px",
            }}
          />

          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ ...fieldLabel, padding: 0, marginBottom: 7 }}>Search by</legend>
            <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
              {(
                [
                  ["challan", "Challan Number"],
                  ["vehicle", "Vehicle Number"],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  htmlFor={`ch-mode-${id}-${uid}`}
                  style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                >
                  <input
                    id={`ch-mode-${id}-${uid}`}
                    type="radio"
                    name={`ch-mode-${uid}`}
                    checked={mode === id}
                    disabled={busy}
                    onChange={() => setMode(id)}
                    style={{ width: 14, height: 14, margin: 0, accentColor: "#3a5a4a" }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor={`ch-no-${uid}`} style={{ ...fieldLabel, display: "block", marginBottom: 5 }}>
            {mode === "challan" ? "Challan Number" : "Vehicle Number"}{" "}
            <span style={{ color: CH.red }}>*</span>
          </label>
          <input
            id={`ch-no-${uid}`}
            value={value}
            disabled={busy}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            style={{
              width: "100%",
              height: 38,
              padding: "0 9px",
              border: `1px solid ${CH.portalEdge}`,
              borderRadius: 0,
              background: busy ? "#f3f3f3" : "#ffffff",
              fontFamily: CH.mono,
              fontSize: 14,
              letterSpacing: 1,
              color: "#111111",
              outlineOffset: 1,
            }}
          />

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 14 }}>
            <div style={{ flex: "none" }}>
              <div style={{ ...fieldLabel, marginBottom: 5 }}>Enter the code</div>
              <Captcha text={captcha} />
            </div>
            <input
              aria-label="Verification code"
              value={captchaInput}
              disabled={busy}
              onChange={(e) => setCaptchaInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              style={{
                flex: 1,
                minWidth: 0,
                height: 40,
                padding: "0 9px",
                border: `1px solid ${CH.portalEdge}`,
                borderRadius: 0,
                background: busy ? "#f3f3f3" : "#ffffff",
                fontFamily: CH.mono,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#111111",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 18,
              width: "100%",
              minHeight: 44,
              border: `1px solid ${CH.portalEdge}`,
              borderRadius: 0,
              background: busy ? "#eeeeee" : CH.portalGrey,
              color: busy ? "#8b8b8b" : "#1b1b1b",
              fontFamily: CH.mono,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.6,
              cursor: busy ? "default" : "pointer",
              boxShadow: "none",
            }}
          >
            [ GET DETAILS ]
          </button>

          {/* Status. One region, so a screen reader is told what the sighted
              user is watching happen. */}
          <div role="status" aria-live="polite" style={{ minHeight: 22, marginTop: 13 }}>
            {phase === "fetching" && (
              <span
                style={{
                  fontFamily: CH.serif,
                  fontSize: 12.5,
                  color: "#333333",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Spinner />
                Fetching from server&hellip;
              </span>
            )}
            {phase === "found" && (
              <span
                style={{
                  fontFamily: CH.serif,
                  fontSize: 13,
                  fontWeight: 700,
                  color: CH.red,
                  letterSpacing: 0.2,
                }}
              >
                1 challan found.
              </span>
            )}
          </div>
        </form>

        <div
          style={{
            border: `1px solid ${CH.portalEdge}`,
            borderTop: "none",
            background: "#f6f6f4",
            padding: "7px 10px",
            fontFamily: CH.serif,
            fontSize: 9,
            lineHeight: 1.5,
            color: "#5c5c5c",
          }}
        >
          For best results use a supported browser. This service is a parody and issues no
          real notices.
        </div>
      </div>
    </div>
  );
}

export default LookupScreen;
