"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  PenLine,
  Loader2,
  Check,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import AuthModal from "@/components/AuthModal";
import ValentineContent from "./components/ValentineContent";
import ValentineNav from "./components/ValentineNav";
import { type ValentineData, type TabId, DEMO_CONTENT } from "./components/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export default function ValentineGfPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState<TabId>("cover");
  const [content, setContent] = useState<ValentineData>(DEMO_CONTENT);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editMode, setEditMode] = useState<null | "choose" | "ai" | "manual" | "preview">(null);
  const [pendingContent, setPendingContent] = useState<ValentineData | null>(null);
  const [saving, setSaving] = useState(false);

  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [mf, setMf] = useState<ValentineData>({ ...DEMO_CONTENT });
  const [manualStep, setManualStep] = useState(0);
  const [photoInput, setPhotoInput] = useState("");

  const [publishing, setPublishing] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...toast, id }]);
    if (toast.type !== "publish") {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken]
  );

  /* Always starts fresh with demo content — each edit creates a new page */

  const handleEditClick = () => {
    if (!isAuthenticated) { setShowAuth(true); return; }
    setEditMode("choose");
  };

  const handleAiGenerate = async () => {
    if (!aiName.trim() || !aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          prompt: `Valentine's Day love message for ${aiName}. ${aiPrompt}`,
          templateId: "valentine-gf",
          templateType: "valentine",
        }),
      });
      const data = await res.json();
      if (data.heading || data.body) {
        const newContent: ValentineData = {
          recipientName: aiName.trim(),
          senderName: aiSender.trim() || "Forever Yours 💝",
          personalMessage: data.body || DEMO_CONTENT.personalMessage,
          promises: DEMO_CONTENT.promises,
          photos: [],
          theme: "romantic",
        };
        setPendingContent(newContent);
        setContent(newContent);
        setEditMode("preview");
      }
    } catch {
      pushToast({ type: "info", title: "Generation failed", message: "Please try again" });
    } finally { setAiLoading(false); }
  };

  const handleManualPreview = () => {
    if (!mf.recipientName.trim()) return;
    setPendingContent(mf);
    setContent(mf);
    setEditMode("preview");
  };

  const handleConfirmSave = async () => {
    if (!pendingContent) return;
    setSaving(true);
    try {
      await saveToServer(pendingContent);
      setIsPersonalized(true);
      setShareUrl(null);
      setEditMode(null);
      setTab("cover");
      setPendingContent(null);
      pushToast({ type: "success", title: "Changes saved!", message: "Your page is ready to publish" });
    } catch {
      pushToast({ type: "info", title: "Save failed", message: "Please try again" });
    } finally { setSaving(false); }
  };

  const handleDiscardPreview = () => {
    if (!pendingContent) { setEditMode(null); return; }
    setContent(isPersonalized ? content : DEMO_CONTENT);
    setPendingContent(null);
    setEditMode("choose");
  };

  const saveToServer = async (data: ValentineData) => {
    if (!accessToken) return;
    if (pageId) {
      await fetch(`${API_URL}/valentine-pages/${pageId}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) });
    } else {
      const res = await fetch(`${API_URL}/valentine-pages`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
      const result = await res.json();
      if (result.success) setPageId(result.data._id);
    }
  };

  const handlePublish = async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/valentine-pages/${pageId}/publish`, { method: "POST", headers: headers() });
      const result = await res.json();
      if (result.success) {
        const url = result.data.shareUrl;
        setShareUrl(url);
        setPageId(null);
        setIsPersonalized(false);
        pushToast({ type: "publish", title: "Published!", message: "Your valentine page is now live", shareUrl: url });
      }
    } catch {
      pushToast({ type: "info", title: "Publish failed", message: "Please try again" });
    } finally { setPublishing(false); }
  };

  const handleCopy = (url?: string) => {
    const link = url || shareUrl;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (!url) pushToast({ type: "success", title: "Link copied!" });
    }
  };

  const updateMf = (key: keyof ValentineData, val: unknown) => setMf((p) => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-pink-50/30 to-white dark:from-slate-950 dark:via-red-950/20 dark:to-slate-950 relative overflow-hidden">
      <ValentineContent data={content} tab={tab} onTabChange={setTab} />

      <ValentineNav
        mode="editor"
        tab={tab}
        onTabChange={(t) => { setTab(t); if (editMode !== "preview") setEditMode(null); }}
        onEdit={handleEditClick}
        onPublish={handlePublish}
        onShare={() => handleCopy()}
        onBack={() => router.push("/templates")}
        shareLabel={copied ? "Copied!" : "Share"}
        showPublish={isPersonalized && !shareUrl && !publishing}
        showShare={!!shareUrl}
      />

      {/* ─── TOAST STACK ─── */}
      <div className="fixed top-4 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm"
            >
              <div className={`relative rounded-2xl shadow-2xl border backdrop-blur-xl overflow-hidden ${
                toast.type === "publish"
                  ? "bg-gradient-to-r from-emerald-500/95 to-green-500/95 border-emerald-400/30 text-white"
                  : toast.type === "success"
                  ? "bg-white/95 dark:bg-slate-900/95 border-emerald-200/50 dark:border-emerald-800/30"
                  : "bg-white/95 dark:bg-slate-900/95 border-border/50"
              }`}>
                <div className="px-4 py-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    toast.type === "publish" ? "bg-white/20" :
                    toast.type === "success" ? "bg-emerald-500/10" : "bg-blue-500/10"
                  }`}>
                    {toast.type === "publish" ? <Send size={14} className="text-white" /> :
                     toast.type === "success" ? <Check size={14} className="text-emerald-500" /> :
                     <Sparkles size={14} className="text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${toast.type === "publish" ? "text-white" : ""}`}>{toast.title}</p>
                    {toast.message && (
                      <p className={`text-xs mt-0.5 ${toast.type === "publish" ? "text-white/80" : "text-muted-foreground"}`}>{toast.message}</p>
                    )}
                    {toast.shareUrl && (
                      <div className="flex gap-2 mt-2.5">
                        <button
                          onClick={() => { handleCopy(toast.shareUrl); dismissToast(toast.id); }}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Copy size={12} /> Copy Link
                        </button>
                        <button
                          onClick={() => { window.open(toast.shareUrl, "_blank"); dismissToast(toast.id); }}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ExternalLink size={12} /> Open
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => dismissToast(toast.id)} className={`p-0.5 rounded-full shrink-0 ${toast.type === "publish" ? "text-white/60 hover:text-white" : "text-muted-foreground/40 hover:text-muted-foreground"}`}>
                    <X size={14} />
                  </button>
                </div>
                {toast.type !== "publish" && (
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 3.5, ease: "linear" }}
                    className="h-0.5 bg-emerald-500/30 origin-left"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── EDIT SHEET ─── */}
      <AnimatePresence>
        {editMode && editMode !== "preview" && (
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
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-background rounded-t-3xl shadow-2xl safe-bottom"
            >
              <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-background z-10">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {editMode === "choose" && (
                <div className="px-5 pb-8 pt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Customize Your Valentine</h3>
                    <button onClick={() => setEditMode(null)} className="p-1 text-muted-foreground"><X size={20} /></button>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setAiName(isPersonalized ? content.recipientName : "");
                        setAiSender(isPersonalized ? content.senderName : "");
                        setAiPrompt("");
                        setEditMode("ai");
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15 border border-violet-200/50 dark:border-violet-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Generate with AI</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Describe what you want & AI creates it</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground ml-auto shrink-0" />
                    </button>

                    <button
                      onClick={() => {
                        setMf(isPersonalized ? { ...content } : { ...DEMO_CONTENT });
                        setManualStep(0);
                        setEditMode("manual");
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/15 dark:to-pink-500/15 border border-red-200/50 dark:border-red-800/30 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shrink-0">
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
              )}

              {editMode === "ai" && (
                <div className="px-5 pb-8 pt-2">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
                    <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles size={16} className="text-violet-500" />AI Magic</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Their Name *</label>
                      <input value={aiName} onChange={(e) => setAiName(e.target.value)} placeholder="e.g. Sarah" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Your Name</label>
                      <input value={aiSender} onChange={(e) => setAiSender(e.target.value)} placeholder="e.g. Alex" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Describe what you want *</label>
                      <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. A romantic Valentine's message for my girlfriend who loves poetry and sunsets..." rows={4} className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-sm transition-all resize-none" />
                    </div>
                    <button onClick={handleAiGenerate} disabled={aiLoading || !aiName.trim() || !aiPrompt.trim()} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform">
                      {aiLoading ? (<><Loader2 size={16} className="animate-spin" />Generating...</>) : (<><Sparkles size={16} />Generate Magic ✨</>)}
                    </button>
                  </div>
                </div>
              )}

              {editMode === "manual" && (
                <div className="px-5 pb-8 pt-2">
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => setEditMode("choose")} className="p-1 text-muted-foreground"><ChevronLeft size={20} /></button>
                    <h3 className="text-lg font-bold flex items-center gap-2"><PenLine size={16} className="text-red-500" />Manual Edit</h3>
                  </div>

                  <div className="flex gap-1 mb-6">
                    {["Names", "Letter", "Promises", "Photos"].map((s, i) => (
                      <button key={s} onClick={() => setManualStep(i)} className={`flex-1 h-1 rounded-full transition-all ${i <= manualStep ? "bg-red-500" : "bg-border"}`} />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {manualStep === 0 && (
                      <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Their Name *</label>
                          <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Sarah" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-red-300 focus:outline-none text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Your Name</label>
                          <input value={mf.senderName} onChange={(e) => updateMf("senderName", e.target.value)} placeholder="e.g. Alex" className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-red-300 focus:outline-none text-sm" />
                        </div>
                      </motion.div>
                    )}
                    {manualStep === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Love Letter</label>
                        <textarea value={mf.personalMessage} onChange={(e) => updateMf("personalMessage", e.target.value)} rows={7} placeholder="My dearest love, on this Valentine's Day..." className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:border-red-300 focus:outline-none text-sm resize-none" />
                      </motion.div>
                    )}
                    {manualStep === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                        {mf.promises.map((p, i) => (
                          <div key={i} className="flex gap-2">
                            <input value={p} onChange={(e) => updateMf("promises", mf.promises.map((x, j) => j === i ? e.target.value : x))} placeholder={`Promise #${i + 1}`} className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-red-300 focus:outline-none text-sm" />
                            {mf.promises.length > 1 && (
                              <button onClick={() => updateMf("promises", mf.promises.filter((_, j) => j !== i))} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0"><Trash2 size={14} /></button>
                            )}
                          </div>
                        ))}
                        {mf.promises.length < 8 && (
                          <button onClick={() => updateMf("promises", [...mf.promises, ""])} className="flex items-center gap-1.5 text-sm text-red-500 font-semibold"><Plus size={14} /> Add promise</button>
                        )}
                      </motion.div>
                    )}
                    {manualStep === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="flex gap-2">
                          <input value={photoInput} onChange={(e) => setPhotoInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && photoInput.trim()) { updateMf("photos", [...mf.photos, photoInput.trim()]); setPhotoInput(""); }}} placeholder="Paste image URL..." className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 focus:border-red-300 focus:outline-none text-sm" />
                          <button onClick={() => { if (photoInput.trim()) { updateMf("photos", [...mf.photos, photoInput.trim()]); setPhotoInput(""); }}} disabled={!photoInput.trim()} className="px-4 rounded-xl bg-red-500 text-white disabled:opacity-30 shrink-0"><Plus size={16} /></button>
                        </div>
                        {mf.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {mf.photos.map((url, i) => (
                              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 group">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => updateMf("photos", mf.photos.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3 mt-6">
                    {manualStep > 0 && (
                      <button onClick={() => setManualStep((s) => s - 1)} className="w-11 h-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground"><ChevronLeft size={18} /></button>
                    )}
                    {manualStep < 3 ? (
                      <button onClick={() => setManualStep((s) => s + 1)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5">Continue <ChevronRight size={16} /></button>
                    ) : (
                      <button onClick={handleManualPreview} disabled={!mf.recipientName.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"><Eye size={16} />Preview</button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── PREVIEW BAR ─── */}
      <AnimatePresence>
        {editMode === "preview" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed top-0 left-0 right-0 z-50 safe-top pointer-events-none"
          >
            <div className="mx-4 mt-4 md:mx-auto md:max-w-sm pointer-events-auto">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-red-200/40 dark:border-red-900/30 overflow-hidden">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Eye size={12} className="text-red-500" />
                    </div>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Preview Mode</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">Browse through the tabs to see how it looks, then save or go back to edit.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDiscardPreview}
                      className="flex-1 py-2.5 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={14} /> Edit More
                    </button>
                    <button
                      onClick={handleConfirmSave}
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-60"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      {saving ? "Saving..." : "Save & Continue"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PUBLISHING OVERLAY ─── */}
      <AnimatePresence>
        {publishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/30 dark:bg-black/50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center border border-red-200/40 dark:border-red-900/30"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Send size={28} className="text-red-500 mx-auto" />
              </motion.div>
              <p className="font-bold text-sm">Publishing your page...</p>
              <p className="text-xs text-muted-foreground mt-1">Making it live for your love</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
