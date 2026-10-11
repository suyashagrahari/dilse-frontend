"use client";

// ─── <UnlockTeaser> + useCountdown — a premium page before its unlock time ───
//
// Before `premium.unlockAt` the SERVER sends only a teaser (names + unlock time,
// no letter/photos/voice). ValentineDayViewer renders this instead of the
// Experience; when the countdown hits zero it calls onUnlocked() and the viewer
// fetches the page again. Tapping the clock plays the `tick` SFX and a teaser
// line (the tap also unlocks audio for later). Painted with the day's theme;
// `art` lets a template put its sealed object above the clock.
//
//   const left = useCountdown(unlockAt);  // { done, d, h, m, s, ms }

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatUnlock, type LockedTeaser } from "../../premiumData";
import { themeVars } from "../../theme";
import type { DayConfig } from "../../types";
import { VW_FONT_VARS } from "../../fonts";
import KineticName from "./KineticName";
import { unlockAudioInGesture } from "./audio";
import { sfx } from "./sfx";

export function useCountdown(iso: string) {
  const target = Date.parse(iso);
  const [now, setNow] = useState<number | null>(() => (typeof window === "undefined" ? null : Date.now()));
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const ms = Number.isFinite(target) && now != null ? Math.max(0, target - now) : 0;
  const s = Math.floor(ms / 1000);
  return { ready: now != null, done: now != null && ms <= 0, ms, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

const LINES = [
  "Not yet. Good things are worth the wait.",
  "Shh… it's still being sealed.",
  "Patience. It was made just for you.",
  "Almost. Keep this tab somewhere safe.",
];

export default function UnlockTeaser({ day, teaser, onUnlocked, art }: { day: DayConfig; teaser: LockedTeaser; onUnlocked: () => void; art?: ReactNode }) {
  const left = useCountdown(teaser.unlockAt);
  const [line, setLine] = useState<string | null>(null);
  const fired = useRef(false);
  useEffect(() => {
    if (!left.done || fired.current) return;
    fired.current = true;
    // A beat of grace for clock skew; the server is the authority.
    const t = window.setTimeout(onUnlocked, 1500);
    return () => window.clearTimeout(t);
  }, [left.done, onUnlocked]);

  const tap = () => {
    unlockAudioInGesture();
    sfx("tick");
    sfx("tick", { at: 0.5, detune: -300 });
    setLine(LINES[Math.floor(Math.random() * LINES.length)]);
  };
  const two = (n: number) => String(n).padStart(2, "0");
  const t = day.theme;
  return (
    <main className={`pm-lock ${VW_FONT_VARS}`} style={{ ...themeVars(t), background: t.bg, backgroundColor: t.base, color: t.ink }} data-vw-day={day.slug}>
      <div className="pm-lockIn">
        <p className="pm-lockKick">Sealed until {formatUnlock(teaser.unlockAt, teaser.unlockTz)}</p>
        <p className="pm-lockFor">For</p>
        <KineticName text={teaser.recipientName || "you"} gilt />
        {art ?? <div className="pm-lockArt" aria-hidden>{day.emoji}</div>}
        <button type="button" className="pm-lockClock" onClick={tap} aria-label="Time left until it opens">
          {left.ready ? (
            left.done ? (
              <span className="pm-lockOpen">Opening…</span>
            ) : (
              <>
                {left.d > 0 && <span><b>{left.d}</b><small>days</small></span>}
                <span><b>{two(left.h)}</b><small>hrs</small></span>
                <span><b>{two(left.m)}</b><small>min</small></span>
                <span><b>{two(left.s)}</b><small>sec</small></span>
              </>
            )
          ) : (
            <span className="pm-lockOpen">…</span>
          )}
        </button>
        <p className="pm-lockLine" aria-live="polite">{line ?? `${teaser.senderName || "Someone"} made you something. It opens on its own — come back then.`}</p>
        <div className="pm-seal"><span className="pm-sealWax" aria-hidden>✦</span><span>Hand-made for {teaser.recipientName || "you"}</span></div>
      </div>
      <style>{LOCK_CSS}</style>
    </main>
  );
}

const LOCK_CSS = `
.pm-lock { min-height: 100dvh; display: grid; place-items: center; padding: 24px 16px; box-sizing: border-box; text-align: center; font-family: var(--vw-font-ui, system-ui), sans-serif; }
.pm-lockIn { display: grid; justify-items: center; gap: 14px; width: min(520px, 100%); }
.pm-lockKick { margin: 0; font-weight: 700; font-size: 12px; letter-spacing: .22em; text-transform: uppercase; opacity: .8; }
.pm-lockFor { margin: 0; font-size: 14px; opacity: .7; }
.pm-lockArt { font-size: clamp(90px, 26vw, 150px); line-height: 1; filter: drop-shadow(0 18px 30px rgba(0,0,0,.25)); animation: pm-lockBob 4s ease-in-out infinite; }
.pm-lockClock { all: unset; cursor: pointer; display: flex; gap: 10px; justify-content: center; padding: 14px 18px; border-radius: 22px;
  background: var(--vw-glass, rgba(255,255,255,.6)); border: 1px solid var(--vw-edge, rgba(0,0,0,.1)); }
.pm-lockClock:focus-visible { outline: 3px solid var(--vw-accent, #d0245f); outline-offset: 3px; }
.pm-lockClock span { display: grid; min-width: 58px; }
.pm-lockClock b { font: 700 clamp(30px, 9vw, 44px)/1 var(--vw-font-serif, serif); font-variant-numeric: tabular-nums; }
.pm-lockClock small { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; opacity: .7; margin-top: 4px; }
.pm-lockOpen { font: 700 22px/1 var(--vw-font-serif, serif); }
.pm-lockLine { margin: 0; max-width: 34ch; font-size: 15px; line-height: 1.45; opacity: .85; }
.pm-lock .pm-seal { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px 6px 6px; border-radius: 99px; background: rgba(0,0,0,.12); font-size: 13px; font-weight: 600; }
.pm-lock .pm-sealWax { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; color: #fff1bf;
  background: radial-gradient(circle at 35% 30%, #d96a5a, #9b2222 55%, #6d1414); }
@keyframes pm-lockBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@media (prefers-reduced-motion: reduce) { .pm-lockArt { animation: none; } }
`;
