"use client";

// ─── The finale: the love letter and the certificate ─────────────────────────

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { GRAD, GROTESK, INK, ITALIC, MOON, MOON_SOFT } from "../../date-invitation/components/dateTheme";
import { CandyButton } from "../../date-invitation/components/NightKit";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { GOLD, ZodiacRing, initials } from "./CosmicKit";
import type { KundliPhoto } from "./types";

// ─── The love letter ─────────────────────────────────────────────────────────

export function LoveLetter({ letter, from, to, reduceMotion }: { letter: string; from: string; to: string; reduceMotion: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!letter.trim()) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open the letter from ${from}`}
        className={reduceMotion ? "" : "km-drift"}
        style={{ position: "relative", display: "block", width: "min(340px, 86vw)", aspectRatio: "3 / 2", margin: "0 auto", border: "none", background: "none", cursor: "pointer", padding: 0 }}
      >
        {/* Envelope body */}
        <span style={{ position: "absolute", inset: 0, borderRadius: 16, background: "linear-gradient(160deg,#ffe3ec,#ffc6d6)", boxShadow: "0 30px 60px -24px rgba(0,0,0,.85)" }} />
        {/* Flap */}
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "58%",
            background: "linear-gradient(180deg,#ffb3c8,#ff9ab6)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            borderRadius: "16px 16px 0 0",
          }}
        />
        {/* Wax seal */}
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #ff6b95, #b3134a)",
            display: "grid",
            placeItems: "center",
            fontSize: 26,
            boxShadow: "0 8px 18px -6px rgba(120,0,40,.8)",
          }}
        >
          💘
        </span>
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: "#8a1c43" }}>
          for {to}, from {from}
        </span>
      </button>
      <p style={{ margin: "14px 0 0", textAlign: "center", fontFamily: GROTESK, fontSize: 13, fontWeight: 700, color: MOON_SOFT }}>tap the envelope to open 💌</p>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Letter from ${from}`}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 160, background: "rgba(10,5,22,.86)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          >
            <motion.article
              initial={reduceMotion ? false : { y: 60, opacity: 0, rotate: -2 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 600,
                maxHeight: "calc(100dvh - 32px)",
                overflowY: "auto",
                borderRadius: 20,
                padding: "56px 26px 30px",
                background: "repeating-linear-gradient(#fffaf0 0 33px, #f1e3cc 33px 34px)",
                color: INK,
                boxShadow: "0 40px 80px -30px rgba(0,0,0,.9)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the letter"
                style={{ position: "absolute", right: 12, top: 12, width: 44, height: 44, borderRadius: 999, border: "none", background: "rgba(36,31,27,.08)", color: INK, display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
              <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#d0245f" }}>
                the stars approved · now read this
              </p>
              <p style={{ margin: "14px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 23, lineHeight: "34px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {letter}
              </p>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── The certificate ─────────────────────────────────────────────────────────

const CERT_W = 380;
const CERT_H = 520;

export function Certificate({
  aName,
  bName,
  total,
  grade,
  issuedLabel,
  astrologer,
  photo,
}: {
  aName: string;
  bName: string;
  total: number;
  grade: string;
  issuedLabel: string;
  astrologer: string;
  photo?: KundliPhoto;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [inlinePhoto, setInlinePhoto] = useState<string | null>(null);

  // Fit the fixed-size card to its column; never reflow it.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / CERT_W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A cross-origin <img> would taint the export, so the photo is inlined first.
  useEffect(() => {
    let alive = true;
    if (!photo) return;
    void toDataUrl(photo.url).then((d) => alive && setInlinePhoto(d));
    return () => {
      alive = false;
    };
  }, [photo]);

  const save = async () => {
    setBusy(true);
    setMsg("");
    const res = await exportNodeToPng(cardRef.current, {
      width: CERT_W,
      height: CERT_H,
      filename: `kundli-milan-${fileSlug(`${aName}-${bName}`, "certificate")}`,
      backgroundColor: "#140a2e",
      pixelRatio: 3,
    });
    setBusy(false);
    setMsg(res.message);
  };

  return (
    <div>
      <div ref={boxRef} style={{ width: "100%", maxWidth: CERT_W, margin: "0 auto" }}>
        <div style={{ width: CERT_W * scale, height: CERT_H * scale, margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: CERT_W, height: CERT_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div
              ref={cardRef}
              style={{
                width: CERT_W,
                height: CERT_H,
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
                borderRadius: 22,
                padding: "30px 26px",
                background: "radial-gradient(70% 45% at 0% 0%, rgba(255,79,139,.5), transparent 70%), radial-gradient(70% 45% at 100% 100%, rgba(124,92,255,.5), transparent 70%), #140a2e",
                color: MOON,
                fontFamily: GROTESK,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ position: "absolute", inset: 10, borderRadius: 16, border: `1.5px solid ${GOLD}`, opacity: 0.7 }} />
              <span style={{ position: "absolute", inset: 15, borderRadius: 12, border: `1px dashed ${GOLD}`, opacity: 0.35 }} />
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: ".26em", textTransform: "uppercase", color: GOLD }}>certificate of cosmic compatibility</p>

              <div style={{ marginTop: 16, position: "relative", width: 150, height: 150 }}>
                <ZodiacRing size={150} stroke={GOLD} glyphSize={11}>
                  <span style={{ position: "absolute", left: 30, top: 30, width: 90, height: 90, borderRadius: "50%", overflow: "hidden", border: `3px solid ${GOLD}`, background: GRAD }}>
                    {inlinePhoto && photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inlinePhoto} alt="" style={cropStyle(photoCrop(photo))} />
                    ) : (
                      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 28, fontWeight: 800 }}>
                        {initials(aName)[0]}♥{initials(bName)[0]}
                      </span>
                    )}
                  </span>
                </ZodiacRing>
              </div>

              <p style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                {aName} <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, color: "#ff8fb6" }}>&amp;</span> {bName}
              </p>
              <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 16, color: MOON_SOFT, lineHeight: 1.3 }}>
                are hereby declared officially, cosmically, un-returnably compatible
              </p>

              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <span style={{ background: GRAD, borderRadius: 14, padding: "8px 14px", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>
                  {total}/36
                </span>
                <span style={{ background: "#d8ff5c", color: "#1a0d26", borderRadius: 14, padding: "8px 12px", fontWeight: 800, fontSize: 12.5, display: "flex", alignItems: "center", maxWidth: 170, lineHeight: 1.15 }}>
                  {grade}
                </span>
              </div>

              <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 10.5, color: MOON_SOFT }}>
                <span style={{ textAlign: "left" }}>
                  issued
                  <br />
                  <b style={{ color: MOON, fontSize: 12 }}>{issuedLabel}</b>
                </span>
                <span
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: `2px solid ${GOLD}`,
                    color: GOLD,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    transform: "rotate(-12deg)",
                    lineHeight: 1.1,
                  }}
                >
                  stars
                  <br />
                  approved
                  <br />✓
                </span>
                <span style={{ textAlign: "right" }}>
                  signed
                  <br />
                  <b style={{ color: MOON, fontSize: 12, fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400 }}>{astrologer}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <CandyButton onClick={() => void save()} disabled={busy} style={{ width: "auto", minWidth: 240 }}>
          {busy ? "saving…" : "save our certificate ⬇️"}
        </CandyButton>
        <p role="status" aria-live="polite" style={{ margin: 0, minHeight: 16, fontFamily: GROTESK, fontSize: 12.5, color: MOON_SOFT }}>
          {msg}
        </p>
      </div>
    </div>
  );
}
