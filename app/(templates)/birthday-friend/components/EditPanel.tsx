"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Wand2, PenTool, ArrowRight, ArrowLeft, Sparkles,
  Send, Loader2, Check, Type, MessageSquare, User, Eye,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setEditMode, nextStep, prevStep, resetEdit,
  updateTemplateField, setAiPrompt, prefillFromAI,
  setAiLoading, type TemplateData,
} from "@/store/templateEditSlice";
import { config } from "../config";

interface Props {
  onClose: () => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

const MANUAL_STEPS = [
  { field: "heading" as keyof TemplateData, label: "Heading", placeholder: "e.g. Happy Birthday, My Love!", icon: Type, type: "input" as const },
  { field: "body" as keyof TemplateData, label: "Your Message", placeholder: "Write your heartfelt message here...", icon: MessageSquare, type: "textarea" as const },
  { field: "senderName" as keyof TemplateData, label: "Signed By", placeholder: "e.g. With Love ❤️", icon: User, type: "input" as const },
];

export default function EditPanel({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const { editMode, currentStep, aiPrompt, aiLoading, aiError, savedData } =
    useAppSelector((s) => s.templateEdit);

  const data = savedData[config.slug] || {
    heading: config.previewText,
    body: config.bodyText,
    senderName: "With Love ❤️",
  };

  const handleClose = useCallback(() => {
    dispatch(resetEdit());
    onClose();
  }, [dispatch, onClose]);

  const handleFieldChange = useCallback(
    (field: keyof TemplateData, value: string) => {
      dispatch(updateTemplateField({ templateId: config.slug, field, value }));
    },
    [dispatch]
  );

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    dispatch(setAiLoading(true));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, templateId: config.slug, templateType: config.type }),
      });
      if (res.ok) {
        const result = await res.json();
        dispatch(prefillFromAI({ templateId: config.slug, data: result }));
        return;
      }
    } catch { /* fallback */ }
    setTimeout(() => {
      dispatch(prefillFromAI({
        templateId: config.slug,
        data: { heading: config.previewText, body: aiPrompt.length > 20 ? aiPrompt : config.bodyText, senderName: "With Love ❤️" },
      }));
    }, 1500);
  }, [aiPrompt, dispatch]);

  const manualStepIndex = currentStep - 1;
  const isLastManualStep = editMode === "manual" && manualStepIndex === MANUAL_STEPS.length - 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[60]"
        onClick={handleClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[60] bg-card rounded-t-3xl shadow-elevated max-h-[92vh] overflow-hidden safe-bottom flex flex-col"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="flex items-center justify-between px-6 pb-4">
          <div>
            <h3 className="text-lg font-bold">
              {editMode === null ? "Create Your Wish" : editMode === "ai" && currentStep === 1 ? "AI Magic ✨" : "Craft Your Message"}
            </h3>
            {editMode === "manual" && (
              <p className="text-xs text-muted-foreground mt-0.5">Step {manualStepIndex + 1} of {MANUAL_STEPS.length}</p>
            )}
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {editMode === "manual" && (
          <div className="px-6 pb-4">
            <div className="flex gap-1.5">
              {MANUAL_STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= manualStepIndex ? "gradient-hero" : "bg-muted"}`} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait" custom={1}>
            {editMode === null && (
              <motion.div key="choose" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground mb-6">How would you like to create your wish?</p>
                <button onClick={() => dispatch(setEditMode("manual"))} className="w-full group">
                  <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-primary/30 bg-gradient-to-r from-amber-50 to-orange-50 transition-all hover:shadow-card">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shrink-0"><PenTool size={24} className="text-white" /></div>
                    <div className="text-left flex-1">
                      <h4 className="font-bold text-foreground text-base">Craft It Myself</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Write every word with your personal touch</p>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
                <button onClick={() => dispatch(setEditMode("ai"))} className="w-full group">
                  <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-primary/30 bg-gradient-to-r from-violet-50 to-purple-50 transition-all hover:shadow-card">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0"><Wand2 size={24} className="text-white" /></div>
                    <div className="text-left flex-1">
                      <h4 className="font-bold text-foreground text-base">AI Magic</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Describe your feelings, let AI craft the perfect wish</p>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              </motion.div>
            )}

            {editMode === "ai" && currentStep === 1 && (
              <motion.div key="ai" initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -200 }} className="space-y-5">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-violet-500" />
                    <span className="text-sm font-semibold text-violet-700">Tell AI about your wish</span>
                  </div>
                  <textarea value={aiPrompt} onChange={(e) => dispatch(setAiPrompt(e.target.value))} placeholder='Example: "Write a romantic birthday wish for my girlfriend. She loves stars and poetry..."' rows={5} className="w-full px-4 py-3 rounded-xl bg-white/80 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-muted-foreground/60 resize-none" disabled={aiLoading} />
                </div>
                {aiError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{aiError}</motion.p>}
                <MiniPreview data={data} />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => dispatch(resetEdit())} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"><ArrowLeft size={16} /></button>
                  <button onClick={handleAIGenerate} disabled={!aiPrompt.trim() || aiLoading} className="flex-1 gradient-hero text-primary-foreground py-3 rounded-xl font-semibold shadow-soft flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {aiLoading ? (<><Loader2 size={18} className="animate-spin" />Generating...</>) : (<><Send size={16} />Generate with AI</>)}
                  </button>
                </div>
              </motion.div>
            )}

            {editMode === "manual" && currentStep >= 1 && manualStepIndex < MANUAL_STEPS.length && (
              <motion.div key={`manual-${manualStepIndex}`} custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-5">
                {(() => {
                  const step = MANUAL_STEPS[manualStepIndex];
                  const Icon = step.icon;
                  const value = data[step.field];
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center"><Icon size={18} className="text-white" /></div>
                        <span className="font-semibold text-foreground">{step.label}</span>
                      </div>
                      {step.type === "textarea" ? (
                        <textarea value={value} onChange={(e) => handleFieldChange(step.field, e.target.value)} placeholder={step.placeholder} rows={5} className="w-full px-4 py-4 rounded-2xl bg-muted border-2 border-transparent focus:border-primary/20 text-sm focus:outline-none transition-all resize-none" />
                      ) : (
                        <input type="text" value={value} onChange={(e) => handleFieldChange(step.field, e.target.value)} placeholder={step.placeholder} className="w-full px-4 py-4 rounded-2xl bg-muted border-2 border-transparent focus:border-primary/20 text-sm focus:outline-none transition-all" />
                      )}
                      <MiniPreview data={data} />
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { if (manualStepIndex === 0) dispatch(resetEdit()); else dispatch(prevStep()); }} className="px-5 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"><ArrowLeft size={16} /></button>
                        {isLastManualStep ? (
                          <button onClick={handleClose} className="flex-1 gradient-hero text-primary-foreground py-3 rounded-xl font-semibold shadow-soft flex items-center justify-center gap-2"><Check size={18} />Save & Preview</button>
                        ) : (
                          <button onClick={() => dispatch(nextStep())} className="flex-1 gradient-hero text-primary-foreground py-3 rounded-xl font-semibold shadow-soft flex items-center justify-center gap-2">Continue<ArrowRight size={16} /></button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

function MiniPreview({ data }: { data: TemplateData }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
        <Eye size={14} className="text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
      </div>
      <div className={`bg-gradient-to-br ${config.bgGradient} p-5 flex flex-col items-center text-center`}>
        <span className="text-3xl mb-2">{config.emoji}</span>
        <p className="font-bold text-foreground text-sm font-script leading-snug mb-1">{data.heading || "Your heading..."}</p>
        <p className="text-foreground/70 text-[11px] leading-relaxed line-clamp-2 max-w-[250px] mb-2">{data.body || "Your message will appear here..."}</p>
        <p className="text-foreground/40 text-[10px] font-script">{data.senderName || "Sender name"}</p>
      </div>
    </div>
  );
}
