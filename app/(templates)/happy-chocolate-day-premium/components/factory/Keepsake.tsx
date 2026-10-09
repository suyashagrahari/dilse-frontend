"use client";

// Station 9 · The gift shop. Her keepsake: a "Box of Us" chocolate box whose six truffles are their photos, his
// coupon ("Valid for one real chocolate date") that she can stamp, save it all as a story-sized PNG, the sealed P.S.,
// "Send a chocolate back" (ReplyBox) and "take the tour again".

import { useEffect, useMemo, useState } from "react";
import { ReplyBox, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import { CroppedPhoto, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { C, GIF, boxPhotos, pick, type Factory } from "./model";
import { Cup, Gif, PopCard, Polaroid, Puffy, StationHead, Washi, reward, useStation } from "./ui";

const year = () => {
  const d = new Date();
  return d.getMonth() < 2 ? d.getFullYear() : d.getFullYear() + 1;
};

function keepsakeLayout(f: Factory): KeepsakeLayout {
  const items: KeepsakeItem[] = [];
  items.push({ type: "text", text: "✦ THE SWEETHEART CHOCOLATE FACTORY ✦", x: 540, y: 130, size: 34, face: "ui", weight: 700, color: C.deep, align: "center" });
  items.push({ type: "text", text: "Box of Us", x: 540, y: 250, size: 120, face: "script", weight: 700, color: C.pinkDeep, align: "center" });
  items.push({ type: "text", text: `for ${f.to}, from ${f.house}`, x: 540, y: 330, size: 38, face: "ui", weight: 600, color: C.ink, align: "center", maxWidth: 940 });
  // The box
  items.push({ type: "rect", x: 80, y: 400, w: 920, h: 780, radius: 60, fill: "#FF8FAB" });
  items.push({ type: "rect", x: 112, y: 432, w: 856, h: 716, radius: 44, fill: "#FFF1F5" });
  items.push({ type: "rect", x: 300, y: 380, w: 480, h: 74, radius: 37, fill: "#FFFFFF", stroke: "#FF8FAB", lineWidth: 6 });
  items.push({ type: "text", text: f.boxLine, x: 540, y: 428, size: 30, face: "ui", weight: 700, color: C.pinkDeep, align: "center", maxWidth: 440, maxLines: 1 });
  const ps = boxPhotos(f.photos);
  ps.forEach((ph, i) => {
    const cx = 250 + (i % 3) * 290;
    const cy = 650 + Math.floor(i / 3) * 310;
    items.push({ type: "rect", x: cx - 128, y: cy - 128, w: 256, h: 256, radius: 128, fill: "#FF9EBB" });
    items.push({ type: "rect", x: cx - 112, y: cy - 112, w: 224, h: 224, radius: 112, fill: "#FFFFFF" });
    if (ph) items.push({ type: "image", src: ph.url, x: cx - 100, y: cy - 100, w: 200, h: 200, radius: 100, cropX: ph.cropX, cropY: ph.cropY });
    else items.push({ type: "emoji", char: "🍫", x: cx, y: cy, size: 110 });
  });
  // The coupon
  items.push({ type: "rect", x: 140, y: 1250, w: 800, h: 240, radius: 28, fill: "#FFFFFF", stroke: C.primary, lineWidth: 5 });
  items.push({ type: "text", text: "COUPON 🍫", x: 540, y: 1318, size: 40, face: "ui", weight: 800, color: C.primary, align: "center" });
  items.push({ type: "text", text: f.coupon, x: 540, y: 1392, size: 40, face: "ui", weight: 700, color: C.ink, align: "center", maxWidth: 720, maxLines: 2, lineHeight: 1.2 });
  let y = 1590;
  if (f.endLine) {
    items.push({ type: "text", text: f.endLine, x: 540, y, size: 62, face: "script", weight: 700, color: C.pinkDeep, align: "center", maxWidth: 940, maxLines: 2, lineHeight: 1.2 });
    y += 150;
  }
  items.push({ type: "text", text: `${f.since ? `est. ${f.since} · ` : ""}Happy Chocolate Day · 09.02.${year()}`, x: 540, y: Math.max(y, 1820), size: 30, face: "ui", weight: 600, color: C.ink, align: "center", maxWidth: 960 });
  return { width: 1080, height: 1920, background: { stops: [[0, "#FFF8F0"], [0.5, "#FFE3EC"], [1, "#F6E2CF"]] }, items };
}

export default function Keepsake({ onComplete, onReplay }: { onComplete: () => void; onReplay: () => void }) {
  const { f, sfx } = useStation();
  const { premium } = usePremium();
  const [ps, setPs] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done">("idle");
  const photos = useMemo(() => boxPhotos(f.photos), [f.photos]);

  useEffect(() => {
    onComplete();
    // Only once, when she reaches the gift shop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (saving === "busy") return;
    setSaving("busy");
    sfx("snap", { gain: 0.6 });
    const r = await saveOrSharePoster(keepsakeLayout(f), `box-of-us-${f.to}`, `My Box of Us 🍫💗`);
    setSaving(r === "failed" ? "idle" : "done");
    if (r !== "failed") reward(sfx, document.querySelector(".sf-keepBox"), { cue: "chime" });
  };
  const stamp = () => {
    if (stamped) return;
    setStamped(true);
    sfx("knock", { gain: 0.6 });
    reward(sfx, document.querySelector(".sf-coupon"), { small: true, cue: "glass-ping" });
  };

  return (
    <section className="sf-scene sf-exit" aria-label="Your keepsake">
      <StationHead kicker="Station 9 · The gift shop" title="Your Box of Us" hint="Every truffle in it is us. Keep it forever." />
      <div className="sf-keep">
        <Gif src={GIF.dayText} size={120} tilt={-6} className="sf-keepText" />
        <div className="sf-keepBox">
          <span className="sf-keepLid">
            <small>{f.house}</small>
            <b>Box of Us</b>
            <em>for {f.to}</em>
          </span>
          <div className="sf-boxGrid">
            {photos.map((ph, i) => (
              <div key={i} className="sf-slot">
                <Cup size={84} />
                <span className="sf-photoTruffle">{ph ? <CroppedPhoto photo={ph} alt="" /> : <b>💗</b>}</span>
              </div>
            ))}
          </div>
          {f.since && <span className="sf-est">est. {f.since}</span>}
        </div>
        <Gif src={GIF.heartBox} size={78} tilt={8} float className="sf-keepGif" />
      </div>

      <button type="button" className={`sf-coupon${stamped ? " is-stamped" : ""}`} onClick={stamp} aria-label={stamped ? "Coupon saved" : "Stamp your coupon"}>
        <span className="sf-couponKick">COUPON 🍫</span>
        <b>{f.coupon}</b>
        <small>{stamped ? "saved for later ✓" : "tap to claim · no expiry"}</small>
        {stamped && <i className="sf-stamp">CLAIMED 💗</i>}
      </button>

      {f.endLine && <p className="sf-endLine">{f.endLine}</p>}

      <div className="sf-actions">
        <Puffy onClick={save}>{saving === "busy" ? "Packing…" : saving === "done" ? "Saved ✓ Save again" : "Save my box 🍫"}</Puffy>
        {premium.psLetter.trim() && (
          <Puffy tone="butter" onClick={() => (setPs(true), sfx("wax-crack", { gain: 0.6 }))}>
            Open the P.S. 💌
          </Puffy>
        )}
      </div>

      <ReplyBox title="Send a chocolate back 🍫" placeholder={`Say it back to ${f.from}: a line, a memory, a yes…`} accent={C.pinkDeep} className="sf-reply" onSent={() => reward(sfx, document.querySelector(".sf-reply"), { big: true })} />

      <button type="button" className="sf-link sf-again" onClick={onReplay}>
        Take the tour again ↺
      </button>

      <PopCard open={ps} onClose={() => setPs(false)} label="The sealed P.S.">
        <div className="sf-ps">
          <Washi rot={-6} style={{ left: 30, top: -10 }} />
          <span className="sf-prizeKick">P.S. ✦</span>
          {premium.psLetter.split(/\n\s*\n/).map((para, i) => (
            <p key={i} className={i === 0 ? "sf-psCond" : undefined}>
              {para}
            </p>
          ))}
          <p className="sf-sign">— {f.from}</p>
          <Polaroid photo={pick(f.photos, 5) ?? pick(f.photos, 1)} caption="" width={120} tilt={5} className="sf-psPic" />
        </div>
      </PopCard>
    </section>
  );
}
