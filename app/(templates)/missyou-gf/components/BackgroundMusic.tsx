"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { MUSIC_PAUSE_EVENT, MUSIC_RESUME_EVENT, safeMediaUrl } from "./types";
import { NIGHT } from "./theme";

/**
 * Background-music control. Audio is MUTED BY DEFAULT (browsers block autoplay
 * anyway); the fixed unmute chip is the clear control required by the brief.
 * Ducks itself when a voice note plays via the shared MUSIC_PAUSE/RESUME events.
 * Renders nothing when there is no song URL.
 */
export default function BackgroundMusic({ url: rawUrl, offerOpen }: { url: string; offerOpen: boolean }) {
  const url = safeMediaUrl(rawUrl);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    if (!url) return;
    let a = audioRef.current;
    if (!a) { a = new Audio(url); a.loop = true; a.volume = 0.45; audioRef.current = a; }
    a.muted = muted;
    if (!muted) a.play().catch(() => {});
    else a.pause();
    return () => { a?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, muted]);

  useEffect(() => {
    const onPause = () => {
      const a = audioRef.current;
      if (a && !a.paused) { wasPlayingRef.current = true; a.pause(); }
    };
    const onResume = () => {
      const a = audioRef.current;
      if (a && wasPlayingRef.current && !muted) { wasPlayingRef.current = false; a.play().catch(() => {}); }
    };
    window.addEventListener(MUSIC_PAUSE_EVENT, onPause);
    window.addEventListener(MUSIC_RESUME_EVENT, onResume);
    return () => {
      window.removeEventListener(MUSIC_PAUSE_EVENT, onPause);
      window.removeEventListener(MUSIC_RESUME_EVENT, onResume);
    };
  }, [muted]);

  if (!url || !offerOpen) return null;

  return (
    <button
      type="button"
      onClick={() => setMuted((m) => !m)}
      aria-label={muted ? "Unmute music" : "Mute music"}
      aria-pressed={!muted}
      style={{
        position: "fixed", top: 12, left: 12, zIndex: 46,
        width: 44, height: 44, borderRadius: 999,
        display: "grid", placeItems: "center",
        background: muted ? "rgba(27,24,48,.85)" : NIGHT.raised,
        color: muted ? NIGHT.mutedNight : NIGHT.amber,
        border: `1px solid ${NIGHT.hairline}`,
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        boxShadow: muted ? "none" : `0 0 20px ${NIGHT.amber}55`,
      }}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
