"use client";

// The keepsake: an Adoption Certificate from The Teddy House. A cream card with a scalloped pink border, her
// teddy exactly as she dressed and named him (the same SVG, serialised into the poster), her photo, the official
// fields (adopted by, given with love by, date, place of birth, temperament) and a pink paw-print ADOPTED stamp that
// thumps down. Saved as a 9:16 story card (or a 4:5 post). Then "Send him a hug back" (the ReplyBox), replay, and
// "make one" for the recipient.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { ReplyBox, saveOrSharePoster, sfx } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { Paw, Teddy } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Gif, POP, Puffy, TextLink } from "./ui";

const today = () => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function svgUrl(el: SVGSVGElement | null): string | null {
  if (!el) return null;
  try {
    const xml = new XMLSerializer().serializeToString(el).replace(/ class="[^"]*"/g, "");
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  } catch {
    return null;
  }
}

function posterLayout(h: House, name: string, endLine: string, teddy: string | null, format: "story" | "feed"): KeepsakeLayout {
  const W = 1080;
  const story = format === "story";
  const H = story ? 1920 : 1350;
  const items: KeepsakeItem[] = [];
  for (let i = 0; i < (story ? 14 : 8); i++) items.push({ type: "emoji", char: ["💗", "✨", "🧸"][i % 3], x: ((i * 211 + 70) % 980) + 50, y: ((i * 137) % (story ? 220 : 90)) + 50, size: 28 + (i % 3) * 8 });
  let y = story ? 250 : 110;
  if (story && endLine) {
    items.push({ type: "text", text: endLine, x: W / 2, y, size: 62, face: "ui", weight: 700, color: TH.ink, maxWidth: 940, maxLines: 2 });
    y += 150;
  }
  const cx = 80;
  const cw = W - 160;
  const cy = y;
  const ch = story ? 1240 : 1120;
  items.push({ type: "rect", x: cx + 8, y: cy + 18, w: cw, h: ch, radius: 60, fill: "rgba(201,138,75,0.25)" });
  items.push({ type: "rect", x: cx, y: cy, w: cw, h: ch, radius: 60, fill: "#FFB3C8" });
  items.push({ type: "rect", x: cx + 22, y: cy + 22, w: cw - 44, h: ch - 44, radius: 44, fill: TH.card, stroke: "#FFFFFF", lineWidth: 8 });
  items.push({ type: "text", text: "THE TEDDY HOUSE · OFFICIAL", x: W / 2, y: cy + 92, size: 28, face: "ui", weight: 700, color: TH.pinkDeep });
  items.push({ type: "text", text: "Certificate of Adoption", x: W / 2, y: cy + 168, size: 66, face: "ui", weight: 700, color: TH.ink, maxWidth: cw - 100, maxLines: 1 });
  // the teddy + her photo
  const ty = cy + 220;
  if (teddy) items.push({ type: "image", src: teddy, x: cx + 70, y: ty, w: 360, h: 432 });
  if (h.hero) items.push({ type: "image", src: h.hero.url, x: cx + cw - 70 - 340, y: ty + 10, w: 340, h: 425, cropX: h.hero.cropX, cropY: h.hero.cropY, rotate: 4, frame: { pad: 16, bottom: 60, color: "#FFFFFF" } });
  else items.push({ type: "image", src: GIF.yes, x: cx + cw - 70 - 320, y: ty + 40, w: 320, h: 320 });
  items.push({ type: "text", text: name, x: cx + 250, y: ty + 470, size: 60, face: "script", weight: 700, color: TH.pinkDeep, maxWidth: 380, maxLines: 1 });
  // fields
  let fy = ty + 560;
  const field = (label: string, value: string) => {
    if (!value) return;
    const w = cw - 470;
    const lines = value.length * 36 * 0.5 > w ? 2 : 1;
    items.push({ type: "text", text: label, x: cx + 90, y: fy, size: 26, face: "ui", weight: 700, color: TH.honeyDeep, align: "left", maxWidth: 300 });
    items.push({ type: "text", text: value, x: cx + 380, y: fy, size: 36, face: "ui", weight: 600, color: TH.ink, align: "left", maxWidth: w, maxLines: 2, lineHeight: 1.15 });
    fy += (story ? 74 : 64) + (lines - 1) * 42;
  };
  field("ADOPTED BY", h.recipient);
  field("WITH LOVE FROM", h.sender);
  field("DATE", today());
  field("BORN IN", h.birthPlace);
  field("TEMPERAMENT", h.temperament);
  // stamp: thumped over the photo's lower corner
  const sx = cx + cw - 260;
  const sy = ty + 280;
  items.push({ type: "rect", x: sx, y: sy, w: 200, h: 200, radius: 100, fill: "rgba(255,217,228,0.92)", stroke: TH.pinkDeep, lineWidth: 8 });
  items.push({ type: "text", text: "🐾", x: sx + 100, y: sy + 84, size: 50, face: "ui", weight: 700, color: TH.pinkDeep });
  items.push({ type: "text", text: "ADOPTED", x: sx + 100, y: sy + 144, size: 36, face: "ui", weight: 700, color: TH.pinkDeep });
  items.push({ type: "text", text: "a forever home, signed with a hug", x: W / 2, y: cy + ch - 60, size: 28, face: "ui", weight: 600, color: TH.inkSoft });
  items.push({ type: "image", src: GIF.yes, x: cx - 20, y: cy - 110, w: 200, h: 200 });
  if (h.sender) items.push({ type: "text", text: `hand-made by ${h.sender} for ${h.recipient}`, x: W / 2, y: cy + ch + 100, size: 44, face: "script", weight: 700, color: TH.ink, maxWidth: 940, maxLines: 1 });
  items.push({ type: "text", text: "Teddy Day · 10 February  ✦  subhsandesh.in", x: W / 2, y: H - (story ? 110 : 44), size: 28, face: "ui", weight: 600, color: TH.inkSoft });
  return { width: W, height: H, background: { stops: [[0, "#FFF6E5"], [0.55, "#FFEFE6"], [1, "#FFD9E4"]] }, items };
}

export default function Certificate({ h, name, worn, endLine, mode, onReplay }: { h: House; name: string; worn: TeddyItem[]; endLine: string; mode: "preview" | "live"; onReplay: () => void }) {
  const [saving, setSaving] = useState<"" | "story" | "feed">("");
  const [saved, setSaved] = useState("");
  const [stamped, setStamped] = useState(false);
  const teddyRef = useRef<SVGSVGElement>(null);
  const line = endLine.trim() || `${name} is yours now. So am I. 🧸`;
  const [date] = useState(today);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStamped(true);
      sfx("th-stamp", { gain: 0.8 });
      sfx("plush-squeak", { gain: 0.4, at: 0.15 });
      haptic([30, 20]);
    }, 1000);
    return () => window.clearTimeout(t);
  }, []);

  const save = async (format: "story" | "feed") => {
    if (saving) return;
    setSaving(format);
    haptic(10);
    sfx("paper-rustle", { gain: 0.5 });
    const r = await saveOrSharePoster(posterLayout(h, name, line, svgUrl(teddyRef.current), format), `adoption-certificate-${name}-${format}`, `${name}'s adoption certificate 🧸`);
    setSaving("");
    setSaved(r === "failed" ? "Couldn't save here. A screenshot works too." : r === "shared" ? "Shared 🧸" : "Saved to your phone 🧸");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };

  return (
    <div className="th-scene th-cert">
      <p className="th-room">Officially yours 🐾</p>
      <motion.h2 className="th-title th-endH" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={POP}>
        {line}
      </motion.h2>

      <div className="th-endGrid">
        <div className="th-endKeep">
          <motion.div className="th-certCard" initial={{ y: 40, rotate: 4, opacity: 0 }} animate={{ y: 0, rotate: -1, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.2 }}>
            <div className="th-certIn">
              <p className="th-certKick">The Teddy House · official</p>
              <p className="th-certTitle">Certificate of Adoption</p>
              <div className="th-certArt">
                <span className="th-certTeddy">
                  <Teddy ref={teddyRef} size={128} mood="happy" pose="down" worn={worn} heart />
                  <span className="th-certName">{name}</span>
                </span>
                <span className="th-certPhoto">{h.hero ? <CroppedPhoto photo={h.hero} /> : <Gif src={GIF.yes} size={100} float={false} />}</span>
              </div>
              <dl className="th-certFields">
                <dt>Adopted by</dt>
                <dd className="th-hand th-big">{h.recipient}</dd>
                {h.sender && (
                  <>
                    <dt>With love from</dt>
                    <dd className="th-hand">{h.sender}</dd>
                  </>
                )}
                <dt>Date</dt>
                <dd>{date}</dd>
                <dt>Born in</dt>
                <dd>{h.birthPlace}</dd>
                <dt>Temperament</dt>
                <dd>{h.temperament}</dd>
              </dl>
              <p className="th-valid">a forever home, signed with a hug</p>
            </div>
            <span className={`th-stamp${stamped ? " is-on" : ""}`} aria-label="Adopted">
              <Paw size={30} />
              <b>ADOPTED</b>
            </span>
            <Gif src={GIF.yes} size={84} tilt={-10} className="th-certGif" />
          </motion.div>

          <div className="th-saveRow">
            <Puffy onClick={() => save("story")} disabled={!!saving}>
              {saving === "story" ? "Printing…" : "Save the certificate 📲"}
            </Puffy>
            <TextLink onClick={() => save("feed")}>{saving === "feed" ? "Printing…" : "or a square-ish one for a post"}</TextLink>
            {saved && (
              <p className="th-saved" role="status">
                {saved}
              </p>
            )}
          </div>
        </div>

        <div className="th-endWrite">
          <div className="th-replyHead">
            <Gif src={GIF.cheekHug} size={64} tilt={-8} />
            <span>{h.sender ? `Send ${h.sender} a hug back` : "Send a hug back"}</span>
          </div>
          <ReplyBox title={h.sender ? `Write back to ${h.sender}` : "Write back"} placeholder={`A hug, a thank-you, what you named him…`} accent={TH.pinkDeep} className="th-reply" />
          <div className="th-endRow">
            <TextLink onClick={onReplay}>↺ Visit the house again</TextLink>
            {mode === "live" && (
              <Link href="/happy-teddy-day-premium" className="th-make">
                Make one for someone 🧸
              </Link>
            )}
          </div>
        </div>
      </div>
      <style>{CERT_CSS}</style>
    </div>
  );
}

const CERT_CSS = `
.th-cert { justify-content: flex-start; }
.th-endH { font-size: clamp(26px, 7.6vw, 40px); max-width: 16ch; }
.th-endGrid { display: grid; justify-items: center; gap: 22px; width: 100%; max-width: 1040px; margin-top: 4px; }
.th-endKeep, .th-endWrite { display: grid; justify-items: center; gap: 14px; width: 100%; }
.th-certCard { position: relative; width: min(100%, 380px); padding: 12px; border-radius: 34px; background: #FFB3C8;
  background-image: radial-gradient(circle at 10px 10px, #fff 3px, transparent 3.5px); background-size: 22px 22px; box-shadow: 0 18px 38px rgba(224,96,126,.3); }
.th-certIn { position: relative; border-radius: 24px; background: ${TH.card}; padding: 16px 16px 14px; box-shadow: 0 0 0 4px #fff inset; text-align: left; }
.th-certKick { margin: 0; text-align: center; font: 800 11px/1 var(--font-th-body), sans-serif; letter-spacing: .16em; text-transform: uppercase; color: ${TH.pinkDeep}; }
.th-certTitle { margin: 4px 0 8px; text-align: center; font: 800 25px/1.05 ${DISPLAY}; color: ${TH.ink}; }
.th-certArt { display: grid; grid-template-columns: 1fr 1fr; align-items: end; gap: 8px; }
.th-certTeddy { position: relative; display: grid; justify-items: center; }
.th-certName { margin-top: -6px; padding: 3px 12px; border-radius: 10px; background: ${TH.pinkSoft}; font: 400 22px/1 ${HAND}; color: ${TH.pinkDeep}; outline: 2px dashed ${TH.pink}; outline-offset: -5px; }
.th-certPhoto { display: block; aspect-ratio: 4 / 5; overflow: hidden; border: 7px solid #fff; border-bottom-width: 22px; border-radius: 4px; box-shadow: 0 8px 16px rgba(120,70,30,.22); transform: rotate(4deg); background: ${TH.pinkSoft}; }
.th-certFields { margin: 10px 0 0; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 3px 12px; align-items: baseline; }
.th-certFields dt { font: 800 10.5px/1.2 var(--font-th-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${TH.honeyDeep}; }
.th-certFields dd { margin: 0; font: 700 14.5px/1.25 var(--font-th-body), sans-serif; color: ${TH.ink}; overflow-wrap: anywhere; }
.th-certFields dd.th-hand { font: 400 21px/1 ${HAND}; }
.th-certFields dd.th-big { font-size: 26px; color: ${TH.pinkDeep}; }
.th-valid { margin: 10px 0 0; text-align: center; font: 400 17px/1 ${HAND}; color: ${TH.inkSoft}; }
.th-stamp { position: absolute; right: 6px; top: 196px; width: 92px; height: 92px; border-radius: 50%; display: grid; place-content: center; justify-items: center; gap: 2px;
  border: 5px solid ${TH.pinkDeep}; color: ${TH.pinkDeep}; background: rgba(255,217,228,.85); transform: rotate(-14deg) scale(2.4); opacity: 0; transition: transform .28s cubic-bezier(.5,0,.6,1.6), opacity .2s ease; }
.th-stamp.is-on { transform: rotate(-14deg) scale(1); opacity: .95; }
.th-stamp b { font: 800 13px/1 ${DISPLAY}; letter-spacing: .06em; }
.th-certGif { position: absolute; left: -18px; top: -38px; }
.th-saveRow { display: grid; justify-items: center; gap: 2px; }
.th-saved { margin: 0; font: 800 15px/1.3 var(--font-th-body), sans-serif; color: ${TH.pinkDeep}; }
.th-replyHead { display: flex; align-items: center; gap: 8px; font: 800 24px/1 ${DISPLAY}; color: ${TH.ink}; }
.th-reply { width: 100%; max-width: 420px; background: ${TH.card} !important; color: ${TH.ink} !important; border: 0 !important; border-radius: 26px !important; box-shadow: 0 0 0 4px #fff inset, 0 0 0 6px #F5DCC2, 0 14px 28px rgba(201,138,75,.2) !important; }
.th-reply textarea { background: #fff !important; color: ${TH.ink} !important; font-family: var(--font-th-body), sans-serif !important; border-radius: 16px !important; }
.th-endRow { display: flex; flex-wrap: wrap; gap: 8px 16px; justify-content: center; align-items: center; }
.th-make { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 99px; text-decoration: none; color: ${TH.ink}; background: ${TH.honey};
  font: 800 15px/1 var(--font-th-body), sans-serif; box-shadow: 0 4px 0 ${TH.honeyDeep}; }
.th-make:focus-visible { outline: 3px solid ${TH.pinkDeep}; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .th-stamp { transition: opacity .2s ease; } }
`;
