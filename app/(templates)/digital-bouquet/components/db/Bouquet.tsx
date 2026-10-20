"use client";

// The bouquet itself, drawn exactly as the sender arranged it, from the
// watercolour art pack (./assets.ts). Used by the studio (selection + drag),
// every recipient scene and the previews. Layers, back to front (the pack's
// own order):
//   glow → the wrap's back → greenery → `between` (photos tucked in) → the
//   flower stems (by layer) → the wrap's front → ribbon → charms + gift tag →
//   the tap circles over each bloom → `front`.
// Every stem leans out from the tie point; its bloom lands exactly on the
// stored (x, y). Geometry: 600×760 frame, stems converge on (300, 730).

import { memo, useEffect, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { FLOWER_BY_ID, type DbBow, type DbCharm, type DbGreenery, type DbPaletteDef, type DbRibbon, type DbStem, type DbWrap, type FlowerId } from "../../../_valentine/days/digital-bouquet";
import { CHARM_ART, FRAME, GREEN_ART, RIBBON_ART, RIBBON_FILE, STEM_ART, greensFor, headOf, hitSize, pctX, pctY, placeStem, src1, srcSet, type StemArt } from "./assets";
import { paintOrder } from "./model";
import { wrapBitmap, wrapBitmapNow, wrapSrc } from "./wraps";

export interface BouquetLook {
  stems: readonly DbStem[];
  greenery: DbGreenery;
  wrap: DbWrap;
  ribbon: DbRibbon;
  /** Kept for older pages; the art pack has one bow. */
  bow?: DbBow;
  charms: readonly DbCharm[];
  /** The words on the gift tag ("" hides the tag). */
  tag: string;
}

export interface BouquetProps {
  look: BouquetLook;
  palette: DbPaletteDef;
  /** Play the stem-by-stem bloom when it mounts. */
  bloom?: boolean;
  /** Seconds between two stems blooming. */
  bloomGap?: number;
  /** Delay before the first bloom (s). */
  bloomDelay?: number;
  /** Idle sway. */
  sway?: boolean;
  /** 0–1: watered glow. */
  glow?: number;
  selected?: number | null;
  /** Indices already tapped (a small ✦ on them). */
  visited?: ReadonlySet<number>;
  onHeadPointerDown?: (i: number, e: ReactPointerEvent<HTMLElement>) => void;
  onHeadTap?: (i: number) => void;
  /** Accessible name for a tappable bloom. */
  headLabel?: (i: number) => string;
  between?: ReactNode;
  front?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Still in the paper: the stems sit low, blooms just peeking out (the delivery). */
  buds?: boolean;
  /** Load the 1× art only (small previews). */
  small?: boolean;
}

/** Art that failed once stays hidden everywhere after (no broken-image icon per scene). */
const FAILED = new Set<string>();

/** A pack image; hides itself if it can't load. */
export function ArtImg({ file, alt = "", className, style, small }: { file: string; alt?: string; className?: string; style?: CSSProperties; small?: boolean }) {
  const [failedHere, setFailed] = useState(false);
  const src = src1(file);
  if (failedHere || FAILED.has(src)) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      style={style}
      src={src}
      srcSet={small ? undefined : srcSet(file)}
      alt={alt}
      draggable={false}
      decoding="async"
      onError={() => {
        FAILED.add(src);
        setFailed(true);
      }}
    />
  );
}

/** Just the bloom of a flower, cropped out of its stem art (shelf cards, the meaning card). */
export function FlowerFace({ id, className }: { id: FlowerId; className?: string }) {
  const a = STEM_ART[id];
  // The box is square; the image spans its width, shifted so the head sits in the middle.
  // (A % margin is relative to the box's width, which here is also its height.)
  const shift = (0.5 - (a.head.y * a.h) / a.w) * 100;
  return (
    <span className={`dbq-face ${className ?? ""}`} aria-hidden>
      <ArtImg file={a.file} style={{ marginTop: `${shift}%`, marginLeft: `${(0.5 - a.head.x) * 100}%` }} />
    </span>
  );
}

/** One stem image, positioned so its bloom lands on (hx, hy) (frame px). */
const Stem = memo(function Stem({ art, hx, hy, scale, tilt, delay, swayDur, swayDelay, z, small, idx }: { art: StemArt; hx: number; hy: number; scale: number; tilt: number; delay: number; swayDur: number; swayDelay: number; z: number; small?: boolean; idx?: number }) {
  const p = placeStem(art, hx, hy, scale, tilt);
  const origin = `${art.anchor.x * 100}% ${art.anchor.y * 100}%`;
  return (
    <span
      className="dbq-stem"
      data-dbq-stem={idx}
      style={{
        left: pctX(p.left),
        top: pctY(p.top),
        width: pctX(p.w),
        height: pctY(p.h),
        zIndex: z,
        transformOrigin: origin,
        transform: `rotate(${p.deg}deg)`,
        ["--d" as string]: `${delay}s`,
        ["--o" as string]: origin,
        ["--sw" as string]: `${swayDur}s`,
        ["--sd" as string]: `${swayDelay}s`,
      }}
    >
      <span className="dbq-grow">
        <span className="dbq-sway">
          <ArtImg file={art.file} className="dbq-img" small={small} />
        </span>
      </span>
    </span>
  );
});

/**
 * Live drag preview without React: moves stem `i` (and its tap circle) from
 * where `from` drew it to where `to` would, with one compositor-only transform
 * (translate + rotate + scale about the stem's base). The studio calls it on
 * every animation frame of a gesture and commits the stem once at the end
 * (after `endStemDrag`), so a drag never re-renders the bouquet.
 * `pxPerFrame` = the bouquet's rendered width / 600.
 */
export function dragStemDom(root: HTMLElement, i: number, from: DbStem, to: DbStem, pxPerFrame: number) {
  const el = root.querySelector<HTMLElement>(`[data-dbq-stem="${i}"]`);
  const art = STEM_ART[from.flower as FlowerId];
  if (!el || !art) return;
  const h0 = headOf(from);
  const h1 = headOf(to);
  const p0 = placeStem(art, h0.x, h0.y, from.scale / 100, from.rot);
  const p1 = placeStem(art, h1.x, h1.y, to.scale / 100, to.rot);
  if (!el.classList.contains("is-drag")) el.classList.add("is-drag");
  el.style.transform = `translate3d(${((p1.ax - p0.ax) * pxPerFrame).toFixed(2)}px, ${((p1.ay - p0.ay) * pxPerFrame).toFixed(2)}px, 0) rotate(${p1.deg.toFixed(2)}deg) scale(${(p1.w / p0.w).toFixed(4)})`;
  const hit = root.querySelector<HTMLElement>(`[data-dbq-head="${i}"]`);
  if (hit) {
    const d = hitSize(art, to.scale / 100);
    hit.style.left = pctX(h1.x);
    hit.style.top = pctY(h1.y);
    hit.style.width = pctX(d);
  }
}

/** Undo `dragStemDom` (put back what React rendered) — call right before committing the stem. */
export function endStemDrag(root: HTMLElement, i: number, from: DbStem) {
  const el = root.querySelector<HTMLElement>(`[data-dbq-stem="${i}"]`);
  const art = STEM_ART[from.flower as FlowerId];
  if (!el || !art) return;
  const h = headOf(from);
  el.classList.remove("is-drag");
  el.style.transform = `rotate(${placeStem(art, h.x, h.y, from.scale / 100, from.rot).deg}deg)`;
  const hit = root.querySelector<HTMLElement>(`[data-dbq-head="${i}"]`);
  if (hit) {
    hit.style.left = pctX(h.x);
    hit.style.top = pctY(h.y);
    hit.style.width = pctX(hitSize(art, from.scale / 100));
  }
}

/** The wrap image: the vector drawn once into a bitmap (no SVG re-raster on resize / scale). */
function WrapImg({ kind, part, className }: { kind: BouquetLook["wrap"]; part: "back" | "front"; className: string }) {
  // Re-render once the bitmap is ready; until then the vector paints.
  const [, setReady] = useState(0);
  useEffect(() => {
    let live = true;
    if (!wrapBitmapNow(kind, part)) void wrapBitmap(kind, part).then((u) => live && u && setReady((n) => n + 1));
    return () => {
      live = false;
    };
  }, [kind, part]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={wrapBitmapNow(kind, part) ?? wrapSrc(kind, part)} className={className} alt="" draggable={false} decoding="async" />;
}

function BouquetImpl(p: BouquetProps) {
  const { look, palette, bloom = false, bloomGap = 0.32, bloomDelay = 0.3, sway = true, glow = 0, selected = null, visited, onHeadPointerDown, onHeadTap, headLabel, between, front, className = "", style, buds, small } = p;
  const order = paintOrder(look.stems);
  // Bloom order: the back of the bouquet first, the front last (like a florist builds it).
  const bloomAt = new Map<number, number>();
  order.forEach((idx, k) => bloomAt.set(idx, k));
  const greens = greensFor(look.greenery);
  const n = look.stems.length;
  const done = bloomDelay + n * bloomGap;
  const interactive = !!onHeadTap || !!onHeadPointerDown;
  const rib = RIBBON_FILE[look.ribbon] ?? RIBBON_FILE.rose;
  const charmAt: Record<DbCharm, { x: number; y: number }> = { heart: FRAME.charm, teddy: { x: 266, y: 606 }, butterfly: { x: 356, y: 600 } };

  return (
    <div
      className={`dbq${buds ? " is-buds" : ""}${bloom ? " is-bloom" : ""}${sway ? " is-sway" : ""}${glow > 0 ? " is-glow" : ""} ${className}`}
      style={{ ...style, ["--dbq-glow" as string]: String(glow), ["--dbq-done" as string]: `${done}s`, ["--dbq-accent" as string]: palette.theme.accent }}
      data-dbq
    >
      <span className="dbq-halo" aria-hidden />
      <WrapImg kind={look.wrap} part="back" className="dbq-full" />

      <div className="dbq-layer" aria-hidden>
        {greens.map((g, k) => (
          <Stem key={`g${k}`} art={GREEN_ART[g.id]} hx={g.x} hy={g.y} scale={g.scale} tilt={0} delay={bloomDelay * 0.4 + k * 0.05} swayDur={5 + (k % 3) * 0.7} swayDelay={-k * 0.9} z={1} small={small} />
        ))}
      </div>

      {between && <div className="dbq-between">{between}</div>}

      <div className="dbq-layer dbq-flowers" aria-hidden>
        {order.map((i) => {
          const s = look.stems[i];
          const h = headOf(s);
          return (
            <Stem
              key={i}
              art={STEM_ART[s.flower as FlowerId]}
              hx={h.x}
              hy={h.y}
              scale={s.scale / 100}
              tilt={s.rot}
              delay={bloomDelay + (bloomAt.get(i) ?? 0) * bloomGap}
              swayDur={3.8 + (i % 5) * 0.55}
              swayDelay={-(i * 0.7)}
              z={2 + s.z}
              small={small}
              idx={i}
            />
          );
        })}
      </div>

      <WrapImg kind={look.wrap} part="front" className="dbq-full dbq-front" />
      <span
        className="dbq-ribbon"
        aria-hidden
        style={{
          left: pctX(FRAME.knot.x - RIBBON_ART.anchor.x * RIBBON_ART.w),
          top: pctY(FRAME.knot.y - RIBBON_ART.anchor.y * RIBBON_ART.h),
          width: pctX(RIBBON_ART.w),
          filter: rib.filter,
        }}
      >
        <ArtImg file={rib.file} small={small} />
      </span>
      {look.charms.map((c) => {
        const a = CHARM_ART[c];
        const at = charmAt[c];
        return (
          <span key={c} className={`dbq-charm is-${c}`} aria-hidden style={{ left: pctX(at.x - (a.w * a.scale) / 2), top: pctY(at.y), width: pctX(a.w * a.scale) }}>
            <ArtImg file={a.file} small={small} />
          </span>
        );
      })}
      {look.tag && (
        <span className="dbq-tag" style={{ left: pctX(392), top: pctY(606) }}>
          <span className="dbq-tagString" aria-hidden />
          <span className="dbq-tagCard">{look.tag}</span>
        </span>
      )}

      {/* The tap circles: one per bloom, in paint order, above everything. */}
      <div className="dbq-hits">
        {order.map((i) => {
          const s = look.stems[i];
          const h = headOf(s);
          const d = hitSize(STEM_ART[s.flower as FlowerId], s.scale / 100);
          const f = FLOWER_BY_ID[s.flower as FlowerId];
          const hs: CSSProperties = { left: pctX(h.x), top: pctY(h.y), width: pctX(d), zIndex: 1 + s.z };
          if (!interactive)
            return visited?.has(i) ? (
              <span key={i} className="dbq-hit" style={hs} aria-hidden>
                <span className="dbq-seen">✦</span>
              </span>
            ) : null;
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              aria-label={headLabel ? headLabel(i) : f.name}
              aria-pressed={selected === i ? true : undefined}
              className={`dbq-hit is-live${selected === i ? " is-sel" : ""}`}
              style={hs}
              data-dbq-head={i}
              onPointerDown={onHeadPointerDown ? (e) => onHeadPointerDown(i, e) : undefined}
              onClick={onHeadTap ? () => onHeadTap(i) : undefined}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && onHeadTap) {
                  e.preventDefault();
                  onHeadTap(i);
                }
              }}
            >
              {visited?.has(i) && <span className="dbq-seen">✦</span>}
            </span>
          );
        })}
      </div>
      {front}
    </div>
  );
}

export const Bouquet = memo(BouquetImpl);

export const BOUQUET_CSS = `
.dbq { position: relative; width: 100%; aspect-ratio: 600 / 760; container-type: inline-size; contain: layout style; clip-path: inset(-30% -30% 0 -30%); user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.dbq img { display: block; pointer-events: none; }
.dbq-full { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.dbq-front { z-index: 3; filter: drop-shadow(0 -2px 6px rgba(70, 30, 30, .12)); }
.dbq-layer, .dbq-between, .dbq-hits { position: absolute; inset: 0; pointer-events: none; }
.dbq-flowers { z-index: 2; }
.dbq-between { z-index: 1; }
.dbq-halo { position: absolute; left: 50%; top: 30%; width: 104%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, #FFFFFF 0%, color-mix(in srgb, var(--dbq-accent, #D94A75) 12%, transparent) 45%, transparent 70%); opacity: .6; transition: opacity .8s ease, transform .8s ease; }
.dbq.is-glow .dbq-halo { opacity: calc(.6 + var(--dbq-glow) * .4); transform: translate(-50%, -50%) scale(calc(1 + var(--dbq-glow) * .12));
  background: radial-gradient(circle, #FFFFFF 0%, color-mix(in srgb, #FFE9A8 60%, transparent) 30%, color-mix(in srgb, var(--dbq-accent, #D94A75) 18%, transparent) 52%, transparent 72%); }
.dbq-stem { position: absolute; display: block; }
/* Mid-drag: its own GPU layer, transform-only updates, no sway. */
.dbq-stem.is-drag { will-change: transform; }
.dbq-stem.is-drag .dbq-sway, .dbq-stem.is-drag .dbq-grow { animation: none !important; }
.dbq-face { position: relative; display: block; overflow: hidden; aspect-ratio: 1; }
.dbq-face img { position: absolute; left: 0; top: 0; width: 100%; height: auto; display: block; pointer-events: none; }
.dbq-grow, .dbq-sway { display: block; width: 100%; height: 100%; transform-origin: var(--o); }
.dbq-img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 5px rgba(60, 20, 40, .14)); transition: filter .6s ease; }
.dbq.is-glow .dbq-img { filter: drop-shadow(0 4px 5px rgba(60, 20, 40, .12)) saturate(calc(1 + var(--dbq-glow) * .25)) brightness(calc(1 + var(--dbq-glow) * .05)); }
.dbq.is-sway .dbq-sway { animation: dbq-sway var(--sw) ease-in-out var(--sd) infinite alternate; }
@keyframes dbq-sway { from { transform: rotate(-1.6deg); } to { transform: rotate(1.6deg); } }
.dbq-ribbon { position: absolute; z-index: 4; display: block; }
.dbq-ribbon img { width: 100%; height: auto; filter: drop-shadow(0 4px 6px rgba(80, 20, 30, .22)); }
.dbq-charm { position: absolute; z-index: 5; display: block; transform-origin: 50% 0; animation: dbq-dangle 3.2s ease-in-out infinite alternate; }
.dbq-charm img { width: 100%; height: auto; filter: drop-shadow(0 5px 6px rgba(60, 20, 40, .22)); }
.dbq-charm.is-teddy { animation-delay: -1.1s; }
.dbq-charm.is-butterfly { animation-delay: -2s; }
@keyframes dbq-dangle { from { transform: rotate(-5deg); } to { transform: rotate(6deg); } }
.dbq-tag { position: absolute; z-index: 6; transform-origin: 0 0; animation: dbq-dangle 3.6s ease-in-out -0.6s infinite alternate; pointer-events: none; }
.dbq-tagString { position: absolute; left: 0; top: 0; width: 1.5px; height: 4.6cqw; background: #8C6B4A; transform: rotate(-24deg); transform-origin: 0 0; }
.dbq-tagCard { position: absolute; left: 1.4cqw; top: 3.8cqw; display: block; width: max-content; max-width: 30cqw; padding: 1.4cqw 2.4cqw 1.4cqw 3.6cqw; border-radius: 1cqw 3cqw 3cqw 1cqw;
  background: linear-gradient(160deg, #F7E7CF, #E9CFA8); color: #4A3222; font: 600 clamp(9px, 3.6cqw, 18px)/1.12 var(--db-hand, cursive); box-shadow: 0 4px 10px -4px rgba(70,40,20,.45);
  transform: rotate(-8deg); overflow-wrap: anywhere; text-align: left; }
.dbq-tagCard::before { content: ""; position: absolute; left: 1.3cqw; top: 50%; width: 1.2cqw; height: 1.2cqw; margin-top: -.6cqw; border-radius: 50%; background: rgba(255,255,255,.9); box-shadow: inset 0 0 0 1px rgba(120,80,40,.4); }
.dbq-hits { z-index: 7; }
.dbq-hit { position: absolute; display: block; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%); }
.dbq-hit.is-live { pointer-events: auto; cursor: grab; touch-action: none; -webkit-tap-highlight-color: transparent; outline: none; }
.dbq-hit.is-live:focus-visible { box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 5px var(--dbq-accent, #D94A75); }
.dbq-hit.is-sel { cursor: grabbing; }
.dbq-hit.is-sel::before { content: ""; position: absolute; inset: -4%; border-radius: 50%; border: 2.5px dashed var(--dbq-accent, #D94A75); box-shadow: 0 0 0 4px rgba(255,255,255,.65); animation: dbq-spin 9s linear infinite; }
@keyframes dbq-spin { to { transform: rotate(360deg); } }
.dbq-seen { position: absolute; right: 8%; top: 4%; font-size: clamp(11px, 3.6cqw, 20px); color: #FFFFFF; text-shadow: 0 0 6px var(--dbq-accent, #D94A75), 0 0 2px #8E1C35; }

/* Still in the paper: stems sit low, blooms peek out over the wrap. */
.dbq.is-buds .dbq-grow { transform: scale(.8); }
.dbq.is-buds .dbq-img { filter: saturate(.82) drop-shadow(0 4px 5px rgba(60, 20, 40, .14)); }
/* The bloom: stems rise out of the paper and open, back row first. */
.dbq.is-bloom .dbq-flowers .dbq-grow { transform: scale(.66); opacity: .6; animation: dbq-rise 1.1s cubic-bezier(.2,1.25,.4,1) var(--d) forwards; }
@keyframes dbq-rise { 0% { transform: scale(.66); opacity: .6; } 35% { opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
.dbq.is-bloom .dbq-tag, .dbq.is-bloom .dbq-charm { opacity: 0; animation: dbq-fade .6s ease var(--dbq-done) forwards, dbq-dangle 3.4s ease-in-out calc(var(--dbq-done) + .6s) infinite alternate; }
@keyframes dbq-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .dbq .dbq-sway, .dbq-tag, .dbq-charm, .dbq-hit.is-sel::before { animation: none !important; }
  .dbq.is-bloom .dbq-flowers .dbq-grow, .dbq.is-bloom .dbq-tag, .dbq.is-bloom .dbq-charm { animation: dbq-fade .4s ease forwards !important; transform: none; opacity: 1; }
}
`;
