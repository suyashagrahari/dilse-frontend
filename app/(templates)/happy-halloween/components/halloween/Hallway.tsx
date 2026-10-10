"use client";

// Room 4 — The Haunted Hallway. Crooked gilt frames line the wall; every
// portrait is behind fogged glass (the kit's ScratchCanvas with a misty
// cover). Wipe the fog to find the sender's photos. Each frame has a pair of
// painted eyes on its crest that follow your finger around — until you've
// wiped that portrait, then they close happily. A revealed portrait opens
// the lightbox. The way on shows once a wall is wiped; no photos = a hallway
// of little ghost paintings waiting for memories.
//
// One screen: the hallway walks two portraits at a time (the candy pill says
// "More portraits" until the last pair), each frame sized to the room with
// container units, so six photos never mean a scroll.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, PhotoLightbox, ScratchCanvas, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS, VW } from "../../../_valentine/theme";
import { Ghost } from "./art";
import { HW_DISPLAY } from "./fonts";
import { useHw, useNext } from "./stage";
import { Hint, HW, RoomTitle } from "./ui";

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

function Frame({ children, tilt, closedEyes, caption, style }: { children: ReactNode; tilt: number; closedEyes: boolean; caption: string; style?: CSSProperties }) {
  return (
    <figure style={{ margin: 0, display: "grid", justifyItems: "center", gap: 6, transform: `rotate(${tilt}deg)`, ...style }}>
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

const PER_PAGE = 2;
/** One portrait's width: fills its half of the room, never taller than the room (4:5 photo + frame + eyes + caption ≈ 70px). */
const W2 = "min(calc((100cqw - 40px) / 2), calc((100cqh - 72px) * .8 + 18px))";
const W1 = "min(72cqw, calc((100cqh - 72px) * .8 + 18px))";

export default function Hallway({ photos, preview, sticker, onNext }: { photos: LovePhoto[]; preview: boolean; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useHw();
  const list = photos.filter((p) => p && p.url).slice(0, 6);
  const [wiped, setWiped] = useState<boolean[]>(() => list.map(() => false));
  const [open, setOpen] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const done = list.length === 0 || wiped.every(Boolean);
  const count = wiped.filter(Boolean).length;
  const onPage = list.map((p, i) => ({ p, i })).slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const pageDone = onPage.every(({ i }) => wiped[i]);
  const lastPage = page >= pages - 1;

  // The fog clears mid-swipe, so the photo button mounts under the finger and
  // would catch the lift as a click. Ignore clicks just after a reveal.
  const revealedAt = useRef<number[]>([]);
  const markWiped = (i: number) => {
    revealedAt.current[i] = performance.now();
    haptic(12);
    cue("sparkle", { gain: 0.55 });
    setWiped((w) => {
      const n = w.slice();
      n[i] = true;
      return n;
    });
  };

  // The way on shows once every portrait on this wall is wiped (straight away when there are no photos).
  useNext(pageDone || list.length === 0 ? (lastPage ? "Up to the attic" : "More portraits") : null, () => (lastPage ? onNext() : setPage((p) => p + 1)), lastPage ? "moon" : "ghost");

  return (
    <>
      <RoomTitle
        kicker="Room 4 · the hallway"
        title="The haunted hallway"
        sub={list.length ? (done ? "Tap a portrait to see it up close." : "The portraits are fogged up. Wipe the glass to see who's inside.") : undefined}
      />

      <div className="hw-fill">
        {list.length > 0 ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              initial={reduced ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ position: "relative", display: "flex", gap: 18, alignItems: "center", justifyContent: "center", width: "100%" }}
            >
              {onPage.map(({ p, i }, k) => {
                const shown = wiped[i];
                const last = i === list.length - 1;
                return (
                  <div key={`${p.url}-${i}`} style={{ position: "relative" }}>
                    <Frame tilt={TILTS[i % TILTS.length]} closedEyes={shown} caption={p.caption?.trim() || `Memory ${i + 1}`} style={{ width: onPage.length > 1 ? W2 : W1, marginTop: k % 2 ? 22 : 0 }}>
                      <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5" }}>
                        {shown ? (
                          <motion.button
                            type="button"
                            onClick={() => {
                              if (performance.now() - (revealedAt.current[i] ?? -1e9) < 600) return;
                              setOpen(i);
                            }}
                            aria-label={`Open photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
                            initial={reduced ? false : { opacity: 0.4 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
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
                            // no visible "reveal" shortcut for touch (no skips); keyboard users still get it on focus
                            revealLinkAfterMs={1e9}
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
                      <span aria-hidden style={{ position: "absolute", right: -14, bottom: -6, transform: "rotate(10deg)", zIndex: 3, pointerEvents: "none" }}>
                        {sticker}
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{ display: "grid", gap: 10, justifyItems: "center", width: "100%" }}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", width: "100%" }}>
              {[0, 1, 2].map((i) => (
                <Frame key={i} tilt={TILTS[i]} closedEyes caption={["us, soon", "this one's yours", "next memory"][i]} style={{ width: "min(calc((100cqw - 48px) / 3), calc((100cqh - 110px) * .8))" }}>
                  <div style={{ aspectRatio: "4 / 5", display: "grid", placeItems: "center", background: `radial-gradient(80% 70% at 50% 40%, ${HW.plum}, ${HW.night})` }}>
                    <Ghost size="62%" mood={i === 1 ? "shy" : "happy"} heart={i === 2} />
                  </div>
                </Frame>
              ))}
            </div>
            <p style={{ margin: 0, font: `500 14px ${FONTS.ui}`, color: VW.inkSoft }}>
              {preview ? "Add photos in the form and they'll hang here behind fogged glass." : "A hallway of memories we're still making."}
            </p>
          </div>
        )}
      </div>

      {list.length > 0 && (
        <div style={{ flex: "none", display: "grid", gap: 4, justifyItems: "center", minHeight: 84, alignContent: "start" }}>
          <div className="hw-row" style={{ gap: 12 }}>
            {page > 0 && (
              <button type="button" onClick={() => setPage((p) => p - 1)} aria-label="Previous portraits" style={{ minHeight: 36, padding: "4px 12px", borderRadius: 99, border: "1px solid rgba(247,243,255,.25)", background: "rgba(247,243,255,.08)", color: VW.ink, font: `600 13px ${FONTS.ui}`, cursor: "pointer" }}>
                ‹ back
              </button>
            )}
            <p aria-live="polite" style={{ margin: 0, font: `400 clamp(16px, 2.5dvh, 18px) ${HW_DISPLAY}`, color: HW.candle }}>
              {done ? `All ${list.length} portraits found 💜` : `${count} of ${list.length} wiped`}
            </p>
            {pages > 1 && (
              <span aria-label={`Wall ${page + 1} of ${pages}`} role="img" style={{ display: "inline-flex", gap: 5 }}>
                {Array.from({ length: pages }, (_, k) => (
                  <span key={k} style={{ width: 7, height: 7, borderRadius: "50%", background: k === page ? HW.candle : "rgba(247,243,255,.28)" }} />
                ))}
              </span>
            )}
          </div>
          {!done && !pageDone && <Hint>Rub the misty glass with your finger</Hint>}
        </div>
      )}

      <PhotoLightbox photos={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
