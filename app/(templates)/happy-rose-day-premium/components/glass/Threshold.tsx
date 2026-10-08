"use client";

// Scene 0 — The Threshold. The gate's art is the glasshouse door (fogged glass, their name traced from the other
// side); its tap starts the song. Then the fog fills the screen: their name is written in it (the warm light
// glows through the letters, condensation drips from them) and they WIPE it away — a destination-out brush with
// a glass squeak ("gh-squeak", rate-limited). At ~25 % clear the rest melts, the door creaks ("gh-door") and the
// camera dollies in. "Open the door" does it with a tap.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";

export function DoorArt({ to, sticker }: { to: string; sticker: ReactNode }) {
  return (
    <div className="gh-gateArt">
      <span className="gh-gateName">{to}</span>
      <span className="gh-gateHandle" />
      <span className="gh-gateStk">{sticker}</span>
    </div>
  );
}

export function Fog({ to, onClear }: { to: string; onClear: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLCanvasElement>(null);
  const [clear, setClear] = useState(false);
  const done = useRef(false);
  const cbRef = useRef(onClear);
  useEffect(() => {
    cbRef.current = onClear;
  });

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setClear(true);
    sfx("gh-door", { gain: 1.2 });
    haptic(12);
    window.setTimeout(() => cbRef.current(), reduce ? 300 : 1100);
  };

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    let cancelled = false;
    let detach = () => {};
    const fam = getComputedStyle(cv).getPropertyValue("--font-vw-script").trim() || "cursive";
    // the script face is display:swap — wait for it (≤ 1.2 s) so their name is written in it, not a fallback
    const ready = document.fonts?.load ? Promise.race([document.fonts.load(`700 60px ${fam}`), new Promise((r) => window.setTimeout(r, 1200))]) : Promise.resolve();
    void ready.catch(() => {}).then(() => {
      if (!cancelled) detach = paint(cv, g, fam);
    });
    return () => {
      cancelled = true;
      detach();
    };
    // drawn once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  function paint(cv: HTMLCanvasElement, g: CanvasRenderingContext2D, fam: string) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    g.scale(dpr, dpr);
    // condensation: a milky film, speckled, denser at the edges
    const grd = g.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.45, Math.max(W, H) * 0.75);
    grd.addColorStop(0, "rgba(226,231,228,.86)");
    grd.addColorStop(1, "rgba(206,214,211,.96)");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < (W * H) / 900; i++) {
      g.fillStyle = `rgba(255,255,255,${(Math.random() * 0.35).toFixed(2)})`;
      const r = Math.random() * 2.2;
      g.beginPath();
      g.arc(Math.random() * W, Math.random() * H, r, 0, 6.28);
      g.fill();
    }
    // their name, traced from the other side: cleared letters + drips
    g.globalCompositeOperation = "destination-out";
    let size = Math.min(W * 0.26, 120);
    g.font = `700 ${size}px ${fam}, cursive`;
    while (g.measureText(to).width > W * 0.8 && size > 28) {
      size -= 4;
      g.font = `700 ${size}px ${fam}, cursive`;
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.save();
    g.translate(W / 2, H * 0.36);
    g.rotate(-0.08);
    g.lineWidth = Math.max(4, size * 0.07);
    g.lineJoin = "round";
    g.strokeStyle = "rgba(0,0,0,.95)";
    g.strokeText(to, 0, 0);
    const tw = g.measureText(to).width;
    for (let k = 0; k < 5; k++) {
      const x = -tw / 2 + Math.random() * tw;
      const y = size * 0.25;
      const len = 20 + Math.random() * 70;
      g.lineWidth = 2 + Math.random() * 2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (Math.random() - 0.5) * 3, y + len);
      g.stroke();
      g.beginPath();
      g.arc(x, y + len, g.lineWidth * 1.1, 0, 6.28);
      g.fill();
    }
    g.restore();

    // wipe
    let down = false;
    let last: { x: number; y: number } | null = null;
    let lastSq = 0;
    let lastCheck = 0;
    const small = document.createElement("canvas");
    small.width = 40;
    small.height = 80;
    const sg = small.getContext("2d", { willReadFrequently: true })!;
    const check = () => {
      sg.clearRect(0, 0, 40, 80);
      sg.drawImage(cv, 0, 0, 40, 80);
      const d = sg.getImageData(0, 0, 40, 80).data;
      let cleared = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] < 90) cleared++;
      if (cleared / 3200 > 0.24) finish();
    };
    const brush = (x: number, y: number) => {
      g.lineCap = "round";
      g.lineWidth = Math.max(54, W * 0.13);
      g.beginPath();
      g.moveTo(last?.x ?? x, last?.y ?? y);
      g.lineTo(x, y);
      g.stroke();
      last = { x, y };
      const now = performance.now();
      if (now - lastSq > 125) {
        lastSq = now;
        sfx("gh-squeak", { detune: (Math.random() - 0.5) * 300, gain: 0.8 });
      }
      if (now - lastCheck > 220) {
        lastCheck = now;
        check();
      }
    };
    const pd = (e: PointerEvent) => {
      down = true;
      last = null;
      try {
        cv.setPointerCapture(e.pointerId);
      } catch {
        /* fine */
      }
      brush(e.clientX, e.clientY);
    };
    const pm = (e: PointerEvent) => down && brush(e.clientX, e.clientY);
    const pu = () => {
      down = false;
      last = null;
      check();
    };
    cv.addEventListener("pointerdown", pd);
    cv.addEventListener("pointermove", pm);
    cv.addEventListener("pointerup", pu);
    cv.addEventListener("pointercancel", pu);
    return () => {
      cv.removeEventListener("pointerdown", pd);
      cv.removeEventListener("pointermove", pm);
      cv.removeEventListener("pointerup", pu);
      cv.removeEventListener("pointercancel", pu);
    };
  }

  return (
    <>
      <canvas ref={ref} className={`gh-fog${clear ? " is-clear" : ""}`} aria-label={`Fogged glass with ${to} written in it. Wipe it clear.`} role="img" />
      <div className={`gh-fogUi${clear ? " is-clear" : ""}`}>
        <p className="gh-hint">Wipe the glass</p>
        <button type="button" className="gh-btn" onClick={finish}>Open the door</button>
      </div>
    </>
  );
}
