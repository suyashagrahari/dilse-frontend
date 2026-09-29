"use client";

// The full-screen letter, dressed as the app it lives in.
//
// LetterPop owns the corner envelope, the open/read state, Esc, scroll lock and
// focus return. When a template passes a `variant`, opening the envelope hands
// the whole screen to one of the reveals below instead of the generic sheet:
//
//   app       the app icon zooms into a launch screen, then "What's New in ∞"
//   watch     a Premiere countdown, then the letter plays as captions over a
//             Ken Burns film with a live transcript panel
//   recharge  payment-success tick + confetti, then a receipt prints the letter
//   product   out for delivery → delivered, the tape tears, the note rises
//   us        a story ring spins open into story slides, with a DM-thread view
//   loveflix  red "L" sting, an Original title card, then the letter rolls as
//             end credits and lands on "Renewed forever"
//
// Every reveal keeps the optional question gate in its own app's dialect, and
// the gate's "no" lives on a row below "yes" and only moves sideways (clamped
// to the row) or down, so it can never cover the yes button. Animations are
// transform/opacity only; prefers-reduced-motion skips the intros and fades.

import { Caveat } from "next/font/google";
import CallReveal from "./reveals/CallReveal";
import CatchReveal from "./reveals/CatchReveal";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type TouchEvent as ReactTouchEvent,
} from "react";

const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-lr-hand", display: "swap", preload: false });

export type LetterVariant = "app" | "watch" | "recharge" | "product" | "us" | "loveflix" | "call" | "catch";

export interface RevealProps {
  variant: LetterVariant;
  paras: string[];
  greeting: string;
  sign: string;
  from?: string;
  to?: string;
  question?: string;
  answer: string;
  accent: string;
  accent2: string;
  paper: string;
  ink: string;
  photos: string[];
  avatar?: string;
  title?: string;
  handle?: string;
  reduce: boolean;
  zIndex: number;
  closeRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onRead: () => void;
}

/** The close button's ref travels by context so render code never touches it. */
const CloseRefCtx = createContext<RefObject<HTMLButtonElement | null> | null>(null);

export type VProps = Omit<RevealProps, "closeRef">;

// ─── shared helpers ─────────────────────────────────────────────────────────

const DODGE = [
  { x: -96, y: 8, t: "are you sure? 🥺" },
  { x: 92, y: 26, t: "try again 😤" },
  { x: -70, y: 34, t: "not an option 🙅" },
  { x: 76, y: 4, t: "nice try 😌" },
];

/** Deterministic 0..1 from an index — confetti and bursts, no Math.random in render. */
export const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const bg = (url?: string): CSSProperties | undefined =>
  url ? { backgroundImage: `url("${url.replace(/"/g, "%22")}")` } : undefined;

/** Sentence-ish chunks no longer than `max` characters, split at clauses before words. */
export function chunk(text: string, max: number): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]+["'”’)\]]*\s*|[^.!?…]+$/g) ?? [text];
  const pieces: string[] = [];
  for (const sn of sentences) {
    if (sn.length <= max) { pieces.push(sn); continue; }
    for (const cl of sn.split(/(?<=[,;:—–])\s+/)) {
      if (cl.length <= max) { pieces.push(cl + " "); continue; }
      let line = "";
      for (const w of cl.split(/\s+/)) {
        if ((line + " " + w).trim().length > max) { if (line.trim()) pieces.push(line.trim() + " "); line = w; }
        else line = `${line} ${w}`;
      }
      if (line.trim()) pieces.push(line.trim() + " ");
    }
  }
  const out: string[] = [];
  let cur = "";
  for (const pc of pieces) {
    if (cur && (cur + pc).trim().length > max) { out.push(cur.trim()); cur = pc; }
    else cur += pc;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const initialOf = (s?: string) => (s?.trim()?.[0] ?? "♥").toUpperCase();

function hashNum(s: string, len: number) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1_000_000_007;
  return String(h).padStart(len, "0").slice(-len);
}

/** gate (-1) → intro steps (0..n-1) → letter (n). Reduced motion skips the intro. */
export function usePhases(gated: boolean, steps: number[], reduce: boolean, onRead: () => void) {
  const n = steps.length;
  const [p, setP] = useState(gated ? -1 : reduce ? n : 0);
  const key = steps.join(",");
  useEffect(() => {
    if (p < 0 || p >= n) return;
    const ms = Number(key.split(",")[p]) || 0;
    const t = window.setTimeout(() => setP((q) => (q === p ? q + 1 : q)), ms);
    return () => window.clearTimeout(t);
  }, [p, n, key]);
  const readRef = useRef(onRead);
  useEffect(() => { readRef.current = onRead; });
  const done = p >= n;
  useEffect(() => { if (done) readRef.current(); }, [done]);
  // Leaving the gate unmounts the focused yes button; park focus on close.
  useEffect(() => {
    if (p < 0) return;
    const active = document.activeElement;
    if (!active || active === document.body) (document.querySelector(".lr .lrX") as HTMLElement | null)?.focus({ preventScroll: true });
  }, [p]);
  return { p, n, pass: () => setP(reduce ? n : 0), skip: () => setP(n), set: setP };
}

export function useBursts() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const fire = useCallback((x = 50, y = 50) => {
    const id = Date.now() + Math.floor(x * 1000 + y);
    setBursts((b) => [...b.slice(-3), { id, x, y }]);
    window.setTimeout(() => setBursts((b) => b.filter((q) => q.id !== id)), 1300);
  }, []);
  const node = (
    <div className="lrBursts" aria-hidden>
      {bursts.map((b) => (
        <div key={b.id} className="lrBurst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          <span className="lrBurstBig">♥</span>
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ "--a": `${i * 45 + rnd(i, b.id % 97) * 20}deg`, "--d": `${60 + rnd(i, 3) * 50}px` } as CSSProperties}>♥</i>
          ))}
        </div>
      ))}
    </div>
  );
  return [node, fire] as const;
}

export function Confetti({ n = 40, colors }: { n?: number; colors: string[] }) {
  return (
    <div className="lrConfetti" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${rnd(i, 1) * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${rnd(i, 2) * 900}ms`,
            animationDuration: `${2200 + rnd(i, 3) * 1600}ms`,
            "--r": `${rnd(i, 4) * 720 - 360}deg`,
            "--x": `${rnd(i, 5) * 120 - 60}px`,
            width: `${6 + rnd(i, 6) * 6}px`,
            height: `${8 + rnd(i, 7) * 8}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

// The runaway-no gate. `cls` picks the app's dialect in CSS.
export function Gate({
  cls,
  head,
  kicker,
  question,
  yes,
  no = "no",
  onYes,
  note,
}: {
  cls: string;
  head?: ReactNode;
  kicker?: ReactNode;
  question?: string;
  yes: string;
  no?: string;
  onYes: () => void;
  note?: ReactNode;
}) {
  const [d, setD] = useState(-1);
  const rowRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { yesRef.current?.focus({ preventScroll: true }); }, []);
  // Clamp the sideways hop to the row, measured with the new label in place.
  useLayoutEffect(() => {
    const b = noRef.current;
    const row = rowRef.current;
    if (!b || !row) return;
    if (d < 0) { b.style.transform = ""; return; }
    b.style.transform = "";
    const left = b.offsetLeft - 4;
    const right = row.clientWidth - b.offsetLeft - b.offsetWidth - 4;
    // Hop toward whichever side has room; never past the row's edges.
    let dx = DODGE[d].x;
    if (dx < 0 && left < 24) dx = Math.abs(dx);
    else if (dx > 0 && right < 24) dx = -Math.abs(dx);
    dx = Math.max(-Math.max(0, left), Math.min(Math.max(0, right), dx));
    b.style.transform = `translate(${dx}px, ${DODGE[d].y}px)`;
  }, [d]);
  const hop = () => setD((v) => (v + 1) % DODGE.length);
  return (
    <div className={`lrGate ${cls}`} role="group" aria-label="Answer to open the letter">
      {head}
      {kicker && <p className="lrGateKick">{kicker}</p>}
      <h2 className="lrGateQ">{question}</h2>
      {note && <p className="lrGateNote">{note}</p>}
      <div className="lrGateYesRow">
        <button ref={yesRef} type="button" className="lrGateYes" onClick={onYes}>{yes}</button>
      </div>
      <div className="lrGateNoRow" ref={rowRef}>
        <button ref={noRef} type="button" className="lrGateNo" onClick={hop} onMouseEnter={hop}>
          {d >= 0 ? DODGE[d].t : no}
        </button>
      </div>
    </div>
  );
}

export function Sign({ sign, from, cls = "lrSign" }: { sign: string; from?: string; cls?: string }) {
  return (
    <p className={cls}>
      {sign}
      {from && <><br /><strong>{from}</strong></>}
    </p>
  );
}

// ─── the shell: dialog, close, focus trap, swipe-down ───────────────────────

export function Shell({ P, dark, label, children }: { P: VProps; dark?: boolean; label: string; children: ReactNode }) {
  const closeRef = useContext(CloseRefCtx);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number; ok: boolean } | null>(null);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const f = [...root.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])")].filter(
      (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const onTouchStart = (e: ReactTouchEvent) => {
    const sc = (e.target as HTMLElement).closest<HTMLElement>("[data-lr-scroll]");
    drag.current = { y: e.touches[0].clientY, dy: 0, ok: !sc || sc.scrollTop <= 0 };
  };
  const onTouchMove = (e: ReactTouchEvent) => {
    const d = drag.current;
    if (!d || !d.ok) return;
    d.dy = Math.max(0, e.touches[0].clientY - d.y);
    const el = stage.current;
    if (el && d.dy > 6) {
      el.style.transition = "none";
      el.style.transform = `translateY(${d.dy * 0.9}px) scale(${1 - Math.min(d.dy, 300) / 3000})`;
      el.style.opacity = String(1 - Math.min(d.dy, 400) / 900);
    }
  };
  const onTouchEnd = () => {
    const d = drag.current;
    drag.current = null;
    const el = stage.current;
    if (!d || !el) return;
    if (d.ok && d.dy > 110) { P.onClose(); return; }
    el.style.transition = "transform .3s cubic-bezier(.2,1,.3,1), opacity .3s ease";
    el.style.transform = "";
    el.style.opacity = "";
  };

  const vars = {
    "--lr-a": P.accent,
    "--lr-b": P.accent2,
    "--lr-paper": P.paper,
    "--lr-ink": P.ink,
    zIndex: P.zIndex,
  } as CSSProperties;

  return (
    <div
      className={`lr lr--${P.variant}${dark ? " is-dark" : ""}${P.reduce ? " is-reduced" : ""} ${hand.variable}`}
      style={vars}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <style>{CSS}</style>
      <div className="lrStage" ref={stage}>{children}</div>
      <button ref={closeRef} type="button" className="lrX" onClick={P.onClose} aria-label="Close the letter">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

// ─── app: launch → What's New in Version ∞ ─────────────────────────────────

function AppIcon({ src, size }: { src?: string; size: number }) {
  return (
    <span className="lrAppIcon" style={{ width: size, height: size, borderRadius: size * 0.2237, ...bg(src) }}>
      {!src && <span style={{ fontSize: size * 0.46 }}>♥</span>}
    </span>
  );
}

function AppReveal(P: VProps) {
  const ph = usePhases(!!P.question, [1750], P.reduce, P.onRead);
  const [stars, setStars] = useState(0);
  const [opened, setOpened] = useState(false);
  const [bursts, fire] = useBursts();
  const name = P.title || "Love";
  return (
    <Shell P={P} label={`A letter${P.from ? ` from ${P.from}` : ""}`}>
      {ph.p === -1 && (
        <div className="lrAppGateBg" style={bg(P.avatar)}>
          <div className="lrAppGateVeil" />
          <Gate
            cls="lrAppAlert"
            head={<AppIcon src={P.avatar} size={54} />}
            question={P.question}
            note={`${P.from || name} wants an answer before this version installs.`}
            yes={P.answer}
            onYes={ph.pass}
          />
        </div>
      )}
      {ph.p === 0 && (
        <div className="lrAppHome">
          <div className="lrAppZoom"><AppIcon src={P.avatar} size={96} /></div>
          <span className="lrAppLabel">{name}</span>
        </div>
      )}
      {ph.p >= ph.n && (
        <div className="lrScroll lrAppPage" data-lr-scroll>
          <header className="lrAppHero">
            <div className="lrAppHeroPic" style={bg(P.avatar || P.photos[0])} aria-hidden />
            <div className="lrAppHeroShade" aria-hidden />
            <div className="lrAppHeroTx">
              <p className="lrAppKick">What&rsquo;s New · Version ∞</p>
              <h1 className="lrAppH1">A letter{P.from ? ` from ${P.from}` : ""}</h1>
              <p className="lrAppSub">Written for {P.to || "you"}. Installs straight to the heart.</p>
            </div>
          </header>
          <div className="lrAppCol">
            <div className="lrAppHead lrRise" style={{ animationDelay: "80ms" }}>
              <AppIcon src={P.avatar} size={76} />
              <div className="lrAppMeta">
                <b>{name}</b>
                <span>{P.from ? `by ${P.from}` : "made with love"}</span>
                <button
                  type="button"
                  className={`lrAppOpen${opened ? " is-on" : ""}`}
                  onClick={() => { setOpened(true); fire(50, 30); }}
                >
                  {opened ? "OPENED ♥" : "OPEN"}
                </button>
              </div>
            </div>
            <section className="lrAppNotes lrRise" style={{ animationDelay: "160ms" }}>
              <div className="lrAppVer"><b>Version ∞</b><span>Today</span></div>
              {P.greeting && <p className="lrAppGreet">{P.greeting}</p>}
              {P.paras.map((p, i) => (
                <p key={i} className="lrAppP lrRise" style={{ animationDelay: `${260 + i * 110}ms` }}>{p}</p>
              ))}
              <Sign sign={P.sign} from={P.from} cls="lrSign lrAppSign" />
            </section>
            <section className="lrAppRate lrRise" style={{ animationDelay: `${320 + P.paras.length * 110}ms` }}>
              <span>Tap to Rate:</span>
              <div className="lrAppStars" role="radiogroup" aria-label="Rate this letter">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={stars === s}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    className={stars >= s ? "is-on" : ""}
                    style={{ transitionDelay: `${s * 40}ms` }}
                    onClick={() => { setStars(s); if (s === 5) fire(50, 80); }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {stars > 0 && <em className="lrAppThanks">{stars === 5 ? "Thanks for the 5 stars. Best version yet ♥" : "Only five is allowed here 😌"}</em>}
            </section>
            <p className="lrAppFoot">Size ∞ · Compatible with {P.to || "you"} · No bugs, only you</p>
          </div>
        </div>
      )}
      {bursts}
    </Shell>
  );
}

// ─── watch: Premiere countdown → captions + transcript ─────────────────────

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function WatchReveal(P: VProps) {
  const ph = usePhases(!!P.question, [3100], P.reduce, P.onRead);
  const lines = useMemo(() => {
    const all = [P.greeting, ...P.paras, `${P.sign} ${P.from ?? ""}`.trim()].filter(Boolean);
    return all.flatMap((t) => chunk(t, 110));
  }, [P.greeting, P.paras, P.sign, P.from]);
  const durs = useMemo(() => lines.map((l) => 1400 + l.length * 42), [lines]);
  const starts = useMemo(() => durs.reduce<number[]>((a, d, i) => [...a, i ? a[i - 1] + durs[i - 1] : 0], []), [durs]);
  const total = starts.length ? starts[starts.length - 1] + durs[durs.length - 1] : 1;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [cc, setCc] = useState(true);
  const [seekKey, setSeekKey] = useState(0);
  const seek = (v: number) => { setT(v); setSeekKey((k) => k + 1); };
  const [bursts, fire] = useBursts();
  const listRef = useRef<HTMLOListElement>(null);
  const live = ph.p >= ph.n;
  const ended = t >= total;
  const idx = Math.min(lines.length - 1, Math.max(0, starts.findIndex((s, i) => t >= s && t < s + durs[i]) === -1 ? lines.length - 1 : starts.findIndex((s, i) => t >= s && t < s + durs[i])));

  useEffect(() => {
    if (!live || !playing || ended) return;
    let last = performance.now();
    let at = t;
    const id = window.setInterval(() => {
      const now = performance.now();
      at = Math.min(total, at + (now - last));
      last = now;
      setT(at);
      // The film ends on a like, like every good video should.
      if (at >= total) { setLiked(true); fire(50, 40); }
    }, 100);
    return () => window.clearInterval(id);
    // `t` seeds the clock only when playback (re)starts or seeks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, playing, ended, total, fire, seekKey]);

  // Keep the active transcript line in view without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const el = list?.children[idx] as HTMLElement | undefined;
    if (!list || !el) return;
    const top = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
    list.scrollTo({ top: Math.max(0, top), behavior: P.reduce ? "auto" : "smooth" });
  }, [idx, P.reduce]);

  const photo = P.photos.length ? P.photos[idx % P.photos.length] : undefined;
  const title = P.title || `A letter for ${P.to || "you"}`;

  return (
    <Shell P={P} dark label={`A letter${P.from ? ` from ${P.from}` : ""}`}>
      {ph.p === -1 && (
        <div className="lrWtGateBg">
          {P.photos[0] && <div className="lrWtBlur" style={bg(P.photos[0])} />}
          <Gate
            cls="lrWtGate"
            head={<div className="lrWtWarn" aria-hidden>!</div>}
            kicker="Age-restricted video"
            question={P.question}
            note={`This video is only for ${P.to || "one viewer"}. Answer to continue.`}
            yes={P.answer}
            onYes={ph.pass}
          />
        </div>
      )}
      {ph.p === 0 && (
        <div className="lrWtPrem">
          {P.photos[0] && <div className="lrWtBlur" style={bg(P.photos[0])} />}
          <div className="lrWtPremIn">
            <span className="lrWtAv" style={bg(P.avatar || P.photos[0])}>{!(P.avatar || P.photos[0]) && initialOf(P.from)}</span>
            <p className="lrWtPremKick">Premiere · {P.from || "your channel"}</p>
            <h2 className="lrWtPremTitle">{title}</h2>
            <p className="lrWtPremIn2">Premieres in</p>
            <div className="lrWtCount" aria-live="polite">
              {[3, 2, 1].map((n, i) => <span key={n} style={{ animationDelay: `${i * 1000}ms` }}>{n}</span>)}
            </div>
            <p className="lrWtWaiting"><i /> 1 waiting · {P.to || "you"}</p>
          </div>
        </div>
      )}
      {live && (
        <div className="lrWt">
          <div className="lrWtPlayer">
            <div className="lrWtFilm" aria-hidden>
              {photo ? <div key={photo + (idx % 2)} className="lrWtKen" style={bg(photo)} /> : <div className="lrWtKen lrWtKen--none" />}
              <div className="lrWtShade" />
            </div>
            {cc && (
              <p className="lrWtCap" key={idx} aria-live="polite">
                <span>{lines[idx]}</span>
              </p>
            )}
            {ended && (
              <div className="lrWtEnd">
                <button type="button" className="lrWtReplay" onClick={() => { seek(0); setPlaying(true); }}>
                  <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" fill="currentColor" /></svg>
                  Replay
                </button>
              </div>
            )}
            <div className="lrWtCtl">
              <div
                className="lrWtTrack"
                role="slider"
                tabIndex={0}
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.round(total / 1000)}
                aria-valuenow={Math.round(t / 1000)}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * total * 0.999);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") seek(Math.min(total, t + 3000));
                  if (e.key === "ArrowLeft") seek(Math.max(0, t - 3000));
                }}
              >
                <div className="lrWtTrackBuf" />
                <div className="lrWtTrackFill" style={{ transform: `scaleX(${t / total})` }} />
                <div className="lrWtDot" style={{ transform: `translateX(${(t / total) * 100}cqw)` }} />
              </div>
              <div className="lrWtRow">
                <button type="button" className="lrWtBtn" onClick={() => (ended ? (seek(0), setPlaying(true)) : setPlaying((v) => !v))} aria-label={playing && !ended ? "Pause" : "Play"}>
                  {playing && !ended ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
                  )}
                </button>
                <span className="lrWtTime">{fmt(t)} / {fmt(total)}</span>
                <span className="lrWtFlex" />
                <button type="button" className={`lrWtBtn lrWtCc${cc ? " is-on" : ""}`} onClick={() => setCc((v) => !v)} aria-label="Subtitles" aria-pressed={cc}>CC</button>
                <span className="lrWtHd" aria-hidden>4K</span>
              </div>
            </div>
          </div>
          <aside className="lrWtSide">
            <div className="lrWtInfo">
              <h2>{title}</h2>
              <div className="lrWtChan">
                <span className="lrWtAv lrWtAv--sm" style={bg(P.avatar || P.photos[0])}>{!(P.avatar || P.photos[0]) && initialOf(P.from)}</span>
                <div><b>{P.from || "Your channel"}</b><small>Premiered just now · for {P.to || "you"}</small></div>
                <button type="button" className={`lrWtLike${liked ? " is-on" : ""}`} onClick={() => { setLiked((v) => !v); if (!liked) fire(50, 50); }} aria-pressed={liked}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 3 5 6.4 5c2 0 3.6 1.1 4.6 2.6h2C14 6.1 15.6 5 17.6 5 21 5 23 8.4 21.6 11.7 19.5 16.4 12 21 12 21z" fill="currentColor" /></svg>
                  {liked ? "Liked" : "Like"}
                </button>
              </div>
            </div>
            <div className="lrWtTrHead"><b>Transcript</b><span>{lines.length} lines</span></div>
            <ol className="lrWtTr" ref={listRef} data-lr-scroll>
              {lines.map((l, i) => (
                <li key={i}>
                  <button type="button" className={i === idx ? "is-on" : t > starts[i] ? "is-past" : ""} onClick={() => { seek(starts[i]); setPlaying(true); }}>
                    <time>{fmt(starts[i])}</time>
                    <span>{l}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}
      {bursts}
    </Shell>
  );
}

// ─── recharge: success tick → receipt printing ─────────────────────────────

function RechargeReveal(P: VProps) {
  const ph = usePhases(!!P.question, [2300], P.reduce, P.onRead);
  const all = [P.greeting, ...P.paras].join(" ");
  const txn = useMemo(() => `LV${hashNum(all, 10)}`, [all]);
  const [when] = useState(() => new Date());
  const stamp = when.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  const confetti = [P.accent, P.accent2, "#12B76A", "#FFD24D", "#ffffff"];
  const avatar = P.avatar || P.photos[0];
  return (
    <Shell P={P} label={`A letter${P.from ? ` from ${P.from}` : ""}`}>
      {ph.p === -1 && (
        <div className="lrRcGateBg">
          <Gate
            cls="lrRcGate"
            head={
              <div className="lrRcReq">
                <span className="lrRcAv" style={bg(avatar)}>{!avatar && initialOf(P.from)}</span>
                <div><b>{P.from || "Someone"}</b><small>is requesting an answer</small></div>
              </div>
            }
            kicker="Collect request · ₹∞"
            question={P.question}
            yes={P.answer}
            no="decline"
            onYes={ph.pass}
          />
        </div>
      )}
      {ph.p === 0 && (
        <div className="lrRcOk">
          <div className="lrRcTick" aria-hidden>
            <div className="lrRcRings"><i /><i /><i /></div>
            <svg viewBox="0 0 52 52" width="92" height="92"><circle cx="26" cy="26" r="25" fill="#12B76A" /><path d="M15 27l7 7 15-16" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="lrRcTickWipe" />
          </div>
          <h2 className="lrRcOkH">Message received</h2>
          <p className="lrRcOkS">from {P.from || "someone special"} · ₹∞ of love</p>
          <p className="lrRcOkT">{stamp}</p>
          <Confetti colors={confetti} />
        </div>
      )}
      {ph.p >= ph.n && (
        <div className="lrScroll lrRcPage" data-lr-scroll>
          {!P.reduce && <Confetti n={28} colors={confetti} />}
          <header className="lrRcTop">
            <svg viewBox="0 0 52 52" width="44" height="44" aria-hidden><circle cx="26" cy="26" r="25" fill="#12B76A" /><path d="M15 27l7 7 15-16" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div><b>Message from {P.from || "someone special"}</b><small>Delivered · {stamp}</small></div>
          </header>
          <div className="lrRcSlot" aria-hidden />
          <div className="lrRcClip">
            <article className="lrRcPaper">
              <div className="lrRcMono">
                <p className="lrRcBrand">❤ LOVE RECEIPT</p>
                <p><span>TXN ID</span><span>{txn}</span></p>
                <p><span>FROM</span><span>{P.from || "—"}</span></p>
                <p><span>TO</span><span>{P.to || "you"}</span></p>
                <p><span>AMOUNT</span><span>₹ ∞</span></p>
                <p><span>MODE</span><span>HEART-UPI</span></p>
              </div>
              <hr />
              <p className="lrRcSms">SMS · {P.from || "LOVE"}</p>
              {P.greeting && <p className="lrRcGreet">{P.greeting}</p>}
              {P.paras.map((p, i) => <p key={i} className="lrRcP">{p}</p>)}
              <Sign sign={P.sign} from={P.from} cls="lrSign lrRcSign" />
              <hr />
              <div className="lrRcMono">
                <p><span>STATUS</span><span className="lrRcOkTxt">✓ DELIVERED</span></p>
                <p><span>VALIDITY</span><span>LIFETIME</span></p>
              </div>
              <div className="lrRcBar" aria-hidden />
              <p className="lrRcThanks">thank you for being loved</p>
            </article>
          </div>
          <button type="button" className="lrRcDone" onClick={P.onClose}>Done</button>
        </div>
      )}
    </Shell>
  );
}

// ─── product: delivery → box opens → the note ──────────────────────────────

function ProductReveal(P: VProps) {
  const ph = usePhases(!!P.question, [2100, 2500], P.reduce, P.onRead);
  const all = [P.greeting, ...P.paras].join(" ");
  const order = useMemo(() => `402-${hashNum(all, 7)}-${hashNum(all + "x", 7)}`, [all]);
  const [kept, setKept] = useState(false);
  const [bursts, fire] = useBursts();
  return (
    <Shell P={P} label={`A note${P.from ? ` from ${P.from}` : ""}`}>
      {ph.p === -1 && (
        <div className="lrPdGateBg">
          <Gate
            cls="lrPdGate"
            head={<div className="lrPdGateIc" aria-hidden>📦</div>}
            kicker="Delivery needs your answer"
            question={P.question}
            note={`Order #${order} · for ${P.to || "you"}`}
            yes={P.answer}
            onYes={ph.pass}
          />
        </div>
      )}
      {ph.p === 0 && (
        <div className="lrPdTrack">
          <div className="lrPdTrackCard">
            <p className="lrPdArr">Arriving today</p>
            <p className="lrPdOrd">Order #{order}</p>
            <div className="lrPdSteps">
              <div className="lrPdLine"><i /></div>
              {["Ordered", "Shipped", "Out for delivery", "Delivered"].map((s, i) => (
                <div key={s} className="lrPdStep" style={{ "--i": i } as CSSProperties}>
                  <span className="lrPdDot" />
                  <small>{s}</small>
                </div>
              ))}
              <span className="lrPdTruck" aria-hidden>🚚</span>
            </div>
            <p className="lrPdNow"><span>Out for delivery</span><span>Delivered ✓</span></p>
          </div>
        </div>
      )}
      {ph.p === 1 && (
        <div className="lrPdScene">
          <div className="lrPdBox" aria-hidden>
            <div className="lrPdNoteRise"><span>♥</span></div>
            <div className="lrPdFlap lrPdFlap--l" />
            <div className="lrPdFlap lrPdFlap--r" />
            <div className="lrPdBody"><span className="lrPdLabel">{P.to ? `to: ${P.to}` : "fragile · love"}</span></div>
            <div className="lrPdTape" />
          </div>
          <p className="lrPdDel"><b>Delivered</b> to {P.to || "you"} · handed to resident</p>
        </div>
      )}
      {ph.p >= ph.n && (
        <div className="lrScroll lrPdPage" data-lr-scroll>
          <div className="lrPdSlip lrRise">
            <span className="lrPdOk">✓</span>
            <div><b>Delivered to {P.to || "you"}</b><small>Order #{order} · gift note enclosed</small></div>
          </div>
          <article className="lrPdNote">
            <i className="lrPdTapeBit lrPdTapeBit--l" aria-hidden />
            <i className="lrPdTapeBit lrPdTapeBit--r" aria-hidden />
            <p className="lrPdGift">Gift note</p>
            {P.greeting && <p className="lrPdGreet">{P.greeting}</p>}
            {P.paras.map((p, i) => <p key={i} className="lrPdP lrRise" style={{ animationDelay: `${200 + i * 120}ms` }}>{p}</p>)}
            <Sign sign={P.sign} from={P.from} cls="lrSign lrPdSign" />
          </article>
          <div className="lrPdActs">
            <button type="button" className={`lrPdKeep${kept ? " is-on" : ""}`} onClick={() => { setKept(true); fire(50, 70); }}>
              {kept ? "Kept forever ✓" : "Keep forever"}
            </button>
            <p>Non-returnable item · Return window: never</p>
          </div>
        </div>
      )}
      {bursts}
    </Shell>
  );
}

// ─── us: story ring → story slides / DM thread ─────────────────────────────

function UsReveal(P: VProps) {
  const ph = usePhases(!!P.question, [1100], P.reduce, P.onRead);
  const slides = useMemo(() => {
    const body = P.paras.flatMap((p) => chunk(p, 190));
    return [{ kind: "hi" as const, text: P.greeting || "for you," }, ...body.map((t) => ({ kind: "p" as const, text: t })), { kind: "end" as const, text: P.sign }];
  }, [P.paras, P.greeting, P.sign]);
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [dm, setDm] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bursts, fire] = useBursts();
  const holdT = useRef(0);
  const lastTap = useRef(0);
  const moved = useRef(false);
  const s = slides[Math.min(i, slides.length - 1)];
  const photo = P.photos.length ? P.photos[i % P.photos.length] : undefined;
  const handle = P.handle || P.from || "you";
  const avatar = P.avatar || P.photos[0];
  const dur = (k: number) => 2600 + slides[k].text.length * 38;

  const next = () => setI((v) => Math.min(slides.length - 1, v + 1));
  const prev = () => setI((v) => Math.max(0, v - 1));
  const onTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    window.clearTimeout(holdT.current);
    setHeld(false);
    if (moved.current) { moved.current = false; return; }
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      lastTap.current = 0;
      setLiked(true);
      fire(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
      return;
    }
    lastTap.current = now;
    const at = x;
    window.setTimeout(() => {
      if (lastTap.current !== now) return;
      if (at < r.width * 0.3) prev();
      else next();
    }, 260);
  };

  const avNode = (size: number) => (
    <span className="lrUsAv" style={{ width: size, height: size, ...bg(avatar) }}>{!avatar && initialOf(P.from)}</span>
  );

  const reply = (
    <div className="lrUsReply">
      <button type="button" className="lrUsInput" onClick={() => setDm(true)}>Send message</button>
      <button type="button" className={`lrUsIc${liked ? " is-on" : ""}`} aria-label="Like" aria-pressed={liked} onClick={() => { setLiked((v) => !v); if (!liked) fire(84, 88); }}>
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden><path d="M12 20.5s-7.4-4.4-9.3-9C1.4 8.3 3.4 4.8 6.8 4.8c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.4 0 5.4 3.5 4.1 6.7-1.9 4.6-9.3 9-9.3 9z" fill={liked ? "#FF3040" : "none"} stroke={liked ? "#FF3040" : "#fff"} strokeWidth="1.9" /></svg>
      </button>
      <button type="button" className="lrUsIc" aria-label="Open as messages" onClick={() => setDm(true)}>
        <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden><path d="M22 3L9.2 10.2M22 3l-6.5 18-3.3-8.1L4 9.6z" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );

  return (
    <Shell P={P} dark label={`A letter${P.from ? ` from ${P.from}` : ""}`}>
      {ph.p === -1 && (
        <div className="lrUsGateBg">
          <Gate
            cls="lrUsGate"
            head={
              <div className="lrUsReq">
                {avNode(76)}
                <b>{P.from || handle}</b>
                <small>@{handle.replace(/^@/, "")} · wants to send you a letter</small>
              </div>
            }
            question={P.question}
            yes={P.answer}
            no="delete"
            onYes={ph.pass}
          />
        </div>
      )}
      {ph.p === 0 && (
        <div className="lrUsRingStage">
          <div className="lrUsRingWrap">
            <span className="lrUsRing" aria-hidden />
            {avNode(104)}
          </div>
          <b className="lrUsRingName">{handle.replace(/^@/, "")}</b>
        </div>
      )}
      {ph.p >= ph.n && !dm && (
        <div className="lrUsStory">
          {photo && <div className="lrUsBackdrop" style={bg(photo)} aria-hidden />}
          <div className="lrUsCard">
            <div
              className="lrUsSlide"
              onPointerDown={() => { holdT.current = window.setTimeout(() => setHeld(true), 220); }}
              onPointerUp={onTap}
              onPointerLeave={() => { window.clearTimeout(holdT.current); setHeld(false); }}
              onPointerMove={(e) => { if (e.pointerType !== "mouse" && Math.abs(e.movementY) > 6) moved.current = true; }}
            >
              <div key={i} className="lrUsPic" style={bg(photo)} aria-hidden />
              <div className="lrUsGrad" aria-hidden />
              <div key={`t${i}`} className={`lrUsText lrUsText--${s.kind}`}>
                {s.kind === "hi" && (
                  <>
                    <p className="lrUsHi">{s.text}</p>
                    <p className="lrUsTip">tap to read · double-tap to ♥</p>
                  </>
                )}
                {s.kind === "p" && (
                  <p className={`lrUsBody${s.text.length > 130 ? " is-long" : ""}`}><span>{s.text}</span></p>
                )}
                {s.kind === "end" && (
                  <>
                    <p className="lrUsHi lrUsHi--end">{s.text}</p>
                    {P.from && <p className="lrUsFrom">— {P.from}</p>}
                    <button type="button" className="lrUsDmBtn" onPointerUp={(e) => e.stopPropagation()} onClick={() => setDm(true)}>💌 read it all as messages</button>
                  </>
                )}
              </div>
            </div>
            <div className="lrUsBars" aria-hidden>
              {slides.map((_, k) => (
                <span key={k}>
                  <i
                    key={`${k}-${i}`}
                    className={k < i ? "is-done" : k === i ? (P.reduce ? "is-done" : "is-run") : ""}
                    style={k === i ? { animationDuration: `${dur(k)}ms`, animationPlayState: held ? "paused" : "running" } : undefined}
                    onAnimationEnd={k === i && k < slides.length - 1 ? next : undefined}
                  />
                </span>
              ))}
            </div>
            <div className="lrUsHead">
              {avNode(32)}
              <b>{handle.replace(/^@/, "")}</b>
              <small>now</small>
              <span className="lrUsDots" aria-hidden>•••</span>
            </div>
            <div className="lrUsCount" aria-live="polite">{i + 1} / {slides.length}</div>
            {reply}
          </div>
        </div>
      )}
      {ph.p >= ph.n && dm && (
        <div className="lrUsDm">
          <header className="lrUsDmHead">
            <button type="button" className="lrUsBack" onClick={() => setDm(false)} aria-label="Back to the story">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            {avNode(34)}
            <div><b>{P.from || handle}</b><small>Active now</small></div>
          </header>
          <div className="lrScroll lrUsThread" data-lr-scroll>
            <div className="lrUsThreadIn">
              <div className="lrUsThreadTop">{avNode(84)}<b>{P.from || handle}</b><small>@{handle.replace(/^@/, "")} · you follow each other</small></div>
              <p className="lrUsDay">Today</p>
              {[P.greeting, ...P.paras].filter(Boolean).map((p, k) => (
                <p key={k} className="lrUsMsg" style={{ animationDelay: `${k * 260}ms` }}>{p}</p>
              ))}
              <p className="lrUsMsg lrUsMsg--sign" style={{ animationDelay: `${(P.paras.length + 1) * 260}ms` }}>{P.sign} {P.from}</p>
              <p className="lrUsMsg lrUsMsg--me" style={{ animationDelay: `${(P.paras.length + 2) * 260}ms` }}>❤️</p>
              <p className="lrUsSeen" style={{ animationDelay: `${(P.paras.length + 2) * 260 + 300}ms` }}>Seen just now</p>
            </div>
          </div>
        </div>
      )}
      {bursts}
    </Shell>
  );
}

// ─── loveflix: sting → title card → credits ────────────────────────────────

function LoveflixReveal(P: VProps) {
  const ph = usePhases(!!P.question, [1900, 2900], P.reduce, P.onRead);
  const scRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const [rolling, setRolling] = useState(!P.reduce);
  const [renewed, setRenewed] = useState(false);
  const live = ph.p >= ph.n;
  const hero = P.photos[0];
  const title = "The Letter";

  // The roll: native scroll, nudged forward each frame until the reader takes over.
  useEffect(() => {
    if (!live || !rolling) return;
    const el = scRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollTop;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (Math.abs(el.scrollTop - pos) > 2) pos = el.scrollTop;
      pos += dt * 0.034;
      el.scrollTop = pos;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) { setRolling(false); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const stop = () => setRolling(false);
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("keydown", stop);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("keydown", stop);
    };
  }, [live, rolling]);

  useEffect(() => {
    if (!live) return;
    const el = stampRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) setRenewed(true); }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  return (
    <Shell P={P} dark label={`${title}${P.from ? `, by ${P.from}` : ""}`}>
      {ph.p === -1 && (
        <div className="lrLfGateBg">
          {hero && <div className="lrLfHero lrLfHero--dim" style={bg(hero)} aria-hidden />}
          <Gate
            cls="lrLfGate"
            kicker={<><b className="lrLfL">L</b> Are you still watching?</>}
            question={P.question}
            note={`${title} · written by ${P.from || "someone"} for ${P.to || "you"}`}
            yes={P.answer}
            onYes={ph.pass}
          />
        </div>
      )}
      {ph.p === 0 && (
        <div className="lrLfSting" aria-hidden>
          <div className="lrLfRibbons">{Array.from({ length: 9 }, (_, k) => <i key={k} style={{ "--k": k } as CSSProperties} />)}</div>
          <b className="lrLfBigL">L</b>
        </div>
      )}
      {ph.p === 1 && (
        <div className="lrLfCard">
          {hero && <div className="lrLfHero" style={bg(hero)} aria-hidden />}
          <div className="lrLfCardShade" aria-hidden />
          <div className="lrLfCardIn">
            <p className="lrLfOrig"><b className="lrLfL">L</b> A LOVEFLIX ORIGINAL</p>
            <h2 className="lrLfTitle">{title}</h2>
            <p className="lrLfMeta"><span className="lrLfMatch">100% Match</span><span>{new Date().getFullYear()}</span><span className="lrLfBox">U/A 13+</span><span>1 Letter</span><span className="lrLfHd">HD</span></p>
            <p className="lrLfStar">Starring <b>{P.to || "you"}</b> · Written by <b>{P.from || "someone who loves you"}</b></p>
          </div>
        </div>
      )}
      {ph.p >= 0 && ph.p < ph.n && (
        <button type="button" className="lrLfSkip" onClick={ph.skip}>Skip Intro</button>
      )}
      {live && (
        <div className="lrLfRoll">
          {hero && <div className="lrLfHero lrLfHero--roll" style={bg(hero)} aria-hidden />}
          <div className="lrLfVignette" aria-hidden />
          <div className="lrScroll lrLfCredits" ref={scRef} data-lr-scroll tabIndex={0}>
            <div className="lrLfCol">
              <p className="lrLfEp"><b className="lrLfL">L</b> Season 1 · Episode ∞</p>
              <h2 className="lrLfEpT">{title}</h2>
              <div className="lrLfGap" />
              {P.greeting && <p className="lrLfGreet">{P.greeting}</p>}
              {P.paras.map((p, k) => <p key={k} className="lrLfP">{p}</p>)}
              <Sign sign={P.sign} from={undefined} cls="lrSign lrLfSign" />
              <div className="lrLfRole"><small>Written &amp; directed by</small><b>{P.from || "Someone who loves you"}</b></div>
              <div className="lrLfRole"><small>Starring</small><b>{P.to || "You"}</b></div>
              <div className="lrLfRole"><small>Filmed on location</small><b>in every ordinary day</b></div>
              <div ref={stampRef} className={`lrLfStamp${renewed ? " is-on" : ""}`}>
                <b>Renewed</b><span>forever</span>
              </div>
              <p className="lrLfNext">Season ∞ · coming soon</p>
            </div>
          </div>
          <div className="lrLfBar">
            <button type="button" className="lrLfPlay" onClick={() => setRolling((v) => !v)} aria-label={rolling ? "Pause the credits" : "Roll the credits"}>
              {rolling ? (
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden><path d="M6 4v16l14-8z" fill="currentColor" /></svg>
              )}
            </button>
            <span className="lrLfNow"><b>{title}</b> · {P.from || "LoveFlix"}</span>
            <button type="button" className="lrLfEnd" onClick={() => { const el = scRef.current; setRolling(false); el?.scrollTo({ top: el.scrollHeight, behavior: P.reduce ? "auto" : "smooth" }); }}>
              Skip to Ending ▸
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

export default function LetterReveal({ closeRef, ...P }: RevealProps) {
  return <CloseRefCtx.Provider value={closeRef}>{pick(P)}</CloseRefCtx.Provider>;
}

function pick(P: VProps) {
  switch (P.variant) {
    case "app": return <AppReveal {...P} />;
    case "watch": return <WatchReveal {...P} />;
    case "recharge": return <RechargeReveal {...P} />;
    case "product": return <ProductReveal {...P} />;
    case "us": return <UsReveal {...P} />;
    case "loveflix": return <LoveflixReveal {...P} />;
    // Each lives in its own file so its template's owner can work on it alone.
    case "call": return <CallReveal {...P} />;
    case "catch": return <CatchReveal {...P} />;
    default: return null;
  }
}

// ─── styles ─────────────────────────────────────────────────────────────────

const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Inter, system-ui, sans-serif`;
const RB = `var(--font-wt-roboto), Roboto, Arial, system-ui, sans-serif`;
const IN = `var(--font-inter), Inter, system-ui, sans-serif`;
const OS = `var(--font-oswald), "Bebas Neue", "Arial Narrow", Impact, sans-serif`;
const PF = `var(--font-playfair), "Instrument Serif", Georgia, serif`;
const HAND = `var(--font-lr-hand), "Caveat", "Segoe Print", "Bradley Hand", cursive`;
const MONO = `ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace`;

const CSS = `
.lr { position: fixed; inset: 0; width: 100%; height: 100%; height: 100dvh; overflow: hidden; isolation: isolate; box-sizing: border-box;
  background: #fff; color: #111; -webkit-tap-highlight-color: transparent; overscroll-behavior: contain; animation: lrIn .28s ease both; }
.lr *, .lr *::before, .lr *::after { box-sizing: border-box; }
.lr.is-dark { background: #000; color: #fff; }
.lr button { font: inherit; color: inherit; }
.lrStage { position: absolute; inset: 0; overflow: hidden; will-change: transform; }
.lrStage > * { position: absolute; inset: 0; }
.lrScroll { overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
.lrX { position: absolute; top: calc(12px + env(safe-area-inset-top, 0px)); right: 12px; z-index: 50; width: 40px; height: 40px; border-radius: 50%;
  border: none; cursor: pointer; display: grid; place-items: center; background: rgba(0,0,0,.08); color: #111; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: transform .2s ease; }
.lrX:hover { transform: scale(1.06); }
.lrX:focus-visible, .lr button:focus-visible, .lr [tabindex]:focus-visible { outline: 2px solid var(--lr-a); outline-offset: 2px; }
.lr.is-dark .lrX { background: rgba(255,255,255,.14); color: #fff; }
.lrRise { animation: lrRise .6s cubic-bezier(.2,1,.3,1) both; }
.lrSign { margin: 22px 0 0; text-align: right; font-style: italic; }
.lrSign strong { font-style: normal; }

/* gate: shared bones */
.lrGate { position: relative; z-index: 2; width: min(92vw, 420px); text-align: center; }
.lrGateQ { margin: 6px 0 10px; font-weight: 700; overflow-wrap: anywhere; }
.lrGateKick { margin: 0; }
.lrGateNote { margin: 0 0 16px; font-size: 13px; line-height: 1.4; opacity: .7; }
.lrGateYesRow { display: flex; justify-content: center; }
.lrGateNoRow { position: relative; display: flex; justify-content: center; align-items: flex-start; height: 96px; padding-top: 12px; }
.lrGateYes, .lrGateNo { cursor: pointer; white-space: nowrap; max-width: 100%; }
.lrGateNo { transition: transform .35s cubic-bezier(.2,1.4,.4,1); }
@media (min-width: 1100px) and (min-height: 700px) { .lrGate { zoom: 1.22; } .lrPdBox, .lrPdTrackCard, .lrWtPremIn, .lrUsRingWrap { zoom: 1.35; } }

/* bursts + confetti */
.lrBursts { position: absolute; inset: 0; pointer-events: none; z-index: 60; }
.lrBurst { position: absolute; width: 0; height: 0; }
.lrBurstBig { position: absolute; left: 0; top: 0; font-size: 96px; line-height: 1; color: #FF3040; transform: translate(-50%,-50%); animation: lrBig 1s cubic-bezier(.2,1.4,.4,1) both; text-shadow: 0 8px 24px rgba(0,0,0,.25); }
.lrBurst i { position: absolute; left: 0; top: 0; font-style: normal; font-size: 18px; color: var(--lr-a); animation: lrSpark 1.1s ease-out both; }
.lrConfetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
.lrConfetti i { position: absolute; top: -20px; border-radius: 2px; animation: lrFall linear both; }

/* ── app ── */
.lr--app { font-family: ${SF}; background: #fff; color: #000; }
.lrAppIcon { position: relative; display: grid; place-items: center; flex: none; color: #fff; background: linear-gradient(135deg, var(--lr-a), var(--lr-b)) center/cover no-repeat;
  box-shadow: 0 10px 30px -12px rgba(0,0,0,.35), inset 0 0 0 .5px rgba(0,0,0,.08); overflow: hidden; }
.lrAppGateBg { display: grid; place-items: center; background: linear-gradient(135deg, var(--lr-a), var(--lr-b)) center/cover; }
.lrAppGateVeil { position: absolute; inset: -40px; background: rgba(245,245,250,.55); backdrop-filter: blur(30px) saturate(1.6); -webkit-backdrop-filter: blur(30px) saturate(1.6); }
.lrAppAlert { width: min(86vw, 300px); padding: 20px 0 0; border-radius: 16px; background: rgba(250,250,252,.88); box-shadow: 0 30px 60px -20px rgba(0,0,0,.35); animation: lrAlert .32s cubic-bezier(.2,1.3,.4,1) both; overflow: hidden; }
.lrAppAlert .lrAppIcon { margin: 0 auto 10px; }
.lrAppAlert .lrGateQ { font-size: 17px; line-height: 1.3; padding: 0 18px; margin: 0 0 4px; }
.lrAppAlert .lrGateNote { padding: 0 18px; opacity: .75; color: #000; }
.lrAppAlert .lrGateYesRow { border-top: .5px solid rgba(60,60,67,.29); }
.lrAppAlert .lrGateYes { width: 100%; padding: 13px; border: none; background: transparent; color: var(--lr-a); font-weight: 600; font-size: 17px; }
.lrAppAlert .lrGateNoRow { border-top: .5px solid rgba(60,60,67,.29); height: 92px; }
.lrAppAlert .lrGateNo { border: none; background: rgba(120,120,128,.12); padding: 8px 16px; border-radius: 99px; color: #3C3C43; font-size: 15px; }
.lrAppHome { display: grid; place-content: center; justify-items: center; gap: 10px; background: radial-gradient(120% 80% at 50% 30%, #fdf0f3, #fff 70%); }
.lrAppZoom { animation: lrAppZoom 1.7s cubic-bezier(.6,0,.2,1) both; }
.lrAppLabel { font-size: 13px; font-weight: 500; animation: lrAppLbl 1.7s ease both; }
.lrAppPage { background: #fff; }
.lrAppHero { position: relative; height: min(62vh, 560px); overflow: hidden; background: #111; }
@media (min-width: 900px) { .lrAppHero { max-width: 1040px; margin: 24px auto 0; border-radius: 28px; height: min(58vh, 540px); box-shadow: 0 30px 60px -30px rgba(0,0,0,.45); } }
.lrAppHeroPic { position: absolute; inset: 0; background: linear-gradient(135deg, var(--lr-a), var(--lr-b)) center/cover no-repeat; animation: lrAppHero 1.1s cubic-bezier(.2,1,.3,1) both; }
.lrAppHeroShade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,.1) 55%, rgba(0,0,0,.25)); }
.lrAppHeroTx { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 22px 26px; color: #fff; max-width: 760px; }
@media (min-width: 900px) { .lrAppHeroTx { padding: 0 44px 40px; } }
.lrAppKick { margin: 0 0 6px; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .82; animation: lrRise .6s .25s both; }
.lrAppH1 { margin: 0; font-size: clamp(34px, 8vw, 56px); line-height: 1.02; font-weight: 800; letter-spacing: -.035em; animation: lrRise .7s .35s cubic-bezier(.2,1,.3,1) both; overflow-wrap: anywhere; }
.lrAppSub { margin: 10px 0 0; font-size: 16px; opacity: .85; animation: lrRise .6s .5s both; }
.lrAppCol { max-width: 680px; margin: 0 auto; padding: 22px 20px calc(48px + env(safe-area-inset-bottom, 0px)); }
.lr--app .lrX { background: rgba(0,0,0,.35); color: #fff; }
.lrAppHead { display: flex; gap: 16px; align-items: center; padding-bottom: 20px; border-bottom: .5px solid #E5E5EA; }
.lrAppMeta { display: grid; gap: 2px; min-width: 0; }
.lrAppMeta b { font-size: 20px; letter-spacing: -.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lrAppMeta span { color: #8A8A8E; font-size: 14px; }
.lrAppOpen { justify-self: start; margin-top: 8px; padding: 6px 20px; border-radius: 99px; border: none; cursor: pointer; background: var(--lr-a); color: #fff !important; font-weight: 700 !important; font-size: 15px; letter-spacing: .02em; transition: transform .2s; }
.lrAppOpen:active { transform: scale(.94); }
.lrAppOpen.is-on { background: color-mix(in srgb, var(--lr-a) 14%, #fff); color: var(--lr-a) !important; }
.lrAppNotes { padding: 18px 0 8px; }
.lrAppVer { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
.lrAppVer b { font-size: 17px; }
.lrAppVer span { color: #8A8A8E; font-size: 15px; }
.lrAppGreet { margin: 0 0 12px; font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
.lrAppP { margin: 0 0 14px; font-size: 17px; line-height: 1.55; color: #1C1C1E; overflow-wrap: anywhere; }
.lrAppSign { font-size: 16px; color: #3C3C43; }
.lrAppSign strong { color: var(--lr-a); font-size: 17px; }
.lrAppRate { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding: 18px 0; border-top: .5px solid #E5E5EA; border-bottom: .5px solid #E5E5EA; margin-top: 18px; }
.lrAppRate > span { font-size: 15px; color: #3C3C43; }
.lrAppStars { display: flex; gap: 4px; }
.lrAppStars button { border: none; background: none; cursor: pointer; font-size: 28px; line-height: 1; padding: 2px; color: transparent !important; -webkit-text-stroke: 1.4px var(--lr-a); transition: transform .25s cubic-bezier(.2,1.6,.4,1), color .2s; }
.lrAppStars button.is-on { color: var(--lr-a) !important; transform: scale(1.12); }
.lrAppThanks { width: 100%; font-style: normal; font-size: 14px; color: var(--lr-a); font-weight: 600; animation: lrRise .4s ease both; }
.lrAppFoot { margin: 18px 0 0; color: #8A8A8E; font-size: 13px; text-align: center; }

/* ── watch ── */
.lr--watch { font-family: ${RB}; background: #0f0f0f; color: #f1f1f1; }
.lrWtBlur { position: absolute; inset: -40px; background: center/cover no-repeat; filter: blur(28px) brightness(.45) saturate(1.3); transform: scale(1.1); }
.lrWtGateBg { display: grid; place-items: center; background: #0f0f0f; }
.lrWtGate { background: #212121; border-radius: 14px; padding: 26px 22px 6px; box-shadow: 0 30px 80px -20px #000; animation: lrAlert .35s cubic-bezier(.2,1.3,.4,1) both; }
.lrWtWarn { width: 48px; height: 48px; margin: 0 auto 10px; border-radius: 50%; display: grid; place-items: center; background: #ff0033; color: #fff; font: 900 26px/1 ${RB}; }
.lrWtGate .lrGateKick { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #aaa; font-weight: 700; }
.lrWtGate .lrGateQ { font-size: 22px; line-height: 1.25; font-weight: 700; }
.lrWtGate .lrGateNote { color: #aaa; opacity: 1; }
.lrWtGate .lrGateYes { padding: 11px 22px; border-radius: 99px; border: none; background: #f1f1f1; color: #0f0f0f !important; font-weight: 600; font-size: 15px; }
.lrWtGate .lrGateNo { padding: 9px 18px; border-radius: 99px; border: none; background: #3f3f3f; color: #f1f1f1; font-size: 14px; font-weight: 500; }
.lrWtPrem { display: grid; place-items: center; background: #000; }
.lrWtPremIn { position: relative; text-align: center; padding: 24px; max-width: 640px; }
.lrWtAv { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #ff3e86 center/cover no-repeat; color: #fff; font-weight: 700; font-size: 26px; flex: none; }
.lrWtAv--sm { width: 40px; height: 40px; font-size: 16px; }
.lrWtPremKick { margin: 14px 0 6px; font-size: 13px; font-weight: 600; color: #fff; display: inline-flex; gap: 6px; align-items: center; background: rgba(255,255,255,.12); padding: 4px 10px; border-radius: 6px; }
.lrWtPremTitle { margin: 6px 0 20px; font-size: clamp(20px, 3.6vw, 30px); line-height: 1.25; font-weight: 700; }
.lrWtPremIn2 { margin: 0; font-size: 13px; color: #ccc; letter-spacing: .12em; text-transform: uppercase; }
.lrWtCount { position: relative; height: clamp(110px, 22vw, 180px); margin: 4px 0 10px; }
.lrWtCount span { position: absolute; inset: 0; display: grid; place-items: center; font-size: clamp(96px, 20vw, 170px); font-weight: 800; line-height: 1; opacity: 0; animation: lrCount 1s cubic-bezier(.2,1,.3,1) both; }
.lrWtWaiting { margin: 0; font-size: 13px; color: #ccc; display: inline-flex; align-items: center; gap: 8px; }
.lrWtWaiting i { width: 8px; height: 8px; border-radius: 50%; background: #ff0033; animation: lrPulse 1.2s ease-in-out infinite; }
.lrWt { display: flex; flex-direction: column; background: #0f0f0f; animation: lrFadeIn .35s ease both; }
.lrWtPlayer { position: relative; flex: none; width: 100%; aspect-ratio: 16 / 9; max-height: 62vh; background: #000; overflow: hidden; container-type: inline-size; }
.lrWtFilm { position: absolute; inset: 0; overflow: hidden; }
.lrWtKen { position: absolute; inset: 0; background: center/cover no-repeat; animation: lrKen 9s ease-out both, lrFadeIn .9s ease both; }
.lrWtKen--none { background: radial-gradient(120% 90% at 30% 20%, color-mix(in srgb, var(--lr-a) 60%, #000), #000); }
.lrWtShade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,0) 45%), linear-gradient(to bottom, rgba(0,0,0,.45), transparent 22%); }
.lrWtCap { position: absolute; left: 50%; bottom: clamp(52px, 13cqw, 110px); transform: translateX(-50%); width: min(92%, 900px); margin: 0; text-align: center; animation: lrCap .35s ease both; }
.lrWtCap span { display: inline; padding: 2px 8px; background: rgba(8,8,8,.78); color: #fff; font-size: clamp(14px, 2.5cqw, 30px); line-height: 1.55; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.lrWtEnd { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.45); animation: lrFadeIn .4s ease both; }
.lrWtReplay { display: grid; justify-items: center; gap: 6px; border: none; background: none; cursor: pointer; color: #fff; font-size: 14px; font-weight: 600; }
.lrWtCtl { position: absolute; left: 0; right: 0; bottom: 0; padding: 0 12px 4px; z-index: 3; }
.lrWtTrack { position: relative; height: 16px; cursor: pointer; container-type: inline-size; }
.lrWtTrackBuf, .lrWtTrackFill { position: absolute; left: 0; right: 0; top: 6px; height: 4px; border-radius: 2px; }
.lrWtTrackBuf { background: rgba(255,255,255,.3); }
.lrWtTrackFill { background: #ff0033; transform-origin: left; transition: transform .12s linear; }
.lrWtDot { position: absolute; left: -6px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #ff0033; transition: transform .12s linear; }
.lrWtRow { display: flex; align-items: center; gap: 6px; height: 40px; }
.lrWtBtn { border: none; background: none; cursor: pointer; width: 40px; height: 40px; display: grid; place-items: center; color: #fff; }
.lrWtCc { font-weight: 800; font-size: 12px; width: 36px; position: relative; }
.lrWtCc.is-on::after { content: ""; position: absolute; left: 9px; right: 9px; bottom: 7px; height: 3px; border-radius: 2px; background: #ff0033; }
.lrWtTime { font-size: 13px; color: #eee; font-variant-numeric: tabular-nums; }
.lrWtFlex { flex: 1; }
.lrWtHd { font-size: 10px; font-weight: 800; padding: 1px 4px; border-radius: 3px; background: #ff0033; margin-right: 6px; }
.lrWtSide { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.lrWtInfo { padding: 12px 14px 10px; }
.lrWtInfo h2 { margin: 0 0 10px; font-size: 18px; line-height: 1.3; font-weight: 700; overflow-wrap: anywhere; }
.lrWtChan { display: flex; align-items: center; gap: 10px; }
.lrWtChan > div { display: grid; min-width: 0; flex: 1; }
.lrWtChan b { font-size: 15px; }
.lrWtChan small { font-size: 12px; color: #aaa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lrWtLike { display: inline-flex; gap: 6px; align-items: center; border: none; cursor: pointer; padding: 8px 14px; border-radius: 99px; background: #272727; color: #f1f1f1; font-size: 14px; font-weight: 600; transition: transform .2s; }
.lrWtLike.is-on { background: #f1f1f1; color: #0f0f0f !important; }
.lrWtLike.is-on svg { color: #ff0033; }
.lrWtLike:active { transform: scale(.94); }
.lrWtTrHead { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 14px; border-top: 1px solid #272727; border-bottom: 1px solid #272727; }
.lrWtTrHead b { font-size: 16px; }
.lrWtTrHead span { font-size: 12px; color: #aaa; }
.lrWtTr { list-style: none; margin: 0; padding: 6px 0 calc(24px + env(safe-area-inset-bottom, 0px)); flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; position: relative; }
.lrWtTr button { display: flex; gap: 14px; width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 9px 14px; color: #aaa; line-height: 1.5; font-size: 15px; transition: background .2s, color .2s; }
.lrWtTr button.is-past { color: #d6d6d6; }
.lrWtTr button.is-on { background: #272727; color: #fff; }
.lrWtTr time { flex: none; font-size: 12px; padding: 2px 6px; border-radius: 4px; background: rgba(62,166,255,.15); color: #3ea6ff; height: fit-content; font-variant-numeric: tabular-nums; margin-top: 2px; }
@media (max-width: 899px) { .lrWtPlayer { aspect-ratio: auto; height: min(48vh, 118vw); max-height: none; } }
@media (min-width: 900px) {
  .lrWt { flex-direction: row; }
  .lrWtPlayer { flex: 1; height: 100%; max-height: none; aspect-ratio: auto; }
  .lrWtSide { flex: none; width: 400px; border-left: 1px solid #272727; }
  .lrWtInfo { padding-top: 68px; }
  .lr--watch .lrX { right: 16px; top: 16px; }
}

/* ── recharge ── */
.lr--recharge { font-family: ${IN}; background: linear-gradient(180deg, var(--lr-b) 0%, color-mix(in srgb, var(--lr-a) 70%, var(--lr-b)) 42%, #fdf2f7 42.1%, #fdf2f7 100%); color: var(--lr-ink); }
.lr--recharge .lrX { background: rgba(40,8,30,.42); color: #fff; }
.lrRcGateBg { display: grid; place-items: end center; background: radial-gradient(90% 60% at 50% 30%, color-mix(in srgb, var(--lr-a) 80%, #fff), var(--lr-b) 80%); padding-bottom: env(safe-area-inset-bottom, 0px); }
.lrRcGate { width: min(100%, 520px); background: #fff; border-radius: 24px 24px 0 0; padding: 22px 20px 4px; animation: lrUp .45s cubic-bezier(.2,1,.3,1) both; box-shadow: 0 -20px 60px -20px rgba(0,0,0,.4); }
@media (min-width: 700px) { .lrRcGateBg { place-items: center; } .lrRcGate { border-radius: 24px; } }
.lrRcReq { display: flex; align-items: center; gap: 12px; text-align: left; padding-bottom: 14px; border-bottom: 1px solid #F1E4EA; margin-bottom: 14px; }
.lrRcReq b { display: block; font-size: 16px; }
.lrRcReq small { font-size: 13px; color: #7A6A74; }
.lrRcAv { width: 48px; height: 48px; border-radius: 50%; flex: none; display: grid; place-items: center; background: linear-gradient(135deg, var(--lr-a), var(--lr-b)) center/cover; color: #fff; font-weight: 800; font-size: 18px; }
.lrRcGate .lrGateKick { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--lr-a); }
.lrRcGate .lrGateQ { font-size: 22px; line-height: 1.25; }
.lrRcGate .lrGateYes { width: 100%; padding: 15px; border-radius: 14px; border: none; background: var(--lr-a); color: #fff !important; font-weight: 700; font-size: 16px; box-shadow: 0 12px 24px -12px var(--lr-a); }
.lrRcGate .lrGateNo { padding: 10px 20px; border-radius: 12px; border: 1.5px solid #E7D5DE; background: #fff; font-weight: 600; font-size: 14px; }
.lrRcOk { display: grid; place-content: center; justify-items: center; text-align: center; padding: 24px; color: #fff; background: radial-gradient(90% 60% at 50% 38%, color-mix(in srgb, var(--lr-a) 85%, #fff), var(--lr-b) 75%); }
.lrRcRings { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.lrRcRings i { position: absolute; left: -90px; top: -90px; width: 180px; height: 180px; border-radius: 50%; border: 2px solid rgba(255,255,255,.55); animation: lrRing 1.8s ease-out infinite; }
.lrRcRings i:nth-child(2) { animation-delay: .5s; }
.lrRcRings i:nth-child(3) { animation-delay: 1s; }
.lrRcTick { position: relative; width: 92px; height: 92px; animation: lrPopIn .6s cubic-bezier(.2,1.6,.4,1) both; filter: drop-shadow(0 14px 24px rgba(0,0,0,.25)); }
.lrRcTickWipe { position: absolute; left: 24px; top: 30px; width: 56px; height: 40px; background: #12B76A; transform-origin: right; animation: lrWipe .45s .45s cubic-bezier(.6,0,.3,1) both; }
.lrRcOkH { margin: 22px 0 6px; font-size: clamp(26px, 5vw, 38px); font-weight: 800; letter-spacing: -.02em; animation: lrRise .5s .55s both; }
.lrRcOkS { margin: 0; font-size: 16px; opacity: .92; animation: lrRise .5s .7s both; }
.lrRcOkT { margin: 8px 0 0; font-size: 12px; opacity: .7; animation: lrRise .5s .8s both; }
.lrRcPage { padding: calc(20px + env(safe-area-inset-top, 0px)) 16px calc(28px + env(safe-area-inset-bottom, 0px)); animation: lrFadeIn .3s ease both; }
.lrRcTop { position: relative; z-index: 2; display: flex; align-items: center; gap: 12px; max-width: 460px; margin: 0 auto 18px; padding-right: 44px; color: #fff; }
.lrRcTop b { display: block; font-size: 17px; }
.lrRcTop small { font-size: 12px; opacity: .8; }
.lrRcSlot { position: relative; z-index: 3; max-width: 480px; height: 14px; margin: 0 auto; border-radius: 99px; background: #1b1020; box-shadow: inset 0 3px 6px rgba(0,0,0,.6), 0 2px 0 rgba(255,255,255,.2); }
.lrRcClip { position: relative; z-index: 2; max-width: 440px; margin: -7px auto 0; overflow: hidden; padding: 0 0 14px; }
.lrRcPaper { position: relative; background: #fff; color: #231a22; padding: 26px 22px 30px; box-shadow: 0 18px 40px -18px rgba(60,10,40,.45); animation: lrPrint 1.8s cubic-bezier(.3,.7,.2,1) both;
  -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / 16px 51% repeat-x, linear-gradient(#000 0 0) top / 100% calc(100% - 8px) no-repeat;
  mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / 16px 51% repeat-x, linear-gradient(#000 0 0) top / 100% calc(100% - 8px) no-repeat; }
.lrRcMono { font-family: ${MONO}; font-size: 12.5px; letter-spacing: .02em; }
.lrRcMono p { display: flex; justify-content: space-between; gap: 12px; margin: 0 0 6px; }
.lrRcMono p span:last-child { text-align: right; overflow-wrap: anywhere; font-weight: 700; }
.lrRcBrand { justify-content: center !important; font-weight: 800; letter-spacing: .18em; color: var(--lr-a); margin-bottom: 12px !important; }
.lrRcPaper hr { border: none; border-top: 1.5px dashed #d9c9d2; margin: 16px 0; }
.lrRcSms { margin: 0 0 10px; font: 700 11px ${MONO}; letter-spacing: .12em; color: #8a7482; }
.lrRcGreet { margin: 0 0 10px; font-weight: 700; font-size: 17px; }
.lrRcP { margin: 0 0 12px; font-size: 15.5px; line-height: 1.6; overflow-wrap: anywhere; }
.lrRcSign { font-size: 15px; color: #5a4654; }
.lrRcSign strong { color: var(--lr-a); }
.lrRcOkTxt { color: #12B76A; }
.lrRcBar { height: 44px; margin: 18px auto 8px; width: 78%; background: repeating-linear-gradient(90deg, #231a22 0 2px, transparent 2px 4px, #231a22 4px 5px, transparent 5px 8px, #231a22 8px 11px, transparent 11px 13px); }
.lrRcThanks { margin: 0; text-align: center; font: 600 11px ${MONO}; letter-spacing: .14em; text-transform: uppercase; color: #8a7482; }
.lrRcDone { display: block; position: relative; z-index: 2; width: min(100%, 440px); margin: 6px auto 0; padding: 15px; border: none; border-radius: 14px; background: var(--lr-a); color: #fff !important; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: 0 12px 24px -12px var(--lr-a); }

/* ── product ── */
.lr--product { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #EAEDED; color: #0F1111; }
.lrPdGateBg { display: grid; place-items: center; background: #EAEDED; padding: 16px; }
.lrPdGate { background: #fff; border: 1px solid #D5D9D9; border-radius: 12px; padding: 24px 20px 4px; box-shadow: 0 10px 30px -12px rgba(15,17,17,.25); animation: lrAlert .35s cubic-bezier(.2,1.3,.4,1) both; }
.lrPdGateIc { font-size: 44px; animation: lrBob 2.4s ease-in-out infinite; }
.lrPdGate .lrGateKick { font-size: 13px; font-weight: 700; color: #007600; }
.lrPdGate .lrGateQ { font-size: 22px; line-height: 1.25; font-weight: 700; }
.lrPdGate .lrGateNote { color: #565959; opacity: 1; }
.lrPdGate .lrGateYes { min-width: 220px; padding: 12px 22px; border-radius: 99px; border: 1px solid #FCD200; background: #FFD814; color: #0F1111 !important; font-size: 15px; box-shadow: 0 2px 5px rgba(213,217,217,.5); }
.lrPdGate .lrGateNo { padding: 9px 18px; border-radius: 99px; border: 1px solid #D5D9D9; background: #fff; font-size: 13px; box-shadow: 0 2px 5px rgba(213,217,217,.5); }
.lrPdTrack { display: grid; place-items: center; padding: 16px; background: #EAEDED; }
.lrPdTrackCard { width: min(100%, 560px); background: #fff; border-radius: 12px; border: 1px solid #D5D9D9; padding: 22px 20px 20px; animation: lrRise .45s ease both; }
.lrPdArr { margin: 0; font-size: 22px; font-weight: 700; color: #007600; }
.lrPdOrd { margin: 4px 0 26px; font-size: 13px; color: #565959; }
.lrPdSteps { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); padding-top: 30px; }
.lrPdLine { position: absolute; left: 12.5%; right: 12.5%; top: 38px; height: 4px; border-radius: 2px; background: #E3E6E6; overflow: hidden; }
.lrPdLine i { position: absolute; inset: 0; background: #067D62; transform-origin: left; animation: lrFillX 1.6s .15s cubic-bezier(.5,0,.3,1) both; }
.lrPdStep { position: relative; display: grid; justify-items: center; gap: 8px; text-align: center; }
.lrPdStep small { font-size: 11.5px; color: #565959; line-height: 1.25; }
.lrPdDot { position: relative; z-index: 1; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 3px solid #E3E6E6; }
.lrPdDot::after { content: ""; position: absolute; inset: -3px; border-radius: 50%; background: #067D62; transform: scale(0); animation: lrDot .3s cubic-bezier(.2,1.6,.4,1) both; animation-delay: calc(.2s + var(--i) * .5s); }
.lrPdTruck { position: absolute; left: 12.5%; top: 0; font-size: 24px; transform: scaleX(-1); animation: lrTruck 1.6s .15s cubic-bezier(.5,0,.3,1) both; }
.lrPdNow { position: relative; height: 22px; margin: 22px 0 0; font-weight: 700; font-size: 15px; }
.lrPdNow span { position: absolute; left: 0; right: 0; text-align: center; }
.lrPdNow span:first-child { color: #C45500; animation: lrOut .3s 1.55s both; }
.lrPdNow span:last-child { color: #007600; animation: lrFadeIn .3s 1.7s both; }
.lrPdScene { display: grid; place-content: center; justify-items: center; gap: 26px; background: radial-gradient(90% 60% at 50% 45%, #fff, #EAEDED); }
.lrPdBox { position: relative; width: 240px; height: 200px; perspective: 800px; animation: lrDrop .7s cubic-bezier(.3,1.5,.5,1) both; }
.lrPdBody { position: absolute; left: 0; right: 0; bottom: 0; height: 150px; border-radius: 6px; background: linear-gradient(180deg, #D8A86F, #C48D52); box-shadow: 0 22px 34px -18px rgba(90,50,10,.6), inset 0 -8px 0 rgba(0,0,0,.06); z-index: 3; display: grid; place-items: end start; padding: 12px; }
.lrPdLabel { font: 700 11px ${MONO}; background: #fff; color: #333; padding: 6px 8px; border-radius: 3px; transform: rotate(-2deg); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lrPdFlap { position: absolute; top: 12px; height: 42px; width: 50%; background: linear-gradient(180deg, #E8BD85, #D8A86F); z-index: 4; }
.lrPdFlap--l { left: 0; transform-origin: left center; clip-path: polygon(6% 0, 100% 0, 100% 100%, 0 100%); animation: lrFlapL .6s 1.05s cubic-bezier(.4,0,.2,1) both; }
.lrPdFlap--r { right: 0; transform-origin: right center; clip-path: polygon(0 0, 94% 0, 100% 100%, 0 100%); animation: lrFlapR .6s 1.1s cubic-bezier(.4,0,.2,1) both; }
.lrPdTape { position: absolute; left: calc(50% - 16px); top: 12px; width: 32px; height: 90px; background: linear-gradient(90deg, rgba(160,110,50,.55), rgba(210,165,105,.8), rgba(160,110,50,.55)); z-index: 5; transform-origin: top; animation: lrTear .5s .6s cubic-bezier(.6,0,.3,1) both; }
.lrPdNoteRise { position: absolute; left: 30px; right: 30px; top: 30px; height: 130px; border-radius: 4px; background: #FFFDF8; box-shadow: 0 10px 20px -8px rgba(0,0,0,.3); z-index: 2; display: grid; place-items: center; animation: lrRiseNote 1s 1.45s cubic-bezier(.3,1.2,.4,1) both; }
.lrPdNoteRise span { color: var(--lr-a); font-size: 34px; }
.lrPdDel { margin: 0; font-size: 15px; color: #0F1111; animation: lrRise .5s .3s both; text-align: center; padding: 0 16px; }
.lrPdDel b { color: #007600; }
.lrPdPage { background: #EAEDED; padding: calc(16px + env(safe-area-inset-top, 0px)) 14px calc(32px + env(safe-area-inset-bottom, 0px)); animation: lrFadeIn .3s ease both; }
.lrPdSlip { display: flex; align-items: center; gap: 12px; max-width: 640px; margin: 0 auto 16px; padding: 12px 56px 12px 14px; background: #fff; border: 1px solid #D5D9D9; border-radius: 10px; }
.lrPdSlip b { display: block; font-size: 16px; color: #007600; }
.lrPdSlip small { font-size: 12.5px; color: #565959; overflow-wrap: anywhere; }
.lrPdOk { flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #067D62; color: #fff; font-weight: 800; }
.lrPdNote { position: relative; max-width: 640px; margin: 18px auto 0; padding: 34px clamp(22px, 5vw, 48px) 30px; color: #2b2320;
  background: #FFFDF8;
  border-radius: 3px; box-shadow: 0 1px 0 rgba(0,0,0,.04), 0 24px 50px -24px rgba(60,40,20,.45); transform: rotate(-.6deg); animation: lrNoteIn .8s cubic-bezier(.2,1.1,.3,1) both; }
.lrPdTapeBit { position: absolute; top: -12px; width: 96px; height: 26px; background: rgba(255,236,170,.75); box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.lrPdTapeBit--l { left: 8%; transform: rotate(-6deg); }
.lrPdTapeBit--r { right: 8%; transform: rotate(5deg); }
.lrPdGift { margin: 0 0 8px; font: 700 11px ${MONO}; letter-spacing: .16em; text-transform: uppercase; color: #8b7d72; }
.lrPdGreet { margin: 0 0 6px; font: 700 32px/1.2 ${HAND}; color: var(--lr-a); }
.lrPdP { margin: 0; text-indent: 1.1em; font: 500 24px/34px ${HAND}; overflow-wrap: anywhere; background: repeating-linear-gradient(180deg, transparent 0 32px, rgba(80,120,190,.2) 32px 33px, transparent 33px 34px); }
.lrPdSign { font: 500 24px/1.3 ${HAND}; }
.lrPdSign strong { font-weight: 700; font-size: 30px; color: var(--lr-a); }
.lrPdActs { max-width: 640px; margin: 22px auto 0; text-align: center; }
.lrPdKeep { width: min(100%, 360px); padding: 13px; border-radius: 99px; border: 1px solid #FCD200; background: #FFD814; color: #0F1111 !important; font-size: 15px; cursor: pointer; box-shadow: 0 2px 5px rgba(213,217,217,.5); transition: transform .2s; }
.lrPdKeep:active { transform: scale(.97); }
.lrPdKeep.is-on { background: #fff; border-color: #067D62; color: #067D62 !important; font-weight: 700; }
.lrPdActs p { margin: 10px 0 0; font-size: 12.5px; color: #565959; }

/* ── us ── */
.lr--us { font-family: ${SF}; background: #1a1a1a; }
.lrUsAv { position: relative; display: inline-grid; place-items: center; flex: none; border-radius: 50%; background: linear-gradient(135deg, #FF3D7F, #FFB38A) center/cover no-repeat; color: #fff; font-weight: 700; }
.lrUsGateBg { display: grid; place-items: center; background: #000; padding: 16px; }
.lrUsGate { background: #fff; color: #000; border-radius: 20px; padding: 26px 20px 4px; animation: lrAlert .35s cubic-bezier(.2,1.3,.4,1) both; }
.lrUsReq { display: grid; justify-items: center; gap: 4px; margin-bottom: 12px; }
.lrUsReq b { font-size: 17px; margin-top: 8px; }
.lrUsReq small { font-size: 13px; color: #737373; }
.lrUsGate .lrGateQ { display: inline-block; font-size: 17px; font-weight: 500; line-height: 1.35; background: #EFEFEF; border-radius: 22px; padding: 12px 16px; margin: 8px 0 18px; max-width: 100%; }
.lrUsGate .lrGateYes { width: 100%; padding: 12px; border-radius: 10px; border: none; background: #0095F6; color: #fff !important; font-weight: 600; font-size: 15px; }
.lrUsGate .lrGateNo { padding: 9px 18px; border-radius: 10px; border: none; background: #EFEFEF; color: #ED4956; font-weight: 600; font-size: 14px; }
.lrUsRingStage { display: grid; place-content: center; justify-items: center; gap: 14px; background: #000; color: #fff; }
.lrUsRingWrap { position: relative; width: 124px; height: 124px; display: grid; place-items: center; animation: lrUsGrow 1.1s cubic-bezier(.6,0,.3,1) both; }
.lrUsRing { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(#FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75); animation: lrSpin .9s linear infinite;
  -webkit-mask: radial-gradient(circle, transparent 57px, #000 58px); mask: radial-gradient(circle, transparent 57px, #000 58px); }
.lrUsRingName { font-size: 14px; font-weight: 600; animation: lrOut .3s .75s both; }
.lrUsStory { display: grid; place-items: center; background: #1a1a1a; animation: lrFadeIn .25s ease both; }
.lrUsBackdrop { position: absolute; inset: -60px; background: center/cover no-repeat; filter: blur(40px) brightness(.4); transform: scale(1.1); }
.lrUsCard { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; animation: lrStoryIn .45s cubic-bezier(.2,1,.3,1) both; }
@media (min-width: 700px) { .lrUsCard { width: auto; height: min(94vh, 900px); aspect-ratio: 9 / 16; border-radius: 12px; box-shadow: 0 40px 80px -30px #000; } }
.lrUsSlide { position: absolute; inset: 0; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: pointer; }
.lrUsPic { position: absolute; inset: 0; background: linear-gradient(160deg, var(--lr-a), #962FBF 60%, #4F5BD5) center/cover no-repeat; animation: lrKen 12s ease-out both, lrFadeIn .5s ease both; }
.lrUsGrad { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.55), transparent 18%, transparent 55%, rgba(0,0,0,.7)); }
.lrUsText--hi::before, .lrUsText--end::before { content: ""; position: absolute; left: 50%; top: 50%; width: 150%; height: 260%; transform: translate(-50%,-50%); background: radial-gradient(closest-side, rgba(0,0,0,.5), transparent); z-index: -1; pointer-events: none; }
.lrUsText { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); padding: 0 22px; text-align: center; color: #fff; animation: lrStick .5s cubic-bezier(.2,1.3,.4,1) both; }
.lrUsHi { margin: 0; font: 400 clamp(44px, 12vw, 64px)/1.05 var(--font-us-script), "Grand Hotel", cursive; text-shadow: 0 4px 24px rgba(0,0,0,.45); overflow-wrap: anywhere; }
.lrUsHi--end { font-size: clamp(36px, 10vw, 52px); }
.lrUsTip { display: inline-block; margin: 18px 0 0; font-size: 12.5px; font-weight: 700; padding: 6px 12px; border-radius: 99px; background: rgba(0,0,0,.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.lrUsBody { margin: 0; font-size: clamp(19px, 5.4vw, 24px); line-height: 1.55; font-weight: 700; }
.lrUsBody.is-long { font-size: clamp(16px, 4.5vw, 20px); }
.lrUsBody span { padding: 3px 9px; border-radius: 8px; background: #fff; color: #111; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.lrUsFrom { margin: 10px 0 0; font-size: 17px; font-weight: 700; }
.lrUsDmBtn { margin-top: 22px; padding: 10px 18px; border-radius: 99px; border: none; background: rgba(255,255,255,.95); color: #111 !important; font-weight: 700; font-size: 14px; cursor: pointer; }
.lrUsBars { position: absolute; left: 8px; right: 8px; top: calc(8px + env(safe-area-inset-top, 0px)); display: flex; gap: 3px; z-index: 5; pointer-events: none; }
.lrUsBars span { flex: 1; height: 2.5px; border-radius: 2px; background: rgba(255,255,255,.35); overflow: hidden; }
.lrUsBars i { display: block; height: 100%; background: #fff; transform-origin: left; transform: scaleX(0); }
.lrUsBars i.is-done { transform: scaleX(1); }
.lrUsBars i.is-run { animation: lrFillX linear both; }
.lrUsHead { position: absolute; left: 12px; right: 60px; top: calc(20px + env(safe-area-inset-top, 0px)); display: flex; align-items: center; gap: 8px; z-index: 5; color: #fff; pointer-events: none; }
.lrUsHead b { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lrUsHead small { font-size: 13px; opacity: .7; }
.lrUsDots { margin-left: auto; letter-spacing: 1px; font-size: 12px; }
.lr--us .lrX { top: calc(18px + env(safe-area-inset-top, 0px)); right: 8px; background: transparent; }
@media (min-width: 700px) { .lr--us .lrX { top: 18px; right: 18px; background: rgba(255,255,255,.14); } }
.lrUsCount { position: absolute; right: 14px; top: calc(62px + env(safe-area-inset-top, 0px)); z-index: 5; font-size: 11px; font-weight: 700; color: rgba(255,255,255,.8); background: rgba(0,0,0,.25); padding: 2px 8px; border-radius: 99px; pointer-events: none; }
.lrUsReply { position: absolute; left: 0; right: 0; bottom: 0; z-index: 6; display: flex; align-items: center; gap: 12px; padding: 10px 12px calc(12px + env(safe-area-inset-bottom, 0px)); }
.lrUsInput { flex: 1; min-width: 0; text-align: left; padding: 11px 16px; border-radius: 99px; border: 1px solid rgba(255,255,255,.6); background: transparent; color: #fff; font-size: 14px; cursor: pointer; }
.lrUsIc { border: none; background: none; cursor: pointer; padding: 4px; display: grid; place-items: center; transition: transform .2s cubic-bezier(.2,1.6,.4,1); }
.lrUsIc.is-on { transform: scale(1.15); }
.lrUsDm { display: flex; flex-direction: column; background: #fff; color: #000; animation: lrSlideL .35s cubic-bezier(.2,1,.3,1) both; }
.lrUsDmHead { flex: none; display: flex; align-items: center; gap: 10px; padding: calc(10px + env(safe-area-inset-top, 0px)) 60px 10px 8px; border-bottom: 1px solid #EFEFEF; }
.lrUsDmHead b { display: block; font-size: 15px; }
.lrUsDmHead small { font-size: 12px; color: #737373; }
.lrUsBack { border: none; background: none; cursor: pointer; padding: 6px; display: grid; }
.lr--us .lrUsDm ~ .lrX, .lr--us:has(.lrUsDm) .lrX { color: #000; background: #EFEFEF; top: calc(10px + env(safe-area-inset-top, 0px)); }
.lrUsThread { flex: 1; min-height: 0; position: relative !important; }
.lrUsThreadIn { max-width: 640px; margin: 0 auto; padding: 18px 14px calc(30px + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; }
.lrUsThreadTop { display: grid; justify-items: center; gap: 4px; margin: 10px 0 18px; }
.lrUsThreadTop b { font-size: 18px; margin-top: 6px; }
.lrUsThreadTop small { font-size: 13px; color: #737373; }
.lrUsDay { align-self: center; margin: 0 0 12px; font-size: 12px; color: #737373; font-weight: 600; }
.lrUsMsg { align-self: flex-start; max-width: 82%; margin: 0 0 6px; padding: 10px 14px; border-radius: 20px; background: #EFEFEF; font-size: 15px; line-height: 1.45; overflow-wrap: anywhere; animation: lrMsg .4s cubic-bezier(.2,1.3,.4,1) both; }
.lrUsMsg--sign { font-style: italic; }
.lrUsMsg--me { align-self: flex-end; background: linear-gradient(135deg, #A033FF, #FF3D7F); color: #fff; font-size: 30px; padding: 6px 14px; margin-top: 10px; }
.lrUsSeen { align-self: flex-end; margin: 2px 4px 0; font-size: 11.5px; color: #737373; animation: lrFadeIn .4s both; }

/* ── loveflix ── */
.lr--loveflix { font-family: ${IN}; background: #000; color: #fff; --lf-red: #E50914; }
.lrLfL { display: inline-block; font: 700 1.25em/1 ${OS}; color: var(--lr-a); transform: scaleY(1.15); margin-right: 6px; }
.lrLfHero { position: absolute; inset: 0; background: center/cover no-repeat; animation: lrKen 14s ease-out both; }
.lrLfHero--dim { filter: brightness(.35) blur(4px); transform: scale(1.06); animation: none; }
.lrLfGateBg { display: grid; place-items: center; padding: 16px; background: #141414; }
.lrLfGate { text-align: left; background: rgba(20,20,20,.86); border-radius: 6px; padding: 28px 24px 4px; box-shadow: 0 30px 60px -20px #000; animation: lrAlert .35s cubic-bezier(.2,1.3,.4,1) both; }
.lrLfGate .lrGateKick { font-size: 14px; font-weight: 600; color: #b3b3b3; display: flex; align-items: center; }
.lrLfGate .lrGateQ { font: 600 clamp(24px, 5vw, 34px)/1.15 ${IN}; margin: 10px 0 8px; }
.lrLfGate .lrGateNote { color: #b3b3b3; opacity: 1; font-size: 13px; }
.lrLfGate .lrGateYesRow, .lrLfGate .lrGateNoRow { justify-content: flex-start; }
.lrLfGate .lrGateYes { padding: 11px 26px; border-radius: 4px; border: none; background: #fff; color: #000 !important; font-weight: 700; font-size: 16px; }
.lrLfGate .lrGateNo { padding: 9px 22px; border-radius: 4px; border: none; background: rgba(109,109,110,.7); color: #fff; font-weight: 600; font-size: 14px; }
.lrLfSting { display: grid; place-items: center; background: #000; overflow: hidden; }
.lrLfRibbons { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
.lrLfRibbons i { position: absolute; left: calc((var(--k) - 4) * 3.2vmin - 1.4vmin); top: -40vmin; width: 2.8vmin; height: 80vmin;
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--lr-a) calc(55% + var(--k) * 5%), #ff7aa0), transparent); transform-origin: center;
  animation: lrRibbon 1.9s cubic-bezier(.7,0,.3,1) both; animation-delay: calc(.35s + var(--k) * 30ms); opacity: 0; }
.lrLfBigL { position: relative; font: 700 38vmin/1 ${OS}; color: var(--lr-a); text-shadow: 0 0 60px color-mix(in srgb, var(--lr-a) 70%, transparent), 0 20px 30px rgba(0,0,0,.6); animation: lrSting 1.9s cubic-bezier(.6,0,.3,1) both; }
.lrLfCard { overflow: hidden; background: #000; animation: lrFadeIn .5s ease both; }
.lrLfCardShade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.2)), linear-gradient(to top, #000 0%, transparent 45%); }
.lrLfCardIn { position: absolute; left: clamp(20px, 6vw, 80px); right: 20px; bottom: clamp(90px, 16vh, 160px); max-width: 720px; }
.lrLfOrig { margin: 0 0 6px; font: 700 clamp(12px, 1.6vw, 16px)/1 ${OS}; letter-spacing: .32em; color: #e5e5e5; display: flex; align-items: center; animation: lrRise .6s .2s both; }
.lrLfTitle { margin: 0; font: 700 clamp(58px, 12vw, 140px)/.9 ${OS}; letter-spacing: -.01em; text-transform: uppercase; text-shadow: 0 6px 30px rgba(0,0,0,.6); animation: lrTitle 1.1s .35s cubic-bezier(.2,1,.3,1) both; }
.lrLfMeta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 18px 0 8px; font-size: 15px; color: #e5e5e5; animation: lrRise .6s .9s both; }
.lrLfMatch { color: #46d369; font-weight: 700; }
.lrLfBox { border: 1px solid rgba(255,255,255,.5); padding: 0 6px; font-size: 13px; }
.lrLfHd { border: 1px solid rgba(255,255,255,.5); border-radius: 3px; padding: 0 5px; font-size: 11px; font-weight: 700; }
.lrLfStar { margin: 0; font-size: 15px; color: #bcbcbc; animation: lrRise .6s 1.1s both; }
.lrLfStar b { color: #fff; font-weight: 600; }
.lrLfSkip { position: absolute !important; inset: auto clamp(16px, 4vw, 48px) calc(28px + env(safe-area-inset-bottom, 0px)) auto !important; z-index: 20; padding: 12px 22px; border-radius: 4px; border: 1px solid rgba(255,255,255,.7); background: rgba(42,42,42,.6); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; animation: lrFadeIn .4s .4s both; }
.lrLfSkip:hover { background: #fff; color: #000 !important; }
.lrLfRoll { background: #000; animation: lrFadeIn .6s ease both; }
.lrLfHero--roll { opacity: .28; filter: saturate(.8); }
.lrLfVignette { position: absolute; inset: 0; background: linear-gradient(#000 0%, rgba(0,0,0,.2) 22%, rgba(0,0,0,.2) 70%, #000 100%), radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.8)); pointer-events: none; }
.lrLfCredits { position: absolute !important; inset: 0 0 76px 0; scrollbar-width: none; outline: none; }
.lrLfCredits::-webkit-scrollbar { display: none; }
.lrLfCol { max-width: 720px; margin: 0 auto; padding: calc(80px + env(safe-area-inset-top, 0px)) 22px 42vh; text-align: center; }
.lr.is-reduced .lrLfCol { padding-bottom: 60px; }
.lrLfEp { margin: 0; font: 700 13px/1 ${OS}; letter-spacing: .28em; text-transform: uppercase; color: #bcbcbc; display: flex; justify-content: center; align-items: center; }
.lrLfEpT { margin: 12px 0 0; font: 700 clamp(44px, 10vw, 84px)/.95 ${OS}; text-transform: uppercase; }
.lrLfGap { height: 26vh; }
.lrLfGreet { margin: 0 0 22px; font: italic 400 clamp(26px, 5vw, 34px)/1.2 ${PF}; color: #fff; }
.lrLfP { margin: 0 0 22px; font-size: clamp(18px, 2.6vw, 22px); line-height: 1.6; font-weight: 500; color: #fff; text-shadow: 0 0 6px #000, 0 2px 3px #000; overflow-wrap: anywhere; }
.lrLfSign { text-align: center; font: italic 400 22px ${PF}; color: #ddd; margin: 26px 0 70px; }
.lrLfRole { display: grid; gap: 6px; margin: 0 0 34px; }
.lrLfRole small { font: 600 12px/1 ${IN}; letter-spacing: .3em; text-transform: uppercase; color: #8c8c8c; }
.lrLfRole b { font: 700 clamp(24px, 4vw, 32px)/1.1 ${OS}; letter-spacing: .04em; text-transform: uppercase; }
.lrLfStamp { display: inline-grid; justify-items: center; margin: 40px 0 14px; padding: 16px 30px 14px; border: 4px double var(--lr-a); border-width: 6px; border-radius: 6px; color: var(--lr-a); transform: rotate(-6deg) scale(1.6); opacity: 0; transition: transform .5s cubic-bezier(.2,1.6,.4,1), opacity .3s ease; }
.lrLfStamp.is-on { transform: rotate(-6deg) scale(1); opacity: 1; }
.lr.is-reduced .lrLfStamp { transform: rotate(-6deg); opacity: 1; transition: none; }
.lrLfStamp b { font: 700 clamp(40px, 8vw, 64px)/.9 ${OS}; text-transform: uppercase; letter-spacing: .02em; }
.lrLfStamp span { font: 700 16px/1 ${OS}; letter-spacing: .42em; text-transform: uppercase; margin-top: 8px; padding-left: .42em; }
.lrLfNext { margin: 14px 0 0; color: #8c8c8c; font-size: 14px; letter-spacing: .08em; }
.lrLfBar { position: absolute !important; inset: auto 0 0 0 !important; height: calc(76px + env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 14px; padding: 0 clamp(14px, 4vw, 40px) env(safe-area-inset-bottom, 0px); background: linear-gradient(transparent, rgba(0,0,0,.9) 40%); }
.lrLfPlay { border: none; background: none; cursor: pointer; display: grid; place-items: center; padding: 6px; }
.lrLfNow { flex: 1; min-width: 0; font-size: 14px; color: #bcbcbc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lrLfNow b { color: #fff; }
.lrLfEnd { flex: none; padding: 10px 16px; border-radius: 4px; border: none; background: #fff; color: #000 !important; font-weight: 700; font-size: 14px; cursor: pointer; }

/* ── keyframes ── */
@keyframes lrIn { from { opacity: 0; } }
@keyframes lrFadeIn { from { opacity: 0; } }
@keyframes lrOut { to { opacity: 0; } }
@keyframes lrRise { from { opacity: 0; transform: translateY(14px); } }
@keyframes lrUp { from { opacity: 0; transform: translateY(60px); } }
@keyframes lrAlert { from { opacity: 0; transform: scale(1.12); } }
@keyframes lrPopIn { from { opacity: 0; transform: scale(.4); } }
@keyframes lrBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes lrPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: .6; } }
@keyframes lrBig { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.2); } 25% { opacity: 1; transform: translate(-50%,-50%) scale(1.15); } 45% { transform: translate(-50%,-50%) scale(.95); } 75% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-80%) scale(1); } }
@keyframes lrSpark { 0% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--a)) translateY(0) scale(.4); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(1); } }
@keyframes lrFall { 0% { transform: translate3d(0,-20px,0) rotate(0); opacity: 1; } 100% { transform: translate3d(var(--x), 105vh, 0) rotate(var(--r)); opacity: .9; } }
@keyframes lrAppZoom { 0% { opacity: 0; transform: scale(.3); } 22% { opacity: 1; transform: scale(1.06); } 32% { transform: scale(1); } 55% { transform: scale(1); } 100% { transform: scale(16); opacity: .95; } }
@keyframes lrAppHero { from { transform: scale(1.35); } }
@keyframes lrAppLbl { 0%, 15% { opacity: 0; } 30%, 50% { opacity: 1; } 62%, 100% { opacity: 0; } }
@keyframes lrCount { 0% { opacity: 0; transform: scale(1.8); } 18% { opacity: 1; transform: scale(1); } 80% { opacity: 1; transform: scale(.94); } 100% { opacity: 0; transform: scale(.7); } }
.lrWtCount span:last-child { animation-name: lrCountLast; }
@keyframes lrCountLast { 0% { opacity: 0; transform: scale(1.8); } 18% { opacity: 1; transform: scale(1); } 100% { opacity: 1; transform: scale(1.1); } }
@keyframes lrKen { from { transform: scale(1.18) translate3d(2%, 1.5%, 0); } to { transform: scale(1.02) translate3d(-1%, -1%, 0); } }
@keyframes lrCap { from { opacity: 0; transform: translate(-50%, 8px); } }
@keyframes lrRing { from { transform: scale(.5); opacity: .9; } to { transform: scale(2.4); opacity: 0; } }
@keyframes lrWipe { to { transform: scaleX(0); } }
@keyframes lrPrint { from { transform: translateY(-100%); } }
@keyframes lrFillX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes lrDot { to { transform: scale(1); } }
@keyframes lrTruck { from { transform: translateX(-50%) scaleX(-1); } to { transform: translateX(calc(min(100vw - 40px, 520px) * .75 - 50%)) scaleX(-1); } }
@keyframes lrDrop { 0% { opacity: 0; transform: translateY(-70vh) rotate(-8deg); } 70% { opacity: 1; transform: translateY(0) rotate(1deg); } 85% { transform: translateY(-10px) rotate(0); } 100% { transform: translateY(0); } }
@keyframes lrTear { 0% { transform: scaleY(1); opacity: 1; } 60% { transform: scaleY(.1) rotate(8deg); opacity: 1; } 100% { transform: scaleY(0) rotate(14deg) translateX(30px); opacity: 0; } }
@keyframes lrFlapL { to { transform: rotateY(-118deg) rotateZ(-8deg); } }
@keyframes lrFlapR { to { transform: rotateY(118deg) rotateZ(8deg); } }
@keyframes lrRiseNote { 0% { transform: translateY(0); } 55% { transform: translateY(-120px) rotate(-3deg); } 100% { transform: translateY(-110px) scale(1.5) rotate(0); } }
@keyframes lrNoteIn { from { opacity: 0; transform: translateY(50px) scale(.7) rotate(-4deg); } }
@keyframes lrSpin { to { transform: rotate(360deg); } }
@keyframes lrUsGrow { 0% { opacity: 0; transform: scale(.6); } 25% { opacity: 1; transform: scale(1); } 70% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(7); } }
@keyframes lrStoryIn { from { opacity: 0; transform: scale(.4); } }
@keyframes lrStick { from { opacity: 0; transform: translateY(-50%) scale(.85); } }
@keyframes lrSlideL { from { transform: translateX(100%); } }
@keyframes lrMsg { from { opacity: 0; transform: translateY(10px) scale(.9); } }
@keyframes lrRibbon { 0% { opacity: 0; transform: scaleY(0); } 25% { opacity: 1; transform: scaleY(1); } 70% { opacity: 1; transform: scaleY(1) scaleX(1); } 100% { opacity: 0; transform: scaleY(1.4) scaleX(4); } }
@keyframes lrSting { 0% { opacity: 0; transform: scale(.7); } 20% { opacity: 1; transform: scale(1); } 60% { opacity: 1; transform: scale(1.08); } 100% { opacity: 0; transform: scale(9); } }
@keyframes lrTitle { from { opacity: 0; transform: scale(1.12); letter-spacing: .08em; } }

@media (prefers-reduced-motion: reduce) {
  .lr, .lr *, .lr *::before, .lr *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  .lrUsBars i.is-run { transform: scaleX(1); }
}
`;
