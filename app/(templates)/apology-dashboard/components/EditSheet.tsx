"use client";

// ─── Building an apology ─────────────────────────────────────────────────────
//
// Fourteen fields in one uninterrupted column, every input 14px tall with 12px
// text, and a photo picker that took whatever the camera gave it. On a phone the
// text was smaller than the browser's own minimum, so iOS zoomed the page in on
// focus and left the sender panning around a form; on a laptop the same column
// sat in the middle of a 1440px screen with nothing either side of it.
//
// ── THE THREE RULES THIS FORM NOW KEEPS ─────────────────────────────────────
//
// 1. Text you type is 16px. Not a style preference — below 16px mobile Safari
//    zooms the viewport on focus and does not zoom back out, which is the single
//    worst thing a form can do on a phone. Every input here is at or above it.
//
// 2. One column on a phone, two on a laptop. The sections are independent, so
//    on a wide screen they sit side by side instead of making somebody scroll
//    past a metre of whitespace. `columns` does this without reordering
//    anything, so the tab order is still the reading order.
//
// 3. A photo is cropped before it is kept. `PhotoCropper` gives drag to choose
//    what is in frame and pinch or scroll to choose how much — the same gesture
//    model as the viewer's zoom. What the sender frames is what the page shows.

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PenLine, Eye, Camera, Trash2, Plus, Lock, Mail, Loader2, Heart, Sparkles, Info,
  AlertTriangle, Music2, Image as ImageIcon, ScrollText, Gift, Clock,
} from "lucide-react";
import type { ApologyData, EditMode, BriberyItem, TimelineNode } from "./types";
import { RELATIONSHIPS, BUILTIN_LOFI, MUSIC_PAUSE_EVENT, MUSIC_RESUME_EVENT } from "./types";
import VoiceRecorder from "./VoiceRecorder";
import PhotoCropper from "@/components/media/PhotoCropper";
import SongPicker from "@/components/media/SongPicker";

const ROSE = "#e64072";
const ROSE_GRADIENT = "linear-gradient(135deg,#ff7aa8,#e64072)";
const AMBER_BG = "#FFF8E6";
const AMBER_LINE = "#F5D68A";
const AMBER_INK = "#7A5512";

// 16px, because anything smaller makes mobile Safari zoom the page on focus.
const INPUT_CLS =
  "w-full px-4 py-3.5 rounded-xl bg-muted/40 border border-border/60 focus:outline-none focus:border-rose-300 text-[16px] leading-normal transition-colors";
// Deliberately without a width: callers set their own, and a `w-full` in here
// would fight any override. Two Tailwind width utilities at equal specificity
// are resolved by their order in the generated stylesheet, not by the order they
// are concatenated in — which is how the emoji box ended up full-width and the
// title beside it a sliver.
const INPUT_SM =
  "px-3.5 py-3 rounded-xl bg-muted/40 border border-border/60 focus:outline-none focus:border-rose-300 text-[16px] leading-normal transition-colors";
const EMOJI_BOX = INPUT_SM + " shrink-0 text-center px-2";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: ApologyData;
  updateMf: (key: keyof ApologyData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

/** A pending pick, held while the cropper is open. */
interface Pending {
  url: string;
  type: string;
  /** Where the finished crop goes. */
  sink: (dataUrl: string) => void;
  /** Canvas refused — keep the file as it stands rather than losing it. */
  file: File;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLSpanElement>(null);

  // close the tooltip when tapping anywhere else (so it works on phones)
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  return (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span>{label}</span>
        {hint && (
          <span ref={boxRef} className="relative inline-flex items-center">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              aria-label={hint}
              aria-expanded={open}
              className="inline-grid place-items-center w-5 h-5 rounded-full shrink-0 transition-transform active:scale-90"
              style={{ background: open ? ROSE : "rgba(230,64,114,.12)", color: open ? "#fff" : ROSE }}
            >
              <Info size={12} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-[70] normal-case tracking-normal font-medium"
                  style={{
                    top: "calc(100% + 8px)", left: 0,
                    width: "min(260px, 72vw)",
                    background: "#3a2233", color: "#fff",
                    fontSize: 11.5, lineHeight: 1.5, letterSpacing: 0,
                    padding: "9px 12px", borderRadius: 10,
                    boxShadow: "0 12px 30px -8px rgba(58,34,51,.5)",
                  }}
                >
                  <span aria-hidden style={{ position: "absolute", top: -5, left: 6, width: 10, height: 10, background: "#3a2233", transform: "rotate(45deg)", borderRadius: 2 }} />
                  {hint}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/**
 * A titled block.
 *
 * `break-inside: avoid` is what makes the two-column desktop layout work: the
 * browser moves whole sections between columns and never splits one down the
 * middle, so a section's heading is never stranded at the foot of a column.
 */
function Section({
  icon,
  title,
  note,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-border/50 p-4 space-y-4 mb-4"
      style={{ breakInside: "avoid", background: "#fffdfd" }}
    >
      <div>
        <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: ROSE }}>
          {icon} {title}
        </h4>
        {note && <p className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * A textarea that grows with what is typed.
 *
 * A fixed `rows={2}` on the sorry letter meant the one field people write most
 * in was the one they could see least of — four lines of a paragraph, scrolling
 * inside a box, while they tried to judge the whole thing.
 */
function GrowingTextarea({
  value,
  onChange,
  placeholder,
  minRows = 3,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const fit = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // Driven from the element itself rather than an effect over `value`, so a
  // draft restored into the field is measured on mount too.
  const attach = useCallback((el: HTMLTextAreaElement | null) => {
    ref.current = el;
    fit(el);
  }, [fit]);

  return (
    <textarea
      ref={attach}
      value={value}
      onChange={(e) => { onChange(e.target.value); fit(e.currentTarget); }}
      rows={minRows}
      placeholder={placeholder}
      className={(className || INPUT_CLS) + " resize-none overflow-hidden"}
      style={{ minHeight: `${minRows * 26 + 24}px` }}
    />
  );
}

function PhotoTile({
  src,
  onPick,
  onRemove,
  size = 84,
  label,
}: {
  src?: string;
  onPick: (f: File) => void;
  onRemove?: () => void;
  size?: number;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full h-full rounded-2xl border-2 border-dashed border-border/60 hover:border-rose-300 overflow-hidden grid place-items-center transition-colors"
        style={src ? { borderStyle: "solid" } : undefined}
        aria-label={label || "Add a photo"}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="grid place-items-center gap-1 text-muted-foreground">
            <Camera size={18} />
            <span className="text-[10px] font-medium">Add</span>
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
      />
      {src && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove photo"
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-black/75 text-white grid place-items-center text-[12px] leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default memo(function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: Props) {
  const visible = editMode !== null && editMode !== "preview";

  // ── Cropping ──────────────────────────────────────────────────────────────
  const [pending, setPending] = useState<Pending | null>(null);

  const pick = useCallback((file: File, sink: (dataUrl: string) => void) => {
    if (file.size > 20 * 1024 * 1024) return;
    setPending({ url: URL.createObjectURL(file), type: file.type, sink, file });
  }, []);

  const closeCropper = useCallback(() => {
    setPending((p) => { if (p) URL.revokeObjectURL(p.url); return null; });
  }, []);

  /** Canvas refused the crop — keep the picture as it is rather than losing it. */
  const keepUncropped = useCallback(() => {
    setPending((p) => {
      if (!p) return null;
      const reader = new FileReader();
      reader.onload = (e) => { const r = e.target?.result; if (typeof r === "string") p.sink(r); };
      reader.readAsDataURL(p.file);
      URL.revokeObjectURL(p.url);
      return null;
    });
  }, []);

  // ── Ducking the live preview while a song is auditioned ───────────────────
  const duck = useCallback(() => { try { window.dispatchEvent(new Event(MUSIC_PAUSE_EVENT)); } catch {} }, []);
  const unduck = useCallback(() => { try { window.dispatchEvent(new Event(MUSIC_RESUME_EVENT)); } catch {} }, []);

  const addFaces = (f: File) =>
    pick(f, (src) => updateMf("whackFaces", [...mf.whackFaces, src]));
  const removeFace = (i: number) => updateMf("whackFaces", mf.whackFaces.filter((_, idx) => idx !== i));

  const addScratchImg = (f: File) =>
    pick(f, (src) => updateMf("scratchImages", [...mf.scratchImages, src]));
  const removeScratchImg = (i: number) => updateMf("scratchImages", mf.scratchImages.filter((_, idx) => idx !== i));

  const updateBribe = (i: number, patch: Partial<BriberyItem>) =>
    updateMf("briberyItems", mf.briberyItems.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const addBribe = () => updateMf("briberyItems", [...mf.briberyItems, { icon: "💝", label: "" }]);
  const removeBribe = (i: number) => updateMf("briberyItems", mf.briberyItems.filter((_, idx) => idx !== i));

  const updateNode = (i: number, patch: Partial<TimelineNode>) =>
    updateMf("timeline", mf.timeline.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  const addNode = () => updateMf("timeline", [...mf.timeline, { icon: "⭐", title: "", text: "" }]);
  const removeNode = (i: number) => updateMf("timeline", mf.timeline.filter((_, idx) => idx !== i));

  const emailFilled = !!mf.deliveryEmail.trim();

  return (
    <>
      <AnimatePresence>
        {visible && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditMode("preview")}
              className="fixed inset-0 z-[60] bg-black/50"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent lg:p-6"
            >
              <div className="w-full lg:max-w-5xl max-h-[86vh] lg:max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
                {/* Sticky header — the close button never scrolls away */}
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40">
                  <div className="flex justify-center pt-3 pb-1 lg:hidden">
                    <div className="w-10 h-1 rounded-full bg-border" />
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <h3 className="text-base lg:text-lg font-bold flex items-center gap-2">
                      <PenLine size={16} style={{ color: ROSE }} /> Build your apology
                    </h3>
                    <button
                      onClick={() => setEditMode("preview")}
                      aria-label="Close"
                      className="p-2 -mr-2 text-muted-foreground"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="px-4 lg:px-6 pb-8 pt-4">
                  {/* One column on a phone, two from `lg`. `columns` keeps DOM
                      order, so tab order still matches reading order. */}
                  {/* The bottom padding clears the sticky footer below. Without
                      it the last section's final control sits underneath the
                      save button and cannot be tapped. */}
                  <div className="lg:[column-count:2] lg:[column-gap:20px] pb-2">

                    <Section icon={<Heart size={14} />} title="The basics" note="Who this is from, and who it is for.">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Your name *" hint="The person apologising — that's you.">
                          <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Aarav" className={INPUT_CLS} />
                        </Field>
                        <Field label="Their name" hint="Who you're apologising to.">
                          <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Aditi" className={INPUT_CLS} />
                        </Field>
                      </div>

                      <Field label="Relationship" hint="Tailors the wording and the game name.">
                        <select value={mf.relationship} onChange={(e) => updateMf("relationship", e.target.value)} className={INPUT_CLS}>
                          {RELATIONSHIPS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      </Field>

                      <Field label="Headline" hint="The big title on the very first page.">
                        <input value={mf.headline} onChange={(e) => updateMf("headline", e.target.value)} placeholder="I'm really, really sorry 🥺" className={INPUT_CLS} />
                      </Field>

                      <Field label="Sub-message" hint="The small line shown under the headline.">
                        <GrowingTextarea value={mf.subMessage} onChange={(v) => updateMf("subMessage", v)} minRows={2} />
                      </Field>
                    </Section>

                    <Section
                      icon={<ScrollText size={14} />}
                      title="Your apology"
                      note="Leave both empty and this page is skipped entirely."
                    >
                      <Field label="Your sorry letter" hint="Your heartfelt apology — shown on its own page.">
                        <GrowingTextarea
                          value={mf.sorryLetter}
                          onChange={(v) => updateMf("sorryLetter", v)}
                          minRows={6}
                          placeholder="Say what's in your heart…"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1.5">
                          {mf.sorryLetter.trim().length} characters — it grows as you write.
                        </p>
                      </Field>

                      <Field label="Voice apology (optional)" hint="Record or upload your voice — plays alongside the letter.">
                        <VoiceRecorder value={mf.voiceUrl} onChange={(url) => updateMf("voiceUrl", url)} />
                      </Field>
                    </Section>

                    <Section
                      icon={<ImageIcon size={14} />}
                      title="Photos"
                      note="Pick a photo, then drag to choose what's in frame and pinch or scroll to zoom."
                    >
                      <Field label="Your photo" hint="A photo of YOU — shown in the header at the top.">
                        <PhotoTile
                          src={mf.senderPhoto || undefined}
                          onPick={(f) => pick(f, (src) => updateMf("senderPhoto", src))}
                          onRemove={() => updateMf("senderPhoto", "")}
                          label="Add your photo"
                        />
                      </Field>

                      <Field label="Whack game faces (optional)" hint="Photo(s) of the one being whacked. No photos → the whole game is skipped.">
                        <div className="flex flex-wrap gap-2.5">
                          {mf.whackFaces.map((src, i) => (
                            <PhotoTile key={i} src={src} size={72} onPick={addFaces} onRemove={() => removeFace(i)} />
                          ))}
                          {mf.whackFaces.length < 6 && <PhotoTile size={72} onPick={addFaces} label="Add a face" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {mf.whackFaces.length === 0
                            ? "No photos yet — the whack-a-mole page won't be shown."
                            : `${mf.whackFaces.length} of 6.`}
                        </p>
                      </Field>
                    </Section>

                    <Section
                      icon={<Sparkles size={14} />}
                      title="A tiny secret"
                      note="Hidden under a scratch card. Leave it all empty and the card is skipped."
                    >
                      <Field label="Little note" hint="A short, sweet line hidden under the scratch card.">
                        <GrowingTextarea
                          value={mf.scratchSecret}
                          onChange={(v) => updateMf("scratchSecret", v)}
                          minRows={3}
                          placeholder="A short, sweet line to hide under the scratch…"
                        />
                      </Field>

                      <Field label="Photos to reveal (optional)" hint="Revealed after the recipient scratches the card.">
                        <div className="flex flex-wrap gap-2.5">
                          {mf.scratchImages.map((src, i) => (
                            <PhotoTile key={i} src={src} size={72} onPick={addScratchImg} onRemove={() => removeScratchImg(i)} />
                          ))}
                          {mf.scratchImages.length < 4 && <PhotoTile size={72} onPick={addScratchImg} label="Add a photo" />}
                        </div>
                      </Field>

                      <Field label="Voice note (optional)" hint="A short voice note revealed after scratching.">
                        <VoiceRecorder value={mf.scratchVoice} onChange={(url) => updateMf("scratchVoice", url)} />
                      </Field>
                    </Section>

                    <Section
                      icon={<Gift size={14} />}
                      title="Sweet Bribery Desk"
                      note="Promises you're offering. These become the conditions in the forgiveness deed — remove them all and the desk is skipped."
                    >
                      <div className="space-y-2.5">
                        {mf.briberyItems.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={b.icon}
                              onChange={(e) => updateBribe(i, { icon: e.target.value })}
                              className={EMOJI_BOX}
                              style={{ width: 64 }}
                              maxLength={2}
                              aria-label="Emoji"
                            />
                            <input
                              value={b.label}
                              onChange={(e) => updateBribe(i, { label: e.target.value })}
                              placeholder="Promise…"
                              className={INPUT_SM + " flex-1 min-w-0"}
                            />
                            <button
                              onClick={() => removeBribe(i)}
                              aria-label="Remove promise"
                              className="w-11 h-11 shrink-0 rounded-xl border border-border/50 grid place-items-center text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                        <button onClick={addBribe} className="inline-flex items-center gap-1.5 text-sm font-semibold py-1" style={{ color: ROSE }}>
                          <Plus size={15} /> Add promise
                        </button>
                      </div>
                    </Section>

                    <Section
                      icon={<Clock size={14} />}
                      title="Memory Lane"
                      note="Little chapters of your story. Remove them all and the timeline is skipped."
                    >
                      <div className="space-y-3">
                        {mf.timeline.map((n, i) => (
                          <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <input
                                value={n.icon}
                                onChange={(e) => updateNode(i, { icon: e.target.value })}
                                className={EMOJI_BOX}
                                style={{ width: 64 }}
                                maxLength={2}
                                aria-label="Emoji"
                              />
                              <input
                                value={n.title}
                                onChange={(e) => updateNode(i, { title: e.target.value })}
                                placeholder="Chapter title"
                                className={INPUT_SM + " flex-1 min-w-0"}
                              />
                              <button
                                onClick={() => removeNode(i)}
                                aria-label="Remove chapter"
                                className="w-11 h-11 shrink-0 rounded-xl border border-border/50 grid place-items-center text-muted-foreground hover:text-red-400"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <GrowingTextarea
                              value={n.text}
                              onChange={(v) => updateNode(i, { text: v })}
                              minRows={2}
                              placeholder="A little memory…"
                              className={INPUT_SM + " w-full"}
                            />
                          </div>
                        ))}
                        <button onClick={addNode} className="inline-flex items-center gap-1.5 text-sm font-semibold py-1" style={{ color: ROSE }}>
                          <Plus size={15} /> Add chapter
                        </button>
                      </div>
                    </Section>

                    <Section
                      icon={<Music2 size={14} />}
                      title="Background music"
                      note="Plays on the shared page the moment they open it. Tap ▶ to hear one before you choose."
                    >
                      <SongPicker
                        value={mf.backgroundMusic}
                        onChange={(url) => updateMf("backgroundMusic", url)}
                        accent={ROSE}
                        extras={BUILTIN_LOFI}
                        extrasLabel="Built in"
                        extrasNote="a soft synthesised loop — never fails to load"
                        onAuditionStart={duck}
                        onAuditionStop={unduck}
                      />
                    </Section>

                    <Section icon={<Mail size={14} />} title="Where the signed deed goes" note="This is the only field that reaches someone else.">
                      <Field
                        label="Their email *"
                        hint="Your girlfriend/boyfriend's email — where the signed agreement is sent once they forgive you."
                      >
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={mf.deliveryEmail}
                            onChange={(e) => updateMf("deliveryEmail", e.target.value)}
                            placeholder="love@email.com"
                            className={INPUT_CLS + " pl-11"}
                          />
                        </div>
                      </Field>

                      {/* ── WHY THIS WARNING IS LOUD ────────────────────────────
                          This is the one field with a consequence outside the
                          page: real mail, to a real person, carrying a PDF with
                          their name and signature on it. The old copy was 10px
                          grey text under the input and people typed their own
                          address into it. It says who, what, and when now — and
                          it turns amber only once there is an address to warn
                          about, so it reads as a consequence rather than noise. */}
                      <div
                        className="rounded-xl p-3.5 flex gap-3"
                        style={{
                          background: emailFilled ? AMBER_BG : "rgba(0,0,0,.025)",
                          border: `1px solid ${emailFilled ? AMBER_LINE : "rgba(0,0,0,.08)"}`,
                        }}
                      >
                        <AlertTriangle
                          size={17}
                          className="shrink-0 mt-0.5"
                          style={{ color: emailFilled ? AMBER_INK : "#9b9b9b" }}
                        />
                        <div className="text-[12.5px] leading-relaxed" style={{ color: emailFilled ? AMBER_INK : "#6b6b6b" }}>
                          <p className="font-bold mb-1">Double-check this address.</p>
                          <p>
                            When they sign the Deed of Forgiveness at the end of the page, the signed
                            PDF — with your apology, your promises and their signature — is emailed
                            to{" "}
                            <strong style={{ wordBreak: "break-all" }}>
                              {emailFilled ? mf.deliveryEmail.trim() : "this address"}
                            </strong>
                            , with a copy to your own account. Nothing is sent before they sign, and
                            it cannot be unsent afterwards.
                          </p>
                        </div>
                      </div>

                      <Field label="Password (optional)" hint="If set, the shared link asks for this password before opening.">
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            value={pagePassword}
                            onChange={(e) => setPagePassword(e.target.value)}
                            placeholder="Leave empty for no password"
                            className={INPUT_CLS + " pl-11"}
                          />
                        </div>
                      </Field>
                    </Section>
                  </div>

                  {/* Sticky footer — on a form this long, a save button at the
                      very bottom is a save button nobody can find. */}
                  <div className="sticky bottom-0 -mx-4 lg:-mx-6 px-4 lg:px-6 pt-3 pb-3 bg-background/95 backdrop-blur border-t border-border/40">
                    <button
                      onClick={onSave}
                      disabled={saving || !mf.senderName.trim()}
                      className="w-full py-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: ROSE_GRADIENT }}
                    >
                      {saving ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : <><Eye size={17} /> Save &amp; preview</>}
                    </button>
                    <p className="text-center text-[11.5px] text-muted-foreground flex items-center justify-center gap-1 mt-2">
                      <Heart size={11} />
                      {mf.senderName.trim() ? "Publish from the preview to get your shareable link" : "Add your name to continue"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Outside the sheet's AnimatePresence: the cropper portals to <body> and
          must not be unmounted by the sheet's exit transition mid-crop. */}
      {pending && (
        <PhotoCropper
          src={pending.url}
          fileType={pending.type}
          onCancel={closeCropper}
          onUnavailable={keepUncropped}
          onDone={(dataUrl) => { pending.sink(dataUrl); closeCropper(); }}
        />
      )}
    </>
  );
});
