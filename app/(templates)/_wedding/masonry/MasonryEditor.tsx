"use client";
// ─── <MasonryEditor> — the sender's gallery studio ──────────────────────────
//
//   <MasonryEditor photos={mf.photos} onChange={(p) => updateMf("photos", p)} max={20} />
//
// What the sender sees IS the guest's masonry (same component, same layout),
// with editing on top:
//   • Add photos (picker or drop): compressed on the phone (compressImage →
//     data URL, ≤1400px) and measured (w/h). They upload on publish through
//     the engine's existing pipeline (server sanitizeLovePhotos → S3 → CDN).
//   • Drag the ⠿ handle to reorder (touch + mouse; tiles glide live; the
//     page auto-scrolls near the edges). Keyboard: focus the handle, ← →.
//   • Tap a photo to select it → size (Normal / Wide / Tall / Large), focal
//     point (tap or drag on the photo; live crop preview), zoom, caption,
//     move, replace, remove (with undo).

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type DragEvent as RDragEvent, type PointerEvent as RPointerEvent } from "react";
import { compressImage } from "../../dedication/components/mediaUploads";
import { MAX_CAPTION_LEN } from "../../_love/types";
import type { PhotoSpan, WeddingPhoto } from "../types";
import WeddingMasonry, { photoImgStyle, type MasonryMask } from "./WeddingMasonry";
import { MAX_SINGLE_RATIO, MAX_WIDE_RATIO, TALL_FACTOR, clampAspect, spanCols, spanTall, type MasonryLayout } from "./layout";
import { WeddingKitStyles } from "../WeddingRoot";

export interface MasonryEditorProps {
  photos: readonly WeddingPhoto[];
  onChange: (next: WeddingPhoto[]) => void;
  /** Tier ceiling (6 / 20 / 40). */
  max: number;
  /** Match the guest page's tile shape. Default "rounded". */
  mask?: MasonryMask;
  /** Heading / hint above the grid. */
  title?: string;
  hint?: string;
  /** Upsell line shown when the sender hits `max` (lower tiers). */
  upsell?: string;
  className?: string;
  style?: CSSProperties;
}

const SPANS: { v: PhotoSpan; label: string; icon: string }[] = [
  { v: "normal", label: "Normal", icon: "M5 5h6v14H5z" },
  { v: "wide", label: "Wide", icon: "M3 7h18v10H3z" },
  { v: "tall", label: "Tall", icon: "M8 2h8v20H8z" },
  { v: "large", label: "Large", icon: "M3 3h18v18H3z" },
];

/** Natural size of an image URL (data URLs decode locally). */
function measure(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((ok) => {
    const im = new Image();
    im.onload = () => ok(im.naturalWidth && im.naturalHeight ? { w: im.naturalWidth, h: im.naturalHeight } : null);
    im.onerror = () => ok(null);
    im.src = url;
  });
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

export default function MasonryEditor({ photos, onChange, max, mask = "rounded", title = "Your gallery", hint, upsell, className, style }: MasonryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<MasonryLayout | null>(null);
  const latest = useRef(photos);
  useLayoutEffect(() => {
    latest.current = photos;
  });

  const [sel, setSel] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [dropping, setDropping] = useState(false);
  const [drag, setDrag] = useState<{ index: number; x: number; y: number } | null>(null);
  const [undo, setUndo] = useState<{ photo: WeddingPhoto; index: number } | null>(null);
  const dragRef = useRef<{ index: number; grabX: number; grabY: number; pointerId: number } | null>(null);

  const commit = useCallback((next: WeddingPhoto[]) => onChange(next), [onChange]);
  const patch = (i: number, p: Partial<WeddingPhoto>) => commit(latest.current.map((ph, k) => (k === i ? { ...ph, ...p } : ph)));
  const moveTo = (from: number, to: number) => {
    const list = [...latest.current];
    if (from === to || to < 0 || to >= list.length) return;
    const [it] = list.splice(from, 1);
    list.splice(to, 0, it);
    commit(list);
  };

  // ── Adding ──────────────────────────────────────────────────────────────
  const add = async (files: FileList | File[] | null) => {
    const arr = Array.from(files ?? []).filter((f) => !f.type || f.type.startsWith("image/"));
    if (!arr.length) return;
    setError("");
    const room = max - latest.current.length;
    const picked = arr.slice(0, Math.max(0, room));
    if (!picked.length) {
      setError(`This invitation shows up to ${max} photos.`);
      return;
    }
    setProgress({ done: 0, total: picked.length });
    const added: WeddingPhoto[] = [];
    for (const [k, f] of picked.entries()) {
      try {
        const url = await compressImage(f);
        const dim = await measure(url);
        added.push({ url, cropX: 50, cropY: 50, ...(dim ? { w: dim.w, h: dim.h } : {}) });
      } catch (e) {
        setError(e instanceof Error ? e.message : "That photo couldn't be read — try a JPG or PNG.");
      }
      setProgress({ done: k + 1, total: picked.length });
    }
    setProgress(null);
    if (arr.length > picked.length) setError(`Only ${max} photos fit — the rest were skipped.`);
    if (added.length) commit([...latest.current, ...added]);
  };

  const replace = async (files: FileList | null) => {
    const i = sel;
    const f = files?.[0];
    if (i === null || !f) return;
    setProgress({ done: 0, total: 1 });
    try {
      const url = await compressImage(f);
      const dim = await measure(url);
      patch(i, { url, cropX: 50, cropY: 50, scale: undefined, ...(dim ? { w: dim.w, h: dim.h } : { w: undefined, h: undefined }) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo couldn't be read");
    }
    setProgress(null);
  };

  const remove = (i: number) => {
    const p = latest.current[i];
    if (!p) return;
    setUndo({ photo: p, index: i });
    commit(latest.current.filter((_, k) => k !== i));
    setSel(null);
  };
  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => setUndo(null), 6000);
    return () => window.clearTimeout(t);
  }, [undo]);

  // ── Drag to reorder ─────────────────────────────────────────────────────
  const toLocal = (cx: number, cy: number) => {
    const r = gridRef.current?.getBoundingClientRect();
    return r ? { x: cx - r.left, y: cy - r.top } : { x: cx, y: cy };
  };

  const startDrag = (e: RPointerEvent<HTMLElement>, index: number) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const t = layoutRef.current?.tiles[index];
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = toLocal(e.clientX, e.clientY);
    dragRef.current = { index, grabX: p.x - t.x, grabY: p.y - t.y, pointerId: e.pointerId };
    setDrag({ index, x: t.x, y: t.y });
    setSel(null);
    navigator.vibrate?.(8);
    // Follow the finger anywhere on the page (it may leave the grid while auto-scrolling).
    const move = (ev: PointerEvent) => moveDrag(ev);
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      endDrag(ev);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const moveDrag = (e: PointerEvent) => {
    const d = dragRef.current;
    const lay = layoutRef.current;
    if (!d || !lay || e.pointerId !== d.pointerId) return;
    const p = toLocal(e.clientX, e.clientY);
    const x = p.x - d.grabX;
    const y = p.y - d.grabY;
    const me = lay.tiles[d.index];
    // Nearest slot centre to the dragged tile's centre.
    const cx = x + (me?.w ?? 0) / 2;
    const cy = y + (me?.h ?? 0) / 2;
    let best = d.index;
    let bestD = Infinity;
    lay.tiles.forEach((t, k) => {
      const dd = Math.hypot(t.x + t.w / 2 - cx, t.y + t.h / 2 - cy);
      if (dd < bestD) {
        bestD = dd;
        best = k;
      }
    });
    if (best !== d.index) {
      moveTo(d.index, best);
      d.index = best;
    }
    setDrag({ index: d.index, x, y });
    // Auto-scroll near the viewport edges.
    const edge = 72;
    if (e.clientY < edge) window.scrollBy(0, -Math.ceil((edge - e.clientY) / 4));
    else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, Math.ceil((e.clientY - (window.innerHeight - edge)) / 4));
  };

  const endDrag = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    setDrag(null);
  };

  const onHandleKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    moveTo(i, i + d);
    // Keep focus on the moved photo's handle.
    window.requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>(`[data-index="${i + d}"] .wk-ed-handle`)?.focus());
  };

  // ── Selection panel ─────────────────────────────────────────────────────
  const select = (i: number) => {
    setSel((s) => (s === i ? null : i));
    window.requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const focalFrom = (e: RPointerEvent<HTMLDivElement>, i: number) => {
    const r = e.currentTarget.getBoundingClientRect();
    patch(i, { cropX: round1(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100)), cropY: round1(clamp(((e.clientY - r.top) / r.height) * 100, 0, 100)) });
  };

  const onDrop = (e: RDragEvent) => {
    e.preventDefault();
    setDropping(false);
    void add(Array.from(e.dataTransfer.files));
  };

  const p = sel !== null ? photos[sel] : null;
  const full = photos.length >= max;
  const aspect = p ? clampAspect(p.w && p.h ? p.w / p.h : 0.8) : 1;
  // Same maths as layout.ts (the tile's height / width, clamped), for a 1-column width unit.
  const wide = p ? spanCols(p.span) > 1 : false;
  const ratio = p ? Math.min((1 / aspect) * (spanTall(p.span) ? TALL_FACTOR : 1), wide ? MAX_WIDE_RATIO : MAX_SINGLE_RATIO) : 1;
  const previewAspect = 1 / ratio;

  return (
    <div
      className={`wk-ed${dropping ? " is-dropping" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDropping(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDropping(false);
      }}
      onDrop={onDrop}
    >
      <WeddingKitStyles />
      <div className="wk-ed-head">
        <div>
          <p className="wk-ed-title">{title}</p>
          <p className="wk-ed-hint">{hint ?? "Drag ⠿ to reorder · tap a photo to resize or set its focus"}</p>
        </div>
        <span className="wk-ed-count">
          {photos.length}/{max}
        </span>
      </div>

      {photos.length === 0 && !progress ? (
        <button type="button" className="wk-ed-empty" onClick={() => inputRef.current?.click()}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5" width="18" height="15" rx="2.5" />
            <circle cx="9" cy="10.5" r="1.8" />
            <path d="M21 16l-5-5-8 8M12 2v5M9.5 4.5h5" />
          </svg>
          <b>Add your photos</b>
          <small>Any shape works — portrait, landscape, square. Up to {max}.</small>
        </button>
      ) : (
        <div ref={gridRef} className={`wk-ed-grid${drag ? " is-dragging" : ""}`}>
          <WeddingMasonry
            photos={photos}
            mask={mask}
            lightbox={false}
            animate={false}
            animateLayout
            layoutRef={layoutRef}
            dragPos={drag}
            selectedIndex={sel}
            onTileClick={select}
            onMeasured={(i, w, h) => {
              const ph = latest.current[i];
              if (ph && !(ph.w && ph.h)) patch(i, { w, h });
            }}
            renderOverlay={(ph, i) => (
              <>
                <span className="wk-ed-num" aria-hidden>
                  {i + 1}
                </span>
                {ph.span && ph.span !== "normal" && <span className="wk-ed-badge">{ph.span}</span>}
                <button
                  type="button"
                  className="wk-ed-handle"
                  aria-label={`Move photo ${i + 1} (drag, or use arrow keys)`}
                  onPointerDown={(e) => startDrag(e, i)}
                  onKeyDown={(e) => onHandleKey(e, i)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    {[6, 12, 18].map((y) => [9, 15].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.7" />))}
                  </svg>
                </button>
              </>
            )}
          />
        </div>
      )}

      {progress && (
        <div className="wk-ed-progress" role="status" aria-live="polite">
          <span>
            Preparing photo {Math.min(progress.done + 1, progress.total)} of {progress.total}…
          </span>
          <span className="wk-ed-bar">
            <i style={{ width: `${Math.round(((progress.done + 0.5) / progress.total) * 100)}%` }} />
          </span>
        </div>
      )}

      {undo && (
        <div className="wk-ed-undo" role="status">
          Photo removed.
          <button
            type="button"
            onClick={() => {
              const list = [...latest.current];
              list.splice(Math.min(undo.index, list.length), 0, undo.photo);
              commit(list.slice(0, max));
              setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}

      {p && sel !== null && (
        <div ref={panelRef} className="wk-ed-panel" aria-label={`Photo ${sel + 1} settings`}>
          <div className="wk-ed-panelHead">
            <b>Photo {sel + 1}</b>
            <button type="button" className="wk-ed-x" onClick={() => setSel(null)} aria-label="Close photo settings">
              ✕
            </button>
          </div>

          <div className="wk-ed-sizes" role="radiogroup" aria-label="Size">
            {SPANS.map((s) => {
              const on = (p.span ?? "normal") === s.v;
              return (
                <button key={s.v} type="button" role="radio" aria-checked={on} className={on ? "is-on" : ""} onClick={() => patch(sel, { span: s.v === "normal" ? undefined : s.v })}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d={s.icon} />
                  </svg>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="wk-ed-focus">
            <div className="wk-ed-focusCol">
              <p className="wk-ed-lab">Focus — tap the faces</p>
              <div
                className="wk-ed-focal"
                style={{ aspectRatio: String(p.w && p.h ? p.w / p.h : 0.8) }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  focalFrom(e, sel);
                }}
                onPointerMove={(e) => {
                  if (e.buttons || e.pointerType === "touch") {
                    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) focalFrom(e, sel);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" draggable={false} />
                <span className="wk-ed-dot" style={{ left: `${p.cropX ?? 50}%`, top: `${p.cropY ?? 50}%` }} aria-hidden />
              </div>
            </div>
            <div className="wk-ed-focusCol is-preview">
              <p className="wk-ed-lab">How guests see it</p>
              <div className="wk-ed-preview" style={{ aspectRatio: String(previewAspect) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" draggable={false} style={photoImgStyle(p)} />
              </div>
              <label className="wk-ed-zoom">
                <span className="wk-ed-lab">Zoom</span>
                <input type="range" min={100} max={220} step={5} value={p.scale ?? 100} onChange={(e) => patch(sel, { scale: Number(e.target.value) <= 100 ? undefined : Number(e.target.value) })} />
              </label>
            </div>
          </div>

          <label className="wk-ed-field">
            <span className="wk-ed-lab">
              Caption <small>{(p.caption ?? "").length}/{MAX_CAPTION_LEN}</small>
            </span>
            <input className="wk-ed-input" value={p.caption ?? ""} maxLength={MAX_CAPTION_LEN} placeholder="Our first trip to Udaipur" onChange={(e) => patch(sel, { caption: e.target.value.slice(0, MAX_CAPTION_LEN) || undefined })} />
          </label>

          <div className="wk-ed-acts">
            <button type="button" onClick={() => { moveTo(sel, sel - 1); setSel(sel - 1); }} disabled={sel === 0}>
              ← Earlier
            </button>
            <button type="button" onClick={() => { moveTo(sel, sel + 1); setSel(sel + 1); }} disabled={sel === photos.length - 1}>
              Later →
            </button>
            <button type="button" onClick={() => replaceRef.current?.click()}>Replace</button>
            <button type="button" className="is-danger" onClick={() => remove(sel)}>
              Remove
            </button>
          </div>
        </div>
      )}

      {photos.length > 0 && !full && !progress && (
        <button type="button" className="wk-ed-add" onClick={() => inputRef.current?.click()}>
          ＋ Add photos <small>({photos.length}/{max})</small>
        </button>
      )}
      {full && <p className="wk-ed-hint">{upsell ?? `That's all ${max} — remove one to swap it.`}</p>}
      {error && (
        <p className="wk-err" role="alert">
          {error}
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="wk-sr" aria-hidden tabIndex={-1} onChange={(e) => { void add(e.target.files); e.target.value = ""; }} />
      <input ref={replaceRef} type="file" accept="image/*" className="wk-sr" aria-hidden tabIndex={-1} onChange={(e) => { void replace(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
