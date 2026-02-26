"use client";

import { memo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Eye, Camera, ImagePlus, Trash2 } from "lucide-react";
import type { HoliData, EditMode } from "./types";
import { HOLI_INPUT } from "./styles";

const MANUAL_STEPS = ["Basics", "Message", "Details"];
import { API_URL, IS_NGROK } from "@/lib/config";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean;
  mf: HoliData;
  manualStep: number; setManualStep: (v: number) => void;
  updateMf: (key: keyof HoliData, val: unknown) => void;
  onStartAi: () => void; onStartManual: () => void;
  onAiGenerate: () => void; onManualPreview: () => void;
}

// Compress image to base64 via canvas — keeps file tiny for DB storage
function compressToBase64(file: File, maxPx = 300, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const sheetTitle = (mode: EditMode): string => {
  switch (mode) {
    case "choose": return "Create Your Holi Card";
    case "ai": return "AI Generation";
    case "ai-edit": return "Edit AI Content";
    case "manual": return "Manual Entry";
    default: return "Holi Card";
  }
};

export default memo(function EditSheet(props: Props) {
  const { editMode, setEditMode } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible =
    editMode === "choose" ||
    editMode === "ai" ||
    editMode === "ai-edit" ||
    editMode === "manual";

  if (!visible) return null;

  const isEditingForm = editMode === "manual" || editMode === "ai-edit";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditMode(null)} />
          <motion.div
            className="relative w-full max-w-lg rounded-t-3xl lg:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "hsl(var(--holi-card))", border: "1px solid hsl(var(--holi-border))" }}
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5 pb-3 sticky top-0 z-10"
              style={{ background: "hsl(var(--holi-card))", borderBottom: "1px solid hsl(var(--holi-border))" }}
            >
              <div>
                <h3 className="text-lg font-bold holi-text-gradient">{sheetTitle(editMode)}</h3>
                {editMode === "ai-edit" && (
                  <p className="text-xs mt-0.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                    AI generated — review & edit before saving
                  </p>
                )}
              </div>
              <button onClick={() => setEditMode(null)} style={{ color: "hsl(var(--holi-muted-fg))" }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* ── CHOOSE ── */}
              {editMode === "choose" && (
                <>
                  <button
                    onClick={props.onStartAi}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] hover:opacity-90"
                    style={{ background: "hsl(var(--holi-surface))", border: "1px solid hsl(var(--holi-border))" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--holi-gradient-cta)" }}>
                      <Sparkles size={20} style={{ color: "#fff" }} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--holi-fg))" }}>AI Generate</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Auto-create with AI magic</p>
                    </div>
                    <ChevronRight size={18} style={{ color: "hsl(var(--holi-muted-fg))" }} />
                  </button>

                  <button
                    onClick={props.onStartManual}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] hover:opacity-90"
                    style={{ background: "hsl(var(--holi-surface))", border: "1px solid hsl(var(--holi-border))" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--holi-purple)" }}>
                      <PenLine size={20} style={{ color: "#fff" }} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--holi-fg))" }}>Write Manually</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Customize every detail</p>
                    </div>
                    <ChevronRight size={18} style={{ color: "hsl(var(--holi-muted-fg))" }} />
                  </button>
                </>
              )}

              {/* ── AI MODE ── */}
              {editMode === "ai" && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "hsl(var(--holi-surface))" }}>
                    <Sparkles size={14} style={{ color: "var(--holi-pink)" }} />
                    <p className="text-xs" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                      Describe your wish and AI will generate the full Holi card
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                      Your Name <span style={{ color: "var(--holi-pink)" }}>*</span>
                    </label>
                    <input value={props.aiSender} onChange={(e) => props.setAiSender(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                      Who are you wishing?{" "}
                      <span className="font-normal opacity-60">(optional)</span>
                    </label>
                    <input value={props.aiName} onChange={(e) => props.setAiName(e.target.value)} placeholder="e.g. Priya" className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Additional wishes / context</label>
                    <textarea value={props.aiPrompt} onChange={(e) => props.setAiPrompt(e.target.value)} rows={3} placeholder='e.g. "My name is Suyash, write a heartfelt Holi wish, Holi is on 4 March"' className="w-full px-4 py-3 resize-none text-sm" style={HOLI_INPUT} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setEditMode("choose")} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1" style={{ background: "hsl(var(--holi-surface))", color: "hsl(var(--holi-fg))", border: "1px solid hsl(var(--holi-border))" }}>
                      <ChevronLeft size={14} /> Back
                    </button>
                    <button onClick={props.onAiGenerate} disabled={props.aiLoading || !props.aiSender.trim() || !props.aiPrompt.trim()} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}>
                      {props.aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate</>}
                    </button>
                  </div>
                </>
              )}

              {/* ── MANUAL / AI-EDIT ── */}
              {isEditingForm && (
                <FormSteps {...props} editMode={editMode} setEditMode={setEditMode} fileInputRef={fileInputRef} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Separated to avoid hooks-in-memo issues with fileInputRef
function FormSteps(props: Props & { fileInputRef: React.RefObject<HTMLInputElement | null> }) {
  const { editMode, setEditMode, fileInputRef } = props;

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      const base64 = await compressToBase64(file, 300, 0.75);
      props.updateMf("senderPhoto", base64);
    } catch {
      // silently ignore compression errors
    }
    // reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [props.updateMf, fileInputRef]);

  return (
    <>
      {/* Step progress */}
      <div className="flex gap-1.5 mb-3">
        {MANUAL_STEPS.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className="h-1 rounded-full mb-1.5 transition-all duration-300" style={{ background: i <= props.manualStep ? "var(--holi-pink)" : "hsl(var(--holi-surface))" }} />
            <span className="text-[10px] font-semibold" style={{ color: i <= props.manualStep ? "var(--holi-pink)" : "hsl(var(--holi-muted-fg))" }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 0 — Basics */}
      {props.manualStep === 0 && (
        <>
          {/* Photo upload */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "hsl(var(--holi-muted-fg))" }}>
              Your Photo <span className="font-normal opacity-60">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              {/* Avatar preview */}
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 relative"
                style={{ background: "var(--holi-gradient-primary)", border: "2px solid hsl(var(--holi-border))" }}
              >
                {props.mf.senderPhoto ? (
                  <img src={props.mf.senderPhoto} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} style={{ color: "rgba(255,255,255,0.7)" }} />
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  style={{ background: "hsl(var(--holi-surface))", color: "hsl(var(--holi-fg))", border: "1px solid hsl(var(--holi-border))" }}
                >
                  <ImagePlus size={14} style={{ color: "var(--holi-pink)" }} />
                  {props.mf.senderPhoto ? "Change Photo" : "Upload Photo"}
                </button>

                {/* Remove button */}
                {props.mf.senderPhoto && (
                  <button
                    type="button"
                    onClick={() => props.updateMf("senderPhoto", "")}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                    style={{ background: "rgba(239,68,68,0.08)", color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "hsl(var(--holi-muted-fg) / 0.6)" }}>
              Shown on the Wish card. Auto-compressed to save space.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>
              Your Name <span style={{ color: "var(--holi-pink)" }}>*</span>
            </label>
            <input value={props.mf.senderName} onChange={(e) => props.updateMf("senderName", e.target.value)} placeholder="Your name" className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>
              Who are you wishing?{" "}
              <span className="font-normal opacity-60">(optional)</span>
            </label>
            <input value={props.mf.recipientName} onChange={(e) => props.updateMf("recipientName", e.target.value)} placeholder="Leave empty for a general card" className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Family / Group Name</label>
            <input value={props.mf.senderFamily} onChange={(e) => props.updateMf("senderFamily", e.target.value)} placeholder="e.g. Family, The Sharmas" className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
          </div>
        </>
      )}

      {/* Step 1 — Message */}
      {props.manualStep === 1 && (
        <>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Hindi Title</label>
            <input value={props.mf.hindiTitle} onChange={(e) => props.updateMf("hindiTitle", e.target.value)} className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>English Subtitle</label>
            <input value={props.mf.englishSubtitle} onChange={(e) => props.updateMf("englishSubtitle", e.target.value)} placeholder="Wishing you joy, colors, and countless blessings..." className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Home Page Wish Card 🏠</label>
            <p className="text-[10px] mb-1.5" style={{ color: "hsl(var(--holi-muted-fg) / 0.7)" }}>Shown as a personal message on the Home page</p>
            <textarea value={props.mf.homeWishMessage} onChange={(e) => props.updateMf("homeWishMessage", e.target.value)} rows={2} placeholder="A short personal Holi wish for the home page..." className="w-full px-4 py-3 resize-none text-sm" style={HOLI_INPUT} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Family Wish Card ❤️</label>
            <p className="text-[10px] mb-1.5" style={{ color: "hsl(var(--holi-muted-fg) / 0.7)" }}>Shown on the Wish page as the main family message</p>
            <textarea value={props.mf.congratsMessage} onChange={(e) => props.updateMf("congratsMessage", e.target.value)} rows={3} placeholder="Wishing you and your family a very colorful and joyful Holi..." className="w-full px-4 py-3 resize-none text-sm" style={HOLI_INPUT} />
          </div>
        </>
      )}

      {/* Step 2 — Details */}
      {props.manualStep === 2 && (
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>Holi Date</label>
          <p className="text-[10px] mb-2" style={{ color: "hsl(var(--holi-muted-fg) / 0.7)" }}>Sets the countdown shown on the Home page</p>
          <input type="date" value={props.mf.holiDate.split("T")[0]} onChange={(e) => props.updateMf("holiDate", e.target.value + "T00:00:00")} className="w-full px-4 py-3 text-sm" style={HOLI_INPUT} />
          {props.mf.holiDate && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "hsl(var(--holi-surface))" }}>
              <span>🗓️</span>
              <span className="text-xs" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                Holi:{" "}
                <span className="font-semibold" style={{ color: "hsl(var(--holi-fg))" }}>
                  {new Date(props.mf.holiDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={() => props.manualStep > 0 ? props.setManualStep(props.manualStep - 1) : setEditMode(editMode === "ai-edit" ? "ai" : "choose")}
          className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
          style={{ background: "hsl(var(--holi-surface))", color: "hsl(var(--holi-fg))", border: "1px solid hsl(var(--holi-border))" }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        {props.manualStep < MANUAL_STEPS.length - 1 ? (
          <button
            onClick={() => props.setManualStep(props.manualStep + 1)}
            disabled={props.manualStep === 0 && !props.mf.senderName.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
            style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={props.onManualPreview} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5" style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}>
            <Eye size={14} /> Preview
          </button>
        )}
      </div>
    </>
  );
}
