"use client";

// ─── PremiumTopBar — the ✦ Premium editor's controls, top-right ──────────────
//
// The $2 days float EditorDock bottom-left. Premium scenes put their big
// moments (CTAs, hold buttons, the final card) at the bottom of the screen,
// so here every editor control lives in one glass capsule in the top-right
// corner instead: Back · Edit · ✦ Create → Publish → Share.
//
// Scenes keep the top-right corner clear: PremiumRoot pads by --vw-top-space
// and every scene's own top chrome (mute, skip, chapter dots) sits left or
// centre. z-index 130, same as EditorDock: above the scene, below the sheets.

import { motion } from "framer-motion";
import type { DockAction } from "../../../_love/EditorDock";

export interface PremiumTopBarProps {
  onBack: () => void;
  primary: DockAction;
  secondary?: (DockAction | null | false | undefined)[];
  dark: boolean;
  /** Primary fill, e.g. the day's accent gradient. */
  accent: string;
  accentInk: string;
  font: string;
}

export default function PremiumTopBar({ onBack, primary, secondary, dark, accent, accentInk, font }: PremiumTopBarProps) {
  const extra = (secondary ?? []).filter(Boolean) as DockAction[];
  const glass = dark ? "rgba(14,10,18,.55)" : "rgba(255,252,246,.72)";
  const ink = dark ? "#F6EEDF" : "#2A1A22";
  const line = dark ? "rgba(255,240,210,.18)" : "rgba(60,30,20,.12)";
  return (
    <motion.nav
      aria-label="Editor"
      className="pmTopBar"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      style={{ background: glass, borderColor: line, color: ink, fontFamily: font }}
    >
      <button type="button" className="pmTopBack" onClick={onBack} aria-label="Back" style={{ color: ink }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {extra.map((a) => (
        <button key={a.label} type="button" className="pmTopGhost" onClick={a.onClick} disabled={a.disabled} style={{ color: ink }}>
          {a.label}
        </button>
      ))}
      <button type="button" className="pmTopPrimary" onClick={primary.onClick} disabled={primary.disabled} style={{ background: accent, color: accentInk }}>
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill="currentColor" /></svg>
        {primary.label}
        <span className="pmTopShine" aria-hidden />
      </button>
      <style>{PREMIUM_TOPBAR_CSS}</style>
    </motion.nav>
  );
}

const PREMIUM_TOPBAR_CSS = `
.pmTopBar { position: fixed; z-index: 130; top: max(10px, env(safe-area-inset-top, 0px)); right: max(10px, env(safe-area-inset-right, 0px));
  display: flex; align-items: center; gap: 4px; padding: 4px; border-radius: 999px; border: 1px solid;
  -webkit-backdrop-filter: blur(14px) saturate(1.4); backdrop-filter: blur(14px) saturate(1.4);
  box-shadow: 0 12px 30px -14px rgba(0,0,0,.55); }
.pmTopBack { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 999px; background: transparent; border: 0; cursor: pointer; }
.pmTopGhost { height: 36px; padding: 0 12px; border-radius: 999px; background: transparent; border: 0; font: 600 13px/1 inherit; font-family: inherit; cursor: pointer; }
.pmTopPrimary { position: relative; overflow: hidden; height: 36px; padding: 0 16px 0 13px; display: inline-flex; align-items: center; gap: 7px;
  border-radius: 999px; border: 0; cursor: pointer; font: 700 13.5px/1 inherit; font-family: inherit; letter-spacing: .01em;
  box-shadow: 0 6px 18px -6px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.45); }
.pmTopBack:hover, .pmTopGhost:hover { background: rgba(127,127,127,.14); }
.pmTopPrimary:disabled { opacity: .7; cursor: default; }
.pmTopShine { position: absolute; top: 0; bottom: 0; width: 40%; left: -60%; pointer-events: none;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform: skewX(-18deg);
  animation: pmTopSweep 4.2s cubic-bezier(.4,0,.2,1) 1.2s infinite; }
@keyframes pmTopSweep { 0%, 60% { left: -60%; } 90%, 100% { left: 130%; } }
@media (prefers-reduced-motion: reduce) { .pmTopShine { animation: none; } }
`;
