"use client";

// Scene 6 — Chapter III: Things I Never Said. A cloth-bound book under a desk lamp, three pages titled by the
// sender's chapter titles; the letter is split at "---" (or by paragraph balance). Turn a page by dragging its
// dog-eared corner: the leaf follows the finger in 3D (rotateY around the spine, a curl shadow deepening), past
// halfway it turns ("page-turn"), short of it it falls back. "Turn the page" does the same with a tap. The last
// page ends with the signature written in an animated pen stroke ("film-pen"). Every page stays in the DOM.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { splitLetter, stripSignOff, type Film } from "./util";

const ROMAN = ["I", "II", "III"];

/** "Ananya," on its own first line is a salutation: set it apart so the drop cap lands on the first sentence. */
function salute(text: string): [string, string] {
  const m = /^([^\n]{1,40}[,!])\s*\n+([\s\S]+)$/.exec(text);
  return m ? [m[1], m[2].trim()] : ["", text];
}

function Page({ k, title, text, last, from, signed }: { k: number; title: string; text: string; last: boolean; from: string; signed: boolean }) {
  const [greet, body] = salute(text);
  return (
    <>
      <p className="fm-ch">Part {ROMAN[k]}</p>
      <h3>{title}</h3>
      {greet && <p className="fm-greet">{greet}</p>}
      <p className="fm-text">{body}</p>
      {last && (
        <svg className={`fm-sign${signed ? " is-on" : ""}`} viewBox="0 0 260 70" role="img" aria-label={`Signed, ${from}`}>
          <text x="250" y="48" textAnchor="end">— {from}</text>
        </svg>
      )}
      <span className="fm-folio">{k + 1}</span>
    </>
  );
}

export default function Book({ film, letter, onDone }: { film: Film; letter: string; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const pages = splitLetter(stripSignOff(letter, film.from))
    .map((text, k) => ({ text, title: film.chapters[k] }))
    .filter((p, k) => p.text || k === 0);
  const total = pages.length;
  const [page, setPage] = useState(0);
  const [angle, setAngle] = useState<number | null>(null); // null = no leaf; 0–180 while turning
  const [anim, setAnim] = useState(false);
  const [signed, setSigned] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; w: number } | null>(null);
  const isLast = page === total - 1;

  useEffect(() => {
    if (!isLast || signed) return;
    const t = window.setTimeout(() => {
      setSigned(true);
      sfx("film-pen", { count: 4, at: 0.3 });
    }, reduce ? 200 : 1400);
    return () => window.clearTimeout(t);
  }, [isLast, signed, sfx, reduce]);

  const finishTurn = (commit: boolean) => {
    if (reduce) {
      setAngle(null);
      if (commit) setPage((p) => Math.min(total - 1, p + 1));
      return;
    }
    setAnim(true);
    setAngle(commit ? 180 : 0);
    if (commit) {
      sfx("page-turn");
      haptic(8);
    }
    window.setTimeout(() => {
      setAnim(false);
      setAngle(null);
      if (commit) setPage((p) => Math.min(total - 1, p + 1));
    }, 560);
  };

  const turn = () => {
    if (isLast || angle !== null) return;
    if (reduce) {
      sfx("page-turn");
      setPage((p) => p + 1);
      return;
    }
    setAngle(0);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => finishTurn(true)));
  };

  const cornerDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (isLast || angle !== null) return;
    const w = pagesRef.current?.getBoundingClientRect().width ?? 320;
    drag.current = { x: e.clientX, w };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
    setAngle(4);
    sfx("paper-rustle", { gain: 0.5 });
  };
  const cornerMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = Math.max(2, Math.min(178, ((d.x - e.clientX) / (d.w * 1.1)) * 180));
    setAngle(a);
  };
  const cornerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    finishTurn((angle ?? 0) > 60);
  };

  const cur = pages[page];
  const under = angle !== null ? pages[Math.min(total - 1, page + 1)] : cur;
  const underIdx = angle !== null ? Math.min(total - 1, page + 1) : page;

  return (
    <section className="fm-scene" aria-label="Chapter three: things I never said">
      <div className="fm-col">
        <p className="fm-kick">Chapter III</p>
        <h2 className="fm-h">Things I <em>Never Said</em></h2>
        <div className="fm-desk">
          <span className="fm-lamp" aria-hidden />
          <div className="fm-book">
            <div className="fm-pages" ref={pagesRef}>
              <article className="fm-page" aria-live="polite">
                <Page k={underIdx} title={under.title} text={under.text} last={underIdx === total - 1} from={film.from} signed={signed} />
              </article>
              {angle !== null && (
                <div
                  className="fm-leaf"
                  aria-hidden
                  style={{
                    transform: `rotateY(${-angle}deg)`,
                    transition: anim ? "transform .55s cubic-bezier(.3,.7,.3,1)" : "none",
                    ["--fm-curl" as string]: (Math.sin((angle / 180) * Math.PI) * 0.35).toFixed(3),
                  }}
                >
                  <div className="fm-page" style={{ position: "absolute" }}>
                    <Page k={page} title={cur.title} text={cur.text} last={false} from={film.from} signed={false} />
                    <span className="fm-curl" />
                  </div>
                  <div className="fm-leafBack" />
                </div>
              )}
              {!isLast && (
                <button type="button" className="fm-corner" aria-label="Drag the corner to turn the page"
                  onPointerDown={cornerDown} onPointerMove={cornerMove} onPointerUp={cornerUp} onPointerCancel={cornerUp}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); turn(); } }} />
              )}
            </div>
          </div>
        </div>
        {/* The whole letter, for screen readers and find-in-page, whatever page is showing. */}
        <div className="fm-sr">
          {pages.map((p, k) => (k === underIdx ? null : <section key={k}><h3>Part {ROMAN[k]}: {p.title}</h3><p>{p.text}</p></section>))}
        </div>
        <div className="fm-row">
          {page > 0 && <button type="button" className="fm-ghost" onClick={() => { sfx("paper-rustle"); setPage((p) => p - 1); }}>◂ Back</button>}
          {!isLast ? (
            <button type="button" className="fm-btn" onClick={turn}>Turn the page ▸</button>
          ) : (
            <button type="button" className="fm-btn fm-rise" style={{ animationDelay: reduce ? "0s" : "2.4s" }} onClick={onDone}>Next chapter ▸</button>
          )}
        </div>
        {!isLast && <p className="fm-hint">or drag the folded corner</p>}
      </div>
    </section>
  );
}
