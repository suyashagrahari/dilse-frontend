"use client";

// ─── Nutrition Facts — the composition ───────────────────────────────────────
//
// The partner, sold as a product. Read top to bottom like you would handle a
// packet you just bought:
//
//   1. FRONT OF PACK   — the carton: flavour ribbon, die-cut window with their
//                        photo, the name set like a snack brand, claim badges.
//   2. BACK OF PACK    — the regulatory panel (PackageFrame + NutritionLabel).
//                        Tap any row and the sender's note unfolds under it.
//   3. SERVINGS        — the memories, as single-serve sachets in a box. Each
//                        opens as its own Supplement Facts panel with the note.
//   4. SIDE EFFECTS    — the GIFs, as hazard stickers.
//   5. DIRECTIONS      — the main letter, folded inside a foil wrapper you tear
//                        open. The tonal break: from 8px Helvetica to a person.
//
// ── THEMES ARE PACKAGING ─────────────────────────────────────────────────────
// The root carries the love-kit CSS variables for the chosen theme (plus the
// carton's own `--nf-*`), so switching Classic → Candy → Kraft → Midnight is a
// single style write. The panel keeps its rule hierarchy in every one of them;
// only its ink and paper change.
//
// ── SCALE, NEVER REFLOW ──────────────────────────────────────────────────────
// The panel is still a FIXED 300px block that PackageFrame fits with one
// transform. Do not add a second scale layer here (see PackageFrame).

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { BrandBadge, GROTESK, ITALIC, LOVE_CSS, LoveSky, Tape, ThemeDock } from "../../_love/LoveKit";
import { V, themeVars } from "../../_love/theme";
import { DEFAULT_LOCK_ANSWER, DEFAULT_LOCK_QUESTION } from "./demo";
import FrontOfPack from "./FrontOfPack";
import { NutritionLabel } from "./NutritionLabel";
import { PackageFrame } from "./PackageFrame";
import Servings from "./Servings";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import SideEffects from "./SideEffects";
import { NUTRITION_THEMES, packVars, pickNutritionTheme } from "./themes";
import type { NutritionData } from "./types";
import WrapperLetter from "./WrapperLetter";

/** Helvetica, then Arial. Deliberately NOT a webfont — the panel is printed. */
export const NF_SANS = 'Helvetica, "Helvetica Neue", Arial, "Liberation Sans", sans-serif';
export const NF_SERIF = 'Georgia, "Times New Roman", Times, serif';
/** Legacy tokens (the password gate still reads them). */
export const NF_SURROUND = "#E7E4DC";
export const NF_INK = "#111111";
export const NF_MUTED = "#6B6B6B";

const GUTTER = 16;

function allRowLabels(data: NutritionData): string[] {
  return [...data.nutrients.map((n) => n.label), ...data.vitamins.map((v) => v.label)].filter(Boolean);
}

/** The first name of whoever signed "Distributed by", for the letter's "from". */
function senderName(distributedBy?: string): string {
  const s = (distributedBy ?? "").split(/[,·]/)[0].replace(/\bwith love\b/i, "").trim();
  return s || "me";
}

export function NutritionTemplate({
  data,
  capture = false,
  mode = "preview",
  onThemeChange,
}: {
  data: NutritionData;
  /** Export mode: every row forced open, no scaling, no chrome. */
  capture?: boolean;
  /** `"live"` is the recipient's page and is the only mode with the brand badge. */
  mode?: "preview" | "live";
  /** Preview only: shows the floating packaging switcher. */
  onThemeChange?: (id: string) => void;
  shareId?: string;
  hasPassword?: boolean;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const theme = pickNutritionTheme(data.theme);
  const rootStyle = useMemo(() => ({ ...themeVars(theme), ...packVars(theme) }), [theme]);

  // ── Tap-a-row notes ───────────────────────────────────────────────────────
  const [openRows, setOpenRows] = useState<Set<string>>(() => new Set());
  const onToggleRow = useCallback((label: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);
  const effectiveOpenRows = useMemo(() => (capture ? new Set(allRowLabels(data)) : openRows), [capture, data, openRows]);

  // ── PNG export of the back of pack ────────────────────────────────────────
  const [cardNode, setCardNode] = useState<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const shotUrl = data.photos[0]?.url || data.photoUrl || "";
  // Inlined as a data URL (a remote image taints the export canvas). Keyed by
  // source so a stale inline never shows for a new photo.
  // Fetched only when they actually ask for the PNG — not on every page view.
  const [inlined, setInlined] = useState<{ src: string; data: string | null } | null>(null);
  const photoData = inlined && inlined.src === shotUrl ? inlined.data : null;

  const saveImage = useCallback(async () => {
    if (!cardNode || saving) return;
    setSaving(true);
    setSaveNote("");
    if (shotUrl && !(inlined && inlined.src === shotUrl)) {
      const data = await toDataUrl(shotUrl).catch(() => null);
      setInlined({ src: shotUrl, data });
      await new Promise((r) => setTimeout(r, 60));
    }
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const result = await exportNodeToPng(cardNode, {
      width: SHARE_W,
      height: SHARE_H,
      pixelRatio: 3,
      backgroundColor: theme.colors.base,
      filename: `nutrition-facts-${fileSlug(data.productName)}`,
    });
    setSaveNote(result.message);
    setSaving(false);
  }, [cardNode, saving, data.productName, theme.colors.base, shotUrl, inlined]);

  const labelRef = useRef<HTMLElement>(null);
  const flip = useCallback(() => {
    labelRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [reduceMotion]);

  if (capture) {
    return (
      <div style={rootStyle}>
        <PackageFrame data={data} capture>
          <NutritionLabel data={data} openRows={effectiveOpenRows} onToggleRow={onToggleRow} capture />
        </PackageFrame>
      </div>
    );
  }

  const firstName = data.productName.trim().split(/\s+/)[0] || "you";
  const hasTappableRow = data.nutrients.some((n) => n.note) || data.vitamins.some((v) => v.note);
  const tape = [`serving size: ${data.servingSize || `1 ${firstName}`}`, `calories: ${data.calories || "∞"}`, "100% real", "no refunds", "made with love"];

  return (
    <div className={`${DATE_FONT_VARS} lv-root`} style={{ ...rootStyle, position: "relative", minHeight: "100dvh", color: V.ink, fontFamily: GROTESK, overflowX: "hidden" }}>
      <style>{LOVE_CSS + NF_CSS}</style>
      <LoveSky theme={theme} reduceMotion={reduceMotion} />
      {mode === "live" ? <BrandBadge /> : null}
      {onThemeChange ? <ThemeDock themes={NUTRITION_THEMES} value={theme.id} onChange={onThemeChange} /> : null}

      <main style={{ position: "relative", zIndex: 1, padding: `${mode === "preview" ? 84 : 64}px ${GUTTER}px 72px`, display: "flex", flexDirection: "column", alignItems: "center", gap: 64 }}>
        <FrontOfPack
          productName={data.productName}
          photo={data.photos[0]}
          legacyPhotoUrl={data.photoUrl}
          calories={data.calories}
          servings={data.photos.length}
          onFlip={flip}
        />

        <div style={{ width: "calc(100% + 32px)", margin: "-28px 0 -20px" }}>
          <Tape words={tape} tilt={-2.5} tone="chip" reduceMotion={reduceMotion} />
        </div>

        {/* ── BACK OF PACK ── */}
        <section ref={labelRef} aria-label="Nutrition facts" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", scrollMarginTop: 72 }}>
          <p style={eyebrow}>back of pack</p>
          <h2 style={h2}>Read the label before use.</h2>
          {hasTappableRow ? <p style={sub}>Every line has a note hidden under it. Tap one.</p> : null}
          <div style={{ width: "100%", maxWidth: 440, marginTop: 20 }}>
            <PackageFrame data={data}>
              <NutritionLabel data={data} openRows={effectiveOpenRows} onToggleRow={onToggleRow} />
            </PackageFrame>
          </div>
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button type="button" onClick={saveImage} disabled={saving} className="nf-save lv-focus">
              {saving ? "Saving…" : "↓ save the label"}
            </button>
            <p aria-live="polite" style={{ margin: "6px 0 0", fontSize: 11, color: V.faint, minHeight: 14 }}>
              {saveNote}
            </p>
          </div>
        </section>

        <Servings photos={data.photos} name={data.productName} reduceMotion={reduceMotion} scopeStyle={rootStyle} />

        <SideEffects gifs={data.gifs} />

        <WrapperLetter
          letter={data.letter}
          from={senderName(data.distributedBy)}
          to={firstName}
          question={data.lockQuestion.trim() || DEFAULT_LOCK_QUESTION}
          answer={data.lockAnswer.trim() || DEFAULT_LOCK_ANSWER}
          gif={data.gifs[data.gifs.length - 1]}
          reduceMotion={reduceMotion}
        />

        <footer style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 24, color: V.ink }}>servings per container: 1</p>
          <p style={{ margin: 0, fontSize: 12, color: V.faint, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 700 }}>there is only one</p>
          {mode === "live" ? (
            <Link href="/nutrition" className="nf-save lv-focus" style={{ marginTop: 8, textDecoration: "none" }}>
              🥫 pack your own person
            </Link>
          ) : null}
        </footer>
      </main>

      <ShareCard data={data} photoData={photoData} attach={setCardNode} />
    </div>
  );
}

export default NutritionTemplate;

const eyebrow: React.CSSProperties = { margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: V.a1 };
const h2: React.CSSProperties = { margin: "8px 0 0", textAlign: "center", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1, letterSpacing: "-0.04em", color: V.ink };
const sub: React.CSSProperties = { margin: "8px 0 0", textAlign: "center", fontSize: 14, color: V.soft };

/**
 * The template's own stylesheet: carton, sachets, wrapper, stickers. Every
 * animation is transform/opacity and stops under prefers-reduced-motion.
 */
const NF_CSS = `
@keyframes nf-rise { from { opacity: 0; translate: 0 18px } to { opacity: 1; translate: 0 0 } }
@keyframes nf-glare { 0%, 70%, 100% { transform: translateX(-160%) skewX(-20deg) } 85% { transform: translateX(260%) skewX(-20deg) } }
@keyframes nf-spin { to { transform: rotate(360deg) } }
.nf-rise { animation: nf-rise .6s cubic-bezier(.2,.9,.3,1.15) both; }
.nf-hero { width: 100%; max-width: 1000px; display: flex; flex-direction: column; align-items: center; gap: 22px; }
.nf-hero-side { display: flex; flex-direction: column; align-items: center; }
.nf-hero-copy { display: none; }
@media (min-width: 900px) {
  .nf-hero { display: grid; grid-template-columns: minmax(0, 400px) minmax(0, 460px); justify-content: center; align-items: center; gap: 64px; }
  .nf-hero-side { align-items: flex-start; gap: 26px; }
  .nf-hero-copy { display: block; }
}
.nf-carton { position: relative; width: min(100%, 380px); padding-top: 22px; }
.nf-flap { position: absolute; top: 0; width: 50%; height: 26px; background: var(--nf-board); border: 2px solid var(--lv-paper-ink); border-bottom: none; border-radius: 10px 10px 0 0; filter: brightness(.94); }
.nf-glare { position: absolute; top: -10%; bottom: -10%; left: 0; width: 34%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent); animation: nf-glare 6s ease-in-out infinite; pointer-events: none; }
.nf-stamp { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: var(--lv-chip); color: var(--lv-chip-ink); font-family: ${GROTESK}; font-weight: 800; transform: rotate(-12deg); box-shadow: 0 10px 20px -8px rgba(0,0,0,.45); border: 2px dashed color-mix(in srgb, var(--lv-chip-ink) 45%, transparent); }
.nf-flip { display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 22px; border-radius: 999px; border: 2px solid var(--lv-ink); background: transparent; color: var(--lv-ink); font-family: ${GROTESK}; font-weight: 800; font-size: 15px; cursor: pointer; transition: transform .15s ease, background-color .2s ease !important; }
.nf-flip:hover { background: color-mix(in srgb, var(--lv-ink) 8%, transparent); transform: translateY(-2px); }
.nf-flip:hover .nf-flip-ico { animation: nf-spin .8s ease; }
.nf-flip-ico { display: inline-block; font-size: 18px; }
.nf-save { display: inline-flex; align-items: center; gap: 6px; min-height: 42px; padding: 0 18px; border-radius: 999px; border: 1.5px solid var(--lv-edge); background: var(--lv-glass); color: var(--lv-ink); font-family: ${GROTESK}; font-weight: 700; font-size: 13.5px; cursor: pointer; }
.nf-save:disabled { opacity: .55; cursor: default; }
.nf-supp { background: var(--lv-paper); color: var(--lv-paper-ink); border: 2px solid var(--lv-paper-ink); padding: 8px 10px 10px; box-shadow: 0 24px 50px -30px var(--lv-shadow); transform: rotate(-1deg); }
.nf-sachets { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 14px; }
@media (min-width: 720px) { .nf-sachets { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px 22px; } }
@media (min-width: 1000px) { .nf-sachets { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.nf-sachet { position: relative; display: block; width: 100%; padding: 12px 0 10px; border: 2px solid var(--lv-paper-ink); border-radius: 14px; cursor: pointer; text-align: left; color: inherit;
  background: linear-gradient(160deg, var(--nf-board) 0%, color-mix(in srgb, var(--nf-board) 80%, var(--nf-foil2)) 100%); transform: rotate(var(--tilt)); box-shadow: 0 20px 36px -22px var(--lv-shadow); overflow: hidden; }
.nf-sachet.lv-tile:hover { transform: rotate(0deg) translateY(-5px); }
.nf-crimp { position: absolute; left: 0; right: 0; top: 0; height: 10px; display: block;
  background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--lv-paper-ink) 26%, transparent) 0 2px, transparent 2px 6px), linear-gradient(var(--nf-foil1), var(--nf-foil2)); border-bottom: 1.5px solid color-mix(in srgb, var(--lv-paper-ink) 40%, transparent); }
.nf-crimp-b { top: auto; bottom: 0; border-bottom: none; border-top: 1.5px solid color-mix(in srgb, var(--lv-paper-ink) 40%, transparent); }
.nf-tear { display: flex; align-items: center; gap: 6px; margin: 8px 8px 4px; font-size: 11px; color: var(--nf-board-ink); opacity: .6; }
.nf-tear::after { content: ""; flex: 1; border-top: 1.5px dashed currentColor; }
.nf-sheen { position: absolute; inset: 0; background: linear-gradient(125deg, rgba(255,255,255,.28) 0%, transparent 38%); pointer-events: none; }
.nf-warn { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-radius: 16px; color: #111; border: 2.5px solid #111;
  background: #ffd400; box-shadow: 0 18px 40px -22px var(--lv-shadow); transform: rotate(-1.5deg); }
.nf-hazard { margin: -14px auto 0; position: relative; width: 92%; padding: 12px 10px 9px; border-radius: 10px; text-align: center; color: #111; border: 2px solid #111;
  background-color: #fff; background-image: repeating-linear-gradient(-45deg, #ffd400 0 7px, #111 7px 14px); background-size: 100% 5px; background-repeat: no-repeat; background-position: top; }
.nf-pack { width: min(100%, 400px); border-radius: 22px; overflow: hidden; border: 2px solid var(--lv-paper-ink);
  background: linear-gradient(135deg, var(--nf-foil1) 0%, color-mix(in srgb, var(--nf-foil1) 55%, #fff) 30%, var(--nf-foil2) 62%, var(--nf-foil1) 100%); box-shadow: 0 34px 70px -34px var(--lv-shadow); }
.nf-strip { position: relative; height: 44px; display: grid; place-items: center; background: linear-gradient(90deg, var(--nf-foil2), var(--nf-foil1), var(--nf-foil2)); }
.nf-perf { height: 0; border-top: 2px dashed color-mix(in srgb, var(--lv-paper-ink) 55%, transparent); }
@media (prefers-reduced-motion: reduce) {
  .nf-rise, .nf-glare, .nf-flip-ico { animation: none !important; }
}
`;
