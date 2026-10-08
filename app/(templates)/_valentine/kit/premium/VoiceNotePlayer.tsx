"use client";

// ─── <VoiceNotePlayer> — the sender's voice, with a waveform ─────────────────
//
//   <VoiceNotePlayer accent={t.accent} label="A message from Aarav" />
//
// Uses the <audio> PremiumRoot primed in the gate tap (so it plays on iOS).
// The waveform is the `voicePeaks` array saved with the note — no audio
// decoding on the recipient's phone, no MediaElementSource routing quirks.
// Play ducks the song (iOS + YouTube: pauses it) and unducks at the end or on
// pause. Tap-only start. `voiceCaption` shows under it (and is the a11y line).
// Without a voice note it shows the caption as a typed "transmission" instead
// (`fallback` lets the template render its own), so the scene always works.

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { formatClock } from "../../music/youtube";
import { usePremium } from "./PremiumRoot";

export interface VoiceNotePlayerProps {
  /** Heading over the player ("A message from Aarav"). */
  label?: ReactNode;
  accent?: string;
  /** Bar colour when not yet played. */
  track?: string;
  /** Rendered instead when there is no voice note (default: the caption as a transmission card). */
  fallback?: ReactNode;
  onPlay?: () => void;
  onEnded?: () => void;
  style?: CSSProperties;
  className?: string;
}

const rewind = (a: HTMLAudioElement) => {
  a.currentTime = 0;
};

const FLAT = Array.from({ length: 48 }, (_, i) => 30 + Math.round(20 * Math.abs(Math.sin(i * 0.7))));

export default function VoiceNotePlayer({ label, accent = "var(--vw-accent, #d0245f)", track = "currentColor", fallback, onPlay, onEnded, style, className }: VoiceNotePlayerProps) {
  const { premium, voice, music, sfx } = usePremium();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dur, setDur] = useState(premium.voiceNoteSec || 0);
  const peaks = useMemo(() => (premium.voicePeaks.length ? premium.voicePeaks : FLAT), [premium.voicePeaks]);

  useEffect(() => {
    const a = voice;
    if (!a) return;
    const onTime = () => setProgress(a.duration && Number.isFinite(a.duration) ? a.currentTime / a.duration : 0);
    const onMeta = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) setDur(Math.round(a.duration));
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(1);
      music?.unduck();
      onEnded?.();
    };
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("pause", onPause);
    };
  }, [voice, music, onEnded]);

  // Leaving the scene: stop the voice, give the song back.
  useEffect(
    () => () => {
      if (voice && !voice.paused) {
        voice.pause();
        music?.unduck();
      }
    },
    [voice, music],
  );

  if (!premium.voiceNote || !voice) {
    if (fallback !== undefined) return <>{fallback}</>;
    if (!premium.voiceCaption) return null;
    return (
      <figure className={`pm-vn is-text${className ? ` ${className}` : ""}`} style={style}>
        {label && <figcaption className="pm-vnLabel">{label}</figcaption>}
        <p className="pm-vnTx">“{premium.voiceCaption}”</p>
        <style>{VN_CSS}</style>
      </figure>
    );
  }

  const toggle = () => {
    if (playing) {
      voice.pause();
      music?.unduck();
      return;
    }
    music?.duck(0.2);
    sfx("static", { dur: 0.25, gain: 0.5 });
    if (progress >= 1) rewind(voice);
    void voice.play().then(
      () => {
        setPlaying(true);
        onPlay?.();
      },
      () => {
        setPlaying(false);
        music?.unduck();
      },
    );
  };

  const played = Math.floor(progress * peaks.length);
  return (
    <figure className={`pm-vn${className ? ` ${className}` : ""}`} style={{ ["--pm-vn-accent" as string]: accent, ...style }}>
      {label && <figcaption className="pm-vnLabel">{label}</figcaption>}
      <div className="pm-vnRow">
        <button type="button" className="pm-vnBtn" onClick={toggle} aria-label={playing ? "Pause the voice note" : "Play the voice note"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="pm-vnWave" aria-hidden>
          {peaks.map((v, k) => (
            <i key={k} style={{ height: `${Math.max(8, v)}%`, background: k < played ? accent : track, opacity: k < played ? 1 : 0.35 }} />
          ))}
        </div>
        <span className="pm-vnTime">{formatClock(Math.round(playing || progress ? progress * dur : dur))}</span>
      </div>
      {premium.voiceCaption && <p className="pm-vnCap">{premium.voiceCaption}</p>}
      <style>{VN_CSS}</style>
    </figure>
  );
}

const VN_CSS = `
.pm-vn { margin: 0; display: grid; gap: 10px; width: min(100%, 460px); padding: 16px; border-radius: 20px;
  background: var(--vw-glass, rgba(255,255,255,.7)); border: 1px solid var(--vw-edge, rgba(0,0,0,.08)); color: var(--vw-ink, #2a1a22); box-sizing: border-box; }
.pm-vnLabel { font: 700 12px/1.2 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .14em; text-transform: uppercase; opacity: .75; }
.pm-vnRow { display: flex; align-items: center; gap: 12px; }
.pm-vnBtn { flex: none; width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer; color: #fff; font: 700 17px/1 system-ui, sans-serif;
  background: var(--pm-vn-accent); box-shadow: 0 8px 20px -8px var(--pm-vn-accent); }
.pm-vnBtn:focus-visible { outline: 3px solid var(--pm-vn-accent); outline-offset: 3px; }
.pm-vnWave { flex: 1; min-width: 0; height: 44px; display: flex; align-items: center; gap: 2px; }
.pm-vnWave i { flex: 1; min-width: 2px; border-radius: 2px; transition: background .2s, opacity .2s; }
.pm-vnTime { flex: none; font: 600 13px/1 var(--vw-font-ui, system-ui), sans-serif; font-variant-numeric: tabular-nums; opacity: .75; }
.pm-vnCap, .pm-vnTx { margin: 0; font: 500 15px/1.45 var(--vw-font-ui, system-ui), sans-serif; }
.pm-vn.is-text .pm-vnTx { font-family: var(--vw-font-script, var(--vw-font-ui, system-ui)); font-size: 18px; }
`;
