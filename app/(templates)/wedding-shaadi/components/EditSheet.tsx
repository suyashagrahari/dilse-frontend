"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Eye } from "lucide-react";
import type { WeddingData, EditMode } from "./types";
import { GOLD_GRADIENT, AMBER_GRADIENT } from "./styles";

const MANUAL_STEPS = ["Names", "Details", "Message", "Gallery"];

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
  mf: WeddingData;
  manualStep: number;
  setManualStep: (v: number) => void;
  updateMf: (key: keyof WeddingData, val: unknown) => void;
  onStartAi: () => void;
  onStartManual: () => void;
  onAiGenerate: () => void;
  onManualPreview: () => void;
}

export default memo(function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  mf, manualStep, setManualStep, updateMf,
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
        <h3 className="text-lg font-bold">Customize Your Invitation</h3>
        <button onClick={() => setEditMode(null)} className="p-1 text-muted-foreground"><X size={20} /></button>
      </div>
      <div className="space-y-3">
        <button
          onClick={onStartAi}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/15 dark:to-yellow-500/15 border border-amber-200/50 dark:border-amber-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GRADIENT }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Generate with AI</p>
            <p className="text-xs text-muted-foreground mt-0.5">Describe your wedding & AI creates the invitation</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={onStartManual}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/15 dark:to-amber-500/15 border border-yellow-200/50 dark:border-yellow-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD_GRADIENT }}>
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
        <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles size={16} className="text-amber-500" /> AI Magic</h3>
      </div>
      <div className="space-y-4">
        <FieldGroup label="Bride Name *">
          <input value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="e.g. Priya" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 dark:focus:border-amber-700 focus:outline-none text-sm transition-all" />
        </FieldGroup>
        <FieldGroup label="Groom Name *">
          <input value={aiSender} onChange={(e) => setAiSender(e.target.value)} placeholder="e.g. Rahul" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 dark:focus:border-amber-700 focus:outline-none text-sm transition-all" />
        </FieldGroup>
        <FieldGroup label="Describe your wedding *">
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. A royal Rajasthani wedding in Jaipur with traditional ceremonies..." rows={4} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 dark:focus:border-amber-700 focus:outline-none text-sm transition-all resize-none" />
        </FieldGroup>
        <button
          onClick={onGenerate}
          disabled={aiLoading || !aiName.trim() || !aiPrompt.trim()}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          style={{ background: AMBER_GRADIENT }}
        >
          {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Invitation ✨</>}
        </button>
      </div>
    </div>
  );
}

function ManualPanel({
  setEditMode, mf, manualStep, setManualStep, updateMf, onPreview,
}: {
  setEditMode: (m: EditMode) => void;
  mf: WeddingData; manualStep: number; setManualStep: (v: number) => void;
  updateMf: (key: keyof WeddingData, val: unknown) => void;
  onPreview: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2"><PenLine size={16} className="text-amber-500" /> Manual Edit</h3>
      </div>

      <div className="flex gap-1 mb-6">
        {MANUAL_STEPS.map((s, i) => (
          <button key={s} onClick={() => setManualStep(i)} className={`flex-1 h-1 rounded-full transition-all ${i <= manualStep ? "bg-amber-500" : "bg-border"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {manualStep === 0 && <NamesStep key="s0" mf={mf} updateMf={updateMf} />}
        {manualStep === 1 && <DetailsStep key="s1" mf={mf} updateMf={updateMf} />}
        {manualStep === 2 && <MessageStep key="s2" mf={mf} updateMf={updateMf} />}
        {manualStep === 3 && <GalleryStep key="s3" />}
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        {manualStep > 0 && (
          <button onClick={() => setManualStep(manualStep - 1)} className="w-11 h-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground">
            <ChevronLeft size={18} />
          </button>
        )}
        {manualStep < 3 ? (
          <button onClick={() => setManualStep(manualStep + 1)} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5" style={{ background: GOLD_GRADIENT }}>
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={onPreview} disabled={!mf.brideName.trim()} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ background: GOLD_GRADIENT }}>
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

function NamesStep({ mf, updateMf }: { mf: WeddingData; updateMf: (k: keyof WeddingData, v: unknown) => void }) {
  return (
    <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="Bride Name *">
        <input value={mf.brideName} onChange={(e) => updateMf("brideName", e.target.value)} placeholder="e.g. Priya" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Groom Name *">
        <input value={mf.groomName} onChange={(e) => updateMf("groomName", e.target.value)} placeholder="e.g. Rahul" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm" />
      </FieldGroup>
    </motion.div>
  );
}

function DetailsStep({ mf, updateMf }: { mf: WeddingData; updateMf: (k: keyof WeddingData, v: unknown) => void }) {
  return (
    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="Wedding Date">
        <input type="datetime-local" value={mf.weddingDate.slice(0, 16)} onChange={(e) => updateMf("weddingDate", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Venue / City">
        <input value={mf.venue} onChange={(e) => updateMf("venue", e.target.value)} placeholder="e.g. Jaipur" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Hindi Blessing">
        <input value={mf.blessing} onChange={(e) => updateMf("blessing", e.target.value)} placeholder="e.g. ॐ शुभ विवाह" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm" />
      </FieldGroup>
    </motion.div>
  );
}

function MessageStep({ mf, updateMf }: { mf: WeddingData; updateMf: (k: keyof WeddingData, v: unknown) => void }) {
  return (
    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="Bride Description">
        <textarea value={mf.bride.description} onChange={(e) => updateMf("bride", { ...mf.bride, description: e.target.value })} rows={3} placeholder="About the bride..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm resize-none" />
      </FieldGroup>
      <FieldGroup label="Groom Description">
        <textarea value={mf.groom.description} onChange={(e) => updateMf("groom", { ...mf.groom, description: e.target.value })} rows={3} placeholder="About the groom..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-300 focus:outline-none text-sm resize-none" />
      </FieldGroup>
    </motion.div>
  );
}

function GalleryStep() {
  return (
    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-xs text-muted-foreground text-center py-4">
        Gallery photos can be customized after publishing. Click Preview to see your invitation.
      </p>
    </motion.div>
  );
}
