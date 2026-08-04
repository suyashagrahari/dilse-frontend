"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Plays one Court of Love animation. Renders a `<video>` for .mp4 sources and an
 * `<img>` for GIFs so the manifest can mix the two freely — the verdict clip is
 * an MP4 because GIF cannot compress 13.5 s of line-art text.
 *
 * Only the mounted animation is ever fetched (each screen mounts exactly one), and
 * `preload` lets a screen warm the *next* asset while the user is still reading
 * the current one, so transitions feel instant without loading all 13 up front.
 */
export default function CourtGif({
  src,
  alt,
  size = 220,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  /** Rendered box width in px; height follows the asset's aspect ratio. */
  size?: number;
  /** Skip lazy-loading for the animation that is visible on first paint. */
  priority?: boolean;
  className?: string;
}) {
  const isVideo = src.endsWith(".mp4");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  // iOS Safari occasionally ignores the autoplay attribute when the element is
  // mounted inside an animating parent; nudging play() once on mount fixes it.
  // The promise rejects harmlessly if the browser refuses.
  useEffect(() => {
    if (!isVideo) return;
    videoRef.current?.play().catch(() => {});
  }, [isVideo, src]);

  if (failed) {
    // A missing animation must never blank out the screen mid-trial.
    return (
      <div
        aria-hidden="true"
        style={{ width: size, height: size * 0.9 }}
        className={`grid place-items-center rounded-[20px] text-4xl ${className}`}
      >
        ⚖️
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={src}
        aria-label={alt}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        onError={() => setFailed(true)}
        // `margin: 0 auto` because Tailwind's preflight makes img/video
        // `display: block`, so a parent's `text-align: center` would not centre it.
        style={{ width: size, maxWidth: "100%", height: "auto", margin: "0 auto" }}
        className={`select-none pointer-events-none ${className}`}
      />
    );
  }

  return (
    // An animated GIF: next/image would need `unoptimized` anyway, and the frames
    // must not be re-encoded or the animation is flattened.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      // See the video branch: preflight's `display: block` defeats text-align.
      style={{ width: size, maxWidth: "100%", height: "auto", margin: "0 auto" }}
      className={`select-none pointer-events-none ${className}`}
    />
  );
}

/**
 * Warm one asset in the background so the next screen paints without a flash.
 * Uses an Image/link prefetch rather than mounting the element, so nothing is
 * added to the layout.
 */
export function preloadAsset(src: string) {
  if (typeof window === "undefined" || !src) return;
  if (src.endsWith(".mp4")) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "video";
    link.href = src;
    document.head.appendChild(link);
    return;
  }
  const img = new window.Image();
  img.src = src;
}
