"use client";

// ─── TeddyWardrobe — the win pop-out, then "dress me like you see me" ────────
//
// win:   the teddy bursts out of the prize door with squash-and-stretch,
//        confetti, the sender's win line, GIF t2.
// dress: the sender's outfit is already on ("how SENDER sees you"); the
//        wardrobe tray toggles any of 8 accessories (tap) or drag one onto the
//        teddy. One item per slot (a crown replaces the cap…). Each sender
//        item carries its note, which pops in a speech bubble when worn or
//        tapped. The teddy blinks, wiggles and blushes at every change.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { burst, haptic } from "../../_valentine/kit";
import { ITEMS, ItemIcon, T, Teddy, labelOf, slotOf, wear, type Fur, type ItemId } from "./teddyArt";
import { tsfx } from "./teddySfx";

export default function TeddyWardrobe({
  teddyName,
  senderName,
  winLine,
  fur,
  initialWorn,
  notes,
  reduced,
  sound,
  preview,
  sticker,
  onNext,
}: {
  teddyName: string;
  senderName: string;
  winLine: string;
  fur: Fur;
  initialWorn: ItemId[];
  notes: Partial<Record<ItemId, string>>;
  reduced: boolean;
  sound: boolean;
  preview: boolean;
  sticker: (id: string, size: number, style?: CSSProperties) => ReactNode;
  onNext: (worn: ItemId[]) => void;
}) {
  const [phase, setPhase] = useState<"win" | "dress">("win");
  const [worn, setWorn] = useState<ItemId[]>(initialWorn);
  const [react, setReact] = useState(0);
  const [bubble, setBubble] = useState<{ id: ItemId | null; text: string } | null>(null);
  const teddyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => burst({ kind: "confetti", colors: ["#FF8FB8", "#A8E6CF", "#FFF1B5", "#CDB4DB", "#7FE3FF"], origin: { x: 0.5, y: 0.4 } }), 350);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const sender = senderName || "they";
  const firstNoted = initialWorn.find((i) => notes[i]);

  const startDress = () => {
    setPhase("dress");
    haptic(8);
    if (firstNoted) setBubble({ id: firstNoted, text: notes[firstNoted]! });
    else setBubble({ id: null, text: `Dress me up, ${teddyName} is all yours 😌` });
  };

  const toggle = (id: ItemId) => {
    const on = worn.includes(id);
    const next = on ? worn.filter((w) => w !== id) : wear(worn, id);
    setWorn(next);
    setReact((n) => n + 1);
    haptic(8);
    tsfx.squeak(sound);
    if (!on) {
      setBubble({ id, text: notes[id] ?? REACTIONS[id] });
      const r = teddyRef.current?.getBoundingClientRect();
      if (r && !reduced) burst({ kind: "sparkles", count: 10, spread: 0.12, origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight } });
    } else setBubble({ id: null, text: OFF_LINES[react % OFF_LINES.length] });
  };

  const overTeddy = (x: number, y: number) => {
    const r = teddyRef.current?.getBoundingClientRect();
    return !!r && x > r.left - 20 && x < r.right + 20 && y > r.top - 20 && y < r.bottom + 20;
  };

  const dressing = phase === "dress";

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `58px 16px ${preview ? 130 : 48}px`, textAlign: "center" }}>
      {/* heading */}
      <div style={{ minHeight: 84, display: "grid", placeItems: "end center", width: "100%", maxWidth: 400, marginBottom: 14 }}>
        <AnimatePresence mode="wait">
          {!dressing ? (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.5 }}>
              <p style={{ margin: 0, font: `800 13px ${FONTS.ui}`, letterSpacing: ".28em", color: T.mint, textShadow: "0 0 10px rgba(168,230,207,.6)" }}>★ WINNER ★</p>
              <h2 style={{ margin: "4px 0 0", font: `700 clamp(30px, 9vw, 40px)/1.15 ${FONTS.script}`, color: T.cream, overflowWrap: "break-word" }}>{winLine || "You won… me. Again. 🧸"}</h2>
            </motion.div>
          ) : (
            <motion.div key="dress" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: T.lilac }}>How {sender} sees you</p>
              <h2 style={{ margin: "4px 0 0", font: `700 clamp(28px, 8vw, 36px)/1.15 ${FONTS.serif}`, color: T.cream, overflowWrap: "break-word" }}>Dress {teddyName}</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* the teddy */}
      <div style={{ position: "relative", width: 260, height: 300, marginTop: 8 }}>
        <motion.div
          ref={teddyRef}
          initial={reduced ? { opacity: 0 } : { y: 240, scaleX: 0.3, scaleY: 0.3, opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { y: [240, -40, 0, 0], scaleX: [0.3, 0.85, 1.14, 1], scaleY: [0.3, 1.18, 0.88, 1], opacity: 1 }}
          transition={reduced ? { duration: 0.3 } : { duration: 1, times: [0, 0.45, 0.75, 1], ease: "easeOut" }}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "grid", placeItems: "end center", transformOrigin: "50% 100%" }}
        >
          <motion.div
            key={react}
            animate={react && !reduced ? { rotate: [0, -7, 6, -3, 0], scale: [1, 1.06, 0.97, 1] } : {}}
            transition={{ duration: 0.55 }}
            className={reduced ? undefined : "td-breathe"}
            style={{ width: dressing ? 210 : 240, transition: "width .5s" }}
          >
            <Teddy fur={fur} worn={worn} pose={dressing ? "stand" : "cheer"} mood={react ? "happy" : "open"} size="100%" title={`${teddyName}, the teddy`} />
          </motion.div>
        </motion.div>
        {!dressing && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 14 }} style={{ position: "absolute", right: -18, top: -6 }}>
            {sticker("t2-win", 84)}
          </motion.div>
        )}
        {/* speech bubble */}
        <AnimatePresence mode="wait">
          {dressing && bubble && (
            <motion.div
              key={bubble.text + (bubble.id ?? "")}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              aria-live="polite"
              style={{ position: "absolute", left: "50%", top: -2, width: "min(78vw, 290px)", marginLeft: "calc(min(78vw, 290px) / -2)", zIndex: 3 }}
            >
              <div style={{ position: "relative", padding: "10px 14px", borderRadius: 18, background: T.cream, color: T.ink, boxShadow: "0 12px 24px -12px rgba(0,0,0,.55)", font: `500 14px/1.4 ${FONTS.ui}`, overflowWrap: "break-word" }}>
                {bubble.id && notes[bubble.id] && <b style={{ display: "block", font: `700 11px ${FONTS.ui}`, letterSpacing: ".12em", color: "#D9628F", textTransform: "uppercase" }}>{sender} picked the {labelOf(bubble.id).toLowerCase()}</b>}
                {bubble.text}
                <span aria-hidden style={{ position: "absolute", left: "50%", bottom: -8, width: 16, height: 16, marginLeft: -8, background: T.cream, transform: "rotate(45deg)", borderRadius: 3 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!dressing ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 18 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 99, background: "rgba(255,248,240,.1)", border: `1.5px dashed ${T.pink}`, font: `600 15px ${FONTS.ui}`, color: T.cream }}>
            <svg viewBox="0 0 24 22" width="18" height="16" aria-hidden>
              <path d="M12 21 C5 16 1 12 1 7 C1 3.5 3.8 1 7 1 C9.2 1 11 2.2 12 4 C13 2.2 14.8 1 17 1 C20.2 1 23 3.5 23 7 C23 12 19 16 12 21 Z" fill={T.hot} />
            </svg>
            Meet {teddyName}
          </span>
          <button type="button" onClick={startDress} style={primaryBtn}>
            Dress {teddyName} up 🎀
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: "min(100%, 380px)", marginTop: 16 }}>
          <div style={{ padding: 12, borderRadius: 22, background: "linear-gradient(180deg, rgba(255,248,240,.12), rgba(255,248,240,.05))", border: "1.5px solid rgba(255,248,240,.18)" }}>
            <p style={{ margin: "0 0 10px", font: `600 12px ${FONTS.ui}`, letterSpacing: ".18em", color: T.lilac }}>WARDROBE · TAP OR DRAG ONTO {teddyName.toUpperCase()}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {ITEMS.map((it) => {
                const on = worn.includes(it.id);
                return (
                  <motion.button
                    key={it.id}
                    type="button"
                    drag={!reduced}
                    dragSnapToOrigin
                    dragElastic={0.6}
                    whileDrag={{ scale: 1.15, zIndex: 20 }}
                    whileTap={{ scale: 0.92 }}
                    onDragEnd={(e, info) => {
                      if (overTeddy(info.point.x - window.scrollX, info.point.y - window.scrollY) && !worn.includes(it.id)) toggle(it.id);
                    }}
                    onTap={() => toggle(it.id)}
                    aria-pressed={on}
                    aria-label={`${it.label}${on ? " (wearing)" : ""}`}
                    style={{ position: "relative", aspectRatio: "1", borderRadius: 16, border: `2px solid ${on ? T.bubblegum : "rgba(255,248,240,.16)"}`, background: on ? "rgba(255,143,184,.2)" : "rgba(255,248,240,.06)", display: "grid", placeItems: "center", padding: 4, cursor: "grab", touchAction: "none" }}
                  >
                    <ItemIcon id={it.id} size={40} />
                    <span style={{ font: `600 10.5px ${FONTS.ui}`, color: T.cream, marginTop: -2 }}>{it.label}</span>
                    {on && <span aria-hidden style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 20, background: T.bubblegum, color: "#fff", font: `800 12px/20px ${FONTS.ui}` }}>✓</span>}
                    {notes[it.id] && <span aria-hidden style={{ position: "absolute", top: 4, left: 6, fontSize: 10 }}>💌</span>}
                  </motion.button>
                );
              })}
            </div>
            <button type="button" onClick={() => { setWorn(initialWorn); setReact((n) => n + 1); setBubble({ id: null, text: `Back to ${sender}'s pick 😌` }); }} style={{ marginTop: 10, minHeight: 36, padding: "6px 12px", border: 0, background: "transparent", color: T.lilac, font: `500 13px ${FONTS.ui}`, cursor: "pointer" }}>
              ↺ {sender}&apos;s pick
            </button>
          </div>
          <button type="button" onClick={() => onNext(worn)} style={{ ...primaryBtn, marginTop: 18 }}>
            Perfect. Now what, {teddyName}? 💌
          </button>
        </motion.div>
      )}
    </div>
  );
}

const REACTIONS: Record<ItemId, string> = {
  crown: "Royalty, obviously 👑",
  cap: "Sporty teddy unlocked 🧢",
  bow: "Cuteness +100 🎀",
  flower: "Smells like a garden 🌼",
  glasses: "Very intellectual now 🤓",
  scarf: "Warm and toasty 🧣",
  bowtie: "Dressed for a date 🎩",
  sweater: "Soft. Softer. Softest. 🧶",
};
const OFF_LINES = ["Okay okay, it's off 🙈", "Minimalist teddy era.", "Less is more, I guess 😌"];

export const primaryBtn: CSSProperties = {
  minHeight: 54,
  padding: "14px 26px",
  borderRadius: 18,
  border: 0,
  background: T.bubblegum,
  color: "#3A1F33",
  font: `700 17px ${FONTS.ui}`,
  boxShadow: "0 5px 0 #D9628F, 0 16px 30px -14px rgba(0,0,0,.6)",
  cursor: "pointer",
};

export { slotOf };
