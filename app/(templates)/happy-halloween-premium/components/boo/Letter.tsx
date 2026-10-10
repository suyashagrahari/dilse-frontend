"use client";

// Stop 5 · Bat mail. A little bat flaps in carrying a rolled scroll tied with a
// pink ribbon and hovers, waiting (three cute bats keep it company). Tap the
// bat: it lets go, blows a heart and flies off, and the scroll unrolls into the
// sender's letter (legible Nunito, "Dear …" and the signature in handwriting).
// v4: the scroll is exactly the room that's left on the screen and the letter
// pages inside it (CSS columns, a transform per page: swipe, the ‹ › pager or
// "Turn the page" in the foot), so it never scrolls. Under it, a P.S. sealed
// with a pumpkin wax seal: crack it and the P.S. joins the letter's last page.

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, usePremium } from "../../../_valentine/kit/premium";
import { Bat } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, Header, Hint, NextButton } from "./ui";

const GAP = 40;

export default function Letter({ n, letter, step, total, onNext }: { n: Night; letter: string; step: number; total: number; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"bat" | "drop" | "open">("bat");
  const [ps, setPs] = useState(false);
  const psText = p.premium.psLetter?.trim() ?? "";

  const tapBat = () => {
    if (phase !== "bat") return;
    setPhase("drop");
    haptic(14);
    sfx("bn-flap", { gain: 0.7 });
    sfx("kiss", { gain: 0.35, at: 0.25 });
    window.setTimeout(() => {
      setPhase("open");
      sfx("paper-rustle", { gain: 0.6 });
      sfx("chime", { gain: 0.45, at: 0.4 });
    }, reduce ? 100 : 750);
  };

  // ── paging ──
  const view = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  // Auto-fit: a last page holding only a line or two (the signature alone) is
  // a sad page; shrink the type a notch at a time (never under 14.5 px) until
  // it isn't, or until the letter fits one page.
  const [fs, setFs] = useState(0);
  const end = useRef<HTMLSpanElement>(null);
  const toLast = useRef(false);
  const measure = useCallback(() => {
    const v = view.current;
    const f = flow.current;
    if (!v || !f) return;
    const vw = Math.floor(v.clientWidth);
    setW(vw);
    const count = Math.max(1, Math.round((f.scrollWidth + GAP) / (vw + GAP)));
    setPages(count);
    // the P.S. lands on the last page: go there once it has re-flowed
    if (toLast.current) {
      toLast.current = false;
      setPage(count - 1);
    } else setPage((pg) => Math.min(pg, count - 1));
    const e = end.current;
    if (e && count > 1) {
      const vr = v.getBoundingClientRect();
      const fill = (e.getBoundingClientRect().top - vr.top) / vr.height;
      const cur = parseFloat(getComputedStyle(f).getPropertyValue("--lf")) || parseFloat(getComputedStyle(f.querySelector(".bn-para") ?? f).fontSize) || 17;
      if (fill < 0.3 && cur > 14.6) setFs(Math.max(14.5, cur - 0.5));
    }
  }, []);
  useLayoutEffect(() => {
    if (phase !== "open") return;
    measure();
    const v = view.current;
    if (!v) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(v);
    // webfonts change the flow once they land
    void document.fonts?.ready.then(() => measure());
    return () => ro.disconnect();
  }, [phase, measure, ps, w, fs]);

  const turn = (d: number) => {
    setPage((pg) => {
      const np = Math.max(0, Math.min(pages - 1, pg + d));
      if (np !== pg) {
        sfx("page-turn", { gain: 0.5 });
        haptic(6);
      }
      return np;
    });
  };
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const crack = () => {
    if (ps) return;
    toLast.current = true;
    setPs(true);
    haptic([10, 30, 12]);
    sfx("wax-crack", { gain: 0.6 });
    sfx("sparkle", { gain: 0.4, at: 0.15 });
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.75 }, count: 14, emojis: ["💜", "🧡", "✨"] });
  };

  const paras = letter.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const last = page >= pages - 1;

  return (
    <div className={`bn-scene bn-letter is-${phase}`}>
      <Header step={step} total={total} kicker="Stop 5 · Bat mail" title={phase === "open" ? `For you, ${n.recipient}` : "A bat brought you something"} sub={phase === "bat" ? "It won't let go until you tap it." : undefined} />
      <Gif src={GIF.cuteBats} size={86} tilt={-4} className={`bn-letterBats${phase === "open" ? " is-up" : ""}`} />

      <AnimatePresence>
        {phase !== "open" && (
          <motion.button
            type="button"
            className="bn-batBtn"
            onClick={tapBat}
            aria-label="Tap the bat to get the letter"
            initial={{ x: -260, y: -120, rotate: -20, opacity: 0 }}
            animate={phase === "bat" ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x: 220, y: -320, rotate: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={phase === "bat" ? { type: "spring", stiffness: 70, damping: 12 } : { duration: 0.8, ease: "easeIn" }}
          >
            <span className="bn-batBob">
              <Bat size={210} carry={phase === "bat" ? "scroll" : "heart"} />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      {phase === "bat" && <Hint>Tap the bat 🦇</Hint>}

      {phase === "open" && (
        <motion.article
          className="bn-scroll"
          initial={reduce ? { opacity: 0 } : { scaleY: 0.08, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 90, damping: 16 }}
        >
          <span className="bn-rod bn-rodTop" aria-hidden />
          <div className="bn-scrollBody">
            <div
              className="bn-pageView"
              ref={view}
              onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
              onPointerUp={(e) => {
                const s = swipe.current;
                swipe.current = null;
                if (!s) return;
                const dx = e.clientX - s.x;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) turn(dx < 0 ? 1 : -1);
              }}
              onPointerCancel={() => (swipe.current = null)}
            >
              <div
                className="bn-pages"
                ref={flow}
                style={{ columnWidth: w ? `${w}px` : undefined, columnGap: `${GAP}px`, transform: `translate3d(${-page * (w + GAP)}px,0,0)`, ...(fs ? { ["--lf" as string]: `${fs}px` } : {}) }}
                aria-live="polite"
              >
                <p className="bn-dear">Dear {n.recipient},</p>
                {paras.map((t, i) => (
                  <p key={i} className="bn-para">
                    {t}
                  </p>
                ))}
                {n.sender && <p className="bn-sign">— {n.sender} 🦇</p>}
                {ps && psText && <p className="bn-psText">{psText}</p>}
                <span ref={end} className="bn-end" aria-hidden />
              </div>
            </div>
            {pages > 1 && (
              <div className="bn-pager">
                <button type="button" onClick={() => turn(-1)} disabled={page === 0} aria-label="Previous page">
                  ‹
                </button>
                <span>
                  {Array.from({ length: pages }, (_, i) => (
                    <i key={i} className={i === page ? "is-on" : undefined} />
                  ))}
                </span>
                <button type="button" onClick={() => turn(1)} disabled={last} aria-label="Next page">
                  ›
                </button>
              </div>
            )}
          </div>
          <span className="bn-rod bn-rodBot" aria-hidden />
          <Gif src={GIF.spookyLove} size={70} tilt={10} className="bn-scrollGif" />
        </motion.article>
      )}

      {phase === "open" && psText && (
        <div className="bn-ps">
          <button type="button" className={`bn-psSeal${ps ? " is-open" : ""}`} onClick={crack} disabled={ps}>
            <span className="bn-wax" aria-hidden>
              {ps ? "💌" : "🎃"}
            </span>
            <span>{ps ? "P.S. unsealed. It's on the last page" : "Tap the seal for a P.S."}</span>
          </button>
        </div>
      )}

      <div className="bn-foot">
        {phase === "open" && (
          // one button that changes its words (no remount, no re-entrance)
          <NextButton quiet={!last} onClick={() => (last ? onNext() : turn(1))} delay={0.7}>
            {last ? "Next stop" : "Turn the page"}
          </NextButton>
        )}
      </div>
      <style>{LETTER_CSS}</style>
    </div>
  );
}

const LETTER_CSS = `
.bn-batBtn { all: unset; cursor: pointer; flex: 1 1 0; min-height: 0; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; }
.bn-batBtn svg { width: clamp(150px, 30dvh, 210px); height: auto; }
.bn-batBtn:focus-visible { outline: 3px solid #fff; outline-offset: 6px; border-radius: 30px; }
.bn-batBob { display: inline-block; animation: bn-hover 1.8s ease-in-out infinite; }
@keyframes bn-hover { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
.bn-letterBats { position: absolute !important; left: 8px; top: calc(var(--bn-top) + 70px); z-index: 1; transition: top .6s ease, left .6s ease; }
.bn-letterBats.is-up { top: calc(var(--bn-top) + 2px); left: 4px; width: 64px !important; height: 64px !important; }
.bn-scroll { position: relative; width: min(100%, 420px); transform-origin: 50% 0; flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; }
.bn-rod { flex: none; display: block; height: 20px; margin: 0 -10px; border-radius: 12px; background: linear-gradient(180deg, #F2D7A6, #D9B98A); box-shadow: 0 0 0 3px #C29A62 inset, 0 6px 12px rgba(30,16,60,.35); position: relative; z-index: 2; }
.bn-scrollBody { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; background: ${BN.cream}; color: ${BN.ink}; padding: clamp(12px, 2dvh, 18px) 20px 8px; text-align: left; margin: -6px 0; box-shadow: 0 16px 30px rgba(30,16,60,.35);
  background-image: radial-gradient(circle at 12% 8%, rgba(255,158,196,.18), transparent 30%), radial-gradient(circle at 90% 90%, rgba(201,182,255,.25), transparent 34%); }
.bn-pageView { flex: 1 1 0; min-height: 0; overflow: hidden; position: relative; touch-action: pan-y; }
.bn-pages { height: 100%; column-fill: auto; transition: transform .45s cubic-bezier(.3,.8,.3,1); will-change: transform; }
.bn-dear { margin: 0 0 8px; font: 400 clamp(20px, 3.2dvh, 24px)/1.1 ${HAND}; color: ${BN.orangeDeep}; }
.bn-para { margin: 0 0 10px; font: 600 var(--lf, clamp(15px, 2.3dvh, 17px))/1.5 var(--font-bn-body), sans-serif; text-wrap: pretty; }
.bn-end { display: block; height: 0; }
.bn-sign { margin: 4px 0 0; text-align: right; font: 400 clamp(20px, 3.2dvh, 24px)/1.1 ${HAND}; color: ${BN.lilacDeep}; break-inside: avoid; }
.bn-psText { margin: 14px 0 0; padding: 12px 14px; border-radius: 16px; background: #FFE3EF; color: ${BN.ink}; font: 400 clamp(17px, 2.6dvh, 20px)/1.3 ${HAND}; box-shadow: 0 0 0 3px #fff inset; white-space: pre-line; break-inside: avoid; }
.bn-pager { flex: none; display: flex; align-items: center; justify-content: center; gap: 10px; padding-top: 4px; }
.bn-pager button { all: unset; cursor: pointer; display: grid; place-items: center; width: 36px; height: 32px; border-radius: 12px; font: 800 22px/1 var(--font-bn-body), sans-serif; color: ${BN.lilacDeep}; -webkit-tap-highlight-color: transparent; }
.bn-pager button[disabled] { opacity: .25; cursor: default; }
.bn-pager button:focus-visible { outline: 2px solid ${BN.lilacDeep}; }
.bn-pager span { display: flex; gap: 6px; }
.bn-pager i { width: 8px; height: 8px; border-radius: 50%; background: rgba(142,111,224,.3); transition: transform .3s ease, background .3s ease; }
.bn-pager i.is-on { background: ${BN.orange}; transform: scale(1.3); }
.bn-scrollGif { position: absolute; right: -14px; bottom: 2px; z-index: 3; }
.bn-ps { flex: none; width: min(100%, 400px); display: grid; justify-items: center; }
.bn-psSeal { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 4px 16px 4px 4px; border-radius: 99px; background: ${BN.card}; color: ${BN.ink};
  font: 800 14px/1.1 var(--font-bn-body), sans-serif; box-shadow: 0 5px 0 #E6D2B4, 0 10px 22px rgba(30,16,60,.3); }
.bn-psSeal.is-open { cursor: default; background: #FFE3EF; }
.bn-psSeal:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.bn-wax { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; font-size: 19px; background: radial-gradient(circle at 38% 32%, #FFB86E, ${BN.orangeDeep}); box-shadow: inset 0 -3px 4px rgba(0,0,0,.2); animation: bn-wiggle 2.8s ease-in-out infinite; }
.bn-psSeal.is-open .bn-wax { animation: none; background: #fff; }
@media (prefers-reduced-motion: reduce) { .bn-batBob, .bn-wax { animation: none; } .bn-pages { transition: none; } }
`;
