"use client";

// ─── Small building blocks shared by every section ──────────────────────────

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cropStyle, photoCrop } from "../../../dedication/components/types";
import { ChevronLeft, ChevronRight, HeartIcon } from "../icons";

export type GetState = "idle" | "wait" | "load" | "done";

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ── A framed photo with a skeleton until it loads ─────────────────────────── */

export function Framed({
  src,
  cropX,
  cropY,
  scale,
  alt = "",
  eager = false,
}: {
  src: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
  alt?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // A cached image can finish before hydration, and then onLoad never fires.
  useIsoLayout(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);

  if (!src || failed) return null;
  return (
    <>
      <span className={`al-skel${loaded ? " is-done" : ""}`} aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={cropStyle(photoCrop({ url: src, cropX, cropY, scale }))}
      />
    </>
  );
}

/* ── The icon: her photo in a squircle, or a monogram ─────────────────────── */

export function AppIcon({
  src,
  name,
  cropX,
  cropY,
  scale,
  className = "",
  onClick,
  size,
  eager,
}: {
  src: string;
  name: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
  className?: string;
  onClick?: () => void;
  size?: number;
  eager?: boolean;
}) {
  const initial = (name.trim()[0] ?? "♥").toUpperCase();
  const style: CSSProperties | undefined = size ? { width: size, height: size } : undefined;
  const inner = (
    <>
      <span className="al-icon-fallback" style={{ fontSize: size ? size * 0.46 : "3.4em" }} aria-hidden="true">
        {initial}
      </span>
      {src ? <Framed src={src} cropX={cropX} cropY={cropY} scale={scale} eager={eager} /> : null}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={`al-icon ${className}`} style={style} onClick={onClick} aria-label={`${name} app icon`}>
        {inner}
      </button>
    );
  }
  return (
    <span className={`al-icon ${className}`} style={style} role="img" aria-label={`${name} app icon`}>
      {inner}
    </span>
  );
}

/* ── GET → spinner → progress ring → OPEN ─────────────────────────────────── */

export function GetButton({
  state,
  onClick,
  small = false,
  soft = false,
  label,
  className = "",
}: {
  state: GetState;
  onClick: () => void;
  small?: boolean;
  soft?: boolean;
  label?: string;
  className?: string;
}) {
  const text = label ?? (state === "done" ? "OPEN" : "GET");
  const aria =
    state === "wait" ? "Waiting" : state === "load" ? "Installing" : state === "done" ? "Open" : "Get";
  return (
    <button
      type="button"
      className={`al-get${small ? " al-get-sm" : ""}${soft || state === "done" ? " is-soft" : ""} ${className}`}
      data-s={state}
      onClick={onClick}
      aria-label={aria}
      aria-busy={state === "wait" || state === "load"}
    >
      <span className="al-get-label">{text}</span>
      <svg className="al-get-ring" viewBox="0 0 30 30" aria-hidden="true">
        <circle cx="15" cy="15" r="13" fill="none" stroke="#D1D1D6" strokeWidth="2.4" />
        <circle
          className="al-ring-spin"
          cx="15"
          cy="15"
          r="13"
          fill="none"
          stroke="#8A8A8E"
          strokeWidth="2.4"
          strokeDasharray="22 60"
          strokeLinecap="round"
        />
        <circle className="al-ring-prog" cx="15" cy="15" r="13" fill="none" stroke="var(--al-accent)" strokeWidth="2.6" />
        <rect className="al-ring-stop" x="11" y="11" width="8" height="8" rx="1.6" fill="var(--al-accent)" />
      </svg>
    </button>
  );
}

/* ── Horizontal rail with desktop arrows ──────────────────────────────────── */

export function Rail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: true, r: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ l: el.scrollLeft < 4, r: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="al-rail-wrap">
      <button type="button" className="al-arrow l" onClick={() => page(-1)} disabled={edge.l} aria-label={`Previous ${label}`}>
        <ChevronLeft size={18} />
      </button>
      <div ref={ref} className="al-rail" onScroll={measure} role="list" aria-label={label}>
        {children}
      </div>
      <button type="button" className="al-arrow r" onClick={() => page(1)} disabled={edge.r} aria-label={`Next ${label}`}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ── Clamped text with a "more" link that only appears when it overflows ─── */

export function Clamp({
  lines,
  children,
  onMore,
  className = "al-body",
}: {
  lines: number;
  children: ReactNode;
  /** When given, "more" calls this instead of expanding in place. */
  onMore?: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(check) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [children]);

  return (
    <div className={`al-clamp ${className}`}>
      <div ref={ref} className="al-clamp-text" style={open ? undefined : { WebkitLineClamp: lines }}>
        {children}
      </div>
      {!open && overflows ? (
        <button
          type="button"
          className="al-more"
          onClick={(e) => {
            e.stopPropagation();
            if (onMore) onMore();
            else setOpen(true);
          }}
        >
          more
        </button>
      ) : null}
    </div>
  );
}

/* ── Toast shaped like a pill dropping from the top ───────────────────────── */

export function Toast({ text }: { text: string }) {
  return (
    <div className="al-toast" role="status" aria-live="polite">
      <span className="al-toast-ic" aria-hidden="true">
        <HeartIcon size={15} color="#fff" filled />
      </span>
      <span>{text}</span>
    </div>
  );
}

/* ── Heart bursts ─────────────────────────────────────────────────────────── */

export interface Burst {
  id: number;
  x: number;
  y: number;
  n: number;
}

const HEARTS = ["♥", "♥", "💗", "♥", "💕", "♥"];

export function Bursts({ bursts }: { bursts: Burst[] }) {
  return (
    <>
      {bursts.map((b) => (
        <div key={b.id} className="al-burst" style={{ left: b.x, top: b.y }} aria-hidden="true">
          {Array.from({ length: b.n }, (_, i) => {
            // Deterministic spread per index, so nothing depends on Math.random at render.
            const a = (i / b.n) * Math.PI * 2 + (b.id % 7) * 0.4;
            const dist = 60 + ((i * 37 + b.id) % 50);
            const style = {
              "--dx": `${Math.cos(a) * dist}px`,
              "--dy": `${Math.sin(a) * dist - 40}px`,
              "--r": `${((i * 53) % 60) - 30}deg`,
              "--s": `${0.9 + ((i * 17) % 10) / 12}`,
              animationDelay: `${(i % 4) * 30}ms`,
            } as CSSProperties;
            return (
              <span key={i} style={style}>
                {HEARTS[i % HEARTS.length]}
              </span>
            );
          })}
        </div>
      ))}
    </>
  );
}

/** Light haptic tick where the platform supports it. */
export function haptic(pattern: number | number[] = 8) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}
