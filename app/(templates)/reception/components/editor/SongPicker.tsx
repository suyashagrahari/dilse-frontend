"use client";

// ─── The song: a curated list, any YouTube link, or the template's waltz ─────
// "Listen" plays the chosen song through the page's own player (DayMusic), so
// the sender hears exactly what the guests will — after their first tap only.

import { useId, useState } from "react";
import { useDayMusic } from "../../../_valentine/music/context";
import { formatClock, parseClock, parseStartFromLink, parseYouTubeId, youTubeThumb } from "../../../_valentine/music/youtube";
import { RECEPTION_SONGS, RECEPTION_TRACK, type MusicSetting } from "../types";

const MODES: { v: MusicSetting["mode"]; label: string; hint: string; emoji: string }[] = [
  { v: "youtube", label: "A song", hint: "From the list or any YouTube link", emoji: "🎵" },
  { v: "track", label: RECEPTION_TRACK.title, hint: "Soft instrumental", emoji: "🎻" },
  { v: "off", label: "No music", hint: "Quiet and simple", emoji: "🔇" },
];

export default function SongPicker({ value, onChange }: { value: MusicSetting; onChange: (m: MusicSetting) => void }) {
  const music = useDayMusic();
  const uid = useId();
  const [link, setLink] = useState("");
  const [linkErr, setLinkErr] = useState("");
  const [clock, setClock] = useState(value.start ? formatClock(value.start) : "");
  const [clockErr, setClockErr] = useState("");
  // An older page ("") plays the waltz.
  const mode = value.mode === "" ? "track" : value.mode === "melody" ? "track" : value.mode;
  const known = RECEPTION_SONGS.find((s) => s.id === value.youtubeId);
  const listening = !!music?.playing;

  const set = (patch: Partial<MusicSetting>) => onChange({ ...value, ...patch });

  const applyLink = (raw: string) => {
    setLink(raw);
    if (!raw.trim()) return setLinkErr("");
    const id = parseYouTubeId(raw);
    if (!id) return setLinkErr("That doesn't look like a YouTube link. On YouTube tap Share → Copy link, then paste it here.");
    setLinkErr("");
    const t = parseStartFromLink(raw);
    set({ mode: "youtube", youtubeId: id, start: t != null ? Math.min(600, t) : 0 });
    setClock(t ? formatClock(Math.min(600, t)) : "");
    setLink("");
  };

  const applyClock = (raw: string) => {
    setClock(raw);
    if (!raw.trim()) {
      setClockErr("");
      return set({ start: 0 });
    }
    const s = parseClock(raw);
    if (s === null) return setClockErr("Use minutes:seconds, like 0:45");
    if (s > 600) return setClockErr("Pick a start within the first 10 minutes");
    setClockErr("");
    set({ start: s });
  };

  const listen =
    music && mode !== "off" ? (
      <button type="button" className={`rc-ed-btn is-sm${listening ? " is-on" : ""}`} onClick={() => (listening ? music.stop() : music.start())} aria-pressed={listening}>
        {listening ? "❚❚ Pause" : music.loading ? "Starting…" : "▶ Listen"}
      </button>
    ) : null;

  return (
    <div className="rc-ed-song">
      <div className="rc-ed-modes" role="radiogroup" aria-label="Background music">
        {MODES.map((m) => (
          <button key={m.v} type="button" role="radio" aria-checked={mode === m.v} className="rc-ed-mode" onClick={() => set({ mode: m.v, youtubeId: m.v === "youtube" ? value.youtubeId || RECEPTION_SONGS[0].id : value.youtubeId })}>
            <span aria-hidden>{m.emoji}</span>
            <b>{m.label}</b>
            <small>{m.hint}</small>
          </button>
        ))}
      </div>

      {mode === "track" && (
        <div className="rc-ed-panel">
          <p className="rc-ed-help">A gentle waltz loops softly from the guest&apos;s first tap. They can mute it any time.</p>
          {listen}
        </div>
      )}

      {mode === "youtube" && (
        <div className="rc-ed-panel">
          {value.youtubeId && (
            <div className="rc-ed-now">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={youTubeThumb(value.youtubeId)} alt="" />
              <span>
                <b>{known?.title ?? (music?.title || "Your YouTube song")}</b>
                <small>{known?.artist ?? `youtu.be/${value.youtubeId}`}</small>
              </span>
              {listen}
            </div>
          )}
          <ul className="rc-ed-songs" aria-label="Suggested songs">
            {RECEPTION_SONGS.map((s) => (
              <li key={s.id}>
                <button type="button" aria-pressed={value.youtubeId === s.id} onClick={() => set({ mode: "youtube", youtubeId: s.id, start: 0 })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={youTubeThumb(s.id)} alt="" loading="lazy" />
                  <span>
                    <b>{s.title}</b>
                    <small>{s.artist}</small>
                  </span>
                  <i aria-hidden>{value.youtubeId === s.id ? "✓" : ""}</i>
                </button>
              </li>
            ))}
          </ul>
          <div className="rc-ed-field">
            <label htmlFor={`${uid}-l`}>Or paste any YouTube link</label>
            <div className="rc-ed-input">
              <input id={`${uid}-l`} type="url" inputMode="url" value={link} placeholder="https://youtu.be/…" onChange={(e) => applyLink(e.target.value)} />
            </div>
            {linkErr && <p className="rc-ed-err">{linkErr}</p>}
          </div>
          <div className="rc-ed-field">
            <label htmlFor={`${uid}-t`}>Start the song at (optional)</label>
            <div className="rc-ed-input is-short">
              <input id={`${uid}-t`} type="text" inputMode="numeric" value={clock} placeholder="0:00" onChange={(e) => applyClock(e.target.value)} />
            </div>
            <p className={clockErr ? "rc-ed-err" : "rc-ed-help"}>{clockErr || "Skip a long intro: start at the chorus."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
