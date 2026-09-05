"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Maximize2, ListVideo, Check, CornerDownRight } from "lucide-react";
import type { GuideVideo } from "@/types/product-guide";
import { formatDuration } from "@/lib/guides";

/**
 * The guide player.
 *
 * ── WHY NOT JUST `<video controls>` ──────────────────────────────────────────
 *
 * The native control bar has no concept of chapters, and chapters are the
 * feature this player exists for. These recordings are 90 seconds covering
 * thirteen distinct steps, which means the average step is under seven seconds
 * — with a plain scrub bar, finding "the bit about the password" is a matter of
 * dragging back and forth until you happen to land on it. The chapter rail
 * turns that into one click, and the rail doubles as a table of contents you
 * can read before deciding to press play at all.
 *
 * The custom bar is deliberately thin: play/pause, restart, a seekable
 * progress track with chapter ticks, a time readout, and native fullscreen.
 * Volume is absent because the recordings are silent (see `video.silent`) and a
 * volume slider that does nothing is worse than no slider.
 *
 * ── PROGRESSIVE ENHANCEMENT ──────────────────────────────────────────────────
 *
 * `preload="none"` plus a poster: the page costs one WebP until someone
 * actually presses play, so a visitor who came for the written steps never pays
 * for a 7 MB download. `playsInline` keeps iOS from hijacking into its
 * fullscreen player, which would abandon the chapter rail entirely.
 */

const GOLD = "#c9a84c";
const INK = "#2a0a0e";
const MAROON = "#3d0c11";

interface Props {
  slug: string;
  video: GuideVideo;
  sources: { mp4: string; mp4720: string; poster: string };
  title: string;
  /**
   * Called by the per-row "read this step" control — NOT by the chapter click.
   * Seeking and scrolling are deliberately separate actions; see the comment on
   * `jumpToSection` in GuideDetailClient for why conflating them is hostile.
   */
  onReadSection?: (sectionId: string) => void;
}

export default function GuideVideoPlayer({ video, sources, title, onReadSection }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [railOpen, setRailOpen] = useState(true);

  const duration = video.seconds;

  // Which chapter the playhead is inside. Computed rather than stored so it
  // cannot drift out of sync with the actual media time.
  const activeIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < video.chapters.length; i++) {
      if (time >= video.chapters[i].at) idx = i;
      else break;
    }
    return idx;
  }, [time, video.chapters]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setTime(el.currentTime);
    const onPlay = () => { setPlaying(true); setStarted(true); };
    const onPause = () => setPlaying(false);
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const el = ref.current;
    if (!el) return;
    // With preload="none" the element may have no metadata yet, and assigning
    // currentTime before it does is silently dropped — the seek is lost and the
    // video starts from 0. So play() first, then seek once metadata lands.
    setStarted(true);
    setTime(seconds);
    const apply = () => { el.currentTime = seconds; };
    if (el.readyState >= 1) apply();
    else el.addEventListener("loadedmetadata", apply, { once: true });
    // A refused play() must not lose the seek, and must not surface as an
    // unhandled rejection. Autoplay is refused for any recording that carries
    // sound, and arriving from a search result is exactly when that happens.
    void el.play().catch(() => {});
  }, []);

  const restart = useCallback(() => seek(0), [seek]);

  /**
   * Deep link from a "key moment" in a search result: /guides/<slug>?t=42.
   *
   * Google requires a Clip's `url` to carry its start time as a query
   * parameter or fragment — a bare page URL is not a valid Clip target, and a
   * section anchor is not a time. But the requirement exists because of the
   * promise the link makes to whoever clicks it: they picked a moment out of
   * the results and expect to land on it. So the markup and the behaviour are
   * added together — emitting ?t= without honouring it would drop people at
   * the top of the page and read as a bait-and-switch to Google as much as to
   * them.
   *
   * The seek itself goes through the same `seek()` every chapter row already
   * uses, which handles the `preload="none"` case: currentTime assigned before
   * metadata exists is silently dropped, so it defers to `loadedmetadata`. No
   * explicit `load()` is needed to get there — `play()` starts the fetch, and
   * every recording is silent and therefore muted, so autoplay is never
   * refused. An added `load()` would only have mattered for a recording with
   * sound, and it carries reset-and-abort semantics, so it is not worth
   * shipping for a case that does not exist.
   */
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("t");
    if (raw === null) return;
    const t = Number(raw);
    if (!Number.isFinite(t) || t <= 0 || t >= duration) return;
    const el = ref.current;
    if (!el) return;
    seek(t);
    // Deferred by two frames rather than scrolled straight away. The browser
    // positions a freshly loaded document itself, and a smooth scroll started
    // in a mount effect is simply cancelled by that — measured here as the page
    // sitting at scrollY 0 with the player still below the fold, while the same
    // call from the console worked. Waiting until after the first paint puts
    // the scroll after the reset instead of underneath it.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      ),
    );
    // Run once, on arrival. Re-seeking on any later re-render would yank the
    // playhead back while someone is watching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(pct * duration);
  };

  const fullscreen = () => {
    const el = ref.current;
    if (!el) return;
    // Safari on iOS exposes only the webkit-prefixed form, and on iPhone that
    // is the only way to go fullscreen at all.
    const anyEl = el as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    if (el.requestFullscreen) void el.requestFullscreen();
    else anyEl.webkitEnterFullscreen?.();
  };

  // Space and arrows, but only once the player has been interacted with — a
  // page-level space listener that swallows scrolling would be hostile to
  // someone reading the docs underneath.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    if (e.key === "ArrowRight") { e.preventDefault(); seek(Math.min(duration, time + 5)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); seek(Math.max(0, time - 5)); }
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      className="grid gap-4 lg:gap-5"
      style={{ gridTemplateColumns: railOpen ? "minmax(0,1fr)" : "minmax(0,1fr)" }}
    >
      <div className="grid gap-4 lg:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ── Stage ─────────────────────────────────────────────────────── */}
        <div
          ref={shellRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden outline-none"
          style={{
            background: MAROON,
            border: `1px solid ${GOLD}44`,
            boxShadow: "0 18px 44px rgba(61,12,17,0.20)",
          }}
        >
          <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#1a0508" }}>
            <video
              ref={ref}
              poster={sources.poster}
              preload="none"
              playsInline
              muted={video.silent}
              onClick={toggle}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", cursor: "pointer" }}
            >
              {/* 720p first, guarded by a media query, then 1080p as the
                  unconditional fallback. A browser walks these in order and
                  takes the first whose `media` matches, so a phone never pays
                  for the 5 MB file to render detail its screen cannot show,
                  and anything that ignores `media` on <source> — Safari has
                  historically been inconsistent here — simply falls through to
                  the 1080p entry and is correct, just larger. */}
              <source src={sources.mp4720} type="video/mp4" media="(max-width: 820px)" />
              <source src={sources.mp4} type="video/mp4" />
              Your browser cannot play this recording. Every step it covers is
              written out below.
            </video>

            {/* Big play affordance, only before first play. After that the
                click-to-toggle on the video itself is enough and an overlay
                would just cover the content. */}
            {!started && (
              <button
                onClick={toggle}
                aria-label={`Play: ${title}`}
                style={{
                  position: "absolute", inset: 0, display: "grid", placeItems: "center",
                  background: "linear-gradient(180deg,rgba(26,5,8,0.12),rgba(26,5,8,0.55))",
                  border: "none", cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 74, height: 74, borderRadius: "50%",
                    display: "grid", placeItems: "center",
                    background: "rgba(245,237,230,0.95)",
                    border: `1px solid ${GOLD}`,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    color: MAROON, paddingLeft: 5,
                  }}
                >
                  <Play size={30} fill={MAROON} strokeWidth={0} />
                </span>
              </button>
            )}
          </div>

          {/* ── Control bar ──────────────────────────────────────────────── */}
          <div style={{ padding: "10px 12px 12px", background: MAROON }}>
            {/* Track. Chapter ticks sit on it so the shape of the video — where
                the long steps are — is visible before you scrub. */}
            <div
              onClick={onTrackClick}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={Math.floor(time)}
              tabIndex={0}
              style={{
                position: "relative", height: 16, display: "flex", alignItems: "center",
                cursor: "pointer", marginBottom: 4,
              }}
            >
              <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 3, background: "rgba(245,237,230,0.18)" }} />
              <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: 4, borderRadius: 3, background: GOLD, transition: "width 120ms linear" }} />
              {video.chapters.map((c) => (
                <span
                  key={c.at}
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: `${(c.at / duration) * 100}%`,
                    width: 2, height: 9, borderRadius: 1,
                    background: "rgba(245,237,230,0.55)",
                    transform: "translateX(-1px)",
                  }}
                />
              ))}
              <span
                aria-hidden
                style={{
                  position: "absolute", left: `${pct}%`, width: 12, height: 12,
                  borderRadius: "50%", background: "#f5ede6", border: `2px solid ${GOLD}`,
                  transform: "translateX(-6px)", transition: "left 120ms linear",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#f5ede6" }}>
              <IconBtn onClick={toggle} label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={16} fill="#f5ede6" strokeWidth={0} /> : <Play size={16} fill="#f5ede6" strokeWidth={0} />}
              </IconBtn>
              <IconBtn onClick={restart} label="Restart"><RotateCcw size={15} /></IconBtn>

              <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", opacity: 0.9, letterSpacing: "0.02em" }}>
                {formatDuration(time)} <span style={{ opacity: 0.5 }}>/ {formatDuration(duration)}</span>
              </span>

              <span
                className="hidden sm:inline"
                style={{
                  fontSize: 11, opacity: 0.82, marginLeft: 4, minWidth: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {video.chapters[activeIndex]?.label}
              </span>

              <span style={{ flex: 1 }} />

              {video.silent && (
                <span
                  className="hidden md:inline"
                  style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
                    textTransform: "uppercase", opacity: 0.6,
                    border: "1px solid rgba(245,237,230,0.25)", borderRadius: 999,
                    padding: "3px 8px",
                  }}
                >
                  Silent
                </span>
              )}
              <IconBtn onClick={() => setRailOpen((v) => !v)} label="Toggle chapters" className="lg:hidden">
                <ListVideo size={15} />
              </IconBtn>
              <IconBtn onClick={fullscreen} label="Fullscreen"><Maximize2 size={15} /></IconBtn>
            </div>
          </div>
        </div>

        {/* ── Chapter rail ──────────────────────────────────────────────── */}
        <aside
          className={railOpen ? "block" : "hidden lg:block"}
          style={{
            borderRadius: 20,
            border: "1px solid rgba(61,12,17,0.14)",
            background: "rgba(255,255,255,0.82)",
            overflow: "hidden",
            alignSelf: "start",
            maxHeight: 480,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(61,12,17,0.10)" }}>
            <p style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: 0 }}>
              Chapters
            </p>
            <p style={{ fontSize: 12, color: "#7a5555", margin: "4px 0 0" }}>
              {video.chapters.length} markers · jump anywhere
            </p>
          </div>

          <div style={{ overflowY: "auto", padding: 6 }}>
            {video.chapters.map((c, i) => {
              const active = i === activeIndex && started;
              const done = started && time > c.at && i < activeIndex;
              return (
                <div
                  key={`${c.at}-${c.label}`}
                  className="group"
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 2,
                    borderRadius: 12, marginBottom: 2,
                    background: active ? "rgba(201,168,76,0.18)" : "transparent",
                    transition: "background 140ms",
                  }}
                >
                  {/* Seeks. Does not scroll — see onReadSection. */}
                  <button
                    onClick={() => seek(c.at)}
                    title={`Play from ${formatDuration(c.at)}`}
                    style={{
                      flex: 1, minWidth: 0, display: "flex", alignItems: "flex-start", gap: 9,
                      textAlign: "left", border: "none", cursor: "pointer",
                      background: "transparent", borderRadius: 12, padding: "8px 9px",
                      color: active ? INK : "#5c3b3b",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10.5, fontVariantNumeric: "tabular-nums", fontWeight: 700,
                        color: active ? MAROON : GOLD, minWidth: 30, paddingTop: 1,
                        display: "inline-flex", alignItems: "center", gap: 3,
                      }}
                    >
                      {done ? <Check size={10} strokeWidth={3} /> : null}
                      {formatDuration(c.at)}
                    </span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.35, fontWeight: active ? 700 : 500 }}>
                      {c.label}
                    </span>
                  </button>

                  {/* Scrolls to the prose. Only on chapters that have one — the
                      intro and outro markers have no written counterpart, and a
                      control that does nothing is worse than no control. */}
                  {c.sectionId && onReadSection && (
                    <button
                      onClick={() => onReadSection(c.sectionId!)}
                      aria-label={`Read the written steps for: ${c.label}`}
                      title="Read this step below"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100"
                      style={{
                        flexShrink: 0, width: 26, height: 26, marginTop: 6, marginRight: 5,
                        display: "grid", placeItems: "center", cursor: "pointer",
                        borderRadius: 8, border: "1px solid rgba(61,12,17,0.16)",
                        background: "rgba(255,255,255,0.9)", color: MAROON,
                        transition: "opacity 140ms",
                      }}
                    >
                      <CornerDownRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function IconBtn({
  onClick, label, children, className,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
        background: "rgba(245,237,230,0.10)", border: "1px solid rgba(245,237,230,0.18)",
        color: "#f5ede6", cursor: "pointer", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
