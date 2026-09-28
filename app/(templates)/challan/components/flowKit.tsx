"use client";

// ─── Challan — small shared pieces for the settle / evidence / order screens ─
//
// Paper cards sit ON the themed page: the document bits are paper (V.paper +
// the paper ink), everything sincere is printed straight onto the page in the
// big italic serif — "outside the document", which is where the sender stops
// performing and talks.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { CandyButton, ITALIC } from "../../_love/LoveKit";
import { GifMoment } from "../../_love/Story";
import { V } from "../../_love/theme";
import { CH } from "./theme";

export interface NextAction {
  label: string;
  onClick: () => void;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** A sheet of the notice's paper, floating on the themed page. */
export function PaperCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: CH.paper,
        color: CH.ink,
        borderRadius: 22,
        padding: "18px 16px 18px",
        boxShadow: `0 28px 60px -32px ${V.shadow}, 0 0 0 1px color-mix(in srgb, var(--lv-paper-ink) 8%, transparent)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: "0 0 12px", fontFamily: CH.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", color: CH.faint, textTransform: "uppercase" }}>{children}</p>
  );
}

/** The sincere payload. Big italic serif, straight on the page, room to breathe. */
export function SerifMessage({ lines }: { lines: string[] }) {
  const clean = lines.filter((l) => l && l.trim().length > 0);
  if (clean.length === 0) return null;
  return (
    <div style={{ padding: "34px 6px 4px" }}>
      {clean.map((line, i) => (
        <p
          key={`${i}-${line.slice(0, 16)}`}
          className="lv-pop"
          style={{
            margin: i === 0 ? 0 : "18px 0 0",
            fontFamily: ITALIC,
            fontSize: i === 0 ? 27 : 21,
            lineHeight: i === 0 ? 1.15 : 1.42,
            letterSpacing: i === 0 ? "-0.01em" : 0,
            color: i === 0 ? V.ink : V.soft,
            overflowWrap: "anywhere",
            animationDelay: `${300 + i * 220}ms`,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <svg width={52} height={52} viewBox="0 0 46 46" aria-hidden="true" focusable="false">
      <circle cx="23" cy="23" r="19" fill="none" stroke="color-mix(in srgb, var(--lv-ink) 16%, transparent)" strokeWidth="3.5" />
      <circle className="ch-spin" cx="23" cy="23" r="19" fill="none" stroke={V.a1} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="30 90" />
    </svg>
  );
}

/** The GIF reaction, then the button that carries them on to the next act. */
export function NextStep({ gif, gifCaption, next, delay = 0 }: { gif?: string; gifCaption?: string; next: NextAction | null; delay?: number }) {
  const [show, setShow] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const t = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  return (
    <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {gif ? (
        <div style={{ minHeight: 112 }}>
          <GifMoment src={gif} caption={gifCaption} show={show} size={104} />
        </div>
      ) : null}
      {next ? (
        <div style={{ width: "100%", maxWidth: 420 }}>
          <CandyButton onClick={next.onClick}>{next.label}</CandyButton>
        </div>
      ) : null}
    </div>
  );
}
