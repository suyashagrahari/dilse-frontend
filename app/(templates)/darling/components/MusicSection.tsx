"use client";

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart, Music2 } from "lucide-react";
import type { ContentData } from "./types";

const PINK        = "#ff3d6b";
const GRAD        = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const CARD        = "rgba(255,255,255,0.06)";
const CARD_BORDER = "rgba(255,255,255,0.09)";
const TEXT_DIM    = "rgba(255,255,255,0.48)";
const PINK_EDGE   = "rgba(255,61,107,0.18)";

const DISC_GRADIENTS = [
  "linear-gradient(135deg, #ff3d6b, #a855f7)",
  "linear-gradient(135deg, #a855f7, #6366f1)",
  "linear-gradient(135deg, #ff3d6b, #ff6b9d)",
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #10b981, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
];

interface Props {
  data: ContentData;
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** Editor mobile: title in top bar */
  titleInTopBar?: boolean;
}

const TrackRow = memo(function TrackRow({
  track, index, active, isPlaying, gradient, isLiked, onSelect, onToggleLike,
}: {
  track: { title: string; artist: string; duration: string };
  index: number; active: boolean; isPlaying: boolean; gradient: string;
  isLiked: boolean; onSelect: (i: number) => void; onToggleLike: (i: number, e: React.MouseEvent) => void;
}) {
  const handleSelect = useCallback(() => onSelect(index), [onSelect, index]);
  const handleLike   = useCallback((e: React.MouseEvent) => onToggleLike(index, e), [onToggleLike, index]);

  return (
    <button
      onClick={handleSelect}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 8px",
        borderRadius: 12,
        textAlign: "left",
        background: active ? "linear-gradient(90deg, rgba(255,61,107,0.10) 0%, rgba(168,85,247,0.05) 100%)" : "transparent",
        border: active ? `1px solid ${PINK_EDGE}` : "1px solid transparent",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? gradient : "rgba(255,255,255,0.06)",
        boxShadow: active ? "0 2px 10px rgba(255,61,107,0.25)" : "none",
      }}>
        {isPlaying ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 12 }}>
            <span className="drl-music-eq-bar" style={{ width: 2.5, background: "#fff", borderRadius: 3 }} />
            <span className="drl-music-eq-bar drl-music-eq-bar-d1" style={{ width: 2.5, background: "#fff", borderRadius: 3 }} />
            <span className="drl-music-eq-bar drl-music-eq-bar-d2" style={{ width: 2.5, background: "#fff", borderRadius: 3 }} />
          </div>
        ) : (
          <span style={{ fontSize: active ? 14 : 13 }}>🎵</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 12.5,
          fontWeight: active ? 700 : 500,
          color: active ? "#fff" : "rgba(255,255,255,0.92)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{track.title}</p>
        <p style={{
          margin: 0, fontSize: 10.5,
          color: TEXT_DIM,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{track.artist}</p>
      </div>

      <span style={{ fontSize: 10, color: TEXT_DIM, flexShrink: 0, fontVariantNumeric: "tabular-nums", opacity: 0.85 }}>
        {track.duration}
      </span>

      <div
        onClick={handleLike}
        role="presentation"
        style={{ padding: 4, flexShrink: 0, cursor: "pointer", marginRight: -2 }}
      >
        <Heart size={14} strokeWidth={2} style={{ fill: isLiked ? PINK : "none", color: isLiked ? PINK : "rgba(255,255,255,0.22)" }} />
      </div>
    </button>
  );
});

export default memo(function MusicSection({ data, onPlayStateChange, titleInTopBar = false }: Props) {
  const [current,  setCurrent]  = useState(0);
  const [playing,  setPlaying]  = useState(false);
  const [liked,    setLiked]    = useState<Set<number>>(new Set([0, 2]));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef   = useRef<number>(0);

  const tracks = data.musicTracks;
  const song   = tracks[current];

  const updateProgress = useCallback(() => {
    const a = audioRef.current;
    if (a && a.duration) { setProgress(a.currentTime); setDuration(a.duration); }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }
    const src = song?.src;
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setCurrent((c) => (c + 1) % tracks.length));
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
      onPlayStateChange?.(true);
    } else {
      a.pause();
      cancelAnimationFrame(rafRef.current);
      onPlayStateChange?.(false);
    }
  }, [playing, updateProgress, onPlayStateChange]);

  const next        = useCallback(() => { setCurrent((c) => (c + 1) % tracks.length); setPlaying(true); }, [tracks.length]);
  const prev        = useCallback(() => { setCurrent((c) => (c - 1 + tracks.length) % tracks.length); setPlaying(true); }, [tracks.length]);
  const togglePlay  = useCallback(() => setPlaying((p) => !p), []);
  const selectTrack = useCallback((i: number) => {
    if (i === current) setPlaying((p) => !p); else { setCurrent(i); setPlaying(true); }
  }, [current]);
  const toggleLike  = useCallback((i: number, e: React.MouseEvent) => {
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
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }, []);

  const trackGrad = DISC_GRADIENTS[current % DISC_GRADIENTS.length];

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

  if (!song) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-0"
      style={{
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
        background: "#0d0b18",
      }}
    >
      <style jsx global>{`
        .drl-music-eq-bar {
          animation: drl-music-eq 0.55s ease-in-out infinite alternate;
        }
        .drl-music-eq-bar-d1 { animation-delay: 0.12s; }
        .drl-music-eq-bar-d2 { animation-delay: 0.24s; }
        @keyframes drl-music-eq {
          0% { height: 3px; }
          100% { height: 10px; }
        }
        .drl-music-scroll::-webkit-scrollbar { display: none; }
        .drl-music-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .drl-music-header {
          padding-top: max(56px, calc(env(safe-area-inset-top, 0px) + 44px));
          padding-left: 14px;
          padding-right: 14px;
        }
        @media (min-width: 1024px) {
          .drl-music-header {
            padding-top: 28px;
            padding-left: 32px;
            padding-right: 32px;
          }
        }
        .drl-music-header--embed {
          padding-top: max(46px, calc(env(safe-area-inset-top, 0px) + 36px)) !important;
        }
      `}</style>

      {/* Header */}
      <div
        className={`drl-music-header${titleInTopBar ? " drl-music-header--embed" : ""}`}
        style={{ flexShrink: 0 }}
      >
        {titleInTopBar ? (
          <>
            <div
              className="lg:hidden"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                paddingLeft: 16,
                paddingRight: 16,
                boxSizing: "border-box",
              }}
            >
              <p style={{
                margin: 0,
                fontSize: 12,
                color: TEXT_DIM,
                textAlign: "center",
                letterSpacing: "0.02em",
                lineHeight: 1.45,
                maxWidth: 300,
                width: "100%",
              }}>
                Songs that tell our story
              </p>
              <div
                aria-hidden
                style={{
                  height: 3,
                  width: 72,
                  marginTop: 10,
                  borderRadius: 999,
                  background: GRAD,
                  opacity: 0.65,
                  flexShrink: 0,
                }}
              />
            </div>
            <div className="hidden lg:block">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
                <h2 style={{
                  margin: 0,
                  fontSize: "clamp(22px, 2.4vw, 34px)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Our Playlist
                </h2>
                <Music2 size={26} color={PINK} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.95 }} aria-hidden />
              </div>
              <p style={{ margin: 0, fontSize: 11.5, color: TEXT_DIM, textAlign: "center", letterSpacing: "0.02em" }}>
                Songs that tell our story
              </p>
              <div style={{
                height: 2,
                maxWidth: 120,
                margin: "8px auto 0",
                borderRadius: 2,
                background: GRAD,
                opacity: 0.55,
              }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <h2 style={{
                margin: 0,
                fontSize: "clamp(18px, 4.8vw, 24px)",
                fontWeight: 800,
                lineHeight: 1.15,
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Our Playlist
              </h2>
              <Music2 size={22} color={PINK} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.95 }} aria-hidden />
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: TEXT_DIM, textAlign: "center", letterSpacing: "0.02em" }}>
              Songs that tell our story
            </p>
            <div style={{
              height: 2,
              maxWidth: 120,
              margin: "8px auto 0",
              borderRadius: 2,
              background: GRAD,
              opacity: 0.55,
            }} />
          </>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          padding: titleInTopBar ? "8px 11px 84px" : "10px 12px 88px",
          gap: titleInTopBar ? 8 : 10,
        }}
        className="lg:flex-col lg:items-stretch lg:gap-5 xl:gap-6 lg:max-w-6xl xl:max-w-7xl lg:mx-auto lg:w-full lg:flex-1 lg:min-h-0 lg:pb-10 lg:px-10 xl:px-12"
      >
        {/* Now playing — full-width bar on desktop (no dead space); compact grid on mobile */}
        <div
          style={{
            flexShrink: 0,
            borderRadius: 18,
            border: `1px solid ${PINK_EDGE}`,
            background: `linear-gradient(165deg, ${CARD} 0%, rgba(255,61,107,0.04) 100%)`,
            padding: "12px 12px 10px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          className="grid w-full shrink-0 grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-2 lg:grid-cols-[minmax(0,112px)_minmax(0,1fr)_auto] lg:gap-x-8 lg:gap-y-3 lg:items-center lg:self-auto lg:p-5 xl:gap-x-10 xl:p-6"
        >
            <motion.div
              animate={playing ? { rotate: 360 } : {}}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: trackGrad,
                boxShadow: playing
                  ? "0 6px 20px rgba(255,61,107,0.4)"
                  : "0 4px 14px rgba(0,0,0,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}
              className="col-start-1 row-start-1 shrink-0 justify-self-start lg:row-span-2 lg:h-[108px] lg:w-[108px] lg:justify-self-center lg:rounded-2xl xl:h-[118px] xl:w-[118px]"
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(255,255,255,0.2), transparent 55%)" }} />
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
                className="lg:h-[42px] lg:w-[42px]"
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }}
                  className="lg:h-4 lg:w-4" />
              </div>
            </motion.div>

            <div className="col-start-2 row-start-1 min-w-0 self-center lg:text-left">
              <p style={{
                margin: 0, fontWeight: 700, fontSize: 14, color: "#fff",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
                className="lg:text-lg xl:text-xl"
              >{song.title}</p>
              <p style={{
                margin: "1px 0 0", fontSize: 11, color: TEXT_DIM,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
                className="lg:text-sm"
              >
                {song.artist}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 600, color: PINK, letterSpacing: "0.04em" }}
                className="lg:text-[11px]"
              >
                {playing ? "NOW PLAYING" : "PAUSED"}
              </p>
            </div>

          <div className="col-span-2 col-start-1 row-start-2 min-w-0 lg:col-span-1 lg:col-start-2 lg:row-start-2">
            <div
              style={{
                height: 3,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={handleSeek}
            >
              <div style={{
                height: "100%",
                borderRadius: 999,
                background: GRAD,
                width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
                boxShadow: "0 0 10px rgba(255,61,107,0.35)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontSize: 9.5, color: TEXT_DIM, fontVariantNumeric: "tabular-nums" }} className="lg:text-xs">{fmtTime(progress)}</span>
              <span style={{ fontSize: 9.5, color: TEXT_DIM, fontVariantNumeric: "tabular-nums" }} className="lg:text-xs">{fmtTime(duration)}</span>
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}
            className="col-span-2 col-start-1 row-start-3 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:gap-5 xl:gap-6"
          >
            <button
              type="button"
              onClick={prev}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.32)",
                padding: 4,
                display: "flex",
              }}
              aria-label="Previous track"
            >
              <SkipBack size={17} strokeWidth={2} className="lg:h-[22px] lg:w-[22px]" />
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={togglePlay}
              style={{
                width: 46, height: 46, borderRadius: "50%", border: "none",
                background: GRAD, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(255,61,107,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
              className="lg:h-[52px] lg:w-[52px]"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing
                ? <Pause size={17} fill="#fff" color="#fff" className="lg:h-5 lg:w-5" />
                : <Play size={17} fill="#fff" color="#fff" style={{ marginLeft: 2 }} className="lg:h-5 lg:w-5" />
              }
            </motion.button>
            <button
              type="button"
              onClick={next}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.32)",
                padding: 4,
                display: "flex",
              }}
              aria-label="Next track"
            >
              <SkipForward size={17} strokeWidth={2} className="lg:h-[22px] lg:w-[22px]" />
            </button>
          </div>
        </div>

        {/* Playlist — tight list */}
        <div style={{
          flex: 1,
          minHeight: 0,
          borderRadius: 18,
          border: `1px solid ${CARD_BORDER}`,
          background: CARD,
          boxShadow: "0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px 7px",
            flexShrink: 0,
            background: "linear-gradient(180deg, rgba(255,61,107,0.06) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700,
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
            }}>
              Playlist · {tracks.length} songs
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: PINK }}>
              <Heart size={11} style={{ fill: PINK, color: PINK }} /> {liked.size} liked
            </div>
          </div>

          <div className="drl-music-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 5px 6px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {trackList}
            </div>
          </div>

          {tracks.length > 4 && (
            <p style={{
              fontSize: 9.5,
              textAlign: "center",
              padding: "5px 0",
              color: "rgba(255,255,255,0.28)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
              letterSpacing: "0.02em",
            }}>
              Scroll for more
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
});
