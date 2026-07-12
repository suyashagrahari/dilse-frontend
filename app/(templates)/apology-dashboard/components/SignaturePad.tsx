"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

interface Props {
  onChange: (dataUrl: string) => void;
  /** Ink colour. Defaults to rose-deep. */
  color?: string;
  height?: number;
}

/**
 * Reusable canvas signature pad (mouse + touch).
 * Emits the drawn signature as a PNG data URL via `onChange` on every stroke-end,
 * and an empty string when cleared.
 */
export default function SignaturePad({ onChange, color = "#e64072", height = 170 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  // Size the canvas to its container (accounting for device pixel ratio).
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const w = parent.clientWidth;
    const h = height;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
  }, [color, height]);

  useEffect(() => {
    sizeCanvas();
    const onResize = () => {
      // Resizing wipes the canvas; reset state so the parent knows it's empty.
      sizeCanvas();
      hasInk.current = false;
      setEmpty(true);
      onChange("");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeCanvas]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    hasInk.current = true;
    if (empty) setEmpty(false);
  };

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (hasInk.current && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInk.current = false;
    setEmpty(true);
    onChange("");
  };

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ background: "#fff0f4", border: "1.5px dashed #ffb3c8" }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
        />
        {empty && (
          <span
            className="absolute inset-0 grid place-items-center pointer-events-none text-sm font-medium"
            style={{ color: "#c98da0" }}
          >
            ✍️ sign here with your finger
          </span>
        )}
      </div>
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ color: "#e64072", background: "#fff0f4", border: "1px solid #ffd6e2" }}
        >
          <Eraser size={13} /> Clear
        </button>
      </div>
    </div>
  );
}
