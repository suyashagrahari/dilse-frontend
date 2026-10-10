"use client";

// The keepsake: the Boo License (from the $2 house, upgraded). A cream ID card
// with her photo, "Certified boo of {sender}", their costume, the perks, a
// license number and an orange CERTIFIED BOO stamp that thumps down. Saved as
// a 9:16 story card (or a 4:5 post) she can post. Then "Boo him back" (the
// ReplyBox), replay, and "make one" for the recipient.
// v4: one screen. The perks fold out on the back of the card (tap to turn it
// over), "Boo him back" opens the reply as a bottom sheet, and "Scare your boo"
// (not on kids pages) counts 3·2·1 and BOOs whoever she's holding the phone up to.

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { ReplyBox, saveOrSharePoster, sfx } from "../../../_valentine/kit/premium";
import { Ghost } from "./art";
import { BODY, DISPLAY, HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { useBoo } from "./Scare";
import { Gif, POP, Puffy } from "./ui";

const licenseNo = (n: Night) => {
  const ini = n.initials.replace(/[^A-Z]/gi, "").toUpperCase().slice(0, 2) || "BO";
  return `BOO-3110-${ini}`;
};

// A tiny ghost for the canvas poster (a data: URL never taints the canvas).
const GHOST_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 132"><path d="M60 6 C27 6 12 33 12 62 L12 110 Q20 101 28 110 Q36 119 44 110 Q52 101 60 110 Q68 119 76 110 Q84 101 92 110 Q100 119 108 110 L108 62 C108 33 93 6 60 6 Z" fill="#fff" stroke="#E3D6F7" stroke-width="3"/><ellipse cx="44" cy="57" rx="6" ry="8" fill="#2A1F3D"/><ellipse cx="76" cy="57" rx="6" ry="8" fill="#2A1F3D"/><circle cx="46.5" cy="53.5" r="2.2" fill="#fff"/><circle cx="78.5" cy="53.5" r="2.2" fill="#fff"/><ellipse cx="33" cy="71" rx="8" ry="4.5" fill="#FF9EC4"/><ellipse cx="87" cy="71" rx="8" ry="4.5" fill="#FF9EC4"/><path d="M53 73 Q60 80 67 73" stroke="#2A1F3D" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
  );

function posterLayout(n: Night, endLine: string, format: "story" | "feed"): KeepsakeLayout {
  const W = 1080;
  const story = format === "story";
  const H = story ? 1920 : 1350;
  const items: KeepsakeItem[] = [];
  // stars
  const stars = story ? 16 : 10;
  for (let i = 0; i < stars; i++) items.push({ type: "emoji", char: i % 3 ? "✨" : "⭐", x: (i * 197 + 80) % 1000 + 40, y: ((i * 131) % (story ? 300 : 160)) + 60, size: 26 + (i % 3) * 8 });
  let y = story ? 250 : 120;
  if (story && endLine) {
    items.push({ type: "text", text: endLine, x: W / 2, y, size: 64, face: "ui", weight: 700, color: "#FFFFFF", maxWidth: 940, maxLines: 2 });
    y += 150;
  }
  // the card
  const cx = 90;
  const cw = W - 180;
  const cy = y;
  // the card's height depends on the perks, so its rects are inserted first once known
  const cardAt = items.length;
  items.push({ type: "text", text: n.copy.license.toUpperCase(), x: W / 2, y: cy + 78, size: 62, face: "ui", weight: 700, color: BN.ink, maxWidth: cw - 80, maxLines: 1 });
  items.push({ type: "text", text: n.house, x: W / 2, y: cy + 138, size: 34, face: "ui", weight: 600, color: "#4A3A80", maxWidth: cw - 80, maxLines: 1 });
  // photo
  const pw = 360;
  const ph = 450;
  const px = cx + 50;
  const py = cy + 220;
  if (n.hero) items.push({ type: "image", src: n.hero.url, x: px, y: py, w: pw, h: ph, cropX: n.hero.cropX, cropY: n.hero.cropY, rotate: -3, frame: { pad: 18, bottom: 70, color: "#FFFFFF" } });
  else items.push({ type: "image", src: GHOST_SVG, x: px + 40, y: py + 40, w: 280, h: 308 });
  // fields
  const fx = px + pw + 60;
  const fw = cx + cw - fx - 40;
  let fy = py + 30;
  const field = (label: string, value: string, size = 46, face: "ui" | "script" = "ui") => {
    items.push({ type: "text", text: label, x: fx, y: fy, size: 24, face: "ui", weight: 700, color: "#8E6FE0", align: "left", maxWidth: fw });
    fy += size + 14;
    items.push({ type: "text", text: value, x: fx, y: fy, size, face, weight: 700, color: BN.ink, align: "left", maxWidth: fw, maxLines: 2, lineHeight: 1.1 });
    // a value that wraps takes a second line
    const lines = value.length * size * 0.52 > fw ? 2 : 1;
    fy += size * 1.1 * (lines - 1) + size + 38;
  };
  field("NAME", n.recipient, 64, "script");
  if (n.sender) field(n.copy.licensed.toUpperCase(), n.sender, 44, "script");
  if (n.duo) field("COSTUME", n.duo, 34);
  field("LICENSE NO.", licenseNo(n), 32);
  // perks
  let ky = py + ph + 150;
  items.push({ type: "text", text: "PERKS", x: cx + 60, y: ky, size: 26, face: "ui", weight: 700, color: "#8E6FE0", align: "left" });
  ky += 56;
  for (const perk of n.perks) {
    items.push({ type: "text", text: `🍬  ${perk}`, x: cx + 60, y: ky, size: 40, face: "ui", weight: 600, color: BN.ink, align: "left", maxWidth: cw - 120, maxLines: 1 });
    ky += 62;
  }
  const ch = Math.max(ky - cy + 70, py + ph + 120 - cy);
  items.splice(
    cardAt,
    0,
    { type: "rect", x: cx + 6, y: cy + 18, w: cw, h: ch, radius: 56, fill: "rgba(20,10,40,0.35)" },
    { type: "rect", x: cx, y: cy, w: cw, h: ch, radius: 56, fill: BN.cream, stroke: "#FFFFFF", lineWidth: 10 },
    { type: "rect", x: cx, y: cy, w: cw, h: 170, radius: 56, fill: BN.lilac },
    { type: "rect", x: cx, y: cy + 110, w: cw, h: 60, fill: BN.lilac },
  );
  // stamp: thumped over the photo's corner
  const sx = px - 34;
  const sy = py + ph - 170;
  items.push({ type: "rect", x: sx, y: sy, w: 220, h: 220, radius: 110, fill: "rgba(255,244,227,0.9)", stroke: BN.orangeDeep, lineWidth: 8 });
  items.push({ type: "text", text: "CERTIFIED", x: sx + 110, y: sy + 92, size: 30, face: "ui", weight: 700, color: BN.orangeDeep });
  items.push({ type: "text", text: "BOO", x: sx + 110, y: sy + 150, size: 58, face: "ui", weight: 700, color: BN.orangeDeep });
  items.push({ type: "image", src: GIF.couple, x: cx + cw - 230, y: cy - 90, w: 220, h: 220 });
  items.push({ type: "text", text: "valid every October, forever", x: W / 2, y: cy + ch - 34, size: 28, face: "ui", weight: 600, color: "#6B5A86" });
  if (n.sender) items.push({ type: "text", text: `hand-made by ${n.sender} for ${n.recipient}`, x: W / 2, y: cy + ch + 110, size: 44, face: "script", weight: 700, color: "#FFF7EC", maxWidth: 940, maxLines: 1 });
  items.push({ type: "image", src: GHOST_SVG, x: 70, y: cy + ch + 20, w: 130, h: 143 });
  items.push({ type: "text", text: "31 · 10  ✦  subhsandesh.in", x: W / 2, y: H - (story ? 110 : 50), size: 28, face: "ui", weight: 600, color: "rgba(255,247,236,0.85)" });
  return { width: W, height: H, background: { stops: [[0, "#3B2D6E"], [0.55, "#4A3A80"], [1, "#7A55A0"]] }, items };
}

export default function License({ n, endLine, mode, onReplay }: { n: Night; endLine: string; mode: "preview" | "live"; onReplay: () => void }) {
  const boo = useBoo();
  const [saving, setSaving] = useState<"" | "story" | "feed">("");
  const [saved, setSaved] = useState("");
  const [stamped, setStamped] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [reply, setReply] = useState(false);
  const line = endLine.trim() || "Happy Halloween, my boo. 👻";

  useEffect(() => {
    const t = window.setTimeout(() => {
      // (a transition: the re-render is sliced, not one long task right after the scene change)
      startTransition(() => setStamped(true));
      sfx("bn-stamp", { gain: 0.8 });
      haptic([30, 20]);
    }, 900);
    return () => window.clearTimeout(t);
  }, []);
  // the "scare your boo" ghost: warm a fresh copy now, so 3·2·1 never waits
  const { warm } = boo;
  useEffect(() => {
    warm();
  }, [warm]);
  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(""), 3200);
    return () => window.clearTimeout(t);
  }, [saved]);

  const save = async (format: "story" | "feed") => {
    if (saving) return;
    setSaving(format);
    haptic(10);
    sfx("paper-rustle", { gain: 0.5 });
    const r = await saveOrSharePoster(posterLayout(n, line, format), `boo-license-${n.recipient}-${format}`, `${n.recipient}'s ${n.copy.license} 👻`);
    setSaving("");
    setSaved(r === "failed" ? "Couldn't save here. A screenshot works too." : r === "shared" ? "Shared 👻" : "Saved to your phone 👻");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };
  const flip = () => {
    setFlipped((f) => !f);
    haptic(8);
    sfx("paper-rustle", { gain: 0.4 });
  };
  const scareThem = () =>
    boo.countdown({
      line: "Got them! 💜",
      sub: `Now hand the phone back to ${n.recipient}. Gently.`,
    });

  return (
    <div className="bn-scene bn-license">
      <p className="bn-kicker">Official business 🎃</p>
      <motion.h2 className="bn-title bn-endH" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={POP}>
        {line}
      </motion.h2>

      <div className="bn-cardZone">
        <motion.div className="bn-cardIn" initial={{ y: 40, rotate: 4, opacity: 0 }} animate={{ y: 0, rotate: -1.5, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}>
          <button type="button" className={`bn-card3d${flipped ? " is-flipped" : ""}`} onClick={flip} aria-label={flipped ? "Turn the license back over" : "Turn the license over for the perks"} aria-pressed={flipped}>
            <div className="bn-card bn-cardFront" aria-hidden={flipped}>
              <div className="bn-cardHead">
                <span className="bn-cardTitle">👻 {n.copy.license}</span>
                <span className="bn-cardHouse">{n.house}</span>
              </div>
              <div className="bn-cardBody">
                <div className="bn-cardPhoto">
                  {n.hero ? <CroppedPhoto photo={n.hero} /> : <span style={{ display: "grid", placeItems: "center", height: "100%" }}><Ghost size={80} /></span>}
                </div>
                <dl className="bn-fields">
                  <dt>Name</dt>
                  <dd className="bn-hand bn-big">{n.recipient}</dd>
                  {n.sender && (
                    <>
                      <dt>{n.copy.licensed}</dt>
                      <dd className="bn-hand">{n.sender}</dd>
                    </>
                  )}
                  <dt>License no.</dt>
                  <dd className="bn-mono">{licenseNo(n)}</dd>
                </dl>
              </div>
              <p className="bn-flipHint">
                <span aria-hidden>↻</span> tap to turn over: the perks
              </p>
              <span className={`bn-stamp${stamped ? " is-on" : ""}`} aria-label="Certified boo">
                <small>certified</small>
                <b>BOO</b>
              </span>
            </div>
            <div className="bn-card bn-cardBack" aria-hidden={!flipped}>
              <div className="bn-cardHead">
                <span className="bn-cardTitle">🍬 Perks</span>
                <span className="bn-cardHouse">{n.copy.license}</span>
              </div>
              <ul className="bn-perks">
                {n.perks.map((p, i) => (
                  <li key={i}>
                    <span aria-hidden>🍬</span> {p}
                  </li>
                ))}
              </ul>
              {n.duo && (
                <p className="bn-duo">
                  <span>Costume</span> {n.duo}
                </p>
              )}
              <p className="bn-valid">valid every October, forever</p>
              <p className="bn-flipHint">
                <span aria-hidden>↻</span> tap to turn back
              </p>
            </div>
          </button>
          <Gif src={GIF.cuddle} size={70} tilt={10} className="bn-cardGif" />
        </motion.div>
      </div>

      <div className="bn-endActions">
        <button type="button" className="bn-pill" onClick={() => setReply(true)}>
          💌 {n.sender ? `Boo ${n.sender} back` : "Boo them back"}
        </button>
        {boo.enabled && (
          <button type="button" className="bn-pill is-scare" onClick={scareThem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GIF.panda} alt="" width={30} height={28} aria-hidden /> Scare your boo
          </button>
        )}
        <button type="button" className="bn-pill is-ghost is-round" onClick={onReplay} aria-label="Replay the night" title="Replay the night">
          ↺
        </button>
        {mode === "live" && (
          <Link href="/happy-halloween-premium" className="bn-pill is-make">
            Make one 👻
          </Link>
        )}
      </div>

      <div className="bn-foot">
        <AnimatePresence>
          {saved && (
            <motion.p className="bn-saved" role="status" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              {saved}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="bn-saveRow">
          <Puffy onClick={() => save("story")} disabled={!!saving}>
            {saving === "story" ? "Printing…" : "Save my license 📲"}
          </Puffy>
          <Puffy tone="cream" small onClick={() => save("feed")} disabled={!!saving} ariaLabel="Save a 4:5 version for a post">
            {saving === "feed" ? "…" : "4:5"}
          </Puffy>
        </div>
      </div>

      <AnimatePresence>
        {reply && (
          <motion.div className="bn-sheetBack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReply(false)}>
            <motion.div
              className="bn-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Write back"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bn-replyHead">
                <Gif src={GIF.heartEyes} size={56} tilt={-8} />
                <span>{n.sender ? `Boo ${n.sender} back 👻` : "Boo them back 👻"}</span>
                <button type="button" className="bn-sheetX" onClick={() => setReply(false)} aria-label="Close">
                  ×
                </button>
              </div>
              <ReplyBox title={n.sender ? `Write back to ${n.sender}` : "Write back"} placeholder="A line, a memory, a yes…" accent={BN.orangeDeep} className="bn-reply" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{LICENSE_CSS}</style>
    </div>
  );
}

const LICENSE_CSS = `
.bn-license { justify-content: flex-start; }
.bn-endH { font-size: clamp(26px, min(8vw, 4.8dvh), 44px); max-width: 16ch; flex: none; }
.bn-cardZone { flex: 1 1 0; min-height: 0; width: 100%; display: grid; grid-template-rows: minmax(0, 1fr); place-items: center; }
.bn-cardIn { position: relative; width: min(100%, 360px); perspective: 1100px; }
.bn-card3d { all: unset; box-sizing: border-box; cursor: pointer; display: grid; width: 100%; transform-style: preserve-3d; transition: transform .6s cubic-bezier(.3,1.3,.5,1); -webkit-tap-highlight-color: transparent; }
.bn-card3d.is-flipped { transform: rotateY(180deg); }
.bn-card3d:focus-visible { outline: 3px solid #fff; outline-offset: 6px; border-radius: 28px; }
.bn-card { grid-area: 1 / 1; position: relative; background: ${BN.cream}; color: ${BN.ink}; border-radius: 26px; text-align: left; -webkit-backface-visibility: hidden; backface-visibility: hidden;
  box-shadow: 0 0 0 5px #fff inset, 0 18px 40px rgba(30,16,60,.45); padding-bottom: 10px; display: flex; flex-direction: column; }
.bn-cardBack { transform: rotateY(180deg); }
.bn-cardHead { display: grid; gap: 2px; padding: 12px 18px 10px; border-radius: 26px 26px 0 0; background: ${BN.lilac}; box-shadow: 0 0 0 5px #fff inset; }
.bn-cardTitle { font: 400 clamp(20px, 3.4dvh, 26px)/1 ${DISPLAY}; letter-spacing: .02em; }
.bn-cardHouse { font: 800 11px/1.2 var(--font-bn-body), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #4A3A80; }
.bn-cardBody { display: grid; grid-template-columns: clamp(84px, 14dvh, 120px) minmax(0, 1fr); gap: 12px; padding: clamp(10px, 1.6dvh, 16px) 16px 2px; }
.bn-cardPhoto { aspect-ratio: 4 / 5; border-radius: 6px; overflow: hidden; background: #fff; border: 5px solid #fff; box-shadow: 0 6px 14px rgba(30,16,60,.25); transform: rotate(-3deg); }
.bn-fields { margin: 0; display: grid; gap: 1px; align-content: start; min-width: 0; }
.bn-fields dt { font: 800 10px/1.2 var(--font-bn-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${BN.lilacDeep}; margin-top: 5px; }
.bn-fields dd { margin: 0; font: 700 14px/1.2 var(--font-bn-body), sans-serif; overflow-wrap: anywhere; }
.bn-fields dd.bn-hand { font: 400 clamp(18px, 2.8dvh, 22px)/1 ${HAND}; }
.bn-fields dd.bn-big { font-size: clamp(24px, 3.8dvh, 30px); color: ${BN.orangeDeep}; }
.bn-mono { letter-spacing: .08em; }
.bn-flipHint { margin: 8px 0 0; text-align: center; font: 800 12px/1 var(--font-bn-body), sans-serif; letter-spacing: .06em; color: ${BN.lilacDeep}; }
.bn-flipHint span { display: inline-block; font-size: 15px; margin-right: 2px; }
.bn-perks { list-style: none; margin: 12px 14px 0; padding: 10px 12px; border-radius: 16px; background: #fff; display: grid; gap: 6px; font: 700 clamp(14px, 2.2dvh, 15px)/1.25 var(--font-bn-body), sans-serif; }
.bn-duo { margin: 10px 18px 0; font: 700 14px/1.25 var(--font-bn-body), sans-serif; }
.bn-duo span { display: block; font: 800 10px/1.2 var(--font-bn-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${BN.lilacDeep}; }
.bn-valid { margin: auto 0 0; padding-top: 10px; text-align: center; font: 400 17px/1 ${HAND}; color: ${BN.inkSoft}; }
.bn-stamp { position: absolute; right: -10px; bottom: -16px; z-index: 2; width: clamp(72px, 11dvh, 88px); aspect-ratio: 1; border-radius: 50%; display: grid; place-content: center; text-align: center;
  border: 5px solid ${BN.orangeDeep}; color: ${BN.orangeDeep}; background: rgba(255,154,60,.14); transform: rotate(-14deg) scale(2.4); opacity: 0; transition: transform .28s cubic-bezier(.5,0,.6,1.6), opacity .2s ease; }
.bn-stamp.is-on { transform: rotate(-14deg) scale(1); opacity: .92; }
.bn-stamp small { font: 800 10px/1 var(--font-bn-body), sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.bn-stamp b { font: 400 clamp(22px, 3.6dvh, 28px)/1 ${DISPLAY}; }
.bn-cardGif { position: absolute; right: -10px; top: -30px; z-index: 3; }
.bn-endActions { flex: none; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 400px; }
.bn-pill { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; min-height: 42px; padding: 0 14px; border-radius: 99px; background: ${BN.card}; color: ${BN.ink};
  font: 800 14px/1 var(--font-bn-body), sans-serif; box-shadow: 0 4px 0 #E6D2B4, 0 8px 18px rgba(30,16,60,.3); text-decoration: none; -webkit-tap-highlight-color: transparent; white-space: nowrap; }
.bn-pill:active { transform: translateY(2px); box-shadow: 0 2px 0 #E6D2B4; }
.bn-pill:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.bn-pill.is-scare { background: #2A1F3D; color: #FFD27A; box-shadow: 0 4px 0 #120B20, 0 0 0 2px rgba(255,210,122,.4) inset, 0 8px 18px rgba(30,16,60,.4); padding-left: 6px; }
.bn-pill.is-scare img { width: 30px; height: auto; }
.bn-pill.is-round { width: 42px; padding: 0; justify-content: center; font-size: 20px; }
.bn-pill.is-ghost { background: rgba(42,31,61,.45); color: #FFF7EC; box-shadow: 0 0 0 2px rgba(255,247,236,.25) inset; }
.bn-pill.is-make { background: ${BN.candle}; box-shadow: 0 4px 0 #D9A640, 0 8px 18px rgba(30,16,60,.3); }
.bn-saveRow { display: flex; align-items: center; gap: 8px; }
.bn-saveRow .bn-puffy { white-space: nowrap; padding: 0 16px; font-size: 16px; }
.bn-saveRow .bn-puffy.is-small { padding: 0 12px; font-size: 14px; }
.bn-saved { position: absolute; bottom: calc(100% + 2px); margin: 0; padding: 6px 12px; border-radius: 99px; background: rgba(42,31,61,.75); font: 700 14px/1.3 var(--font-bn-body), sans-serif; color: #fff; white-space: nowrap; }
.bn-sheetBack { position: fixed; inset: 0; z-index: 110; background: rgba(20,12,36,.6); display: flex; align-items: flex-end; justify-content: center; }
.bn-sheet { width: min(100%, 460px); max-height: 88dvh; overflow: auto; overscroll-behavior: contain; padding: 16px 16px max(18px, env(safe-area-inset-bottom, 0px)); border-radius: 28px 28px 0 0;
  background: linear-gradient(180deg, #4A3A80, #3B2D6E); box-shadow: 0 -10px 40px rgba(0,0,0,.4); display: grid; gap: 10px; }
.bn-replyHead { display: flex; align-items: center; gap: 8px; font: 400 24px/1 ${DISPLAY}; color: #fff; }
.bn-sheetX { all: unset; cursor: pointer; margin-left: auto; width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; font: 400 30px/1 ${BODY}; color: #fff; background: rgba(255,255,255,.12); }
.bn-reply { width: 100%; background: ${BN.card} !important; color: ${BN.ink} !important; border: 0 !important; border-radius: 26px !important; box-shadow: 0 0 0 4px #fff inset, 0 14px 30px rgba(30,16,60,.35) !important; }
.bn-reply textarea { background: #fff !important; color: ${BN.ink} !important; font-family: var(--font-bn-body), sans-serif !important; border-radius: 16px !important; }
@media (prefers-reduced-motion: reduce) { .bn-stamp { transition: opacity .2s ease; } .bn-card3d { transition: none; } }
`;
