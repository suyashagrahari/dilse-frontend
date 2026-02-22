"use client";

import { useState, useCallback, useMemo, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Disc3, Heart } from "lucide-react";
import { type ContentData } from "./types";
import { GLASS_CARD } from "./styles";

const GRADIENTS = [
  "linear-gradient(135deg, #e11d48, #ec4899)",
  "linear-gradient(135deg, #7c3aed, #a855f7)",
  "linear-gradient(135deg, #ea580c, #f59e0b)",
  "linear-gradient(135deg, #0284c7, #38bdf8)",
  "linear-gradient(135deg, #059669, #34d399)",
  "linear-gradient(135deg, #e11d48, #7c3aed)",
];

interface Props {
  data: ContentData;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default memo(function MusicTab({ data, onPlayStateChange }: Props) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set([0, 2]));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  const tracks = data.musicTracks;
  const track = tracks[current];

  const updateProgress = useCallback(() => {
    const a = audioRef.current;
    if (a && a.duration) {
      setProgress(a.currentTime);
      setDuration(a.duration);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }

    const src = track?.src;
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => {
      setCurrent((c) => (c + 1) % tracks.length);
    });

    if (playing) {
      audio.play().catch(() => {});
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, tracks.length]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.play().catch(() => {});
      rafRef.current = requestAnimationFrame(updateProgress);
      onPlayStateChange?.(true);
    } else {
      a.pause();
      cancelAnimationFrame(rafRef.current);
      onPlayStateChange?.(false);
    }
  }, [playing, updateProgress, onPlayStateChange]);

  const next = useCallback(() => { setCurrent((c) => (c + 1) % tracks.length); setPlaying(true); }, [tracks.length]);
  const prev = useCallback(() => { setCurrent((c) => (c - 1 + tracks.length) % tracks.length); setPlaying(true); }, [tracks.length]);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const selectTrack = useCallback((i: number) => { setCurrent(i); setPlaying(true); }, []);
  const toggleLike = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setProgress(a.currentTime);
  }, [duration]);

  const gradient = GRADIENTS[current % GRADIENTS.length];

  const fmtTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  }, []);

  const trackList = useMemo(() =>
    tracks.map((t, i) => (
      <TrackItem
        key={`${t.title}-${i}`}
        song={t} index={i}
        isActive={current === i}
        isPlaying={current === i && playing}
        gradient={GRADIENTS[i % GRADIENTS.length]}
        isLiked={liked.has(i)}
        onSelect={selectTrack}
        onToggleLike={toggleLike}
      />
    )),
    [tracks, current, playing, liked, selectTrack, toggleLike],
  );

  return (
    <motion.div
      key="music"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-6 pb-24 h-screen flex flex-col overflow-hidden relative z-10 lg:items-center lg:pt-8"
    >
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 40%, var(--anni-radial) 0%, transparent 70%)" }}
      />

      <h3
        className="font-script text-2xl lg:text-3xl text-center mb-4 relative z-10"
        style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow)" }}
      >
        Our Playlist 🎶
      </h3>

      <div className="flex flex-col lg:flex-row lg:gap-5 lg:w-full lg:max-w-4xl xl:max-w-5xl flex-1 min-h-0 relative z-10">
        <motion.div
          className="flex-shrink-0 relative z-10 rounded-3xl p-5 lg:p-6 overflow-hidden lg:flex-1 lg:self-start"
          style={GLASS_CARD}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-4 relative z-10">
            <motion.div
              animate={playing ? { rotate: 360 } : { rotate: 0 }}
              transition={playing ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
              className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ background: gradient }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.2), transparent 50%)" }} />
              <div className="w-10 h-10 rounded-full border-[3px] border-white/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/30" />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0">
              {track && (
                <>
                  <p className="text-base lg:text-lg font-bold text-foreground truncate">
                    🎵 {track.title}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">{track.artist}</p>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: "var(--anni-pink)" }}>
                    {playing ? "♪ Now Playing..." : "Paused"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 mb-3">
            <div
              className="h-1 rounded-full overflow-hidden cursor-pointer"
              style={{ background: "rgba(225,29,72,0.1)" }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{
                  background: gradient,
                  width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-foreground/40 mt-0.5">
              <span>{fmtTime(progress)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 relative z-10">
            <button onClick={prev} className="active:scale-85 transition-transform">
              <SkipBack size={22} style={{ color: "var(--anni-text)" }} />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform text-white"
              style={{ background: "linear-gradient(135deg, #e11d48, #ec4899)", boxShadow: "0 4px 15px rgba(225,29,72,0.3)" }}
            >
              {playing ? (
                <Pause size={22} fill="white" />
              ) : (
                <Play size={22} className="ml-0.5" fill="white" />
              )}
            </button>
            <button onClick={next} className="active:scale-85 transition-transform">
              <SkipForward size={22} style={{ color: "var(--anni-text)" }} />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 min-h-0 mt-3 lg:mt-0 rounded-3xl overflow-hidden relative z-10 flex flex-col"
          style={GLASS_CARD}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0" style={{ borderBottom: "1px solid var(--anni-glass-border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--anni-text-muted)" }}>
              Playlist · {tracks.length} songs
            </p>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--anni-pink)" }}>
              <Heart size={9} className="fill-current" /> {liked.size} liked
            </div>
          </div>
          <div className="overflow-y-auto flex-1 no-scrollbar p-2">
            <div className="space-y-1">
              {trackList}
            </div>
          </div>
          {tracks.length > 3 && (
            <p className="text-[10px] text-center py-1.5 font-medium" style={{ color: "var(--anni-text-muted)" }}>
              ↕ Scroll for more songs
            </p>
          )}
        </motion.div>
      </div>

      <motion.p
        className="text-center text-xs mt-3 flex items-center justify-center gap-1 relative z-10"
        style={{ color: "var(--anni-text-muted)", textShadow: "var(--anni-glow-subtle)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Heart size={10} className="fill-rose-300 text-rose-300" />
        {tracks.length} songs in our playlist
        <Heart size={10} className="fill-rose-300 text-rose-300" />
      </motion.p>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
});

const TrackItem = memo(function TrackItem({
  song,
  index,
  isActive,
  isPlaying,
  gradient,
  isLiked,
  onSelect,
  onToggleLike,
}: {
  song: ContentData["musicTracks"][number];
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  gradient: string;
  isLiked: boolean;
  onSelect: (i: number) => void;
  onToggleLike: (i: number, e: React.MouseEvent) => void;
}) {
  const handleClick = useCallback(() => onSelect(index), [onSelect, index]);
  const handleLike = useCallback((e: React.MouseEvent) => onToggleLike(index, e), [onToggleLike, index]);

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
        isActive ? "shadow-sm" : "active:opacity-80"
      }`}
      style={isActive
        ? { background: "rgba(225,29,72,0.08)", border: "1px solid rgba(225,29,72,0.12)" }
        : { background: "transparent" }
      }
    >
      <div
        className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
        style={
          isActive
            ? { background: gradient, boxShadow: "0 3px 10px rgba(225,29,72,0.25)" }
            : { background: "rgba(225,29,72,0.08)", border: "1.5px solid rgba(225,29,72,0.1)" }
        }
      >
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-4">
            <span className="w-[3px] bg-white rounded-full eq-bar" style={{ animationDelay: "0s" }} />
            <span className="w-[3px] bg-white rounded-full eq-bar" style={{ animationDelay: "0.15s" }} />
            <span className="w-[3px] bg-white rounded-full eq-bar" style={{ animationDelay: "0.3s" }} />
            <span className="w-[3px] bg-white rounded-full eq-bar" style={{ animationDelay: "0.1s" }} />
          </div>
        ) : (
          <span className="text-sm">{isActive ? "🎵" : "🎶"}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isActive ? "font-bold" : "font-medium"}`} style={isActive ? { color: "var(--anni-text)" } : {}}>
          {song.title}
        </p>
        <p className="text-[11px] text-foreground/50 truncate mt-0.5">{song.artist}</p>
      </div>
      <span className="text-[11px] text-foreground/40 shrink-0 tabular-nums">{song.duration}</span>
      <div onClick={handleLike} role="button" tabIndex={-1} className="p-1 shrink-0 active:scale-75 transition-transform">
        <Heart size={13} className={isLiked ? "fill-pink-500 text-pink-500" : "text-foreground/20"} />
      </div>

      <style jsx>{`
        .eq-bar { animation: eq 0.6s ease-in-out infinite alternate; }
        @keyframes eq {
          0% { height: 4px; }
          100% { height: 14px; }
        }
      `}</style>
    </button>
  );
});
