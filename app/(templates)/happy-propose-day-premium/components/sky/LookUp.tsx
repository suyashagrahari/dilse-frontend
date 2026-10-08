"use client";

// Scene 4 — "Look up." (the signature wow). The sender's line, a hush (the song ducks to 15 % where it can; on
// iOS the screen dims instead), one drone hum — then the swarm rises off the rooftops and flies the show:
// initials → a beating heart → a closed ring box → the box opens (gem in their stone colour) → and the
// question, which lands exactly on the song's drop (useSongDrop: riser → seek to the chorus → impact).
// Each new shape rings a formation chime a step higher. Skip jumps straight to the question (still on the drop).

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { SkipChip, usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";
import type { Formation } from "./DroneSky";
import { SKIP_TOP } from "./styles";
import { STONE_HUE, type Sky } from "./util";

export function LookUp({ sky, sticker, setFormation, setHush, onDone }: {
  sky: Sky;
  sticker: ReactNode;
  setFormation: (f: Formation | null) => void;
  setHush: (b: boolean) => void;
  onDone: () => void;
}) {
  const { sfx, music } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"line" | "show" | "asked">("line");
  const timers = useRef<number[]>([]);
  const dropped = useRef(false);

  const ask = useCallback(() => {
    if (dropped.current) return;
    dropped.current = true;
    timers.current.forEach(clearTimeout);
    drop(() => {
      // Long questions get more lines instead of a smaller (illegible in drones) size.
      const len = sky.question.length;
      setFormation({ kind: "text", text: sky.question, color: "#FFFFFF", maxLines: len > 40 ? 4 : 3 });
      sfx("sky-chime", { detune: 700, gain: 1.1 });
      setHush(false);
      setPhase("asked");
    });
  }, [drop, setFormation, sky.question, sfx, setHush]);

  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  });
  useEffect(() => {
    if (music?.canFade) music.fadeTo(0.15, 900);
    setHush(true);
    sfx("sky-hum", { gain: 1.4 });
    const swarm: { h: { stop: (ms?: number) => void } } = { h: { stop: () => {} } };
    const at = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, reduce ? ms * 0.6 : ms));
    at(1400, () => {
      setPhase("show");
      swarm.h = sfx("sky-swarm", { gain: 0.9 });
      setFormation({ kind: "rise" });
    });
    at(3600, () => { setFormation({ kind: "text", text: sky.initials, color: "#F4F8FF", maxLines: 1 }); sfx("sky-chime"); });
    at(6200, () => { setFormation({ kind: "heart", color: "#FF5C8A" }); sfx("sky-chime", { detune: 200 }); });
    at(8600, () => { setFormation({ kind: "box", open: false, stone: STONE_HUE[sky.stone] }); sfx("sky-chime", { detune: 400 }); });
    at(10000, () => { setFormation({ kind: "box", open: true, stone: STONE_HUE[sky.stone] }); sfx("sky-creak"); sfx("sparkle", { at: 0.35 }); });
    at(10900, () => askRef.current());
    const ts = timers.current;
    return () => {
      ts.forEach(clearTimeout);
      swarm.h.stop(1500);
    };
    // the show runs once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="sk-scene" aria-label="Look up" style={{ justifyContent: phase === "line" ? "center" : "flex-end", paddingBottom: "18vh" }}>
      {phase === "line" && <h2 className="sk-h sk-in" style={{ fontSize: "clamp(40px, 12vw, 80px)" }}>{sky.lookUp}</h2>}
      <p className="sk-sr" aria-live="polite">{phase === "asked" ? `In the sky: ${sky.question}` : phase === "show" ? "Hundreds of lights rise over the city." : ""}</p>
      {phase === "asked" && (
        <div className="sk-in" style={{ display: "grid", justifyItems: "center", gap: 12, animationDelay: "2.2s" }}>
          {sticker}
          <button type="button" className="sk-btn" onClick={onDone}>Answer the sky ▸</button>
        </div>
      )}
      {phase !== "asked" && <SkipChip onSkip={() => askRef.current()} label="Skip to the question ▸" delay={2500} style={SKIP_TOP} />}
    </section>
  );
}
