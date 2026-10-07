"use client";

// ─── Kiss-Cam — the stadium jumbotron the photos play on ─────────────────────
//
// A dark screen framed by a ring of blinking bulbs, a glowing "KISS CAM" LED
// header and a LIVE dot. Photos change every 3.5 s through a heart-shaped iris
// (CSS mask), swipe left/right or use the arrows. Tapping the screen stamps a
// kiss on that photo where the finger landed; the marks stay on the photo (they
// are lifted to the parent and reused on the photobooth strip). No photos → the
// screen shows two drawn cubs sharing a cheek kiss (+ the K4 sticker).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, haptic, useReducedMotion } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import type { LovePhoto } from "../../_valentine/types";
import { CuteCouple, KissStamp, type KissStyle, type ShadeId } from "./kissArt";

export interface PhotoKiss {
  x: number;
  y: number;
  r: number;
  s: number;
}

const HEART_MASK = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 92"><path d="M50 88 C20 66 4 48 4 28 C4 13 16 4 29 4 C39 4 46 10 50 18 C54 10 61 4 71 4 C84 4 96 13 96 28 C96 48 80 66 50 88 Z"/></svg>')}")`;

const CSS = `
@keyframes kc-iris { from { -webkit-mask-size: 0% 0%; mask-size: 0% 0% } to { -webkit-mask-size: 360% 360%; mask-size: 360% 360% } }
@keyframes kc-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 8px 2px rgba(255,214,120,.85) } 50% { opacity: .35; box-shadow: none } }
@keyframes kc-live { 0%, 100% { opacity: 1 } 50% { opacity: .2 } }
@keyframes kc-pulse { 0%, 100% { box-shadow: inset 0 0 0 3px rgba(255,92,141,.0) } 50% { box-shadow: inset 0 0 0 4px rgba(255,92,141,.85), inset 0 0 40px rgba(255,92,141,.35) } }
.kc-iris { -webkit-mask-image: ${HEART_MASK}; mask-image: ${HEART_MASK}; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: 50% 45%; mask-position: 50% 45%; animation: kc-iris 1s cubic-bezier(.3,.7,.2,1) forwards }
.kc-bulb { animation: kc-blink 1.1s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .kc-iris { animation: none; -webkit-mask-image: none; mask-image: none } .kc-bulb, .kc-live, .kc-pulse { animation: none !important } }
`;

function Bulbs() {
  // Around a 100×100 box (percent units), skipping the corners' radius.
  const pts: { l: string; t: string; d: number }[] = [];
  const nX = 12;
  const nY = 15;
  for (let i = 0; i < nX; i++) {
    const l = `${4 + (i * 92) / (nX - 1)}%`;
    pts.push({ l, t: "0%", d: i }, { l, t: "100%", d: i + 1 });
  }
  for (let i = 1; i < nY - 1; i++) {
    const t = `${(i * 100) / (nY - 1)}%`;
    pts.push({ l: "0%", t, d: i + 1 }, { l: "100%", t, d: i });
  }
  return (
    <div aria-hidden style={{ position: "absolute", inset: 6, pointerEvents: "none" }}>
      {pts.map((p, i) => (
        <span
          key={i}
          className="kc-bulb"
          style={{ position: "absolute", left: p.l, top: p.t, width: 8, height: 8, marginLeft: -4, marginTop: -4, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #FFF7D6, #FFC94D 60%, #D98E1B)", animationDelay: `${(p.d % 2) * 0.55}s` }}
        />
      ))}
    </div>
  );
}

export default function KissCam({
  photos,
  kind,
  shade,
  marks,
  onMark,
  sticker,
  bottomPad,
  onNext,
}: {
  photos: LovePhoto[];
  kind: KissStyle;
  shade: ShadeId;
  marks: Record<number, PhotoKiss[]>;
  onMark: (idx: number, m: PhotoKiss) => void;
  sticker: ReactNode;
  bottomPad: number;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const n = photos.length;
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const lastTouch = useRef(0);
  const down = useRef<{ x: number; y: number } | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const total = Object.values(marks).reduce((a, m) => a + m.length, 0);

  const iRef = useRef(0);
  iRef.current = i;
  const go = (to: number) => {
    if (n < 2) return;
    setPrev(iRef.current);
    setI(((to % n) + n) % n);
  };
  const goRef = useRef(go);
  goRef.current = go;

  // Auto-advance, paused for a while after any touch.
  useEffect(() => {
    if (n < 2 || reduced) return;
    const t = window.setInterval(() => {
      if (performance.now() - lastTouch.current < 4500) return;
      goRef.current(iRef.current + 1);
    }, 3500);
    return () => window.clearInterval(t);
  }, [n, reduced]);

  const stampAt = (clientX: number, clientY: number) => {
    const r = screenRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    if ((marks[i]?.length ?? 0) >= 14) return;
    haptic(10);
    onMark(i, { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)), r: (Math.random() - 0.5) * 50, s: 0.8 + Math.random() * 0.45 });
  };

  const photo = n ? photos[i] : null;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `60px 16px ${bottomPad}px`, gap: 12 }}>
      <style>{CSS}</style>
      <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: VW.inkSoft }}>Now showing</p>
      <h2 style={{ margin: 0, font: `700 clamp(24px, 7vw, 32px)/1.1 ${FONTS.serif}`, color: VW.ink, textAlign: "center" }}>You&apos;re on the Kiss-Cam!</h2>

      <div style={{ position: "relative", width: "min(90vw, 380px)", marginTop: 6 }}>
        <div style={{ position: "absolute", right: -10, top: -38, width: 78, height: 78, zIndex: 4, transform: "rotate(8deg)" }}>{sticker}</div>
        {/* the jumbotron */}
        <div style={{ position: "relative", padding: "16px 16px 18px", borderRadius: 24, background: "linear-gradient(160deg, #3A1426, #1A0710 60%, #2B0C1B)", boxShadow: "0 30px 60px -28px rgba(59,10,30,.8), inset 0 0 0 2px rgba(255,201,77,.35)" }}>
          <Bulbs />
          {/* LED header */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "6px 0 10px" }}>
            <span aria-hidden style={{ color: "#FF5C8D", textShadow: "0 0 10px #FF5C8D" }}>♥</span>
            <span style={{ font: `800 22px ${FONTS.ui}`, letterSpacing: ".32em", color: "#FFE3EC", textShadow: "0 0 6px #FF5C8D, 0 0 18px rgba(255,92,141,.8)", paddingLeft: ".32em" }}>KISS CAM</span>
            <span aria-hidden style={{ color: "#FF5C8D", textShadow: "0 0 10px #FF5C8D" }}>♥</span>
          </div>
          {/* the screen */}
          <div
            ref={screenRef}
            className="kc-pulse"
            role="button"
            tabIndex={0}
            aria-label={photo?.caption ? `Kiss this photo: ${photo.caption}` : "Tap to stamp a kiss on the screen"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const r = screenRef.current!.getBoundingClientRect();
                stampAt(r.left + r.width * (0.3 + Math.random() * 0.4), r.top + r.height * (0.3 + Math.random() * 0.4));
              }
              if (e.key === "ArrowRight") go(i + 1);
              if (e.key === "ArrowLeft") go(i - 1);
            }}
            onPointerDown={(e) => {
              down.current = { x: e.clientX, y: e.clientY };
              lastTouch.current = performance.now();
            }}
            onPointerUp={(e) => {
              const d = down.current;
              down.current = null;
              if (!d) return;
              const dx = e.clientX - d.x;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - d.y)) go(dx < 0 ? i + 1 : i - 1);
              else stampAt(e.clientX, e.clientY);
            }}
            style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 12, overflow: "hidden", background: "#120409", cursor: "crosshair", touchAction: "pan-y", animation: reduced ? undefined : "kc-pulse 2.4s ease-in-out infinite", userSelect: "none" }}
          >
            {photo ? (
              <>
                {prev != null && prev !== i && photos[prev] && (
                  <div style={{ position: "absolute", inset: 0 }}>
                    <CroppedPhoto photo={photos[prev]} alt="" />
                  </div>
                )}
                <div key={i} className={prev != null && !reduced ? "kc-iris" : undefined} style={{ position: "absolute", inset: 0 }} onAnimationEnd={() => setPrev(null)}>
                  <CroppedPhoto photo={photo} eager={i === 0} />
                </div>
              </>
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "radial-gradient(120% 90% at 50% 30%, #FFD0DE, #FF9DBE 60%, #E0245E)" }}>
                <div style={{ width: "86%" }}>
                  <CuteCouple />
                </div>
              </div>
            )}

            {/* stamped kisses on this photo */}
            {(marks[i] ?? []).map((m, k) => (
              <motion.span
                key={`${i}-${k}`}
                initial={reduced ? false : { scale: 2.6, opacity: 0 }}
                animate={{ scale: m.s, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 16 }}
                style={{ position: "absolute", left: `${m.x}%`, top: `${m.y}%`, pointerEvents: "none" }}
              >
                <span style={{ display: "block", transform: `translate(-50%,-50%) rotate(${m.r}deg)`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))" }}>
                  <KissStamp kind={kind} shade={shade} size={58} face={false} />
                </span>
              </motion.span>
            ))}

            {/* screen chrome */}
            <span style={{ position: "absolute", left: 10, top: 10, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,.45)", color: "#fff", font: `700 11px ${FONTS.ui}`, letterSpacing: ".12em" }}>
              <span className="kc-live" style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2D55", animation: reduced ? undefined : "kc-live 1s steps(2) infinite" }} /> LIVE
            </span>
            <span style={{ position: "absolute", right: 10, top: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,.45)", color: "#fff", font: `600 11px ${FONTS.ui}` }}>
              💋 {(marks[i] ?? []).length}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`cap${i}`}
                initial={reduced ? false : { x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "26px 12px 10px", background: "linear-gradient(transparent, rgba(18,4,9,.82))", pointerEvents: "none" }}
              >
                <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 4, background: "#E0245E", color: "#fff", font: `700 11px ${FONTS.ui}`, letterSpacing: ".14em" }}>
                  {n ? `KISS CAM · ${i + 1}/${n}` : "KISS CAM"}
                </span>
                <p style={{ margin: "6px 0 0", font: `600 17px/1.25 ${FONTS.ui}`, color: "#fff", overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {photo?.caption || (n ? "" : "The camera found you two 🥰")}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44 }}>
        {n > 1 && (
          <button type="button" aria-label="Previous photo" onClick={() => go(i - 1)} style={navBtn}>
            ‹
          </button>
        )}
        <span style={{ font: `500 14px ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center" }}>
          {total === 0 ? "Tap the screen to kiss a photo 💋" : `${total} kiss${total === 1 ? "" : "es"} on the big screen`}
        </span>
        {n > 1 && (
          <button type="button" aria-label="Next photo" onClick={() => go(i + 1)} style={navBtn}>
            ›
          </button>
        )}
      </div>
      {n > 1 && (
        <div aria-hidden style={{ display: "flex", gap: 6 }}>
          {photos.map((_, k) => (
            <span key={k} style={{ width: k === i ? 18 : 7, height: 7, borderRadius: 9, background: k === i ? VW.accent : VW.edge, transition: "width .3s" }} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        style={{ marginTop: 4, minHeight: 54, padding: "14px 28px", borderRadius: 18, border: 0, background: VW.accent, color: VW.accentInk, font: `700 17px ${FONTS.ui}`, boxShadow: `0 5px 0 ${VW.accentDeep}, 0 16px 30px -14px rgba(0,0,0,.4)`, cursor: "pointer" }}
      >
        Next: kiss coupons 🎟️
      </button>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "1.5px solid var(--vw-edge)",
  background: "rgba(255,255,255,.8)",
  color: "var(--vw-ink)",
  font: "600 24px/1 var(--vw-font-ui, system-ui)",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};
