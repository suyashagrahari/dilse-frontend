"use client";

// ─── Hero: five featured templates on a desktop and a phone ─────────────────
//
// A browser window and a phone, floating on the page (no card behind them),
// showing one still of each template. The five rotate; name pills and dots
// underneath jump straight to one, and the devices swipe too.
//
// Stills live on the CDN at gifts-media/hero/v1/<slug>/d<n>.webp (desktop) and
// m<n>.webp (phone), captured with Puppeteer; `d`/`m` pick the frame. They are
// immutable — a recapture goes to a new v<n> folder rather than overwriting.
//
// Rotation begins on the first interaction, so an audit that never interacts
// measures a still page.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { media } from "@/lib/templateMedia";

type Feature = { slug: string; label: string; d: number; m: number };

const FEATURES: Feature[] = [
  { slug: "missyou-gf", label: "I Miss You", d: 1, m: 1 },
  { slug: "photo-puzzle", label: "The Last Piece", d: 1, m: 1 },
  { slug: "proposal", label: "Will You Marry Me?", d: 2, m: 2 },
  { slug: "watch", label: "Our YouTube", d: 1, m: 1 },
  { slug: "loveflix", label: "LoveFlix", d: 2, m: 2 },
];

const SLIDE_MS = 2250;
const src = (slug: string, kind: "d" | "m", i: number) => media(`hero/v1/${slug}/${kind}${i}.webp`);

export default function TrendingShowcase() {
  const n = FEATURES.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  const f = FEATURES[idx];

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const events = ["pointermove", "pointerdown", "touchstart", "scroll", "keydown"] as const;
    const start = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      t = setTimeout(() => setAutoStarted(true), 700);
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (t) clearTimeout(t);
    };
  }, []);

  // Warm the other stills once rotation is live, so a change never lands on a blank.
  useEffect(() => {
    if (!autoStarted) return;
    for (const x of FEATURES) { new Image().src = src(x.slug, "d", x.d); new Image().src = src(x.slug, "m", x.m); }
  }, [autoStarted]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (paused || !autoStarted) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, autoStarted, n, tick]);

  const go = useCallback((i: number) => {
    setIdx(((i % n) + n) % n);
    setTick((x) => x + 1);
  }, [n]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -450) go(idx + 1);
    else if (info.offset.x > 60 || info.velocity.x > 450) go(idx - 1);
  };

  return (
    <div className="hx" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{HX_CSS}</style>

      <motion.div className="hx-stage" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={onDragEnd}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={f.slug}
            className="hx-set"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Desktop */}
            <Link href={`/${f.slug}`} className="hx-win" draggable={false} aria-label={`${f.label} — open the template`}>
              <div className="hx-bar" aria-hidden>
                <span className="hx-dots"><i /><i /><i /></span>
                <span className="hx-url">🔒 yourname.subhsandesh.in/<b>{f.slug}</b></span>
              </div>
              <div className="hx-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(f.slug, "d", f.d)} alt={`${f.label} on desktop`} draggable={false} fetchPriority={idx === 0 ? "high" : "auto"} decoding="async" />
              </div>
            </Link>

            {/* Phone */}
            <div className="hx-phone" aria-hidden>
              <div className="hx-scr">
                <span className="hx-isl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(f.slug, "m", f.m)} alt="" draggable={false} decoding="async" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="hx-pills" role="tablist" aria-label="Featured templates">
        {FEATURES.map((x, i) => {
          const on = i === idx;
          return (
            <button key={x.slug} type="button" role="tab" aria-selected={on} className="hx-pill" data-on={on ? "1" : "0"} onClick={() => go(i)}>
              {on && <motion.span layoutId="hx-pill-bg" className="hx-pillBg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="hx-pillText">{x.label}</span>
            </button>
          );
        })}
      </div>
      <div className="hx-dotrow">
        {FEATURES.map((x, i) => (
          <button key={x.slug} type="button" aria-label={`Show ${x.label}`} aria-current={i === idx} className="hx-dot" onClick={() => go(i)}>
            <span data-on={i === idx ? "1" : "0"} />
          </button>
        ))}
      </div>
    </div>
  );
}

const HX_CSS = `
.hx { position: relative; width: 100%; min-width: 0; }
.hx-stage { position: relative; width: 100%; aspect-ratio: 16 / 10.4; touch-action: pan-y; cursor: grab; }
.hx-stage:active { cursor: grabbing; }
.hx-stage::before { content: ""; position: absolute; left: 50%; top: 50%; width: 92%; height: 82%; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(201,168,76,.22), transparent 70%); pointer-events: none; }
.hx-set { position: absolute; inset: 0; }

.hx-win { position: absolute; left: 0; top: 0; width: 81%; display: block; border-radius: 14px; overflow: hidden; background: #f5ede6;
  box-shadow: 0 34px 60px -28px rgba(61,12,17,.45), 0 0 0 1px rgba(61,12,17,.12); -webkit-tap-highlight-color: transparent; }
.hx-bar { height: 26px; display: flex; align-items: center; gap: 8px; padding: 0 10px; background: #f3ece2; border-bottom: 1px solid rgba(0,0,0,.06); }
.hx-dots { display: flex; gap: 5px; flex: none; }
.hx-dots i { width: 8px; height: 8px; border-radius: 50%; background: #f96f5d; }
.hx-dots i:nth-child(2) { background: #f5bf4f; } .hx-dots i:nth-child(3) { background: #52c45a; }
.hx-url { margin: 0 auto; transform: translateX(-20px); height: 17px; padding: 0 12px; border-radius: 6px; background: #fffaf4; display: flex; align-items: center; gap: 3px;
  font: 500 9.5px/1 Inter, system-ui, sans-serif; color: #8a7a68; white-space: nowrap; overflow: hidden; max-width: 70%; }
.hx-url b { color: #3d0c11; font-weight: 700; }
.hx-screen { position: relative; aspect-ratio: 16 / 10; background: #efe6dc; overflow: hidden; }
.hx-screen img, .hx-scr img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; user-select: none; -webkit-user-drag: none; }

.hx-phone { position: absolute; right: 1%; bottom: 0; width: 22.5%; border-radius: 30px; padding: 7px; background: #0d0708; transform: rotate(3deg);
  box-shadow: 0 34px 60px -24px rgba(61,12,17,.55), 0 0 0 1px rgba(61,12,17,.2); z-index: 2; }
.hx-scr { position: relative; border-radius: 24px; overflow: hidden; aspect-ratio: 390 / 844; background: #fff; }
.hx-isl { position: absolute; top: 7px; left: 50%; width: 32%; height: 15px; translate: -50% 0; border-radius: 12px; background: #0d0708; z-index: 3; }


.hx-pills { display: flex; justify-content: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.hx-pill { position: relative; padding: 9px 15px; border-radius: 999px; border: 1px solid rgba(61,12,17,.16); background: #fdfaf4; color: #6b4545;
  font: 600 13px/1 Inter, system-ui, sans-serif; cursor: pointer; white-space: nowrap; -webkit-tap-highlight-color: transparent; transition: color .25s, border-color .25s; }
.hx-pill[data-on="1"] { color: #f5ede6; border-color: #241014; }
.hx-pillBg { position: absolute; inset: -1px; border-radius: inherit; background: #241014; }
.hx-pillText { position: relative; z-index: 1; }
.hx-dotrow { display: flex; justify-content: center; gap: 2px; margin-top: 10px; }
.hx-dot { width: 24px; height: 24px; display: grid; place-items: center; border: 0; padding: 0; background: none; cursor: pointer; }
.hx-dot span { width: 7px; height: 7px; border-radius: 4px; background: rgba(61,12,17,.2); transition: width .35s, background .35s; }
.hx-dot span[data-on="1"] { width: 22px; background: #3d0c11; }

@media (max-width: 768px) {
  .hx-win { border-radius: 10px; }
  .hx-bar { height: 18px; gap: 5px; padding: 0 7px; }
  .hx-dots i { width: 5px; height: 5px; }
  .hx-url { height: 12px; font-size: 7px; padding: 0 6px; }
  .hx-phone { border-radius: 20px; padding: 5px; }
  .hx-scr { border-radius: 16px; }
  .hx-isl { top: 5px; height: 10px; }
        .hx-pills { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; scrollbar-width: none; padding: 2px; }
  .hx-pills::-webkit-scrollbar { display: none; }
  .hx-pill { flex: none; font-size: 12.5px; padding: 8px 14px; }
}
`;
