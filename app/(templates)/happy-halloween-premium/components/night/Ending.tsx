"use client";

// Chapter VII · Stay Haunted. The end line, then the keepsake: a costume-duo
// movie poster of the two of them ("Meera & Arjun as Morticia & Gomez in
// The Haunting of Us"), saved as a 9:16 story or a 4:5 post. Then the reply
// to the sender, replay, and "make one for someone" for the recipient.

import Link from "next/link";
import { useState } from "react";
import { CinematicPhoto, Fluent3D, PremiumCTA, ReplyBox, RevealText, TiltCard, saveOrSharePoster, sfx } from "../../../_valentine/kit/premium";
import { haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { Night } from "./model";
import { Eyebrow, Gilt, Quiet } from "./ui";
import { BODY, DISPLAY } from "./fonts";

const dateLine = () => {
  const y = new Date().getFullYear();
  return `31 · X · ${y}`;
};

function posterLayout(n: Night, endLine: string, format: "story" | "feed"): KeepsakeLayout {
  const W = 1080;
  const story = format === "story";
  const H = story ? 1920 : 1350;
  const items: KeepsakeItem[] = [];
  const top = story ? 170 : 90;
  items.push({ type: "text", text: `A NIGHT AT ${n.manor.toUpperCase()}`, x: W / 2, y: top, size: 30, weight: 600, face: "serif", color: "#E8CF8A", maxWidth: 940, maxLines: 1 });
  const fw = story ? 700 : 520;
  const fh = Math.round(fw * 1.25);
  const fx = (W - fw) / 2;
  const fy = top + (story ? 110 : 70);
  // gilt frame: shadow, outer gold, bevel, liner
  items.push({ type: "rect", x: fx - 38, y: fy - 24, w: fw + 76, h: fh + 72, radius: 6, fill: "rgba(0,0,0,0.3)" });
  items.push({ type: "rect", x: fx - 34, y: fy - 34, w: fw + 68, h: fh + 68, radius: 4, fill: "#C9A45C", stroke: "#F6E2A6", lineWidth: 5 });
  items.push({ type: "rect", x: fx - 16, y: fy - 16, w: fw + 32, h: fh + 32, radius: 2, fill: "#8A6A2F", stroke: "#FFF4CF", lineWidth: 2 });
  items.push({ type: "rect", x: fx - 5, y: fy - 5, w: fw + 10, h: fh + 10, radius: 1, fill: "#160A0E" });
  if (n.hero) items.push({ type: "image", src: n.hero.url, x: fx, y: fy, w: fw, h: fh, cropX: n.hero.cropX, cropY: n.hero.cropY });
  else {
    items.push({ type: "rect", x: fx, y: fy, w: fw, h: fh, fill: "#2B1A2F" });
    items.push({ type: "emoji", char: "👻", x: W / 2, y: fy + fh / 2, size: 240 });
  }
  let y = fy + fh + (story ? 120 : 92);
  const names = n.sender ? `${n.recipient} & ${n.sender}` : n.recipient;
  items.push({ type: "text", text: names, x: W / 2, y, size: story ? 96 : 76, face: "serif", weight: 600, color: "#F1E9D8", maxWidth: 980, maxLines: 1 });
  y += story ? 104 : 82;
  if (n.duo) {
    items.push({ type: "text", text: `as ${n.duo}`, x: W / 2, y, size: story ? 46 : 38, italic: true, face: "serif", color: "#F2B35B", maxWidth: 940, maxLines: 1 });
    y += story ? 78 : 62;
  }
  items.push({ type: "text", text: `in “${n.title}”`, x: W / 2, y, size: story ? 36 : 30, italic: true, face: "serif", color: "rgba(241,233,216,0.8)", maxWidth: 940, maxLines: 1 });
  y += story ? 110 : 70;
  if (story && endLine) {
    items.push({ type: "text", text: endLine, x: W / 2, y, size: 38, italic: true, face: "serif", color: "#F1E9D8", maxWidth: 860, maxLines: 2 });
  }
  items.push({ type: "text", text: `${dateLine()}  ✦  subhsandesh.in`, x: W / 2, y: H - (story ? 110 : 64), size: 24, face: "ui", weight: 600, color: "rgba(232,207,138,0.85)" });
  return { width: W, height: H, background: { stops: [[0, "#0C070E"], [0.45, "#2B1A2F"], [1, "#4A1517"]] }, items };
}

export default function Ending({ n, endLine, mode, onReplay }: { n: Night; endLine: string; mode: "preview" | "live"; onReplay: () => void }) {
  const [saving, setSaving] = useState<"" | "story" | "feed">("");
  const [saved, setSaved] = useState("");
  const line = endLine.trim() || "Happy Halloween. Stay haunted with me.";
  // Emoji read as clip-art at display size: the headline keeps only the words.
  const headline = line.replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu, "").replace(/\s+/g, " ").trim() || line;

  const save = async (format: "story" | "feed") => {
    if (saving) return;
    setSaving(format);
    haptic(10);
    sfx("paper-rustle", { gain: 0.5 });
    const r = await saveOrSharePoster(posterLayout(n, line, format), `night-at-the-manor-${n.recipient}-${format}`, `${n.recipient} & ${n.sender} · ${n.title}`);
    setSaving("");
    setSaved(r === "failed" ? "Couldn't save here. A screenshot works too." : r === "shared" ? "Shared ✦" : "Saved ✦");
    if (r !== "failed") sfx("chime", { gain: 0.6 });
  };

  return (
    <div className="nm-scene nm-scroll nm-ending">
      <Eyebrow n="VII">Stay Haunted</Eyebrow>
      <RevealText as="h2" text={headline} className="nm-h nm-endH" />

      <div className="nm-endGrid">
      <div className="nm-endKeep">
      <TiltCard radius={6} max={9} foil={false} glare={0.3} style={{ width: "min(58vw, 270px)", marginTop: 24 }}>
        <div className="nm-poster" aria-label="Your poster">
          <span className="nm-pTop">{n.manor}</span>
          <Gilt lamp={false} style={{ width: "74%", aspectRatio: "4 / 5", padding: 7 }}>
            {n.hero ? <CinematicPhoto photo={n.hero} frame="full" caption="" grade="warm" focusPull={false} kenBurns={false} /> : <span style={{ display: "grid", placeItems: "center" }}><Fluent3D name="ghost" size={90} /></span>}
          </Gilt>
          <span className="nm-pNames">{n.sender ? `${n.recipient} & ${n.sender}` : n.recipient}</span>
          {n.duo && <span className="nm-pDuo">as {n.duo}</span>}
          <span className="nm-pTitle">in &ldquo;{n.title}&rdquo;</span>
          <span className="nm-pDate">{dateLine()}</span>
        </div>
      </TiltCard>

      <div className="nm-saveRow">
        <PremiumCTA tone="gold" cue={null} onClick={() => save("story")} disabled={!!saving}>
          {saving === "story" ? "Framing it…" : "Save our poster"}
        </PremiumCTA>
        <Quiet onClick={() => save("feed")}>{saving === "feed" ? "Framing…" : "or a 4:5 for a post"}</Quiet>
        {saved && <p className="nm-saved" role="status">{saved}</p>}
      </div>
      </div>
      <div className="nm-endWrite">

      <ReplyBox title={n.sender ? `Write back to ${n.sender}` : "Write back"} placeholder="A line, a memory, a yes…" accent="#5C1A1B" className="nm-reply" />

      <div className="nm-endRow">
        <Quiet onClick={onReplay}>↺ Replay the night</Quiet>
        {mode === "live" && (
          <Link href="/happy-halloween-premium" className="nm-make">
            Make one for someone ✦
          </Link>
        )}
      </div>
      </div>
      </div>
      <style>{END_CSS}</style>
    </div>
  );
}

const END_CSS = `
.nm-scene.nm-ending { justify-content: flex-start; gap: 12px; padding-bottom: calc(max(40px, env(safe-area-inset-bottom)) + var(--vw-dock-space, 0px) + 24px); }
.nm-endH { font-size: clamp(28px, 7.4vw, 50px); max-width: 16ch; margin-top: 6px; }
.nm-poster { position: relative; display: grid; justify-items: center; gap: 6px; padding: 22px 16px 18px; aspect-ratio: 9 / 16; box-sizing: border-box; border-radius: 6px; overflow: hidden;
  background: radial-gradient(80% 40% at 50% 30%, rgba(242,179,91,.18), transparent 70%), linear-gradient(180deg, #0c070e 0%, #2b1a2f 45%, #4a1517 100%);
  box-shadow: inset 0 0 0 1px rgba(232,207,138,.35); align-content: center; }
.nm-pTop { position: absolute; top: 18px; left: 10px; right: 10px; font: 400 10px/1.2 ${DISPLAY}; letter-spacing: .24em; text-transform: uppercase; color: #E8CF8A; text-align: center; }
.nm-pNames { margin-top: 14px; font: 400 clamp(20px, 6vw, 27px)/1 ${DISPLAY}; color: #F1E9D8; text-align: center; }
.nm-pDuo { font: italic 400 14px/1.2 ${BODY}; color: #F2B35B; text-align: center; }
.nm-pTitle { font: italic 300 12px/1.2 ${BODY}; color: rgba(241,233,216,.75); text-align: center; }
.nm-pDate { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; font: 400 9px/1 ${DISPLAY}; letter-spacing: .3em; color: rgba(232,207,138,.75); }
.nm-endGrid { display: grid; justify-items: center; width: 100%; max-width: 1040px; }
.nm-endKeep, .nm-endWrite { display: grid; justify-items: center; width: 100%; }
@media (min-width: 1024px) {
  .nm-endGrid { grid-template-columns: auto minmax(0, 440px); justify-content: center; align-items: center; gap: 0 72px; margin-top: 8px; }
  .nm-endWrite .nm-reply { margin-top: 0; }
}
.nm-saveRow { display: grid; justify-items: center; gap: 4px; margin-top: 22px; }
.nm-saved { margin: 0; font: italic 400 15px/1.3 ${BODY}; color: #F6EEDC; }
.nm-reply textarea { background: rgba(232,223,204,.94) !important; color: #2a1712 !important; font-family: ${BODY} !important; }
.nm-reply { width: 100%; max-width: 440px; margin-top: 18px; background: rgba(20,10,22,.62) !important; border-color: rgba(232,207,138,.3) !important; color: #F1E9D8 !important; }
.nm-endRow { display: flex; flex-wrap: wrap; gap: 10px 18px; justify-content: center; align-items: center; margin-top: 10px; }
.nm-make { display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 99px; text-decoration: none; color: #F1E9D8;
  font: 500 15px/1 ${BODY}; border: 1px solid rgba(232,207,138,.45); background: rgba(92,26,27,.5); }
.nm-make:focus-visible { outline: 2px solid #F2B35B; outline-offset: 3px; }
`;
