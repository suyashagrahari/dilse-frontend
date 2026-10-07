"use client";

// Section 4: the velvet ring box — a real CSS-3D cuboid (base + hinged lid)
// in a spotlight. Swipe UP on the lid: the drag distance maps to the lid
// angle; past 60% it springs open with an overshoot, below that it closes
// with a soft clack. A tap (or Enter/Space) just opens it. Once open the
// ring rises out of the cushion with a lens flare + sparkles, and the satin
// inside the lid shows a rolled scroll (the speech, next).

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { FONTS } from "../../../_valentine/theme";
import { Sticker, burst, haptic } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { ProposeExtras } from "../../../_valentine/days/happy-propose-day";
import { Ring } from "./RingArt";
import { GOLD, GOLD_SOFT, goldBtn, kicker } from "./ui";

const W = 200;
const D = 150;
const HB = 80;
const HL = 44;
const OPEN = 104;

function Face({ w, h, transform, style, children }: { w: number; h: number; transform: string; style?: CSSProperties; children?: ReactNode }) {
  return <div style={{ position: "absolute", width: w, height: h, transform, backfaceVisibility: "hidden", ...style }}>{children}</div>;
}

const velvet = (a = "#8E1A3A", b = "#6B0F2A", c = "#42081A"): CSSProperties => ({
  background: `radial-gradient(120% 90% at 35% 20%, rgba(255,255,255,.14), transparent 55%), linear-gradient(180deg, ${a}, ${b} 55%, ${c})`,
  boxShadow: "inset 0 0 18px rgba(0,0,0,.45)",
});

/** A cuboid of w×h×d centred on its own box; faces given by name. */
function Cuboid({ w, h, d, faces, style }: { w: number; h: number; d: number; faces: Partial<Record<"front" | "back" | "left" | "right" | "top" | "bottom", { style?: CSSProperties; children?: ReactNode }>>; style?: CSSProperties }) {
  const f = (k: keyof typeof faces) => faces[k] ?? { style: velvet() };
  return (
    <div style={{ position: "absolute", width: w, height: h, transformStyle: "preserve-3d", ...style }}>
      <Face w={w} h={h} transform={`translateZ(${d / 2}px)`} style={f("front").style}>
        {f("front").children}
      </Face>
      <Face w={w} h={h} transform={`rotateY(180deg) translateZ(${d / 2}px)`} style={f("back").style} />
      <Face w={d} h={h} transform={`translateX(${(w - d) / 2}px) rotateY(90deg) translateZ(${w / 2}px)`} style={f("right").style} />
      <Face w={d} h={h} transform={`translateX(${(w - d) / 2}px) rotateY(-90deg) translateZ(${w / 2}px)`} style={f("left").style} />
      <Face w={w} h={d} transform={`translateY(${(h - d) / 2}px) rotateX(90deg) translateZ(${h / 2}px)`} style={f("top").style}>
        {f("top").children}
      </Face>
      <Face w={w} h={d} transform={`translateY(${(h - d) / 2}px) rotateX(-90deg) translateZ(${h / 2}px)`} style={f("bottom").style}>
        {f("bottom").children}
      </Face>
    </div>
  );
}

interface Props {
  day: DayConfig;
  data: ValentineDayData<ProposeExtras>;
  reduced: boolean;
  onNext: () => void;
}

export default function RingBox({ day, data, reduced, onNext }: Props) {
  const x = data.extras;
  const id = useId().replace(/:/g, "");
  const angle = useMotionValue(0);
  const lidT = useTransform(angle, (a) => `rotateX(${a}deg)`);
  const ringY = useTransform(angle, [40, OPEN], [90, 0]);
  const ringO = useTransform(angle, [40, 80], [0, 1]);
  const [opened, setOpened] = useState(false);
  const [hint, setHint] = useState<"idle" | "drag" | "clack">("idle");
  const drag = useRef<{ y: number; a: number; moved: boolean } | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const slot = day.gifSlots[1];

  useMotionValueEvent(angle, "change", (a) => {
    if (!opened && a > OPEN - 14 && !drag.current) {
      setOpened(true);
    }
  });

  useEffect(() => {
    if (!opened) return;
    haptic([12, 40, 20]);
    const r = sceneRef.current?.getBoundingClientRect();
    const origin = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.5) / window.innerHeight } : undefined;
    burst({ kind: "sparkles", origin, count: 28, spread: 0.3 });
  }, [opened]);

  const openFully = () => {
    if (reduced) {
      angle.set(OPEN);
      setOpened(true);
      return;
    }
    if (angle.get() >= OPEN - 2) {
      setOpened(true);
      return;
    }
    animate(angle, OPEN, { type: "spring", stiffness: 110, damping: 11 }).then(() => setOpened(true));
  };

  const onDown = (e: React.PointerEvent) => {
    if (opened) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { y: e.clientY, a: angle.get(), moved: false };
    setHint("drag");
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = d.y - e.clientY;
    if (Math.abs(dy) > 6) d.moved = true;
    angle.set(Math.max(0, Math.min(OPEN, d.a + dy * 0.85)));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || opened) return;
    if (!d.moved || angle.get() > OPEN * 0.6) {
      openFully();
    } else {
      animate(angle, 0, { type: "spring", stiffness: 300, damping: 18 });
      haptic(15);
      setHint("clack");
    }
  };

  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>Centre stage</p>
        <h2 style={{ margin: 0, font: `italic 700 30px/1.15 ${FONTS.serif}`, color: "#FFF6EC" }}>{opened ? "Oh. Oh, wow." : "A little velvet box"}</h2>
        <p style={{ margin: 0, minHeight: 22, font: `400 15px ${FONTS.ui}`, color: "#E8CFC9" }} aria-live="polite">
          {opened ? "There's a scroll tucked inside the lid…" : hint === "clack" ? "almost! a little more…" : "Swipe up on the lid to open it"}
        </p>
      </header>

      <div
        ref={sceneRef}
        role="button"
        tabIndex={0}
        aria-label={opened ? "The ring box is open" : "Open the ring box (swipe up on the lid, or press Enter)"}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => {
          if (!opened && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openFully();
          }
        }}
        style={{ position: "relative", width: 300, height: 330, perspective: 900, perspectiveOrigin: "50% 10%", touchAction: "none", cursor: opened ? "default" : "grab", outline: "none", userSelect: "none", WebkitUserSelect: "none" }}
      >
        {/* spotlight pool */}
        <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 6, width: 300, height: 70, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,201,210,.28), transparent)" }} />
        <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 34, width: 230, height: 34, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.55), transparent)" }} />
        {/* flare */}
        {opened && !reduced && (
          <motion.div
            aria-hidden
            initial={{ scale: 0.2, opacity: 0.95 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{ position: "absolute", left: "50%", top: 112, width: 120, height: 120, marginLeft: -60, borderRadius: "50%", background: "radial-gradient(closest-side, #fff, rgba(255,246,236,.5) 40%, transparent)", zIndex: 5, pointerEvents: "none" }}
          />
        )}
        <div className={!opened && !reduced ? "pd-float" : undefined} style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", left: (300 - W) / 2, top: 200, width: W, height: HB, transformStyle: "preserve-3d", transform: "rotateX(-16deg) rotateY(-14deg)" }}>
            {/* base */}
            <Cuboid
              w={W}
              h={HB}
              d={D}
              faces={{
                front: {
                  style: { ...velvet(), borderTop: `3px solid ${GOLD}`, borderRadius: "0 0 10px 10px" },
                  children: <span aria-hidden style={{ position: "absolute", left: "50%", top: 10, width: 18, height: 10, marginLeft: -9, borderRadius: "0 0 6px 6px", background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD})` }} />,
                },
                top: {
                  style: {
                    background:
                      "radial-gradient(70% 40% at 50% 26%, rgba(255,255,255,.16), transparent 70%), radial-gradient(70% 40% at 50% 74%, rgba(255,255,255,.16), transparent 70%), linear-gradient(180deg, #3E0818 0%, #8E1A3A 20%, #A3274A 28%, #6B0F2A 44%, #14020A 48.5%, #14020A 51.5%, #6B0F2A 56%, #A3274A 72%, #8E1A3A 80%, #3E0818 100%)",
                    boxShadow: "inset 0 0 0 5px #5A0C22, inset 0 0 18px 6px rgba(0,0,0,.6)",
                  },
                },
                left: { style: velvet("#7A1232", "#5A0C22", "#36061A") },
                right: { style: velvet("#7A1232", "#5A0C22", "#36061A") },
                bottom: { style: { background: "#2A0410" } },
              }}
            />
            {/* the ring, seated in the cushion slit: its plane is clipped at the cushion line */}
            <div style={{ position: "absolute", left: (W - 112) / 2, top: -88, width: 112, height: 88, overflow: "hidden", transform: "translateZ(0px)" }}>
              <motion.div style={{ position: "absolute", left: 2, top: 0, y: ringY, opacity: ringO }}>
                <Ring style={x.ringStyle} stone={x.stoneColor} id={id} size={108} sparkle={opened} />
              </motion.div>
            </div>
            {/* the plush front roll of the cushion, in front of the band */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 10,
                width: W - 20,
                top: -13,
                height: 15,
                borderRadius: "14px 14px 3px 3px",
                transform: "translateZ(12px)",
                background: "radial-gradient(60% 90% at 50% 20%, rgba(255,255,255,.22), transparent 70%), linear-gradient(180deg, #B0304F, #8E1A3A 45%, #5A0C22)",
                boxShadow: "0 3px 6px rgba(0,0,0,.45)",
              }}
            />
            {/* lid, hinged on its back-bottom edge */}
            <motion.div style={{ position: "absolute", left: 0, top: -HL, width: W, height: HL, transformStyle: "preserve-3d", transformOrigin: `50% 100% ${-D / 2}px`, transform: lidT }}>
              <Cuboid
                w={W}
                h={HL}
                d={D}
                faces={{
                  front: { style: { ...velvet("#9B1B40", "#7A1232", "#5A0C22"), borderRadius: "10px 10px 0 0", borderBottom: `2px solid ${GOLD}` } },
                  top: {
                    style: { ...velvet("#A11E45", "#7A1232", "#5A0C22"), borderRadius: 12, display: "grid", placeItems: "center" },
                    children: (
                      <span aria-hidden style={{ width: 46, height: 46, borderRadius: "50%", border: `2px solid ${GOLD}`, boxShadow: `inset 0 0 0 4px rgba(0,0,0,0), inset 0 0 0 5px ${GOLD}88`, display: "grid", placeItems: "center", opacity: 0.9 }}>
                        <span style={{ width: 14, height: 14, transform: "rotate(45deg)", background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD})`, boxShadow: "0 1px 2px rgba(0,0,0,.4)" }} />
                      </span>
                    ),
                  },
                  bottom: {
                    style: {
                      background: "linear-gradient(125deg, #7A1232 0%, #A8325A 30%, #D3698C 44%, #A8325A 56%, #8E1A3A 78%, #6B0F2A 100%)",
                      boxShadow: `inset 0 0 0 5px #6B0F2A, inset 0 0 0 6.5px ${GOLD}, inset 0 0 22px rgba(40,0,10,.55)`,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 10,
                    },
                    children: (
                      <span aria-hidden style={{ position: "relative", width: 128, height: 24 }}>
                        {/* the rolled scroll */}
                        <span style={{ position: "absolute", inset: 0, borderRadius: 12, background: "linear-gradient(180deg,#FFF4DE,#EBD3A6 50%,#C9A66C)", boxShadow: "0 4px 8px rgba(40,0,10,.45)" }} />
                        <span style={{ position: "absolute", right: -3, top: 2, width: 8, height: 20, borderRadius: "50%", background: "#D9BC8A", boxShadow: "inset 2px 0 3px rgba(90,50,20,.4)" }} />
                        {/* satin straps holding it */}
                        {[26, 90].map((l) => (
                          <span key={l} style={{ position: "absolute", left: l, top: -9, width: 13, height: 42, borderRadius: 3, background: "linear-gradient(90deg, #C24A6E, #F0A3BC 50%, #C24A6E)", boxShadow: "0 2px 4px rgba(40,0,10,.4)" }}>
                            <span style={{ position: "absolute", left: 4, top: 2, width: 5, height: 5, borderRadius: "50%", background: GOLD }} />
                            <span style={{ position: "absolute", left: 4, bottom: 2, width: 5, height: 5, borderRadius: "50%", background: GOLD }} />
                          </span>
                        ))}
                      </span>
                    ),
                  },
                  left: { style: velvet("#8E1A3A", "#6B0F2A", "#42081A") },
                  right: { style: velvet("#8E1A3A", "#6B0F2A", "#42081A") },
                  back: { style: velvet("#7A1232", "#5A0C22", "#36061A") },
                }}
              />
            </motion.div>
          </div>
        </div>
        {!opened && (
          <motion.div
            aria-hidden
            animate={reduced ? undefined : { y: [0, -14, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ position: "absolute", left: "50%", top: 96, marginLeft: -14, font: `600 26px ${FONTS.ui}`, color: GOLD, pointerEvents: "none" }}
          >
            ⌃
          </motion.div>
        )}
        {opened && slot && (
          <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }} style={{ position: "absolute", left: -14, top: 4 }}>
            <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={58} eager />
          </motion.div>
        )}
      </div>

      <div style={{ minHeight: 70, display: "grid", justifyItems: "center", alignContent: "start" }}>
        {opened ? (
          <motion.button initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} type="button" onClick={onNext} style={goldBtn}>
            Unroll the scroll 📜
          </motion.button>
        ) : (
          <button type="button" onClick={openFully} style={{ minHeight: 44, padding: "10px 18px", borderRadius: 999, border: "1.5px solid rgba(230,194,122,.35)", background: "rgba(255,246,236,.06)", color: "#E8CFC9", font: `600 14px ${FONTS.ui}`, cursor: "pointer" }}>
            Just open it 💍
          </button>
        )}
      </div>
    </>
  );
}
