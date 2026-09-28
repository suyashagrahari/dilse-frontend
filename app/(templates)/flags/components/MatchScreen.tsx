"use client";

// ─── Screen 4 — it's a match 💚 ──────────────────────────────────────────────
//
// The payoff. Two photo bubbles slide into each other, hearts burst, "it's a
// match" lands, and the sender's closing line arrives as a chat bubble. Then
// one yes/no question (the "no" button runs away) and the main letter opens as
// a message — typing dots first, then the whole thing.
//
// Old pages with no letter get the match moment and the closing line only.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";
import { templateMedia } from "@/lib/templateMedia";

import { HeartBurst } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { Photo } from "./bits";
import { GROTESK, ITALIC } from "./flagsTheme";

interface MatchScreenProps {
  senderName: string;
  recipientName: string;
  closing: string;
  letter: string;
  photos: LovePhoto[];
  gif?: string;
  lockQuestion: string;
  lockAnswer: string;
  live: boolean;
  reduced: boolean;
  onReplay: () => void;
}

const MATCH_CSS = `
@keyframes fl-left { from { transform: translateX(-120px) rotate(-18deg); opacity: 0 } to { transform: translateX(14px) rotate(-8deg); opacity: 1 } }
@keyframes fl-right { from { transform: translateX(120px) rotate(18deg); opacity: 0 } to { transform: translateX(-14px) rotate(8deg); opacity: 1 } }
@keyframes fl-heart { 0% { transform: scale(0) rotate(-20deg) } 70% { transform: scale(1.25) rotate(8deg) } 100% { transform: scale(1) rotate(0) } }
@keyframes fl-type { 0%, 80%, 100% { transform: translateY(0); opacity: .4 } 40% { transform: translateY(-5px); opacity: 1 } }
@keyframes fl-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
.fl-l { animation: fl-left .7s cubic-bezier(.2,.9,.3,1.2) both; }
.fl-r { animation: fl-right .7s cubic-bezier(.2,.9,.3,1.2) both; }
.fl-h { animation: fl-heart .6s .55s cubic-bezier(.2,.9,.3,1.4) both; }
.fl-rise { animation: fl-rise .55s cubic-bezier(.2,.9,.3,1.1) both; }
.fl-dot { display: inline-block; width: 8px; height: 8px; border-radius: 99px; background: currentColor; animation: fl-type 1s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fl-l, .fl-r, .fl-h, .fl-rise, .fl-dot { animation: none !important; } }
`;

function Bubble({ photo, fallback, cls, z }: { photo?: LovePhoto; fallback: string; cls: string; z: number }) {
  return (
    <div className={cls} style={{ position: "relative", zIndex: z, width: 132, height: 132, borderRadius: "50%", overflow: "hidden", border: `5px solid ${V.paper}`, boxShadow: `0 20px 44px -18px ${V.shadow}`, background: V.grad, display: "grid", placeItems: "center" }}>
      {photo ? <Photo photo={photo} eager /> : <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: 64, color: "#fff", lineHeight: 1 }}>{(fallback[0] ?? "?").toUpperCase()}</span>}
    </div>
  );
}

export default function MatchScreen({ senderName, recipientName, closing, letter, photos, gif, lockQuestion, lockAnswer, live, reduced, onReplay }: MatchScreenProps) {
  const hasLetter = letter.trim().length > 0;
  const [stage, setStage] = useState<"match" | "typing" | "letter">("match");
  const [burst, setBurst] = useState(!reduced);
  const [dodge, setDodge] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!burst) return;
    const t = window.setTimeout(() => setBurst(false), 1500);
    return () => window.clearTimeout(t);
  }, [burst]);

  const open = () => {
    setStage("typing");
    window.setTimeout(() => setStage("letter"), reduced ? 0 : 1300);
  };

  useEffect(() => {
    if (stage === "letter") letterRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [stage, reduced]);

  const runAway = () => {
    const n = dodge + 1;
    setDodge(n);
    const xs = [-96, 92, -70, 110, -104, 64];
    const ys = [-46, 30, 52, -58, 12, -30];
    setPos({ x: xs[n % xs.length], y: ys[n % ys.length] });
  };
  const gaveUp = dodge >= 5;

  const q = lockQuestion.trim() || "swipe right on me for real?";
  const a = lockAnswer.trim() || "obviously 💚";
  const noLabels = ["no", "wait—", "nice try", "nope 🏃", "can't catch me", "okay fine, yes"];

  return (
    <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, margin: "0 auto", minHeight: "100dvh", padding: "calc(env(safe-area-inset-top, 0px) + 72px) 18px calc(env(safe-area-inset-bottom, 0px) + 40px)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{MATCH_CSS}</style>

      {/* ── the match moment ──────────────────────────────────────────── */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: 160, marginTop: 6 }}>
        <Bubble photo={photos[0]} fallback={recipientName} cls="fl-l" z={1} />
        <Bubble photo={photos[1] ?? photos[0]} fallback={senderName} cls="fl-r" z={2} />
        <span className="fl-h" aria-hidden style={{ position: "absolute", zIndex: 3, left: "50%", bottom: -6, marginLeft: -28, width: 56, height: 56, borderRadius: 99, background: V.paper, display: "grid", placeItems: "center", fontSize: 30, boxShadow: `0 12px 26px -10px ${V.shadow}` }}>
          💚
        </span>
        {burst && <HeartBurst glyphs={["💚", "🚩", "✨", "💖", "🫶"]} />}
      </div>

      <h2 className="fl-rise" style={{ margin: "30px 0 0", textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(56px, 17vw, 84px)", lineHeight: 0.9, letterSpacing: "-0.01em", animationDelay: "0.35s" }}>
        <span style={{ background: V.gradText, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>it&apos;s a match</span>
      </h2>
      <p className="fl-rise" style={{ margin: "12px 0 0", textAlign: "center", fontFamily: GROTESK, fontSize: 15.5, fontWeight: 600, color: V.soft, animationDelay: "0.5s" }}>
        you and {senderName} swiped right on each other. red flags included.
      </p>

      {/* closing line, as a chat bubble */}
      {closing.trim() && (
        <div className="fl-rise" style={{ alignSelf: "stretch", display: "flex", gap: 10, alignItems: "flex-end", marginTop: 26, animationDelay: "0.7s" }}>
          <span aria-hidden style={{ width: 34, height: 34, borderRadius: 99, background: V.grad, color: "#fff", display: "grid", placeItems: "center", fontFamily: GROTESK, fontWeight: 900, fontSize: 14, flex: "0 0 auto" }}>
            {(senderName[0] ?? "?").toUpperCase()}
          </span>
          <div style={{ background: V.paper, color: V.paperInk, borderRadius: "22px 22px 22px 6px", padding: "13px 16px", boxShadow: `0 14px 34px -22px ${V.shadow}`, border: `1px solid ${V.edge}`, maxWidth: "85%" }}>
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 16, lineHeight: 1.4, overflowWrap: "anywhere" }}>{closing}</p>
          </div>
        </div>
      )}

      {/* ── the lock ──────────────────────────────────────────────────── */}
      {hasLetter && stage === "match" && (
        <div className="fl-rise" style={{ alignSelf: "stretch", marginTop: 26, padding: "20px 18px 22px", borderRadius: 28, background: V.glass, border: `1px solid ${V.edge}`, textAlign: "center", animationDelay: "0.9s" }}>
          <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: V.a1 }}>1 new message 💌 · locked</p>
          <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 28, lineHeight: 1.1, color: V.ink }}>{q}</p>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 18, minHeight: 60 }}>
            <button
              type="button"
              onClick={open}
              className="lv-cta lv-focus lv-pulse"
              style={{ minHeight: 54, padding: "0 26px", borderRadius: 999, border: "none", background: V.grad, color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 17, cursor: "pointer" }}
            >
              {a}
            </button>
            <button
              type="button"
              onClick={gaveUp ? open : runAway}
              onPointerEnter={gaveUp || reduced ? undefined : runAway}
              className="lv-focus"
              style={{
                minHeight: 46,
                padding: "0 18px",
                borderRadius: 999,
                border: `1.5px solid ${V.edge}`,
                background: V.paper,
                color: V.paperInk,
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transform: gaveUp ? "none" : `translate(${pos.x}px, ${pos.y}px) scale(${1 - Math.min(dodge, 4) * 0.07})`,
                transition: "transform .25s cubic-bezier(.2,.9,.3,1.3)",
                whiteSpace: "nowrap",
              }}
            >
              {noLabels[Math.min(dodge, noLabels.length - 1)]}
            </button>
          </div>
        </div>
      )}

      {stage === "typing" && (
        <div className="fl-rise" style={{ alignSelf: "flex-start", marginTop: 22, marginLeft: 44, padding: "14px 18px", borderRadius: "22px 22px 22px 6px", background: V.paper, color: V.a1, display: "flex", gap: 6, border: `1px solid ${V.edge}` }} aria-label={`${senderName} is typing`}>
          <span className="fl-dot" />
          <span className="fl-dot" style={{ animationDelay: ".15s" }} />
          <span className="fl-dot" style={{ animationDelay: ".3s" }} />
        </div>
      )}

      {/* ── the letter ────────────────────────────────────────────────── */}
      {stage === "letter" && (
        <div ref={letterRef} className="fl-rise" style={{ alignSelf: "stretch", marginTop: 24, scrollMarginTop: 70 }}>
          <div style={{ position: "relative", background: V.paper, color: V.paperInk, borderRadius: 30, padding: "26px 22px 26px", boxShadow: `0 30px 70px -34px ${V.shadow}`, border: `1px solid ${V.edge}`, overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: V.grad }} />
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: V.a1 }}>from {senderName.toLowerCase()}, for {recipientName.toLowerCase()} 💌</p>
            <div style={{ marginTop: 14, fontFamily: GROTESK, fontSize: 17, lineHeight: 1.62, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{letter}</div>
            {gif && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gif} alt="" style={{ display: "block", width: 110, height: 110, objectFit: "cover", borderRadius: 22, margin: "18px 0 0 auto", transform: "rotate(5deg)", border: `4px solid ${V.base}`, boxShadow: `0 14px 30px -14px ${V.shadow}` }} />
            )}
          </div>
        </div>
      )}

      {!hasLetter && !reduced && (
        <video src={templateMedia("flags", "final-card.webm")} autoPlay loop muted playsInline aria-hidden="true" style={{ width: "min(150px, 38vw)", height: "auto", marginTop: 22, pointerEvents: "none" }} />
      )}

      {(stage === "letter" || !hasLetter) && (
        <div className="fl-rise" style={{ alignSelf: "stretch", display: "grid", gap: 10, marginTop: 22, animationDelay: "0.3s" }}>
          <button type="button" onClick={onReplay} className="lv-ghost lv-focus" style={{ minHeight: 50, borderRadius: 999, border: `1.5px solid ${V.edge}`, background: V.glass, color: V.ink, fontFamily: GROTESK, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <RotateCcw size={16} /> judge me again
          </button>
          {live && (
            <Link href="/templates" className="lv-cta lv-focus" style={{ minHeight: 54, borderRadius: 999, background: V.grad, color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 16, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Sparkles size={16} /> make one for your person
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
