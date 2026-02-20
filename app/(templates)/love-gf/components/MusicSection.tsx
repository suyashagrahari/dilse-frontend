"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart } from "lucide-react";
import type { ContentData } from "./types";

const GRADIENTS = [
  "linear-gradient(135deg, #e11d48, #ec4899)",
  "linear-gradient(135deg, #7c3aed, #a855f7)",
  "linear-gradient(135deg, #ea580c, #f59e0b)",
  "linear-gradient(135deg, #0284c7, #38bdf8)",
  "linear-gradient(135deg, #059669, #34d399)",
];

interface Props { data: ContentData; }

const TrackRow = memo(function TrackRow({
  track, index, active, isPlaying, gradient, isLiked, onSelect, onToggleLike,
}: {
  track: { title: string; artist: string; duration: string };
  index: number; active: boolean; isPlaying: boolean; gradient: string;
  isLiked: boolean; onSelect: (i: number) => void; onToggleLike: (i: number, e: React.MouseEvent) => void;
}) {
  const handleSelect = useCallback(() => onSelect(index), [onSelect, index]);
  const handleLike = useCallback((e: React.MouseEvent) => onToggleLike(index, e), [onToggleLike, index]);

  return (
    <button
      onClick={handleSelect}
      className={`w-full flex items-center gap-3 lg:gap-4 px-3 py-2.5 lg:px-4 lg:py-3 rounded-2xl text-left transition-all ${
        active ? "shadow-sm" : "active:opacity-80"
      }`}
      style={active ? { background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.1)" } : {}}
    >
      <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm" style={{ background: active ? gradient : "rgba(225,29,72,0.06)" }}>
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-[2.5px] bg-white rounded-full eq-bar" style={{ animationDelay: "0s" }} />
            <span className="w-[2.5px] bg-white rounded-full eq-bar" style={{ animationDelay: "0.15s" }} />
            <span className="w-[2.5px] bg-white rounded-full eq-bar" style={{ animationDelay: "0.3s" }} />
          </div>
        ) : (
          <span className="text-xs lg:text-sm">{active ? "🎵" : "🎶"}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs lg:text-sm truncate ${active ? "font-bold text-pink-700 dark:text-pink-300" : "font-medium text-foreground"}`}>{track.title}</p>
        <p className="text-[10px] lg:text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>
      <span className="text-[10px] lg:text-xs text-muted-foreground/50 shrink-0 tabular-nums">{track.duration}</span>
      <div onClick={handleLike} role="button" tabIndex={-1} className="p-1 shrink-0 active:scale-75 transition-transform">
        <Heart size={13} className={isLiked ? "fill-pink-500 text-pink-500" : "text-muted-foreground/20"} />
      </div>

      <style jsx>{`
        .eq-bar { animation: eq 0.6s ease-in-out infinite alternate; }
        @keyframes eq { 0% { height: 3px; } 100% { height: 12px; } }
      `}</style>
    </button>
  );
});

export default memo(function MusicSection({ data }: Props) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set([0, 2]));

  const tracks = data.musicTracks;
  const song = tracks[current];

  const next = useCallback(() => { setCurrent((c) => (c + 1) % tracks.length); setPlaying(true); }, [tracks.length]);
  const prev = useCallback(() => { setCurrent((c) => (c - 1 + tracks.length) % tracks.length); setPlaying(true); }, [tracks.length]);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const selectTrack = useCallback((i: number) => { setCurrent(i); setPlaying(true); }, []);
  const toggleLike = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  }, []);

  const gradient = GRADIENTS[current % GRADIENTS.length];

  const trackList = useMemo(() =>
    tracks.map((t, i) => (
      <TrackRow
        key={`${t.title}-${i}`}
        track={t} index={i}
        active={current === i}
        isPlaying={current === i && playing}
        gradient={GRADIENTS[i % GRADIENTS.length]}
        isLiked={liked.has(i)}
        onSelect={selectTrack}
        onToggleLike={toggleLike}
      />
    )),
    [tracks, current, playing, liked, selectTrack, toggleLike],
  );

  if (!song) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-screen flex flex-col overflow-hidden relative z-10"
    >
      <div className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(236,72,153,0.06) 0%, transparent 70%)" }} />

      {/* Title */}
      <div className="text-center pt-6 pb-3 px-4 shrink-0 lg:pt-8">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-0.5"
          style={{ background: "linear-gradient(135deg, #e11d48, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Our Playlist 🎶
        </h2>
        <p className="text-muted-foreground text-[11px] lg:text-sm">Songs that tell our story</p>
      </div>

      {/* Main content — fits in one screen */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-24 lg:flex-row lg:gap-8 lg:max-w-6xl xl:max-w-7xl lg:mx-auto lg:w-full lg:pb-8 lg:px-8">

        {/* Player Card — bigger on desktop */}
        <div className="shrink-0 rounded-2xl border border-pink-200/30 dark:border-pink-800/20 bg-white dark:bg-slate-900 shadow-md p-4 lg:w-[340px] lg:p-6 lg:self-start">
          {/* Album art + info */}
          <div className="flex items-center gap-3.5 mb-3.5 lg:flex-col lg:items-stretch lg:gap-4">
            <motion.div
              animate={playing ? { rotate: 360 } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 lg:w-full lg:aspect-square rounded-2xl shrink-0 flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ background: gradient }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.2), transparent 50%)" }} />
              <div className="w-10 h-10 lg:w-20 lg:h-20 rounded-full border-[3px] border-white/20 flex items-center justify-center">
                <div className="w-4 h-4 lg:w-8 lg:h-8 rounded-full bg-white/30" />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0 lg:text-center">
              <p className="font-bold text-sm lg:text-base text-foreground truncate">{song.title}</p>
              <p className="text-[11px] lg:text-xs text-muted-foreground truncate">{song.artist}</p>
              <p className="text-[9px] lg:text-[10px] font-medium mt-0.5" style={{ color: "#e11d48" }}>
                {playing ? "♪ Now Playing" : "Paused"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="h-1 bg-pink-100 dark:bg-pink-900/30 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: gradient }}
                animate={playing ? { width: ["0%", "100%"] } : { width: "30%" }}
                transition={playing ? { duration: 25, ease: "linear" } : {}}
              />
            </div>
            <div className="flex justify-between text-[8px] text-muted-foreground/50 mt-0.5"><span>0:00</span><span>{song.duration}</span></div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 lg:gap-6">
            <button onClick={prev} className="text-foreground/35 hover:text-foreground active:scale-90 transition-all"><SkipBack size={18} className="lg:w-5 lg:h-5" /></button>
            <button onClick={togglePlay}
              className="w-11 h-11 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
              style={{ background: gradient }}>
              {playing ? <Pause size={17} fill="white" className="lg:w-5 lg:h-5" /> : <Play size={17} fill="white" className="ml-0.5 lg:w-5 lg:h-5" />}
            </button>
            <button onClick={next} className="text-foreground/35 hover:text-foreground active:scale-90 transition-all"><SkipForward size={18} className="lg:w-5 lg:h-5" /></button>
          </div>
        </div>

        {/* Playlist — scrollable within its space */}
        <div className="flex-1 min-h-0 mt-3 lg:mt-0 rounded-2xl border border-pink-200/30 dark:border-pink-800/20 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 lg:px-5 lg:pt-4 lg:pb-3 shrink-0 border-b border-pink-100/50 dark:border-pink-900/20">
            <p className="text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Playlist · {tracks.length} songs</p>
            <div className="flex items-center gap-1 text-[10px] lg:text-xs text-pink-400">
              <Heart size={9} className="fill-current" /> {liked.size} liked
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-1.5">
            <div className="space-y-0.5">
              {trackList}
            </div>
          </div>
          {tracks.length > 4 && (
            <p className="text-[9px] text-center py-1.5 text-muted-foreground/40 shrink-0 border-t border-pink-100/30 dark:border-pink-900/10">
              ↕ Scroll for more
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
});
