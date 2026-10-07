"use client";

// Room 4 — The Haunted Hallway. Crooked gilt frames line the wall; every
// portrait is behind fogged glass (the kit's ScratchCanvas with a misty
// cover). Wipe the fog to find the sender's photos. Each frame has a pair of
// painted eyes on its crest that follow your finger around — until you've
// wiped that portrait, then they close happily. A revealed portrait opens
// the lightbox. "Wipe them all for me" clears the lot; no photos = a hallway
// of little ghost paintings waiting for memories.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, PhotoLightbox, ScratchCanvas, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS, VW } from "../../../_valentine/theme";
import { Ghost } from "./art";
import { HW_DISPLAY } from "./fonts";
import { Btn, Hint, HW, RoomTitle, SkipChip } from "./ui";

const TILTS = [-3, 2.5, 1.5, -2, -1.5, 3];

/** Two little eyes that look at the pointer (or close, content, once wiped). */
function Eyes({ closed }: { closed: boolean }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (closed || reduced) return;
    const el = ref.current;
    if (!el) return;
    // The rect is cached and only re-read after a scroll/resize: with several
    // portraits each listening, reading it on every move interleaves layout
    // reads with the other portraits' style writes (a forced recalc per eye).
    let rect: DOMRect | null = null;
    const forget = () => {
      rect = null;
    };
    const onMove = (e: PointerEvent) => {
      const r = rect ?? (rect = el.getBoundingClientRect());
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      const k = Math.min(3, d / 40);
      el.style.setProperty("--ex", `${((dx / d) * k).toFixed(1)}px`);
      el.style.setProperty("--ey", `${((dy / d) * k).toFixed(1)}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", forget, { passive: true, capture: true });
    window.addEventListener("resize", forget);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", forget, { capture: true });
      window.removeEventListener("resize", forget);
    };
  }, [closed, reduced]);
  const eye = (k: number) => (
    <span key={k} style={{ position: "relative", width: 14, height: 10, borderRadius: "50%", background: closed ? "transparent" : "#FFF6E6", overflow: "hidden", display: "inline-block", boxShadow: closed ? undefined : "inset 0 0 0 1.5px #5A3818" }}>
      {closed ? (
        <svg viewBox="0 0 14 10" width="14" height="10" style={{ display: "block" }}>
          <path d="M2 6 Q7 1 12 6" stroke="#5A3818" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ) : (
        <span style={{ position: "absolute", left: 4, top: 2, width: 6, height: 6, borderRadius: "50%", background: "#2B1E3F", transform: "translate(var(--ex, 0px), var(--ey, 0px))", transition: "transform .12s" }} />
      )}
    </span>
  );
  return (
    <span ref={ref} aria-hidden style={{ display: "inline-flex", gap: 6, padding: "4px 8px", borderRadius: 99, background: "linear-gradient(180deg, #C9954E, #8A5A2B)", boxShadow: "0 2px 4px rgba(0,0,0,.4)" }}>
      {eye(0)}
      {eye(1)}
    </span>
  );
}

function Frame({ children, tilt, closedEyes, caption, wide }: { children: ReactNode; tilt: number; closedEyes: boolean; caption: string; wide?: boolean }) {
  return (
    <figure style={{ margin: 0, display: "grid", justifyItems: "center", gap: 6, transform: `rotate(${tilt}deg)`, gridColumn: wide ? "1 / -1" : undefined, width: wide ? "min(100%, calc(50% - 7px))" : "100%", justifySelf: "center" }}>
      <div style={{ marginBottom: -12, zIndex: 2 }}>
        <Eyes closed={closedEyes} />
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          padding: 9,
          borderRadius: 10,
          background: "linear-gradient(135deg, #D9A75A 0%, #8A5A2B 40%, #C9954E 60%, #6E4420 100%)",
          boxShadow: "0 16px 28px -14px rgba(0,0,0,.8), inset 0 0 0 2px rgba(255,230,170,.35)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", borderRadius: 4, overflow: "hidden", boxShadow: "inset 0 0 0 3px #3B2512" }}>{children}</div>
      </div>
      <figcaption style={{ padding: "3px 10px", borderRadius: 4, background: "linear-gradient(180deg, #E6C27A, #B8923F)", color: "#2B1E3F", font: `600 12px ${FONTS.ui}`, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", boxShadow: "0 2px 4px rgba(0,0,0,.35)" }}>
        {caption}
      </figcaption>
    </figure>
  );
}

export default function Hallway({ photos, preview, sticker, onNext }: { photos: LovePhoto[]; preview: boolean; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const list = photos.filter((p) => p && p.url).slice(0, 6);
  const [wiped, setWiped] = useState<boolean[]>(() => list.map(() => false));
  const [forced, setForced] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const done = list.length === 0 || forced || wiped.every(Boolean);
  const count = wiped.filter(Boolean).length;

  // The fog clears mid-swipe, so the photo button mounts under the finger and
  // would catch the lift as a click. Ignore clicks just after a reveal.
  const revealedAt = useRef<number[]>([]);
  const markWiped = (i: number) => {
    revealedAt.current[i] = Date.now();
    haptic(12);
    setWiped((w) => {
      const n = w.slice();
      n[i] = true;
      return n;
    });
  };

  return (
    <>
      <RoomTitle kicker="Room 4 · the hallway" title="The haunted hallway" sub={list.length ? "The portraits are all fogged up. Wipe the glass to see who's inside." : undefined} />

      {list.length > 0 ? (
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 14px", width: "100%", maxWidth: "calc(440px * var(--vw-s, 1))", paddingTop: 6 }}>
          {list.map((p, i) => {
            const shown = forced || wiped[i];
            const last = i === list.length - 1;
            return (
              <div key={`${p.url}-${i}`} style={{ position: "relative", display: "contents" }}>
                <Frame tilt={TILTS[i % TILTS.length]} closedEyes={shown} caption={p.caption?.trim() || `Memory ${i + 1}`} wide={last && list.length % 2 === 1}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5" }}>
                    {shown ? (
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (Date.now() - (revealedAt.current[i] ?? 0) < 600) return;
                          setOpen(i);
                        }}
                        aria-label={`Open photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
                        initial={reduced ? false : { filter: "blur(6px)" }}
                        animate={{ filter: "blur(0px)" }}
                        transition={{ duration: 0.6 }}
                        style={{ position: "absolute", inset: 0, padding: 0, border: 0, background: "transparent", cursor: "zoom-in" }}
                      >
                        <CroppedPhoto photo={p} alt={p.caption || `Photo ${i + 1}`} />
                      </motion.button>
                    ) : (
                      <ScratchCanvas
                        cover={["#8E84AC", "#CFC6E8"]}
                        label="wipe the fog"
                        labelColor="rgba(43,30,63,.75)"
                        threshold={0.5}
                        brush={26}
                        radius={2}
                        revealLinkAfterMs={5000}
                        onReveal={() => markWiped(i)}
                        style={{ position: "absolute", inset: 0 }}
                      >
                        <div style={{ position: "absolute", inset: 0 }}>
                          <CroppedPhoto photo={p} alt="" />
                        </div>
                      </ScratchCanvas>
                    )}
                  </div>
                </Frame>
                {last && (
                  <span aria-hidden style={{ position: "absolute", right: -8, bottom: -20, transform: "rotate(10deg)", zIndex: 3, pointerEvents: "none" }}>
                    {sticker}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%", maxWidth: 420 }}>
          {[0, 1, 2].map((i) => (
            <Frame key={i} tilt={TILTS[i]} closedEyes caption={["us, soon", "this one's yours", "next memory"][i]}>
              <div style={{ aspectRatio: "4 / 5", display: "grid", placeItems: "center", background: `radial-gradient(80% 70% at 50% 40%, ${HW.plum}, ${HW.night})` }}>
                <Ghost size={52} mood={i === 1 ? "shy" : "happy"} heart={i === 2} />
              </div>
            </Frame>
          ))}
          <p style={{ gridColumn: "1 / -1", margin: "8px 0 0", font: `500 14px ${FONTS.ui}`, color: VW.inkSoft }}>
            {preview ? "Add photos in the form and they'll hang here behind fogged glass." : "A hallway of memories we're still making."}
          </p>
        </div>
      )}

      {list.length > 0 && !done && (
        <>
          <p aria-live="polite" style={{ margin: 0, font: `400 18px ${HW_DISPLAY}`, color: HW.candle }}>
            {count} of {list.length} wiped
          </p>
          <Hint>Rub the misty glass with your finger</Hint>
          <SkipChip onClick={() => setForced(true)}>Wipe them all for me</SkipChip>
        </>
      )}
      {done && list.length > 0 && <p style={{ margin: 0, font: `500 15px ${FONTS.ui}`, color: VW.inkSoft }}>Tap a portrait to see it up close.</p>}
      <Btn onClick={onNext} style={done ? undefined : { opacity: 0.85 }}>
        Up to the attic →
      </Btn>

      <PhotoLightbox photos={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
