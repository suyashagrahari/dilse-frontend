"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, PenLine, Loader2, Eye } from "lucide-react";
import type { EidData, EditMode } from "./types";

const MANUAL_STEPS = ["Basics", "Message", "Details"];
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
  const visible = editMode === "choose" || editMode === "ai" || editMode === "manual";
  if (!visible) return null;

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
            <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: "1px solid hsl(var(--eid-border))" }}>
              <h3 className="text-lg font-bold" style={{ color: "var(--eid-gold)", fontFamily: "'Cormorant Garamond', serif" }}>
                {editMode === "choose" ? "Create Your Eid Card" : editMode === "ai" ? "AI Generation" : "Manual Entry"}
              </h3>
              <button onClick={() => setEditMode(null)} style={{ color: "hsl(var(--eid-muted-fg))" }}><X size={20} /></button>
            </div>

            <div className="p-5 space-y-4">
              {editMode === "choose" && (
                <>
                  <button onClick={props.onStartAi} className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]" style={{ background: "rgba(197,160,63,0.08)", border: "1px solid rgba(197,160,63,0.15)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: GOLD_GRAD }}><Sparkles size={18} style={{ color: "hsl(var(--eid-bg))" }} /></div>
                    <div className="text-left"><p className="font-semibold text-sm" style={{ color: "hsl(var(--eid-fg))" }}>AI Generate</p><p className="text-xs" style={{ color: "hsl(var(--eid-muted-fg))" }}>Auto-create with AI magic</p></div>
                    <ChevronRight size={18} className="ml-auto" style={{ color: "hsl(var(--eid-muted-fg))" }} />
                  </button>
                  <button onClick={props.onStartManual} className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]" style={{ background: "rgba(58,143,125,0.08)", border: "1px solid rgba(58,143,125,0.15)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--eid-teal)" }}><PenLine size={18} style={{ color: "#fff" }} /></div>
                    <div className="text-left"><p className="font-semibold text-sm" style={{ color: "hsl(var(--eid-fg))" }}>Write Manually</p><p className="text-xs" style={{ color: "hsl(var(--eid-muted-fg))" }}>Customize every detail</p></div>
                    <ChevronRight size={18} className="ml-auto" style={{ color: "hsl(var(--eid-muted-fg))" }} />
                  </button>
                </>
              )}

              {editMode === "ai" && (
                <>
                  <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>Recipient Name</label><input value={props.aiName} onChange={(e) => props.setAiName(e.target.value)} placeholder="e.g. Ahmed" className="w-full px-4 py-2.5 text-sm" style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>From</label><input value={props.aiSender} onChange={(e) => props.setAiSender(e.target.value)} placeholder="Your name" className="w-full px-4 py-2.5 text-sm" style={inputStyle} /></div>
                  <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>Additional wishes</label><textarea value={props.aiPrompt} onChange={(e) => props.setAiPrompt(e.target.value)} rows={3} placeholder="Any special message..." className="w-full px-4 py-2.5 resize-none text-sm" style={inputStyle} /></div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditMode("choose")} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--eid-surface))", color: "hsl(var(--eid-fg))", border: "1px solid hsl(var(--eid-border))" }}><ChevronLeft size={14} className="inline mr-1" />Back</button>
                    <button onClick={props.onAiGenerate} disabled={props.aiLoading} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: GOLD_GRAD, color: "hsl(var(--eid-bg))" }}>
                      {props.aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {props.aiLoading ? "Generating..." : "Generate"}
                    </button>
                  </div>
                </>
              )}

              {editMode === "manual" && (
                <>
                  <div className="flex gap-1 mb-2">
                    {MANUAL_STEPS.map((s, i) => (
                      <div key={s} className="flex-1 text-center">
                        <div className="h-1 rounded-full mb-1" style={{ background: i <= props.manualStep ? "var(--eid-gold)" : "hsl(var(--eid-surface))" }} />
                        <span className="text-[10px]" style={{ color: i <= props.manualStep ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))" }}>{s}</span>
                      </div>
                    ))}
                  </div>

                  {props.manualStep === 0 && (
                    <>
                      <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>Recipient</label><input value={props.mf.recipientName} onChange={(e) => props.updateMf("recipientName", e.target.value)} placeholder="Name" className="w-full px-4 py-2.5 text-sm" style={inputStyle} /></div>
                      <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>From</label><input value={props.mf.senderName} onChange={(e) => props.updateMf("senderName", e.target.value)} placeholder="Your name" className="w-full px-4 py-2.5 text-sm" style={inputStyle} /></div>
                    </>
                  )}
                  {props.manualStep === 1 && (
                    <>
                      <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>Urdu Title</label><input value={props.mf.urduTitle} onChange={(e) => props.updateMf("urduTitle", e.target.value)} className="w-full px-4 py-2.5 text-sm text-right" dir="rtl" style={inputStyle} /></div>
                      <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>English Subtitle</label><input value={props.mf.englishSubtitle} onChange={(e) => props.updateMf("englishSubtitle", e.target.value)} className="w-full px-4 py-2.5 text-sm" style={inputStyle} /></div>
                    </>
                  )}
                  {props.manualStep === 2 && (
                    <div><label className="block text-xs font-semibold mb-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>Eid Date</label><input type="date" value={props.mf.eidDate.split("T")[0]} onChange={(e) => props.updateMf("eidDate", e.target.value + "T00:00:00")} className="w-full px-4 py-2.5 text-sm" style={inputStyle} /></div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => props.manualStep > 0 ? props.setManualStep(props.manualStep - 1) : setEditMode("choose")} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--eid-surface))", color: "hsl(var(--eid-fg))", border: "1px solid hsl(var(--eid-border))" }}><ChevronLeft size={14} className="inline mr-1" />Back</button>
                    {props.manualStep < MANUAL_STEPS.length - 1 ? (
                      <button onClick={() => props.setManualStep(props.manualStep + 1)} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1" style={{ background: GOLD_GRAD, color: "hsl(var(--eid-bg))" }}>Next<ChevronRight size={14} /></button>
                    ) : (
                      <button onClick={props.onManualPreview} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1" style={{ background: GOLD_GRAD, color: "hsl(var(--eid-bg))" }}><Eye size={14} />Preview</button>
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
