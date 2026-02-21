"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart } from "lucide-react";
import type { EidData } from "./types";

const GRADIENTS = [
  "linear-gradient(135deg, #C5A03F, #3A8F7D)",
  "linear-gradient(135deg, #3A8F7D, #7BBFB3)",
  "linear-gradient(135deg, #D4A855, #C5A03F)",
  "linear-gradient(135deg, #5A9E8F, #3A8F7D)",
  "linear-gradient(135deg, #E0C96E, #B8965A)",
];

const TrackRow = memo(function TrackRow({
  track,
  index,
  active,
  isPlaying,
  gradient,
  isLiked,
  onSelect,
  onToggleLike,
}: {
  track: { title: string; artist: string; duration: string };
  index: number;
  active: boolean;
  isPlaying: boolean;
  gradient: string;
  isLiked: boolean;
  onSelect: (i: number) => void;
  onToggleLike: (i: number, e: React.MouseEvent) => void;
}) {
  const handleSelect = useCallback(() => onSelect(index), [onSelect, index]);
  const handleLike = useCallback(
    (e: React.MouseEvent) => onToggleLike(index, e),
    [onToggleLike, index]
  );

  return (
    <button
      onClick={handleSelect}
      className={`w-full flex items-center gap-3 lg:gap-4 px-3 py-2.5 lg:px-4 lg:py-3 rounded-2xl text-left transition-all ${active ? "shadow-sm" : "active:opacity-80"}`}
      style={
        active
          ? {
              background: "rgba(197,160,63,0.08)",
              border: "1px solid rgba(197,160,63,0.12)",
            }
          : {}
      }
    >
      <div
        className="w-9 h-9 lg:w-10 lg:h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm"
        style={{
          background: active ? gradient : "rgba(197,160,63,0.08)",
        }}
      >
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5">
            <span
              className="w-[2.5px] bg-white rounded-full eq-bar"
              style={{ animationDelay: "0s" }}
            />
            <span
              className="w-[2.5px] bg-white rounded-full eq-bar"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-[2.5px] bg-white rounded-full eq-bar"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        ) : (
          <span className="text-xs lg:text-sm">{active ? "🎵" : "🎶"}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs lg:text-sm truncate ${active ? "font-bold" : "font-medium"}`}
          style={{
            color: active ? "var(--eid-gold)" : "hsl(var(--eid-fg))",
          }}
        >
          {track.title}
        </p>
        <p
          className="text-[10px] lg:text-xs truncate"
          style={{ color: "hsl(var(--eid-muted-fg))" }}
        >
          {track.artist}
        </p>
      </div>
      <span
        className="text-[10px] lg:text-xs shrink-0 tabular-nums"
        style={{ color: "hsl(var(--eid-muted-fg) / 0.5)" }}
      >
        {track.duration}
      </span>
      <div
        onClick={handleLike}
        role="button"
        tabIndex={-1}
        className="p-1 shrink-0 active:scale-75 transition-transform"
      >
        <Heart
          size={13}
          className={
            isLiked
              ? "fill-[var(--eid-gold)] text-[var(--eid-gold)]"
              : ""
          }
          style={{
            color: isLiked ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg) / 0.2)",
          }}
        />
      </div>

      <style jsx>{`
        .eq-bar {
          animation: eq 0.6s ease-in-out infinite alternate;
        }
        @keyframes eq {
          0% {
            height: 3px;
          }
          100% {
            height: 12px;
          }
        }
      `}</style>
    </button>
  );
});

const PlaylistSection = memo(function PlaylistSection({
  data,
}: {
  data: EidData;
}) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set([0, 2]));

  const tracks = data.playlist;
  const song = tracks[current];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  const selectTrack = useCallback((i: number) => {
    setCurrent(i);
    setPlaying(true);
  }, []);

  const toggleLike = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  }, []);

  const gradient = GRADIENTS[current % GRADIENTS.length];

  const trackList = useMemo(
    () =>
      tracks.map((t, i) => (
        <TrackRow
          key={`${t.title}-${i}`}
          track={t}
          index={i}
          active={current === i}
          isPlaying={current === i && playing}
          gradient={GRADIENTS[i % GRADIENTS.length]}
          isLiked={liked.has(i)}
          onSelect={selectTrack}
          onToggleLike={toggleLike}
        />
      )),
    [tracks, current, playing, liked, selectTrack, toggleLike]
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
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(197,160,63,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Title */}
      <div className="text-center pt-6 pb-3 px-4 shrink-0 lg:pt-8">
        <h2
          className="text-xl md:text-2xl lg:text-3xl font-bold mb-0.5"
          style={{
            background:
              "linear-gradient(135deg, var(--eid-gold), var(--eid-teal))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Eid Playlist 🎶
        </h2>
        <p
          className="text-[11px] lg:text-sm"
          style={{ color: "hsl(var(--eid-muted-fg))" }}
        >
          Songs that celebrate the spirit of Eid
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-24 lg:flex-row lg:gap-8 lg:max-w-6xl xl:max-w-7xl lg:mx-auto lg:w-full lg:pb-8 lg:px-8">
        {/* Player card */}
        <div
          className="shrink-0 rounded-2xl shadow-md p-4 lg:w-[340px] lg:p-6 lg:self-start"
          style={{
            background: "hsl(var(--eid-card))",
            border: "1px solid hsl(var(--eid-border))",
          }}
        >
          <div className="flex items-center gap-3.5 mb-3.5 lg:flex-col lg:items-stretch lg:gap-4">
            <motion.div
              animate={playing ? { rotate: 360 } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 lg:w-full lg:aspect-square rounded-2xl shrink-0 flex items-center justify-center shadow-lg relative overflow-hidden"
              style={{ background: gradient }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.15), transparent 50%)",
                }}
              />
              <div className="w-10 h-10 lg:w-20 lg:h-20 rounded-full border-[3px] border-white/20 flex items-center justify-center">
                <div className="w-4 h-4 lg:w-8 lg:h-8 rounded-full bg-white/30" />
              </div>
            </motion.div>
            <div className="flex-1 min-w-0 lg:text-center">
              <p
                className="font-bold text-sm lg:text-base truncate"
                style={{ color: "hsl(var(--eid-fg))" }}
              >
                {song.title}
              </p>
              <p
                className="text-[11px] lg:text-xs truncate"
                style={{ color: "hsl(var(--eid-muted-fg))" }}
              >
                {song.artist}
              </p>
              <p
                className="text-[9px] lg:text-[10px] font-medium mt-0.5"
                style={{ color: "var(--eid-gold)" }}
              >
                {playing ? "♪ Now Playing" : "Paused"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "hsl(var(--eid-surface))" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: gradient }}
                animate={
                  playing
                    ? { width: ["0%", "100%"] }
                    : { width: "30%" }
                }
                transition={
                  playing ? { duration: 25, ease: "linear" } : {}
                }
              />
            </div>
            <div
              className="flex justify-between text-[8px] mt-0.5"
              style={{ color: "hsl(var(--eid-muted-fg) / 0.5)" }}
            >
              <span>0:00</span>
              <span>{song.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 lg:gap-6">
            <button
              onClick={prev}
              className="active:scale-90 transition-all"
              style={{ color: "hsl(var(--eid-muted-fg))" }}
            >
              <SkipBack size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              style={{
                background: gradient,
                color: "#fff",
              }}
            >
              {playing ? (
                <Pause
                  size={17}
                  fill="white"
                  className="lg:w-5 lg:h-5"
                />
              ) : (
                <Play
                  size={17}
                  fill="white"
                  className="ml-0.5 lg:w-5 lg:h-5"
                />
              )}
            </button>
            <button
              onClick={next}
              className="active:scale-90 transition-all"
              style={{ color: "hsl(var(--eid-muted-fg))" }}
            >
              <SkipForward size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>

        {/* Track list */}
        <div
          className="flex-1 min-h-0 mt-3 lg:mt-0 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          style={{
            background: "hsl(var(--eid-card))",
            border: "1px solid hsl(var(--eid-border))",
          }}
        >
          <div
            className="flex items-center justify-between px-4 pt-3 pb-2 lg:px-5 lg:pt-4 lg:pb-3 shrink-0"
            style={{
              borderBottom: "1px solid hsl(var(--eid-border) / 0.5)",
            }}
          >
            <p
              className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider"
              style={{ color: "hsl(var(--eid-muted-fg))" }}
            >
              Playlist &middot; {tracks.length} songs
            </p>
            <div
              className="flex items-center gap-1 text-[10px] lg:text-xs"
              style={{ color: "var(--eid-gold)" }}
            >
              <Heart size={9} className="fill-current" /> {liked.size} liked
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-1.5">
            <div className="space-y-0.5">{trackList}</div>
          </div>
          {tracks.length > 4 && (
            <p
              className="text-[9px] text-center py-1.5 shrink-0"
              style={{
                color: "hsl(var(--eid-muted-fg) / 0.4)",
                borderTop: "1px solid hsl(var(--eid-border) / 0.3)",
              }}
            >
              ↕ Scroll for more
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
});

export default PlaylistSection;
