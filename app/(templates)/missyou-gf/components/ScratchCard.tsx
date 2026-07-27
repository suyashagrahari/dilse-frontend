"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "./Confetti";

// Premium foil scratch-off: drag to erase a shimmering rose-gold foil and uncover
// the hidden coupon. Strokes are continuous (line between points) for a smooth feel,
// the foil dissolves once ~45% is cleared, and a little burst celebrates the reveal.
export default function ScratchCard({ reveal }: { reveal: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    // shimmering rose-gold foil
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#e7a9b4");
    grad.addColorStop(0.4, "#d98f9c");
    grad.addColorStop(0.7, "#e6b98f");
    grad.addColorStop(1, "#d8a56f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    // diagonal sheen
    const sheen = ctx.createLinearGradient(0, height, width, 0);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.28)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
    // label
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "600 22px 'Dancing Script', cursive";
    ctx.textAlign = "center";
    ctx.fillText("scratch me ♥", width / 2, height / 2 - 6);
    ctx.font = "600 12px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("drag your finger across", width / 2, height / 2 + 18);
  }, []);

  const stroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const px = x - rect.left;
    const py = y - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 52;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(px, py, 26, 0, Math.PI * 2);
    ctx.fill();
    last.current = { x: px, y: py };
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    const total = data.length / 40;
    for (let i = 3; i < data.length; i += 40) if (data[i] === 0) cleared++;
    if (cleared / total > 0.65 && !done) {
      setDone(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      {confetti && <Confetti originX={50} originY={50} count={26} />}
      <div
        className="relative w-full rounded-3xl p-[3px]"
        style={{ background: "linear-gradient(135deg,var(--mu-rose),var(--mu-gold))", boxShadow: "var(--mu-shadow-paper)" }}
      >
        <div className="relative w-full overflow-hidden rounded-[21px]" style={{ background: "linear-gradient(180deg,var(--mu-paper),var(--mu-paper-2))" }}>
          {/* revealed coupon — in normal flow so the card grows to fit long secrets */}
          <div className={`relative z-0 flex min-h-[300px] flex-col items-center justify-center px-6 py-9 text-center transition-transform duration-500 ${done ? "scale-100" : "scale-[0.98]"}`}>
            <span className="mu-eyebrow mb-3">a little coupon</span>
            <p className="mu-script text-3xl leading-tight mu-rose-deep sm:text-4xl">{reveal || "good for one very long hug ♥"}</p>
            <p className="mu-serif mt-3 text-sm mu-muted">redeemable the second i see you</p>
          </div>
          {/* foil */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${done ? "pointer-events-none opacity-0" : "opacity-100 cursor-grab"}`}
            onPointerDown={(e) => { drawing.current = true; last.current = null; stroke(e.clientX, e.clientY); }}
            onPointerMove={(e) => { if (drawing.current) stroke(e.clientX, e.clientY); }}
            onPointerUp={() => { drawing.current = false; last.current = null; checkProgress(); }}
            onPointerLeave={() => { drawing.current = false; last.current = null; }}
          />
        </div>
      </div>
    </div>
  );
}
