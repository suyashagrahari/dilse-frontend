"use client";

// ─── ChorusPicker — "Pick the drop" (premium form) ───────────────────────────
//
// The sender plays their YouTube song right here (the shell's player, lifted
// over the form), and taps "The drop is here ✦" when the chorus hits: that
// second becomes premium.songDropAt. A mm:ss box is there too, and "Test the
// drop" seeks to it. With the built-in melody there is nothing to pick (the
// melody has its own drop); with no music the drop is purely visual.

import { useEffect, useState } from "react";
import { useDayMusic } from "../music/context";
import { formatClock, parseClock } from "../music/youtube";
import type { MusicMode } from "../types";
import { PREMIUM_LIMITS } from "../premiumData";

export default function ChorusPicker({ value, onChange, musicMode, musicStart }: { value: number; onChange: (sec: number) => void; musicMode: MusicMode; musicStart: number }) {
  const music = useDayMusic();
  const [now, setNow] = useState(0);
  const [draft, setDraft] = useState(value ? formatClock(value) : "");
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setDraft(value ? formatClock(value) : "");
  }
  const live = music?.mode === "youtube" && music.playing;

  useEffect(() => {
    if (!live || !music) return;
    const t = window.setInterval(() => setNow(Math.floor(music.currentTime())), 250);
    return () => window.clearInterval(t);
  }, [live, music]);

  if (musicMode !== "youtube") {
    return (
      <p className="vs-hint" style={{ margin: 0 }}>
        {musicMode === "track"
          ? "The page's own track swells on the big moment by itself — nothing to pick. Choose a YouTube song above to set your own drop."
          : musicMode === "melody"
          ? "The built-in melody has its own big moment — nothing to pick. Choose a YouTube song above to set your own drop."
          : "No music on this page, so the big moment is all visual. Add a song above to time it to the chorus."}
      </p>
    );
  }

  const listen = () => {
    if (!music) return;
    if (music.playing) music.stop();
    else {
      music.start();
      music.seekTo(Math.max(0, musicStart));
    }
  };

  return (
    <div className="vs-chorus">
      <p className="vs-hint" style={{ margin: 0 }}>
        Play your song and tap <b>The drop is here</b> the moment the chorus hits — the page&apos;s big moment will land exactly there.
      </p>
      <div className="vs-chorusRow">
        <button type="button" className="vs-voiceBtn" onClick={listen}>{music?.playing ? "❚❚ Pause" : "▶ Play my song"}</button>
        <span className="vs-voiceT" aria-live="off">{live ? formatClock(now) : "–:––"}</span>
        <button
          type="button"
          className="vs-voiceBtn is-drop"
          disabled={!live}
          onClick={() => onChange(Math.min(PREMIUM_LIMITS.songDropMax, Math.max(0, Math.floor(music?.currentTime() ?? 0))))}
        >
          ✦ The drop is here
        </button>
      </div>
      <div className="vs-chorusRow">
        <label className="vs-label" htmlFor="vs-drop" style={{ margin: 0 }}>Drop at (m:ss)</label>
        <input
          id="vs-drop"
          className="vs-input"
          style={{ width: 96 }}
          inputMode="numeric"
          value={draft}
          placeholder="1:05"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const s = parseClock(draft);
            if (s == null) setDraft(value ? formatClock(value) : "");
            else onChange(Math.min(PREMIUM_LIMITS.songDropMax, s));
          }}
        />
        <button type="button" className="vs-ghostBtn" disabled={!value || !music} onClick={() => { if (!music) return; if (!music.playing) music.start(); music.seekTo(value); }}>
          Test the drop
        </button>
        {value > 0 && <button type="button" className="vs-ghostBtn" onClick={() => onChange(0)}>Clear</button>}
      </div>
    </div>
  );
}

export const CHORUS_CSS = `
.vs-chorus { display: grid; gap: 10px; }
.vs-chorusRow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.vs-voiceBtn.is-drop { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #2b1a03; }
.vs-voiceBtn.is-drop:disabled { opacity: .45; }
`;
