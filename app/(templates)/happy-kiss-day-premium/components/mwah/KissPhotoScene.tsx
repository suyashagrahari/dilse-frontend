"use client";

// Scene 1 · Kiss the screen. His photo in a taped polaroid; she presses
// anywhere on it and a lipstick print stamps there with a "mwah", a heart
// burst and a buzz. Three kisses fill the heart meter, the bear sticker goes
// from blowing kisses to blushing, and the booth opens. A "Kiss it for me"
// button does the same thing for anyone who'd rather tap a button.

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { CroppedPhoto, burst, haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { LipPrint } from "./LipPrint";
import { GIF, initialOf, type Mwah } from "./model";
import { Gif, Kicker, Puffy, PuffyHeart, Quiet, Scene, Sub, Title, Washi, popIn, rise } from "./ui";

type Print = { x: number; y: number; rot: number; id: number };
const NEED = 3;
const LINES = ["Mwah! One down 😚", "Two! Someone's blushing…", "Three. Okay, now I'm blushing 🙈"];

export default function KissPhotoScene({ m, gif, onNext }: { m: Mwah; gif: string; onNext: (n: number) => void }) {
  const [prints, setPrints] = useState<Print[]>([]);
  const photoRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const n = prints.length;
  const full = n >= NEED;

  const kiss = (x: number, y: number) => {
    if (n >= 6) return;
    setPrints((ps) => [...ps, { x, y, rot: Math.random() * 30 - 15, id: nextId.current++ }]);
    sfx("kmw-mwah", { gain: 0.9, detune: (n % 3) * 120 });
    haptic(n + 1 === NEED ? [15, 40, 25] : 12);
    const r = photoRef.current?.getBoundingClientRect();
    if (r) burst({ kind: "hearts", origin: { x: (r.left + (r.width * x) / 100) / window.innerWidth, y: (r.top + (r.height * y) / 100) / window.innerHeight }, count: n + 1 === NEED ? 26 : 12, spread: 0.22 });
    if (n + 1 === NEED) window.setTimeout(() => sfx("chime-cascade", { gain: 0.5 }), 220);
  };
  const press = (e: React.PointerEvent) => {
    const r = photoRef.current?.getBoundingClientRect();
    if (!r) return;
    kiss(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <Scene label="Kiss the screen" className="km-kp">
      <motion.div {...rise(0)}>
        <Kicker>Booth rule no. 1</Kicker>
      </motion.div>
      <motion.div {...rise(1)}>
        <Title>
          Kiss {m.sender}&rsquo;s <em>photo</em>
        </Title>
      </motion.div>
      <motion.div {...rise(2)}>
        <Sub>Tap anywhere on the photo. Three kisses, please. {m.sender} is counting.</Sub>
      </motion.div>

      <motion.div className="km-kpStage" {...popIn(3)}>
        <div className="km-polaroid km-kpPol">
          <Washi style={{ left: "50%", top: -10, transform: "translateX(-50%) rotate(-4deg)" }} />
          <div
            ref={photoRef}
            className="km-kpPhoto"
            onPointerDown={press}
            onContextMenu={(e) => e.preventDefault()}
            role="button"
            tabIndex={0}
            aria-label={`${m.sender}'s photo. Tap to leave a kiss. ${n} of ${NEED}.`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), kiss(35 + Math.random() * 30, 35 + Math.random() * 30))}
          >
            {m.kissPhoto ? <CroppedPhoto photo={m.kissPhoto} eager /> : <span className="km-kpEmpty">{initialOf(m.sender)}</span>}
            {!n && <span className="km-kpTarget" aria-hidden />}
            {prints.map((p) => (
              <span key={p.id} className="km-kpPrint" style={{ left: `${p.x}%`, top: `${p.y}%`, ["--r" as string]: `${p.rot}deg` }} aria-hidden>
                <LipPrint color={m.S.c} lipstick={m.lipstick} size={84} seed={p.id * 7} />
              </span>
            ))}
          </div>
          <p className="km-polCap">{m.kissPhoto?.caption || `${m.sender}, waiting for kisses`}</p>
        </div>
        <span className="km-kpGif">
          <Gif src={full ? GIF.blush : gif} size={92} tilt={8} eager />
        </span>
      </motion.div>

      <div className="km-meter" role="progressbar" aria-valuemin={0} aria-valuemax={NEED} aria-valuenow={Math.min(n, NEED)} aria-label="Kisses">
        {Array.from({ length: NEED }, (_, i) => (
          <span key={i} className={`km-meterH${i < n ? " is-on" : ""}`}>
            <PuffyHeart size={34} color={i < n ? m.S.c : "#FFD1DF"} />
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {n > 0 && (
          <motion.p key={Math.min(n, NEED)} className="km-kpLine km-hand" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {LINES[Math.min(n, NEED) - 1]}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="km-foot">
        {full ? (
          <motion.div {...popIn(0)}>
            <Puffy onClick={() => onNext(n)}>Open the booth 💋</Puffy>
          </motion.div>
        ) : (
          <Quiet onClick={() => kiss(30 + Math.random() * 40, 30 + Math.random() * 40)}>Kiss it for me</Quiet>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-kpStage { position: relative; margin-top: 6px; }
.km-kpPol { width: min(270px, 70vw); transform: rotate(-2.5deg); }
.km-kpPhoto { position: relative; aspect-ratio: 4 / 4.4; overflow: hidden; border-radius: 3px; cursor: pointer; touch-action: manipulation; background: #FFE3EC; }
.km-kpPhoto:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 3px; }
.km-kpTarget { position: absolute; left: 50%; top: 50%; width: 96px; height: 96px; margin: -48px 0 0 -48px; border-radius: 50%; pointer-events: none;
  border: 3px dashed rgba(255,255,255,.9); box-shadow: 0 0 0 999px rgba(255,79,134,.06); animation: km-beat 1.6s ease-in-out infinite; }
.km-kpGif { position: absolute; right: -34px; bottom: 26px; z-index: 4; }
.km-meter { display: flex; gap: 10px; justify-content: center; margin-top: 6px; }
.km-meterH { transition: transform .3s var(--km-spring); }
.km-meterH.is-on { transform: scale(1.18) rotate(-6deg); animation: km-beat 1.4s ease-in-out 1; }
.km-kpLine { margin: 0; font-size: 20px; color: var(--km-deep); min-height: 26px; }
@media (max-width: 380px) { .km-kpGif { right: -14px; } }
@media (min-width: 768px) { .km-kpPol { width: 320px; } }
@media (prefers-reduced-motion: reduce) { .km-kpTarget, .km-meterH.is-on { animation: none; } .km-kpPrint { animation-duration: .01s; } }
`;
