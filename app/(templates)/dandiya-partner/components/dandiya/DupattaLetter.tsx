"use client";

// Scene 6 — "A note for you". The emotional high point.
//
// A sealed ivory envelope waits (./LetterEnvelope.tsx): she taps the wax seal,
// the flap lifts, the letter slides out, and it opens up inside a bandhani
// odhni frame — a letter on warm handmade paper: a zari border with little
// corner flowers, a faint kalash watermark, a clay diya in the corner whose
// light flickers across the page. The sender's words appear as if they are
// being written, in an Indian hand (Kalam), and it is signed off with a tiny
// pair of crossed dandiya sticks.
//
// A long letter is split into folds that are measured against the real page
// (never a scroll, never tiny text): each fold turns like folded cloth, a row
// of little mirrors shows where she is (tap one to go back), and the pill only
// appears once the last fold has been written. Reduced motion: everything is
// simply there, no writing, no flicker.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Diya } from "./art";
import LetterEnvelope from "./LetterEnvelope";
import { DD_HAND, ddHand } from "./fonts";
import { useDd, useNext } from "./stage";
import { BANDHANI, DD, Hint, MIRROR_ROW, RoomTitle } from "./ui";

/** Words and the spaces between them (newlines kept), so a page break never splits a word. */
function tokenize(text: string): string[] {
  return (
    text
      .replace(/\r/g, "")
      .trim()
      .match(/\S+|\s+/g) ?? []
  );
}

type Range = [number, number];

/**
 * Split the tokens into folds that fit the page, measured on a hidden twin of the page.
 * The first fold carries "Dear …", the last the signature. A break prefers a paragraph or a
 * sentence end in the last 40% of a fold.
 */
function measurePages(tokens: string[], fits: (s: number, e: number, first: boolean, last: boolean) => boolean): Range[] {
  const n = tokens.length;
  if (!n) return [[0, 0]];
  const out: Range[] = [];
  let s = 0;
  for (let guard = 0; s < n && guard < 60; guard++) {
    const first = out.length === 0;
    if (fits(s, n, first, true)) {
      out.push([s, n]);
      break;
    }
    let lo = s + 1;
    let hi = n - 1;
    let best = s + 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fits(s, mid, first, false)) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    let e = best;
    const floor = s + Math.ceil((best - s) * 0.72);
    for (let k = best; k > floor; k--) {
      const prev = tokens[k - 1] ?? "";
      if (/\n/.test(tokens[k] ?? "") || /[.!?…]["')]*$/.test(prev)) {
        e = k;
        break;
      }
    }
    out.push([s, e]);
    s = e;
    while (s < n && /^\s+$/.test(tokens[s])) s++;
  }
  // No orphan: a last fold holding a line or two shares the previous fold's words instead.
  const k = out.length - 1;
  if (k >= 1) {
    const [ps, pe] = out[k - 1];
    const [, le] = out[k];
    if (le - pe < (pe - ps) * 0.3) {
      const skip = (i: number) => {
        while (i < n && /^\s+$/.test(tokens[i])) i++;
        return i;
      };
      const ok = (e: number) => e > ps && e < le && fits(ps, e, k - 1 === 0, false) && fits(skip(e), le, false, true);
      const target = ps + Math.round((le - ps) * 0.55);
      let pick = -1;
      for (let d = 0; d < (le - ps) * 0.3 && pick < 0; d++) {
        for (const e of [target + d, target - d]) {
          const prev = tokens[e - 1] ?? "";
          if (pick < 0 && (/\n/.test(tokens[e] ?? "") || /[.!?…,]["')]*$/.test(prev)) && ok(e)) pick = e;
        }
      }
      if (pick < 0 && ok(target)) pick = target;
      if (pick > 0) {
        out[k - 1] = [ps, pick];
        out[k] = [skip(pick), le];
      }
    }
  }
  return out.length ? out : [[0, n]];
}

/** A deckled (hand-torn) paper edge, the same every render. */
const DECKLE = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280) * 0.7;
  const pts: string[] = [];
  const N = 36;
  for (let i = 0; i < N; i++) pts.push(`${((i / N) * 100).toFixed(2)}% ${rnd().toFixed(2)}%`);
  for (let i = 0; i < N; i++) pts.push(`${(100 - rnd()).toFixed(2)}% ${((i / N) * 100).toFixed(2)}%`);
  for (let i = 0; i < N; i++) pts.push(`${(100 - (i / N) * 100).toFixed(2)}% ${(100 - rnd()).toFixed(2)}%`);
  for (let i = 0; i < N; i++) pts.push(`${rnd().toFixed(2)}% ${(100 - (i / N) * 100).toFixed(2)}%`);
  return `polygon(${pts.join(",")})`;
})();

export default function DupattaLetter({ letter, recipient, sender, onNext }: { letter: string; recipient: string; sender: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const tokens = useMemo(() => tokenize(letter), [letter]);

  // ── the folds, measured on the real page ──
  const measureRef = useRef<HTMLDivElement | null>(null);
  const mDear = useRef<HTMLParagraphElement | null>(null);
  const mText = useRef<HTMLParagraphElement | null>(null);
  const mSign = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<Range[]>(() => [[0, tokens.length]]);
  const remeasure = useCallback(() => {
    const box = measureRef.current;
    const d = mDear.current;
    const t = mText.current;
    const g = mSign.current;
    if (!box || !d || !t || !g || !box.clientHeight) return;
    const fits = (s: number, e: number, first: boolean, last: boolean) => {
      d.style.display = first ? "" : "none";
      g.style.display = last ? "" : "none";
      t.textContent = tokens.slice(s, e).join("");
      return box.scrollHeight <= box.clientHeight + 1;
    };
    const next = measurePages(tokens, fits);
    setPages((prev) => (prev.length === next.length && prev.every((r, k) => r[0] === next[k][0] && r[1] === next[k][1]) ? prev : next));
  }, [tokens]);
  useLayoutEffect(() => {
    remeasure();
    const box = measureRef.current;
    let w = box?.clientWidth ?? 0;
    let h = box?.clientHeight ?? 0;
    const ro = new ResizeObserver(() => {
      if (!box || (box.clientWidth === w && box.clientHeight === h)) return;
      w = box.clientWidth;
      h = box.clientHeight;
      remeasure();
    });
    if (box) ro.observe(box);
    // The hand font swaps in after first paint (it is only fetched once the page uses it): measure again
    // when it has arrived, whatever order the loads finish in.
    let live = true;
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    const again = () => live && remeasure();
    fonts?.ready.then(again);
    Promise.all([fonts?.load(`400 20px ${ddHand.style.fontFamily}`), fonts?.load(`700 20px ${ddHand.style.fontFamily}`)])
      .then(again)
      .catch(() => {});
    fonts?.addEventListener?.("loadingdone", again);
    return () => {
      live = false;
      ro.disconnect();
      fonts?.removeEventListener?.("loadingdone", again);
    };
  }, [remeasure]);

  // ── untie, write, turn ──
  // sealed → opening (seal splits, flap lifts, the letter slides out) → open (the full letter)
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">("sealed");
  const open = phase === "open";
  const [p, setP] = useState(0);
  const page = Math.min(p, pages.length - 1);
  const last = page >= pages.length - 1;
  const [written, setWritten] = useState<Set<number>>(() => new Set());
  const isWritten = reduced || written.has(page);
  const markWritten = useCallback((k: number) => setWritten((w) => (w.has(k) ? w : new Set(w).add(k))), []);

  const [s0, e0] = pages[page] ?? [0, tokens.length];
  const pageTokens = tokens.slice(s0, e0);
  const words = pageTokens.filter((tk) => /\S/.test(tk)).length;
  const step = Math.max(24, Math.min(70, Math.round(2000 / Math.max(words, 1))));
  const dearMs = page === 0 ? 420 : 0;
  const writeMs = dearMs + words * step + 380;

  // The words finish writing on their own (or at once when she taps the page mid-sentence).
  useEffect(() => {
    if (!open || isWritten) return;
    const t = window.setTimeout(() => markWritten(page), writeMs + 450);
    return () => window.clearTimeout(t);
  }, [open, isWritten, page, writeMs, markWritten]);

  const untie = () => {
    if (phase !== "sealed") return;
    haptic([10, 30, 14]);
    cue("dd-tak", { gain: 0.8 });
    cue("paper-rustle", { gain: 0.7, at: 0.3 });
    cue("dd-bells", { gain: 0.5, at: 0.9 });
    setPhase("opening");
  };
  useEffect(() => {
    if (phase !== "opening") return;
    const t = window.setTimeout(() => setPhase("open"), reduced ? 0 : 2300);
    return () => window.clearTimeout(t);
  }, [phase, reduced]);

  const goTo = (k: number) => {
    if (k === page || k < 0 || k >= pages.length) return;
    haptic(8);
    cue("page-turn", { gain: 0.55 });
    setP(k);
  };

  const tapPaper = () => {
    if (!open) return untie();
    if (!isWritten) return markWritten(page);
    if (!last) goTo(page + 1);
  };

  useNext(open && last && isWritten ? "Your invitation" : null, onNext, "sparkle");

  let w = 0;
  const body = pageTokens.map((tk, k) => {
    if (!/\S/.test(tk)) return tk;
    const delay = dearMs + w++ * step;
    return (
      <span key={k} className="dd-w" style={{ animationDelay: `${delay}ms` }}>
        {tk}
      </span>
    );
  });

  return (
    <>
      <style>{LETTER_CSS}</style>
      <RoomTitle kicker="Sealed with love" title="A note for you" />

      <div className="dd-fill">
        {phase !== "open" || !reduced ? <LetterEnvelope recipient={recipient} sender={sender} opening={phase !== "sealed"} gone={open} onOpen={untie} /> : null}
        <div className={`dd-odh${open ? " is-open" : " is-hidden"}${reduced ? " is-still" : ""}`} data-dd-letter={open ? "open" : "folded"} aria-hidden={!open}>
          <span className="dd-odh-tassels" aria-hidden />

          <div className={`dd-paper${isWritten ? " is-written" : ""}${pages.length === 1 ? " is-single" : ""}`} onClick={tapPaper}>
            <span className="dd-paper-glow" aria-hidden />
            <Kalash className="dd-paper-mark" />
            <span className="dd-paper-zari" aria-hidden>
              <Corner style={{ left: -3, top: -3 }} />
              <Corner style={{ right: -3, top: -3, transform: "scaleX(-1)" }} />
              <Corner style={{ left: -3, bottom: -3, transform: "scaleY(-1)" }} />
              <Corner style={{ right: -3, bottom: -3, transform: "scale(-1,-1)" }} />
            </span>

            {/* the page that is read */}
            <div className="dd-page-box">
              {open && (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={page}
                    className="dd-page"
                    initial={reduced ? false : { opacity: 0, rotateX: -55, y: 18 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, rotateX: 62, y: -16 }}
                    transition={{ duration: 0.34, ease: [0.3, 0.7, 0.2, 1] }}
                    style={{ transformOrigin: "50% 0%" }}
                  >
                    {page === 0 && <p className="dd-dear">Dear {recipient},</p>}
                    <p className="dd-text">{body}</p>
                    {last && (
                      <div
                        className="dd-sign"
                        style={{
                          ["--d" as string]: isWritten ? "0ms" : `${writeMs - 300}ms`,
                        }}
                      >
                        <span className="dd-sign-with">with love,</span>
                        <span className="dd-sign-name">
                          {sender}
                          <SticksFlourish />
                        </span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
              {open && !reduced && <span key={`c${page}`} className="dd-crease" aria-hidden />}
            </div>

            {/* its invisible twin, for measuring the folds */}
            <div ref={measureRef} className="dd-page-box dd-page-measure" aria-hidden>
              <div className="dd-page">
                <p ref={mDear} className="dd-dear">
                  Dear {recipient},
                </p>
                <p ref={mText} className="dd-text" />
                <div ref={mSign} className="dd-sign">
                  <span className="dd-sign-with">with love,</span>
                  <span className="dd-sign-name">
                    {sender}
                    <SticksFlourish />
                  </span>
                </div>
              </div>
            </div>

            <div className="dd-paper-foot">
              <span className="dd-paper-diya" aria-hidden>
                <Diya lit size="100%" hue={DD.peacock} />
              </span>
              {open && !last && (
                <button
                  type="button"
                  className={`dd-ear${isWritten ? "" : " is-waiting"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isWritten) markWritten(page);
                    goTo(page + 1);
                  }}
                >
                  <span>Next fold</span>
                  <i aria-hidden />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div
        style={{
          flex: "none",
          minHeight: 32,
          display: "grid",
          placeItems: "center",
        }}
      >
        {!open ? (
          phase === "sealed" ? <Hint>Tap the wax seal to open your letter 💌</Hint> : null
        ) : pages.length > 1 ? (
          <span className="dd-beads" role="group" aria-label={`Fold ${page + 1} of ${pages.length}`}>
            {pages.map((_, k) => (
              <button
                key={k}
                type="button"
                className={`dd-bead${k === page ? " is-here" : k < page ? " is-read" : ""}`}
                aria-label={`Fold ${k + 1} of ${pages.length}`}
                aria-current={k === page ? "step" : undefined}
                onClick={() => {
                  if (!isWritten) markWritten(page);
                  goTo(k);
                }}
              >
                <i />
              </button>
            ))}
          </span>
        ) : null}
      </div>
    </>
  );
}

/** A kalash — the pot of plenty with mango leaves and a coconut — as a faint watermark. */
function Kalash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 150" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 18 C48 18 44 30 46 38 C49 46 71 46 74 38 C76 30 72 18 60 18 Z" />
      <path d="M60 18 C58 12 60 8 64 6" />
      {[-56, -30, 0, 30, 56].map((a) => (
        <path key={a} d="M60 44 C52 34 52 22 60 12 C68 22 68 34 60 44 Z" transform={`rotate(${a} 60 46) translate(0 ${Math.abs(a) / 6})`} />
      ))}
      <path d="M40 50 H80 L76 60 H44 Z" />
      <path d="M44 60 C18 72 18 118 40 132 H80 C102 118 102 72 76 60" />
      <path d="M30 86 H90 M28 98 H92" />
      {[38, 50, 60, 70, 82].map((x) => (
        <circle key={x} cx={x} cy="92" r="2" fill="currentColor" stroke="none" />
      ))}
      <path d="M52 112 L60 104 L68 112 L60 120 Z" />
      <path d="M40 132 L36 142 H84 L80 132" />
    </svg>
  );
}

/** A little zari flower for the border's corners. */
function Corner({ style }: { style?: CSSProperties }) {
  return (
    <svg className="dd-corner" viewBox="0 0 30 30" width="30" height="30" style={style} aria-hidden>
      <path d="M3 27 V12 Q3 3 12 3 H27" fill="none" stroke="#B8862E" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="4.2" fill="#F6D27A" stroke="#B8862E" strokeWidth="1.2" />
      <circle cx="10" cy="10" r="1.6" fill="#D7263D" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="10" cy="3.6" rx="1.6" ry="2.4" fill="#E5489B" opacity=".75" transform={`rotate(${a} 10 10)`} />
      ))}
      <circle cx="20" cy="3" r="1.3" fill="#B8862E" />
      <circle cx="3" cy="20" r="1.3" fill="#B8862E" />
    </svg>
  );
}

/** Two tiny crossed dandiya sticks with a gold spark, drawn after the name. */
function SticksFlourish() {
  return (
    <svg className="dd-flourish" viewBox="0 0 48 28" aria-hidden>
      <path className="dd-fl-a" d="M7 25 L32 4" stroke={DD.kumkum} strokeWidth="3.4" strokeLinecap="round" />
      <path className="dd-fl-b" d="M16 4 L41 25" stroke={DD.peacock} strokeWidth="3.4" strokeLinecap="round" />
      <path className="dd-fl-a" d="M7 25 L32 4" stroke={DD.gold} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="2 5" />
      <path className="dd-fl-b" d="M16 4 L41 25" stroke={DD.gold} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="2 5" />
      <path className="dd-fl-spark" d="M24.5 6 L25.6 9.4 L29 10.5 L25.6 11.6 L24.5 15 L23.4 11.6 L20 10.5 L23.4 9.4 Z" fill={DD.marigold} />
    </svg>
  );
}

const LETTER_CSS = `
/* The odhni: kumkum bandhani with a zari edge, a row of mirrors top and bottom, tassels below. */
.dd-odh { position: relative; width: min(94cqw, calc(440px * var(--vw-s, 1))); height: min(100cqh, calc(640px * var(--vw-s, 1))); box-sizing: border-box;
  padding: 18px 11px; border-radius: 16px; transform: rotate(-.8deg);
  background: ${MIRROR_ROW.replace("0 50%", "0 3px")}, ${MIRROR_ROW.replace("0 50%", "0 calc(100% - 3px)")}, ${BANDHANI}, linear-gradient(160deg, #E0324A, #A3132A 60%, #8E1022);
  box-shadow: inset 0 0 0 3px #F6D27A, inset 0 0 0 5px #B8862E, 0 30px 60px -24px rgba(0,0,0,.85), 0 0 60px -20px rgba(255,170,60,.35); }
.dd-odh-tassels { position: absolute; left: 14px; right: 14px; bottom: -13px; height: 18px; pointer-events: none;
  background: radial-gradient(ellipse 4px 6px at 50% 12px, #FFB627 0 98%, rgba(0,0,0,0) 100%) 0 0 / 18px 18px repeat-x,
    linear-gradient(90deg, rgba(0,0,0,0) 8.2px, #F6D27A 8.2px 9.8px, rgba(0,0,0,0) 9.8px) 0 0 / 18px 8px repeat-x; }

/* Handmade paper: fibres and specks, a warm centre, a deckled edge. */
.dd-paper { position: relative; width: 100%; height: 100%; border-radius: 4px; overflow: hidden; cursor: default; color: #4A1220; text-align: left; isolation: isolate;
  clip-path: ${DECKLE};
  background:
    radial-gradient(circle at 20% 30%, rgba(150,95,40,.16) 0 .9px, rgba(0,0,0,0) 1.5px) 0 0 / 23px 19px,
    radial-gradient(circle at 70% 60%, rgba(140,80,30,.12) 0 1.1px, rgba(0,0,0,0) 1.9px) 0 0 / 31px 37px,
    radial-gradient(ellipse 5px 1.2px at 40% 50%, rgba(170,110,50,.13) 0 98%, rgba(0,0,0,0) 100%) 0 0 / 41px 29px,
    radial-gradient(ellipse 1.2px 6px at 60% 40%, rgba(170,110,50,.1) 0 98%, rgba(0,0,0,0) 100%) 0 0 / 53px 47px,
    radial-gradient(110% 80% at 50% 38%, rgba(255,255,255,.6), rgba(255,255,255,0) 62%),
    linear-gradient(172deg, #FFF8E6, #F6E0B4);
  box-shadow: inset 0 0 30px rgba(160,100,30,.3), inset 0 0 3px rgba(120,70,20,.45); }
.dd-odh.is-open .dd-paper:has(.dd-ear) { cursor: pointer; }
/* the diya's light on the page, breathing like a flame */
.dd-paper-glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; will-change: opacity;
  background: radial-gradient(85% 60% at 10% 100%, rgba(255,165,45,.5), rgba(255,170,50,.16) 42%, rgba(255,170,50,0) 78%);
  animation: dd-flick 2.8s linear infinite; }
@keyframes dd-flick { 0% { opacity: .78 } 9% { opacity: 1 } 17% { opacity: .84 } 31% { opacity: .96 } 44% { opacity: .72 } 52% { opacity: .92 } 68% { opacity: .8 } 81% { opacity: 1 } 100% { opacity: .78 } }
.dd-paper-mark { position: absolute; z-index: 0; left: 50%; top: 50%; width: min(58%, 230px); height: auto; transform: translate(-50%, -54%); color: ${DD.kumkumDeep}; opacity: .075; pointer-events: none; }
.dd-paper-zari { position: absolute; z-index: 1; inset: 9px; border-radius: 6px; pointer-events: none; border: 1.5px solid rgba(184,134,46,.85);
  box-shadow: inset 0 0 0 3px rgba(255,248,230,.85), inset 0 0 0 4.5px rgba(214,165,55,.75); }
.dd-corner { position: absolute; }

/* the page: dear, the words, the signature — all in the Indian hand */
.dd-page-box { position: absolute; z-index: 2; left: 0; right: 0; top: 0; bottom: 46px; box-sizing: border-box; overflow: hidden;
  padding: clamp(20px, 3.6dvh, 32px) clamp(20px, 6cqw, 34px) 4px; perspective: 900px; }
.dd-page-measure { visibility: hidden; pointer-events: none; z-index: -1; }
.dd-page { display: flex; flex-direction: column; gap: clamp(6px, 1.2dvh, 12px); min-height: 100%; justify-content: flex-start; }
.dd-paper.is-single .dd-page-box:not(.dd-page-measure) .dd-page { justify-content: center; }
.dd-page-measure .dd-page { min-height: 0; }
.dd-dear { margin: 0; font: 700 clamp(22px, 3.3dvh, 29px)/1.2 ${DD_HAND}; color: ${DD.kumkumDeep}; animation: dd-ink .5s ease-out both; }
.dd-text { margin: 0; font: 400 clamp(17px, 2.45dvh, 21px)/1.6 ${DD_HAND}; white-space: pre-line; overflow-wrap: anywhere; color: #4A1220; }
.dd-sign { display: grid; justify-items: end; gap: 0; margin-top: 2px; animation: dd-ink .6s ease-out var(--d, 0ms) both; }
.dd-sign-with { font: 400 clamp(15px, 2.1dvh, 18px)/1.2 ${DD_HAND}; color: #7A3A2A; }
.dd-sign-name { display: inline-flex; align-items: center; gap: 6px; font: 700 clamp(22px, 3.2dvh, 28px)/1.2 ${DD_HAND}; color: ${DD.kumkumDeep}; overflow-wrap: anywhere; }
.dd-flourish { width: 40px; height: 24px; flex: none; overflow: visible; }
.dd-flourish path { stroke-dashoffset: 0; }
.dd-fl-a, .dd-fl-b { stroke-dasharray: 34; animation: dd-draw .5s ease-out calc(var(--d, 0ms) + .3s) both; }
.dd-fl-b { animation-delay: calc(var(--d, 0ms) + .5s); }
.dd-fl-a[stroke-dasharray="2 5"], .dd-fl-b[stroke-dasharray="2 5"] { stroke-dasharray: 2 5; animation: dd-fade .3s ease-out calc(var(--d, 0ms) + .8s) both; }
@keyframes dd-fade { from { opacity: 0 } to { opacity: 1 } }
.dd-fl-spark { transform-origin: 24.5px 10.5px; animation: dd-spark 1.6s ease-in-out .6s infinite alternate; }
@keyframes dd-draw { from { stroke-dashoffset: 34 } to { stroke-dashoffset: 0 } }
@keyframes dd-spark { from { transform: scale(.7) rotate(0) } to { transform: scale(1.15) rotate(45deg) } }
/* "as if written": each word inks in after the one before */
.dd-w { display: inline-block; max-width: 100%; opacity: 0; animation: dd-ink .42s ease-out both; }
@keyframes dd-ink { from { opacity: 0; transform: translateY(.18em) } to { opacity: 1; transform: none } }
.dd-paper.is-written .dd-w, .dd-paper.is-written .dd-sign, .dd-paper.is-written .dd-dear { animation: none; opacity: 1; }

/* a fold's crease sweeping down the page as it turns */
.dd-crease { position: absolute; left: 0; right: 0; top: 0; height: 40%; pointer-events: none; z-index: 3;
  background: linear-gradient(180deg, rgba(120,60,10,0), rgba(120,60,10,.12) 45%, rgba(255,255,255,.5) 52%, rgba(255,255,255,0)); transform: translateY(-110%);
  animation: dd-crease .7s ease-in-out .05s both; }
@keyframes dd-crease { from { transform: translateY(-110%) } to { transform: translateY(260%) } }

/* the paper's foot: the diya, the mirror beads, the folded corner */
.dd-paper-foot { position: absolute; z-index: 3; left: 0; right: 0; bottom: 0; height: 46px; }
.dd-paper-diya { position: absolute; left: 14px; bottom: 7px; width: 50px; filter: drop-shadow(0 0 10px rgba(255,182,39,.6)); }
.dd-beads { display: flex; gap: 0; }
.dd-bead { width: 28px; height: 32px; padding: 0; border: 0; background: none; cursor: pointer; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; }
.dd-bead i { width: 9px; height: 9px; border-radius: 50%; background: radial-gradient(circle at 38% 32%, #FFFFFF, #C9D6F2 60%, #8D9EC6); box-shadow: 0 0 0 1.5px #B8862E; opacity: .55; transition: transform .3s ease, opacity .3s ease; }
.dd-bead.is-read i { opacity: .9; }
.dd-bead.is-here i { opacity: 1; transform: scale(1.4); box-shadow: 0 0 0 1.5px #B8862E, 0 0 8px 2px rgba(255,182,39,.7); }
.dd-bead:focus-visible { outline: 2px solid #1590B8; outline-offset: -4px; border-radius: 8px; }
.dd-ear { position: absolute; right: 0; bottom: 0; height: 46px; display: flex; align-items: center; gap: 6px; padding: 0 0 0 10px; border: 0; background: none; cursor: pointer;
  font: 700 clamp(14px, 2dvh, 16px) ${DD_HAND}; color: ${DD.kumkumDeep}; -webkit-tap-highlight-color: transparent; transition: opacity .3s ease; }
.dd-ear.is-waiting { opacity: .55; }
.dd-ear i { width: 40px; height: 40px; align-self: flex-end; background: linear-gradient(135deg, rgba(0,0,0,0) 50%, #E3C48C 50%, #F3DDAE 78%, #E9CC94);
  box-shadow: -3px -3px 6px -3px rgba(90,40,10,.35); border-top-left-radius: 6px; transform-origin: 100% 100%; animation: dd-ear 1.8s ease-in-out infinite alternate; }
@keyframes dd-ear { from { transform: scale(.9) } to { transform: scale(1.08) } }
.dd-ear:focus-visible { outline: 2px solid #1590B8; outline-offset: -3px; border-radius: 8px; }

/* hidden behind the envelope until it opens, then it grows out of it */
.dd-odh { grid-area: 1 / 1; transition: opacity .5s ease .1s, transform .65s cubic-bezier(.2,.85,.25,1.05); }
.dd-odh.is-hidden { opacity: 0; transform: translateY(10%) scale(.62) rotate(-.8deg); pointer-events: none; visibility: hidden; transition: none; }
.dd-odh.is-still { transition: none; }

@media (prefers-reduced-motion: reduce) {
  .dd-paper-glow, .dd-ear i, .dd-fl-spark, .dd-crease { animation: none !important; }
  .dd-w, .dd-sign, .dd-dear, .dd-fl-a, .dd-fl-b { animation: none !important; opacity: 1 !important; }
}
@media (min-width: 1100px) {
  .dd-odh { padding: 22px 14px; }
  .dd-text { font-size: clamp(19px, 2.6dvh, 25px); }
  .dd-dear { font-size: clamp(25px, 3.6dvh, 33px); }
  .dd-sign-name { font-size: clamp(25px, 3.4dvh, 31px); }
  .dd-page-box { padding-left: 44px; padding-right: 44px; }
}
`;
