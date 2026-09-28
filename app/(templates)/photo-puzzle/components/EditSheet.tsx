"use client";

// ─── The Last Piece — the sender's form ──────────────────────────────────────
//
// Five short steps, each a card: who it's for → the puzzle (photo, framing,
// difficulty) → the vibe → memories + GIFs → the letter. A sticky step bar
// jumps between them, and the footer says exactly what is still missing
// before Save will go through. Every change goes through `updateMf`; the hook
// autosaves the draft, so nothing here writes to storage itself.

import { memo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Loader2, Lock, X } from "lucide-react";

import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import { pickTheme } from "../../_love/theme";
import { MAX_PHOTOS } from "../../_love/types";
import PuzzlePhotoField from "./PuzzlePhotoField";
import { PUZZLE_THEMES } from "./themes";
import {
  DEFAULT_LOCK_ANSWER,
  DEFAULT_LOCK_QUESTION,
  DEMO_IMAGE,
  DIFFICULTIES,
  DIFFICULTY_META,
  type EditMode,
  type PuzzleData,
} from "./types";

export interface EditSheetProps {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: PuzzleData;
  updateMf: (key: keyof PuzzleData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

const INPUT = "w-full px-3.5 py-3 rounded-xl bg-muted/50 border border-border/60 focus:outline-none focus:ring-2";

/** What still blocks Save, in the order the form asks for it. */
export function missingFields(d: PuzzleData): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  if (!d.recipientName.trim()) out.push({ id: "pp-names", label: "their name" });
  if (!d.senderName.trim()) out.push({ id: "pp-names", label: "your name" });
  if (!d.imageUrl.trim()) out.push({ id: "pp-puzzle", label: "your puzzle photo" });
  if (d.letter.trim().length < 20) out.push({ id: "pp-memories", label: "a letter (a few lines)" });
  return out;
}

const STEPS = [
  { id: "pp-names", emoji: "💌", label: "names" },
  { id: "pp-puzzle", emoji: "🧩", label: "puzzle" },
  { id: "pp-vibe", emoji: "🎨", label: "vibe" },
  { id: "pp-memories", emoji: "📸", label: "memories" },
];

function Field({ label, hint, count, children }: { label: string; hint?: string; count?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        {count && <span className="text-[10.5px] tabular-nums text-muted-foreground">{count}</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground mt-1.5 leading-snug">{hint}</span>}
    </label>
  );
}

export default memo(function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: EditSheetProps) {
  const visible = editMode === "manual";
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = pickTheme(PUZZLE_THEMES, mf.theme).colors.a1;
  const missing = missingFields(mf);
  const done = (id: string) => !missing.some((m) => m.id === id);

  const jump = (id: string) => {
    const box = scrollRef.current;
    const el = box?.querySelector<HTMLElement>(`#${id}`);
    if (box && el) box.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" });
  };

  const card = "rounded-3xl border border-border/60 bg-background p-4 sm:p-5 shadow-[0_10px_30px_-24px_rgba(60,20,40,.5)] scroll-mt-20";

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} className="fixed inset-0 z-[60] bg-black/50" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] lg:flex lg:items-center lg:justify-center lg:inset-0 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Make your puzzle"
              className="pointer-events-auto w-full max-w-2xl h-[88dvh] lg:h-[90vh] flex flex-col bg-muted/30 rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto overflow-hidden"
              style={{ background: "linear-gradient(180deg,#fffaf6 0%,#fff 40%)" }}
            >
              {/* Header + step bar */}
              <div className="shrink-0 px-5 pt-3 pb-3 border-b border-border/50 bg-white/90">
                <div className="flex justify-center pb-2">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold leading-tight">Make your puzzle 🧩</h3>
                    <p className="text-[12px] text-muted-foreground">Their photo, cut into tiles. The last piece is yours to give.</p>
                  </div>
                  <button onClick={() => setEditMode("preview")} className="w-10 h-10 grid place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
                <nav aria-label="Form steps" className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => jump(s.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold"
                      style={{ borderColor: done(s.id) ? `${accent}55` : "rgba(0,0,0,.1)", background: done(s.id) ? `${accent}12` : "#fff" }}
                    >
                      <span className="w-5 h-5 rounded-full grid place-items-center text-[10px] text-white" style={{ background: done(s.id) ? accent : "#c9bfc4" }}>
                        {done(s.id) ? <Check size={11} strokeWidth={3} /> : i + 1}
                      </span>
                      {s.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Body */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4 relative">
                <section id="pp-names" className={card}>
                  <FormSection emoji="💌" title="Who's it for?" note="Their name goes big on the first screen.">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Their name" count={`${mf.recipientName.length}/32`}>
                        <input
                          value={mf.recipientName}
                          onChange={(e) => updateMf("recipientName", e.target.value.slice(0, 32))}
                          placeholder="e.g. Ananya"
                          aria-label="Their name"
                          className={INPUT}
                          style={{ fontSize: 16 }}
                        />
                      </Field>
                      <Field label="Your name" count={`${mf.senderName.length}/32`}>
                        <input
                          value={mf.senderName}
                          onChange={(e) => updateMf("senderName", e.target.value.slice(0, 32))}
                          placeholder="e.g. Rohan"
                          aria-label="Your name"
                          className={INPUT}
                          style={{ fontSize: 16 }}
                        />
                      </Field>
                    </div>
                  </FormSection>
                </section>

                <section id="pp-puzzle" className={card}>
                  <FormSection emoji="🧩" title="The puzzle" note="Pick a photo of you two — we cut it into perfect tiles.">
                    <PuzzlePhotoField
                      src={mf.imageUrl.trim() || DEMO_IMAGE}
                      isDemo={!mf.imageUrl.trim()}
                      crop={{ x: mf.imageCropX, y: mf.imageCropY, scale: mf.imageScale }}
                      grid={DIFFICULTY_META[mf.difficulty].size}
                      accent={accent}
                      onPhoto={(url) => {
                        updateMf("imageUrl", url);
                        updateMf("imageCropX", 50);
                        updateMf("imageCropY", 50);
                        updateMf("imageScale", 100);
                      }}
                      onCrop={(c) => {
                        updateMf("imageCropX", Math.round(c.x));
                        updateMf("imageCropY", Math.round(c.y));
                        updateMf("imageScale", Math.round(c.scale));
                      }}
                      onUseDemo={() => updateMf("imageUrl", "")}
                    />
                    <div className="pt-1">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-2">How hard?</p>
                      <div role="radiogroup" aria-label="Difficulty" className="grid grid-cols-3 gap-2">
                        {DIFFICULTIES.map((d) => {
                          const m = DIFFICULTY_META[d];
                          const on = mf.difficulty === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              onClick={() => updateMf("difficulty", d)}
                              className="rounded-2xl border-2 px-2 py-3 text-center transition-transform active:scale-[.97]"
                              style={{ borderColor: on ? accent : "rgba(0,0,0,.08)", background: on ? `${accent}10` : "#fff" }}
                            >
                              <span className="block text-2xl leading-none" aria-hidden>{m.emoji}</span>
                              <span className="block mt-1.5 text-[14px] font-extrabold">{m.label}</span>
                              <span className="block text-[11px] font-semibold text-muted-foreground">{m.size}×{m.size} · {m.size * m.size - 1} tiles</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-2">{DIFFICULTY_META[mf.difficulty].blurb}</p>
                    </div>
                    <Field label="When the last piece lands" count={`${mf.finalPieceMessage.length}/90`} hint="The big line that pops up the second the picture is complete.">
                      <input
                        value={mf.finalPieceMessage}
                        onChange={(e) => updateMf("finalPieceMessage", e.target.value.slice(0, 90))}
                        placeholder="Turns out you were the missing piece all along."
                        aria-label="When the last piece lands"
                        className={INPUT}
                        style={{ fontSize: 16 }}
                      />
                    </Field>
                  </FormSection>
                </section>

                <section id="pp-vibe" className={card}>
                  <ThemeSection themes={PUZZLE_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />
                </section>

                <section id="pp-memories" className={`${card} space-y-4`}>
                  <MemoriesSections
                    data={mf}
                    update={(k, v) => updateMf(k, v)}
                    gifTags={["love", "hug", "yes"]}
                    copy={{
                      photosTitle: `More pieces of your story (${mf.photos.length}/${MAX_PHOTOS})`,
                      photosNote: "Add 5–10 photos. After the puzzle they snap together as a jigsaw — tap one and its memory opens. Tap a photo here to crop & zoom it.",
                      captionHint: "caption — e.g. our first chai date",
                      noteHint: "The thing you remember most about that day…",
                      gifsTitle: "GIFs for the celebration",
                      letterTitle: "Your main letter",
                      letterNote: "The very last piece. It opens after a cute little question.",
                      letterHint: "Write it like they're reading it at 2am…",
                      lockQuestion: DEFAULT_LOCK_QUESTION,
                      lockAnswer: DEFAULT_LOCK_ANSWER,
                    }}
                  />
                  {mf.photos.length > 0 && mf.photos.length < 5 && (
                    <p className="text-[12px] font-semibold rounded-xl px-3 py-2" style={{ background: `${accent}10`, color: accent }}>
                      Tip: {5 - mf.photos.length} more photo{5 - mf.photos.length === 1 ? "" : "s"} makes the memory board feel full 💗
                    </p>
                  )}
                  <Field label="The sign-off at the very end" count={`${mf.closingLine.length}/100`}>
                    <input
                      value={mf.closingLine}
                      onChange={(e) => updateMf("closingLine", e.target.value.slice(0, 100))}
                      placeholder="There. That's the whole picture."
                      aria-label="The sign-off at the very end"
                      className={INPUT}
                      style={{ fontSize: 16 }}
                    />
                  </Field>
                </section>

                <section className={card}>
                  <Field label="Password (optional)" hint="If set, the link asks for it before the puzzle opens.">
                    <span className="relative block">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={pagePassword}
                        onChange={(e) => setPagePassword(e.target.value)}
                        placeholder="Leave empty for no password"
                        aria-label="Page password"
                        className={`${INPUT} pl-10`}
                        style={{ fontSize: 16 }}
                      />
                    </span>
                  </Field>
                </section>
              </div>

              {/* Footer: what's missing + Save */}
              <div className="shrink-0 px-4 sm:px-5 pt-3 border-t border-border/50 bg-white" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
                {missing.length > 0 ? (
                  <p className="text-[12px] mb-2 leading-snug">
                    <span className="font-bold">Still needed: </span>
                    {missing.map((m, i) => (
                      <span key={m.label}>
                        <button type="button" onClick={() => jump(m.id)} className="font-semibold underline underline-offset-2" style={{ color: accent }}>
                          {m.label}
                        </button>
                        {i < missing.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="text-[12px] mb-2 font-semibold text-muted-foreground">All set — save to play it once, then publish 💗</p>
                )}
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl text-white font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: accent, minHeight: 52, opacity: missing.length ? 0.75 : 1 }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; play it</>}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
