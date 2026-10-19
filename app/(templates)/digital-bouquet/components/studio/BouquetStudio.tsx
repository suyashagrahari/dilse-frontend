"use client";

// ─── The bouquet studio ──────────────────────────────────────────────────────
//
// The sender's toy: a florist's table where they build the bouquet by hand.
// In the form it is a card (a live mini bouquet + "Open the studio"); the
// studio itself is a full-screen overlay:
//
//   • the bouquet on the left (desktop) / top (phone), drawn by the SAME
//     <Bouquet> the recipient sees;
//   • a tool panel on the right (desktop) / a bottom sheet (phone) with tabs:
//     Flowers · Greens · Wrap · Ribbon · Charms · Card · Photos.
//
// Flowers: tap a flower on the shelf to add it (or drag it onto the bouquet),
// its meaning shows as it lands. On the bouquet: drag a bloom to move it
// (it stays inside the dome), pinch / twist with two fingers or drag the
// round handle to resize and tilt, and the toolbar brings it forward, sends it
// back, duplicates or removes it. "Fill for me", "Shuffle" and Undo help.
// 3–15 stems. Everything writes straight into the form (extras.*), so the
// draft autosave, Save and Publish see it like any other field.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  DB_CHARMS,
  DB_CHARM_KEYS,
  DB_FLOWERS,
  DB_GREENERY,
  DB_GREENERY_KEYS,
  DB_HANDS,
  DB_LETTER_STARTERS,
  DB_PALETTES,
  DB_RIBBONS,
  DB_RIBBON_KEYS,
  DB_TONES,
  DB_WRAPS,
  DB_WRAP_KEYS,
  FLOWER_BY_ID,
  STEM_LIMITS,
  type DbCharm,
  type DbHand,
  type DbStem,
  type DbTone,
  type FlowerId,
} from "../../../_valentine/days/digital-bouquet";
import type { StudioProps } from "../../../_valentine/editor/studios";
import VwPhotos from "../../../_valentine/editor/VwPhotos";
import { haptic } from "../../../_valentine/kit/haptic";
import { themeVars } from "../../../_valentine/theme";
import { VW_FONT_VARS } from "../../../_valentine/fonts";
import type { LovePhoto } from "../../../_valentine/types";
import { ArtImg, Bouquet, BOUQUET_CSS, FlowerFace, type BouquetLook } from "../db/Bouquet";
import { CHARM_ART, GREEN_ART, RIBBON_FILE, WRAP_FILE, FRAME, UNIT, hitSize, STEM_ART } from "../db/assets";
import { DB_FONT_VARS, DB_HAND, DB_SANS, DB_SCRIPT, DB_SERIF, handFace } from "../db/fonts";
import { arrange, fillForMe, kindsOf, newStem, notesToList, readBouquet, snapToArea, type Bq } from "../db/model";

type Tab = "flowers" | "greens" | "wrap" | "ribbon" | "charms" | "card" | "photos";
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "flowers", label: "Flowers", emoji: "🌷" },
  { id: "greens", label: "Greens", emoji: "🌿" },
  { id: "wrap", label: "Wrap", emoji: "🎁" },
  { id: "ribbon", label: "Ribbon", emoji: "🎀" },
  { id: "charms", label: "Charms", emoji: "🧸" },
  { id: "card", label: "Card", emoji: "💌" },
  { id: "photos", label: "Photos", emoji: "📸" },
];

/** "What do you want to say?" — the shelf filtered by meaning. */
const INTENTS: { id: string; label: string; flowers: readonly FlowerId[] }[] = [
  { id: "all", label: "All 16", flowers: DB_FLOWERS.map((f) => f.id) },
  { id: "love", label: "💗 I love you", flowers: ["rose-red", "rose-pink", "tulip", "peony", "carnation", "orchid"] },
  { id: "sorry", label: "🥺 I'm sorry", flowers: ["rose-white", "hydrangea", "tulip", "lavender", "lily", "babys-breath"] },
  { id: "miss", label: "🩵 I miss you", flowers: ["lavender", "babys-breath", "carnation", "cherry-blossom", "rose-white", "daisy"] },
  { id: "thanks", label: "🙏 Thank you", flowers: ["hydrangea", "rose-pink", "sunflower", "daisy", "lily", "carnation"] },
  { id: "yay", label: "🎉 Celebrate", flowers: ["sunflower", "marigold", "lotus", "daisy", "cherry-blossom", "orchid"] },
];

/** What Undo restores. */
type Snap = Pick<Bq, "stems" | "greenery" | "wrap" | "ribbon" | "bow" | "charms">;

const lookOf = (b: Bq): BouquetLook => ({
  stems: b.stems,
  greenery: b.greenery,
  wrap: b.wrap,
  ribbon: b.ribbon,
  bow: b.bow,
  charms: b.charms,
  tag: b.giftTag || DB_TONES[b.tone].tag,
});



// ─── The card in the form ────────────────────────────────────────────────────

export default function BouquetStudio(props: StudioProps) {
  const { mf } = props;
  const bq = useMemo(() => readBouquet(mf.extras), [mf.extras]);
  const palette = DB_PALETTES[bq.palette];
  const [open, setOpen] = useState(false);
  const n = bq.stems.length;
  const short = Math.max(0, STEM_LIMITS.min - n);
  const kinds = kindsOf(bq.stems);
  return (
    <section className="dbs-launch" aria-labelledby="dbs-launch-t" style={{ ["--db-hand" as string]: DB_HAND }}>
      <style>{BOUQUET_CSS + LAUNCH_CSS}</style>
      <div className="dbs-launchArt" aria-hidden>
        <Bouquet look={lookOf(bq)} palette={palette} sway small />
      </div>
      <div className="dbs-launchTx">
        <p className="dbs-launchK">✦ Start here · the bouquet studio</p>
        <h3 className="dbs-launchH" id="dbs-launch-t">
          {n ? `Your bouquet · ${n} ${n === 1 ? "stem" : "stems"}` : "Arrange your bouquet"}
        </h3>
        <p className="dbs-launchP">
          {n
            ? `${kinds.slice(0, 4).map((k) => FLOWER_BY_ID[k].name).join(", ")}${kinds.length > 4 ? ` +${kinds.length - 4} more` : ""} · ${DB_WRAPS[bq.wrap].label.toLowerCase()} · ${DB_RIBBONS[bq.ribbon].label.toLowerCase()} ribbon`
            : "Pick flowers, place every stem, wrap it, tie the ribbon and write the card."}
        </p>
        {short > 0 && <p className="dbs-launchErr">Add {short} more {short === 1 ? "flower" : "flowers"}: a bouquet needs at least {STEM_LIMITS.min}.</p>}
        <button type="button" className="dbs-launchBtn" onClick={() => setOpen(true)} data-dbs-open>
          <span aria-hidden>💐</span> {n ? "Open the bouquet studio" : "Start arranging"}
        </button>
      </div>
      {open && <StudioOverlay {...props} onClose={() => setOpen(false)} />}
    </section>
  );
}

// ─── The studio ──────────────────────────────────────────────────────────────

interface Gesture {
  i: number;
  pointers: Map<number, { x: number; y: number }>;
  start: DbStem;
  /** Single pointer: where it went down. */
  ox: number;
  oy: number;
  /** Two pointers: the starting distance and angle. */
  d0: number;
  a0: number;
  moved: boolean;
  kind: "move" | "pinch" | "handle";
}

function StudioOverlay({ day, mf, updateMf, updateExtra, ai, onClose }: StudioProps & { onClose: () => void }) {
  const bq = useMemo(() => readBouquet(mf.extras), [mf.extras]);
  const palette = DB_PALETTES[bq.palette];
  const t = palette.theme;
  const [tab, setTab] = useState<Tab>("flowers");
  const [intent, setIntent] = useState("all");
  const [sel, setSel] = useState<number | null>(null);
  const [info, setInfo] = useState<FlowerId | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [live, setLiveState] = useState<DbStem[] | null>(null); // the stems mid-gesture
  const liveRef = useRef<DbStem[] | null>(null);
  const setLive = useCallback((v: DbStem[] | null) => {
    liveRef.current = v;
    setLiveState(v);
  }, []);
  const [ghost, setGhost] = useState<{ flower: FlowerId; x: number; y: number; over: boolean } | null>(null);
  const history = useRef<Snap[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const bqRef = useRef<HTMLDivElement>(null);
  const gest = useRef<Gesture | null>(null);
  const stems = live ?? bq.stems;
  const full = bq.stems.length >= STEM_LIMITS.max;

  // Lock the page under the studio; Escape closes it.
  useEffect(() => {
    const b = document.body;
    const prev = b.style.overflow;
    b.style.overflow = "hidden";
    return () => {
      b.style.overflow = prev;
    };
  }, []);

  const say = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const snapshot = useCallback((): Snap => ({ stems: bq.stems.map((s) => ({ ...s })), greenery: bq.greenery, wrap: bq.wrap, ribbon: bq.ribbon, bow: bq.bow, charms: [...bq.charms] }), [bq]);
  const remember = useCallback(() => {
    history.current.push(snapshot());
    if (history.current.length > 60) history.current.shift();
    setCanUndo(true);
  }, [snapshot]);
  const setStems = useCallback(
    (next: DbStem[], keep = true) => {
      if (keep) remember();
      updateExtra("stems", next);
    },
    [remember, updateExtra],
  );
  const setX = useCallback(
    (key: keyof Snap, v: unknown) => {
      remember();
      updateExtra(key, v);
    },
    [remember, updateExtra],
  );
  const undo = () => {
    const s = history.current.pop();
    if (!s) return;
    haptic(8);
    (Object.keys(s) as (keyof Snap)[]).forEach((k) => updateExtra(k, s[k]));
    setSel(null);
    setCanUndo(history.current.length > 0);
  };

  // ── Adding ──────────────────────────────────────────────────────────────────
  const add = (flower: FlowerId, at?: { x: number; y: number }) => {
    if (full) {
      say(`That's a full bouquet: ${STEM_LIMITS.max} stems is the most.`);
      haptic([10, 40, 10]);
      return;
    }
    const s = newStem(flower, bq.stems, at);
    const next = [...bq.stems, s];
    setStems(next);
    setSel(next.length - 1);
    setInfo(flower);
    haptic(12);
    const f = FLOWER_BY_ID[flower];
    say(`${f.name} · ${f.word}: “${f.line}”`);
  };

  // ── Canvas maths ─────────────────────────────────────────────────────────────
  const toUnits = (cx: number, cy: number) => {
    const r = bqRef.current?.querySelector<HTMLElement>("[data-dbq]")?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((cx - r.left) / r.width) * 1000, y: (((cy - r.top) / r.height) * FRAME.h) / UNIT, inside: cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom, w: r.width };
  };

  const startGesture = (i: number, e: ReactPointerEvent<HTMLElement>, kind: Gesture["kind"] = "move") => {
    e.preventDefault();
    e.stopPropagation();
    const g = gest.current;
    if (g && g.i === i && g.pointers.size === 1 && kind === "move") {
      // A second finger on the same bloom: pinch + twist.
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...g.pointers.values()];
      g.d0 = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      g.a0 = Math.atan2(b.y - a.y, b.x - a.x);
      g.start = { ...(liveRef.current ?? bq.stems)[i] };
      g.kind = "pinch";
      return;
    }
    gest.current = { i, pointers: new Map([[e.pointerId, { x: e.clientX, y: e.clientY }]]), start: { ...bq.stems[i] }, ox: e.clientX, oy: e.clientY, d0: 1, a0: 0, moved: false, kind };
    if (kind === "handle") {
      const head = bqRef.current?.querySelector<HTMLElement>(`[data-dbq-head="${i}"]`)?.getBoundingClientRect();
      if (head) {
        const c = { x: head.left + head.width / 2, y: head.top + head.height / 2 };
        gest.current.d0 = Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1;
        gest.current.a0 = Math.atan2(e.clientY - c.y, e.clientX - c.x);
        gest.current.ox = c.x;
        gest.current.oy = c.y;
      }
    }
    setSel(i);
    setInfo(bq.stems[i].flower);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const g = gest.current;
      if (!g || !g.pointers.has(e.pointerId)) return;
      g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const r = bqRef.current?.querySelector<HTMLElement>("[data-dbq]")?.getBoundingClientRect();
      if (!r) return;
      const k = 1000 / r.width;
      const base = bq.stems;
      let s: DbStem = g.start;
      if (g.kind === "pinch" && g.pointers.size >= 2) {
        const [a, b] = [...g.pointers.values()];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        s = {
          ...g.start,
          scale: Math.round(Math.min(150, Math.max(60, (g.start.scale * d) / g.d0))),
          rot: Math.round(Math.min(60, Math.max(-60, g.start.rot + ((ang - g.a0) * 180) / Math.PI))),
        };
        g.moved = true;
      } else if (g.kind === "handle") {
        const d = Math.hypot(e.clientX - g.ox, e.clientY - g.oy);
        const ang = Math.atan2(e.clientY - g.oy, e.clientX - g.ox);
        s = {
          ...g.start,
          scale: Math.round(Math.min(150, Math.max(60, (g.start.scale * d) / g.d0))),
          rot: Math.round(Math.min(60, Math.max(-60, g.start.rot + ((ang - g.a0) * 180) / Math.PI))),
        };
        g.moved = true;
      } else {
        const dx = (e.clientX - g.ox) * k;
        const dy = (e.clientY - g.oy) * k;
        if (!g.moved && Math.hypot(dx, dy) < 6) return;
        g.moved = true;
        const p = snapToArea(g.start.x + dx, g.start.y + dy);
        s = { ...g.start, ...p };
      }
      setLive(base.map((x, j) => (j === g.i ? s : x)));
    };
    const up = (e: PointerEvent) => {
      const g = gest.current;
      if (!g || !g.pointers.has(e.pointerId)) return;
      g.pointers.delete(e.pointerId);
      if (g.pointers.size > 0) {
        // One finger lifted from a pinch: carry on as a move from here.
        const [p] = [...g.pointers.values()];
        g.kind = "move";
        g.ox = p.x;
        g.oy = p.y;
        if (liveRef.current) g.start = { ...liveRef.current[g.i] };
        return;
      }
      gest.current = null;
      const cur = liveRef.current;
      setLive(null);
      if (cur && g.moved) {
        history.current.push({ stems: bq.stems.map((x) => ({ ...x })), greenery: bq.greenery, wrap: bq.wrap, ribbon: bq.ribbon, bow: bq.bow, charms: [...bq.charms] });
        setCanUndo(true);
        updateExtra("stems", cur);
        haptic(6);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [bq, updateExtra, setLive]);

  // ── Selected-stem tools ──────────────────────────────────────────────────────
  const patchSel = (p: Partial<DbStem>) => {
    if (sel == null || !bq.stems[sel]) return;
    setStems(bq.stems.map((s, j) => (j === sel ? { ...s, ...p } : s)));
  };
  const selStem = sel != null ? stems[sel] : null;
  const topZ = Math.max(0, ...bq.stems.map((s) => s.z));
  const lowZ = Math.min(99, ...bq.stems.map((s) => s.z));
  const remove = () => {
    if (sel == null) return;
    setStems(bq.stems.filter((_, j) => j !== sel));
    setSel(null);
    haptic([8, 30, 8]);
  };
  const duplicate = () => {
    if (sel == null || full) return;
    const s = bq.stems[sel];
    const p = snapToArea(s.x + 70, s.y - 40);
    const next = [...bq.stems, { ...s, ...p, z: Math.min(99, topZ + 1) }];
    setStems(next);
    setSel(next.length - 1);
    haptic(10);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (sel != null) setSel(null);
      else onClose();
      return;
    }
    if (sel == null || !selStem || (e.target as HTMLElement).closest("input,textarea,select")) return;
    const step = e.shiftKey ? 40 : 12;
    const mv = (dx: number, dy: number) => {
      e.preventDefault();
      patchSel(snapToArea(selStem.x + dx, selStem.y + dy));
    };
    if (e.key === "ArrowLeft") mv(-step, 0);
    else if (e.key === "ArrowRight") mv(step, 0);
    else if (e.key === "ArrowUp") mv(0, -step);
    else if (e.key === "ArrowDown") mv(0, step);
    else if (e.key === "+" || e.key === "=") patchSel({ scale: Math.min(150, selStem.scale + 8) });
    else if (e.key === "-") patchSel({ scale: Math.max(60, selStem.scale - 8) });
    else if (e.key === "[") patchSel({ rot: Math.max(-60, selStem.rot - 8) });
    else if (e.key === "]") patchSel({ rot: Math.min(60, selStem.rot + 8) });
    else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      remove();
    }
  };

  // ── Drag from the shelf ──────────────────────────────────────────────────────
  const shelfDown = (flower: FlowerId, e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const ox = e.clientX;
    const oy = e.clientY;
    const pid = e.pointerId;
    let dragging = false;
    const mv = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      const dx = ev.clientX - ox;
      const dy = ev.clientY - oy;
      // A mostly-vertical pull (or any mouse drag) lifts the flower off the shelf; sideways is the shelf scrolling.
      if (!dragging && (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.1 || (ev.pointerType === "mouse" && Math.hypot(dx, dy) > 8))) dragging = true;
      if (!dragging) return;
      ev.preventDefault();
      const u = toUnits(ev.clientX, ev.clientY);
      setGhost({ flower, x: ev.clientX, y: ev.clientY, over: !!u?.inside });
    };
    const done = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", done);
      window.removeEventListener("pointercancel", done);
      if (!dragging) return;
      setGhost(null);
      const u = toUnits(ev.clientX, ev.clientY);
      if (u?.inside && ev.type === "pointerup") add(flower, { x: u.x, y: u.y });
      // Swallow the click that follows a drag.
      const stop = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
      };
      window.addEventListener("click", stop, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 50);
    };
    window.addEventListener("pointermove", mv, { passive: false });
    window.addEventListener("pointerup", done);
    window.addEventListener("pointercancel", done);
  };

  // ── Notes per flower kind ────────────────────────────────────────────────────
  const setNote = (flower: FlowerId, note: string) => updateExtra("flowerNotes", notesToList({ ...bq.notes, [flower]: note.slice(0, 80) }));

  const infoFlower = info ? FLOWER_BY_ID[info] : null;
  const stemCount = bq.stems.length;
  const look = { ...lookOf(bq), stems };
  const style: CSSProperties = {
    ...themeVars(t),
    ["--db-hand" as string]: DB_HAND,
    ["--dbs-bg" as string]: t.bg,
  };

  const body = (
    <div className={`dbs-root ${VW_FONT_VARS} ${DB_FONT_VARS}`} style={style} role="dialog" aria-modal="true" aria-label="Bouquet studio" onKeyDown={onKey} tabIndex={-1} data-dbs>
      <style>{BOUQUET_CSS + STUDIO_CSS}</style>
      <header className="dbs-head">
        <button type="button" className="dbs-iconBtn" onClick={undo} disabled={!canUndo} aria-label="Undo">
          ↶
        </button>
        <div className="dbs-headTx">
          <p className="dbs-k">Bouquet studio</p>
          <p className={`dbs-count${stemCount < STEM_LIMITS.min ? " is-low" : ""}`} aria-live="polite">
            {stemCount} / {STEM_LIMITS.max} stems{stemCount < STEM_LIMITS.min ? ` · add ${STEM_LIMITS.min - stemCount} more` : ""}
          </p>
        </div>
        <button type="button" className="dbs-done" onClick={onClose} data-dbs-done>
          Done <span aria-hidden>✓</span>
        </button>
      </header>

      <div className="dbs-main">
        <div
          className="dbs-stage"
          ref={bqRef}
          onPointerDown={(e) => {
            if (!(e.target as HTMLElement).closest("[data-dbq-head],[data-dbs-tools],[data-dbs-handle]")) setSel(null);
          }}
        >
          <div className="dbs-fit">
            <Bouquet
              look={look}
              palette={palette}
              sway={!live}
              selected={sel}
              onHeadPointerDown={(i, e) => startGesture(i, e)}
              headLabel={(i) => `${FLOWER_BY_ID[stems[i].flower].name}, stem ${i + 1}. Drag to move; arrow keys move, plus and minus resize, brackets tilt, Delete removes.`}
            />
            {selStem && (
              <span
                className="dbs-handle"
                data-dbs-handle
                role="slider"
                aria-label="Resize and tilt"
                aria-valuenow={selStem.scale}
                aria-valuemin={60}
                aria-valuemax={150}
                style={{
                  left: `${((selStem.x * UNIT + (hitSize(STEM_ART[selStem.flower], selStem.scale / 100) / 2) * 0.74) / FRAME.w) * 100}%`,
                  top: `${((selStem.y * UNIT - (hitSize(STEM_ART[selStem.flower], selStem.scale / 100) / 2) * 0.74) / FRAME.h) * 100}%`,
                }}
                onPointerDown={(e) => sel != null && startGesture(sel, e as unknown as ReactPointerEvent<HTMLElement>, "handle")}
              >
                ⤡
              </span>
            )}
          </div>
          {stemCount === 0 && (
            <p className="dbs-empty">
              <span aria-hidden>👇</span> Tap a flower below to add it, or drag it up here.
            </p>
          )}
          {selStem && (
            <div className="dbs-tools" data-dbs-tools role="toolbar" aria-label={`${FLOWER_BY_ID[selStem.flower].name} tools`}>
              <button type="button" onClick={() => patchSel({ scale: Math.max(60, selStem.scale - 10) })} aria-label="Smaller">
                <span aria-hidden>－</span>
                <small>Smaller</small>
              </button>
              <button type="button" onClick={() => patchSel({ scale: Math.min(150, selStem.scale + 10) })} aria-label="Bigger">
                <span aria-hidden>＋</span>
                <small>Bigger</small>
              </button>
              <button type="button" onClick={() => patchSel({ rot: Math.max(-60, selStem.rot - 12) })} aria-label="Tilt left">
                <span aria-hidden>↺</span>
                <small>Tilt</small>
              </button>
              <button type="button" onClick={() => patchSel({ rot: Math.min(60, selStem.rot + 12) })} aria-label="Tilt right">
                <span aria-hidden>↻</span>
                <small>Tilt</small>
              </button>
              <button type="button" onClick={() => patchSel({ z: Math.min(99, topZ + 1) })} aria-label="Bring to front">
                <span aria-hidden>⬆</span>
                <small>Front</small>
              </button>
              <button type="button" onClick={() => patchSel({ z: Math.max(0, lowZ - 1) })} aria-label="Send to back">
                <span aria-hidden>⬇</span>
                <small>Back</small>
              </button>
              <button type="button" onClick={duplicate} disabled={full} aria-label="Duplicate">
                <span aria-hidden>⧉</span>
                <small>Copy</small>
              </button>
              <button type="button" className="is-danger" onClick={remove} aria-label="Remove this flower">
                <span aria-hidden>✕</span>
                <small>Remove</small>
              </button>
            </div>
          )}
        </div>

        <div className="dbs-panel">
          <nav className="dbs-tabs" role="tablist" aria-label="Studio tools">
            {TABS.map((x) => (
              <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} className={tab === x.id ? "is-on" : ""} onClick={() => setTab(x.id)} data-dbs-tab={x.id}>
                <span aria-hidden>{x.emoji}</span>
                {x.label}
              </button>
            ))}
          </nav>
          <div className="dbs-pane" role="tabpanel">
            {tab === "flowers" && (
              <>
                <div className="dbs-helpers">
                  <button
                    type="button"
                    className="dbs-chip is-hot"
                    onClick={() => {
                      setStems(fillForMe(bq.tone, bq.stems));
                      setSel(null);
                      haptic([10, 30, 10]);
                      say("Filled and arranged ✨ Move anything you like.");
                    }}
                    disabled={full}
                  >
                    ✨ Fill for me
                  </button>
                  <button
                    type="button"
                    className="dbs-chip"
                    onClick={() => {
                      setStems(arrange(bq.stems, 26, Date.now() % 100000));
                      setSel(null);
                      haptic(10);
                    }}
                    disabled={stemCount < 2}
                  >
                    🔀 Shuffle
                  </button>
                  <button
                    type="button"
                    className="dbs-chip"
                    onClick={() => {
                      setStems(arrange(bq.stems));
                      setSel(null);
                    }}
                    disabled={stemCount < 2}
                  >
                    🪄 Tidy
                  </button>
                  <button
                    type="button"
                    className="dbs-chip"
                    onClick={() => {
                      setStems([]);
                      setSel(null);
                    }}
                    disabled={!stemCount}
                  >
                    Clear
                  </button>
                </div>
                <div className="dbs-intents" role="radiogroup" aria-label="What do you want to say?">
                  {INTENTS.map((x) => (
                    <button key={x.id} type="button" role="radio" aria-checked={intent === x.id} className={`dbs-intent${intent === x.id ? " is-on" : ""}`} onClick={() => setIntent(x.id)}>
                      {x.label}
                    </button>
                  ))}
                </div>
                <p className="dbs-hint">Tap to add · pull up onto the bouquet to place it</p>
                <div className="dbs-shelf" role="list">
                  {DB_FLOWERS.filter((f) => (INTENTS.find((x) => x.id === intent)?.flowers ?? []).includes(f.id)).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="listitem"
                      className={`dbs-fl${info === f.id ? " is-info" : ""}`}
                      onPointerDown={(e) => shelfDown(f.id, e)}
                      onClick={() => add(f.id)}
                      aria-label={`Add a ${f.name}: ${f.word}`}
                      data-dbs-flower={f.id}
                    >
                      <span className="dbs-flArt">
                        <FlowerFace id={f.id} />
                      </span>
                      <b>{f.name}</b>
                      <small>{f.word}</small>
                    </button>
                  ))}
                </div>
                {infoFlower && (
                  <div className="dbs-info" aria-live="polite">
                    <span className="dbs-infoArt" aria-hidden>
                      <FlowerFace id={infoFlower.id} />
                    </span>
                    <div className="dbs-infoTx">
                      <p className="dbs-infoK">
                        {infoFlower.name} means <b>{infoFlower.word}</b>
                      </p>
                      <p className="dbs-infoL">“{infoFlower.line}”</p>
                      <label className="dbs-lab" htmlFor="dbs-note">
                        Your own line for the {infoFlower.name.toLowerCase()} <small>(optional, shown when they tap it)</small>
                      </label>
                      <input
                        id="dbs-note"
                        className="dbs-input"
                        value={bq.notes[infoFlower.id] ?? ""}
                        maxLength={80}
                        placeholder="e.g. like the ones from our first date"
                        onChange={(e) => setNote(infoFlower.id, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === "greens" && (
              <div className="dbs-grid">
                {DB_GREENERY_KEYS.map((g) => (
                  <button key={g} type="button" className={`dbs-opt${bq.greenery === g ? " is-on" : ""}`} onClick={() => setX("greenery", g)} aria-pressed={bq.greenery === g}>
                    <span className="dbs-optArt is-sprig" aria-hidden>
                      {g === "none" ? (
                        <span className="dbs-none">∅</span>
                      ) : (
                        (g === "mixed" ? (["eucalyptus", "fern", "ruscus"] as const) : g === "leafy" ? (["leaf-sprig", "ruscus"] as const) : ([g] as const)).map((k) => (
                          <ArtImg key={k} file={GREEN_ART[k].file} small />
                        ))
                      )}
                    </span>
                    <b>{DB_GREENERY[g].label}</b>
                    <small>{DB_GREENERY[g].hint}</small>
                  </button>
                ))}
              </div>
            )}

            {tab === "wrap" && (
              <div className="dbs-grid">
                {DB_WRAP_KEYS.map((w) => {
                  return (
                    <button key={w} type="button" className={`dbs-opt${bq.wrap === w ? " is-on" : ""}`} onClick={() => setX("wrap", w)} aria-pressed={bq.wrap === w}>
                      <span className="dbs-optArt is-wrap" aria-hidden>
                        <ArtImg file={`${WRAP_FILE[w]}-back`} small />
                        <ArtImg file={`${WRAP_FILE[w]}-front`} small />
                      </span>
                      <b>{DB_WRAPS[w].label}</b>
                      <small>{DB_WRAPS[w].hint}</small>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "ribbon" && (
              <>
                <p className="dbs-lab">Pick the ribbon</p>
                <div className="dbs-grid" role="radiogroup" aria-label="Ribbon colour">
                  {DB_RIBBON_KEYS.map((r) => (
                    <button key={r} type="button" role="radio" aria-checked={bq.ribbon === r} className={`dbs-opt is-small${bq.ribbon === r ? " is-on" : ""}`} onClick={() => setX("ribbon", r)} aria-label={DB_RIBBONS[r].label}>
                      <span className="dbs-optArt is-bow" aria-hidden>
                        <ArtImg file={RIBBON_FILE[r].file} small />
                      </span>
                      <b>{DB_RIBBONS[r].label}</b>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "charms" && (
              <>
                <p className="dbs-lab">Little charms (tap to tie one on)</p>
                <div className="dbs-grid is-3">
                  {DB_CHARM_KEYS.map((c) => {
                    const on = bq.charms.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`dbs-opt is-small${on ? " is-on" : ""}`}
                        aria-pressed={on}
                        onClick={() => {
                          setX("charms", on ? bq.charms.filter((x) => x !== c) : [...bq.charms, c as DbCharm]);
                          haptic(8);
                        }}
                      >
                        <span className="dbs-optArt is-charm" aria-hidden>
                          <ArtImg file={CHARM_ART[c].file} small />
                        </span>
                        <b>{DB_CHARMS[c].label}</b>
                      </button>
                    );
                  })}
                </div>
                <label className="dbs-lab" htmlFor="dbs-tag">
                  The gift tag <small>({(mf.extras.giftTag as string | undefined)?.length ?? 0}/40)</small>
                </label>
                <input
                  id="dbs-tag"
                  className="dbs-input dbs-tagInput"
                  value={String(mf.extras.giftTag ?? "")}
                  maxLength={40}
                  placeholder={DB_TONES[bq.tone].tag}
                  onChange={(e) => updateExtra("giftTag", e.target.value.slice(0, 40))}
                />
                <div className="dbs-chips">
                  {["For you, always", "For my favourite human", "Just because 💗", "Meri jaan ke liye"].map((s) => (
                    <button key={s} type="button" className="dbs-chip" onClick={() => updateExtra("giftTag", s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "card" && <CardTab mf={mf} updateMf={updateMf} updateExtra={updateExtra} tone={bq.tone} hand={bq.hand} letterMax={day.letterMax} letterMin={day.letterMin} ai={ai} onAi={onClose} />}

            {tab === "photos" && (
              <>
                <p className="dbs-hint">Up to {day.maxPhotos} photos. They&apos;re tucked between the stems as little polaroids they pull out.</p>
                <VwPhotos
                  photos={mf.photos}
                  onChange={(v: LovePhoto[]) => updateMf("photos", v.slice(0, day.maxPhotos))}
                  max={day.maxPhotos}
                  aspect={day.photoAspect}
                  captionHint={day.copy.captionHint}
                  noteHint={day.copy.noteHint}
                  themeStyle={themeVars(t)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <p key={toast.id} className="dbs-toast" role="status">
          {toast.text}
        </p>
      )}
      {ghost && (
        <span className={`dbs-ghost${ghost.over ? " is-over" : ""}`} style={{ left: ghost.x, top: ghost.y }} aria-hidden>
          <FlowerFace id={ghost.flower} />
        </span>
      )}
    </div>
  );

  return createPortal(body, document.body);
}

// ─── The card tab: to/from, the letter, a live handwritten preview ──────────

function CardTab({
  mf,
  updateMf,
  updateExtra,
  tone,
  hand,
  letterMax,
  letterMin,
  ai,
  onAi,
}: {
  mf: StudioProps["mf"];
  updateMf: StudioProps["updateMf"];
  updateExtra: StudioProps["updateExtra"];
  tone: DbTone;
  hand: DbHand;
  letterMax: number;
  letterMin: number;
  ai?: StudioProps["ai"];
  onAi: () => void;
}) {
  const [prev, setPrev] = useState<string | null>(null);
  const len = mf.letter.trim().length;
  return (
    <div className="dbs-card">
      <div className="dbs-row2">
        <label className="dbs-field">
          <span className="dbs-lab">To</span>
          <input className="dbs-input" value={mf.recipientName} maxLength={30} placeholder="their name" onChange={(e) => updateMf("recipientName", e.target.value)} />
        </label>
        <label className="dbs-field">
          <span className="dbs-lab">From</span>
          <input className="dbs-input" value={mf.senderName} maxLength={30} placeholder="your name" onChange={(e) => updateMf("senderName", e.target.value)} />
        </label>
      </div>
      <p className="dbs-lab">Handwriting</p>
      <div className="dbs-grid is-3">
        {(Object.keys(DB_HANDS) as DbHand[]).map((h) => (
          <button key={h} type="button" className={`dbs-opt is-small${hand === h ? " is-on" : ""}`} aria-pressed={hand === h} onClick={() => updateExtra("cardHand", h)}>
            <span className="dbs-handPrev" style={{ fontFamily: handFace(h) }} aria-hidden>
              Love
            </span>
            <b>{DB_HANDS[h].label}</b>
          </button>
        ))}
      </div>
      <div className="dbs-starters">
        <span className="dbs-lab">Start me off:</span>
        {(Object.keys(DB_LETTER_STARTERS) as DbTone[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`dbs-chip${k === tone ? " is-hot" : ""}`}
            onClick={() => {
              setPrev(mf.letter);
              updateMf("letter", DB_LETTER_STARTERS[k]);
            }}
          >
            {k === "romantic" ? "🌹 Romantic" : k === "sweet" ? "🌷 Sweet" : "😌 Playful"}
          </button>
        ))}
        {prev !== null && (
          <button
            type="button"
            className="dbs-chip"
            onClick={() => {
              updateMf("letter", prev);
              setPrev(null);
            }}
          >
            ↶ My letter back
          </button>
        )}
        {ai?.available && (
          <button
            type="button"
            className="dbs-chip is-ai"
            onClick={() => {
              onAi();
              ai.onOpen();
            }}
          >
            ✨ Write it with AI
          </button>
        )}
      </div>
      <label className="dbs-lab" htmlFor="dbs-letter">
        The card <small>({mf.letter.length}/{letterMax})</small>
      </label>
      <textarea
        id="dbs-letter"
        className={`dbs-input dbs-letter${len > 0 && len < letterMin ? " is-bad" : ""}`}
        rows={7}
        value={mf.letter}
        maxLength={letterMax}
        placeholder="Why today, what they mean to you, one memory only you two share."
        onChange={(e) => updateMf("letter", e.target.value.slice(0, letterMax))}
      />
      {len < letterMin && <p className="dbs-err">{len === 0 ? "The card is the heart of the bouquet. Write a few lines." : `A few more words (at least ${letterMin} characters).`}</p>}
      <p className="dbs-lab">Live preview</p>
      <div className="dbs-paper" style={{ fontFamily: handFace(hand) }}>
        <p className="dbs-paperTo">Dear {mf.recipientName || "you"},</p>
        <p className="dbs-paperBody">{mf.letter || "…"}</p>
        <p className="dbs-paperFrom">
          With all my love,
          <br />
          <span style={{ fontFamily: DB_SCRIPT }}>{mf.senderName || "me"}</span>
        </p>
      </div>
    </div>
  );
}

const LAUNCH_CSS = `
.dbs-launch { position: relative; display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 14px; align-items: center; margin: 0 0 18px; padding: 14px 16px 14px 10px; border-radius: 24px;
  background: radial-gradient(120% 120% at 0% 0%, #FFFFFF, var(--vw-soft) 70%); box-shadow: inset 0 0 0 1.5px var(--vw-edge), 0 18px 34px -24px var(--vw-accent-deep); overflow: hidden; }
@media (min-width: 560px) { .dbs-launch { grid-template-columns: 150px minmax(0, 1fr); padding: 16px 20px 16px 12px; } }
.dbs-launchArt { width: 100%; max-width: 150px; pointer-events: none; }
.dbs-launchTx { min-width: 0; display: grid; gap: 5px; }
.dbs-launchK { margin: 0; font: 700 11px/1.2 ${DB_SANS}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent-deep); }
.dbs-launchH { margin: 0; font: 600 21px/1.15 ${DB_SERIF}; color: var(--vw-paper-ink); }
.dbs-launchP { margin: 0; font: 500 13px/1.4 ${DB_SANS}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.dbs-launchErr { margin: 0; font: 600 12.5px/1.35 ${DB_SANS}; color: #B3261E; }
.dbs-launchBtn { justify-self: start; margin-top: 4px; min-height: 48px; padding: 0 20px; border: 0; border-radius: 99px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  font: 700 15px ${DB_SANS}; color: #FFFFFF; background: linear-gradient(180deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: 0 4px 0 color-mix(in srgb, var(--vw-accent-deep) 70%, #000), 0 12px 22px -10px var(--vw-accent-deep);
  animation: dbs-nudge 2.6s ease-in-out 1.2s infinite; touch-action: manipulation; }
.dbs-launchBtn:active { transform: translateY(2px); }
.dbs-launchBtn:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; }
@keyframes dbs-nudge { 0%, 86%, 100% { transform: none; } 90% { transform: rotate(-2deg) scale(1.03); } 95% { transform: rotate(2deg) scale(1.03); } }
@media (prefers-reduced-motion: reduce) { .dbs-launchBtn { animation: none; } }
`;

const STUDIO_CSS = `
.dbs-root { position: fixed; inset: 0; z-index: 240; display: flex; flex-direction: column; background: var(--dbs-bg); color: var(--vw-ink); font-family: ${DB_SANS}; outline: none;
  animation: dbs-in .32s cubic-bezier(.2,.9,.3,1); }
@keyframes dbs-in { from { opacity: 0; transform: translateY(18px) scale(.98); } }
@media (prefers-reduced-motion: reduce) { .dbs-root { animation: none; } }
.dbs-head { flex: none; display: flex; align-items: center; gap: 10px; padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 8px; }
.dbs-headTx { flex: 1; min-width: 0; text-align: center; }
.dbs-k { margin: 0; font: 600 20px/1.1 ${DB_SERIF}; font-style: italic; color: var(--vw-accent-deep); }
.dbs-count { margin: 2px 0 0; font: 700 12px/1.2 ${DB_SANS}; color: var(--vw-ink-soft); letter-spacing: .02em; }
.dbs-count.is-low { color: #B3261E; }
.dbs-iconBtn { width: 44px; height: 44px; flex: none; border-radius: 50%; border: 0; cursor: pointer; font: 700 20px/1 ${DB_SANS}; color: var(--vw-ink); background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1.5px var(--vw-edge); touch-action: manipulation; }
.dbs-iconBtn:disabled { opacity: .35; cursor: default; }
.dbs-done { flex: none; min-height: 44px; padding: 0 18px; border: 0; border-radius: 99px; cursor: pointer; font: 700 15px ${DB_SANS}; color: #FFFFFF; background: linear-gradient(180deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: 0 3px 0 color-mix(in srgb, var(--vw-accent-deep) 70%, #000); touch-action: manipulation; }
.dbs-iconBtn:focus-visible, .dbs-done:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }

.dbs-main { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.dbs-stage { position: relative; flex: 1 1 0; min-height: 0; display: grid; place-items: center; container-type: size; padding: 4px 12px 0; touch-action: none; }
.dbs-fit { position: relative; width: min(100cqw, 66cqh, 560px); }
.dbs-stage .dbq-head.is-live:hover .dbq-img { filter: drop-shadow(0 0 0 #fff) drop-shadow(0 8px 10px rgba(60,20,40,.28)); }
.dbs-handle { position: absolute; z-index: 120; width: 40px; height: 40px; margin: -20px 0 0 -20px; border-radius: 50%; display: grid; place-items: center; cursor: nwse-resize; touch-action: none;
  font: 700 18px/1 ${DB_SANS}; color: #FFFFFF; background: var(--vw-accent); box-shadow: 0 0 0 3px #FFFFFF, 0 6px 14px -4px var(--vw-accent-deep); }
.dbs-handle::after { content: ""; position: absolute; inset: -8px; }
.dbs-empty { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); margin: 0; padding: 10px 16px; border-radius: 16px; background: rgba(255,255,255,.88); font: 600 14px/1.35 ${DB_SANS}; color: var(--vw-accent-deep); text-align: center; width: max-content; max-width: 80%; box-shadow: 0 10px 24px -14px var(--vw-accent-deep); }
.dbs-tools { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); z-index: 130; display: flex; gap: 0; padding: 3px; border-radius: 18px; max-width: calc(100% - 4px); overflow-x: auto; scrollbar-width: none;
  background: rgba(255,255,255,.95); box-shadow: 0 12px 28px -14px var(--vw-accent-deep), inset 0 0 0 1px var(--vw-edge); animation: dbs-pop .22s ease-out; }
.dbs-tools::-webkit-scrollbar { display: none; }
@keyframes dbs-pop { from { opacity: 0; transform: translate(-50%, 8px); } }
.dbs-tools { width: max-content; }
.dbs-tools button { flex: 1 1 0; min-width: 44px; min-height: 48px; padding: 2px 2px; border: 0; border-radius: 13px; background: transparent; color: var(--vw-ink); cursor: pointer; display: grid; place-items: center; gap: 0; touch-action: manipulation; }
.dbs-tools button span { font: 700 17px/1 ${DB_SANS}; }
.dbs-tools button small { font: 600 10px/1.1 ${DB_SANS}; color: var(--vw-ink-soft); }
.dbs-tools button:hover { background: var(--vw-soft); }
.dbs-tools button:disabled { opacity: .35; }
.dbs-tools button.is-danger span, .dbs-tools button.is-danger small { color: #B3261E; }
.dbs-tools button:focus-visible { outline: 2px solid var(--vw-accent); outline-offset: -2px; }

.dbs-panel { flex: none; height: min(46dvh, 420px); display: flex; flex-direction: column; background: var(--vw-paper); border-radius: 24px 24px 0 0; box-shadow: 0 -14px 34px -20px var(--vw-accent-deep), inset 0 1px 0 var(--vw-edge); }
.dbs-tabs { flex: none; display: flex; gap: 4px; overflow-x: auto; padding: 10px 10px 6px; scrollbar-width: none; }
.dbs-tabs::-webkit-scrollbar { display: none; }
.dbs-tabs button { flex: none; min-height: 44px; padding: 0 13px; border: 0; border-radius: 99px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font: 700 13.5px ${DB_SANS}; color: var(--vw-ink-soft); background: transparent; touch-action: manipulation; }
.dbs-tabs button.is-on { color: #FFFFFF; background: var(--vw-accent); box-shadow: 0 6px 14px -8px var(--vw-accent-deep); }
.dbs-tabs button:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 1px; }
.dbs-pane { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 14px calc(env(safe-area-inset-bottom, 0px) + 16px); }
@media (min-width: 900px) {
  .dbs-main { flex-direction: row; }
  .dbs-stage { padding: 8px 24px 24px; }
  .dbs-fit { width: min(100cqw, 70cqh, 640px); }
  .dbs-panel { width: 420px; height: auto; border-radius: 26px 0 0 0; box-shadow: -14px 0 34px -22px var(--vw-accent-deep), inset 1px 0 0 var(--vw-edge); }
  .dbs-head { padding: 14px 20px 10px; }
  .dbs-tabs { flex-wrap: wrap; padding: 14px 14px 8px; }
}
@media (min-width: 900px) {
  .dbs-shelf { flex-wrap: wrap; overflow: visible; margin: 0; padding: 4px 0 10px; }
  .dbs-fl { width: calc(25% - 6px); }
  .dbs-intents { flex-wrap: wrap; margin: 0 0 2px; padding: 2px 0 4px; }
}
@media (orientation: landscape) and (max-height: 520px) {
  .dbs-main { flex-direction: row; }
  .dbs-panel { width: min(52vw, 420px); height: auto; border-radius: 22px 0 0 0; }
  .dbs-fit { width: min(100cqw, 70cqh); }
  .dbs-head { padding-top: 6px; padding-bottom: 4px; }
  .dbs-tools { bottom: 2px; }
}

.dbs-helpers { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 6px; }
.dbs-chips, .dbs-starters { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin: 6px 0 10px; }
.dbs-chip { min-height: 40px; padding: 0 14px; border: 0; border-radius: 99px; cursor: pointer; font: 700 13px ${DB_SANS}; color: var(--vw-ink); background: var(--vw-soft); box-shadow: inset 0 0 0 1px var(--vw-edge); touch-action: manipulation; }
.dbs-chip.is-hot { color: #FFFFFF; background: linear-gradient(180deg, var(--vw-accent), var(--vw-accent-deep)); box-shadow: none; }
.dbs-chip.is-ai { color: var(--vw-accent-deep); background: #FFFFFF; box-shadow: inset 0 0 0 1.5px var(--vw-accent); }
.dbs-chip:disabled { opacity: .4; cursor: default; }
.dbs-chip:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 2px; }
.dbs-intents { display: flex; gap: 6px; overflow-x: auto; margin: 0 -14px 2px; padding: 2px 14px 4px; scrollbar-width: none; }
.dbs-intents::-webkit-scrollbar { display: none; }
.dbs-intent { flex: none; min-height: 40px; padding: 0 12px; border-radius: 99px; border: 1.5px solid var(--vw-edge); background: #FFFFFF; color: var(--vw-ink-soft); font: 700 12.5px ${DB_SANS}; cursor: pointer; touch-action: manipulation; }
.dbs-intent.is-on { border-color: var(--vw-accent); color: var(--vw-accent-deep); background: var(--vw-soft); }
.dbs-intent:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 2px; }
.dbs-hint { margin: 2px 0 8px; font: 600 12px/1.35 ${DB_SANS}; color: var(--vw-ink-soft); }
.dbs-shelf { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 10px; margin: 0 -14px; padding-left: 14px; padding-right: 14px; scroll-snap-type: x proximity; scrollbar-width: thin; scrollbar-color: var(--vw-accent) transparent; }
.dbs-fl { flex: none; width: 92px; scroll-snap-align: start; display: grid; justify-items: center; gap: 1px; padding: 8px 4px 9px; border: 0; border-radius: 18px; cursor: pointer; background: linear-gradient(180deg, #FFFFFF, var(--vw-soft));
  box-shadow: inset 0 0 0 1.5px var(--vw-edge), 0 8px 16px -14px var(--vw-accent-deep); touch-action: pan-x; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; transition: transform .15s ease; }
.dbs-fl:active { transform: scale(.95); }
.dbs-fl.is-info { box-shadow: inset 0 0 0 2px var(--vw-accent), 0 8px 16px -12px var(--vw-accent-deep); }
.dbs-fl:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 2px; }
.dbs-flArt { width: 62px; height: 62px; display: block; animation: dbs-idle 3.4s ease-in-out infinite alternate; }
.dbs-fl:nth-child(2n) .dbs-flArt { animation-delay: -1.3s; }
.dbs-fl:nth-child(3n) .dbs-flArt { animation-delay: -2.1s; }
@keyframes dbs-idle { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
.dbs-flArt .dbq-face, .dbs-infoArt .dbq-face, .dbs-ghost .dbq-face { width: 100%; height: 100%; }
.dbs-flArt img, .dbs-infoArt img, .dbs-ghost img { filter: drop-shadow(0 4px 5px rgba(60,20,40,.18)); }
.dbs-fl b { font: 700 12px/1.15 ${DB_SANS}; color: var(--vw-paper-ink); text-align: center; }
.dbs-fl small { font: 500 11px/1.15 ${DB_SERIF}; font-style: italic; font-size: 13px; color: var(--vw-accent-deep); text-align: center; }
.dbs-info { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 12px; align-items: start; margin-top: 4px; padding: 12px; border-radius: 18px; background: var(--vw-soft); box-shadow: inset 0 0 0 1px var(--vw-edge); }
.dbs-infoArt { width: 64px; height: 64px; }
.dbs-infoTx { min-width: 0; }
.dbs-infoK { margin: 0; font: 600 13px/1.3 ${DB_SANS}; color: var(--vw-ink-soft); }
.dbs-infoK b { color: var(--vw-accent-deep); }
.dbs-infoL { margin: 2px 0 8px; font: 600 18px/1.25 ${DB_SERIF}; font-style: italic; color: var(--vw-paper-ink); }
.dbs-lab { display: block; margin: 10px 0 6px; font: 700 12.5px/1.3 ${DB_SANS}; color: var(--vw-paper-ink); }
.dbs-lab small { font-weight: 500; color: var(--vw-ink-soft); }
.dbs-input { width: 100%; box-sizing: border-box; min-height: 46px; padding: 10px 14px; border-radius: 14px; border: 1.5px solid var(--vw-edge); background: #FFFFFF; color: var(--vw-paper-ink); font: 500 16px ${DB_SANS}; outline: none; }
.dbs-input:focus { border-color: var(--vw-accent); box-shadow: 0 0 0 3px var(--vw-soft); }
.dbs-input.is-bad { border-color: #B3261E; }
.dbs-tagInput { font: 600 22px var(--db-hand, cursive); }
.dbs-letter { min-height: 150px; resize: vertical; line-height: 1.5; }
.dbs-err { margin: 6px 0 0; font: 600 12.5px ${DB_SANS}; color: #B3261E; }
.dbs-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding-top: 4px; }
.dbs-grid.is-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.dbs-opt { display: grid; justify-items: center; gap: 2px; padding: 10px 6px; min-height: 64px; border: 0; border-radius: 18px; cursor: pointer; background: #FFFFFF; box-shadow: inset 0 0 0 1.5px var(--vw-edge); color: var(--vw-paper-ink); touch-action: manipulation; text-align: center; }
.dbs-opt.is-on { box-shadow: inset 0 0 0 2.5px var(--vw-accent), 0 10px 18px -14px var(--vw-accent-deep); background: var(--vw-soft); }
.dbs-opt:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 2px; }
.dbs-opt b { font: 700 13px/1.2 ${DB_SANS}; }
.dbs-opt small { font: 500 11.5px/1.25 ${DB_SANS}; color: var(--vw-ink-soft); }
.dbs-optArt { width: 100%; height: 70px; display: flex; justify-content: center; align-items: flex-end; gap: 0; border-radius: 12px; overflow: hidden; }
.dbs-optArt.is-sprig img { height: 100%; width: auto; object-fit: contain; margin: 0 -4px; }
.dbs-optArt.is-wrap { position: relative; height: 84px; }
.dbs-optArt.is-wrap img { position: absolute; left: 50%; top: 0; height: 100%; width: auto; transform: translateX(-50%); }
.dbs-optArt.is-bow { height: 58px; align-items: center; }
.dbs-optArt.is-bow img, .dbs-optArt.is-charm img { height: 100%; width: auto; }
.dbs-optArt.is-charm { height: 64px; }
.dbs-optArt.is-paper { position: relative; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
.dbs-optArt.is-newspaper { background-image: repeating-linear-gradient(0deg, rgba(110,100,90,.35) 0 2px, transparent 2px 9px) !important; background-color: #EFE9DC !important; }
.dbs-optArt.is-kraft::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(120deg, rgba(120,80,40,.12) 0 1px, transparent 1px 7px); }
.dbs-optArt.is-pearl::after { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 60% at 35% 30%, rgba(255,255,255,.95), transparent 70%), linear-gradient(120deg, transparent 40%, rgba(220,200,240,.4) 60%, transparent 80%); }
.dbs-none { font: 600 34px/70px ${DB_SANS}; color: var(--vw-ink-soft); }
.dbs-optEmoji { font-size: 28px; line-height: 1.2; }
.dbs-swatches { display: flex; flex-wrap: wrap; gap: 10px; }
.dbs-sw { position: relative; width: 48px; height: 48px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 2px rgba(255,255,255,.8), 0 4px 10px -6px rgba(0,0,0,.4); margin-bottom: 14px; touch-action: manipulation; }
.dbs-sw small { position: absolute; left: 50%; top: 100%; transform: translateX(-50%); margin-top: 2px; font: 600 10.5px ${DB_SANS}; color: var(--vw-ink-soft); white-space: nowrap; }
.dbs-sw.is-on { box-shadow: 0 0 0 3px #FFFFFF, 0 0 0 5.5px var(--vw-accent); }
.dbs-sw:focus-visible { outline: 2px solid var(--vw-ink); outline-offset: 4px; }
.dbs-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dbs-field .dbs-lab { margin-top: 4px; }
.dbs-handPrev { font-size: 26px; line-height: 1.1; color: var(--vw-accent-deep); }
.dbs-paper { margin-top: 2px; padding: 18px 18px 16px; border-radius: 6px; background: linear-gradient(180deg, #FFFDF8, #FBF3E6); color: #3F2A22; box-shadow: 0 16px 30px -22px rgba(60,30,20,.6), inset 0 0 0 1px rgba(160,120,80,.18);
  background-image: repeating-linear-gradient(180deg, transparent 0 29px, rgba(150,120,90,.14) 29px 30px); font-size: 21px; line-height: 30px; }
.dbs-paperTo { margin: 0 0 6px; }
.dbs-paperBody { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.dbs-paperFrom { margin: 12px 0 0; text-align: right; }
.dbs-paperFrom span { font-size: 34px; color: var(--vw-accent-deep); }
.dbs-toast { position: fixed; left: 50%; top: calc(env(safe-area-inset-top, 0px) + 64px); transform: translateX(-50%); z-index: 260; margin: 0; max-width: min(92vw, 460px); width: max-content; padding: 10px 16px; border-radius: 16px;
  background: rgba(255,255,255,.97); color: var(--vw-paper-ink); font: 600 13.5px/1.35 ${DB_SANS}; text-align: center; box-shadow: 0 14px 30px -16px var(--vw-accent-deep), inset 0 0 0 1px var(--vw-edge); animation: dbs-toast 2.6s ease forwards; pointer-events: none; }
@keyframes dbs-toast { 0% { opacity: 0; transform: translate(-50%, -8px); } 10%, 85% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; } }
.dbs-ghost { position: fixed; z-index: 270; width: 96px; height: 96px; margin: -60px 0 0 -48px; pointer-events: none; transform: scale(.9) rotate(-8deg); transition: transform .15s ease; filter: drop-shadow(0 14px 16px rgba(60,20,40,.35)); }
.dbs-ghost.is-over { transform: scale(1.15) rotate(0); }

@media (prefers-reduced-motion: reduce) { .dbs-flArt, .dbs-toast, .dbs-tools { animation: none; } }
`;
