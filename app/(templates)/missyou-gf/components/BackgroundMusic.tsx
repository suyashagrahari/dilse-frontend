"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { safeMediaUrl, MUSIC_PAUSE_EVENT, MUSIC_RESUME_EVENT } from "./types";

const TARGET_VOLUME = 0.5;

// Loops the sender's chosen song softly under the whole letter. Browsers block
// autoplay-with-sound until the visitor interacts, so we start the track muted and
// fade the volume in on their very first tap / scroll / keypress. A floating
// control lets them mute or unmute anytime, and the music ducks automatically
// while a voice note is playing (via the MUSIC_PAUSE/RESUME window events).
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
    audioRef.current = el;

    const events: (keyof WindowEventMap)[] = ["pointerdown", "touchstart", "keydown", "wheel"];
    const removeListeners = () => events.forEach((e) => window.removeEventListener(e, enable));
    const enable = () => {
      const a = audioRef.current;
      if (!a) return;
      a.muted = false;
      a.play()
        .then(() => { wasPlayingRef.current = true; setOn(true); fadeTo(TARGET_VOLUME); })
        .catch(() => {});
      removeListeners();
    };

    // Try to play audibly right away — this succeeds when the page already has a
    // user gesture (e.g. the editor preview, where the sender just tapped Save), so
    // the song "rings" immediately. On a cold live load it's blocked, so we fall
    // back to muted playback and unmute on the visitor's first interaction.
    el.muted = false;
    el.play()
      .then(() => { wasPlayingRef.current = true; setOn(true); fadeTo(TARGET_VOLUME); })
      .catch(() => {
        const a = audioRef.current;
        if (!a) return;
        a.muted = true;
        a.play().catch(() => {});
        events.forEach((e) => window.addEventListener(e, enable, { passive: true }));
      });

    // Duck under a playing voice note; resume afterwards if it was audible.
    const onPause = () => { const a = audioRef.current; if (a && !a.paused) { wasPlayingRef.current = true; clearFade(); a.pause(); } };
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
      className="mu-glass mu-sans fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2"
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
