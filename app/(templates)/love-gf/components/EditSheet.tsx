"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Plus, Trash2, Eye } from "lucide-react";
import type { ContentData, EditMode } from "./types";
import { PINK_GRADIENT, VIOLET_GRADIENT } from "./styles";

const MANUAL_STEPS = ["Names", "Love Note", "Photos", "Music"];

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  aiName: string;
  setAiName: (v: string) => void;
  aiSender: string;
  setAiSender: (v: string) => void;
  aiPrompt: string;
  setAiPrompt: (v: string) => void;
  aiLoading: boolean;
  mf: ContentData;
  manualStep: number;
  setManualStep: (v: number) => void;
  photoInput: string;
  setPhotoInput: (v: string) => void;
  updateMf: (key: keyof ContentData, val: unknown) => void;
  onStartAi: () => void;
  onStartManual: () => void;
  onAiGenerate: () => void;
  onManualPreview: () => void;
}

export default memo(function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  mf, manualStep, setManualStep, photoInput, setPhotoInput, updateMf,
  onStartAi, onStartManual, onAiGenerate, onManualPreview,
}: Props) {
  const visible = editMode !== null && editMode !== "preview" && editMode !== "password";

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl shadow-2xl safe-bottom lg:left-1/2 lg:-translate-x-1/2 lg:max-w-xl"
          >
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {editMode === "choose" && <ChoosePanel setEditMode={setEditMode} onStartAi={onStartAi} onStartManual={onStartManual} />}
            {editMode === "ai" && (
              <AiPanel
                setEditMode={setEditMode}
                aiName={aiName} setAiName={setAiName}
                aiSender={aiSender} setAiSender={setAiSender}
                aiPrompt={aiPrompt} setAiPrompt={setAiPrompt}
                aiLoading={aiLoading} onGenerate={onAiGenerate}
              />
            )}
            {editMode === "manual" && (
              <ManualPanel
                setEditMode={setEditMode}
                mf={mf} manualStep={manualStep} setManualStep={setManualStep}
                photoInput={photoInput} setPhotoInput={setPhotoInput}
                updateMf={updateMf} onPreview={onManualPreview}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

function ChoosePanel({ setEditMode, onStartAi, onStartManual }: { setEditMode: (m: EditMode) => void; onStartAi: () => void; onStartManual: () => void }) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Customize Your Love Page</h3>
        <button onClick={() => setEditMode(null)} className="p-1 text-muted-foreground"><X size={20} /></button>
      </div>
      <div className="space-y-3">
        <button
          onClick={onStartAi}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-200/50 dark:border-violet-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: VIOLET_GRADIENT }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Generate with AI</p>
            <p className="text-xs text-muted-foreground mt-0.5">Describe what you want & AI creates it</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={onStartManual}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-pink-500/15 dark:to-rose-500/15 border border-pink-200/50 dark:border-pink-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: PINK_GRADIENT }}>
            <PenLine size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Write Manually</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in each field yourself</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
      </div>
    </div>
  );
}

function AiPanel({
  setEditMode, aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading, onGenerate,
}: {
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean; onGenerate: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles size={16} className="text-violet-500" /> AI Magic</h3>
      </div>
      <div className="space-y-4">
        <FieldGroup label="Their Name *">
          <input value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="e.g. Sarah" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-sm transition-all" />
        </FieldGroup>
        <FieldGroup label="Your Name">
          <input value={aiSender} onChange={(e) => setAiSender(e.target.value)} placeholder="e.g. Alex" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-sm transition-all" />
        </FieldGroup>
        <FieldGroup label="Describe what you want *">
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. A romantic love message for my girlfriend who loves stargazing..." rows={4} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-sm transition-all resize-none" />
        </FieldGroup>
        <button
          onClick={onGenerate}
          disabled={aiLoading || !aiName.trim() || !aiPrompt.trim()}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          style={{ background: VIOLET_GRADIENT }}
        >
          {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Magic ✨</>}
        </button>
      </div>
    </div>
  );
}

function ManualPanel({
  setEditMode, mf, manualStep, setManualStep, photoInput, setPhotoInput, updateMf, onPreview,
}: {
  setEditMode: (m: EditMode) => void;
  mf: ContentData; manualStep: number; setManualStep: (v: number) => void;
  photoInput: string; setPhotoInput: (v: string) => void;
  updateMf: (key: keyof ContentData, val: unknown) => void;
  onPreview: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2"><PenLine size={16} className="text-pink-500" /> Manual Edit</h3>
      </div>

      <div className="flex gap-1 mb-6">
        {MANUAL_STEPS.map((s, i) => (
          <button key={s} onClick={() => setManualStep(i)} className={`flex-1 h-1 rounded-full transition-all ${i <= manualStep ? "bg-pink-500" : "bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {manualStep === 0 && <NamesStep key="s0" mf={mf} updateMf={updateMf} />}
        {manualStep === 1 && <MessageStep key="s1" mf={mf} updateMf={updateMf} />}
        {manualStep === 2 && <PhotosStep key="s2" mf={mf} updateMf={updateMf} photoInput={photoInput} setPhotoInput={setPhotoInput} />}
        {manualStep === 3 && <MusicStep key="s3" mf={mf} updateMf={updateMf} />}
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        {manualStep > 0 && (
          <button onClick={() => setManualStep(manualStep - 1)} className="w-11 h-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground">
            <ChevronLeft size={18} />
          </button>
        )}
        {manualStep < 3 ? (
          <button onClick={() => setManualStep(manualStep + 1)} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5" style={{ background: PINK_GRADIENT }}>
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={onPreview} disabled={!mf.recipientName.trim()} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ background: PINK_GRADIENT }}>
            <Eye size={16} /> Preview
          </button>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function NamesStep({ mf, updateMf }: { mf: ContentData; updateMf: (k: keyof ContentData, v: unknown) => void }) {
  return (
    <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="Their Name *">
        <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Sarah" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-pink-300 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Your Name">
        <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Alex" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-pink-300 focus:outline-none text-sm" />
      </FieldGroup>
    </motion.div>
  );
}

function MessageStep({ mf, updateMf }: { mf: ContentData; updateMf: (k: keyof ContentData, v: unknown) => void }) {
  return (
    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <FieldGroup label="Your Love Message">
        <textarea value={mf.personalMessage} onChange={(e) => updateMf("personalMessage", e.target.value)} rows={7} placeholder="Write your heartfelt love message..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-pink-300 focus:outline-none text-sm resize-none" />
      </FieldGroup>
    </motion.div>
  );
}

function PhotosStep({ mf, updateMf, photoInput, setPhotoInput }: { mf: ContentData; updateMf: (k: keyof ContentData, v: unknown) => void; photoInput: string; setPhotoInput: (v: string) => void }) {
  const addPhoto = () => {
    if (photoInput.trim()) {
      updateMf("galleryPhotos", [...mf.galleryPhotos, photoInput.trim()]);
      setPhotoInput("");
    }
  };

  return (
    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="flex gap-2">
        <input
          value={photoInput}
          onChange={(e) => setPhotoInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addPhoto(); }}
          placeholder="Paste image URL..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-pink-300 focus:outline-none text-sm"
        />
        <button onClick={addPhoto} disabled={!photoInput.trim()} className="px-4 rounded-xl bg-pink-500 text-white disabled:opacity-30 shrink-0">
          <Plus size={16} />
        </button>
      </div>
      {mf.galleryPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mf.galleryPhotos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => updateMf("galleryPhotos", mf.galleryPhotos.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {mf.galleryPhotos.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No photos yet. Add image URLs above.</p>
      )}
    </motion.div>
  );
}

function MusicStep({ mf, updateMf }: { mf: ContentData; updateMf: (k: keyof ContentData, v: unknown) => void }) {
  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
      {mf.musicTracks.map((track, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1.5">
            <input
              value={track.title}
              onChange={(e) => { const tracks = [...mf.musicTracks]; tracks[i] = { ...tracks[i], title: e.target.value }; updateMf("musicTracks", tracks); }}
              placeholder="Song title"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:border-pink-300 focus:outline-none text-sm"
            />
            <input
              value={track.artist}
              onChange={(e) => { const tracks = [...mf.musicTracks]; tracks[i] = { ...tracks[i], artist: e.target.value }; updateMf("musicTracks", tracks); }}
              placeholder="Artist name"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:border-pink-300 focus:outline-none text-xs"
            />
          </div>
          {mf.musicTracks.length > 1 && (
            <button
              onClick={() => updateMf("musicTracks", mf.musicTracks.filter((_, j) => j !== i))}
              className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-1"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
      {mf.musicTracks.length < 8 && (
        <button
          onClick={() => updateMf("musicTracks", [...mf.musicTracks, { title: "", artist: "", duration: "3:30" }])}
          className="flex items-center gap-1.5 text-sm text-pink-500 font-semibold"
        >
          <Plus size={14} /> Add track
        </button>
      )}
    </motion.div>
  );
}
