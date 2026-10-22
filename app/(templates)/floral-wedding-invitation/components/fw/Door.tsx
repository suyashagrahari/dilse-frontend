"use client";

// ─── One palace door leaf (the gates and the closing gates share it) ─────────
// Back to front, all static and clipped to the leaf's arched silhouette (the
// pack's gate-door SVG as a mask): lacquered wood (--fw-door), a carved marble
// jali panel (the museum jali, cropped), rows of brass studs, the pack's gold
// carved line art (inlined so it follows the theme's gold), a brass knocker
// ring. Only the leaf itself ever moves (rotateY, from the parent's CSS).

import { useEffect, useState } from "react";
import { artImg } from "./art";

const svgCache = new Map<string, Promise<string>>();
function loadSvg(id: string): Promise<string> {
  let p = svgCache.get(id);
  if (!p) {
    p = fetch(`/wedding/ornaments/${id}.svg`)
      .then((r) => (r.ok ? r.text() : ""))
      .catch(() => "");
    svgCache.set(id, p);
  }
  return p;
}

export default function Door({ side, lazy }: { side: "left" | "right"; lazy?: boolean }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    void loadSvg(`gate-door-${side}`).then((s) => live && setSvg(s.startsWith("<svg") ? s : ""));
    return () => {
      live = false;
    };
  }, [side]);
  return (
    <div className={`fw-door fw-door-${side}`} aria-hidden>
      <div className="fw-door-leaf">
        <span className="fw-door-wood" />
        <span className="fw-door-jali">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...artImg("museum/jali-marble-arch", { one: true, lazy })} />
        </span>
        <span className="fw-door-studs" />
        <div className="fw-door-face" dangerouslySetInnerHTML={svg ? { __html: svg } : undefined} />
        <span className="fw-door-ring" />
      </div>
    </div>
  );
}
