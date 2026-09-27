"use client";

// ─── Love kit — the photo deck ───────────────────────────────────────────────
//
// A full-screen stack of polaroids. The top one can be dragged (or the arrow
// tapped) to send it to the back of the pile; tapping it flips it over in 3D to
// read the little letter written on the back. When every photo has been seen,
// the deck says so (`onAllSeen`) — the chapter then shows its GIF and moves on.

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { ChevronRight, RotateCcw } from "lucide-react";

import { cropStyle, photoCrop } from "../dedication/components/types";
import { GROTESK, ITALIC } from "./LoveKit";
import { V } from "./theme";
import type { LovePhoto } from "./types";

const TILTS = [-4, 3, -2, 5, -3, 2, -5, 4];
const TAPES = ["#ffd27a", "#ffb3cc", "#b59bff", "#d8ff5c"];

export default function PhotoDeck({
  photos,
  reduceMotion,
  onAllSeen,
  backLabel = "a little letter",
}: {
  photos: LovePhoto[];
  reduceMotion: boolean;
  onAllSeen?: () => void;
  backLabel?: string;
}) {
  const n = photos.length;
  // `order` is the pile, top first; `seen` counts distinct photos sent back.
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const reported = useRef(false);

  // A photo counts as seen once it has been flipped or sent to the back.
  const flip = () => {
    setFlipped((f) => !f);
    setSeen((s) => new Set(s).add(order[0]));
  };
  const sendBack = () => {
    setFlipped(false);
    setSeen((s) => new Set(s).add(order[0]));
    setOrder((o) => [...o.slice(1), o[0]]);
  };

  useEffect(() => {
    if (!reported.current && n > 0 && seen.size >= n) {
      reported.current = true;
      onAllSeen?.();
    }
  }, [seen, n, onAllSeen]);

  if (!n) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: "min(78vw, 340px)", aspectRatio: "4 / 5.4", perspective: 1400 }}>
        {order
          .slice(0, 4)
          .reverse()
          .map((idx, k, arr) => {
            const depth = arr.length - 1 - k; // 0 = top
            const isTop = depth === 0;
            return isTop ? (
              <TopCard
                key={`top-${idx}`}
                photo={photos[idx]}
                tilt={TILTS[idx % TILTS.length]}
                tape={TAPES[idx % TAPES.length]}
                flipped={flipped}
                onFlip={flip}
                onThrow={sendBack}
                reduceMotion={reduceMotion}
                backLabel={backLabel}
                index={idx}
                total={n}
              />
            ) : (
              <motion.div
                key={`under-${idx}`}
                aria-hidden
                initial={false}
                animate={{ rotate: TILTS[idx % TILTS.length] * 1.4, scale: 1 - depth * 0.04, y: depth * 10 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                style={{ position: "absolute", inset: 0, ...paperFace }}
              >
                <Face photo={photos[idx]} />
              </motion.div>
            );
          })}
      </div>

      <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 10, fontFamily: GROTESK }}>
        <button type="button" onClick={flip} className="lv-ghost lv-focus" style={pill(false)}>
          <RotateCcw size={16} /> {flipped ? "see photo" : "read the back"}
        </button>
        {n > 1 && (
          <button type="button" onClick={sendBack} className="lv-cta lv-focus" style={pill(true)}>
            next photo <ChevronRight size={17} />
          </button>
        )}
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12.5, fontWeight: 700, color: V.soft, fontFamily: GROTESK }} aria-live="polite">
        {seen.size >= n ? `all ${n} seen 🥹` : `${seen.size}/${n} seen · tap to flip · swipe for the next`}
      </p>
    </div>
  );
}

function TopCard({
  photo,
  tilt,
  tape,
  flipped,
  onFlip,
  onThrow,
  reduceMotion,
  backLabel,
  index,
  total,
}: {
  photo: LovePhoto;
  tilt: number;
  tape: string;
  flipped: boolean;
  onFlip: () => void;
  onThrow: () => void;
  reduceMotion: boolean;
  backLabel: string;
  index: number;
  total: number;
}) {
  const x = useMotionValue(0);
  const rot = useTransform(x, [-220, 0, 220], [tilt - 18, tilt, tilt + 18]);
  const dragged = useRef(false);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onThrow();
    window.setTimeout(() => (dragged.current = false), 0);
  };

  return (
    <motion.div
      drag={reduceMotion ? false : "x"}
      dragSnapToOrigin
      dragElastic={0.6}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={onDragEnd}
      initial={reduceMotion ? false : { scale: 0.92, y: 18, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, x, rotate: rot, zIndex: 5, cursor: "grab", touchAction: "pan-y" }}
    >
      <button
        type="button"
        onClick={() => !dragged.current && onFlip()}
        aria-label={flipped ? `Photo ${index + 1}: show the photo` : `Photo ${index + 1} of ${total}${photo.caption ? `, ${photo.caption}` : ""}: read the letter on the back`}
        className="lv-focus"
        style={{ position: "absolute", inset: 0, border: "none", padding: 0, background: "transparent", cursor: "inherit" }}
      >
        <motion.span
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 20 }}
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", display: "block" }}
        >
          {/* Front */}
          <span style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", ...paperFace }}>
            <span aria-hidden style={{ position: "absolute", top: -11, left: "50%", width: 84, height: 24, marginLeft: -42, background: tape, opacity: 0.9, transform: "rotate(-4deg)", borderRadius: 2, zIndex: 2 }} />
            <Face photo={photo} />
          </span>
          {/* Back — the little letter */}
          <span
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderRadius: 10,
              padding: "22px 20px",
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
              background: "repeating-linear-gradient(var(--lv-paper) 0 31px, color-mix(in srgb, var(--lv-paper-soft) 26%, var(--lv-paper)) 31px 32px)",
              color: V.paperInk,
              boxShadow: `0 30px 60px -26px ${V.shadow}`,
              overflow: "hidden",
            }}
          >
            <span style={{ fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>💌 {backLabel}</span>
            <span style={{ marginTop: 10, fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(20px, 5vw, 24px)", lineHeight: "32px", whiteSpace: "pre-wrap", overflowWrap: "anywhere", overflowY: "auto" }}>
              {photo.note || "No words needed for this one. Just look at us. 🥹"}
            </span>
            <span style={{ marginTop: "auto", paddingTop: 10, fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: V.paperSoft }}>— {photo.caption || "us"}</span>
          </span>
        </motion.span>
      </button>
    </motion.div>
  );
}

function Face({ photo }: { photo: LovePhoto }) {
  return (
    <>
      <span style={{ position: "relative", display: "block", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 4, background: "#eee6dc" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" draggable={false} style={cropStyle(photoCrop(photo))} />
      </span>
      <span style={{ display: "block", marginTop: 10, fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, lineHeight: 1.1, color: "#241f1b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>
        {photo.caption || "a moment ✨"}
      </span>
    </>
  );
}

const paperFace = {
  background: "#fffdf7",
  padding: "12px 12px 14px",
  borderRadius: 10,
  boxShadow: "0 30px 60px -26px rgba(0,0,0,.7)",
} as const;

const pill = (loud: boolean) =>
  ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 46,
    padding: "0 18px",
    borderRadius: 999,
    border: loud ? "none" : `1.5px solid ${V.edge}`,
    background: loud ? V.grad : V.glass,
    color: loud ? "#fff" : V.ink,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
  }) as const;

