"use client";

// ─── Choosing the song ───────────────────────────────────────────────────────
//
// Thirty-three recordings on the shelf, three synthesised melodies, a YouTube
// link and a direct URL — four ways to answer one question, in a form somebody
// is filling in on a phone. The whole design problem is making that feel like
// one decision rather than four.
//
// ── YOU CAN HEAR IT BEFORE YOU CHOOSE IT ────────────────────────────────────
//
// The single most important control here is the little play button on each row.
// Choosing background music from a list of titles is guesswork — "Perfect" is a
// name, not a sound, and the sender is picking something a person they love
// will hear once, at a moment that matters. One <audio> element is shared by
// every row, so starting one stops the last, and it stops itself when this
// unmounts. Auditioning is deliberately NOT the same thing as selecting: you
// can listen to six and pick the second.
//
// ── ONE SELECTION, WHATEVER KIND IT IS ──────────────────────────────────────
//
// Library song, melody, YouTube, pasted URL — these are stored in two different
// fields (`musicUrl` and `musicTrack`) because a URL and a key are different
// things, but the sender is choosing one item from one list. So this component
// owns the mapping in a single `select()`: whichever kind is chosen, the other
// field is cleared. That is what stops the state where a pasted link and a
// chosen melody are both set and only the code knows which one wins.

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Music, Pause, Play } from "lucide-react";
import {
  BUILTIN_TRACKS,
  LIBRARY,
  LIBRARY_GROUPS,
  TRACK_IDS,
  findLibraryTrack,
  parseYouTubeId,
  type LibraryGroup,
  type MusicChoice,
} from "./music";

const INK = "#4A3547";
const MUTED = "#8B7280";
const PINK = "#F2789F";
const PINK_SOFT = "#FFF1F6";
const LINE = "#F3E3EC";
const HEAD = "var(--font-fredoka), ui-rounded, ui-sans-serif, system-ui, sans-serif";

/**
 * Hoisted out of the component body on purpose.
 *
 * A component declared inside another is a NEW component type on every render,
 * so React unmounts and remounts it — which throws away its DOM state and, for
 * anything holding a media element or focus, is a visible bug rather than a
 * performance note. `react-hooks/static-components` catches it. Everything
 * these need arrives as props instead.
 */
function Row({
  id,
  title,
  by,
  emoji,
  on,
  src,
  playing,
  loading,
  onAudition,
  onPick,
}: {
  id: string;
  title: string;
  by: string;
  emoji: string;
  on: boolean;
  /** Auditionable when there is something to play. */
  src?: string;
  playing: string | null;
  loading: string | null;
  onAudition: (id: string, src: string) => void;
  onPick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-2.5 py-2"
      style={{ border: `2px solid ${on ? PINK : LINE}`, background: on ? PINK_SOFT : "#FFF" }}
    >
      <button
        type="button"
        onClick={onPick}
        aria-pressed={on}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span aria-hidden className="text-[17px] leading-none">{emoji}</span>
        <span className="min-w-0">
          <span
            className="block truncate text-[13px] font-bold leading-tight"
            style={{ fontFamily: HEAD, color: on ? PINK : INK }}
          >
            {title}
          </span>
          <span className="block truncate text-[10.5px] leading-snug" style={{ color: MUTED }}>
            {by}
          </span>
        </span>
      </button>

      {src && (
        <button
          type="button"
          onClick={() => onAudition(id, src)}
          aria-label={playing === id ? `Stop ${title}` : `Listen to ${title}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform active:scale-90"
          style={{ border: `1.5px solid ${LINE}`, background: "#FFF", color: PINK }}
        >
          {loading === id ? (
            <Loader2 size={15} className="animate-spin" />
          ) : playing === id ? (
            <Pause size={15} />
          ) : (
            <Play size={15} />
          )}
        </button>
      )}
    </div>
  );
}

function Group({
  id,
  label,
  note,
  count,
  open,
  onToggle,
  children,
}: {
  id: LibraryGroup | "melody";
  label: string;
  note: string;
  count: number;
  open: boolean;
  onToggle: (id: LibraryGroup | "melody") => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl" style={{ border: `1.5px solid ${LINE}`, background: "#FFFDFB" }}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[12.5px] font-bold" style={{ fontFamily: HEAD, color: INK }}>
            {label} <span style={{ color: MUTED, fontWeight: 600 }}>&middot; {count}</span>
          </span>
          <span className="block text-[10.5px]" style={{ color: MUTED }}>{note}</span>
        </span>
        <span aria-hidden style={{ color: MUTED, fontSize: 12 }}>{open ? "\u25BE" : "\u25B8"}</span>
      </button>
      {open && <div className="grid gap-1.5 px-2.5 pb-2.5">{children}</div>}
    </div>
  );
}

export default function MusicPicker({
  musicUrl,
  musicTrack,
  onChange,
}: {
  musicUrl: string;
  musicTrack: MusicChoice;
  /** Both fields at once — see the note above about why they move together. */
  onChange: (next: { musicUrl: string; musicTrack: MusicChoice }) => void;
}) {
  const url = musicUrl.trim();
  const chosen = findLibraryTrack(url);
  const isYouTube = !chosen && !!url && !!parseYouTubeId(url);
  const isOwnFile = !chosen && !isYouTube && /^https?:\/\//i.test(url);
  /** A melody is in charge only when nothing has been pasted or picked. */
  const melodyOn = !url;

  const [open, setOpen] = useState<LibraryGroup | "melody" | null>("love");
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // One element for the whole list, and it stops when this closes. A form that
  // keeps singing after it is dismissed is a bug people remember.
  useEffect(() => {
    const el = new Audio();
    el.preload = "none";
    audioRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, []);

  const audition = useCallback((id: string, src: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (playing === id) {
      el.pause();
      setPlaying(null);
      return;
    }
    el.pause();
    el.src = src;
    el.currentTime = 0;
    el.volume = 0.7;
    setLoading(id);
    void el
      .play()
      .then(() => {
        setLoading(null);
        setPlaying(id);
      })
      .catch(() => {
        setLoading(null);
        setPlaying(null);
      });
    el.onended = () => setPlaying(null);
  }, [playing]);

  const toggle = useCallback(
    (id: LibraryGroup | "melody") => setOpen((v) => (v === id ? null : id)),
    [],
  );

  const select = (next: { musicUrl?: string; musicTrack?: MusicChoice }) =>
    onChange({
      musicUrl: next.musicUrl ?? "",
      musicTrack: next.musicTrack ?? "auto",
    });

  return (
    <div className="grid gap-2">
      {LIBRARY_GROUPS.map((g) => {
        const tracks = LIBRARY.filter((t) => t.group === g.id);
        return (
          <Group
            key={g.id}
            id={g.id}
            label={g.label}
            note={g.note}
            count={tracks.length}
            open={open === g.id}
            onToggle={toggle}
          >
            {tracks.map((t) => (
              <Row
                key={t.id}
                id={t.id}
                title={t.title}
                by={t.by}
                emoji={t.emoji}
                src={t.url}
                playing={playing}
                loading={loading}
                onAudition={audition}
                on={chosen?.id === t.id}
                onPick={() => select({ musicUrl: t.url })}
              />
            ))}
          </Group>
        );
      })}

      <Group
        id="melody"
        label="Written for this page"
        note="synthesised, nothing to download"
        count={TRACK_IDS.length}
        open={open === "melody"}
        onToggle={toggle}
      >
        {TRACK_IDS.map((id) => {
          const t = BUILTIN_TRACKS[id];
          return (
            <Row
              key={id}
              id={id}
              title={t.label}
              by={t.blurb}
              emoji={t.emoji}
              playing={playing}
              loading={loading}
              onAudition={audition}
              on={melodyOn && musicTrack === id}
              onPick={() => select({ musicTrack: id })}
            />
          );
        })}
      </Group>

      {/* ── Their own link ─────────────────────────────────────────────────
          Last, because it is the least used and the most fiddly — but not
          hidden, because it is the only way to get one exact song that is not
          on the shelf. */}
      <div className="relative mt-0.5">
        <Music
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "#C8B6FF" }}
        />
        <input
          value={chosen ? "" : musicUrl}
          onChange={(ev) => select({ musicUrl: ev.target.value })}
          placeholder="Or paste a YouTube link, or an .mp3 URL"
          inputMode="url"
          className="w-full rounded-2xl py-3 pl-10 pr-3.5 text-[14.5px] outline-none"
          style={{ border: `1.5px solid ${LINE}`, background: "#FFF", color: INK }}
        />
      </div>

      <p className="text-[11px] leading-snug" style={{ color: MUTED }}>
        {isYouTube ? (
          <>
            <strong style={{ color: PINK }}>YouTube song detected.</strong> It plays through
            YouTube&rsquo;s own player, which appears as a small panel in the corner of the page — it
            has to stay visible, that is YouTube&rsquo;s rule, not ours.
          </>
        ) : isOwnFile ? (
          <>
            <strong style={{ color: PINK }}>Audio link detected.</strong> Make sure it is a file you
            have the right to share.
          </>
        ) : chosen ? (
          <>
            <strong style={{ color: PINK }}>{chosen.title}</strong> will start the moment they open
            the page. There is a mute button in the corner if they need it.
          </>
        ) : (
          <>Tap a song to choose it, or the play button to hear it first.</>
        )}
      </p>
    </div>
  );
}
