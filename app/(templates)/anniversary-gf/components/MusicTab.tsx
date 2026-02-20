"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Disc3, Heart } from "lucide-react";
import { type ContentData } from "./types";
import { GLASS_CARD } from "./styles";

export default memo(function MusicTab({ data }: { data: ContentData }) {
  const [playing, setPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);

  const track = data.musicTracks[activeTrack];

  const nextTrack = useCallback(() => {
    setActiveTrack((i) => (i + 1) % data.musicTracks.length);
    setPlaying(true);
  }, [data.musicTracks.length]);

  const prevTrack = useCallback(() => {
    setActiveTrack((i) => (i - 1 + data.musicTracks.length) % data.musicTracks.length);
    setPlaying(true);
  }, [data.musicTracks.length]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  const selectTrack = useCallback((i: number) => {
    setActiveTrack(i);
    setPlaying(true);
  }, []);

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

      {["🎵", "💗", "✨", "🎶", "🌸"].map((e, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-2xl float-heart"
          style={{ left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 25}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${4 + i * 0.5}s` }}
        >
          {e}
        </span>
      ))}

      <h3
        className="font-script text-2xl lg:text-3xl text-center mb-4 relative z-10"
        style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow)" }}
      >
        Our Playlist 🎶
      </h3>

      {/* Desktop: side-by-side player + playlist */}
      <div className="flex flex-col lg:flex-row lg:gap-5 lg:w-full lg:max-w-4xl xl:max-w-5xl flex-1 min-h-0 relative z-10">
        {/* Music Player */}
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
              className="shrink-0"
            >
              <Disc3 size={64} style={{ color: "var(--anni-text)" }} strokeWidth={1} />
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

          <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
            <button onClick={prevTrack} className="active:scale-85 transition-transform">
              <SkipBack size={22} style={{ color: "var(--anni-text)" }} />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: "linear-gradient(135deg, #e11d48, #ec4899)", boxShadow: "0 4px 15px rgba(225,29,72,0.3)" }}
            >
              {playing ? (
                <Pause size={22} className="text-white" fill="white" />
              ) : (
                <Play size={22} className="text-white ml-0.5" fill="white" />
              )}
            </button>
            <button onClick={nextTrack} className="active:scale-85 transition-transform">
              <SkipForward size={22} style={{ color: "var(--anni-text)" }} />
            </button>
          </div>
        </motion.div>

        {/* Song List */}
        <motion.div
          className="flex-1 min-h-0 mt-3 lg:mt-0 rounded-3xl overflow-hidden relative z-10"
          style={GLASS_CARD}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-y-auto h-full no-scrollbar p-2">
            <div className="space-y-1.5">
              {data.musicTracks.map((song, i) => (
                <TrackItem
                  key={i}
                  song={song}
                  index={i}
                  isActive={activeTrack === i}
                  isPlaying={activeTrack === i && playing}
                  onSelect={selectTrack}
                />
              ))}
            </div>
          </div>
          {data.musicTracks.length > 3 && (
            <p className="text-[10px] text-center py-1.5 font-medium" style={{ color: "var(--anni-text-muted)" }}>
              ↕ Scroll for more songs
            </p>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        className="text-center text-xs mt-3 flex items-center justify-center gap-1 relative z-10"
        style={{ color: "var(--anni-text-muted)", textShadow: "var(--anni-glow-subtle)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Heart size={10} className="fill-rose-300 text-rose-300" />
        {data.musicTracks.length} songs in our playlist
        <Heart size={10} className="fill-rose-300 text-rose-300" />
      </motion.p>

      <style jsx>{`
        .float-heart { opacity: 0.2; animation: fh 4s ease-in-out infinite; }
        @keyframes fh {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          25% { transform: translateY(-12px) rotate(8deg); opacity: 0.3; }
          50% { transform: translateY(-4px) rotate(-6deg); opacity: 0.2; }
          75% { transform: translateY(-15px) rotate(10deg); opacity: 0.3; }
        }
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
  onSelect,
}: {
  song: ContentData["musicTracks"][number];
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: (i: number) => void;
}) {
  const handleClick = useCallback(() => onSelect(index), [onSelect, index]);

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
            ? { background: "linear-gradient(135deg, #e11d48, #ec4899)", boxShadow: "0 3px 10px rgba(225,29,72,0.25)" }
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
      <span className="text-[11px] text-foreground/40 shrink-0">{song.duration}</span>

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
