"use client";

// A letter that waits in the corner.
//
// A small envelope pops into the bottom-right a moment after the page opens,
// bobs, and wears an unread "1" like a real notification. Tapping it opens the
// main letter over whatever the template is showing — a bottom sheet on phones,
// a centred card on wider screens — with an optional "answer me first" question
// whose "no" button runs away. After reading, the envelope stays as a quiet
// "read" chip so the letter can be opened again.
//
// It carries its own colours (`accent`, `paper`, `ink`) instead of reading the
// Love Kit's CSS variables, because the templates that use it are clones of
// real apps with palettes of their own. `bottom` lifts it above a template's
// own bottom bar (tab bars, buy boxes, mini-players).
//
// `variant` (the six real-app clones) swaps the sheet for a full-screen,
// app-themed reveal (see LetterReveal.tsx) and dresses the corner envelope and
// its teaser like that app's own notification. Without it nothing changes.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import LetterReveal, { type LetterVariant } from "./LetterReveal";

export type { LetterVariant };

export interface LetterPopProps {
  letter: string;
  from?: string;
  to?: string;
  /** Optional gate: they answer this before the letter opens. */
  question?: string;
  /** Label for the yes button on the gate. */
  answer?: string;
  /** Accent for the envelope, badge and buttons. */
  accent?: string;
  /** Second accent for gradients. */
  accent2?: string;
  paper?: string;
  ink?: string;
  /** Distance from the bottom edge in px (added to the safe area). */
  bottom?: number;
  right?: number;
  /** Delay before the envelope pops in, ms. */
  delay?: number;
  /** Bubble text shown next to the envelope the first time. */
  teaser?: string;
  sign?: string;
  zIndex?: number;
  /** Open immediately (e.g. when the template reaches its finale). */
  forceOpen?: boolean;
  onOpened?: () => void;
  /** Full-screen reveal themed as one of the real-app templates. */
  variant?: LetterVariant;
  /** Photos the reveal may use as backdrops (first = hero). */
  photos?: string[];
  /** App icon / channel or profile avatar. */
  avatar?: string;
  /** App, show or video name. */
  title?: string;
  /** Social handle (us). */
  handle?: string;
}

// "no" lives on its own row under "yes" and only ever moves sideways/down, so
// it can never land on top of the yes button (it used to on a 390px screen).
const DODGE = [
  { x: -96, y: 10, t: "are you sure? 🥺" },
  { x: 92, y: 26, t: "try again 😤" },
  { x: -70, y: 34, t: "not an option 🙅" },
  { x: 76, y: 4, t: "nice try 😌" },
];

export default function LetterPop({
  letter,
  from,
  to,
  question,
  answer = "yes 💗",
  accent = "#ff3d7f",
  accent2 = "#ff8a3d",
  paper = "#fffaf3",
  ink = "#2a1a1f",
  bottom = 18,
  right = 16,
  delay = 2200,
  teaser = "a letter for you 💌",
  sign,
  zIndex = 90,
  forceOpen,
  onOpened,
  variant,
  photos,
  avatar,
  title,
  handle,
}: LetterPopProps) {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [stage, setStage] = useState<"gate" | "opening" | "open">(question?.trim() ? "gate" : "opening");
  const [dodge, setDodge] = useState(-1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const [reduce] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const t1 = window.setTimeout(() => setShown(true), delay);
    const t2 = window.setTimeout(() => setBubble(true), delay + 700);
    const t3 = window.setTimeout(() => setBubble(false), delay + 6500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); };
  }, [delay]);

  const openLetter = useCallback(() => {
    setBubble(false);
    setShown(true);
    setOpen(true);
    setDodge(-1);
    setStage(question?.trim() ? "gate" : "opening");
  }, [question]);

  // A parent reaching its finale can open the letter. Adjusting state when a
  // prop changes, during render, is React's recommended alternative to an effect.
  const [prevForce, setPrevForce] = useState(forceOpen);
  if (forceOpen !== prevForce) {
    setPrevForce(forceOpen);
    if (forceOpen) {
      setBubble(false);
      setShown(true);
      setOpen(true);
      setDodge(-1);
      setStage(question?.trim() ? "gate" : "opening");
    }
  }

  // Envelope → paper, then mark read.
  useEffect(() => {
    if (!open || stage !== "opening" || variant) return;
    const t = window.setTimeout(() => {
      setStage("open");
      setRead(true);
      onOpened?.();
    }, reduce ? 0 : 1100);
    return () => window.clearTimeout(t);
  }, [open, stage, onOpened, variant, reduce]);

  const onRevealRead = useCallback(() => { setRead(true); onOpened?.(); }, [onOpened]);

  // Lock the page behind the letter, and hand focus back to the envelope after.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const html = document.documentElement;
      const prev = [html.style.overflow, document.body.style.overflow];
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => { html.style.overflow = prev[0]; document.body.style.overflow = prev[1]; };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      const r = window.requestAnimationFrame(() => fabRef.current?.focus({ preventScroll: true }));
      return () => window.cancelAnimationFrame(r);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!variant || !question?.trim()) closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant, question]);

  if (!letter?.trim()) return null;

  let paras = letter.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);
  // Letters that already open with their own greeting ("Meera,", "Dear Meera,",
  // "Hey you,") keep it, and the component's "Dear <name>," is dropped — the
  // AI and most senders write one, and two in a row read like a glitch.
  const ownGreeting = paras.length > 0 && paras[0].length <= 40 && /[,!]$/.test(paras[0])
    && (/^(dear|hi|hey|hello|my|to)\b/i.test(paras[0]) || (!!to && paras[0].toLowerCase().includes(to.trim().toLowerCase())));
  const greeting = ownGreeting ? paras[0] : to ? `Dear ${to},` : "";
  if (ownGreeting) paras = paras.slice(1);
  const vars = { "--lp-a": accent, "--lp-b": accent2, "--lp-paper": paper, "--lp-ink": ink } as CSSProperties;

  return (
    <div style={vars}>
      <style>{CSS}</style>

      {/* The envelope in the corner */}
      {shown && !open && (
        <div className={`lpDock${variant ? ` lpDock--${variant}` : ""}`} style={{ right, bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`, zIndex }}>
          {bubble && !read && (
            variant ? (
              <button type="button" className="lpBubble lpBanner" onClick={openLetter}>
                <span className="lpBanIc" style={avatar || photos?.[0] ? { backgroundImage: `url("${(avatar || photos?.[0] || "").replace(/"/g, "%22")}")` } : undefined}>
                  {BANNER[variant].glyph}
                </span>
                <span className="lpBanTx">
                  <span className="lpBanTop"><b>{BANNER[variant].app(title, from)}</b><small>now</small></span>
                  <span className="lpBanMsg">{teaser}</span>
                </span>
              </button>
            ) : (
              <button type="button" className="lpBubble" onClick={openLetter}>{teaser}</button>
            )
          )}
          <button
            ref={fabRef}
            type="button"
            className={`lpFab${read ? " is-read" : ""}`}
            onClick={openLetter}
            aria-label={read ? "Open the letter again" : `Open your letter${from ? ` from ${from}` : ""}`}
          >
            {variant === "us" ? (
              <svg viewBox="0 0 24 24" width="27" height="27" aria-hidden><path d="M22 3L9.2 10.2M22 3l-6.5 18-3.3-8.1L4 9.6z" fill="none" stroke="#111" strokeWidth="2" strokeLinejoin="round" /></svg>
            ) : (
            <svg viewBox="0 0 48 36" width="30" height="23" aria-hidden>
              <rect x="1.5" y="1.5" width="45" height="33" rx="5" fill="var(--lp-paper)" stroke="rgba(0,0,0,.12)" />
              <path d="M3 5l21 16L45 5" fill="none" stroke="var(--lp-a)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M24 26c-4-3-7-5-7-8a3.4 3.4 0 0 1 7-1 3.4 3.4 0 0 1 7 1c0 3-3 5-7 8z" fill="var(--lp-a)" />
            </svg>
            )}
            {!read && <span className="lpBadge">1</span>}
            {read && <span className="lpRead">read</span>}
          </button>
        </div>
      )}

      {/* The letter */}
      {open && variant && (
        <LetterReveal
          variant={variant}
          paras={paras}
          greeting={greeting}
          sign={sign || "forever yours,"}
          from={from}
          to={to}
          question={question?.trim() || undefined}
          answer={answer}
          accent={accent}
          accent2={accent2}
          paper={paper}
          ink={ink}
          photos={(photos ?? []).filter(Boolean)}
          avatar={avatar || undefined}
          title={title}
          handle={handle}
          reduce={reduce}
          zIndex={Math.max(zIndex + 10, 1000)}
          closeRef={closeRef}
          onClose={() => setOpen(false)}
          onRead={onRevealRead}
        />
      )}

      {open && !variant && (
        <div className="lpOverlay" style={{ zIndex: zIndex + 10 }} role="dialog" aria-modal="true" aria-label="Your letter" onClick={() => setOpen(false)}>
          <div className="lpSheet" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="lpClose" onClick={() => setOpen(false)} aria-label="Close the letter">✕</button>

            {stage === "gate" && (
              <div className="lpGate">
                <div className="lpSeal" aria-hidden>💌</div>
                <p className="lpKicker">{from ? `${from} left you a letter` : "someone left you a letter"}</p>
                <h3 className="lpQ">{question}</h3>
                <div className="lpBtns">
                  <button type="button" className="lpYes" onClick={() => setStage("opening")}>{answer}</button>
                  <button
                    type="button"
                    className="lpNo"
                    onClick={() => setDodge((d) => (d + 1) % DODGE.length)}
                    onMouseEnter={() => setDodge((d) => (d + 1) % DODGE.length)}
                    style={dodge >= 0 ? { transform: `translate(${DODGE[dodge].x}px, ${DODGE[dodge].y}px)` } : undefined}
                  >
                    {dodge >= 0 ? DODGE[dodge].t : "no"}
                  </button>
                </div>
              </div>
            )}

            {stage === "opening" && (
              <div className="lpEnvWrap" aria-hidden>
                <div className="lpEnv">
                  <div className="lpFlap" />
                  <div className="lpPaperPeek" />
                  <div className="lpHeart">♥</div>
                </div>
              </div>
            )}

            {stage === "open" && (
              <article className="lpPaper">
                {greeting && <p className="lpTo">{greeting}</p>}
                {paras.map((p, i) => (
                  <p key={i} className="lpPara" style={{ animationDelay: `${120 + i * 140}ms` }}>{p}</p>
                ))}
                <p className="lpSign" style={{ animationDelay: `${160 + paras.length * 140}ms` }}>
                  {sign || "forever yours,"}
                  {from && <><br /><strong>{from}</strong></>}
                </p>
              </article>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// The teaser, written the way each app words its own notification.
const BANNER: Record<LetterVariant, { glyph: string; app: (title?: string, from?: string) => string }> = {
  app: { glyph: "", app: (t) => t || "App Store" },
  watch: { glyph: "", app: (_t, f) => (f ? `${f} · Premiere` : "Premiere") },
  recharge: { glyph: "", app: (_t, f) => (f ? `${f} · ₹∞` : "Payment received") },
  product: { glyph: "📦", app: () => "Delivered today" },
  us: { glyph: "", app: (_t, f) => f || "New message" },
  loveflix: { glyph: "L", app: () => "LoveFlix · New episode" },
};

const CSS = `
.lpDock { position: fixed; display: flex; align-items: center; gap: 8px; animation: lpPop .55s cubic-bezier(.2,1.4,.4,1) backwards; }
.lpFab { position: relative; width: 56px; height: 56px; border-radius: 18px; border: none; cursor: pointer; display: grid; place-items: center;
  background: linear-gradient(135deg, var(--lp-a), var(--lp-b)); box-shadow: 0 12px 28px -8px color-mix(in srgb, var(--lp-a) 70%, transparent), 0 0 0 3px rgba(255,255,255,.9);
  animation: lpBob 2.6s ease-in-out infinite; -webkit-tap-highlight-color: transparent; transition: transform .2s ease; }
.lpFab:hover { transform: scale(1.06) rotate(-4deg); }
.lpFab:active { transform: scale(.94); }
.lpFab.is-read { animation: none; opacity: .92; width: 48px; height: 48px; border-radius: 16px; }
.lpBadge { position: absolute; top: -6px; right: -6px; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 99px; background: #ff2d55; color: #fff;
  font: 800 11px/20px system-ui, sans-serif; border: 2px solid #fff; animation: lpPulse 1.6s ease-in-out infinite; }
.lpRead { position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); padding: 1px 6px; border-radius: 99px; background: #fff; color: #555; font: 700 9px/14px system-ui, sans-serif; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
.lpBubble { max-width: 170px; padding: 8px 12px; border-radius: 14px 14px 4px 14px; border: none; cursor: pointer; background: #fff; color: #222;
  font: 700 12.5px/1.25 system-ui, sans-serif; box-shadow: 0 10px 24px -10px rgba(0,0,0,.35); animation: lpBubble .45s cubic-bezier(.2,1.3,.4,1) backwards; }
.lpOverlay { position: fixed; inset: 0; background: rgba(12,6,10,.55); display: flex; align-items: flex-end; justify-content: center; animation: lpFade .25s ease backwards; }
.lpSheet { position: relative; width: 100%; max-width: 560px; max-height: 88vh; overflow: auto; background: var(--lp-paper); color: var(--lp-ink);
  border-radius: 26px 26px 0 0; padding: 26px 22px calc(28px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -20px 60px -20px rgba(0,0,0,.5);
  animation: lpUp .45s cubic-bezier(.2,1,.3,1) backwards; }
@media (min-width: 700px) { .lpOverlay { align-items: center; } .lpSheet { border-radius: 26px; padding: 34px 38px; } }
.lpClose { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer; background: rgba(0,0,0,.06); color: var(--lp-ink); font-size: 14px; }
.lpGate { text-align: center; padding: 10px 4px 6px; }
.lpSeal { font-size: 46px; animation: lpBob 2.4s ease-in-out infinite; }
.lpKicker { margin: 8px 0 4px; font: 700 11px/1.4 system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--lp-a); }
.lpQ { margin: 4px auto 22px; max-width: 380px; font: italic 400 26px/1.2 var(--font-di-serif), 'Instrument Serif', Georgia, serif; }
.lpBtns { display: flex; flex-direction: column; justify-content: flex-start; align-items: center; gap: 12px; min-height: 118px; }
.lpYes { padding: 13px 26px; border-radius: 99px; border: none; cursor: pointer; color: #fff; font: 800 15px system-ui, sans-serif;
  background: linear-gradient(135deg, var(--lp-a), var(--lp-b)); box-shadow: 0 10px 22px -8px color-mix(in srgb, var(--lp-a) 70%, transparent); }
.lpNo { padding: 11px 18px; border-radius: 99px; border: 1.5px solid rgba(0,0,0,.14); background: transparent; color: var(--lp-ink); cursor: pointer;
  font: 700 13px system-ui, sans-serif; transition: transform .35s cubic-bezier(.2,1.4,.4,1); white-space: nowrap; }
.lpEnvWrap { display: grid; place-items: center; padding: 26px 0 30px; }
.lpEnv { position: relative; width: 200px; height: 130px; border-radius: 10px; background: color-mix(in srgb, var(--lp-a) 16%, var(--lp-paper)); box-shadow: 0 16px 34px -14px rgba(0,0,0,.35); overflow: visible; }
.lpFlap { position: absolute; left: 0; right: 0; top: 0; height: 70px; transform-origin: top; background: color-mix(in srgb, var(--lp-a) 28%, var(--lp-paper));
  clip-path: polygon(0 0, 100% 0, 50% 100%); animation: lpFlap .6s .1s cubic-bezier(.4,0,.2,1) forwards; }
.lpPaperPeek { position: absolute; left: 14px; right: 14px; top: 14px; height: 90px; border-radius: 6px; background: #fff; animation: lpPeek .6s .55s cubic-bezier(.2,1,.3,1) forwards; z-index: -1; }
.lpHeart { position: absolute; left: 50%; top: 52px; transform: translate(-50%, -50%); color: var(--lp-a); font-size: 30px; animation: lpHeart .5s ease forwards; }
.lpPaper { padding: 4px 2px; font: 400 17px/1.7 var(--font-di-serif), 'Instrument Serif', Georgia, serif; }
.lpTo { font-style: italic; font-size: 22px; margin: 4px 0 12px; }
.lpPara { margin: 0 0 12px; animation: lpLine .6s ease backwards; }
.lpSign { margin-top: 18px; text-align: right; font-style: italic; animation: lpLine .6s ease backwards; }
.lpSign strong { font-style: normal; font-family: system-ui, sans-serif; font-size: 15px; color: var(--lp-a); }
/* dressed as each app's own notification */
.lpBanner { display: flex; align-items: center; gap: 10px; max-width: min(300px, calc(100vw - 110px)); text-align: left; padding: 10px 12px; border-radius: 16px; }
.lpBanIc { flex: none; width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; background: linear-gradient(135deg, var(--lp-a), var(--lp-b)) center/cover no-repeat; color: #fff; font: 800 16px/1 system-ui, sans-serif; }
.lpBanTx { display: grid; min-width: 0; gap: 1px; }
.lpBanTop { display: flex; gap: 6px; align-items: baseline; min-width: 0; }
.lpBanTop b { font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lpBanTop small { font-size: 11px; font-weight: 500; opacity: .55; flex: none; }
.lpBanMsg { font-size: 12.5px; font-weight: 500; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.lpDock--app .lpBanner { background: rgba(250,250,252,.92); backdrop-filter: blur(20px) saturate(1.8); -webkit-backdrop-filter: blur(20px) saturate(1.8); color: #000; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif; border-radius: 20px; }
.lpDock--app .lpBadge { background: #FF3B30; }
.lpDock--watch .lpFab { border-radius: 50%; background: #212121; box-shadow: 0 12px 28px -8px rgba(0,0,0,.6), 0 0 0 2px #3f3f3f; }
.lpDock--watch .lpBadge { background: #CC0000; border-color: #0f0f0f; }
.lpDock--watch .lpBanner { background: #212121; color: #f1f1f1; border-radius: 12px; font-family: Roboto, Arial, sans-serif; box-shadow: 0 12px 30px -10px rgba(0,0,0,.6); }
.lpDock--watch .lpBanIc { border-radius: 50%; }
.lpDock--recharge .lpFab { border-radius: 50%; }
.lpDock--recharge .lpBanner { font-family: var(--font-inter), Inter, system-ui, sans-serif; border-radius: 18px; border: 1px solid #F6D5E4; }
.lpDock--recharge .lpBanIc { border-radius: 50%; }
.lpDock--product .lpFab { border-radius: 12px; background: #232F3E; box-shadow: 0 12px 26px -10px rgba(19,25,33,.6), 0 0 0 2px #fff; }
.lpDock--product .lpBadge { background: #FF9900; color: #0F1111; border-color: #232F3E; }
.lpDock--product .lpBanner { border-radius: 10px; border: 1px solid #D5D9D9; font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
.lpDock--product .lpBanTop b { color: #007600; }
.lpDock--product .lpBanIc { background: #FFF3D6 !important; font-size: 18px; }
.lpDock--us .lpFab { border-radius: 50%; background: #fff; box-shadow: 0 10px 26px -8px rgba(0,0,0,.35), 0 0 0 1px #DBDBDB; }
.lpDock--us .lpBadge { background: #FF3040; }
.lpDock--us .lpBanner { border-radius: 14px; font-family: -apple-system, system-ui, sans-serif; box-shadow: 0 10px 30px -8px rgba(0,0,0,.3); }
.lpDock--us .lpBanIc { border-radius: 50%; box-shadow: 0 0 0 2px #fff, 0 0 0 4px #D62976; }
.lpDock--loveflix .lpFab { border-radius: 8px; background: #141414; box-shadow: 0 12px 28px -8px rgba(229,9,20,.55), 0 0 0 2px var(--lp-a); }
.lpDock--loveflix .lpBadge { background: var(--lp-a); border-color: #141414; }
.lpDock--loveflix .lpBanner { background: #232323; color: #fff; border-radius: 6px; font-family: var(--font-inter), Inter, system-ui, sans-serif; box-shadow: 0 12px 30px -10px #000; border-left: 3px solid var(--lp-a); }
.lpDock--loveflix .lpBanIc { background: #000 !important; color: var(--lp-a); font: 700 22px/1 var(--font-oswald), Impact, sans-serif; border-radius: 4px; }
@keyframes lpPop { from { opacity: 0; transform: translateY(24px) scale(.6); } }
@keyframes lpBob { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-5px) rotate(-3deg); } }
@keyframes lpPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes lpBubble { from { opacity: 0; transform: translateX(10px) scale(.8); } }
@keyframes lpFade { from { opacity: 0; } }
@keyframes lpUp { from { transform: translateY(40px); opacity: 0; } }
@keyframes lpFlap { to { transform: rotateX(180deg); } }
@keyframes lpPeek { to { transform: translateY(-46px); } }
@keyframes lpHeart { to { opacity: 0; transform: translate(-50%, -50%) scale(1.8); } }
@keyframes lpLine { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) {
  .lpDock, .lpFab, .lpBadge, .lpBubble, .lpOverlay, .lpSheet, .lpSeal, .lpPara, .lpSign { animation: none !important; }
}
`;
