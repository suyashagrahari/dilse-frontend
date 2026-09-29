"use client";

// ─── EditorDock — the editor's one floating control ──────────────────────────
//
// The real-app templates (/product, /app, /watch, /recharge, /us, /loveflix)
// are clones of apps people use every day, and the illusion only holds if the
// clone owns the whole screen: its own header at the very top edge, its own
// tab bar at the very bottom. So the editor reserves no space at all. Instead
// everything the sender needs — Back, Edit, Create → Publish → Share — lives in
// one compact capsule that floats bottom-left, over the content.
//
// It never lands on the app's own chrome. `avoidBottom` names the template's
// bottom bars (tab bars, pay bars, mini-players); `avoidLeft` names its side
// rails. The dock measures whichever of them are on screen right now and sits
// just clear of them, so a bar that only appears on one step, or only below one
// breakpoint, is handled without a breakpoint table here. The bottom-right
// corner is left free for the LetterPop envelope.
//
// z-index 130: above every template's own chrome (≤ 110), below every editor
// sheet, the AI panel, the publishing overlay and the auth modal (≥ 140).

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface DockAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  /** A small count bubble (pending reviews). Hidden at 0. */
  badge?: number;
  disabled?: boolean;
}

export interface EditorDockProps {
  onBack: () => void;
  /** The polymorphic Create → Publish → Share button. */
  primary: DockAction;
  /** Quieter actions shown before the primary one (Edit, Reviews). */
  secondary?: (DockAction | null | false | undefined)[];
  /** Glass tint: pick the one that matches the app underneath. */
  tone?: "light" | "dark";
  /** Primary fill — a colour or a gradient. */
  accent: string;
  accentInk?: string;
  font?: string;
  /** CSS selector(s) for the template's bottom bars to float above. */
  avoidBottom?: string;
  /** CSS selector(s) for the template's left rails to float beside. */
  avoidLeft?: string;
  zIndex?: number;
}

const GAP = 12;
/** Other floaters in the bottom band the dock steps over. */
const DODGE = ".lpDock";

function BackGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.5 5 8 12l6.5 7" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Visible, laid-out elements matching `sel`. */
function visible(sel: string): DOMRect[] {
  const out: DOMRect[] = [];
  document.querySelectorAll(sel).forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) return;
    out.push(r);
  });
  return out;
}

export default function EditorDock({
  onBack,
  primary,
  secondary,
  tone = "light",
  accent,
  accentInk = "#fff",
  font = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  avoidBottom,
  avoidLeft,
  zIndex = 130,
}: EditorDockProps) {
  const [lift, setLift] = useState({ bottom: 0, left: 0 });
  const liftRef = useRef(lift);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      let bottom = 0;
      let left = 0;
      if (avoidBottom) {
        for (const r of visible(avoidBottom)) {
          // Only bars pinned to the bottom edge and spanning a fair width count.
          if (r.bottom >= vh - 4 && r.top > vh / 2 && r.width > vw * 0.4) bottom = Math.max(bottom, vh - r.top);
        }
      }
      if (avoidLeft) {
        for (const r of visible(avoidLeft)) {
          if (r.left <= 2 && r.height > vh / 2 && r.right < vw / 2) left = Math.max(left, r.right);
        }
      }
      // Floating things that share the bottom band — the LetterPop envelope and
      // its teaser bubble. If one would sit under the dock, the dock rises
      // above it until it goes away.
      const w = dockRef.current?.offsetWidth ?? 0;
      const h = dockRef.current?.offsetHeight ?? 52;
      for (const r of visible(DODGE)) {
        const dockBottomY = vh - bottom - GAP;
        const overlapsX = r.left < left + GAP + w + 20;
        const overlapsY = r.top < dockBottomY && r.bottom > dockBottomY - h;
        if (overlapsX && overlapsY) bottom = Math.max(bottom, vh - r.top + 4);
      }
      bottom = Math.round(bottom);
      left = Math.round(left);
      if (bottom !== liftRef.current.bottom || left !== liftRef.current.left) {
        liftRef.current = { bottom, left };
        setLift(liftRef.current);
      }
    };
    measure();
    // Bars come and go with the app's own state (a pay bar on one step, a tab
    // bar only in browse) — a cheap poll catches all of it without wiring into
    // each template's internals.
    const id = window.setInterval(measure, 500);
    // …and a DOM change (a bar or the envelope bubble mounting) re-measures on
    // the next frame, so the dock moves with it rather than after it.
    let raf = 0;
    const soon = () => {
      if (!raf) raf = window.requestAnimationFrame(() => { raf = 0; measure(); });
    };
    const mo = new MutationObserver(soon);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", soon);
    return () => {
      window.clearInterval(id);
      window.cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", soon);
    };
  }, [avoidBottom, avoidLeft]);


  const extras = (secondary ?? []).filter(Boolean) as DockAction[];

  const style = {
    "--ed-bottom": `${lift.bottom + GAP}px`,
    "--ed-left": `${lift.left + GAP}px`,
    "--ed-accent": accent,
    "--ed-accent-ink": accentInk,
    zIndex,
    fontFamily: font,
  } as CSSProperties;

  return (
    <>
      <style>{DOCK_CSS}</style>
      <div ref={dockRef} className={`ed-dock ed-${tone}`} style={style} data-editor-dock="" role="toolbar" aria-label="Editor">
        <button type="button" className="ed-btn ed-back" onClick={onBack} aria-label="Back to templates" title="Back">
          <BackGlyph />
        </button>
        <span className="ed-sep" aria-hidden="true" />
        {extras.map((a) => (
          <button key={a.label} type="button" className="ed-btn ed-ghost" onClick={a.onClick} disabled={a.disabled}>
            {a.icon}
            <span>{a.label}</span>
            {a.badge ? <b className="ed-badge">{a.badge}</b> : null}
          </button>
        ))}
        <button
          type="button"
          className="ed-btn ed-primary"
          onClick={primary.onClick}
          disabled={primary.disabled}
          aria-busy={primary.disabled || undefined}
          data-editor-primary=""
        >
          {primary.icon}
          <span>{primary.label}</span>
        </button>
      </div>
    </>
  );
}

const DOCK_CSS = `
.ed-dock {
  position: fixed;
  left: calc(var(--ed-left) + env(safe-area-inset-left, 0px));
  bottom: calc(var(--ed-bottom) + env(safe-area-inset-bottom, 0px));
  /* The bottom-right corner belongs to the LetterPop envelope. */
  max-width: calc(100vw - var(--ed-left) - 96px);
  display: flex; align-items: center; gap: 2px; padding: 4px;
  border-radius: 999px;
  -webkit-backdrop-filter: saturate(180%) blur(18px); backdrop-filter: saturate(180%) blur(18px);
  transition: bottom .28s cubic-bezier(.2,.9,.3,1), left .28s cubic-bezier(.2,.9,.3,1);
  animation: ed-in .42s cubic-bezier(.2,1.1,.3,1) both .15s;
  -webkit-tap-highlight-color: transparent;
}
.ed-light {
  background: rgba(255,255,255,.84); color: #1C1C1E;
  box-shadow: 0 0 0 .5px rgba(0,0,0,.12), 0 12px 32px -12px rgba(0,0,0,.38), 0 2px 6px rgba(0,0,0,.06);
}
.ed-dark {
  background: rgba(30,30,32,.78); color: #F4F4F5;
  box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 14px 34px -12px rgba(0,0,0,.8);
}
.ed-btn {
  position: relative; flex: none;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 44px; min-width: 44px; padding: 0 14px; border: 0; border-radius: 999px;
  background: transparent; color: inherit; font: inherit; font-size: 14px; font-weight: 600; letter-spacing: -.005em;
  white-space: nowrap; cursor: pointer; touch-action: manipulation;
  transition: background-color .15s ease, transform .12s ease, opacity .15s ease;
}
.ed-btn:active { transform: scale(.95); }
.ed-btn:disabled { opacity: .6; cursor: default; transform: none; }
.ed-btn:focus-visible { outline: 2px solid var(--ed-accent); outline-offset: 2px; }
.ed-back { width: 44px; padding: 0; }
@media (hover: hover) {
  .ed-light .ed-ghost:hover, .ed-light .ed-back:hover { background: rgba(0,0,0,.06); }
  .ed-dark .ed-ghost:hover, .ed-dark .ed-back:hover { background: rgba(255,255,255,.1); }
  .ed-primary:hover { filter: brightness(1.05); }
}
.ed-sep { width: 1px; height: 22px; flex: none; margin: 0 2px; }
.ed-light .ed-sep { background: rgba(0,0,0,.12); }
.ed-dark .ed-sep { background: rgba(255,255,255,.16); }
.ed-primary {
  padding: 0 18px; margin-left: 2px; font-weight: 700;
  background: var(--ed-accent); color: var(--ed-accent-ink);
  box-shadow: inset 0 0 0 .5px rgba(0,0,0,.08), 0 6px 14px -8px rgba(0,0,0,.5);
}
.ed-badge {
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; display: inline-grid; place-items: center;
  background: #E0284F; color: #fff; font-size: 11px; font-weight: 800; line-height: 1;
}
.ed-btn svg { flex: none; }
@media (hover: hover) and (min-width: 768px) {
  .ed-btn { height: 40px; min-width: 40px; }
  .ed-back { width: 40px; }
}
@media (max-width: 359px) {
  .ed-btn { padding: 0 11px; font-size: 13px; }
  .ed-back { padding: 0; }
  .ed-primary { padding: 0 14px; }
}
@keyframes ed-in { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ed-dock { animation: none; transition: none; } .ed-btn { transition: none; } }
`;
