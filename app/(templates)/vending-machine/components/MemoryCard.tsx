"use client";

// ─── A limited-edition memory card ───────────────────────────────────────────
//
// The front is a trading card: theme-gradient frame, the photo framed exactly
// as the sender set it, a holo sheen that follows the finger, the code, the
// rarity and the caption as the card's name. The back is the memory note on
// paper with a GIF sticker taped on. Tap anywhere (or the Flip button) to turn.
//
// Tilt is written straight to the node from pointermove — no React state per
// frame — and switched off under prefers-reduced-motion.

import { useCallback, useRef, type CSSProperties } from "react";

import { V } from "../../_love/theme";
import { GROTESK, ITALIC } from "../../_love/LoveKit";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { LovePhoto } from "../../_love/types";
import GifSticker from "./GifSticker";
import { PIXEL } from "./machine";
import { cardCode, cardRarity } from "./types";

export interface MemoryCardProps {
  photo: LovePhoto;
  index: number;
  total: number;
  flipped: boolean;
  onFlip: () => void;
  senderName: string;
  gif?: string;
  pulledOn: string;
  reducedMotion: boolean;
}

const face: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 22,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  overflow: "hidden",
};

export default function MemoryCard({ photo, index, total, flipped, onFlip, senderName, gif, pulledOn, reducedMotion }: MemoryCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const code = cardCode(index);
  const rarity = cardRarity(index, total);
  const no = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = tiltRef.current;
      if (!el || reducedMotion) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${((0.5 - y) * 14).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((x - 0.5) * 16).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    },
    [reducedMotion],
  );
  const onLeave = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "30%");
  }, []);

  return (
    <div
      ref={tiltRef}
      className="vm-card-tilt"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ width: "100%", aspectRatio: "5 / 7", perspective: 1100 }}
    >
      <button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? `Card ${code}: show the photo` : `Card ${code}: read the memory on the back`}
        className="vm-card-flip lv-focus"
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          padding: 0,
          border: 0,
          background: "none",
          cursor: "pointer",
          transformStyle: "preserve-3d",
          transform: `rotateX(var(--rx, 0deg)) rotateY(calc(var(--ry, 0deg) + ${flipped ? 180 : 0}deg))`,
        }}
      >
        {/* ── FRONT ─────────────────────────────────────────────────── */}
        <div
          style={{
            ...face,
            padding: 9,
            background: V.grad,
            boxShadow: `0 30px 60px -24px ${V.shadow}, inset 0 0 0 1px rgba(255,255,255,.35)`,
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              borderRadius: 15,
              background: "linear-gradient(180deg,#17121f 0%,#0b0910 100%)",
              padding: "10px 10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 9,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span
                style={{
                  fontFamily: PIXEL,
                  fontSize: 13,
                  color: "#0b0910",
                  background: "#fff",
                  padding: "3px 8px 2px",
                  borderRadius: 7,
                  letterSpacing: ".04em",
                }}
              >
                {code}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <span aria-hidden style={{ color: "#ffd35a", fontSize: 11, letterSpacing: 1 }}>
                  {"★".repeat(rarity.stars)}
                </span>
                <span style={{ fontFamily: PIXEL, fontSize: 10, color: "#fff", letterSpacing: ".06em", whiteSpace: "nowrap" }}>{rarity.label}</span>
              </span>
            </div>

            <div style={{ position: "relative", flex: "1 1 auto", minHeight: 0, borderRadius: 11, overflow: "hidden", background: "#222" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption || `Memory ${code}`} draggable={false} style={cropStyle(photoCrop(photo))} />
              {/* holo sheen — follows the finger */}
              <span
                aria-hidden
                className="vm-holo"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle at var(--mx,50%) var(--my,30%), rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 38%), linear-gradient(115deg, rgba(255,0,170,.0) 20%, rgba(255,120,220,.22) 36%, rgba(120,220,255,.22) 50%, rgba(170,255,140,.2) 62%, rgba(255,255,255,0) 78%)",
                  backgroundSize: "100% 100%, 220% 220%",
                  mixBlendMode: "screen",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 8,
                  bottom: 8,
                  fontFamily: PIXEL,
                  fontSize: 9,
                  color: "#fff",
                  background: "rgba(0,0,0,.55)",
                  padding: "3px 6px 2px",
                  borderRadius: 6,
                  letterSpacing: ".08em",
                }}
              >
                LIMITED EDITION
              </span>
            </div>

            <div style={{ textAlign: "left" }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: ITALIC,
                  fontStyle: "italic",
                  fontSize: "clamp(22px, 6.6vw, 28px)",
                  lineHeight: 1.02,
                  color: "#fff",
                  overflowWrap: "anywhere",
                }}
              >
                {photo.caption || "a memory, unlabelled"}
              </p>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  fontFamily: PIXEL,
                  fontSize: 8.5,
                  letterSpacing: ".08em",
                  color: "rgba(255,255,255,.62)",
                }}
              >
                <span>No. {no}</span>
                <span>1 OF 1 IN EXISTENCE</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────────────── */}
        <div
          style={{
            ...face,
            transform: "rotateY(180deg)",
            padding: 9,
            background: V.grad,
            boxShadow: `0 30px 60px -24px ${V.shadow}`,
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              borderRadius: 15,
              background: V.paper,
              backgroundImage: `radial-gradient(${V.edge} 1px, transparent 1.2px)`,
              backgroundSize: "14px 14px",
              padding: "16px 16px 14px",
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
              color: V.paperInk,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: PIXEL, fontSize: 10, letterSpacing: ".1em", color: V.a1 }}>MEMORY NOTE · {code}</span>
              <span style={{ fontFamily: PIXEL, fontSize: 9, color: V.paperSoft }}>{no}</span>
            </div>
            <p style={{ margin: "10px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 24, lineHeight: 1.05 }}>
              {photo.caption || "this one"}
            </p>
            <div
              className="vm-note-scroll"
              style={{
                marginTop: 10,
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
                fontFamily: GROTESK,
                fontSize: 15.5,
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                paddingRight: gif ? 4 : 0,
              }}
            >
              {photo.note || "Some memories don't need words. This is one of them."}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, lineHeight: 1 }}>— {senderName}</p>
                <p style={{ margin: "5px 0 0", fontFamily: PIXEL, fontSize: 8.5, letterSpacing: ".08em", color: V.paperSoft }}>
                  PULLED {pulledOn}
                </p>
              </div>
              {gif && (
                <span style={{ position: "relative", flex: "0 0 auto" }}>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -8,
                      left: "50%",
                      width: 40,
                      height: 14,
                      transform: "translateX(-50%) rotate(-4deg)",
                      background: "color-mix(in srgb, var(--lv-a3) 45%, rgba(255,255,255,.6))",
                      zIndex: 2,
                    }}
                  />
                  <GifSticker url={gif} size={74} tilt={5} reducedMotion={reducedMotion} style={{ boxShadow: "0 8px 18px -8px rgba(0,0,0,.4)", border: "3px solid #fff" }} />
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
