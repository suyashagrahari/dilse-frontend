"use client";

// The ending: "{endLine}" over the signed, sealed, stamped certificate as a card they can tilt (gyro/pointer).
// "Save the certificate" saves/shares a 1080×1920 poster of it (their signature, the bear, a photo of them).
// Below: the sealed P.S. behind a wax seal (sfx wax-crack; the seal splits), the reply box, the shell's ending
// actions (replay, WhatsApp). react("completed") fires in the root when this scene arrives.

import { useState, type ReactNode } from "react";
import { EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { Fluent3D, PremiumCTA, ReplyBox, RevealText, TiltCard, fluentUrl, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Certificate } from "./Certificate";
import { C, type Papers } from "./util";

export type Ink = { png: string; aspect: number } | null;

export function papersKeepsake(p: Papers, data: ValentineDayData, day: DayConfig, ink: Ink): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const cx = W / 2;
  const items: KeepsakeItem[] = [];
  const cocoa = C.cocoa;
  const honey = "#A9733A";
  // the paper sheet + a double rule
  items.push({ type: "rect", x: 56, y: 56, w: W - 112, h: H - 200, radius: 6, fill: "#F5EEE2" });
  items.push({ type: "rect", x: 84, y: 84, w: W - 168, h: H - 256, radius: 2, stroke: honey, lineWidth: 3 });
  items.push({ type: "rect", x: 98, y: 98, w: W - 196, h: H - 284, radius: 2, stroke: "rgba(90,59,46,.35)", lineWidth: 1.5 });
  items.push({ type: "text", text: `No. ${p.serial}`, x: 140, y: 140, size: 24, align: "left", face: "ui", weight: 700, color: "rgba(90,59,46,.6)" });
  items.push({ type: "text", text: `TEDDY DAY · ${day.date} ${day.month}`.toUpperCase(), x: W - 140, y: 140, size: 24, align: "right", face: "ui", weight: 700, color: "rgba(90,59,46,.6)" });
  items.push({ type: "text", text: "C E R T I F I C A T E", x: cx, y: 214, size: 32, face: "ui", weight: 800, color: honey });
  items.push({ type: "text", text: "of Adoption", x: cx, y: 258, size: 108, face: "serif", color: cocoa });
  items.push({ type: "text", text: "This is to certify that", x: cx, y: 410, size: 34, face: "serif", italic: true, color: "rgba(90,59,46,.75)" });
  items.push({ type: "text", text: p.to, x: cx, y: 456, size: 112, face: "serif", italic: true, color: "#3A2418", maxWidth: 900, maxLines: 1 });
  items.push({ type: "text", text: "has, on this day, lovingly adopted", x: cx, y: 616, size: 34, face: "serif", italic: true, color: "rgba(90,59,46,.75)" });
  const ph = p.photos[0];
  if (ph) {
    items.push({ type: "image", src: ph.url, x: 190, y: 700, w: 270, h: 290, cropX: ph.cropX, cropY: ph.cropY, rotate: -5, frame: { pad: 14, bottom: 46, color: "#FFFDF8" } });
    items.push({ type: "image", src: fluentUrl("teddy-bear"), x: 600, y: 710, w: 290, h: 290 });
  } else {
    items.push({ type: "image", src: fluentUrl("teddy-bear"), x: cx - 150, y: 700, w: 300, h: 300 });
  }
  items.push({ type: "text", text: p.teddy, x: cx, y: 1040, size: 96, face: "serif", color: cocoa, maxWidth: 880, maxLines: 1 });
  items.push({ type: "text", text: "a bear of excellent character, to have and to hug.", x: cx, y: 1160, size: 30, face: "serif", italic: true, color: "rgba(90,59,46,.7)", maxWidth: 860 });
  const facts: [string, string][] = [["BORN", p.born], ...(p.birthPlace ? [["PLACE OF BIRTH", p.birthPlace] as [string, string]] : []), ...(p.temperament ? [["TEMPERAMENT", p.temperament] as [string, string]] : []), ["RELEASED BY", p.from]];
  let y = 1236;
  for (const [k, v] of facts) {
    items.push({ type: "text", text: k, x: 150, y, size: 19, face: "ui", weight: 800, align: "left", color: honey });
    items.push({ type: "text", text: v, x: 150, y: y + 26, size: 31, face: "serif", align: "left", color: "#3A2418", maxWidth: 440, maxLines: 1 });
    y += 74;
  }
  // the stamp
  items.push({ type: "rect", x: 612, y: 1262, w: 330, h: 104, radius: 12, stroke: C.stamp, lineWidth: 6 });
  items.push({ type: "text", text: "ADOPTED ♥", x: 777, y: 1290, size: 46, face: "ui", weight: 800, color: C.stamp });
  // signature + seal
  const sy = 1640;
  if (ink) {
    const w = 440;
    const h = Math.min(130, w / Math.max(1.5, ink.aspect));
    items.push({ type: "image", src: ink.png, x: 150, y: sy - h, w, h });
  }
  items.push({ type: "rect", x: 150, y: sy + 6, w: 450, h: 2, fill: "rgba(90,59,46,.55)" });
  items.push({ type: "text", text: "SIGNATURE OF THE ADOPTIVE PARENT", x: 150, y: sy + 20, size: 17, face: "ui", weight: 800, align: "left", color: "rgba(90,59,46,.6)" });
  items.push({ type: "rect", x: 730, y: 1440, w: 210, h: 210, radius: 105, fill: "#C9963F" });
  items.push({ type: "rect", x: 744, y: 1454, w: 182, h: 182, radius: 91, stroke: "#F3D79B", lineWidth: 3 });
  items.push({ type: "text", text: p.teddy.charAt(0).toUpperCase(), x: 835, y: 1480, size: 92, face: "serif", color: "#FFF3D6" });
  items.push({ type: "text", text: "OFFICIAL", x: 835, y: 1590, size: 16, face: "ui", weight: 800, color: "#FFF3D6" });
  items.push({ type: "text", text: "made on subhsandesh.in ✦", x: cx, y: 1800, size: 26, face: "ui", weight: 600, color: "rgba(245,238,226,.7)" });
  return { width: W, height: H, background: { stops: [[0, "#3A2418"], [1, C.night]] }, items };
}

export function EndingScene({
  p,
  data,
  day,
  mode,
  ink,
  sticker,
  onReplay,
}: {
  p: Papers;
  data: ValentineDayData;
  day: DayConfig;
  mode: "preview" | "live";
  ink: Ink;
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const { sfx, premium } = usePremium();
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const end = (data.endLine || `${p.teddy} is yours now. So am I.`).trim();

  const save = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(papersKeepsake(p, data, day, ink), `${day.slug}-${data.recipientName || "teddy"}`, `${p.teddy}'s adoption papers 🧸`);
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };
  const psText = premium.psLetter.trim();
  const nl = psText.indexOf("\n");
  const psFirst = (nl >= 0 ? psText.slice(0, nl) : psText).trim();
  const psRest = nl >= 0 ? psText.slice(nl).trim() : "";

  return (
    <section className="ap-scene ap-ending" aria-label="The keepsake">
      <header className="ap-head">
        <p className="ap-eyebrow">
          Teddy Day · {day.date} {day.month}
        </p>
        <RevealText as="h2" text={end} className="ap-display ap-displayEnd" delay={0.3} />
      </header>

      <div className="ap-cardWrap">
        <TiltCard radius={4} glare={0.28} max={9} style={{ width: "var(--ap-cardW, min(312px, 80vw))" }}>
          <Certificate
            p={p}
            seal="sealed"
            stamped
            className="ap-certMini"
            // eslint-disable-next-line @next/next/no-img-element -- a local data: URL of their own ink
            signature={ink ? <img src={ink.png} alt={`${p.to}'s signature`} className="ap-sigImg" /> : <span className="ap-sigTyped">{p.to}</span>}
          />
        </TiltCard>
        <span className="ap-cardSticker">{sticker}</span>
        <span className="ap-cardBear" aria-hidden>
          <Fluent3D name="teddy-bear" size={100} float={false} shadow={false} />
        </span>
      </div>

      <div className="ap-endActions">
        <PremiumCTA tone="gold" cue="tick" onClick={save} disabled={saving === "busy"}>
          {saving === "busy" ? "Printing it…" : saving === "done" ? "Saved ✦" : saving === "failed" ? "Try again" : "Save the certificate"}
        </PremiumCTA>
      </div>

      <div className="ap-endMore">
        {psText && (
          <div className={`ap-ps${ps ? " is-open" : ""}`}>
            <button
              type="button"
              className="ap-wax"
              aria-expanded={ps}
              aria-label={ps ? "The P.S. is open" : `Break the seal: ${psFirst}`}
              onClick={() => {
                if (ps) return;
                setPs(true);
                sfx("wax-crack", { gain: 0.8 });
                haptic([12, 30, 8]);
              }}
            >
              <i className="ap-waxL" aria-hidden />
              <i className="ap-waxR" aria-hidden />
              <b aria-hidden>P.S.</b>
            </button>
            <p className="ap-psFirst">{psFirst}</p>
            {ps && psRest && <p className="ap-psRest">{psRest}</p>}
          </div>
        )}
        <ReplyBox title={`Write back to ${p.from}`} placeholder={`A line back, a thank-you from ${p.teddy}…`} accent={C.honey} className="ap-reply" />
        <div className="ap-endKit">
          <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => papersKeepsake(p, data, day, ink)} replyLabel="🧸 Send one back on WhatsApp" />
        </div>
        <p className="ap-credit">made with SubhSandesh ✦</p>
      </div>
    </section>
  );
}
