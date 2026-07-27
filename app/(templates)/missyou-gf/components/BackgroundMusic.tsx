"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { safeMediaUrl, MUSIC_PAUSE_EVENT, MUSIC_RESUME_EVENT } from "./types";

const TARGET_VOLUME = 0.5;

// Loops the sender's chosen song softly under the whole letter. Browsers (Brave &
// Safari especially) block autoplay-with-sound and can even RESOLVE play() while
// staying silent — so we never flip to "playing" optimistically. We start the
// track muted (always allowed, keeps it warm) and unmute + fade in only from a
// genuine user gesture (tap/click/key), which every browser honours. A floating
// control toggles it anytime, and it ducks while a voice note plays.
export default function BackgroundMusic({ src }: { src: string }) {
  const url = safeMediaUrl(src);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasPlayingRef = useRef(false); // was audible before a voice-note duck
  const [on, setOn] = useState(false); // true once sound is actually enabled

  const clearFade = () => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  };

  const fadeTo = useCallback((target: number, done?: () => void) => {
    const el = audioRef.current;
    if (!el) return;
    clearFade();
    fadeRef.current = setInterval(() => {
      const step = 0.06;
      if (Math.abs(el.volume - target) <= step) { el.volume = target; clearFade(); done?.(); return; }
      el.volume = el.volume < target ? el.volume + step : el.volume - step;
    }, 45);
  }, []);

  useEffect(() => {
    if (!url) return;
    const el = new Audio(url);
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    el.muted = true;
    audioRef.current = el;
    // Muted autoplay is always allowed — start it so the track is warm and can fade
    // in instantly the moment the visitor interacts.
    el.play().catch(() => {});

    // Turn on real sound ONLY from a genuine user gesture. We flip to "on" solely
    // after play() actually resolves un-muted, so the equalizer never lies.
    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "click", "wheel"];
    const removeListeners = () => events.forEach((e) => window.removeEventListener(e, unlock, true));
    const unlock = () => {
      const a = audioRef.current;
      if (!a) return;
      a.muted = false;
      a.play()
        .then(() => { wasPlayingRef.current = true; setOn(true); fadeTo(TARGET_VOLUME); removeListeners(); })
        .catch(() => { a.muted = true; }); // still blocked → keep waiting for a real gesture
    };
    events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }));

    // Duck under a playing voice note; resume afterwards if it was audible.
    const onPause = () => { const a = audioRef.current; if (a && !a.paused && !a.muted) { wasPlayingRef.current = true; clearFade(); a.pause(); } };
    const onResume = () => { const a = audioRef.current; if (a && wasPlayingRef.current) { a.muted = false; a.play().then(() => fadeTo(TARGET_VOLUME)).catch(() => {}); } };
    window.addEventListener(MUSIC_PAUSE_EVENT, onPause);
    window.addEventListener(MUSIC_RESUME_EVENT, onResume);

    return () => {
      removeListeners();
      window.removeEventListener(MUSIC_PAUSE_EVENT, onPause);
      window.removeEventListener(MUSIC_RESUME_EVENT, onResume);
      clearFade();
      el.pause();
      audioRef.current = null;
    };
  }, [url, fadeTo]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (on) {
      wasPlayingRef.current = false;
      setOn(false);
      fadeTo(0, () => el.pause());
    } else {
      el.muted = false;
      el.play()
        .then(() => { wasPlayingRef.current = true; setOn(true); fadeTo(TARGET_VOLUME); })
        .catch(() => {});
    }
  };

  if (!url) return null;

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Mute the music" : "Play the music"}
      className={`mu-glass mu-sans fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 ${on ? "" : "mu-music-cta"}`}
      style={{ borderRadius: 999 }}
    >
      <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full" style={{ background: on ? "var(--mu-rose)" : "transparent", color: on ? "#fff" : "var(--mu-sepia)", transition: "background .25s" }}>
        {on ? <Volume2 size={13} /> : <VolumeX size={13} />}
      </span>
      {on ? (
        <span aria-hidden className="mu-eq" style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 12 }}>
          <i /><i /><i />
        </span>
      ) : (
        <span className="text-xs font-semibold mu-sepia">tap for sound</span>
      )}
    </button>
  );
}
