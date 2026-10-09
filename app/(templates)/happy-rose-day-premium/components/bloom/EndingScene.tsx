"use client";

// The ending: "{endLine}" over a keepsake card they can tilt (gyro/pointer, foil sheen): one of their photos in an
// arched window, both names, "since …". "Keep this card" saves/shares a 1080×1920 poster of the rose of photos.
// Below: the sealed P.S. behind a wax seal (sfx wax-crack, the seal splits), the reply box, and the shell's
// ending actions (replay, WhatsApp). react("completed") fires when this scene arrives (in the root).

import { useState, type ReactNode } from "react";
import { EndingActions, haptic, type KeepsakeLayout, type KeepsakeItem } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, ReplyBox, RevealText, TiltCard, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { SHADES, type Bloom } from "./util";

export function bloomKeepsake(b: Bloom, data: ValentineDayData, day: DayConfig): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const s = SHADES[b.color];
  const gold = "#E3C27E";
  const items: KeepsakeItem[] = [];
  const cx = W / 2;
  const cy = 800;
  const ph = b.photos;
  items.push({ type: "text", text: "THE BLOOM OF US", x: cx, y: 190, size: 30, weight: 500, color: gold, face: "ui" });
  items.push({ type: "text", text: `Rose Day · ${day.date} ${day.month}`, x: cx, y: 250, size: 34, italic: true, face: "serif", color: "rgba(246,240,230,.75)" });
  if (ph.length) {
    // A rose of photos: six round petals around a larger heart, each with a gold hairline.
    const ring = Math.min(6, Math.max(ph.length - 1, 0));
    const R = 300;
    const r = 150;
    for (let k = 0; k < ring; k++) {
      const a = (-90 + (360 / ring) * k) * (Math.PI / 180);
      const x = cx + R * Math.cos(a);
      const y = cy + R * Math.sin(a);
      const p = ph[(k + 1) % ph.length];
      items.push({ type: "image", src: p.url, x: x - r, y: y - r, w: r * 2, h: r * 2, radius: r, cropX: p.cropX, cropY: p.cropY });
      items.push({ type: "rect", x: x - r, y: y - r, w: r * 2, h: r * 2, radius: r, stroke: gold, lineWidth: 3 });
    }
    const C = 220;
    items.push({ type: "rect", x: cx - C - 14, y: cy - C - 14, w: (C + 14) * 2, h: (C + 14) * 2, radius: C + 14, fill: s.deep });
    items.push({ type: "image", src: ph[0].url, x: cx - C, y: cy - C, w: C * 2, h: C * 2, radius: C, cropX: ph[0].cropX, cropY: ph[0].cropY });
    items.push({ type: "rect", x: cx - C, y: cy - C, w: C * 2, h: C * 2, radius: C, stroke: gold, lineWidth: 4 });
  } else {
    items.push({ type: "emoji", char: "🌹", x: cx, y: cy - 160, size: 320 });
  }
  items.push({ type: "text", text: `${b.to} & ${b.from}`, x: cx, y: 1300, size: 84, italic: true, face: "serif", color: "#FBF4EA", maxWidth: 960, maxLines: 1 });
  if (b.since) items.push({ type: "text", text: `SINCE ${b.since.toUpperCase()}`, x: cx, y: 1410, size: 28, weight: 500, face: "ui", color: gold, maxWidth: 900, maxLines: 1 });
  const end = (data.endLine || "Every Rose Day, it's still you.").trim();
  items.push({ type: "text", text: end, x: cx, y: 1500, size: 46, italic: true, face: "serif", color: "rgba(246,240,230,.9)", maxWidth: 900, maxLines: 2, lineHeight: 1.2 });
  items.push({ type: "text", text: "made on subhsandesh.in ✦", x: cx, y: 1830, size: 26, color: "rgba(246,240,230,.55)", face: "ui" });
  return { width: W, height: H, background: { stops: [[0, "#2A0A12"], [0.45, s.deep], [1, "#0C0406"]] }, items };
}

export function EndingScene({
  b,
  data,
  day,
  mode,
  sticker,
  onReplay,
}: {
  b: Bloom;
  data: ValentineDayData;
  day: DayConfig;
  mode: "preview" | "live";
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const { sfx, premium } = usePremium();
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const end = (data.endLine || "Every Rose Day, it's still you.").trim();
  const cover = b.photos[0];

  const save = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(bloomKeepsake(b, data, day), `${day.slug}-${data.recipientName || "rose"}`, "The bloom of us 🌹");
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };
  const psFirst = premium.psLetter.split("\n")[0].trim();
  const psRest = premium.psLetter.slice(premium.psLetter.indexOf("\n") >= 0 ? premium.psLetter.indexOf("\n") : premium.psLetter.length).trim();

  return (
    <section className="rb-scene rb-ending" aria-label="The keepsake">
      <header className="rb-head">
        <p className="rb-eyebrow">Rose Day · {day.date} {day.month}</p>
        <RevealText as="h2" text={end} className="rb-display rb-displayEnd" delay={0.3} />
      </header>

      <div className="rb-cardWrap">
        <TiltCard radius={6} foil glare={0.3} max={10} style={{ width: "min(300px, 74vw)" }}>
          <div className="rb-card">
            <div className="rb-arch">{cover ? <CinematicPhoto photo={cover} frame="full" grade="warm" focusPull={false} drift={24} caption="" /> : <i className="rb-archVelvet" />}</div>
            <p className="rb-cardNames">
              {b.to} <span>&</span> {b.from}
            </p>
            <p className="rb-cardSince">{b.since ? `since ${b.since}` : "Rose Day"}</p>
          </div>
        </TiltCard>
        <span className="rb-cardSticker">{sticker}</span>
      </div>

      <div className="rb-endActions">
        <PremiumCTA tone="gold" cue="tick" onClick={save} disabled={saving === "busy"}>
          {saving === "busy" ? "Pressing it…" : saving === "done" ? "Kept ✦" : saving === "failed" ? "Try again" : "Keep this card"}
        </PremiumCTA>
      </div>

      <div className="rb-endMore">
        {premium.psLetter && (
          <div className={`rb-ps${ps ? " is-open" : ""}`}>
            <button
              type="button"
              className="rb-seal"
              aria-expanded={ps}
              aria-label={ps ? "The P.S. is open" : `Break the seal: ${psFirst}`}
              onClick={() => {
                if (ps) return;
                setPs(true);
                sfx("wax-crack", { gain: 0.8 });
                haptic([12, 30, 8]);
              }}
            >
              <i className="rb-sealL" aria-hidden />
              <i className="rb-sealR" aria-hidden />
              <b aria-hidden>P.S.</b>
            </button>
            <p className="rb-psFirst">{psFirst}</p>
            {ps && psRest && <p className="rb-psRest">{psRest}</p>}
          </div>
        )}
        <ReplyBox title={`Write back to ${b.from}`} placeholder="A line back, a memory, a rose…" accent="#C8475B" className="rb-reply" />
        <div className="rb-endKit">
          <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => bloomKeepsake(b, data, day)} replyLabel="🌹 Send one back on WhatsApp" />
        </div>
        <p className="rb-credit">made with SubhSandesh ✦</p>
      </div>
    </section>
  );
}
