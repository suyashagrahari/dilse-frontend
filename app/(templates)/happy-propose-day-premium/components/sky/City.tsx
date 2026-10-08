"use client";

// Scene 3 — City of Memories (the photo montage, in this world's own style). Up to six dark windows in the near
// skyline glow with a hint; tapping one switches it on ("sky-click") and the camera pushes into it ("sky-hum"):
// the window IS the photo, with the moment as a neon sign. "Show me all" tours every window on its own.
// After the last: "Every light in this city is a day with you."

import { useEffect, useRef } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { CroppedPhoto } from "../../../_valentine/kit";
import { SKIP_TOP } from "./styles";
import type { Sky } from "./util";

export function MemoryPush({ sky, open, onClose, onNext }: { sky: Sky; open: number; onClose: () => void; onNext: (() => void) | null }) {
  const m = sky.memories[open];
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  if (!m) return null;
  return (
    <div className="sk-push is-in" role="dialog" aria-modal="true" aria-label={`Memory ${open + 1}: ${m.what}`} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "grid", justifyItems: "center" }}>
        <div className="sk-frame" key={open}>
          {m.photo ? <CroppedPhoto photo={m.photo} alt={m.what} eager /> : <span style={{ display: "grid", placeItems: "center", height: "100%", fontSize: 64 }}>💛</span>}
        </div>
        <div className="sk-neon sk-in" style={{ animationDelay: ".35s" }}>
          {m.when && <small>{m.when}</small>}
          {m.what && <b>{m.what}</b>}
        </div>
        <div className="sk-row2">
          <button ref={closeRef} type="button" className="sk-ghost" onClick={onClose}>◂ Back to the city</button>
          {onNext && <button type="button" className="sk-btn" onClick={onNext}>Next window ▸</button>}
        </div>
      </div>
    </div>
  );
}

export function City({ sky, lit, open, setOpen, tour, setTour, onDone }: {
  sky: Sky;
  lit: boolean[];
  open: number | null;
  setOpen: (i: number | null) => void;
  tour: boolean;
  setTour: (b: boolean) => void;
  onDone: () => void;
}) {
  const { sfx } = usePremium();
  const n = sky.memories.length;
  const count = lit.filter(Boolean).length;
  const all = n > 0 && count >= n;

  // The tour: open each unlit window in turn, ~2.8 s apiece.
  useEffect(() => {
    if (!tour) return;
    const nextIdx = lit.findIndex((v) => !v);
    const t = window.setTimeout(() => {
      if (nextIdx < 0) {
        setOpen(null);
        setTour(false);
        return;
      }
      setOpen(nextIdx);
    }, open === null ? 300 : 2800);
    return () => window.clearTimeout(t);
  }, [tour, lit, open, setOpen, setTour]);

  useEffect(() => {
    const h = sfx("sky-city", { gain: 0.8 });
    return () => h.stop(1200);
  }, [sfx]);

  if (!n) {
    return (
      <section className="sk-scene" aria-label="The city">
        <p className="sk-kick">The city</p>
        <h2 className="sk-h">Every light down there is a day with you.</h2>
        <button type="button" className="sk-btn" onClick={onDone} style={{ marginTop: 20 }}>Next ▸</button>
      </section>
    );
  }

  return (
    <section className="sk-scene" aria-label="The city of memories">
      <p className="sk-kick">The city of memories</p>
      <h2 className="sk-h" style={{ fontSize: "clamp(28px, 7.4vw, 46px)" }}>{all ? "Every light in this city is a day with you." : "Switch on the windows."}</h2>
      <p className="sk-hint" style={{ marginTop: 10 }}>{all ? " " : `${count} of ${n} · tap a glowing window in the skyline`}</p>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {!all && !tour && <button type="button" className="sk-ghost" onClick={() => setTour(true)}>Show me all</button>}
        {all && <button type="button" className="sk-btn sk-in" onClick={onDone}>Next ▸</button>}
      </div>
      {!all && <SkipChip onSkip={onDone} delay={4000} style={SKIP_TOP} />}
    </section>
  );
}
