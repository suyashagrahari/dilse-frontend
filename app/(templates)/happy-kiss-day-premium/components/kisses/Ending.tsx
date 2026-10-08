"use client";

// The ending: "Sealed with a kiss". The keepsake is the kiss-booth strip (with
// both lipstick stamps) on velvet, 1080×1920 for a story. Then the reply to
// the sender, the end line, and WhatsApp / replay / make one.

import Link from "next/link";
import { useState } from "react";
import { ReplyBox, saveOrSharePoster, sfx } from "../../../_valentine/kit/premium";
import { haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { SERIF } from "./fonts";
import { fmt, SHADES, type Kisses } from "./model";
import Strip, { stripFrames, type Stamp } from "./Strip";
import { Kicker, Quiet, Room, Satin, Title } from "./ui";

function stripLayout(data: ValentineDayData, k: Kisses, stamps: Stamp[], aspect: number, count: number | null): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const items: KeepsakeItem[] = [];
  items.push({ type: "text", text: "A THOUSAND KISSES", x: W / 2, y: 110, size: 34, weight: 700, face: "ui", color: "#F3DC8A" });
  items.push({ type: "text", text: `${k.recipient} & ${k.sender}`, x: W / 2, y: 170, size: 76, face: "script", color: "#FFF6EE", maxWidth: 960, maxLines: 1 });
  const sw = 500;
  const pad = 26;
  const fw = sw - pad * 2;
  const fh = Math.round(fw / aspect);
  const gap = 22;
  const sh = pad + 4 * fh + 3 * gap + 110;
  const sx = (W - sw) / 2;
  const sy = 330;
  items.push({ type: "rect", x: sx + 14, y: sy + 18, w: sw, h: sh, radius: 4, fill: "rgba(20,2,8,0.45)" });
  items.push({ type: "rect", x: sx, y: sy, w: sw, h: sh, radius: 4, fill: "#FFFDF8" });
  stripFrames(data.photos).forEach((ph, i) => {
    const y = sy + pad + i * (fh + gap);
    if (ph) items.push({ type: "image", src: ph.url, x: sx + pad, y, w: fw, h: fh, cropX: ph.cropX, cropY: ph.cropY });
    else {
      items.push({ type: "rect", x: sx + pad, y, w: fw, h: fh, fill: "#F4E2D4" });
      items.push({ type: "emoji", char: "💋", x: W / 2, y: y + fh / 2, size: 120 });
    }
    if (i === 0 || i === 2) items.push({ type: "emoji", char: "💋", x: i === 0 ? sx + sw - pad - 50 : sx + pad + 50, y: y + fh - 44, size: 70 });
  });
  items.push({ type: "text", text: `${k.recipient} + ${k.sender} · Kiss Day`, x: W / 2, y: sy + sh - 86, size: 44, face: "script", color: "#3E0A1C", maxWidth: sw - 40, maxLines: 1 });
  for (const s of stamps) items.push({ type: "emoji", char: "💋", x: sx + (s.x / 100) * sw, y: sy + (s.y / 100) * sh, size: 96 });
  let y = sy + sh + 70;
  if (count) {
    items.push({ type: "text", text: `made of ${fmt(count)} kisses`, x: W / 2, y, size: 44, italic: true, face: "serif", color: "#FFF6EE" });
    y += 80;
  }
  if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y, size: 40, italic: true, face: "serif", color: "#FFE0EA", maxWidth: 900, maxLines: 2 });
  items.push({ type: "text", text: "✦ made on subhsandesh.in", x: W / 2, y: H - 90, size: 26, face: "ui", color: "rgba(255,246,238,0.75)" });
  return { width: W, height: H, background: { stops: [[0, "#2E0612"], [0.55, "#5A0F24"], [1, SHADES[k.shade].lo]] }, items };
}

export default function Ending({ day, data, k, stamps, aspect, count, mode, onReplay }: { day: DayConfig; data: ValentineDayData; k: Kisses; stamps: Stamp[]; aspect: number; count: number | null; mode: "preview" | "live"; onReplay: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const reply = k.backText || day.copy.replyText;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${reply}\n— to ${k.sender}`)}`;

  const save = async () => {
    setSaving(true);
    haptic(10);
    sfx("kd-stamp", { gain: 0.6 });
    const r = await saveOrSharePoster(stripLayout(data, k, stamps, aspect, count), `kiss-booth-${k.recipient}`, `${k.recipient} & ${k.sender} 💋`);
    setSaving(false);
    setSaved(r === "failed" ? "Couldn't save here — take a screenshot instead 📸" : r === "shared" ? "Shared ✦" : "Saved ✦");
  };

  return (
    <Room label="Sealed with a kiss" className="kd-end">
      <Kicker>Sealed with a kiss</Kicker>
      <Title>Keep this one</Title>
      <Strip k={k} photos={data.photos} aspect={aspect} stamps={stamps} small />
      <div className="kd-endRow">
        <Satin onClick={save} disabled={saving}>{saving ? "Printing…" : "Save the strip 💋"}</Satin>
      </div>
      {saved && <p className="kd-saved" role="status">{saved}</p>}
      <ReplyBox title={`Write back to ${k.sender}`} placeholder="A kiss back in words…" accent="#B3122E" />
      <p className="kd-endLine" style={{ fontFamily: SERIF }}>{data.endLine || "Sealed with a kiss. Opened with a smile 💋"}</p>
      <div className="kd-actions">
        <a className="kd-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>💬 Send a kiss back on WhatsApp</a>
        <div className="kd-actRow">
          <Quiet onClick={onReplay}>↺ Replay</Quiet>
          {mode === "live" && <Link href="/templates" className="kd-make">Send a thousand kisses ✦</Link>}
        </div>
      </div>
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-end { gap: 14px; padding-bottom: 56px; }
.kd-endRow { display: flex; gap: 10px; margin-top: 8px; }
.kd-saved { margin: 0; font: 600 13.5px/1.3 var(--vw-font-ui, system-ui), sans-serif; color: var(--vw-ink); }
.kd-endLine { margin: 4px 0 0; max-width: 28ch; font-size: clamp(21px, 5.6vw, 26px); font-style: italic; line-height: 1.35; color: var(--vw-ink); text-wrap: balance; }
.kd-actions { display: grid; gap: 10px; width: 100%; max-width: 380px; }
.kd-wa { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 16px; text-decoration: none; color: #FFF6EE;
  font: 700 16px/1 var(--vw-font-ui, system-ui), sans-serif; background: linear-gradient(135deg, #E2456B, #B3122E 55%, #6E0A1C); box-shadow: 0 12px 26px -12px rgba(122,15,46,.7); }
.kd-actRow { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.kd-make { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 99px; text-decoration: none; color: var(--vw-ink);
  font: 700 14px/1 var(--vw-font-ui, system-ui), sans-serif; border: 1px solid rgba(122,15,46,.3); background: rgba(255,255,255,.6); }
.kd-wa:focus-visible, .kd-make:focus-visible { outline: 3px solid var(--vw-accent); outline-offset: 3px; }
`;
