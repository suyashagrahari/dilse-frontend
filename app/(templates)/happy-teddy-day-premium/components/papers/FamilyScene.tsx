"use client";

// Chapter II · The family. His file comes with photographs: their own photos as paper-clipped exhibits on a mat,
// graded warm, stacked. Flick the top one away (drag, or tap) to see the next (sfx swoosh-soft as it flies, a
// paper-rustle as the next settles; visual twin: the card's flight and the stack shuffling up).

import { useRef, useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_love/types";

const LETTERS = "ABCDEFGHIJKL";

export function FamilyScene({ photos, n, teddy, onNext }: { photos: LovePhoto[]; n: string; teddy: string; onNext: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const list = photos.slice(0, 6);
  const [i, setI] = useState(0);
  const [fly, setFly] = useState<0 | -1 | 1>(0);
  const [dx, setDx] = useState(0);
  const drag = useRef<{ id: number; x0: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const last = i >= list.length - 1;

  const flick = (dir: -1 | 1) => {
    if (fly || last) return;
    setFly(dir);
    setDx(0);
    sfx("swoosh-soft", { gain: 0.6, pan: dir * 0.4 });
    sfx("paper-rustle", { at: 0.32, gain: 0.35 });
    haptic(10);
    window.setTimeout(() => {
      setFly(0);
      setI((k) => Math.min(list.length - 1, k + 1));
    }, reduce ? 120 : 460);
  };

  const onDown = (e: React.PointerEvent) => {
    if (last || fly) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x0: e.clientX, moved: false };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const x = e.clientX - d.x0;
    if (Math.abs(x) > 6) d.moved = true;
    setDx(x);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (!d.moved) return flick(-1);
    if (Math.abs(dx) > 80) flick(dx < 0 ? -1 : 1);
    else setDx(0);
  };

  const cancel = () => {
    drag.current = null;
    setDragging(false);
    setDx(0);
  };

  return (
    <section className="ap-scene ap-family" aria-label="The family photographs">
      <header className="ap-head">
        <p className="ap-eyebrow">{n} · Next of kin</p>
        <RevealText as="h2" text={`${teddy}'s new family.`} className="ap-display" delay={0.25} />
      </header>

      <div className="ap-stack" role="group" aria-roledescription="photo stack" aria-label={`Photo ${i + 1} of ${list.length}`}>
        {list
          .map((ph, k) => ({ ph, k }))
          .filter(({ k }) => k >= i && k < i + 3)
          .reverse()
          .map(({ ph, k }) => {
            const depth = k - i;
            const top = depth === 0;
            const tilt = k % 2 ? 2.2 : -1.8;
            const style: React.CSSProperties = top
              ? {
                  transform: fly
                    ? `translate(${fly * 130}vw, -4vh) rotate(${fly * 24}deg)`
                    : `translateX(${dx}px) rotate(${tilt + dx / 18}deg)`,
                  transition: dragging ? "none" : fly ? "transform .5s cubic-bezier(.55,0,.75,.4)" : "transform .5s cubic-bezier(.22,1,.36,1)",
                  zIndex: 3,
                }
              : { transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.045}) rotate(${-tilt * depth}deg)`, zIndex: 3 - depth };
            return (
              <figure
                key={k}
                className={`ap-exhibit${top ? " is-top" : ""}`}
                style={style}
                onPointerDown={top ? onDown : undefined}
                onPointerMove={top ? onMove : undefined}
                onPointerUp={top ? onUp : undefined}
                onPointerCancel={top ? cancel : undefined}
                aria-hidden={!top}
              >
                <i className="ap-clip" aria-hidden />
                <div className="ap-exhibitPhoto">
                  <CinematicPhoto photo={ph} grade="warm" frame="full" aspect="4 / 5" caption="" eager={depth < 2} focusPull={top} drift={18} />
                </div>
                <figcaption>
                  <span className="ap-exLabel">Exhibit {LETTERS[k]}</span>
                  {ph.caption ? <span className="ap-exCap">{ph.caption}</span> : null}
                </figcaption>
              </figure>
            );
          })}
      </div>

      <footer className="ap-foot">
        <p className="ap-count" aria-hidden>
          {i + 1} <span>/ {list.length}</span>
        </p>
        {last ? (
          <PremiumCTA tone="gold" cue="page-turn" onClick={onNext}>
            Care instructions
          </PremiumCTA>
        ) : (
          <button type="button" className="ap-textBtn" onClick={() => flick(-1)}>
            Flick it away · next photo
          </button>
        )}
      </footer>
    </section>
  );
}
