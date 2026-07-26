"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, Eye, Camera, Trash2, Plus, Lock, Loader2, Heart, Info, Music } from "lucide-react";
import type { MissYouData, EditMode, Memory, OpenWhenNote, QuizCard } from "./types";
import { CITY_PRESETS } from "./types";
import VoiceRecorder from "./VoiceRecorder";
import { LIGHT, BRAND_GRADIENT } from "./theme";

const INDIGO = LIGHT.indigoStrong;
const INPUT_CLS = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm transition-all";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: MissYouData;
  updateMf: (key: keyof MissYouData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <span>{label}</span>
        {hint && (
          <span ref={boxRef} className="relative inline-flex items-center">
            <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} aria-label={hint} aria-expanded={open}
              className="inline-grid place-items-center w-5 h-5 rounded-full shrink-0 transition-transform active:scale-90"
              style={{ background: open ? INDIGO : "rgba(86,70,201,.12)", color: open ? "#fff" : INDIGO }}>
              <Info size={12} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.span role="tooltip" initial={{ opacity: 0, y: -4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.96 }} transition={{ duration: 0.15 }}
                  className="absolute z-[60] normal-case tracking-normal font-medium"
                  style={{ top: "calc(100% + 8px)", left: 0, width: "min(240px, 72vw)", background: "#241F3D", color: "#fff", fontSize: 11, lineHeight: 1.5, letterSpacing: 0, padding: "8px 11px", borderRadius: 10, boxShadow: "0 12px 30px -8px rgba(20,16,40,.5)" }}>
                  <span aria-hidden style={{ position: "absolute", top: -5, left: 6, width: 10, height: 10, background: "#241F3D", transform: "rotate(45deg)", borderRadius: 2 }} />
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

function fileToDataUrl(file: File, cb: (src: string) => void, maxMb = 6) {
  if (file.size > maxMb * 1024 * 1024) { alert(`Image too large. Please use one under ${maxMb}MB.`); return; }
  const reader = new FileReader();
  reader.onload = (e) => cb(e.target?.result as string);
  reader.readAsDataURL(file);
}

// datetime-local <-> ISO helpers
const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default memo(function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: Props) {
  const visible = editMode !== null && editMode !== "preview";
  const memImgRef = useRef<HTMLInputElement>(null);

  const addMemory = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 6 - mf.memories.length).forEach((f) =>
      fileToDataUrl(f, (src) => updateMf("memories", [...mf.memories, { image: src, caption: "" }]), 6),
    );
  };
  const updateMemory = (i: number, patch: Partial<Memory>) => updateMf("memories", mf.memories.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const removeMemory = (i: number) => updateMf("memories", mf.memories.filter((_, idx) => idx !== i));

  const updateNote = (i: number, patch: Partial<OpenWhenNote>) => updateMf("openWhen", mf.openWhen.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  const addNote = () => updateMf("openWhen", [...mf.openWhen, { label: "open when…", text: "" }]);
  const removeNote = (i: number) => updateMf("openWhen", mf.openWhen.filter((_, idx) => idx !== i));

  const updateQuiz = (i: number, patch: Partial<QuizCard>) => updateMf("quiz", mf.quiz.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const addQuiz = () => updateMf("quiz", [...mf.quiz, { question: "", answer: "", memory: "" }]);
  const removeQuiz = (i: number) => updateMf("quiz", mf.quiz.filter((_, idx) => idx !== i));

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} className="fixed inset-0 z-[60] bg-black/50" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent">
            <div className="w-full max-w-2xl max-h-[82vh] lg:max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-8 pt-2 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2"><PenLine size={16} style={{ color: INDIGO }} /> Build your letter</h3>
                  <button onClick={() => setEditMode("preview")} aria-label="Close" className="p-1 text-muted-foreground"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your name *" hint="The person who misses them — that's you.">
                    <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Aarav" className={INPUT_CLS} />
                  </Field>
                  <Field label="Their name" hint="Your partner's name.">
                    <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Aditi" className={INPUT_CLS} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pet-name" hint="Shown big on the envelope (e.g. my moon, jaan).">
                    <input value={mf.petName} onChange={(e) => updateMf("petName", e.target.value)} placeholder="e.g. my moon" className={INPUT_CLS} />
                  </Field>
                  <Field label="Cover line" hint="The little eyebrow line on the envelope.">
                    <input value={mf.coverLine} onChange={(e) => updateMf("coverLine", e.target.value)} placeholder="A letter for you" className={INPUT_CLS} />
                  </Field>
                </div>

                <Field label="Your letter" hint="The heartfelt 'I miss you' letter — the core of it all.">
                  <textarea value={mf.letterBody} onChange={(e) => updateMf("letterBody", e.target.value)} rows={5} placeholder="It's late here and I miss you…" className={INPUT_CLS + " resize-none"} />
                </Field>
                <Field label="Signature" hint="The sign-off above your name (e.g. Always yours).">
                  <input value={mf.signature} onChange={(e) => updateMf("signature", e.target.value)} placeholder="Always yours," className={INPUT_CLS} />
                </Field>

                <Field label="Voice note (optional)" hint="Record/upload your voice — plays on the letter. The most emotional upgrade.">
                  <VoiceRecorder value={mf.voiceUrl} onChange={(url) => updateMf("voiceUrl", url)} />
                </Field>

                {/* Distance */}
                <div className="rounded-2xl border border-border/50 p-3.5 space-y-3" style={{ background: LIGHT.surfaceAlt }}>
                  <div className="text-sm font-bold" style={{ color: INDIGO }}>The distance</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Your city" hint="Sets your clock + the distance.">
                      <select value={mf.yourCity} onChange={(e) => updateMf("yourCity", e.target.value)} className={INPUT_CLS}>
                        {CITY_PRESETS.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                      </select>
                    </Field>
                    <Field label="Their city" hint="Sets their clock (DST-correct) + the distance.">
                      <select value={mf.theirCity} onChange={(e) => updateMf("theirCity", e.target.value)} className={INPUT_CLS}>
                        {CITY_PRESETS.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Reunion date" hint="When you'll be together again — powers the countdown. Leave empty to hide it.">
                      <input type="datetime-local" value={toLocalInput(mf.reunionDate)} onChange={(e) => updateMf("reunionDate", e.target.value ? new Date(e.target.value).toISOString() : "")} className={INPUT_CLS} />
                    </Field>
                    <Field label="Units" hint="Show the distance in km or miles.">
                      <div className="flex gap-2">
                        {(["km", "mi"] as const).map((u) => (
                          <button key={u} type="button" onClick={() => updateMf("distanceUnit", u)}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold"
                            style={{ background: mf.distanceUnit === u ? INDIGO : "#fff", color: mf.distanceUnit === u ? "#fff" : LIGHT.muted, border: `1.5px solid ${mf.distanceUnit === u ? INDIGO : LIGHT.border}` }}>
                            {u}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Memories */}
                <Field label="Our memories (up to 6)" hint="Photos + handwritten captions.">
                  <div className="space-y-2">
                    {mf.memories.map((m, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border/50 shrink-0 grid place-items-center bg-muted/40">
                          {m.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.image} alt="" className="w-full h-full object-cover" />
                          ) : <Camera size={16} className="text-muted-foreground" />}
                        </div>
                        <input value={m.caption} onChange={(e) => updateMemory(i, { caption: e.target.value })} placeholder="caption…" className={INPUT_SM + " flex-1"} />
                        <button onClick={() => removeMemory(i)} aria-label="Remove memory" className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    {mf.memories.length < 6 && (
                      <button onClick={() => memImgRef.current?.click()} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INDIGO }}><Plus size={14} /> Add photo</button>
                    )}
                    <input ref={memImgRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addMemory(e.target.files); e.target.value = ""; }} />
                  </div>
                </Field>

                {/* Secret */}
                <Field label="A secret" hint="Hidden under the scratch card — a confession or inside joke.">
                  <textarea value={mf.secret} onChange={(e) => updateMf("secret", e.target.value)} rows={2} placeholder="What you didn't say out loud…" className={INPUT_CLS + " resize-none"} />
                </Field>

                {/* Open When */}
                <Field label="Open When… notes" hint="Labelled notes for their hard moments.">
                  <div className="space-y-3">
                    {mf.openWhen.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={n.label} onChange={(e) => updateNote(i, { label: e.target.value })} placeholder="open when you…" className={INPUT_SM + " flex-1"} />
                          <button onClick={() => removeNote(i)} aria-label="Remove note" className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground"><Trash2 size={14} /></button>
                        </div>
                        <textarea value={n.text} onChange={(e) => updateNote(i, { text: e.target.value })} rows={2} placeholder="the note inside…" className={INPUT_SM + " resize-none"} />
                      </div>
                    ))}
                    {mf.openWhen.length < 6 && <button onClick={addNote} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INDIGO }}><Plus size={14} /> Add note</button>}
                  </div>
                </Field>

                {/* Quiz */}
                <Field label="Remember-us quiz" hint="Flip-cards: a question, the real answer, and a one-line memory.">
                  <div className="space-y-3">
                    {mf.quiz.map((q, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={q.question} onChange={(e) => updateQuiz(i, { question: e.target.value })} placeholder="question…" className={INPUT_SM + " flex-1"} />
                          <button onClick={() => removeQuiz(i)} aria-label="Remove quiz card" className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground"><Trash2 size={14} /></button>
                        </div>
                        <input value={q.answer} onChange={(e) => updateQuiz(i, { answer: e.target.value })} placeholder="answer…" className={INPUT_SM} />
                        <input value={q.memory} onChange={(e) => updateQuiz(i, { memory: e.target.value })} placeholder="a one-line memory…" className={INPUT_SM} />
                      </div>
                    ))}
                    {mf.quiz.length < 5 && <button onClick={addQuiz} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: INDIGO }}><Plus size={14} /> Add card</button>}
                  </div>
                </Field>

                {/* Music */}
                <Field label="Song link (optional)" hint="A direct audio URL (mp3) that loops softly, muted by default.">
                  <div className="relative">
                    <Music size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={mf.backgroundMusic} onChange={(e) => updateMf("backgroundMusic", e.target.value)} placeholder="https://…/song.mp3" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                {/* Accent tint */}
                <Field label="Accent tint" hint="A small on-theme accent for the night layer.">
                  <div className="flex gap-2">
                    {(["indigo", "pink"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => updateMf("accentTint", t)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold capitalize"
                        style={{ background: mf.accentTint === t ? (t === "pink" ? LIGHT.pinkDark : INDIGO) : "#fff", color: mf.accentTint === t ? "#fff" : LIGHT.muted, border: `1.5px solid ${mf.accentTint === t ? (t === "pink" ? LIGHT.pinkDark : INDIGO) : LIGHT.border}` }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Password */}
                <Field label="Password (optional)" hint="If set, the shared link asks for this password before opening.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                <button onClick={onSave} disabled={saving || !mf.senderName.trim()}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: BRAND_GRADIENT }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save & Preview</>}
                </button>
                <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <Heart size={10} /> Publish from the preview to get your shareable link
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
