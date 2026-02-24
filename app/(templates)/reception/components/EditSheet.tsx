"use client";

import { memo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Eye,
  Upload, ImagePlus, ScanLine, Trash2,
} from "lucide-react";
import Image from "next/image";
import type { ReceptionData, EditMode } from "./types";

const MANUAL_STEPS = ["Names", "Details", "Photos", "Descriptions", "Gallery"];
const GOLD = "linear-gradient(135deg, #C9A84C, #E8D5A3, #C9A84C)";
const AMBER = "linear-gradient(90deg, #C9A84C, #A68636)";

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
  extractLoading: boolean;
  mf: ReceptionData;
  manualStep: number;
  setManualStep: (v: number) => void;
  updateMf: (key: keyof ReceptionData, val: unknown) => void;
  onStartAiText: () => void;
  onStartAiCard: () => void;
  onStartManual: () => void;
  onCardExtract: (images: string[]) => void;
  onAiGenerate: () => void;
  onAiEditPreview: () => void;
  onManualPreview: () => void;
}

export default memo(function EditSheet({
  editMode, setEditMode,
  aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt, aiLoading,
  extractLoading,
  mf, manualStep, setManualStep, updateMf,
  onStartAiText, onStartAiCard, onStartManual,
  onCardExtract, onAiGenerate, onAiEditPreview, onManualPreview,
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
            className="fixed inset-0 z-50 bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto bg-background rounded-t-3xl shadow-2xl safe-bottom lg:left-1/2 lg:-translate-x-1/2 lg:max-w-xl"
          >
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {editMode === "choose" && (
              <ChoosePanel
                setEditMode={setEditMode}
                onStartAiText={onStartAiText}
                onStartAiCard={onStartAiCard}
                onStartManual={onStartManual}
              />
            )}
            {editMode === "ai-card" && (
              <AiCardPanel
                setEditMode={setEditMode}
                extractLoading={extractLoading}
                onExtract={onCardExtract}
              />
            )}
            {editMode === "ai-text" && (
              <AiTextPanel
                setEditMode={setEditMode}
                aiName={aiName} setAiName={setAiName}
                aiSender={aiSender} setAiSender={setAiSender}
                aiPrompt={aiPrompt} setAiPrompt={setAiPrompt}
                aiLoading={aiLoading} onGenerate={onAiGenerate}
                mf={mf} updateMf={updateMf}
              />
            )}
            {editMode === "ai-edit" && (
              <AiEditPanel
                setEditMode={setEditMode}
                mf={mf} updateMf={updateMf}
                onPreview={onAiEditPreview}
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

// ── Choose panel ───────────────────────────────────────────────────────────────
function ChoosePanel({
  setEditMode, onStartAiText, onStartAiCard, onStartManual,
}: {
  setEditMode: (m: EditMode) => void;
  onStartAiText: () => void;
  onStartAiCard: () => void;
  onStartManual: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Customize Your Invitation</h3>
        <button onClick={() => setEditMode(null)} className="p-1 text-muted-foreground"><X size={20} /></button>
      </div>
      <div className="space-y-3">
        <button
          onClick={onStartAiCard}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-800/20 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
            <ScanLine size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Upload Reception Card</p>
            <p className="text-xs text-muted-foreground mt-0.5">AI reads your invitation card & fills everything</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={onStartAiText}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-800/20 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Generate with AI</p>
            <p className="text-xs text-muted-foreground mt-0.5">Describe your reception & AI creates the content</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
        <button
          onClick={onStartManual}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-800/20 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: GOLD }}>
            <PenLine size={20} style={{ color: "#080808" }} />
          </div>
          <div>
            <p className="font-bold text-sm">Write Manually</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in every detail & upload photos yourself</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ── AI Card panel ──────────────────────────────────────────────────────────────
function AiCardPanel({
  setEditMode, extractLoading, onExtract,
}: {
  setEditMode: (m: EditMode) => void;
  extractLoading: boolean;
  onExtract: (images: string[]) => void;
}) {
  const [images, setImages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 3 - images.length).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) return; // 10MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ScanLine size={16} style={{ color: "#7c3aed" }} /> Scan Reception Card
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Upload up to 3 photos of your reception invitation card. AI will extract all the details automatically.</p>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border/50 rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-amber-600/50 transition-colors mb-4"
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed22, #a855f722)" }}>
          <ImagePlus size={24} style={{ color: "#7c3aed" }} />
        </div>
        <p className="text-sm font-medium">Tap to upload card images</p>
        <p className="text-xs text-muted-foreground">JPG, PNG • Up to 10MB each • Max 3 images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden">
              <Image src={img} alt={`Card ${i + 1}`} fill className="object-cover" />
              <button
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
              >
                <Trash2 size={10} className="text-white" />
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-1 hover:border-amber-600/50 transition-colors"
            >
              <ImagePlus size={20} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add more</span>
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => onExtract(images)}
        disabled={images.length === 0 || extractLoading}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff" }}
      >
        {extractLoading
          ? <><Loader2 size={16} className="animate-spin" /> Extracting details...</>
          : <><ScanLine size={16} /> Extract from Card</>
        }
      </button>
    </div>
  );
}

// ── AI Text panel ──────────────────────────────────────────────────────────────
function AiTextPanel({
  setEditMode, aiName, setAiName, aiSender, setAiSender, aiPrompt, setAiPrompt,
  aiLoading, onGenerate, mf, updateMf,
}: {
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean; onGenerate: () => void;
  mf: ReceptionData;
  updateMf: (key: keyof ReceptionData, val: unknown) => void;
}) {
  const handlePhotoUpload = (person: "bride" | "groom", file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (person === "bride") updateMf("bride", { ...mf.bride, photo: result });
        else updateMf("groom", { ...mf.groom, photo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles size={16} style={{ color: "#C9A84C" }} /> AI Generate</h3>
      </div>
      <div className="space-y-4">
        <FieldGroup label="Bride Name *">
          <input
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
            placeholder="e.g. Priya"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm transition-all"
          />
        </FieldGroup>
        <FieldGroup label="Groom Name">
          <input
            value={aiSender}
            onChange={(e) => setAiSender(e.target.value)}
            placeholder="e.g. Arjun"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm transition-all"
          />
        </FieldGroup>
        {/* Photo upload */}
        <div className="grid grid-cols-2 gap-3">
          <PhotoUpload
            label="Bride Photo"
            photo={mf.bride.photo}
            onUpload={(f) => handlePhotoUpload("bride", f)}
            onRemove={() => updateMf("bride", { ...mf.bride, photo: "" })}
          />
          <PhotoUpload
            label="Groom Photo"
            photo={mf.groom.photo}
            onUpload={(f) => handlePhotoUpload("groom", f)}
            onRemove={() => updateMf("groom", { ...mf.groom, photo: "" })}
          />
        </div>
        <FieldGroup label="Describe your reception *">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. A luxury evening reception at a 5-star hotel in Jaipur, traditional Rajasthani theme..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm transition-all resize-none"
          />
        </FieldGroup>
        <button
          onClick={onGenerate}
          disabled={aiLoading || !aiName.trim() || !aiPrompt.trim()}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          style={{ background: AMBER, color: "#fff" }}
        >
          {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate &amp; Review</>}
        </button>
      </div>
    </div>
  );
}

// ── AI Edit (review) panel ─────────────────────────────────────────────────────
function AiEditPanel({
  setEditMode, mf, updateMf, onPreview,
}: {
  setEditMode: (m: EditMode) => void;
  mf: ReceptionData;
  updateMf: (key: keyof ReceptionData, val: unknown) => void;
  onPreview: () => void;
}) {
  const handlePhotoUpload = (person: "bride" | "groom", file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (person === "bride") updateMf("bride", { ...mf.bride, photo: result });
        else updateMf("groom", { ...mf.groom, photo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye size={16} style={{ color: "#C9A84C" }} /> Review &amp; Edit
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5 ml-8">Check and tweak the details before previewing.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label="Bride Name *">
            <input
              value={mf.brideName}
              onChange={(e) => updateMf("brideName", e.target.value)}
              placeholder="Bride"
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
            />
          </FieldGroup>
          <FieldGroup label="Groom Name">
            <input
              value={mf.groomName}
              onChange={(e) => updateMf("groomName", e.target.value)}
              placeholder="Groom"
              className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
            />
          </FieldGroup>
        </div>
        <FieldGroup label="Tagline">
          <input
            value={mf.tagline}
            onChange={(e) => updateMf("tagline", e.target.value)}
            placeholder="Request the pleasure of your company"
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
          />
        </FieldGroup>
        <FieldGroup label="Reception Date & Time">
          <input
            type="datetime-local"
            value={mf.receptionDate?.slice(0, 16) || ""}
            onChange={(e) => updateMf("receptionDate", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
          />
        </FieldGroup>
        <FieldGroup label="Venue Name">
          <input
            value={mf.venue}
            onChange={(e) => updateMf("venue", e.target.value)}
            placeholder="e.g. The Grand Ballroom"
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
          />
        </FieldGroup>
        <FieldGroup label="Venue Address">
          <input
            value={mf.venueAddress}
            onChange={(e) => updateMf("venueAddress", e.target.value)}
            placeholder="e.g. Royal Palace Hotel, Jaipur"
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
          />
        </FieldGroup>
        <FieldGroup label="Timings">
          <input
            value={mf.venueTimings}
            onChange={(e) => updateMf("venueTimings", e.target.value)}
            placeholder="e.g. 7:00 PM — 11:30 PM"
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm"
          />
        </FieldGroup>
        <FieldGroup label="About the Bride">
          <textarea
            value={mf.bride.description}
            onChange={(e) => updateMf("bride", { ...mf.bride, description: e.target.value })}
            rows={2}
            placeholder="A beautiful description..."
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm resize-none"
          />
        </FieldGroup>
        <FieldGroup label="About the Groom">
          <textarea
            value={mf.groom.description}
            onChange={(e) => updateMf("groom", { ...mf.groom, description: e.target.value })}
            rows={2}
            placeholder="A beautiful description..."
            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm resize-none"
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <PhotoUpload
            label="Bride Photo"
            photo={mf.bride.photo}
            onUpload={(f) => handlePhotoUpload("bride", f)}
            onRemove={() => updateMf("bride", { ...mf.bride, photo: "" })}
          />
          <PhotoUpload
            label="Groom Photo"
            photo={mf.groom.photo}
            onUpload={(f) => handlePhotoUpload("groom", f)}
            onRemove={() => updateMf("groom", { ...mf.groom, photo: "" })}
          />
        </div>
        <button
          onClick={onPreview}
          disabled={!mf.brideName.trim()}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          style={{ background: GOLD, color: "#080808" }}
        >
          <Eye size={16} /> Preview Invitation
        </button>
      </div>
    </div>
  );
}

// ── Manual panel ───────────────────────────────────────────────────────────────
function ManualPanel({
  setEditMode, mf, manualStep, setManualStep, updateMf, onPreview,
}: {
  setEditMode: (m: EditMode) => void;
  mf: ReceptionData; manualStep: number; setManualStep: (v: number) => void;
  updateMf: (key: keyof ReceptionData, val: unknown) => void;
  onPreview: () => void;
}) {
  return (
    <div className="px-5 pb-8 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
        <h3 className="text-lg font-bold flex items-center gap-2"><PenLine size={16} style={{ color: "#C9A84C" }} /> Manual Edit</h3>
      </div>
      <div className="flex gap-1 mb-6">
        {MANUAL_STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setManualStep(i)}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= manualStep ? "#C9A84C" : "hsl(var(--border))" }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {manualStep === 0 && <NamesStep key="s0" mf={mf} updateMf={updateMf} />}
        {manualStep === 1 && <DetailsStep key="s1" mf={mf} updateMf={updateMf} />}
        {manualStep === 2 && <PhotosStep key="s2" mf={mf} updateMf={updateMf} />}
        {manualStep === 3 && <DescriptionsStep key="s3" mf={mf} updateMf={updateMf} />}
        {manualStep === 4 && <GalleryStep key="s4" mf={mf} updateMf={updateMf} />}
      </AnimatePresence>
      <div className="flex gap-3 mt-6">
        {manualStep > 0 && (
          <button
            onClick={() => setManualStep(manualStep - 1)}
            className="w-11 h-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {manualStep < MANUAL_STEPS.length - 1 ? (
          <button
            onClick={() => setManualStep(manualStep + 1)}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
            style={{ background: GOLD, color: "#080808" }}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onPreview}
            disabled={!mf.brideName.trim()}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ background: GOLD, color: "#080808" }}
          >
            <Eye size={16} /> Preview
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step components ────────────────────────────────────────────────────────────
function NamesStep({ mf, updateMf }: { mf: ReceptionData; updateMf: (k: keyof ReceptionData, v: unknown) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="Bride Name *">
        <input value={mf.brideName} onChange={(e) => updateMf("brideName", e.target.value)} placeholder="e.g. Priya" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Groom Name *">
        <input value={mf.groomName} onChange={(e) => updateMf("groomName", e.target.value)} placeholder="e.g. Arjun" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Bride's Family">
        <input value={mf.families.bride} onChange={(e) => updateMf("families", { ...mf.families, bride: e.target.value })} placeholder="e.g. Shri Rajesh Sharma & Smt. Sunita Sharma" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Groom's Family">
        <input value={mf.families.groom} onChange={(e) => updateMf("families", { ...mf.families, groom: e.target.value })} placeholder="e.g. Shri Vikram Verma & Smt. Meena Verma" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
    </motion.div>
  );
}

function DetailsStep({ mf, updateMf }: { mf: ReceptionData; updateMf: (k: keyof ReceptionData, v: unknown) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="Tagline">
        <input value={mf.tagline} onChange={(e) => updateMf("tagline", e.target.value)} placeholder="Request the pleasure of your company" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Reception Date & Time">
        <input type="datetime-local" value={mf.receptionDate?.slice(0, 16) || ""} onChange={(e) => updateMf("receptionDate", e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Venue Name">
        <input value={mf.venue} onChange={(e) => updateMf("venue", e.target.value)} placeholder="e.g. The Grand Ballroom" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Venue Address">
        <input value={mf.venueAddress} onChange={(e) => updateMf("venueAddress", e.target.value)} placeholder="e.g. Royal Palace Hotel, Jaipur, Rajasthan" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
      <FieldGroup label="Timings">
        <input value={mf.venueTimings} onChange={(e) => updateMf("venueTimings", e.target.value)} placeholder="e.g. 7:00 PM — 11:30 PM" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm" />
      </FieldGroup>
    </motion.div>
  );
}

function PhotosStep({ mf, updateMf }: { mf: ReceptionData; updateMf: (k: keyof ReceptionData, v: unknown) => void }) {
  const handlePhoto = (person: "bride" | "groom", file: File) => {
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (person === "bride") updateMf("bride", { ...mf.bride, photo: result });
        else updateMf("groom", { ...mf.groom, photo: result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <p className="text-xs text-muted-foreground">Upload photos of the couple (optional)</p>
      <div className="grid grid-cols-2 gap-4">
        <PhotoUpload
          label="Bride Photo"
          photo={mf.bride.photo}
          onUpload={(f) => handlePhoto("bride", f)}
          onRemove={() => updateMf("bride", { ...mf.bride, photo: "" })}
        />
        <PhotoUpload
          label="Groom Photo"
          photo={mf.groom.photo}
          onUpload={(f) => handlePhoto("groom", f)}
          onRemove={() => updateMf("groom", { ...mf.groom, photo: "" })}
        />
      </div>
    </motion.div>
  );
}

function DescriptionsStep({ mf, updateMf }: { mf: ReceptionData; updateMf: (k: keyof ReceptionData, v: unknown) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <FieldGroup label="About the Bride">
        <textarea value={mf.bride.description} onChange={(e) => updateMf("bride", { ...mf.bride, description: e.target.value })} rows={3} placeholder="A graceful soul who..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm resize-none" />
      </FieldGroup>
      <FieldGroup label="About the Groom">
        <textarea value={mf.groom.description} onChange={(e) => updateMf("groom", { ...mf.groom, description: e.target.value })} rows={3} placeholder="A gentleman with..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-amber-600 focus:outline-none text-sm resize-none" />
      </FieldGroup>
    </motion.div>
  );
}

function GalleryStep({ mf, updateMf }: { mf: ReceptionData; updateMf: (k: keyof ReceptionData, v: unknown) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryImages = mf.galleryImages || [];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 6 - galleryImages.length;
    if (remaining <= 0) return;
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          updateMf("galleryImages", [
            ...galleryImages,
            { src, alt: file.name.replace(/\.[^.]+$/, ""), span: "", category: "couple" },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
      <p className="text-xs text-muted-foreground">Upload up to 6 gallery photos (optional)</p>
      <div className="grid grid-cols-3 gap-2">
        {galleryImages.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
            <Image src={img.src} alt={img.alt || `Photo ${i + 1}`} fill className="object-cover" />
            <button
              onClick={() => updateMf("galleryImages", galleryImages.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
            >
              <Trash2 size={9} className="text-white" />
            </button>
          </div>
        ))}
        {galleryImages.length < 6 && (
          <button
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-1 hover:border-amber-600/50 transition-colors"
          >
            <ImagePlus size={18} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function PhotoUpload({
  label, photo, onUpload, onRemove,
}: {
  label: string;
  photo: string;
  onUpload: (f: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
      <div
        onClick={() => !photo && ref.current?.click()}
        className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border/40 hover:border-amber-600/50 transition-colors cursor-pointer flex items-center justify-center"
        style={{ background: photo ? "transparent" : "hsl(var(--muted)/0.3)" }}
      >
        {photo ? (
          <>
            <Image src={photo} alt={label} fill className="object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center z-10"
            >
              <Trash2 size={9} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center z-10"
            >
              <Upload size={9} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload size={16} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Upload</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
    </div>
  );
}
