"use client";

// ─── <PremiumRoot> — wrap every premium Experience in this ───────────────────
//
//   export default function RoseDayPremiumExperience({ data, mode, react }: ExperienceProps) {
//     return (
//       <PremiumRoot data={data} mode={mode} slug="happy-rose-day-premium">
//         <Scenes … />          // usePremium(), useSongDrop(), sfx() inside
//       </PremiumRoot>
//     );
//   }
//
// It owns the page's sound state on top of the shell's DayMusicProvider:
//   • open({ quiet }) — the synchronous unlock chain the gate runs in its tap;
//   • the global 🔊/🔇 chip (top-left; it replaces the shell's melody button):
//     mute = song paused + every SFX silent; the music dock's own pause also
//     silences SFX ("respects the music toggle");
//   • the "♪ Tap to hear {sender}'s song" chip when YouTube refused to start;
//   • the primed <audio> for the voice note (iOS lets it play later because the
//     gate tap started it once, muted).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useDayMusic, type DayMusicApi } from "../../music/context";
import { coercePremium, type PremiumFields } from "../../premiumData";
import type { ValentineDayData } from "../../types";
import { audioServerSnapshot, audioSnapshot, setAudioMuted, subscribeAudio, unlockAudioInGesture } from "./audio";
import { sfx as playSfx, type CueHandle, type CueId, type CueOptions } from "./sfx";

export interface PremiumApi {
  premium: PremiumFields;
  mode: "preview" | "live";
  senderName: string;
  recipientName: string;
  /** The gate has been opened (this visit). */
  opened: boolean;
  /** They have opened this page before on this device — show "Skip intro" chips. */
  repeatVisit: boolean;
  /** Opened with "open quietly" (or muted since). */
  muted: boolean;
  setMuted: (m: boolean) => void;
  /** Call SYNCHRONOUSLY inside the opening tap (PremiumGate does). */
  open: (opts?: { quiet?: boolean }) => void;
  /** Play a cue (no-op while muted / before the gate). */
  sfx: (id: CueId | (string & {}), o?: CueOptions) => CueHandle;
  /** The shell's music (null outside a page shell). */
  music: DayMusicApi | null;
  /** The primed <audio> for data.premium.voiceNote (null when there is none). */
  voice: HTMLAudioElement | null;
}

const PremiumContext = createContext<PremiumApi | null>(null);

/** Inside <PremiumRoot>. Throws outside one — premium scenes need it. */
export function usePremium(): PremiumApi {
  const v = useContext(PremiumContext);
  if (!v) throw new Error("usePremium() must be used inside <PremiumRoot>");
  return v;
}
/** Same, but null outside a PremiumRoot (shared kit pieces use this). */
export const usePremiumOptional = () => useContext(PremiumContext);

/** The audio engine's state ({ muted, unlocked }) as React state. */
export function useAudioState() {
  return useSyncExternalStore(subscribeAudio, audioSnapshot, audioServerSnapshot);
}

const seenKey = (slug: string, who: string) => `premium_seen_${slug}_${who.slice(0, 30)}`;

export default function PremiumRoot({
  data,
  mode,
  slug,
  children,
  chipStyle,
}: {
  data: ValentineDayData;
  mode: "preview" | "live";
  slug: string;
  children: ReactNode;
  /** Move/restyle the 🔊 chip (default: fixed top-left, 44px, the day's glass tokens). */
  chipStyle?: React.CSSProperties;
}) {
  const music = useDayMusic();
  const premium = useMemo(() => coercePremium(data.premium), [data.premium]);
  const audio = useAudioState();
  const [opened, setOpened] = useState(false);
  const [repeatVisit, setRepeatVisit] = useState(false);
  // One <audio> per voice note, made ahead so the gate tap can prime it.
  const voice = useMemo(() => {
    if (!premium.voiceNote || typeof Audio === "undefined") return null;
    const a = new Audio();
    a.preload = "auto";
    a.setAttribute("playsinline", "");
    a.src = premium.voiceNote;
    return a;
  }, [premium.voiceNote]);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    voiceRef.current = voice;
    return () => {
      if (!voice) return;
      voice.pause();
      voice.removeAttribute("src");
      voice.load();
    };
  }, [voice]);

  // The shell must not draw its own melody button: our chip controls everything.
  const register = music?.registerToggle;
  useEffect(() => register?.(), [register]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      try {
        setRepeatVisit(!!window.localStorage.getItem(seenKey(slug, data.recipientName)));
      } catch {
        /* storage blocked */
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [slug, data.recipientName]);


  // The visitor pausing the song from the dock also silences the SFX.
  const userOff = !!music?.userOff;
  useEffect(() => {
    if (!opened) return;
    setAudioMuted(userOff);
  }, [userOff, opened]);

  const open = useCallback(
    ({ quiet = false }: { quiet?: boolean } = {}) => {
      // 1–2: audio session + context, synchronously in the tap.
      unlockAudioInGesture();
      if (quiet) {
        setAudioMuted(true);
        music?.stop();
      } else {
        setAudioMuted(false);
        // 3: prime the voice note so it may play later without a tap (iOS).
        const v = voiceRef.current;
        if (v) {
          v.muted = true;
          const p = v.play();
          if (p && typeof p.then === "function")
            p.then(() => {
              v.pause();
              v.currentTime = 0;
              v.muted = false;
            }).catch(() => {
              v.muted = false;
            });
        }
        // 4: the song — playVideo() runs synchronously when the player is ready.
        if (music && music.mode !== "off") music.start();
      }
      setOpened(true);
      try {
        window.localStorage.setItem(seenKey(slug, data.recipientName), "1");
      } catch {
        /* fine */
      }
    },
    [music, slug, data.recipientName],
  );

  const setMuted = useCallback(
    (m: boolean) => {
      unlockAudioInGesture();
      setAudioMuted(m);
      if (!music || music.mode === "off") return;
      if (m) music.stop();
      else music.start();
    },
    [music],
  );

  const api = useMemo<PremiumApi>(
    () => ({
      premium,
      mode,
      senderName: data.senderName,
      recipientName: data.recipientName,
      opened,
      repeatVisit,
      muted: audio.muted,
      setMuted,
      open,
      sfx: playSfx,
      music,
      voice,
    }),
    [premium, mode, data.senderName, data.recipientName, opened, repeatVisit, audio.muted, setMuted, open, music, voice],
  );

  const showBlocked = opened && !audio.muted && !!music && music.mode === "youtube" && music.blocked;

  return (
    <PremiumContext.Provider value={api}>
      {children}
      {opened && (
        <button
          type="button"
          className="pm-soundChip"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!audio.muted);
          }}
          aria-pressed={!audio.muted}
          aria-label={audio.muted ? "Turn the sound on" : "Turn the sound off"}
          style={chipStyle}
        >
          {audio.muted ? "🔇" : "🔊"}
        </button>
      )}
      {showBlocked && (
        <button
          type="button"
          className="pm-blockedChip"
          onClick={(e) => {
            e.stopPropagation();
            music?.start();
          }}
        >
          <span aria-hidden>♪</span> Tap to hear {data.senderName ? `${data.senderName}'s` : "the"} song
        </button>
      )}
      <style>{ROOT_CSS}</style>
    </PremiumContext.Provider>
  );
}

const ROOT_CSS = `
.pm-soundChip { position: fixed; left: max(12px, env(safe-area-inset-left, 0px)); top: max(12px, env(safe-area-inset-top, 0px)); z-index: 97;
  width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; font-size: 18px;
  border: 1px solid var(--vw-edge, rgba(0,0,0,.12)); background: var(--vw-glass, rgba(255,255,255,.7)); color: var(--vw-ink, #333);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.pm-soundChip:focus-visible, .pm-blockedChip:focus-visible { outline: 3px solid var(--vw-accent, #d0245f); outline-offset: 2px; }
.pm-blockedChip { position: fixed; left: 50%; transform: translateX(-50%); z-index: 98;
  bottom: calc(var(--vw-dock-space, 0px) + 150px + env(safe-area-inset-bottom, 0px));
  display: inline-flex; gap: 8px; align-items: center; min-height: 44px; padding: 10px 18px; border-radius: 99px; border: 0; cursor: pointer;
  background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #2b1a03; font: 700 14px/1.1 system-ui, sans-serif;
  box-shadow: 0 12px 30px -10px rgba(90,55,5,.7); animation: pm-chipIn .5s cubic-bezier(.22,1,.36,1) both; white-space: nowrap; }
@media (min-width: 768px) { .pm-blockedChip { bottom: calc(var(--vw-dock-space, 0px) + 32px + env(safe-area-inset-bottom, 0px)); } }
@keyframes pm-chipIn { from { opacity: 0; transform: translate(-50%, 12px); } }
@media (prefers-reduced-motion: reduce) { .pm-blockedChip { animation: none; } }
`;
