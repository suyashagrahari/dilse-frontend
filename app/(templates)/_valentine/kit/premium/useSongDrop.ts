"use client";

// ─── useSongDrop() — the climax, "edited to the music" ───────────────────────
//
//   const { drop, dropped } = useSongDrop();
//   <button onClick={() => drop(() => setBloom(true))}>…</button>
//
// drop(onPeak?) plays the `riser` SFX, and at its peak (≈1.1 s):
//   • YouTube + premium.songDropAt > 0 → seekTo(songDropAt) and ramp to full
//     (non-iOS; iOS can't change volume, the impact SFX carries it);
//   • melody → restarts its phrase at full level;
//   • then an `impact-boom` and your onPeak() — run your visual there, so the
//     picture lands on the beat. With the sound muted or no music, onPeak still
//     runs (after the same delay), so the scene never depends on audio.
// Exactly ONE climax per template calls it. Idempotent per page view.

import { useCallback, useRef, useState } from "react";
import { usePremium } from "./PremiumRoot";

export const DROP_RISER_SEC = 1.1;

export function useSongDrop() {
  const { music, premium, sfx } = usePremium();
  const done = useRef(false);
  const [dropped, setDropped] = useState(false);

  const drop = useCallback(
    (onPeak?: () => void) => {
      if (done.current) {
        onPeak?.();
        return;
      }
      done.current = true;
      const riser = sfx("riser", { dur: DROP_RISER_SEC });
      const wait = (riser.peakIn || DROP_RISER_SEC) * 1000;
      window.setTimeout(() => {
        if (music && music.mode === "youtube" && premium.songDropAt > 0) music.seekTo(premium.songDropAt);
        else if (music && music.mode === "melody") music.seekTo(0);
        music?.fadeTo(1, 400);
        sfx("impact-boom", { gain: 0.7 });
        setDropped(true);
        onPeak?.();
      }, wait);
    },
    [music, premium.songDropAt, sfx],
  );

  return { drop, dropped, songDropAt: premium.songDropAt };
}
