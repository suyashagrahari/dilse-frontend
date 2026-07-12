"use client";

import { memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PenLine, Eye, Camera, Trash2, Plus, Lock, Mail, Loader2, Heart, Sparkles, Info,
} from "lucide-react";
import type { ApologyData, EditMode, BriberyItem, TimelineNode } from "./types";
import { RELATIONSHIPS, MUSIC_PRESETS } from "./types";
import VoiceRecorder from "./VoiceRecorder";

const ROSE = "#e64072";
const ROSE_GRADIENT = "linear-gradient(135deg,#ff7aa8,#e64072)";

const INPUT_CLS = "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm transition-all";
const INPUT_SM = "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none text-sm";

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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <span>{label}</span>
        {hint && (
          <span title={hint} aria-label={hint} className="inline-grid place-items-center w-4 h-4 rounded-full cursor-help shrink-0" style={{ background: "rgba(230,64,114,.12)", color: ROSE }}>
            <Info size={11} />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function fileToDataUrl(file: File, cb: (src: string) => void, maxMb = 6) {
  if (file.size > maxMb * 1024 * 1024) {
    alert(`Image too large. Please use one under ${maxMb}MB.`);
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => cb(e.target?.result as string);
  reader.readAsDataURL(file);
}

function SinglePhoto({ photo, onUpload, onRemove }: { photo: string; onUpload: (f: File) => void; onRemove: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => ref.current?.click()}
        className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/60 hover:border-rose-400/60 cursor-pointer overflow-hidden grid place-items-center shrink-0"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <Camera size={20} className="text-muted-foreground" />
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); e.target.value = ""; }} />
      </div>
      {photo && (
        <button onClick={onRemove} className="text-xs text-muted-foreground border border-border/50 rounded-full px-3 py-1.5">Remove</button>
      )}
    </div>
  );
}

export default memo(function EditSheet({ editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving }: Props) {
  const visible = editMode !== null && editMode !== "preview";
  const facesRef = useRef<HTMLInputElement>(null);

  const addFaces = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 6).forEach((f) =>
      fileToDataUrl(f, (src) => updateMf("whackFaces", [...mf.whackFaces, src]), 6),
    );
  };
  const removeFace = (i: number) => updateMf("whackFaces", mf.whackFaces.filter((_, idx) => idx !== i));

  const scratchImgRef = useRef<HTMLInputElement>(null);
  const addScratchImgs = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 4).forEach((f) =>
      fileToDataUrl(f, (src) => updateMf("scratchImages", [...mf.scratchImages, src]), 6),
    );
  };
  const removeScratchImg = (i: number) => updateMf("scratchImages", mf.scratchImages.filter((_, idx) => idx !== i));

  const updateBribe = (i: number, patch: Partial<BriberyItem>) =>
    updateMf("briberyItems", mf.briberyItems.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const addBribe = () => updateMf("briberyItems", [...mf.briberyItems, { icon: "💝", label: "" }]);
  const removeBribe = (i: number) => updateMf("briberyItems", mf.briberyItems.filter((_, idx) => idx !== i));

  const updateNode = (i: number, patch: Partial<TimelineNode>) =>
    updateMf("timeline", mf.timeline.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  const addNode = () => updateMf("timeline", [...mf.timeline, { icon: "⭐", title: "", text: "" }]);
  const removeNode = (i: number) => updateMf("timeline", mf.timeline.filter((_, idx) => idx !== i));

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditMode("preview")} className="fixed inset-0 z-[60] bg-black/50" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div className="w-full max-w-2xl max-h-[82vh] lg:max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto">
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-5 pb-8 pt-2 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <PenLine size={16} style={{ color: ROSE }} /> Build your apology
                  </h3>
                  <button onClick={() => setEditMode("preview")} className="p-1 text-muted-foreground"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Your name *" hint="The person apologising — that's you.">
                    <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Aarav" className={INPUT_CLS} />
                  </Field>
                  <Field label="Their name" hint="Who you're apologising to (your gf / bf / partner).">
                    <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Aditi" className={INPUT_CLS} />
                  </Field>
                </div>

                <Field label="Relationship" hint="Pick girlfriend / boyfriend / partner — it tailors the wording and the game name.">
                  <select value={mf.relationship} onChange={(e) => updateMf("relationship", e.target.value)} className={INPUT_CLS}>
                    {RELATIONSHIPS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </Field>

                <Field label="Headline" hint="The big title on the very first page.">
                  <input value={mf.headline} onChange={(e) => updateMf("headline", e.target.value)} placeholder="I'm really, really sorry 🥺" className={INPUT_CLS} />
                </Field>

                <Field label="Sub-message" hint="The small line shown under the headline.">
                  <textarea value={mf.subMessage} onChange={(e) => updateMf("subMessage", e.target.value)} rows={2} className={INPUT_CLS + " resize-none"} />
                </Field>

                <Field label="Your sorry letter" hint="Your heartfelt apology — shown on its own page.">
                  <textarea value={mf.sorryLetter} onChange={(e) => updateMf("sorryLetter", e.target.value)} rows={4} placeholder="Say what's in your heart…" className={INPUT_CLS + " resize-none"} />
                </Field>

                <Field label="Your photo" hint="A photo of YOU — shown in the header at the top.">
                  <SinglePhoto photo={mf.senderPhoto} onUpload={(f) => fileToDataUrl(f, (src) => updateMf("senderPhoto", src))} onRemove={() => updateMf("senderPhoto", "")} />
                </Field>

                <Field label="Whack game faces (optional)" hint="Photo(s) of the one being whacked (the one apologising). No photos → cute emoji faces are used.">
                  <div className="flex flex-wrap gap-2">
                    {mf.whackFaces.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeFace(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white grid place-items-center text-[10px]">×</button>
                      </div>
                    ))}
                    <button onClick={() => facesRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-border/60 grid place-items-center text-muted-foreground">
                      <Plus size={18} />
                    </button>
                    <input ref={facesRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFaces(e.target.files); e.target.value = ""; }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">No photos → cute emoji faces are used instead.</p>
                </Field>

                <Field label="Voice apology (optional)" hint="Record/upload your voice — plays on the shared page.">
                  <VoiceRecorder value={mf.voiceUrl} onChange={(url) => updateMf("voiceUrl", url)} />
                </Field>

                {/* Scratch-card reveal: note + photos + voice */}
                <div className="rounded-2xl border border-border/50 p-3.5 space-y-3" style={{ background: "#fff7f9" }}>
                  <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: ROSE }}>
                    <Sparkles size={14} /> A tiny secret (revealed after scratching)
                  </div>

                  <Field label="Little note" hint="A short, sweet line hidden under the scratch card.">
                    <textarea value={mf.scratchSecret} onChange={(e) => updateMf("scratchSecret", e.target.value)} rows={2} placeholder="A short, sweet line to hide under the scratch…" className={INPUT_CLS + " resize-none"} />
                  </Field>

                  <Field label="Photos to reveal (optional)" hint="Photo(s) revealed after the recipient scratches the card.">
                    <div className="flex flex-wrap gap-2">
                      {mf.scratchImages.map((src, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removeScratchImg(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white grid place-items-center text-[10px]">×</button>
                        </div>
                      ))}
                      {mf.scratchImages.length < 4 && (
                        <button onClick={() => scratchImgRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-border/60 grid place-items-center text-muted-foreground">
                          <Plus size={18} />
                        </button>
                      )}
                      <input ref={scratchImgRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addScratchImgs(e.target.files); e.target.value = ""; }} />
                    </div>
                  </Field>

                  <Field label="Voice note (optional)" hint="A short voice note revealed after scratching.">
                    <VoiceRecorder value={mf.scratchVoice} onChange={(url) => updateMf("scratchVoice", url)} />
                  </Field>
                </div>

                {/* Background music */}
                <Field label="Background music" hint="The song that plays on the shared page (default: Sorry).">
                  <div className="space-y-2">
                    {MUSIC_PRESETS.map((m) => {
                      const on = mf.backgroundMusic === m.url;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updateMf("backgroundMusic", m.url)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors"
                          style={{ border: `1.5px solid ${on ? ROSE : "#fce7f0"}`, background: on ? "#fff0f4" : "#fff" }}
                        >
                          <span className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ border: `2px solid ${on ? ROSE : "#d9c3cc"}` }}>
                            {on && <span className="w-2.5 h-2.5 rounded-full" style={{ background: ROSE }} />}
                          </span>
                          <span className="text-lg">🎵</span>
                          <span className="flex-1 text-sm font-medium">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Bribery items */}
                <Field label="Sweet Bribery Desk" hint="Promises you offer — these become the conditions in the forgiveness deed.">
                  <div className="space-y-2">
                    {mf.briberyItems.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input value={b.icon} onChange={(e) => updateBribe(i, { icon: e.target.value })} className={INPUT_SM + " w-14 text-center"} maxLength={2} />
                        <input value={b.label} onChange={(e) => updateBribe(i, { label: e.target.value })} placeholder="Promise…" className={INPUT_SM + " flex-1"} />
                        <button onClick={() => removeBribe(i)} className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={addBribe} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ROSE }}><Plus size={14} /> Add promise</button>
                  </div>
                </Field>

                {/* Timeline */}
                <Field label="Memory Lane timeline" hint="Little chapters of your story, shown as a timeline.">
                  <div className="space-y-3">
                    {mf.timeline.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={n.icon} onChange={(e) => updateNode(i, { icon: e.target.value })} className={INPUT_SM + " w-14 text-center"} maxLength={2} />
                          <input value={n.title} onChange={(e) => updateNode(i, { title: e.target.value })} placeholder="Chapter title" className={INPUT_SM + " flex-1"} />
                          <button onClick={() => removeNode(i)} className="w-9 h-9 rounded-lg border border-border/50 grid place-items-center text-muted-foreground hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                        <textarea value={n.text} onChange={(e) => updateNode(i, { text: e.target.value })} rows={2} placeholder="A little memory…" className={INPUT_SM + " resize-none"} />
                      </div>
                    ))}
                    <button onClick={addNode} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: ROSE }}><Plus size={14} /> Add chapter</button>
                  </div>
                </Field>

                {/* Delivery email */}
                <Field label="Delivery email *" hint="Where the signed agreement PDF is emailed once they forgive you.">
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={mf.deliveryEmail} onChange={(e) => updateMf("deliveryEmail", e.target.value)} placeholder="you@email.com" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                {/* Password */}
                <Field label="Password (optional)" hint="If set, the shared link asks for this password before opening.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !mf.senderName.trim()}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: ROSE_GRADIENT }}
                >
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
