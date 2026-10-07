"use client";

// ─── CorkBoard — polaroids pinned on a cork board in a cosy kid's room ───────
//
// Wood frame, cork texture, polaroids dropped in with a little swing, held by
// washi tape or a push pin, captions in handwriting. Tap → kit lightbox. The
// dressed teddy sits on the frame. No photos → pinned sticky notes, so the
// board is never empty.

import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { CroppedPhoto, PhotoLightbox } from "../../_valentine/kit";
import type { LovePhoto } from "../../_valentine/types";
import { T, Teddy, type Fur, type ItemId } from "./teddyArt";
import { primaryBtn } from "./TeddyWardrobe";

const TAPES = ["rgba(255,143,184,.75)", "rgba(168,230,207,.8)", "rgba(255,241,181,.85)", "rgba(205,180,219,.8)"];
const PINS = ["#FF6FA3", "#7FE3FF", "#FFD25E", "#A8E6CF"];

export default function CorkBoard({
  photos,
  recipientName,
  senderName,
  teddyName,
  fur,
  worn,
  reduced,
  preview,
  sticker,
  onNext,
}: {
  photos: LovePhoto[];
  recipientName: string;
  senderName: string;
  teddyName: string;
  fur: Fur;
  worn: ItemId[];
  reduced: boolean;
  preview: boolean;
  sticker: (id: string, size: number, style?: CSSProperties) => ReactNode;
  onNext: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const has = photos.length > 0;
  const notes = [`${teddyName} was here 🐾`, `${recipientName || "You"} + ${senderName || "me"} = ♥`, "Squeeze daily. Side effects: smiling."];

  return (
    <div style={{ width: "100%", minHeight: "calc(100dvh - var(--vw-dock-space, 0px))", display: "flex", flexDirection: "column", alignItems: "center", padding: `58px 14px ${preview ? 140 : 56}px`, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
        {sticker("t4-photos", 72)}
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#9B7FB2" }}>Pinned with love</p>
          <h2 style={{ margin: "2px 0 0", font: `700 clamp(28px, 8.4vw, 36px)/1.1 ${FONTS.serif}`, color: T.ink }}>Our cork board</h2>
        </div>
      </div>

      <div style={{ position: "relative", width: "min(100%, 440px)", marginTop: 18 }}>
        <div
          style={{
            padding: 12,
            borderRadius: 18,
            background: "linear-gradient(160deg,#B98458,#8B5E3C)",
            boxShadow: "0 26px 44px -22px rgba(74,51,38,.75), inset 0 2px 0 rgba(255,255,255,.25)",
          }}
        >
          <div
            style={{
              borderRadius: 8,
              padding: "22px 12px 64px",
              background: "radial-gradient(rgba(120,72,30,.35) 1px, transparent 1.6px) 0 0 / 9px 9px, radial-gradient(rgba(255,235,200,.35) 1px, transparent 1.6px) 4px 5px / 11px 11px, linear-gradient(180deg,#D9A877,#C8935F)",
              boxShadow: "inset 0 4px 10px rgba(0,0,0,.3)",
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "22px 14px",
            }}
          >
            {has
              ? photos.map((p, i) => {
                  const rot = [-4, 3.5, 2.5, -3, -2, 4, 3, -3.5][i % 8];
                  const tape = i % 3 !== 2;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={p.caption ? `Open photo: ${p.caption}` : `Open photo ${i + 1}`}
                      initial={reduced ? false : { y: -60, opacity: 0, rotate: rot * 3 }}
                      whileInView={{ y: 0, opacity: 1, rotate: rot }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, damping: 12, delay: (i % 2) * 0.1 }}
                      whileTap={{ scale: 0.96 }}
                      style={{ position: "relative", padding: "8px 8px 10px", border: 0, borderRadius: 4, background: "#fff", boxShadow: "0 12px 18px -10px rgba(60,30,10,.6)", cursor: "pointer", transformOrigin: "50% 0" }}
                    >
                      {tape ? (
                        <span aria-hidden style={{ position: "absolute", top: -10, left: "50%", width: 62, height: 20, marginLeft: -31, background: TAPES[i % TAPES.length], transform: `rotate(${-rot * 1.5}deg)`, clipPath: "polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)" }} />
                      ) : (
                        <span aria-hidden style={{ position: "absolute", top: -7, left: "50%", width: 16, height: 16, marginLeft: -8, borderRadius: 16, background: `radial-gradient(circle at 35% 30%, #fff 0 18%, ${PINS[i % PINS.length]} 22%)`, boxShadow: "0 3px 4px rgba(0,0,0,.35)" }} />
                      )}
                      <span style={{ display: "block", aspectRatio: "1", overflow: "hidden", borderRadius: 2 }}>
                        <CroppedPhoto photo={p} alt={p.caption || `Photo ${i + 1}`} />
                      </span>
                      <span style={{ minHeight: 22, marginTop: 6, font: `700 16px/1.15 ${FONTS.script}`, color: T.ink, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflowWrap: "break-word" } as CSSProperties}>
                        {p.caption || " "}
                      </span>
                    </motion.button>
                  );
                })
              : notes.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={reduced ? false : { y: -40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1, rotate: [-3, 2, -2][i] }}
                    viewport={{ once: true }}
                    style={{ position: "relative", gridColumn: i === 2 ? "1 / -1" : undefined, justifySelf: "center", width: i === 2 ? "60%" : "100%", aspectRatio: "1", padding: 14, background: [T.butter, T.pink, T.mint][i], boxShadow: "0 10px 16px -10px rgba(60,30,10,.6)", display: "grid", placeItems: "center", font: `700 20px/1.25 ${FONTS.script}`, color: T.ink }}
                  >
                    <span aria-hidden style={{ position: "absolute", top: -7, left: "50%", width: 16, height: 16, marginLeft: -8, borderRadius: 16, background: `radial-gradient(circle at 35% 30%, #fff 0 18%, ${PINS[i]} 22%)` }} />
                    {n}
                  </motion.div>
                ))}
          </div>
        </div>
        {/* teddy sitting on the frame */}
        <div aria-hidden style={{ position: "absolute", right: 8, bottom: -14, width: 104 }}>
          <Teddy fur={fur} worn={worn} pose="sit" size={104} />
        </div>
      </div>

      <button type="button" onClick={onNext} style={{ ...primaryBtn, marginTop: 30 }}>
        One last thing 🧸
      </button>
      {has && <PhotoLightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
