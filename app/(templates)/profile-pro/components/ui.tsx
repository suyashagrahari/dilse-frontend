"use client";

// ─── Endorsements — small shared pieces ──────────────────────────────────────

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cropStyle, clampCrop } from "../../dedication/components/types";
import { Avatar } from "./Avatar";

export const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Framed photo: fills its box, honouring the crop the sender set in the editor. */
export function Pic({
  url,
  x = 50,
  y = 50,
  scale = 100,
  alt = "",
  className,
  style,
}: {
  url?: string;
  x?: number;
  y?: number;
  scale?: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const ok = url && url !== failed;
  return (
    <span className={`pf-pic ${className ?? ""}`} style={style}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} draggable={false} onError={() => setFailed(url ?? null)} style={cropStyle(clampCrop({ x, y, scale }))} />
      ) : null}
    </span>
  );
}

/** A person: their photo if we have one, else seeded initials. */
export function Face({ name, src, x, y, scale, size }: { name: string; src?: string; x?: number; y?: number; scale?: number; size: number }) {
  if (src) {
    return <Pic url={src} x={x} y={y} scale={scale} alt={name} className="pf-face" style={{ width: size, height: size }} />;
  }
  return <Avatar name={name} size={size} />;
}

/** Overlapping faces, the "Karan, Sneha and 45 others" row. */
export function FaceStack({ names, size = 20, you }: { names: string[]; size?: number; you?: boolean }) {
  const shown = names.slice(0, 3);
  return (
    <span className="pf-stack" aria-hidden>
      {you && (
        <span className="pf-stackI pf-stackYou" style={{ width: size, height: size, fontSize: size * 0.42 }}>
          You
        </span>
      )}
      {shown.map((n, i) => (
        <span key={`${n}-${i}`} className="pf-stackI">
          <Avatar name={n} size={size} />
        </span>
      ))}
    </span>
  );
}

/** Text clamped to `lines`, with the genre's inline "…see more". */
export function SeeMore({ text, lines = 3, className, more = "…see more" }: { text: string; lines?: number; className?: string; more?: string }) {
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  useIso(() => {
    const el = ref.current;
    if (!el || open) return;
    setClamped(el.scrollHeight > el.clientHeight + 2);
  }, [text, lines, open]);
  return (
    <div className={`pf-more ${className ?? ""}`}>
      <p ref={ref} className="pf-moreTx" style={open ? undefined : ({ WebkitLineClamp: lines } as CSSProperties)} data-open={open || undefined}>
        {text}
      </p>
      {clamped && !open && (
        <button type="button" className="pf-moreBtn" onClick={() => setOpen(true)}>
          {more}
        </button>
      )}
    </div>
  );
}

export function Section({ title, sub, actions, children, id, className, footer }: { title?: ReactNode; sub?: ReactNode; actions?: ReactNode; children: ReactNode; id?: string; className?: string; footer?: ReactNode }) {
  return (
    <section className={`pf-card ${className ?? ""}`} id={id} aria-label={typeof title === "string" ? title : undefined}>
      {(title || actions) && (
        <header className="pf-cardH">
          <div className="pf-cardHT">
            {title && <h2 className="pf-h2">{title}</h2>}
            {sub && <div className="pf-cardSub">{sub}</div>}
          </div>
          {actions && <div className="pf-cardAct">{actions}</div>}
        </header>
      )}
      {children}
      {footer}
    </section>
  );
}

export function ShowAll({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button type="button" className="pf-showAll" onClick={onClick}>
      <span>{label}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="currentColor"><path d="M11.45 3L15 8l-3.55 5H9l2.84-4H2V7h9.84L9 3z" /></svg>
    </button>
  );
}

/** A company / school tile. There is no real logo, so we draw a warm monogram. */
const TILE_BG = [
  ["#FDE7EF", "#E0457B"],
  ["#E6F0FB", "#0A66C2"],
  ["#EAF5EA", "#3E8E41"],
  ["#FFF1DC", "#B7730D"],
  ["#F0EAFB", "#7A52C7"],
];
function hash(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
export function Tile({ name, size = 48, kind = "company" }: { name: string; size?: number; kind?: "company" | "school" | "cert" | "lang" }) {
  const [bg, fg] = TILE_BG[hash(name || kind) % TILE_BG.length];
  const initial = (name.trim()[0] ?? "♥").toUpperCase();
  return (
    <span className="pf-tile" style={{ width: size, height: size, background: bg, color: fg }} aria-hidden>
      {kind === "school" ? (
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.9V17h2V9zM5 13.2v3.6L12 21l7-4.2v-3.6L12 17z" /></svg>
      ) : kind === "cert" ? (
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 0 0-3.6 10.8L7 22l5-2.5 5 2.5-1.4-9.2A6 6 0 0 0 12 2zm0 9.2l-2.2 1.2.4-2.5-1.8-1.7 2.5-.4L12 5.6l1.1 2.2 2.5.4-1.8 1.7.4 2.5z" /></svg>
      ) : (
        <span style={{ position: "relative", fontSize: size * 0.42, fontWeight: 700, lineHeight: 1 }}>
          {initial}
          <svg width={size * 0.26} height={size * 0.26} viewBox="0 0 24 24" fill="currentColor" style={{ position: "absolute", right: -size * 0.2, top: -size * 0.1 }}><path d="M12 21.3C5.6 16.7 2 13.3 2 8.9A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 10 2.3c0 4.4-3.6 7.8-10 12.4z" /></svg>
        </span>
      )}
    </span>
  );
}

/** Media query as state; false on the server and first client render. */
export function useMedia(q: string): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => setOn(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [q]);
  return on;
}
