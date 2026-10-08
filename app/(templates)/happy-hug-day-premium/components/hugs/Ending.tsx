"use client";

// The ending: a thermal-glow "Hug certificate · 20 seconds · 11:42 PM" (the
// keepsake, 1080×1920), the reply to the sender, the end line, and the ways
// out (WhatsApp with their reply line, replay, make one).

import Link from "next/link";
import { useState } from "react";
import { ReplyBox, saveOrSharePoster, sfx } from "../../../_valentine/kit/premium";
import { CroppedPhoto, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Kicker, Quiet, Room, Satin, Title } from "./ui";

function certificate(data: ValentineDayData, h: Hug, at: string): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const items: KeepsakeItem[] = [];
  items.push({ type: "text", text: "HUG CERTIFICATE", x: W / 2, y: 150, size: 34, weight: 700, face: "ui", color: "#FFE08A" });
  items.push({ type: "text", text: `${h.recipient} & ${h.sender}`, x: W / 2, y: 220, size: 84, face: "script", color: "#FFF6EA", maxWidth: 960, maxLines: 1 });
  const photo = data.photos.find((p) => p && p.url);
  if (photo) items.push({ type: "image", src: photo.url, x: 240, y: 420, w: 600, h: 680, cropX: photo.cropX, cropY: photo.cropY, rotate: -2, frame: { pad: 26, bottom: 110, color: "#F4EBDD" } });
  else items.push({ type: "emoji", char: "🫂", x: W / 2, y: 760, size: 360 });
  items.push({ type: "text", text: "Hug delivered", x: W / 2, y: 1210, size: 92, italic: true, face: "serif", color: "#FFFFFF" });
  items.push({ type: "text", text: `${h.hold} seconds${at ? ` · ${at}` : ""}`, x: W / 2, y: 1340, size: 48, weight: 600, face: "ui", color: "#2A1408" });
  if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1470, size: 44, italic: true, face: "serif", color: "#2A1408", maxWidth: 900, maxLines: 2 });
  items.push({ type: "text", text: "✦ made on subhsandesh.in", x: W / 2, y: H - 90, size: 26, face: "ui", color: "rgba(42,20,8,0.7)" });
  return { width: W, height: H, background: { stops: [[0, "#121634"], [0.3, "#46207A"], [0.55, "#D9367A"], [0.78, "#FF8A3D"], [1, "#FFE08A"]] }, items };
}

export default function Ending({ day, data, h, at, mode, onReplay }: { day: DayConfig; data: ValentineDayData; h: Hug; at: string; mode: "preview" | "live"; onReplay: () => void }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const photo = data.photos.find((p) => p && p.url);
  const reply = h.reply || day.copy.replyText;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${reply}\n— to ${h.sender}`)}`;
  const save = async () => {
    setSaving(true);
    haptic(10);
    sfx("hg-pop", { gain: 0.5 });
    const r = await saveOrSharePoster(certificate(data, h, at), `hug-certificate-${h.recipient}`, `${h.recipient} & ${h.sender} 🤍`);
    setSaving(false);
    setSaved(r === "failed" ? "Couldn't save here — take a screenshot instead 📸" : r === "shared" ? "Shared ✦" : "Saved ✦");
  };
  return (
    <Room label="Your hug certificate" className="hg-end">
      <Kicker>Hug certificate</Kicker>
      <Title>Held, officially</Title>
      <div className="hg-cert">
        <span className="hg-certGlow" aria-hidden />
        <p className="hg-certNames" style={{ fontFamily: HAND }}>{h.recipient} &amp; {h.sender}</p>
        <div className="hg-certPhoto">{photo ? <CroppedPhoto photo={photo} eager /> : <span>🫂</span>}</div>
        <p className="hg-certBig" style={{ fontFamily: SOFT }}>Hug delivered</p>
        <p className="hg-certSmall">{h.hold} seconds{at ? ` · ${at}` : ""}</p>
      </div>
      <Satin onClick={save} disabled={saving}>{saving ? "Warming it up…" : "Save the certificate 🤍"}</Satin>
      {saved && <p className="hg-saved" role="status">{saved}</p>}
      <ReplyBox title={`Write back to ${h.sender}`} placeholder="Say it back — a line, a memory, a hug…" accent="#D9367A" className="hg-reply" />
      <p className="hg-endLine" style={{ fontFamily: SOFT }}>{data.endLine || "Twenty seconds was never going to be enough. 🤍"}</p>
      <div className="hg-actions">
        <a className="hg-wa" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => haptic(10)}>💬 Send a hug back on WhatsApp</a>
        <div className="hg-actRow">
          <Quiet onClick={onReplay}>↺ Replay</Quiet>
          {mode === "live" && <Link href="/templates" className="hg-make">Send someone 20 seconds ✦</Link>}
        </div>
      </div>
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-end { gap: 14px; padding-bottom: 56px; }
.hg-cert { position: relative; width: min(78vw, 300px); padding: 18px 18px 22px; border-radius: 22px; overflow: hidden; display: grid; justify-items: center; gap: 8px;
  background: linear-gradient(180deg, #121634 0%, #46207A 30%, #D9367A 58%, #FF8A3D 80%, #FFE08A 100%); box-shadow: 0 30px 60px -24px rgba(217,54,122,.6); }
.hg-certGlow { position: absolute; inset: 0; background: radial-gradient(60% 40% at 50% 70%, rgba(255,250,230,.5), transparent 70%); pointer-events: none; }
.hg-certNames { position: relative; margin: 0; font-size: 28px; color: #FFF6EA; }
.hg-certPhoto { position: relative; width: 74%; aspect-ratio: 1; padding: 8px 8px 22px; background: #F4EBDD; transform: rotate(-2deg); box-shadow: 0 10px 22px rgba(0,0,0,.35); display: grid; place-items: center; font-size: 60px; }
.hg-certPhoto > span:first-child { border-radius: 2px; }
.hg-certBig { position: relative; margin: 6px 0 0; font-size: 30px; font-style: italic; color: #fff; }
.hg-certSmall { position: relative; margin: 0; font: 700 14px/1 var(--vw-font-ui, system-ui), sans-serif; color: #2A1408; letter-spacing: .04em; }
.hg-saved { margin: 0; font: 600 13.5px/1.3 var(--vw-font-ui, system-ui), sans-serif; color: var(--vw-ink); }
.hg-reply { background: rgba(27,35,64,.55) !important; border-color: rgba(220,232,242,.25) !important; color: #F4EBDD !important; }
.hg-endLine { margin: 4px 0 0; max-width: 28ch; font-size: clamp(21px, 5.6vw, 26px); font-style: italic; line-height: 1.35; color: var(--vw-ink); text-wrap: balance; }
.hg-actions { display: grid; gap: 10px; width: 100%; max-width: 380px; }
.hg-wa { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 16px; text-decoration: none; color: #2A1408;
  font: 700 16px/1 var(--vw-font-ui, system-ui), sans-serif; background: linear-gradient(135deg, #FFB070, #FF8A3D 45%, #D9367A); }
.hg-actRow { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.hg-make { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 99px; text-decoration: none; color: var(--vw-ink);
  font: 700 14px/1 var(--vw-font-ui, system-ui), sans-serif; border: 1px solid rgba(220,232,242,.3); background: rgba(27,35,64,.45); }
.hg-wa:focus-visible, .hg-make:focus-visible { outline: 3px solid #FFE08A; outline-offset: 3px; }
`;
