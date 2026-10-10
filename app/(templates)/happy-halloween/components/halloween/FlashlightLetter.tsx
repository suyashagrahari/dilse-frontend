"use client";

// Room 5 — The Attic Letter. A new kit-level piece for this day.
//
// The attic is pitch dark; the letter is there, but all you can see is the
// circle of a flashlight. Move your finger (or the mouse) and the beam
// follows — a CSS radial-gradient driven by --x/--y custom properties: each
// move repaints only that overlay layer, never a React re-render per move. Sweep about half of
// the page and the bulb clicks on (the bulb itself is a button too: pull the light on).
//
// One screen: the letter never scrolls. It is laid out into pages that fit
// the paper exactly (measured with the real fonts in a hidden twin, words
// split only when one paragraph is longer than a whole page); the candy pill
// says "Turn the page" until the last one.
//
// Accessibility: the darkness is a decorative aria-hidden layer over real
// text, and the whole letter is also in the DOM for screen readers (a
// visually hidden copy), so nobody has to page or sweep to hear it.
// Before the first touch the beam drifts on its own so it's obvious what to
// do. Reduced motion: no drifting, a bigger beam.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { HW_DISPLAY } from "./fonts";
import { useHw, useNext } from "./stage";
import { Hint, HW, RoomTitle } from "./ui";

const COLS = 6;
const ROWS = 8;
const NEED = 0.5;

/**
 * The page prints "Dear <name>," above and "— <sender>" below, so a letter that
 * brings its own short salutation / sign-off loses those lines here (only when
 * they are short and carry the name — never real content).
 */
function tidyLetter(letter: string, recipient: string, sender: string): string[] {
  const paras = letter.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const short = (p: string) => p.split(/\s+/).length <= 5 && p.length <= 48;
  const has = (p: string, name: string) => !!name && p.toLowerCase().includes(name.toLowerCase());
  if (paras.length > 1 && short(paras[0]) && has(paras[0], recipient)) paras.shift();
  if (paras.length > 1) {
    const last = paras[paras.length - 1];
    const lines = last.split("\n");
    if (short(last) && has(last, sender)) paras.pop();
    else if (lines.length > 1 && has(lines[lines.length - 1], sender) && short(lines[lines.length - 1])) {
      lines.pop();
      if (lines.length && short(lines[lines.length - 1]) && /[,!]$/.test(lines[lines.length - 1])) lines.pop();
      paras[paras.length - 1] = lines.join("\n");
    }
  }
  return paras.filter(Boolean);
}

const LETTER_CSS = `
.hw-letter { position: relative; height: 100%; box-sizing: border-box; padding: clamp(14px, 2.4dvh, 22px) clamp(16px, 5cqw, 24px) 30px; border-radius: 14px;
  background: linear-gradient(180deg, ${VW.paper}, #F6E7C8); color: ${VW.paperInk}; box-shadow: 0 24px 50px -20px rgba(0,0,0,.8); text-align: left; overflow: hidden; }
.hw-lpage { position: relative; height: 100%; overflow: hidden; }
.hw-lp { margin: 0 0 .62em; font: 400 clamp(15px, min(4.3vw, 2.4dvh), 17.5px)/1.56 ${FONTS.serif}; white-space: pre-line; overflow-wrap: anywhere; }
.hw-ldear { margin: 0 0 .45em; font: 400 clamp(22px, 3.4dvh, 27px)/1.1 ${HW_DISPLAY}; color: ${HW.pumpkinDeep}; overflow-wrap: anywhere; }
.hw-lsig { margin: .3em 0 0; font: 700 clamp(22px, 3.4dvh, 27px)/1.2 ${FONTS.script}; text-align: right; overflow-wrap: anywhere; }
.hw-lmeasure { position: absolute; left: 0; top: 0; width: 100%; visibility: hidden; pointer-events: none; }
.hw-lno { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; font: 600 11px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: rgba(43,30,63,.45); }
`;

type Page = { dear: boolean; sig: boolean; paras: string[] };

/** Lay the paragraphs into pages that fit `box` (height H), measuring in `m` with the real styles. */
function paginate(m: HTMLDivElement, H: number, dear: string, sig: string, paras: string[]): Page[] {
  const fits = (pg: Page) => {
    m.textContent = "";
    if (pg.dear) {
      const d = document.createElement("p");
      d.className = "hw-ldear";
      d.textContent = dear;
      m.appendChild(d);
    }
    for (const t of pg.paras) {
      const e = document.createElement("p");
      e.className = "hw-lp";
      e.textContent = t;
      m.appendChild(e);
    }
    if (pg.sig) {
      const e = document.createElement("p");
      e.className = "hw-lsig";
      e.textContent = sig;
      m.appendChild(e);
    }
    return m.scrollHeight <= H + 0.5;
  };
  const pages: Page[] = [];
  const queue = paras.slice();
  let cur: Page = { dear: true, sig: false, paras: [] };
  let guard = 0;
  while (queue.length && guard++ < 400) {
    const t = queue.shift() as string;
    const isLast = queue.length === 0;
    const trial: Page = { ...cur, sig: isLast, paras: [...cur.paras, t] };
    if (fits(trial)) {
      cur = trial;
      continue;
    }
    if (cur.paras.length > 0) {
      // close this page; the paragraph starts the next one
      pages.push({ ...cur, sig: false });
      cur = { dear: false, sig: false, paras: [] };
      queue.unshift(t);
      continue;
    }
    // one paragraph longer than a whole page: split it between words
    const words = t.split(/(?<=\s)/);
    let lo = 1;
    let hi = words.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (fits({ ...cur, sig: false, paras: [words.slice(0, mid).join("").trimEnd()] })) lo = mid;
      else hi = mid - 1;
    }
    pages.push({ ...cur, sig: false, paras: [words.slice(0, lo).join("").trimEnd()] });
    cur = { dear: false, sig: false, paras: [] };
    queue.unshift(words.slice(lo).join(""));
  }
  if (cur.paras.length || cur.dear || !pages.length) pages.push({ ...cur, sig: true });
  else pages[pages.length - 1].sig = true;
  m.textContent = "";
  return pages;
}

export default function FlashlightLetter({ letter, sender, recipient, onNext }: { letter: string; sender: string; recipient: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useHw();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const seen = useRef<boolean[]>(Array(COLS * ROWS).fill(false));
  const touched = useRef(false);
  const [lit, setLit] = useState(false);
  const [moved, setMoved] = useState(false);
  const [pct, setPct] = useState(0);
  const paras = tidyLetter(letter, recipient, sender);
  const parasKey = paras.join("\u0000");
  const dear = `Dear ${recipient},`;
  const sig = `— ${sender}`;
  const [pages, setPages] = useState<Page[]>([{ dear: true, sig: true, paras }]);
  const [page, setPage] = useState(0);
  const total = pages.length;
  const at = Math.min(page, total - 1);
  const last = at >= total - 1;

  // Lay out the pages with the real fonts, and again whenever the paper changes size.
  useLayoutEffect(() => {
    const box = pageRef.current;
    const m = measureRef.current;
    if (!box || !m) return;
    const layout = () => {
      if (box.clientHeight) setPages(paginate(m, box.clientHeight, dear, sig, parasKey ? parasKey.split("\u0000") : []));
    };
    layout();
    let w = box.clientWidth;
    let h = box.clientHeight;
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      if (box.clientWidth === w && box.clientHeight === h) return;
      w = box.clientWidth;
      h = box.clientHeight;
      layout();
    });
    ro?.observe(box);
    // web fonts change line breaks: lay out again once they have arrived
    let live = true;
    document.fonts?.ready.then(() => live && layout()).catch(() => {});
    return () => {
      live = false;
      ro?.disconnect();
    };
  }, [dear, sig, parasKey]);

  const R = reduced ? 120 : 92;

  const litAt = useRef(0);
  const lightsOn = () => {
    if (lit) return;
    haptic([10, 30, 10]);
    cue("tick", { gain: 0.8 });
    litAt.current = performance.now();
    setLit(true);
  };

  // Never hurry the letter: pages turn only on her tap (the pill, or the paper itself), and it
  // never moves on by itself — on the last page the pill says "To the potion room" and waits.
  useNext(lit ? (last ? "To the potion room" : "Turn the page") : null, () => (last ? onNext() : (cue("page-turn"), setPage(at + 1))), last ? "pumpkin" : "ghost");
  const tapPaper = () => {
    if (!lit || last || performance.now() - litAt.current < 700) return;
    cue("page-turn");
    setPage(at + 1);
  };

  const shine = (clientX: number, clientY: number) => {
    const box = boxRef.current;
    if (!box || lit) return;
    const r = box.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    box.style.setProperty("--x", `${x}px`);
    box.style.setProperty("--y", `${y}px`);
    if (!touched.current) {
      touched.current = true;
      setMoved(true);
    }
    const cw = r.width / COLS;
    const ch = r.height / ROWS;
    let changed = false;
    for (let i = 0; i < COLS; i++)
      for (let j = 0; j < ROWS; j++) {
        const k = j * COLS + i;
        if (seen.current[k]) continue;
        if (Math.hypot(x - (i + 0.5) * cw, y - (j + 0.5) * ch) < R * 0.85) {
          seen.current[k] = true;
          changed = true;
        }
      }
    if (changed) {
      const share = seen.current.filter(Boolean).length / seen.current.length;
      setPct(Math.round(share * 100));
      if (share >= NEED) lightsOn();
    }
  };

  // Idle drift before the first touch, so the beam explains itself.
  useEffect(() => {
    if (reduced || moved || lit) return;
    const box = boxRef.current;
    if (!box) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      const s = (t - t0) / 1000;
      const w = box.clientWidth;
      const h = box.clientHeight;
      box.style.setProperty("--x", `${(0.5 + 0.32 * Math.sin(s * 0.9)) * w}px`);
      box.style.setProperty("--y", `${(0.4 + 0.25 * Math.sin(s * 0.63 + 1)) * h}px`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, moved, lit]);

  const pg = pages[at];

  return (
    <>
      <style>{LETTER_CSS}</style>
      <RoomTitle kicker="Room 5 · the attic" title="A letter in the dark" sub={lit ? (total > 1 ? `Lights on. Page ${at + 1} of ${total}.` : "Lights on. Take your time.") : "Somebody left a letter up here. Move the flashlight to read it."} />

      {/* the bulb — pull it on (a real button, so keyboards and anyone who can't sweep get the light) */}
      <button
        type="button"
        onClick={lightsOn}
        disabled={lit}
        aria-label="Turn the light on"
        className="hw-bulb"
        style={{ display: "grid", justifyItems: "center", marginTop: -4, flex: "none", padding: "0 10px 2px", border: 0, background: "transparent", cursor: lit ? "default" : "pointer", touchAction: "manipulation" }}
      >
        <span aria-hidden style={{ width: 2, height: 12, background: "rgba(247,243,255,.35)" }} />
        <span
          aria-hidden
          style={{
            width: 22,
            height: 27,
            borderRadius: "50% 50% 45% 45%",
            background: lit ? "radial-gradient(circle at 50% 40%, #FFF8D6, #FFD27A 60%, #FFB347)" : "rgba(247,243,255,.16)",
            boxShadow: lit ? "0 0 40px 14px rgba(255,210,122,.45)" : "none",
            transition: "background .5s, box-shadow .5s",
          }}
        />
      </button>

      <div className="hw-fill" style={{ placeItems: "stretch center" }}>
        <div
          ref={boxRef}
          onPointerMove={(e) => shine(e.clientX, e.clientY)}
          onPointerDown={(e) => shine(e.clientX, e.clientY)}
          onClick={tapPaper}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "calc(460px * var(--vw-s, 1))",
            height: "100%",
            borderRadius: 14,
            ["--x" as string]: "50%",
            ["--y" as string]: "30%",
            ["--r" as string]: `${R}px`,
            cursor: lit ? "pointer" : "none",
            touchAction: lit ? "auto" : "none",
          }}
        >
          <article aria-hidden className="hw-letter" style={{ userSelect: "text", WebkitUserSelect: "text" }}>
            <div ref={pageRef} className="hw-lpage">
              <div ref={measureRef} className="hw-lmeasure" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={at}
                  initial={reduced ? false : { opacity: 0, x: 24, rotate: 0.6 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={reduced ? undefined : { opacity: 0, x: -24, rotate: -0.6 }}
                  transition={{ duration: 0.3 }}
                >
                  {pg?.dear && <p className="hw-ldear">{dear}</p>}
                  {pg?.paras.map((p, i) => (
                    <p key={i} className="hw-lp">
                      {p}
                    </p>
                  ))}
                  {pg?.sig && <p className="hw-lsig">{sig}</p>}
                </motion.div>
              </AnimatePresence>
            </div>
            {total > 1 && (
              <span className="hw-lno">
                {at + 1} / {total}
              </span>
            )}
          </article>
          {/* the whole letter for screen readers, in one piece */}
          <div className="vw-sr">
            <p>{dear}</p>
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p>{sig}</p>
          </div>
          {/* the darkness: decorative */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -2,
              borderRadius: 16,
              pointerEvents: "none",
              background:
                "radial-gradient(circle var(--r) at var(--x) var(--y), rgba(255,236,170,.10) 0%, rgba(8,5,18,0) 45%, rgba(8,5,18,.55) 72%, rgba(8,5,18,.97) 100%)",
              opacity: lit ? 0 : 1,
              transition: "opacity .9s ease",
            }}
          />
        </div>
      </div>

      <div style={{ flex: "none", display: "grid", gap: 6, justifyItems: "center", alignContent: "start", minHeight: 38 }}>
        {!lit ? (
          <Hint>{moved ? `Keep looking… ${pct}%` : "Drag over the page 🔦"}</Hint>
        ) : (
          <div className="hw-row" style={{ gap: 8 }}>
            {total > 1 && at > 0 && (
              <button type="button" onClick={() => setPage(at - 1)} style={{ minHeight: 36, padding: "4px 14px", borderRadius: 99, border: "1px solid rgba(247,243,255,.25)", background: "rgba(247,243,255,.08)", color: VW.ink, font: `600 13px ${FONTS.ui}`, cursor: "pointer" }}>
                ‹ previous page
              </button>
            )}
            <span style={{ font: `500 12.5px ${FONTS.ui}`, color: VW.inkSoft }}>{last ? "Take your time 💜" : "Tap the letter to turn the page"}</span>
          </div>
        )}
      </div>
    </>
  );
}
