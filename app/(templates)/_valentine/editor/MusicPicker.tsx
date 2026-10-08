"use client";

// ─── Music, in the edit form ─────────────────────────────────────────────────
//
// Off · the day's soft built-in melody · a YouTube song (any link, or one of
// the suggestions). Only the 11-char video id is kept. "Listen" plays it
// right here through the page's DayMusic player, so the sender hears exactly
// what the recipient will.

import { useEffect, useId, useState } from "react";
import { useDayMusic } from "../music/context";
import { SONG_SUGGESTIONS, formatClock, parseClock, parseStartFromLink, parseYouTubeId, suggestionFor, youTubeThumb, type SongSuggestion } from "../music/youtube";
import { MUSIC_START_MAX, type MusicMode, type ValentineDayData } from "../types";

type MusicValue = Pick<ValentineDayData, "musicMode" | "musicYoutubeId" | "musicStart">;

const MODES: { value: MusicMode; emoji: string; label: string; hint: string }[] = [
  { value: "off", emoji: "🔇", label: "No music", hint: "Quiet and simple" },
  { value: "melody", emoji: "🎹", label: "Soft melody", hint: "A gentle music-box tune made for this day" },
  { value: "youtube", emoji: "🎵", label: "Our song", hint: "Any song from YouTube" },
];

export default function MusicPicker({
  value,
  onChange,
  suggestions = SONG_SUGGESTIONS,
  suggestionsNote = "romantic favourites · tap to use",
  audioOnly = false,
}: {
  value: MusicValue;
  onChange: (patch: Partial<MusicValue>) => void;
  /** The day's own one-tap songs (default: the romantic list). */
  suggestions?: readonly SongSuggestion[];
  suggestionsNote?: string;
  /** The day plays YouTube as sound only (DayConfig.music.audioOnly). */
  audioOnly?: boolean;
}) {
  const music = useDayMusic();
  const uid = useId().replace(/:/g, "");
  const [link, setLink] = useState("");
  const [linkErr, setLinkErr] = useState("");
  const [clock, setClock] = useState(value.musicStart ? formatClock(value.musicStart) : "");
  const [clockErr, setClockErr] = useState("");

  // Re-sync the clock only when the SONG changes (not on every keystroke).
  useEffect(() => {
    setClock(value.musicStart ? formatClock(value.musicStart) : "");
    setClockErr("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.musicYoutubeId]);

  const id = value.musicYoutubeId;
  const known = id ? suggestionFor(id, suggestions) : null;
  const songTitle = known?.title ?? (music?.mode === "youtube" && music.title ? music.title : "Your YouTube song");
  const listening = !!music?.playing && music.mode === (value.musicMode === "youtube" && !id ? "melody" : value.musicMode);

  const applyLink = (raw: string) => {
    setLink(raw);
    if (!raw.trim()) return setLinkErr("");
    const vid = parseYouTubeId(raw);
    if (!vid) return setLinkErr("That doesn't look like a YouTube link. On YouTube tap Share → Copy link, then paste it here.");
    setLinkErr("");
    const t = parseStartFromLink(raw);
    onChange({ musicMode: "youtube", musicYoutubeId: vid, musicStart: t != null ? Math.min(MUSIC_START_MAX, t) : 0 });
    setLink("");
  };

  const applyClock = (raw: string) => {
    setClock(raw);
    const s = parseClock(raw);
    if (s === null) return setClockErr("Use minutes:seconds, like 0:45");
    if (s > MUSIC_START_MAX) return setClockErr("Pick a start within the first 10 minutes");
    setClockErr("");
    onChange({ musicStart: s });
  };

  const listenBtn = (label: string) =>
    music && music.available ? (
      <button type="button" className={`vmp-listen${listening ? " is-on" : ""}`} onClick={() => (listening ? music.stop() : music.start())} aria-pressed={listening}>
        {listening && <span className="vmp-eq" aria-hidden><i /><i /><i /></span>}
        {listening ? "Pause" : music.loading ? "Starting…" : label}
      </button>
    ) : null;

  return (
    <div className="vmp">
      <div className="vmp-modes" role="radiogroup" aria-label="Background music">
        {MODES.map((m) => {
          const on = value.musicMode === m.value;
          return (
            <button key={m.value} type="button" role="radio" aria-checked={on} className={`vmp-mode${on ? " is-on" : ""}`} onClick={() => onChange({ musicMode: m.value })}>
              <span className="vmp-modeEmoji" aria-hidden>{m.emoji}</span>
              <b>{m.label}</b>
              <small>{m.hint}</small>
            </button>
          );
        })}
      </div>

      {value.musicMode === "melody" && (
        <div className="vmp-panel">
          <p className="vs-hint" style={{ margin: 0 }}>It starts softly on their first tap, and they can mute it any time.</p>
          {listenBtn("▶ Listen")}
        </div>
      )}

      {value.musicMode === "youtube" && (
        <div className="vmp-panel">
          {id ? (
            <div className="vmp-song">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youTubeThumb(id)} alt="" className="vmp-thumb" loading="eager" decoding="async" />
              <div className="vmp-songTx">
                <b>{songTitle}</b>
                <small>{known?.artist ?? `youtu.be/${id}`}</small>
                <div className="vmp-songActs">
                  {listenBtn("▶ Listen")}
                  <button type="button" className="vp-chip" onClick={() => onChange({ musicYoutubeId: "", musicStart: 0 })}>Change</button>
                </div>
              </div>
            </div>
          ) : (
            <p className="vmp-empty">Paste a link to your song, or tap a suggestion below 👇</p>
          )}

          <label className="vs-label" htmlFor={`vmp-link-${uid}`}>
            <span>{id ? "Use a different song" : "YouTube link"}</span>
          </label>
          <input
            id={`vmp-link-${uid}`}
            className={`vs-input${linkErr ? " is-bad" : ""}`}
            inputMode="url"
            autoComplete="off"
            value={link}
            placeholder="youtu.be/… or a youtube.com / music.youtube.com link"
            onChange={(e) => applyLink(e.target.value)}
            aria-invalid={!!linkErr}
            aria-describedby={linkErr ? `vmp-link-err-${uid}` : undefined}
          />
          {linkErr && <p className="vs-err" id={`vmp-link-err-${uid}`}>{linkErr}</p>}

          {id && (
            <div className="vmp-start">
              <label className="vs-label" htmlFor={`vmp-start-${uid}`}><span>Start from <small className="vmp-opt">(optional)</small></span></label>
              <div className="vmp-startRow">
                <input
                  id={`vmp-start-${uid}`}
                  className={`vs-input vmp-clock${clockErr ? " is-bad" : ""}`}
                  inputMode="numeric"
                  value={clock}
                  placeholder="0:00"
                  onChange={(e) => applyClock(e.target.value)}
                  aria-invalid={!!clockErr}
                />
                <span className="vs-hint">Skip the intro — e.g. <b>0:45</b> jumps straight to the chorus.</span>
              </div>
              {clockErr && <p className="vs-err">{clockErr}</p>}
            </div>
          )}

          {music?.error && <p className="vs-err" role="alert">{music.error}</p>}

          <div className="vmp-sugHead">
            <b>Suggestions</b> <small>{suggestionsNote}</small>
          </div>
          <div className="vmp-sugs" role="radiogroup" aria-label="Suggested songs">
            {suggestions.map((s) => {
              const on = s.id === id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} className={`vmp-sug${on ? " is-on" : ""}`} onClick={() => onChange({ musicMode: "youtube", musicYoutubeId: s.id, musicStart: 0 })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={youTubeThumb(s.id)} alt="" loading="eager" decoding="async" />
                  <span>
                    <b>{s.title}</b>
                    <small>{s.artist}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="vs-hint" style={{ margin: 0 }}>
            {audioOnly
              ? "Only the sound plays — the video stays hidden behind a small now-playing card in the corner that they can pause, mute or move."
              : "Plays through YouTube's own player — a small card in the corner of their screen that they can pause."}
          </p>
        </div>
      )}
    </div>
  );
}

export const MUSIC_CSS = `
.vmp { display: grid; gap: 12px; }
.vmp-modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.vmp-mode { display: grid; justify-items: center; align-content: start; gap: 3px; padding: 12px 6px; min-height: 96px; border-radius: 18px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); text-align: center; cursor: pointer; font-family: var(--vw-font-ui); transition: border-color .15s, background .15s, transform .15s; }
.vmp-mode b { font-size: 13.5px; }
.vmp-mode small { font-size: 11px; line-height: 1.3; opacity: .65; }
.vmp-mode.is-on { border-color: var(--vw-accent); background: var(--vw-soft); }
.vmp-modeEmoji { font-size: 24px; }
.vmp-panel { display: grid; gap: 10px; padding: 14px; border-radius: 18px; background: color-mix(in srgb, var(--vw-soft) 45%, #fff); border: 2px solid var(--vw-edge); }
.vmp-listen { justify-self: start; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: 99px; border: 0; background: var(--vw-accent); color: var(--vw-accent-ink); font: 700 14px var(--vw-font-ui); cursor: pointer; box-shadow: 0 4px 0 var(--vw-accent-deep); }
.vmp-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; }
.vmp-eq i { width: 3px; height: 40%; border-radius: 2px; background: currentColor; }
.vmp-listen.is-on .vmp-eq i { animation: vmp-eq .9s ease-in-out infinite; }
.vmp-listen.is-on .vmp-eq i:nth-child(2) { animation-delay: .2s; }
.vmp-listen.is-on .vmp-eq i:nth-child(3) { animation-delay: .4s; }
@keyframes vmp-eq { 0%,100% { height: 30%; } 50% { height: 100%; } }
@media (prefers-reduced-motion: reduce) { .vmp-listen.is-on .vmp-eq i { animation: none; height: 70%; } }
.vmp-song { display: flex; gap: 12px; align-items: center; padding: 8px; border-radius: 16px; background: #fff; border: 2px solid var(--vw-accent); }
.vmp-thumb { flex: none; width: 112px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 10px; background: linear-gradient(135deg, rgba(0,0,0,.08), rgba(0,0,0,.18)); }
.vmp-songTx { min-width: 0; display: grid; gap: 2px; }
.vmp-songTx b { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vmp-songTx small { font-size: 12px; opacity: .65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vmp-songActs { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; align-items: center; }
.vmp-songActs .vmp-listen { min-height: 36px; padding: 0 14px; font-size: 13px; box-shadow: 0 3px 0 var(--vw-accent-deep); }
.vmp-empty { margin: 0; font-size: 13.5px; font-weight: 600; }
.vmp-opt { font-weight: 500; opacity: .6; }
.vmp-startRow { display: flex; gap: 10px; align-items: center; }
.vmp-clock { width: 96px; flex: none; text-align: center; font-variant-numeric: tabular-nums; }
.vmp-sugHead { display: flex; align-items: baseline; gap: 8px; margin-top: 4px; font-size: 13.5px; }
.vmp-sugHead small { font-size: 12px; opacity: .6; }
.vmp-sugs { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.vmp-sug { display: flex; align-items: center; gap: 10px; padding: 6px; min-height: 52px; border-radius: 14px; border: 2px solid var(--vw-edge); background: #fff; color: var(--vw-paper-ink); text-align: left; cursor: pointer; font-family: var(--vw-font-ui); }
.vmp-sug img { flex: none; width: 64px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; background: linear-gradient(135deg, rgba(0,0,0,.08), rgba(0,0,0,.18)); }
.vmp-sug span { display: grid; min-width: 0; }
.vmp-sug b { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vmp-sug small { font-size: 11.5px; opacity: .6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vmp-sug.is-on { border-color: var(--vw-accent); background: var(--vw-soft); }
@media (max-width: 380px) { .vmp-mode small { display: none; } .vmp-mode { min-height: 76px; } }
`;
