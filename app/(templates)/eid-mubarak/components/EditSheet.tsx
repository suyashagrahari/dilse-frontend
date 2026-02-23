"use client";

import { memo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Eye, Camera, ImagePlus, Trash2 } from "lucide-react";
import type { EidData, EditMode } from "./types";

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

const MANUAL_STEPS = ["Basics", "Personal Wish", "Family Wish", "Customize"];
const GOLD_GRAD = "var(--eid-gradient-gold)";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  aiName: string; setAiName: (v: string) => void;
  aiSender: string; setAiSender: (v: string) => void;
  aiPrompt: string; setAiPrompt: (v: string) => void;
  aiLoading: boolean;
  mf: EidData;
  manualStep: number; setManualStep: (v: number) => void;
  updateMf: (key: keyof EidData, val: unknown) => void;
  onStartAi: () => void; onStartManual: () => void;
  onAiGenerate: () => void; onManualPreview: () => void;
}

const inputStyle: React.CSSProperties = {
  background: "hsl(var(--eid-input))",
  border: "1px solid hsl(var(--eid-border))",
  color: "hsl(var(--eid-fg))",
  borderRadius: "0.75rem",
};

export default memo(function EditSheet(props: Props) {
  const { editMode, setEditMode } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [props.updateMf]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = editMode === "choose" || editMode === "ai" || editMode === "ai-edit" || editMode === "manual";
  if (!visible) return null;

  const isEditingForm = editMode === "manual" || editMode === "ai-edit";

  const stepLabel = editMode === "choose"
    ? "Create Your Eid Card"
    : editMode === "ai"
    ? "AI Generation"
    : editMode === "ai-edit"
    ? "Edit AI Content"
    : "Personalize";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditMode(null)} />
          <motion.div
            className="relative w-full max-w-lg rounded-t-3xl lg:rounded-3xl overflow-hidden max-h-[85vh] overflow-y-auto"
            style={{ background: "hsl(var(--eid-card))", border: "1px solid hsl(var(--eid-border))" }}
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Gold top bar */}
            <div className="h-1" style={{ background: GOLD_GRAD }} />

            <div className="flex items-center justify-between p-5 pb-3"
              style={{ borderBottom: "1px solid hsl(var(--eid-border))" }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌙</span>
                <h3 className="text-lg font-bold"
                  style={{ color: "var(--eid-gold)", fontFamily: "'Cormorant Garamond', serif" }}>
                  {stepLabel}
                </h3>
              </div>
              <button onClick={() => setEditMode(null)} style={{ color: "hsl(var(--eid-muted-fg))" }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* ── CHOOSE ── */}
              {editMode === "choose" && (
                <>
                  <p className="text-xs text-center mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                    How would you like to create your Eid card?
                  </p>
                  <button onClick={props.onStartAi}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
                    style={{ background: "rgba(197,160,63,0.08)", border: "1px solid rgba(197,160,63,0.15)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: GOLD_GRAD }}>
                      <Sparkles size={18} style={{ color: "hsl(var(--eid-bg))" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--eid-fg))" }}>AI Generate</p>
                      <p className="text-xs" style={{ color: "hsl(var(--eid-muted-fg))" }}>Auto-create with AI magic</p>
                    </div>
                    <ChevronRight size={18} className="ml-auto" style={{ color: "hsl(var(--eid-muted-fg))" }} />
                  </button>
                  <button onClick={props.onStartManual}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
                    style={{ background: "rgba(58,143,125,0.08)", border: "1px solid rgba(58,143,125,0.15)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--eid-teal)" }}>
                      <PenLine size={18} style={{ color: "#fff" }} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--eid-fg))" }}>Write Manually</p>
                      <p className="text-xs" style={{ color: "hsl(var(--eid-muted-fg))" }}>Customize every detail yourself</p>
                    </div>
                    <ChevronRight size={18} className="ml-auto" style={{ color: "hsl(var(--eid-muted-fg))" }} />
                  </button>
                </>
              )}

              {/* ── AI MODE ── */}
              {editMode === "ai" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                      Your Name <span style={{ color: "var(--eid-gold)" }}>*</span>
                    </label>
                    <input value={props.aiSender} onChange={(e) => props.setAiSender(e.target.value)}
                      placeholder="Your name" className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                      Who are you wishing?{" "}
                      <span className="font-normal opacity-60">(optional)</span>
                    </label>
                    <input value={props.aiName} onChange={(e) => props.setAiName(e.target.value)}
                      placeholder="e.g. Ahmed — leave empty for a general card" className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                      Special wishes or context *
                    </label>
                    <textarea value={props.aiPrompt} onChange={(e) => props.setAiPrompt(e.target.value)}
                      rows={3} placeholder="Any special message for this Eid..." className="w-full px-4 py-2.5 resize-none text-sm outline-none"
                      style={inputStyle} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditMode("choose")}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold"
                      style={{ background: "hsl(var(--eid-surface))", color: "hsl(var(--eid-fg))", border: "1px solid hsl(var(--eid-border))" }}>
                      <ChevronLeft size={14} className="inline mr-1" />Back
                    </button>
                    <button onClick={props.onAiGenerate} disabled={props.aiLoading || !props.aiSender.trim() || !props.aiPrompt.trim()}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: GOLD_GRAD, color: "hsl(var(--eid-bg))" }}>
                      {props.aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {props.aiLoading ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </>
              )}

              {/* ── MANUAL / AI-EDIT MODE ── */}
              {isEditingForm && (
                <>
                  {editMode === "ai-edit" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1" style={{ background: "rgba(197,160,63,0.07)", border: "1px solid rgba(197,160,63,0.15)" }}>
                      <Sparkles size={13} style={{ color: "var(--eid-gold)", flexShrink: 0 }} />
                      <p className="text-[11px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                        AI generated — review &amp; edit before saving
                      </p>
                    </div>
                  )}

                  {/* Step Progress */}
                  <div className="flex gap-1.5 mb-1">
                    {MANUAL_STEPS.map((s, i) => (
                      <div key={s} className="flex-1 text-center">
                        <div
                          className="h-1 rounded-full mb-1 transition-all duration-300"
                          style={{ background: i <= props.manualStep ? "var(--eid-gold)" : "hsl(var(--eid-surface))" }}
                        />
                        <span className="text-[9px] font-medium"
                          style={{ color: i <= props.manualStep ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))" }}>
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ── Step 0: Basics ── */}
                  {props.manualStep === 0 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Your Name <span style={{ color: "var(--eid-gold)" }}>*</span>
                        </label>
                        <input value={props.mf.senderName}
                          onChange={(e) => props.updateMf("senderName", e.target.value)}
                          placeholder="Your name" className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Who are you wishing?{" "}
                          <span className="font-normal opacity-60">(optional)</span>
                        </label>
                        <input value={props.mf.recipientName}
                          onChange={(e) => props.updateMf("recipientName", e.target.value)}
                          placeholder="e.g. Ahmed — leave empty for a general card" className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Family Name
                        </label>
                        <input value={props.mf.senderFamily}
                          onChange={(e) => props.updateMf("senderFamily", e.target.value)}
                          placeholder="e.g. Khan Family" className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                      </div>

                      {/* Photo upload */}
                      <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Your Photo <span className="font-normal opacity-60">(optional)</span>
                        </label>
                        <div className="flex items-center gap-3">
                          {/* Avatar preview */}
                          <div
                            className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 relative"
                            style={{
                              background: "linear-gradient(135deg, rgba(58,143,125,0.3), rgba(197,160,63,0.2))",
                              border: "2px solid rgba(197,160,63,0.25)",
                            }}
                          >
                            {props.mf.senderPhoto ? (
                              <img src={props.mf.senderPhoto} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={22} style={{ color: "rgba(197,160,63,0.6)" }} />
                            )}
                          </div>

                          <div className="flex flex-col gap-2 flex-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                              style={{
                                background: "hsl(var(--eid-surface))",
                                color: "hsl(var(--eid-fg))",
                                border: "1px solid hsl(var(--eid-border))",
                              }}
                            >
                              <ImagePlus size={14} style={{ color: "var(--eid-gold)" }} />
                              {props.mf.senderPhoto ? "Change Photo" : "Upload Photo"}
                            </button>

                            {props.mf.senderPhoto && (
                              <button
                                type="button"
                                onClick={() => props.updateMf("senderPhoto", "")}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                style={{
                                  background: "rgba(239,68,68,0.08)",
                                  color: "rgb(239,68,68)",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                }}
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] mt-1.5" style={{ color: "hsl(var(--eid-muted-fg) / 0.6)" }}>
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
                    </>
                  )}

                  {/* ── Step 1: Personal Wish ── */}
                  {props.manualStep === 1 && (
                    <>
                      <div
                        className="flex items-start gap-3 p-3 rounded-2xl mb-1"
                        style={{ background: "rgba(197,160,63,0.06)", border: "1px solid rgba(197,160,63,0.12)" }}
                      >
                        <span className="text-xl mt-0.5">🌙</span>
                        <div>
                          <p className="text-xs font-bold mb-0.5" style={{ color: "var(--eid-gold)" }}>Personal Wish</p>
                          <p className="text-[11px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                            Shown on the Home tab — a heartfelt personal message just for the recipient.
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Personal Message
                        </label>
                        <textarea
                          value={props.mf.homeWishMessage}
                          onChange={(e) => props.updateMf("homeWishMessage", e.target.value)}
                          rows={6}
                          placeholder="Write a personal message from your heart..."
                          className="w-full px-4 py-3 resize-none text-sm outline-none leading-relaxed"
                          style={inputStyle}
                        />
                        <p className="text-[10px] mt-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          {props.mf.homeWishMessage.length} characters
                        </p>
                      </div>
                    </>
                  )}

                  {/* ── Step 2: Family Wish ── */}
                  {props.manualStep === 2 && (
                    <>
                      <div
                        className="flex items-start gap-3 p-3 rounded-2xl mb-1"
                        style={{ background: "rgba(58,143,125,0.06)", border: "1px solid rgba(58,143,125,0.12)" }}
                      >
                        <span className="text-xl mt-0.5">🕌</span>
                        <div>
                          <p className="text-xs font-bold mb-0.5" style={{ color: "var(--eid-teal)" }}>Family Wish</p>
                          <p className="text-[11px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                            Shown on the Wish tab — a warm family congratulations message for Eid.
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Family Congratulations
                        </label>
                        <textarea
                          value={props.mf.congratsMessage}
                          onChange={(e) => props.updateMf("congratsMessage", e.target.value)}
                          rows={6}
                          placeholder="Write a warm Eid Mubarak wish from your family..."
                          className="w-full px-4 py-3 resize-none text-sm outline-none leading-relaxed"
                          style={inputStyle}
                        />
                        <p className="text-[10px] mt-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          {props.mf.congratsMessage.length} characters
                        </p>
                      </div>
                    </>
                  )}

                  {/* ── Step 3: Customize ── */}
                  {props.manualStep === 3 && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Urdu Title
                        </label>
                        <input value={props.mf.urduTitle}
                          onChange={(e) => props.updateMf("urduTitle", e.target.value)}
                          className="w-full px-4 py-2.5 text-base text-right outline-none" dir="rtl" lang="ur"
                          style={{ ...inputStyle, fontFamily: "'Noto Nastaliq Urdu', serif" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          English Subtitle
                        </label>
                        <input value={props.mf.englishSubtitle}
                          onChange={(e) => props.updateMf("englishSubtitle", e.target.value)}
                          placeholder="Wishing you joy, peace..." className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                          Eid Date
                        </label>
                        <input type="date"
                          value={props.mf.eidDate.split("T")[0]}
                          onChange={(e) => props.updateMf("eidDate", e.target.value + "T00:00:00")}
                          className="w-full px-4 py-2.5 text-sm outline-none" style={inputStyle} />
                      </div>
                    </>
                  )}

                  {/* Nav buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => props.manualStep > 0 ? props.setManualStep(props.manualStep - 1) : setEditMode(editMode === "ai-edit" ? "ai" : "choose")}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold"
                      style={{ background: "hsl(var(--eid-surface))", color: "hsl(var(--eid-fg))", border: "1px solid hsl(var(--eid-border))" }}>
                      <ChevronLeft size={14} className="inline mr-1" />Back
                    </button>
                    {props.manualStep < MANUAL_STEPS.length - 1 ? (
                      <button
                        onClick={() => props.setManualStep(props.manualStep + 1)}
                        disabled={props.manualStep === 0 && !props.mf.senderName.trim()}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
                        style={{ background: GOLD_GRAD, color: "hsl(var(--eid-bg))" }}>
                        Next <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button onClick={props.onManualPreview}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                        style={{ background: GOLD_GRAD, color: "hsl(var(--eid-bg))" }}>
                        <Eye size={14} /> Preview
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
