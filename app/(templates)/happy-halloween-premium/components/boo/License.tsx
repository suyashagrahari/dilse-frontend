"use client";

// The keepsake: the Boo License (from the $2 house, upgraded). A cream ID card
// with her photo, "Certified boo of {sender}", their costume, the perks, a
// license number and an orange CERTIFIED BOO stamp that thumps down. Saved as
// a 9:16 story card (or a 4:5 post) she can post. Then "Boo him back" (the
// ReplyBox), replay, and "make one" for the recipient.

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { ReplyBox, saveOrSharePoster, sfx } from "../../../_valentine/kit/premium";
import { Ghost } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, POP, Puffy, TextLink } from "./ui";

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
  const [saving, setSaving] = useState<"" | "story" | "feed">("");
  const [saved, setSaved] = useState("");
  const [stamped, setStamped] = useState(false);
  const line = endLine.trim() || "Happy Halloween, my boo. 👻";

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStamped(true);
      sfx("bn-stamp", { gain: 0.8 });
      haptic([30, 20]);
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

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

  return (
    <div className="bn-scene bn-license">
      <p className="bn-kicker">Official business 🎃</p>
      <motion.h2 className="bn-title bn-endH" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={POP}>
        {line}
      </motion.h2>

      <div className="bn-endGrid">
        <div className="bn-endKeep">
          <motion.div className="bn-card" initial={{ y: 40, rotate: 4, opacity: 0 }} animate={{ y: 0, rotate: -1.5, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}>
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
                {n.duo && (
                  <>
                    <dt>Costume</dt>
                    <dd>{n.duo}</dd>
                  </>
                )}
                <dt>License no.</dt>
                <dd className="bn-mono">{licenseNo(n)}</dd>
              </dl>
            </div>
            <ul className="bn-perks">
              {n.perks.map((p, i) => (
                <li key={i}>
                  <span aria-hidden>🍬</span> {p}
                </li>
              ))}
            </ul>
            <p className="bn-valid">valid every October, forever</p>
            <span className={`bn-stamp${stamped ? " is-on" : ""}`} aria-label="Certified boo">
              <small>certified</small>
              <b>BOO</b>
            </span>
            <Gif src={GIF.bride} size={76} tilt={10} className="bn-cardGif" />
          </motion.div>

          <div className="bn-saveRow">
            <Puffy onClick={() => save("story")} disabled={!!saving}>
              {saving === "story" ? "Printing…" : "Save my license 📲"}
            </Puffy>
            <TextLink onClick={() => save("feed")}>{saving === "feed" ? "Printing…" : "or a square-ish one for a post"}</TextLink>
            {saved && (
              <p className="bn-saved" role="status">
                {saved}
              </p>
            )}
          </div>
        </div>

        <div className="bn-endWrite">
          <div className="bn-replyHead">
            <Gif src={GIF.heartEyes} size={64} tilt={-8} />
            <span>{n.sender ? `Boo ${n.sender} back 👻` : "Boo them back 👻"}</span>
          </div>
          <ReplyBox title={n.sender ? `Write back to ${n.sender}` : "Write back"} placeholder="A line, a memory, a yes…" accent={BN.orangeDeep} className="bn-reply" />
          <div className="bn-endRow">
            <TextLink onClick={onReplay}>↺ Replay the night</TextLink>
            {mode === "live" && (
              <Link href="/happy-halloween-premium" className="bn-make">
                Make one for someone 👻
              </Link>
            )}
          </div>
        </div>
      </div>
      <style>{LICENSE_CSS}</style>
    </div>
  );
}

const LICENSE_CSS = `
.bn-license { justify-content: flex-start; }
.bn-endH { font-size: clamp(28px, 8vw, 44px); max-width: 16ch; }
.bn-endGrid { display: grid; justify-items: center; gap: 22px; width: 100%; max-width: 1040px; margin-top: 6px; }
.bn-endKeep, .bn-endWrite { display: grid; justify-items: center; gap: 14px; width: 100%; }
.bn-card { position: relative; width: min(100%, 380px); background: ${BN.cream}; color: ${BN.ink}; border-radius: 28px; overflow: visible; text-align: left;
  box-shadow: 0 0 0 5px #fff inset, 0 18px 40px rgba(30,16,60,.45); padding-bottom: 14px; }
.bn-cardHead { display: grid; gap: 2px; padding: 14px 20px 12px; border-radius: 28px 28px 0 0; background: ${BN.lilac}; box-shadow: 0 0 0 5px #fff inset; }
.bn-cardTitle { font: 400 26px/1 ${DISPLAY}; letter-spacing: .02em; }
.bn-cardHouse { font: 800 12px/1.2 var(--font-bn-body), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #4A3A80; }
.bn-cardBody { display: grid; grid-template-columns: 118px minmax(0, 1fr); gap: 14px; padding: 16px 18px 4px; }
.bn-cardPhoto { aspect-ratio: 4 / 5; border-radius: 6px; overflow: hidden; background: #fff; border: 6px solid #fff; box-shadow: 0 6px 14px rgba(30,16,60,.25); transform: rotate(-3deg); }
.bn-fields { margin: 0; display: grid; gap: 1px; align-content: start; min-width: 0; }
.bn-fields dt { font: 800 10.5px/1.2 var(--font-bn-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${BN.lilacDeep}; margin-top: 6px; }
.bn-fields dd { margin: 0; font: 700 15px/1.2 var(--font-bn-body), sans-serif; overflow-wrap: anywhere; }
.bn-fields dd.bn-hand { font: 400 22px/1 ${HAND}; }
.bn-fields dd.bn-big { font-size: 30px; color: ${BN.orangeDeep}; }
.bn-mono { letter-spacing: .08em; }
.bn-perks { list-style: none; margin: 10px 18px 0; padding: 10px 12px; border-radius: 16px; background: #fff; display: grid; gap: 6px; font: 700 15px/1.25 var(--font-bn-body), sans-serif; }
.bn-valid { margin: 10px 0 0; text-align: center; font: 400 17px/1 ${HAND}; color: ${BN.inkSoft}; }
.bn-stamp { position: absolute; right: 12px; bottom: 30px; width: 96px; height: 96px; border-radius: 50%; display: grid; place-content: center; text-align: center;
  border: 5px solid ${BN.orangeDeep}; color: ${BN.orangeDeep}; background: rgba(255,154,60,.14); transform: rotate(-14deg) scale(2.4); opacity: 0; transition: transform .28s cubic-bezier(.5,0,.6,1.6), opacity .2s ease; }
.bn-stamp.is-on { transform: rotate(-14deg) scale(1); opacity: .92; }
.bn-stamp small { font: 800 11px/1 var(--font-bn-body), sans-serif; letter-spacing: .14em; text-transform: uppercase; }
.bn-stamp b { font: 400 30px/1 ${DISPLAY}; }
.bn-cardGif { position: absolute; right: -14px; top: -34px; }
.bn-saveRow { display: grid; justify-items: center; gap: 2px; }
.bn-saved { margin: 0; font: 700 15px/1.3 var(--font-bn-body), sans-serif; color: #fff; }
.bn-replyHead { display: flex; align-items: center; gap: 8px; font: 400 26px/1 ${DISPLAY}; color: #fff; }
.bn-reply { width: 100%; max-width: 420px; background: ${BN.card} !important; color: ${BN.ink} !important; border: 0 !important; border-radius: 26px !important; box-shadow: 0 0 0 4px #fff inset, 0 14px 30px rgba(30,16,60,.35) !important; }
.bn-reply textarea { background: #fff !important; color: ${BN.ink} !important; font-family: var(--font-bn-body), sans-serif !important; border-radius: 16px !important; }
.bn-endRow { display: flex; flex-wrap: wrap; gap: 8px 16px; justify-content: center; align-items: center; }
.bn-make { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 99px; text-decoration: none; color: ${BN.ink}; background: ${BN.candle};
  font: 800 15px/1 var(--font-bn-body), sans-serif; box-shadow: 0 4px 0 #D9A640; }
.bn-make:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .bn-stamp { transition: opacity .2s ease; } }
`;
