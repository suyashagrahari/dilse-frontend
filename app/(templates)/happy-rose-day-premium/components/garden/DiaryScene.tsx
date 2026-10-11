"use client";

// Scene 8 · Pressed in my diary. The keepsake: a diary page with her rose pressed flat, three of their photos as
// little taped polaroids, his last line and both names in handwriting. "Save it as a wallpaper" makes a 1080×1920
// PNG of the same page (Web Share → download). Below: the sealed P.S. under a pink wax heart, the reply dressed as a
// seed packet ("Send a rose back"), and the shell's ending actions (replay, WhatsApp, make one).

import { useState } from "react";
import { CroppedPhoto, EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { ReplyBox, saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { roseWallpaperDataUrl } from "../../../happy-rose-day/components/rose/art";
import { Defs, Gif, RoseHead, Washi, LEAF } from "./art";
import { Puffy, Scene, useAww } from "./ui";
import { FIXED_GIF, type Garden } from "./util";

const END = "Every Rose Day, it's still you.";

export function diaryKeepsake(g: Garden, data: ValentineDayData, day: DayConfig): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const items: KeepsakeItem[] = [];
  const cx = W / 2;
  // the page
  items.push({ type: "rect", x: 96, y: 196, w: 888, h: 1540, radius: 40, fill: "rgba(214,63,114,.10)" });
  items.push({ type: "rect", x: 84, y: 180, w: 888, h: 1540, radius: 40, fill: "#FFFDF8", stroke: "#FFD1DF", lineWidth: 4 });
  for (let y = 300; y < 1680; y += 64) items.push({ type: "rect", x: 140, y, w: 776, h: 2, fill: "rgba(255,143,181,.22)" });
  items.push({ type: "rect", x: 150, y: 160, w: 190, h: 54, radius: 6, fill: "rgba(255,143,181,.6)" });
  items.push({ type: "rect", x: 740, y: 160, w: 190, h: 54, radius: 6, fill: "rgba(123,196,127,.5)" });
  items.push({ type: "text", text: "PRESSED IN MY DIARY", x: cx - 12, y: 286, size: 30, weight: 600, face: "ui", color: "#D63F72" });
  items.push({ type: "text", text: `Rose Day · ${day.date} ${day.month}`, x: cx - 12, y: 340, size: 30, weight: 500, face: "ui", color: "#8A4A5C" });
  // the pressed rose
  items.push({ type: "image", src: roseWallpaperDataUrl(g.color, 1), x: cx - 12 - 230, y: 360, w: 460, h: 690 });
  // the photos
  const ph = g.photos.slice(0, 3);
  const slots = [
    { x: 150, y: 930, r: -7 },
    { x: 396, y: 990, r: 4 },
    { x: 642, y: 930, r: -3 },
  ];
  const off = ph.length === 1 ? [1] : ph.length === 2 ? [0, 2] : [0, 1, 2];
  ph.forEach((p, k) => {
    const s = slots[off[k]];
    items.push({ type: "image", src: p.url, x: s.x, y: s.y, w: 250, h: 250, cropX: p.cropX, cropY: p.cropY, rotate: s.r, frame: { pad: 16, bottom: 54, color: "#FFFFFF" } });
  });
  const end = (data.endLine || END).trim();
  items.push({ type: "text", text: end, x: cx - 12, y: 1360, size: 78, weight: 700, face: "script", color: "#5B2333", maxWidth: 800, maxLines: 2, lineHeight: 1.1 });
  items.push({ type: "text", text: `${g.to} ♥ ${g.from}`, x: cx - 12, y: 1565, size: 66, weight: 700, face: "script", color: "#D63F72", maxWidth: 800, maxLines: 1 });
  if (g.since) items.push({ type: "text", text: `since ${g.since}`, x: cx - 12, y: 1640, size: 32, weight: 500, face: "ui", color: "#8A4A5C", maxWidth: 800, maxLines: 1 });
  items.push({ type: "emoji", char: "💗", x: 150, y: 1660, size: 56 });
  items.push({ type: "emoji", char: "🌸", x: 900, y: 300, size: 60 });
  items.push({ type: "text", text: "made with love on subhsandesh.in ✦", x: cx, y: 1830, size: 28, weight: 500, face: "ui", color: "rgba(91,35,51,.55)" });
  return { width: W, height: H, background: { stops: [[0, "#FFF5F8"], [0.6, "#FFE9F0"], [1, "#FFD9E6"]] }, items };
}

export function DiaryScene({ g, data, day, mode, step, total, onReplay }: { g: Garden; data: ValentineDayData; day: DayConfig; mode: "preview" | "live"; step: number; total: number; onReplay: () => void }) {
  const { premium, sfx } = usePremium();
  const aww = useAww();
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const [ps, setPs] = useState(false);
  const end = (data.endLine || END).trim();
  const photos = g.photos.slice(0, 3);

  const save = async () => {
    setSaving("busy");
    const r = await saveOrSharePoster(diaryKeepsake(g, data, day), `${day.slug}-${data.recipientName || "rose"}`, "My rose garden 🌹");
    setSaving(r === "failed" ? "failed" : "done");
    if (r !== "failed") aww({ x: 0.5, y: 0.4 });
  };
  const psText = premium.psLetter.trim();
  const nl = psText.indexOf("\n");
  const psFirst = (nl >= 0 ? psText.slice(0, nl) : psText).trim();
  const psRest = (nl >= 0 ? psText.slice(nl) : "").trim();

  return (
    <Scene id="diary" step={step} total={total} label="Pressed in my diary" kicker={`Rose Day · ${day.date} ${day.month}`} title="Pressed in my diary 📖" sub="So you can keep it forever">
      <div className="rg-diary">
        <Washi className="rg-diaryTape rg-diaryTape--l" />
        <Washi className="rg-diaryTape rg-diaryTape--r" color="rgba(123,196,127,.55)" />
        <svg className="rg-diaryRose" viewBox="-70 -110 140 230" aria-hidden>
          <Defs id="diary" color={g.color} />
          <path d="M0 0 C -6 40 6 80 0 112" stroke={LEAF.stem} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M0 50 C 14 34 38 34 48 44 C 34 56 14 58 0 50 Z" fill={LEAF.mid} />
          <path d="M0 72 C -14 58 -36 60 -44 70 C -30 80 -12 80 0 72 Z" fill={LEAF.mid} />
          <RoseHead id="diary" open={1} s={1.25} y={4} />
        </svg>
        {photos.length > 0 && (
          <div className="rg-diaryPhotos">
            {photos.map((p, i) => (
              <figure key={i} className="rg-diaryPol" style={{ ["--rot" as string]: `${[-7, 4, -3][i]}deg` }}>
                <span>
                  <CroppedPhoto photo={p} alt={p.caption ?? ""} />
                </span>
              </figure>
            ))}
          </div>
        )}
        <p className="rg-diaryEnd">{end}</p>
        <p className="rg-diaryNames">
          {g.to} <span>♥</span> {g.from}
        </p>
        {g.since && <p className="rg-diarySince">since {g.since}</p>}
        <Gif src={FIXED_GIF.flowersForYou} size={92} className="rg-diaryPeek" tilt={-8} />
      </div>

      <div className="rg-foot rg-foot--stack">
        <Puffy onClick={save} disabled={saving === "busy"} cue="tick">
          {saving === "busy" ? "Pressing it…" : saving === "done" ? "Saved 💗" : saving === "failed" ? "Try again" : "Save it as a wallpaper 📱"}
        </Puffy>
      </div>

      <div className="rg-endMore">
        {psText && (
          <div className={`rg-ps${ps ? " is-open" : ""}`}>
            <button
              type="button"
              className="rg-seal"
              aria-expanded={ps}
              aria-label={ps ? "The P.S. is open" : `Break the seal: ${psFirst}`}
              onClick={() => {
                if (ps) return;
                setPs(true);
                sfx("wax-crack", { gain: 0.8 });
                haptic([12, 30, 8]);
              }}
            >
              <i className="rg-sealL" aria-hidden />
              <i className="rg-sealR" aria-hidden />
              <b aria-hidden>P.S.</b>
            </button>
            <p className="rg-psFirst">{psFirst}</p>
            {ps && psRest && <p className="rg-psRest">{psRest}</p>}
            {!ps && <span className="rg-psHint">tap the seal</span>}
          </div>
        )}
        <div className="rg-replyPacket">
          <Gif src={FIXED_GIF.catHeart} size={78} className="rg-replyPeek" tilt={8} />
          <ReplyBox title="Send a rose back 🌹" placeholder={`Write ${g.from} a little note back…`} accent="#FF6F9C" className="rg-reply" />
        </div>
        <div className="rg-endKit">
          <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => diaryKeepsake(g, data, day)} replyLabel="🌹 Send one back on WhatsApp" />
        </div>
        <p className="rg-credit">made with SubhSandesh ✦</p>
      </div>
    </Scene>
  );
}
