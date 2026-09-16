"use client";

// ─── Choosing the song, for any template ─────────────────────────────────────
//
// The proposal editor grew a grouped, auditionable list over the shelf in
// `lib/music/library.ts`. The apology dashboard needed the same thing and had a
// radio list with exactly one entry in it, so this is that list with the
// proposal's palette and its two-field `musicUrl`/`musicTrack` mapping taken
// out — one value in, one value out, and an accent colour.
//
// ── YOU CAN HEAR IT BEFORE YOU CHOOSE IT ────────────────────────────────────
//
// The play button on each row is the point of the component. Picking background
// music from a list of titles is guesswork — "Perfect" is a name, not a sound,
// and the sender is choosing something a person they love will hear once, at a
// moment that matters. One <audio> element is shared by every row, so starting
// one stops the last, and it stops itself when this unmounts. Auditioning is
// deliberately NOT selecting: you can listen to six and pick the second.
//
// ── IT TELLS THE PAGE WHEN IT IS SINGING ────────────────────────────────────
//
// Templates play their own background music behind the editor. Two songs at
// once is unusable, so the audition announces itself through `onAuditionStart`
// and `onAuditionStop` and lets the host duck whatever it is playing. The host
// decides how; this only says when.

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { LIBRARY, LIBRARY_GROUPS, type LibraryGroup } from "@/lib/music/library";

/**
 * A choice that is not one of the shelf's recordings — a built-in synthesised
 * tune, or "silence". Rendered in its own group above the library.
 */
export interface SongExtra {
  id: string;
  title: string;
  by: string;
  emoji: string;
  /** What `onChange` receives when this row is picked. Usually "". */
  value: string;
  /** Auditionable when there is a file; a synthesised tune has none. */
  src?: string;
}

function Row({
  id,
  title,
  by,
  emoji,
  on,
  src,
  accent,
  line,
  soft,
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
  src?: string;
  accent: string;
  line: string;
  soft: string;
  playing: string | null;
  loading: string | null;
  onAudition: (id: string, src: string) => void;
  onPick: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-2.5 py-2"
      style={{ border: `2px solid ${on ? accent : line}`, background: on ? soft : "#FFF" }}
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
            className="block truncate text-[13.5px] font-bold leading-tight"
            style={{ color: on ? accent : "inherit" }}
          >
            {title}
          </span>
          <span className="block truncate text-[11px] leading-snug opacity-60">{by}</span>
        </span>
      </button>

      {src && (
        <button
          type="button"
          onClick={() => onAudition(id, src)}
          aria-label={playing === id ? `Stop ${title}` : `Listen to ${title}`}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform active:scale-90"
          style={{ border: `1.5px solid ${line}`, background: "#FFF", color: accent }}
        >
          {loading === id ? (
            <Loader2 size={16} className="animate-spin" />
          ) : playing === id ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Hoisted, like `Row`. A component declared inside another is a new type every
 * render, so React unmounts and remounts it — throwing away DOM state, which for
 * anything holding a media element is a visible bug. `react-hooks/static-components`
 * catches it.
 */
function Group({
  id,
  label,
  note,
  count,
  open,
  line,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  note: string;
  count: number;
  open: boolean;
  line: string;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl" style={{ border: `1.5px solid ${line}`, background: "#FFFDFC" }}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-bold">
            {label} <span className="opacity-55 font-semibold">&middot; {count}</span>
          </span>
          <span className="block text-[11px] opacity-55">{note}</span>
        </span>
        <span aria-hidden className="opacity-55 text-xs">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="grid gap-1.5 px-2.5 pb-2.5">{children}</div>}
    </div>
  );
}

export default function SongPicker({
  value,
  onChange,
  accent,
  extras = [],
  extrasLabel = "Built in",
  extrasNote = "no file to fetch",
  onAuditionStart,
  onAuditionStop,
}: {
  /** The currently chosen URL. "" usually means the first extra. */
  value: string;
  onChange: (url: string) => void;
  /** Six-digit hex — tints are derived from it. */
  accent: string;
  extras?: SongExtra[];
  extrasLabel?: string;
  extrasNote?: string;
  onAuditionStart?: () => void;
  onAuditionStop?: () => void;
}) {
  const soft = `${accent}14`;
  const line = `${accent}26`;

  const url = (value || "").trim();
  const chosenTrack = LIBRARY.find((t) => t.url === url) ?? null;
  const chosenExtra = extras.find((e) => e.value === url) ?? null;
  /** A URL that is neither an extra nor on the shelf — somebody pasted it. */
  const isOwnUrl = !chosenTrack && !chosenExtra && /^https?:\/\//i.test(url);

  const firstGroup = extras.length ? "extras" : (chosenTrack?.group ?? "love");
  const [open, setOpen] = useState<string | null>(chosenTrack ? chosenTrack.group : firstGroup);
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

  // Whatever the host ducked for us has to come back when this unmounts, even if
  // the sheet was closed mid-audition. The ref is written in an effect, not
  // during render — `react-hooks/refs` is right that a render-phase write is a
  // value React cannot see changing.
  const stopRef = useRef(onAuditionStop);
  useEffect(() => { stopRef.current = onAuditionStop; }, [onAuditionStop]);
  useEffect(() => () => stopRef.current?.(), []);

  const audition = useCallback(
    (id: string, src: string) => {
      const el = audioRef.current;
      if (!el) return;
      if (playing === id) {
        el.pause();
        setPlaying(null);
        onAuditionStop?.();
        return;
      }
      el.pause();
      el.src = src;
      el.currentTime = 0;
      el.volume = 0.75;
      setLoading(id);
      onAuditionStart?.();
      void el
        .play()
        .then(() => {
          setLoading(null);
          setPlaying(id);
        })
        .catch(() => {
          setLoading(null);
          setPlaying(null);
          onAuditionStop?.();
        });
      el.onended = () => {
        setPlaying(null);
        onAuditionStop?.();
      };
    },
    [playing, onAuditionStart, onAuditionStop],
  );

  const toggle = useCallback((id: string) => setOpen((v) => (v === id ? null : id)), []);

  return (
    <div className="grid gap-2">
      {extras.length > 0 && (
        <Group
          id="extras"
          label={extrasLabel}
          note={extrasNote}
          count={extras.length}
          open={open === "extras"}
          line={line}
          onToggle={toggle}
        >
          {extras.map((e) => (
            <Row
              key={e.id}
              id={e.id}
              title={e.title}
              by={e.by}
              emoji={e.emoji}
              on={url === e.value}
              src={e.src}
              accent={accent}
              line={line}
              soft={soft}
              playing={playing}
              loading={loading}
              onAudition={audition}
              onPick={() => onChange(e.value)}
            />
          ))}
        </Group>
      )}

      {LIBRARY_GROUPS.map((g: { id: LibraryGroup; label: string; note: string }) => {
        const tracks = LIBRARY.filter((t) => t.group === g.id);
        return (
          <Group
            key={g.id}
            id={g.id}
            label={g.label}
            note={g.note}
            count={tracks.length}
            open={open === g.id}
            line={line}
            onToggle={toggle}
          >
            {tracks.map((t) => (
              <Row
                key={t.id}
                id={t.id}
                title={t.title}
                by={t.by}
                emoji={t.emoji}
                on={url === t.url}
                src={t.url}
                accent={accent}
                line={line}
                soft={soft}
                playing={playing}
                loading={loading}
                onAudition={audition}
                onPick={() => onChange(t.url)}
              />
            ))}
          </Group>
        );
      })}

      {/* Somebody's own file. Kept last: it is the escape hatch, not the offer. */}
      <div className="rounded-2xl px-3 py-3" style={{ border: `1.5px solid ${line}`, background: "#FFFDFC" }}>
        <label className="block text-[13px] font-bold mb-1.5">Or paste a link to your own song</label>
        <input
          type="url"
          inputMode="url"
          value={isOwnUrl ? url : ""}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="https://…/our-song.mp3"
          className="w-full rounded-xl px-3.5 py-3 text-[16px] outline-none"
          style={{ border: `1.5px solid ${line}`, background: "#FFF" }}
        />
        <p className="mt-1.5 text-[11px] opacity-60">
          A direct link to an audio file. It plays on the page exactly as it is.
        </p>
      </div>
    </div>
  );
}
