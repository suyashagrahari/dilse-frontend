"use client";

// The ending: "{endLine}" over the keepsake, which is the lid itself as a card they can tilt (gyro/pointer, foil
// sheen): a round window with their photo, the foil monogram, the house name, "Est. …". "Keep the box" saves/shares
// a 1080×1920 poster of the box of photo bonbons. Below: the sealed P.S. under a gold foil seal (wax-crack, the seal
// splits), the reply box, and the shell's ending actions (replay, WhatsApp). react("completed") fires in the root.

import { useState, type ReactNode } from "react";
import { CroppedPhoto, EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { PremiumCTA, ReplyBox, RevealText, TiltCard, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { LidFace } from "./Box";
import type { Boite } from "./util";

const END = "Every piece of it was you.";

export function boiteKeepsake(b: Boite, data: ValentineDayData, day: DayConfig): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const gold = "#E3C27E";
  const items: KeepsakeItem[] = [];
  const cx = W / 2;
  items.push({ type: "text", text: b.house.toUpperCase(), x: cx, y: 200, size: 30, weight: 500, color: gold, face: "ui", maxWidth: 920, maxLines: 1 });
  items.push({ type: "text", text: `Chocolate Day · ${day.date} ${day.month}`, x: cx, y: 262, size: 36, italic: true, face: "serif", color: "rgba(243,230,211,.75)" });
  // The box: a cacao tray with a foil hairline, nine cups, each piece one of their photos.
  items.push({ type: "rect", x: 120, y: 380, w: 840, h: 840, radius: 18, fill: "#1A0D09" });
  items.push({ type: "rect", x: 136, y: 396, w: 808, h: 808, radius: 10, stroke: "rgba(227,194,126,.55)", lineWidth: 2 });
  const R = 118;
  for (let k = 0; k < 9; k++) {
    const x = 270 + (k % 3) * 270;
    const y = 530 + Math.floor(k / 3) * 270;
    const piece = b.pieces[k];
    items.push({ type: "rect", x: x - R - 10, y: y - R - 10, w: (R + 10) * 2, h: (R + 10) * 2, radius: R + 10, fill: "#0C0604" });
    items.push({ type: "rect", x: x - R, y: y - R, w: R * 2, h: R * 2, radius: R, fill: "#3A2018" });
    if (piece?.photo) {
      const r = R - 16;
      items.push({ type: "image", src: piece.photo.url, x: x - r, y: y - r, w: r * 2, h: r * 2, radius: r, cropX: piece.photo.cropX, cropY: piece.photo.cropY });
    }
    items.push({ type: "rect", x: x - R, y: y - R, w: R * 2, h: R * 2, radius: R, stroke: k === 4 ? gold : "rgba(227,194,126,.45)", lineWidth: k === 4 ? 4 : 2 });
  }
  items.push({ type: "text", text: `${b.to} & ${b.from}`, x: cx, y: 1380, size: 86, italic: true, face: "serif", color: "#FBF4EA", maxWidth: 960, maxLines: 1 });
  if (b.since) items.push({ type: "text", text: `EST. ${b.since.toUpperCase()}`, x: cx, y: 1480, size: 28, weight: 500, face: "ui", color: gold, maxWidth: 900, maxLines: 1 });
  const end = (data.endLine || END).trim();
  items.push({ type: "text", text: end, x: cx, y: 1580, size: 46, italic: true, face: "serif", color: "rgba(243,230,211,.9)", maxWidth: 900, maxLines: 2, lineHeight: 1.2 });
  items.push({ type: "text", text: "made on subhsandesh.in ✦", x: cx, y: 1830, size: 26, color: "rgba(243,230,211,.55)", face: "ui" });
  return { width: W, height: H, background: { stops: [[0, "#2A1712"], [0.5, "#1A0D09"], [1, "#0C0604"]] }, items };
}

export function EndingScene({
  b,
  data,
  day,
  mode,
  sticker,
  onReplay,
}: {
  b: Boite;
  data: ValentineDayData;
  day: DayConfig;
  mode: "preview" | "live";
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const { sfx, premium } = usePremium();
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const end = (data.endLine || END).trim();
  const cover = b.photos[0];

  const save = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(boiteKeepsake(b, data, day), `${day.slug}-${data.recipientName || "box"}`, "A box of us 🍫");
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };
  const nl = premium.psLetter.indexOf("\n");
  const psFirst = premium.psLetter.split("\n")[0].trim();
  const psRest = (nl >= 0 ? premium.psLetter.slice(nl) : "").trim();

  return (
    <section className="lb-scene lb-ending" aria-label="The keepsake">
      <header className="lb-head">
        <p className="lb-eyebrow">Chocolate Day · {day.date} {day.month}</p>
        <RevealText as="h2" text={end} className="lb-display lb-displayEnd" delay={0.3} />
      </header>

      <div className="lb-cardWrap">
        <TiltCard radius={6} glare={0.32} max={10} style={{ width: "min(300px, 72vw)" }}>
          <div className="lb-keep">
            <LidFace b={b}>
              <span className="lb-window">{cover ? <CroppedPhoto photo={cover} alt="" /> : <i className="lb-windowPlain" />}</span>
            </LidFace>
          </div>
        </TiltCard>
        <span className="lb-cardSticker">{sticker}</span>
      </div>

      <div className="lb-endActions">
        <PremiumCTA tone="gold" cue="tick" onClick={save} disabled={saving === "busy"}>
          {saving === "busy" ? "Wrapping it…" : saving === "done" ? "Kept ✦" : saving === "failed" ? "Try again" : "Keep the box"}
        </PremiumCTA>
      </div>

      <div className="lb-endMore">
        {premium.psLetter && (
          <div className={`lb-ps${ps ? " is-open" : ""}`}>
            <button
              type="button"
              className="lb-seal"
              aria-expanded={ps}
              aria-label={ps ? "The P.S. is open" : `Break the seal: ${psFirst}`}
              onClick={() => {
                if (ps) return;
                setPs(true);
                sfx("wax-crack", { gain: 0.8 });
                haptic([12, 30, 8]);
              }}
            >
              <i className="lb-sealL" aria-hidden />
              <i className="lb-sealR" aria-hidden />
              <b aria-hidden>P.S.</b>
            </button>
            <p className="lb-psFirst">{psFirst}</p>
            {ps && psRest && <p className="lb-psRest">{psRest}</p>}
          </div>
        )}
        <ReplyBox title={`Write back to ${b.from}`} placeholder="A line back, a favourite piece, a memory…" accent="#B0324B" className="lb-reply" />
        <div className="lb-endKit">
          <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => boiteKeepsake(b, data, day)} replyLabel="🍫 Send one back on WhatsApp" />
        </div>
        <p className="lb-credit">made with SubhSandesh ✦</p>
      </div>
    </section>
  );
}
