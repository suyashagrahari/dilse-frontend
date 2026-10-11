"use client";

// An animated GIF/WebP that is requested only after the page has loaded and the
// browser is idle. The box is sized up front (width/height/className), so the
// image arriving later never moves anything; it fades in once decoded.

import { useEffect, useState, type CSSProperties } from "react";

let idle = false;
const waiting = new Set<() => void>();

function whenIdle(cb: () => void): () => void {
  if (idle) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  if (waiting.size === 1) {
    const fire = () => {
      const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 800));
      ric(() => {
        idle = true;
        waiting.forEach((f) => f());
        waiting.clear();
      }, { timeout: 4000 });
    };
    if (document.readyState === "complete") fire();
    else window.addEventListener("load", fire, { once: true });
  }
  return () => {
    waiting.delete(cb);
  };
}

export default function IdleGif({
  src, width, height, className, style, alt = "",
}: { src: string; width: number; height: number; className?: string; style?: CSSProperties; alt?: string }) {
  const [go, setGo] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => whenIdle(() => setGo(true)), []);
  return (
    <span className={className} style={{ display: "block", ...style }} aria-hidden={alt ? undefined : true}>
      {go && (
        // eslint-disable-next-line @next/next/no-img-element -- animated; next/image would freeze it
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          decoding="async"
          draggable={false}
          onLoad={() => setShown(true)}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", opacity: shown ? 1 : 0, transition: "opacity .5s ease" }}
        />
      )}
    </span>
  );
}
