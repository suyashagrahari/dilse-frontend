"use client";

// The 2.6-second sting after picking a profile: a ribbon "L" draws itself, a
// heart pops at its foot, and the camera dives into the ribbon until it
// splits into streaks of rose and plum light. The two-note sound lands on the
// heart. It plays after a tap, so the audio is always allowed to start.

import { useEffect, useMemo } from "react";
import { sfxIntroSting } from "./loveflixAudio";

const STREAK_HUES = ["#E10A17", "#ff7aa2", "#B20710", "#8a2be2", "#ff4f7a", "#5b1030", "#ffb3c7", "#c2185b", "#7a1fa2", "#ff2d6f"];

export default function IntroSting({ reduced, onDone }: { reduced: boolean; onDone: () => void }) {
  useEffect(() => {
    const a = window.setTimeout(() => sfxIntroSting(), reduced ? 0 : 520);
    const b = window.setTimeout(onDone, reduced ? 700 : 2650);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduced, onDone]);

  const streaks = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: 38 + ((i * 37) % 26) - 13 + (i % 2 ? 0.6 : -0.6),
        w: 0.6 + ((i * 13) % 7) * 0.35,
        c: STREAK_HUES[i % STREAK_HUES.length],
        d: 1.12 + ((i * 7) % 10) * 0.03,
        dx: (((i * 53) % 21) - 10) * 6,
      })),
    [],
  );

  return (
    <div className={`lf-sting${reduced ? " is-reduced" : ""}`} aria-label="LoveFlix" role="img">
      <div className="lf-sting-l">
        <span className="lf-sting-v" />
        <span className="lf-sting-h" />
        <span className="lf-sting-fold" />
        <svg className="lf-sting-heart" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#ff9ab5"
            d="M12 21.6S1.8 15.4 1.8 8.3C1.8 5 4.3 2.6 7.3 2.6c2 0 3.7 1 4.7 2.6 1-1.6 2.7-2.6 4.7-2.6 3 0 5.5 2.4 5.5 5.7 0 7.1-10.2 13.3-10.2 13.3Z"
          />
        </svg>
      </div>
      {!reduced && (
        <div className="lf-sting-streaks" aria-hidden>
          {streaks.map((s, i) => (
            <span
              key={i}
              style={{
                left: `${s.left}%`,
                width: `${s.w}vmin`,
                background: `linear-gradient(to bottom, transparent, ${s.c} 30%, ${s.c} 70%, transparent)`,
                animationDelay: `${s.d}s`,
                ["--dx" as string]: `${s.dx}vmin`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
