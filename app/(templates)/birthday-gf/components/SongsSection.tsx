"use client";

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart, Music2 } from "lucide-react";
import type { BirthdayData, MusicTrack } from "./types";
import FlowerBackground from "./FlowerBackground";

const BROWN = "#5D3F31";
const COPPER = "#AD684A";
const WARM = "rgb(108, 74, 46)";
const SCRIPT = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const WARM_BORDER = "rgba(173, 104, 74, 0.22)";

const DISC_GRADIENTS = [
  "linear-gradient(135deg, #AD684A, #C98878)",
  "linear-gradient(135deg, #8B6B5A, #B8948A)",
  "linear-gradient(135deg, #C4A060, #D4B870)",
  "linear-gradient(135deg, #7E8E6E, #9EAA90)",
  "linear-gradient(135deg, #9E7E6E, #C4A090)",
  "linear-gradient(135deg, #5D3F31, #8B6B5A)",
];

interface Props {
  data: BirthdayData;
  onPlayingChange?: (isPlaying: boolean) => void;
}

const TrackRow = memo(function TrackRow({
  track, index, active, isPlaying, gradient, isLiked, onSelect, onToggleLike,
}: {
  track: MusicTrack;
  index: number; active: boolean; isPlaying: boolean; gradient: string;
  isLiked: boolean; onSelect: (i: number) => void; onToggleLike: (i: number, e: React.MouseEvent) => void;
}) {
  const handleSelect = useCallback(() => onSelect(index), [onSelect, index]);
  const handleLike = useCallback((e: React.MouseEvent) => onToggleLike(index, e), [onToggleLike, index]);
  const hasAudio = !!track.src;

  return (
    <button
      onClick={handleSelect}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 14, textAlign: "left",
        transition: "all 0.15s",
        background: active ? "rgba(173,104,74,0.10)" : "transparent",
        border: active ? "1px solid rgba(173,104,74,0.25)" : "1px solid transparent",
        cursor: hasAudio ? "pointer" : "default",
        opacity: hasAudio ? 1 : 0.6,
      }}
    >
      {/* Disc / EQ indicator */}
      <div style={{
        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: active ? "0 3px 10px rgba(93,63,49,0.18)" : "0 2px 6px rgba(93,63,49,0.08)",
        background: active ? gradient : "rgba(173,104,74,0.10)",
      }}>
        {active && isPlaying ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
            <span className="bday-eq-bar" style={{ width: "2.5px", background: "rgba(255,252,246,0.9)", borderRadius: 4, animationDelay: "0s" }} />
            <span className="bday-eq-bar" style={{ width: "2.5px", background: "rgba(255,252,246,0.9)", borderRadius: 4, animationDelay: "0.15s" }} />
            <span className="bday-eq-bar" style={{ width: "2.5px", background: "rgba(255,252,246,0.9)", borderRadius: 4, animationDelay: "0.3s" }} />
          </div>
        ) : hasAudio ? (
          <Music2 size={14} style={{ color: active ? "rgba(255,252,246,0.85)" : "rgba(173,104,74,0.50)" }} />
        ) : (
          <Music2 size={14} style={{ color: "rgba(173,104,74,0.30)" }} />
        )}
      </div>

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: SCRIPT, fontSize: 15,
          color: active ? WARM : "rgb(90,60,35)",
          margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{track.title}</p>
        <p style={{
          fontFamily: SERIF, fontStyle: "italic", fontSize: 11,
          color: active ? COPPER : "rgba(108,74,46,0.50)",
          margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{track.artist}</p>
      </div>

      {/* Like */}
      <div onClick={handleLike} role="button" tabIndex={-1} style={{ padding: 4, flexShrink: 0, cursor: "pointer" }}>
        <Heart size={13} style={{ fill: isLiked ? COPPER : "none", color: isLiked ? COPPER : "rgba(108,74,46,0.20)", transition: "all 0.2s" }} />
      </div>

      {!hasAudio && (
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 10, color: "rgba(108,74,46,0.30)", flexShrink: 0 }}>
          No audio
        </span>
      )}

      <style jsx>{`
        .bday-eq-bar { animation: bday-eq 0.6s ease-in-out infinite alternate; }
        @keyframes bday-eq { 0% { height: 3px; } 100% { height: 12px; } }
      `}</style>
    </button>
  );
});

export default memo(function SongsSection({ data, onPlayingChange }: Props) {
  const tracks = data.musicTracks ?? [];
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);
  const [liked, setLiked] = useState<Set<number>>(new Set([0]));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  const song = tracks[current];

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

    const src = song?.src;
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => {
      let next = (current + 1) % tracks.length;
      let attempts = 0;
      while (!tracks[next]?.src && attempts < tracks.length) {
        next = (next + 1) % tracks.length;
        attempts++;
      }
      if (tracks[next]?.src) {
        setCurrent(next);
      } else {
        setPlaying(false);
      }
    });

    if (playing) {
      audio.play().catch(() => {});
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    return () => { cancelAnimationFrame(rafRef.current); audio.pause(); audio.src = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, tracks.length]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.play().catch(() => {});
      rafRef.current = requestAnimationFrame(updateProgress);
    } else {
      a.pause();
      cancelAnimationFrame(rafRef.current);
    }
  }, [playing, updateProgress]);

  const goNext = useCallback(() => {
    let n = (current + 1) % tracks.length;
    let attempts = 0;
    while (!tracks[n]?.src && attempts < tracks.length) { n = (n + 1) % tracks.length; attempts++; }
    if (tracks[n]?.src) { setCurrent(n); setPlaying(true); }
  }, [current, tracks]);

  const goPrev = useCallback(() => {
    let n = (current - 1 + tracks.length) % tracks.length;
    let attempts = 0;
    while (!tracks[n]?.src && attempts < tracks.length) { n = (n - 1 + tracks.length) % tracks.length; attempts++; }
    if (tracks[n]?.src) { setCurrent(n); setPlaying(true); }
  }, [current, tracks]);

  const togglePlay = useCallback(() => {
    if (!song?.src) return;
    setPlaying((p) => !p);
  }, [song]);

  const selectTrack = useCallback((i: number) => {
    if (!tracks[i]?.src) return;
    if (i === current) { setPlaying((p) => !p); } else { setCurrent(i); setPlaying(true); }
  }, [current, tracks]);

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

  const fmtTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  }, []);

  const gradient = DISC_GRADIENTS[current % DISC_GRADIENTS.length];

  const trackList = useMemo(() =>
    tracks.map((t, i) => (
      <TrackRow
        key={`${t.title}-${i}`}
        track={t} index={i}
        active={current === i}
        isPlaying={current === i && playing}
        gradient={DISC_GRADIENTS[i % DISC_GRADIENTS.length]}
        isLiked={liked.has(i)}
        onSelect={selectTrack}
        onToggleLike={toggleLike}
      />
    )),
    [tracks, current, playing, liked, selectTrack, toggleLike],
  );

  if (tracks.length === 0) {
    return (
      <FlowerBackground>
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          style={{
            minHeight: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "28px 16px 100px",
          }}
        >
          <div style={{
            borderRadius: 24, padding: "56px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(18px)",
            border: "2px dashed rgba(173,104,74,0.20)",
            boxShadow: "0 8px 32px rgba(93,63,49,0.07)",
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(145deg, rgba(173,104,74,0.10), rgba(93,63,49,0.06))",
              border: "2px dashed rgba(173,104,74,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Music2 size={36} style={{ color: "rgba(173,104,74,0.45)" }} />
            </div>
            <p style={{ fontFamily: SCRIPT, fontSize: 24, color: BROWN, margin: 0 }}>No songs yet</p>
            <p style={{
              fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
              color: COPPER, margin: 0, textAlign: "center", maxWidth: 280, lineHeight: 1.6, opacity: 0.7,
            }}>
              Add music tracks to create the perfect birthday playlist
            </p>
          </div>
        </motion.div>
      </FlowerBackground>
    );
  }

  return (
    <FlowerBackground>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        style={{
          minHeight: "100%", display: "flex", flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", padding: "24px 16px 12px", flexShrink: 0 }}>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: SCRIPT,
              fontSize: "clamp(28px, 7vw, 42px)",
              fontWeight: 400,
              color: BROWN,
              margin: 0,
            }}
          >
            Birthday Playlist
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
              color: COPPER, marginTop: 4, opacity: 0.7,
            }}
          >
            Songs that celebrate you
          </motion.p>
        </div>

        <div
          style={{
            flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
            padding: "0 14px 100px", gap: 12,
          }}
          className="lg:flex-row lg:gap-8 lg:max-w-5xl lg:mx-auto lg:w-full lg:pb-8 lg:px-8"
        >
          {/* ── Player card ── */}
          <div
            style={{
              flexShrink: 0, borderRadius: 22,
              border: `1px solid ${WARM_BORDER}`,
              background: "rgba(255,255,255,0.50)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(93,63,49,0.12)",
              padding: 16,
            }}
            className="lg:w-[320px] lg:p-6 lg:self-start"
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}
              className="lg:flex-col lg:items-stretch lg:gap-4"
            >
              {/* Vinyl disc */}
              <motion.div
                animate={playing ? { rotate: 360 } : {}}
                transition={playing ? { duration: 6, repeat: Infinity, ease: "linear" } : {}}
                style={{
                  width: 72, height: 72, borderRadius: 18, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: gradient,
                  boxShadow: "0 6px 24px rgba(93,63,49,0.22)",
                  position: "relative", overflow: "hidden",
                }}
                className="lg:w-full lg:aspect-square lg:rounded-[22px]"
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(145deg, rgba(255,255,255,0.22), transparent 50%)",
                  pointerEvents: "none",
                }} />
                <div
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: "3px solid rgba(255,252,246,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  className="lg:w-20 lg:h-20"
                >
                  <div
                    style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(255,252,246,0.30)",
                    }}
                    className="lg:w-8 lg:h-8"
                  />
                </div>
              </motion.div>

              {/* Song info */}
              <div style={{ flex: 1, minWidth: 0 }} className="lg:text-center">
                <p style={{
                  fontFamily: SCRIPT, fontSize: 16, color: BROWN,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0,
                }} className="lg:text-lg">
                  {song?.title || "No track"}
                </p>
                <p style={{
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 12,
                  color: "rgba(108,74,46,0.55)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0 0",
                }}>
                  {song?.artist || ""}
                </p>
                <p style={{
                  fontFamily: SCRIPT, fontSize: 11, marginTop: 2, color: COPPER,
                }}>
                  {playing ? "♪ Now Playing" : "Paused"}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 14 }}>
              <div
                onClick={handleSeek}
                style={{
                  height: 5, background: "rgba(173,104,74,0.15)",
                  borderRadius: 999, overflow: "hidden", cursor: "pointer",
                  position: "relative",
                }}
              >
                <div style={{
                  height: "100%", borderRadius: 999,
                  background: gradient,
                  width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
                  transition: "width 0.2s",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontFamily: SERIF, fontSize: 10, color: "rgba(108,74,46,0.45)" }}>{fmtTime(progress)}</span>
                <span style={{ fontFamily: SERIF, fontSize: 10, color: "rgba(108,74,46,0.45)" }}>{fmtTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <button
                onClick={goPrev}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(108,74,46,0.40)", transition: "color 0.15s",
                }}
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={togglePlay}
                style={{
                  width: 48, height: 48, borderRadius: "50%", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: gradient, cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(93,63,49,0.28)",
                  transition: "transform 0.15s",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={playing ? "pause" : "play"}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {playing
                      ? <Pause size={18} fill="rgba(255,252,246,0.95)" color="rgba(255,252,246,0.95)" />
                      : <Play size={18} fill="rgba(255,252,246,0.95)" color="rgba(255,252,246,0.95)" style={{ marginLeft: 2 }} />
                    }
                  </motion.span>
                </AnimatePresence>
              </button>
              <button
                onClick={goNext}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(108,74,46,0.40)", transition: "color 0.15s",
                }}
              >
                <SkipForward size={20} />
              </button>
            </div>
          </div>

          {/* ── Playlist card ── */}
          <div style={{
            flex: 1, minHeight: 0, borderRadius: 22,
            border: `1px solid ${WARM_BORDER}`,
            background: "rgba(255,255,255,0.50)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 4px 20px rgba(93,63,49,0.08)",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            {/* Playlist header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px 10px", flexShrink: 0,
              borderBottom: "1px solid rgba(173,104,74,0.10)",
            }}>
              <p style={{
                fontFamily: SERIF, fontSize: 11, fontWeight: 600,
                color: "rgba(108,74,46,0.55)", letterSpacing: "0.08em",
                textTransform: "uppercase", margin: 0,
              }}>
                Playlist · {tracks.length} songs
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: COPPER,
              }}>
                <Heart size={10} style={{ fill: COPPER, color: COPPER }} /> {liked.size} liked
              </div>
            </div>

            {/* Track list */}
            <div
              style={{ flex: 1, overflowY: "auto", padding: 6 }}
              className="no-scrollbar"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {trackList}
              </div>
            </div>

            {tracks.length > 4 && (
              <p style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 10, textAlign: "center",
                padding: "6px 0", color: "rgba(108,74,46,0.30)",
                borderTop: "1px solid rgba(173,104,74,0.08)", flexShrink: 0,
              }}>
                Scroll for more
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </FlowerBackground>
  );
});
