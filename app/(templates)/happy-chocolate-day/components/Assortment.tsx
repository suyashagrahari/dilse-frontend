"use client";

// ─── Assortment — "the second layer" of the box: photos in candy cups ────────
//
// Each photo sits in a fluted paper cup with a flavour label, menu-style. A
// caption like "Goa sunset — salted caramel" splits into name + flavour; a
// caption without a flavour gets one from the house list. Tap → the kit
// lightbox. No photos → an illustrated assortment, so the section never
// looks empty.

import { useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { CroppedPhoto, PhotoLightbox } from "../../_valentine/kit";
import type { LovePhoto } from "../../_valentine/types";
import { C, CHOCOS, ChocoArt, CupArt, type PieceShape } from "./chocoArt";

const HOUSE_FLAVOURS = ["salted caramel", "dark & a little bitter", "strawberry cream", "hazelnut crunch", "rose & pistachio", "chai masala truffle", "mocha midnight", "100% pure"];
const CUP_COLORS: readonly [string, string][] = [
  ["#E6B85C", "#8C6420"],
  ["#E0457B", "#7E1F43"],
  ["#F3E3C8", "#B79A72"],
  ["#C98A4B", "#5A3220"],
];

export function splitCaption(caption: string | undefined, i: number): { name: string; flavour: string } {
  const c = (caption ?? "").trim();
  const m = c.split(/\s+[—–-]\s+|\s*:\s+/);
  if (m.length >= 2 && m[0] && m[1]) return { name: m[0], flavour: m.slice(1).join(" — ") };
  return { name: c, flavour: HOUSE_FLAVOURS[i % HOUSE_FLAVOURS.length] };
}

const FALLBACK: { name: string; flavour: string; shape: PieceShape; k: number }[] = [
  { name: "Late-night calls", flavour: "mocha midnight", shape: "round", k: 1 },
  { name: "Your laugh", flavour: "salted caramel", shape: "drop", k: 0 },
  { name: "Chai dates", flavour: "chai masala truffle", shape: "square", k: 4 },
  { name: "Us", flavour: "100% pure", shape: "heart", k: 2 },
];

export default function Assortment({
  photos,
  reduced,
  preview,
  sticker,
  onNext,
}: {
  photos: LovePhoto[];
  reduced: boolean;
  preview: boolean;
  sticker: (slotId: string, size: number, style?: CSSProperties) => ReactNode;
  onNext: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const has = photos.length > 0;
  const odd = photos.length % 2 === 1;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `52px 16px ${preview ? 130 : 56}px`, textAlign: "center" }}>
      <div style={{ position: "relative", width: "min(100%, 440px)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>{sticker("c4-photos", 80)}</div>
        <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".22em", textTransform: "uppercase", color: "#E9CDB6" }}>Psst… there&apos;s a second layer</p>
        <h2 style={{ margin: "6px 0 2px", font: `700 clamp(32px, 9.5vw, 42px)/1.1 ${FONTS.serif}`, color: C.cream }}>The Assortment</h2>
        <p style={{ margin: "0 0 20px", font: `400 15px/1.5 ${FONTS.ui}`, color: "#E9CDB6" }}>Hand-picked moments, one flavour each.</p>
      </div>

      {/* the tray */}
      <div
        style={{
          width: "min(100%, 440px)",
          padding: 12,
          borderRadius: 22,
          background: `linear-gradient(160deg, #EE5A8C, ${C.rasp} 45%, ${C.raspDeep})`,
          boxShadow: "0 30px 50px -22px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.25)",
        }}
      >
        <div style={{ borderRadius: 14, padding: "18px 10px 8px", background: "radial-gradient(120% 90% at 50% 15%, #3A2016, #24130C 80%)", boxShadow: "inset 0 6px 14px rgba(0,0,0,.6), inset 0 0 0 1.5px rgba(230,184,92,.45)", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 8, rowGap: 14 }}>
          {has
            ? photos.map((p, i) => {
                const { name, flavour } = splitCaption(p.caption, i);
                const [cup, edge] = CUP_COLORS[i % CUP_COLORS.length];
                const last = odd && i === photos.length - 1;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={`Open photo${name ? `: ${name}` : ` ${i + 1}`}`}
                    initial={reduced ? false : { y: -40, opacity: 0, scale: 0.8 }}
                    whileInView={{ y: 0, opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 15, delay: (i % 2) * 0.12 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ gridColumn: last ? "1 / -1" : undefined, justifySelf: "center", width: last ? "50%" : "100%", border: 0, padding: 0, background: "transparent", cursor: "pointer", color: C.cream }}
                  >
                    <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
                      <CupArt color={cup} edge={edge} size="100%" style={{ position: "absolute", inset: 0 }} />
                      <div style={{ position: "absolute", inset: "14%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 3px rgba(255,240,191,.85), 0 8px 14px rgba(0,0,0,.45)" }}>
                        <CroppedPhoto photo={p} alt={p.caption || `Photo ${i + 1}`} />
                        <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 32% 25%, rgba(255,255,255,.35), transparent 40%)" }} />
                      </div>
                    </div>
                    <FlavourLabel name={name} flavour={flavour} n={i + 1} />
                  </motion.button>
                );
              })
            : FALLBACK.map((f, i) => (
                <div key={i} style={{ color: C.cream }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
                    <CupArt color={CUP_COLORS[i][0]} edge={CUP_COLORS[i][1]} size="100%" style={{ position: "absolute", inset: 0 }} />
                    <div style={{ position: "absolute", inset: "16%" }}>
                      <ChocoArt shape={f.shape} choco={CHOCOS[f.k]} size="100%" />
                    </div>
                  </div>
                  <FlavourLabel name={f.name} flavour={f.flavour} n={i + 1} />
                </div>
              ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        style={{ marginTop: 26, minHeight: 54, padding: "14px 28px", borderRadius: 18, border: 0, background: C.rasp, color: "#fff", font: `700 17px ${FONTS.ui}`, boxShadow: `0 5px 0 ${C.raspDeep}, 0 16px 30px -14px rgba(0,0,0,.6)`, cursor: "pointer" }}
      >
        Close the box 🎀
      </button>
      {has && <PhotoLightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

function FlavourLabel({ name, flavour, n }: { name: string; flavour: string; n: number }) {
  return (
    <div style={{ marginTop: 4, padding: "0 4px", minHeight: 44 }}>
      <div style={{ font: `600 10px ${FONTS.ui}`, letterSpacing: ".2em", color: "rgba(230,184,92,.8)" }}>No. {String(n).padStart(2, "0")}</div>
      {name && <div style={{ font: `600 14px/1.25 ${FONTS.ui}`, color: C.cream, overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{name}</div>}
      <div style={{ font: `700 17px/1.2 ${FONTS.script}`, color: C.gold, overflowWrap: "anywhere" }}>{flavour}</div>
    </div>
  );
}
