"use client";

// Scene 7 — "Before you go…": the speech letter inks in, paragraph by paragraph, on candle-lit paper (with the
// sender's couplet), then the FRONT-ROW TICKET to their own drone show — "Row 1 · Seat ♥", the date, the
// dodge count, and the YES formation drawn in drone dots. Pull the stub along the perforation to keep it
// ("sky-tear"): that saves the 1080×1920 ticket. Then the ending actions; react("completed") on arrival.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { saveOrSharePoster, usePremium } from "../../../_valentine/kit/premium";
import { EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { Sky } from "./util";

function yesDots(name: string, w: number, h: number, step: number): { x: number; y: number }[] {
  if (typeof document === "undefined") return [];
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return [];
  const fam = (getComputedStyle(document.querySelector(".sk-root") ?? document.body).getPropertyValue("--sk-display").trim() || "Impact") + ", Impact, sans-serif";
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const fit = (t: string, max: number) => {
    let s = max;
    g.font = `700 ${s}px ${fam}`;
    while (g.measureText(t).width > w * 0.9 && s > 10) {
      s -= 2;
      g.font = `700 ${s}px ${fam}`;
    }
  };
  fit(name.toUpperCase(), h * 0.4);
  g.fillText(name.toUpperCase(), w / 2, h * 0.3);
  fit("SAID YES", h * 0.4);
  g.fillText("SAID YES", w / 2, h * 0.74);
  const d = g.getImageData(0, 0, w, h).data;
  const out: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 120) out.push({ x, y });
  return out;
}

const stamp = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function ticketLayout(sky: Sky, data: ValentineDayData, dodges: number, at: Date): KeepsakeLayout {
  const W = 1080;
  const H = 1920;
  const items: KeepsakeItem[] = [];
  items.push({ type: "rect", x: 90, y: 300, w: 900, h: 1320, radius: 48, fill: "#141A44", stroke: "#FFD27A", lineWidth: 4 });
  for (const p of yesDots(sky.to, 780, 360, 9)) items.push({ type: "rect", x: 150 + p.x, y: 420 + p.y, w: 6, h: 6, radius: 3, fill: "#F4F8FF" });
  items.push({ type: "text", text: "♥", x: W / 2, y: 820, size: 70, color: "#FF5C8A", face: "ui" });
  items.push({ type: "text", text: "FRONT ROW · ONE NIGHT ONLY", x: W / 2, y: 340, size: 30, weight: 600, color: "#FFD27A", face: "ui" });
  items.push({ type: "rect", x: 150, y: 960, w: 780, h: 2, fill: "rgba(255,210,122,0.5)" });
  items.push({ type: "text", text: `A drone show by ${sky.from}`, x: W / 2, y: 1000, size: 56, face: "serif", italic: true, color: "#FFF7EA", maxWidth: 820, maxLines: 2 });
  items.push({ type: "text", text: `for ${sky.to}`, x: W / 2, y: 1080, size: 44, face: "script", color: "#FFD27A", maxWidth: 820, maxLines: 1 });
  items.push({ type: "text", text: "ROW 1 · SEAT ♥", x: W / 2, y: 1190, size: 40, weight: 700, color: "#F4F8FF", face: "ui" });
  items.push({ type: "text", text: stamp(at).toUpperCase(), x: W / 2, y: 1260, size: 30, weight: 600, color: "rgba(244,248,255,0.75)", face: "ui" });
  items.push({ type: "text", text: dodges ? `Said yes after dodging “Let me think” ${dodges} ${dodges === 1 ? "time" : "times"}` : "Said yes on the first ask", x: W / 2, y: 1330, size: 30, color: "#FFB45C", face: "ui", maxWidth: 820 });
  if (data.endLine.trim()) items.push({ type: "text", text: data.endLine.trim(), x: W / 2, y: 1420, size: 40, face: "serif", italic: true, color: "#FFF7EA", maxWidth: 820, maxLines: 2 });
  // perforation + stub
  for (let x = 120; x < 960; x += 28) items.push({ type: "rect", x, y: 1640, w: 14, h: 4, fill: "rgba(255,210,122,0.6)" });
  items.push({ type: "text", text: "ADMIT ONE · KEEP THIS STUB", x: W / 2, y: 1680, size: 26, weight: 700, color: "#FFD27A", face: "ui" });
  items.push({ type: "text", text: "made on subhsandesh.in ✦", x: W / 2, y: 1820, size: 26, color: "rgba(244,248,255,0.6)", face: "ui" });
  return { width: W, height: H, background: { stops: [[0, "#060918"], [0.5, "#0B1026"], [1, "#1C1F4A"]] }, items };
}

function TicketDots({ name }: { name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
    const g = cv.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    const pts = yesDots(name, Math.round(r.width * 0.9), Math.round(r.height * 0.9), 4);
    g.fillStyle = "rgba(244,248,255,.9)";
    g.shadowColor = "rgba(255,210,122,.9)";
    g.shadowBlur = 4;
    for (const p of pts) g.fillRect(r.width * 0.05 + p.x, r.height * 0.06 + p.y, 1.8, 1.8);
  }, [name]);
  return <canvas ref={ref} aria-hidden />;
}

export function Finale({ day, data, sky, dodges, at, mode, sticker, onReplay, onArrive }: {
  day: DayConfig;
  data: ValentineDayData;
  sky: Sky;
  dodges: number;
  at: Date;
  mode: "preview" | "live";
  sticker: ReactNode;
  onReplay: () => void;
  onArrive: () => void;
}) {
  const { sfx, premium } = usePremium();
  const [torn, setTorn] = useState(false);
  const [psOpen, setPsOpen] = useState(false);
  const [saved, setSaved] = useState<"idle" | "busy" | "done" | "failed">("idle");
  const pull = useRef<{ x: number } | null>(null);
  const paras = data.letter.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const arrive = useRef(onArrive);
  useEffect(() => {
    arrive.current();
    window.scrollTo({ top: 0 });
  }, []);

  const keep = async () => {
    setSaved("busy");
    const r = await saveOrSharePoster(ticketLayout(sky, data, dodges, at), `${day.slug}-${data.recipientName}-ticket`, `${sky.from} put my name in the sky 😭✨`);
    setSaved(r === "failed" ? "failed" : "done");
  };
  const tear = () => {
    if (torn) return;
    setTorn(true);
    sfx("sky-tear", { count: 18 });
    haptic([10, 20, 10]);
    void keep();
  };
  const sDown = (e: RPointerEvent<HTMLDivElement>) => {
    pull.current = { x: e.clientX };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
  };
  const sMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!pull.current || torn) return;
    const dx = e.clientX - pull.current.x;
    if (Math.abs(dx) > 14 && Math.random() < 0.3) sfx("sky-tear", { count: 3, gain: 0.6 });
    if (dx > 50) {
      pull.current = null;
      tear();
    }
  };

  return (
    <section className="sk-scene" aria-label="Before you go" style={{ gap: 22, paddingTop: 80 }}>
      <p className="sk-kick">Before you go…</p>
      <article className="sk-letter">
        {paras.map((p, i) => <p key={i} style={{ animationDelay: `${0.3 + i * 0.7}s` }}>{p}</p>)}
        {sky.shayari && <p className="sk-sher" style={{ animationDelay: `${0.3 + paras.length * 0.7}s` }}>{sky.shayari}</p>}
        <p className="sk-sign" style={{ animationDelay: `${0.6 + paras.length * 0.7}s` }}>— {sky.from}</p>
      </article>
      {premium.psLetter && (
        <button type="button" className="sk-ps" aria-expanded={psOpen} onClick={() => { if (!psOpen) sfx("wax-crack"); setPsOpen(true); }}>
          <b>P.S. {psOpen ? "" : "· sealed"}</b>
          {psOpen ? premium.psLetter : `${premium.psLetter.split("\n")[0].slice(0, 80)} — tap to open.`}
        </button>
      )}
      <p className="sk-kick" style={{ marginTop: 10 }}>Your front-row ticket</p>
      <div className="sk-ticket">
        <div className="sk-tMain">
          <TicketDots name={sky.to} />
          <small>A drone show by {sky.from}</small>
          <b>ROW 1 · SEAT ♥</b>
          <span>{stamp(at)}</span>
          <span>{dodges ? `Said yes after dodging “Let me think” ${dodges}×` : "Said yes on the first ask"}</span>
        </div>
        <div className={`sk-tStub${torn ? " is-torn" : ""}`} onPointerDown={sDown} onPointerMove={sMove} onPointerUp={() => (pull.current = null)} role="button" tabIndex={0}
          aria-label="Tear off the stub to keep your ticket" onClick={tear} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tear(); } }}>
          <b>ADMIT ONE</b>
        </div>
      </div>
      <p className="sk-hint" aria-live="polite">{saved === "busy" ? "Printing your ticket…" : saved === "done" ? "Kept ✓ It's in your photos/downloads." : saved === "failed" ? "Couldn't save here — take a screenshot 📸" : "Pull the stub to keep it."}</p>
      {sticker}
      <div className="sk-endWrap">
        <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => ticketLayout(sky, data, dodges, at)} replyLabel="💬 Tell them yes on WhatsApp" />
        <p className="sk-hint" style={{ opacity: 0.6 }}>Made with SubhSandesh ✦ Premium</p>
      </div>
    </section>
  );
}
