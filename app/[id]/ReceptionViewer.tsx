"use client";

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home, Heart, Camera, MapPin, Flower2, ArrowLeft,
  Sun, Moon, Lock, Eye, EyeOff, ShieldAlert, Loader2,
  Share2, Check, Copy, MoreHorizontal, Wand2, PenLine,
  ChevronRight, Sparkles, User, X, Edit3, Zap, HandHeart,
} from "lucide-react";
import { type ReceptionData, type TabId, TABS, DEMO_DATA } from "@/app/(templates)/reception/components/types";
import AuthModal from "@/components/AuthModal";
import { useAppSelector } from "@/store/hooks";

const SplashSection   = lazy(() => import("@/app/(templates)/reception/components/SplashSection"));
const CoupleReveal    = lazy(() => import("@/app/(templates)/reception/components/CoupleReveal"));
const GallerySection  = lazy(() => import("@/app/(templates)/reception/components/GallerySection"));
const LocationSection = lazy(() => import("@/app/(templates)/reception/components/LocationSection"));

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ViewerTabId = TabId | "create";

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
} as const;

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home, couple: Heart, gallery: Camera, location: MapPin, blessings: Flower2,
};

const AMBER_GRADIENT = "linear-gradient(135deg, #C9A84C, #A68636)";
const AMBER_SOFT     = "linear-gradient(135deg, #E8D5A3, #C9A84C)";
const AMBER_CTA      = "linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #b8860b 100%)";

const RECEPTION_FEATURES = [
  { icon: Wand2,      color: "#C9A84C", bg: "rgba(201,168,76,0.12)",  label: "AI Creation",       desc: "Generate invite instantly" },
  { icon: Camera,     color: "#ec4899", bg: "rgba(236,72,153,0.12)",  label: "Couple Photos",     desc: "Bride & groom portraits" },
  { icon: Lock,       color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  label: "Password Protect",  desc: "Keep it private & secure" },
  { icon: Share2,     color: "#38BDF8", bg: "rgba(56,189,248,0.12)",  label: "Instant Share",     desc: "One link, anyone" },
  { icon: MapPin,     color: "#10b981", bg: "rgba(16,185,129,0.12)",  label: "Venue & Maps",      desc: "Google Maps integrated" },
  { icon: HandHeart,  color: "#f97316", bg: "rgba(249,115,22,0.12)",  label: "Always Free",       desc: "No cost, ever" },
];

const RECEPTION_MOMENTS = [
  { emoji: "🥂", name: "Welcome Drinks",  color: "#C9A84C", meaning: "Greet guests in style" },
  { emoji: "💃", name: "Dance Floor",     color: "#ec4899", meaning: "Celebration & Joy" },
  { emoji: "🎂", name: "Cake Cutting",    color: "#f97316", meaning: "Sweet New Beginnings" },
  { emoji: "🎤", name: "Speeches",        color: "#8b5cf6", meaning: "Heartfelt Toasts" },
  { emoji: "🍽️", name: "Grand Dinner",   color: "#10b981", meaning: "Feast & Festivity" },
  { emoji: "🎊", name: "Farewell",        color: "#38BDF8", meaning: "Memorable Send-Off" },
];

function TabFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Create Section (full-page "create" tab)
───────────────────────────────────────── */
function CreateSection({ data, onStart }: { data: ReceptionData; onStart: () => void }) {
  const CtaCard = (
    <div className="rounded-3xl overflow-hidden sticky top-8"
      style={{ background: "hsl(var(--rec-card,var(--card)))", border: "1px solid hsl(var(--rec-border,var(--border)))", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
      <div className="h-1.5" style={{ background: AMBER_CTA }} />
      <div className="p-6">
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: AMBER_CTA, boxShadow: "0 8px 28px rgba(201,168,76,0.4)" }}
          animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Wand2 size={28} className="text-white" strokeWidth={1.8} />
        </motion.div>
        <h3 className="text-lg font-bold text-center mb-1">Create Your Card</h3>
        <p className="text-xs text-center mb-5 leading-relaxed text-muted-foreground">Free · 2 minutes · No credit card</p>
        <div className="space-y-2 mb-5">
          {["AI-generated invitation", "Bride & groom photos", "Password protection", "Shareable link"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.15)" }}>
                <Check size={10} style={{ color: "#C9A84C" }} />
              </div>
              <span className="text-xs text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden text-white"
          style={{ background: AMBER_CTA, boxShadow: "0 8px 28px rgba(201,168,76,0.4)" }}>
          <motion.div className="absolute inset-0 opacity-25"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
          <Wand2 size={16} /> Create My Invitation
          <ChevronRight size={14} strokeWidth={2.5} />
        </motion.button>
        <p className="text-center text-[10px] mt-2 text-muted-foreground">🎊 Free · No sign-up cost · 2 minutes</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop 2-col */}
      <div className="hidden lg:flex gap-10 px-10 pt-12 pb-16 items-start max-w-5xl mx-auto">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 rounded-full bg-border" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">For You</span>
              <div className="h-px flex-1 rounded-full bg-border" />
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2">
              Create Your Own<br />
              <span style={{ background: AMBER_SOFT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Reception Invitation
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Inspired by {data.brideName} &amp; {data.groomName}&apos;s reception? Create a personalised one for your own special celebration — with AI, photos, and a shareable link.
            </p>
          </div>

          {/* Inspiration strip */}
          <div className="rounded-2xl overflow-hidden border border-border">
            <div className="h-0.5" style={{ background: AMBER_CTA }} />
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "hsl(var(--rec-surface,var(--muted)/0.3))" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: AMBER_GRADIENT }}>🎊</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">
                  Celebrating <span style={{ color: "#C9A84C" }}>{data.brideName} &amp; {data.groomName}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Now create your own reception invitation →</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>

          {/* Feature grid */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Everything included</p>
            <div className="grid grid-cols-3 gap-3">
              {RECEPTION_FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
                <motion.div key={label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="rounded-2xl p-4 cursor-pointer border border-border bg-card">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                    <Icon size={17} style={{ color }} strokeWidth={1.8} />
                  </div>
                  <p className="text-xs font-bold mb-1">{label}</p>
                  <p className="text-[10px] leading-snug text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reception Moments */}
          <div className="rounded-2xl p-4 bg-card border border-border">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Reception Moments</p>
            <div className="flex flex-wrap gap-2">
              {RECEPTION_MOMENTS.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: `${t.color}18`, border: `1px solid ${t.color}40` }}>
                  <span className="text-sm">{t.emoji}</span>
                  <span className="text-[11px] font-semibold" style={{ color: t.color }}>{t.name}</span>
                  <span className="text-[10px] text-muted-foreground">· {t.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-72 shrink-0">{CtaCard}</div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden pb-28">
        <div className="relative px-5 pt-10 pb-6 text-center overflow-hidden">
          {[["#C9A84C", "5%", "10%", 140], ["#ec4899", "75%", "5%", 120], ["#8b5cf6", "80%", "60%", 100]].map(([c, x, y, s], i) => (
            <div key={i} className="absolute pointer-events-none rounded-full"
              style={{ width: +s, height: +s, left: x as string, top: y as string, background: `radial-gradient(circle,${c}30 0%,transparent 70%)`, filter: "blur(28px)" }} />
          ))}
          <motion.div className="inline-flex items-center justify-center mb-5"
            animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
              style={{ background: AMBER_CTA, boxShadow: "0 12px 40px rgba(201,168,76,0.4)" }}>
              <Wand2 size={36} className="text-white" strokeWidth={1.8} />
            </div>
          </motion.div>
          <div className="h-0.5 w-16 mx-auto rounded-full mb-4" style={{ background: AMBER_CTA }} />
          <h1 className="text-2xl font-bold mb-2">
            Create Your Own<br />
            <span style={{ background: AMBER_SOFT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Reception Invitation
            </span>
          </h1>
          <p className="text-sm leading-relaxed mx-auto max-w-[260px] text-muted-foreground">
            Inspired by this reception? Create one for your own celebration.
          </p>
        </div>

        <div className="px-5 mb-5">
          <div className="rounded-2xl overflow-hidden border border-border">
            <div className="h-0.5" style={{ background: AMBER_CTA }} />
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: "hsl(var(--rec-surface,var(--muted)/0.3))" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER_GRADIENT }}>🎊</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{data.brideName} &amp; {data.groomName} — now your turn</p>
                <p className="text-[10px] text-muted-foreground">Create your own invitation →</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="px-5 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Everything included</p>
          <div className="grid grid-cols-2 gap-3">
            {RECEPTION_FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="rounded-2xl p-3.5 bg-card border border-border">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold mb-0.5">{label}</p>
                <p className="text-[10px] leading-snug text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 relative overflow-hidden text-white"
            style={{ background: AMBER_CTA, boxShadow: "0 12px 40px rgba(201,168,76,0.4)" }}>
            <motion.div className="absolute inset-0 opacity-20"
              style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
              animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
            <Wand2 size={19} strokeWidth={2} /> Start Creating Now <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
          <p className="text-center text-[11px] mt-2.5 text-muted-foreground">
            🎊 Free · No credit card · Ready in 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Inline Create Sheet
───────────────────────────────────────── */
type SheetStep = "choose" | "ai" | "ai-result";

function InlineCreateSheet({ accessToken, onClose, onOpenInEditor }: {
  accessToken: string | null;
  onClose: () => void;
  onOpenInEditor: (prefill?: { brideName?: string; groomName?: string; aiPrompt?: string }) => void;
}) {
  const [step, setStep] = useState<SheetStep>("choose");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ tagline: string; brideDesc: string; groomDesc: string } | null>(null);
  const [genError, setGenError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "ai") setTimeout(() => nameRef.current?.focus(), 300);
  }, [step]);

  const handleGenerate = useCallback(async () => {
    if (!brideName.trim() && !groomName.trim()) return;
    setAiLoading(true); setGenError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          prompt: `Reception invitation for ${brideName.trim() || "the bride"} & ${groomName.trim() || "the groom"}. ${aiPrompt}`,
          templateId: "reception",
          templateType: "reception",
        }),
      });
      const d = await res.json();
      const data = d.data || d;
      setAiResult({
        tagline: data.tagline || "Request the pleasure of your company",
        brideDesc: data.brideDescription || data.body || "",
        groomDesc: data.groomDescription || "",
      });
      setStep("ai-result");
    } catch {
      setGenError("Generation failed. Please try again!");
    } finally {
      setAiLoading(false);
    }
  }, [brideName, groomName, aiPrompt, accessToken]);

  const inputStyle: React.CSSProperties = {
    background: "hsl(var(--muted)/0.5)",
    border: "1px solid hsl(var(--border))",
    color: "hsl(var(--foreground))",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end lg:items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />

      <motion.div
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative w-full max-w-lg lg:rounded-3xl rounded-t-3xl overflow-hidden bg-background border border-border"
        style={{ boxShadow: "0 -20px 80px rgba(0,0,0,0.35)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        <div className="h-1 shrink-0" style={{ background: AMBER_CTA }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {step !== "choose" && (
              <button onClick={() => setStep(step === "ai-result" ? "ai" : "choose")}
                className="p-1.5 rounded-xl hover:opacity-70 transition-opacity mr-1 text-muted-foreground bg-muted">
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold">
                {step === "choose" && "🎊 Create Your Reception Invitation"}
                {step === "ai" && "✨ AI Reception Generator"}
                {step === "ai-result" && "🎉 Invitation Preview Ready!"}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {step === "choose" && "Free · 2 minutes · No credit card"}
                {step === "ai" && "Tell AI about the couple & reception"}
                {step === "ai-result" && "Preview & open in the editor"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:opacity-70 transition-opacity text-muted-foreground bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1">
          <AnimatePresence mode="wait">

            {/* Choose step */}
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }} className="px-5 pb-6 space-y-3 pt-1">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("ai")}
                  className="w-full text-left rounded-2xl p-4 relative overflow-hidden text-white"
                  style={{ background: AMBER_CTA, boxShadow: "0 8px 28px rgba(201,168,76,0.4)" }}>
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.7) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <Wand2 size={20} className="text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold">AI Magic</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>RECOMMENDED</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">Describe the couple & AI writes a personalised reception invitation in seconds</p>
                    </div>
                    <ChevronRight size={16} className="text-white/70 shrink-0 mt-0.5" />
                  </div>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenInEditor()}
                  className="w-full text-left rounded-2xl p-4 bg-muted border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.15)" }}>
                      <PenLine size={20} style={{ color: "#6366F1" }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1">Fill Manually</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Upload reception card, add photos, set venue details & gallery yourself
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </motion.button>

                <p className="text-center text-[10px] pt-1 text-muted-foreground">
                  🎊 Both options are completely free
                </p>
              </motion.div>
            )}

            {/* AI Form step */}
            {step === "ai" && (
              <motion.div key="ai" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }} className="px-5 pb-6 pt-1 space-y-3">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <User size={11} /> Bride Name *
                    </label>
                    <input ref={nameRef} value={brideName} onChange={(e) => setBrideName(e.target.value)}
                      placeholder="e.g. Priya…" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <User size={11} /> Groom Name
                    </label>
                    <input value={groomName} onChange={(e) => setGroomName(e.target.value)}
                      placeholder="e.g. Arjun…" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles size={11} /> Describe the reception (optional)
                  </label>
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A luxury evening reception at The Grand Ballroom, Jaipur, elegant Rajasthani theme…"
                    rows={3} style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }} />
                </div>

                <AnimatePresence>
                  {genError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs flex items-center gap-1.5" style={{ color: "rgb(239,68,68)" }}>
                      <ShieldAlert size={12} />{genError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerate}
                  disabled={aiLoading || (!brideName.trim() && !groomName.trim())}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 text-white"
                  style={{ background: AMBER_CTA, boxShadow: "0 8px 24px rgba(201,168,76,0.3)" }}>
                  {!aiLoading && (
                    <motion.div className="absolute inset-0 opacity-20"
                      style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
                  )}
                  {aiLoading
                    ? <><Loader2 size={16} className="animate-spin" />Generating invitation…</>
                    : <><Zap size={16} />Generate Reception Invitation</>}
                </motion.button>
                <p className="text-center text-[10px] text-muted-foreground">✨ Powered by AI · Takes ~5 seconds</p>
              </motion.div>
            )}

            {/* AI Result step */}
            {step === "ai-result" && aiResult && (
              <motion.div key="ai-result" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }} className="px-5 pb-6 pt-1 space-y-3">

                <div className="rounded-2xl overflow-hidden bg-muted border border-border">
                  <div className="h-0.5" style={{ background: AMBER_CTA }} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: AMBER_GRADIENT }}>
                        <Sparkles size={13} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground">AI generated for</p>
                        <p className="text-xs font-bold">{brideName} &amp; {groomName}</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold mb-1" style={{ color: "#C9A84C" }}>Tagline</p>
                    <p className="text-xs leading-relaxed italic mb-3"
                      style={{ borderLeft: "2px solid #C9A84C", paddingLeft: "10px" }}>
                      &ldquo;{aiResult.tagline}&rdquo;
                    </p>
                    {aiResult.brideDesc && (
                      <>
                        <p className="text-xs font-semibold mb-1" style={{ color: "#ec4899" }}>About the Bride</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {aiResult.brideDesc.slice(0, 120)}{aiResult.brideDesc.length > 120 ? "…" : ""}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-3" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold" style={{ color: "#C9A84C" }}>Next:</span>
                    {" "}Add couple photos, upload reception card, set venue details, gallery, and publish your shareable link — all in the editor.
                  </p>
                </div>

                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => onOpenInEditor({ brideName, groomName, aiPrompt })}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden text-white"
                  style={{ background: AMBER_CTA, boxShadow: "0 8px 28px rgba(201,168,76,0.4)" }}>
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
                  <Edit3 size={15} /> Edit &amp; Save in Editor
                  <ChevronRight size={14} strokeWidth={2.5} />
                </motion.button>

                <button onClick={() => { setStep("ai"); setAiResult(null); }}
                  className="w-full py-2.5 rounded-xl text-xs font-medium hover:opacity-70 transition-opacity text-muted-foreground bg-muted">
                  ↩ Regenerate with different details
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Right Panel (xl+)
───────────────────────────────────────── */
function ViewerRightPanel({ data, onCreateTab, onStart }: { data: ReceptionData; onCreateTab: () => void; onStart: () => void }) {
  return (
    <aside className="hidden xl:flex fixed right-0 top-0 h-full w-72 flex-col z-50 overflow-y-auto no-scrollbar bg-card border-l border-border">
      <div className="h-1 shrink-0" style={{ background: AMBER_CTA }} />

      {/* CTA section */}
      <div className="p-5 shrink-0 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ background: AMBER_CTA }}>
            <Wand2 size={15} />
          </motion.div>
          <div>
            <p className="text-xs font-bold">Create Your Card</p>
            <p className="text-[10px] text-muted-foreground">Free · 2 minutes</p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed mb-4 text-muted-foreground">
          Loved {data.brideName} &amp; {data.groomName}&apos;s reception invite? Make a personalised one with AI-generated content and photos.
        </p>

        <div className="space-y-1.5 mb-4">
          {["AI-generated wishes", "Couple photos & gallery", "Password protection", "Shareable link"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Sparkles size={10} style={{ color: "#C9A84C" }} />
              <span className="text-[11px] text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden text-white"
          style={{ background: AMBER_CTA, boxShadow: "0 6px 20px rgba(201,168,76,0.35)" }}>
          <motion.div className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2 }} />
          <Wand2 size={14} /> Start Creating
        </motion.button>

        <button onClick={onCreateTab} className="w-full mt-2 py-1.5 text-[11px] font-medium hover:opacity-80 transition-all text-muted-foreground">
          See what&apos;s included →
        </button>
      </div>

      {/* Reception Moments */}
      <div className="p-5 shrink-0 border-b border-border">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-muted-foreground">Reception Moments</p>
        <div className="space-y-2">
          {RECEPTION_MOMENTS.map((t) => (
            <div key={t.name} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
                style={{ background: `${t.color}22` }}>{t.emoji}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: t.color }}>{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reception Date */}
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-muted-foreground">Reception Date</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
          <span className="text-lg">🎊</span>
          <div>
            <p className="text-xs font-semibold">
              {data.receptionDate
                ? new Date(data.receptionDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "Date TBD"
              }
            </p>
            <p className="text-[10px] text-muted-foreground">{data.brideName} &amp; {data.groomName} · {data.venueTimings}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Main Viewer
───────────────────────────────────────── */
interface ReceptionViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

export default function ReceptionViewer({ rawData, shareId, hasPassword }: ReceptionViewerProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const [tab, setTab] = useState<ViewerTabId>("home");
  const [data, setData] = useState<ReceptionData>(mapData(rawData));
  const [copied, setCopied] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  // Password gate
  const [locked, setLocked] = useState(hasPassword);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Blessings
  const [blessingName, setBlessingName] = useState("");
  const [blessingMsg, setBlessingMsg] = useState("");
  const [blessingLoading, setBlessingLoading] = useState(false);
  const [blessingDone, setBlessingDone] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rec-viewer-theme");
    if (saved === "light") setDarkMode(false);
    else setDarkMode(true);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("rec-viewer-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("rec-viewer-theme", "light");
    }
  }, [darkMode, themeReady]);

  const verifyPassword = useCallback(async () => {
    if (!pw.trim()) return;
    setPwLoading(true); setPwError("");
    try {
      const res = await fetch(`${API_URL}/reception-pages/share/${shareId}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.verified) { setLocked(false); }
      else { setPwError("Wrong password. Please try again."); }
    } catch { setPwError("Verification failed. Please try again."); }
    finally { setPwLoading(false); }
  }, [pw, shareId]);

  const submitBlessing = useCallback(async () => {
    if (!blessingName.trim() || !blessingMsg.trim()) return;
    setBlessingLoading(true);
    try {
      const res = await fetch(`${API_URL}/reception-pages/share/${shareId}/blessings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: blessingName.trim(), message: blessingMsg.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        setData((prev) => ({
          ...prev,
          wishes: (result.data as { name: string; message: string }[]).map((b) => ({ name: b.name, message: b.message })),
        }));
        setBlessingDone(true);
        setBlessingName(""); setBlessingMsg("");
        setTimeout(() => setBlessingDone(false), 3000);
      }
    } catch { /* ignore */ }
    setBlessingLoading(false);
  }, [blessingName, blessingMsg, shareId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleTabChange = useCallback((id: ViewerTabId) => { setTab(id); setMoreOpen(false); }, []);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  const handleStartCreating = useCallback(() => {
    if (!isAuthenticated) { setShowAuthModal(true); }
    else { setShowCreateSheet(true); }
  }, [isAuthenticated]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setShowCreateSheet(true);
  }, []);

  const handleOpenInEditor = useCallback((prefill?: { brideName?: string; groomName?: string; aiPrompt?: string }) => {
    if (prefill) sessionStorage.setItem("reception_prefill", JSON.stringify(prefill));
    router.push("/reception");
  }, [router]);

  if (!themeReady) return null;

  // Password gate
  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 bg-background">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm rounded-3xl p-8 text-center bg-card border border-border">
          <div className="h-1 w-full rounded-full mb-6" style={{ background: AMBER_CTA }} />
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: AMBER_GRADIENT }}>
            <Lock size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">🎊 Password Protected</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {data.brideName} &amp; {data.groomName}&apos;s reception invitation is protected. Enter the password to view.
          </p>
          <div className="relative mb-3">
            <input value={pw} onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
              type={showPw ? "text" : "password"} placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm pr-10" />
            <button onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwError && (
            <p className="text-xs text-red-500 flex items-center gap-1 mb-3 justify-center">
              <ShieldAlert size={12} />{pwError}
            </p>
          )}
          <button onClick={verifyPassword} disabled={pwLoading || !pw.trim()}
            className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: AMBER_GRADIENT }}>
            {pwLoading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : "View Reception Invitation 🎊"}
          </button>
        </motion.div>
      </div>
    );
  }

  const moreItems = [
    {
      icon: darkMode ? Sun : Moon,
      label: darkMode ? "Light" : "Dark",
      color: darkMode ? "#C9A84C" : "#8b5cf6",
      bg: darkMode ? "rgba(201,168,76,0.12)" : "rgba(139,92,246,0.12)",
      action: () => { toggleDark(); setMoreOpen(false); },
    },
    {
      icon: ArrowLeft, label: "Back",
      color: "hsl(var(--muted-foreground))", bg: "rgba(0,0,0,0.05)",
      action: () => { setMoreOpen(false); router.back(); },
    },
  ];

  return (
    <div className="h-screen relative overflow-hidden bg-background">

      {/* Background image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/assets/Reception/reception.png" alt="" fill priority
          className="object-cover object-center" sizes="100vw" style={{ opacity: 0.04 }} />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      {/* ── Desktop left sidebar ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col z-50 bg-card border-r border-border">
        {/* Hero header */}
        <div className="relative h-28 overflow-hidden shrink-0">
          <Image src="/assets/Reception/reception.png" alt="" fill className="object-cover object-center" sizes="240px" style={{ opacity: 0.1 }} />
          <div className="absolute inset-0" style={{ background: AMBER_GRADIENT, opacity: 0.75 }} />
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: AMBER_CTA }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div className="text-3xl mb-1"
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>🎊</motion.div>
            <h1 className="text-sm font-bold text-white drop-shadow-md">Reception</h1>
            <p className="text-[11px] text-white/70 mt-0.5">Wedding Reception</p>
          </div>
        </div>

        {/* Couple info */}
        <div className="px-4 py-4 shrink-0 border-b border-border">
          <div className="flex justify-center gap-2 mb-3">
            <CoupleAvatar name={data.brideName} photo={data.bride.photo} role="Bride" />
            <div className="flex items-center self-center text-lg" style={{ color: "#C9A84C" }}>🎊</div>
            <CoupleAvatar name={data.groomName} photo={data.groom.photo} role="Groom" />
          </div>
          <div className="text-center mb-2">
            <p className="text-sm font-bold" style={{ background: AMBER_SOFT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {data.brideName} &amp; {data.groomName}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 italic">{data.tagline}</p>
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">
            <MapPin size={10} style={{ color: "#C9A84C" }} />
            <span className="truncate max-w-[160px]">{data.venue || "Venue TBD"}</span>
          </div>
          {data.venueTimings && (
            <p className="text-center text-[10px] text-muted-foreground">{data.venueTimings}</p>
          )}
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {TABS.map(({ id, label }) => {
            const Icon = TAB_ICONS[id];
            const active = tab === id;
            return (
              <button key={id} onClick={() => handleTabChange(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm"
                style={{
                  background: active ? "rgba(201,168,76,0.12)" : "transparent",
                  color: active ? "#C9A84C" : "hsl(var(--muted-foreground))",
                  fontWeight: active ? 600 : 400,
                  border: `1px solid ${active ? "rgba(201,168,76,0.2)" : "transparent"}`,
                }}>
                <Icon size={16} strokeWidth={active ? 2.2 : 1.5} />
                <span>{label}</span>
                {active && <motion.div layoutId="rec-viewer-sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#C9A84C" }} />}
              </button>
            );
          })}

          {/* Divider */}
          <div className="h-px mx-2 my-2 bg-border" />

          {/* Create Yours CTA */}
          <motion.button onClick={() => handleTabChange("create")} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left relative overflow-hidden text-sm"
            style={{
              background: tab === "create" ? AMBER_CTA : "rgba(201,168,76,0.10)",
              color: tab === "create" ? "#fff" : "#C9A84C",
              fontWeight: 600,
              border: `1px solid ${tab === "create" ? "transparent" : "rgba(201,168,76,0.22)"}`,
              boxShadow: tab === "create" ? "0 4px 20px rgba(201,168,76,0.35)" : "none",
            }}>
            {tab !== "create" && (
              <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ border: "1px solid rgba(201,168,76,0.4)" }}
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
            )}
            <Wand2 size={16} strokeWidth={2} />
            <span>Create Yours</span>
            {tab !== "create" && (
              <motion.span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: AMBER_GRADIENT }}
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                FREE
              </motion.span>
            )}
          </motion.button>
        </nav>

        {/* Footer */}
        <div className="p-3 shrink-0 border-t border-border">
          <button onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white mb-2"
            style={{ background: AMBER_GRADIENT }}>
            {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share Invitation</>}
          </button>
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium hover:opacity-80 transition-all text-muted-foreground bg-muted">
              <ArrowLeft size={13} /> Back
            </button>
            <button onClick={toggleDark} className="p-2 rounded-lg hover:opacity-80 transition-all text-muted-foreground">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Right panel (xl+) ─────────────────────────────────────────────── */}
      <ViewerRightPanel data={data} onCreateTab={() => handleTabChange("create")} onStart={handleStartCreating} />

      {/* ── Mobile floating bottom nav ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
        <div className="flex justify-center mb-3 pointer-events-auto">
          <AnimatePresence>
            {moreOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setMoreOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-[3px] -z-10" />
                <motion.div className="absolute bottom-full mb-3 flex gap-3"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                  {moreItems.map((item, i) => (
                    <motion.button key={item.label}
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }} transition={{ delay: i * 0.04 }}
                      onClick={item.action} className="flex flex-col items-center gap-1">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{ background: item.bg, border: `1px solid ${item.bg}` }}>
                        <item.icon size={17} style={{ color: item.color }} strokeWidth={1.8} />
                      </div>
                      <span className="text-[8px] font-medium text-muted-foreground">{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Floating nav pill */}
          <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-card/92 border border-border"
            style={{ backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>

            {TABS.map(({ id, label }) => {
              const Icon = TAB_ICONS[id];
              const active = tab === id && !moreOpen;
              return (
                <button key={id} onClick={() => handleTabChange(id)} className="relative flex flex-col items-center py-1 px-2.5">
                  {active ? (
                    <motion.div layoutId="rec-viewer-nav-active"
                      className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ background: AMBER_GRADIENT, boxShadow: "0 4px 16px rgba(201,168,76,0.55)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                      <Icon size={18} strokeWidth={2} />
                    </motion.div>
                  ) : (
                    <Icon size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  )}
                  <span className="text-[9px] font-semibold"
                    style={{ color: active ? "#C9A84C" : "hsl(var(--muted-foreground))", marginTop: active ? "1.25rem" : "0.125rem" }}>
                    {label}
                  </span>
                </button>
              );
            })}

            <div className="w-px h-7 mx-0.5 bg-border" />

            {/* Create tab */}
            <button onClick={() => handleTabChange("create")} className="relative flex flex-col items-center py-1 px-2">
              {tab === "create" && !moreOpen ? (
                <motion.div layoutId="rec-viewer-nav-active"
                  className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ background: AMBER_CTA, boxShadow: "0 4px 16px rgba(201,168,76,0.5)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                  <Wand2 size={18} strokeWidth={2} />
                </motion.div>
              ) : (
                <div className="relative">
                  <Wand2 size={18} strokeWidth={1.5} style={{ color: "#C9A84C" }} />
                  <motion.div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: "#C9A84C" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }} />
                </div>
              )}
              <span className="text-[9px] font-bold"
                style={{ color: "#C9A84C", marginTop: tab === "create" && !moreOpen ? "1.25rem" : "0.125rem" }}>
                Create
              </span>
            </button>

            <div className="w-px h-7 mx-0.5 bg-border" />

            {/* More */}
            <button onClick={() => setMoreOpen((o) => !o)} className="relative flex flex-col items-center py-1 px-2">
              {moreOpen ? (
                <motion.div layoutId="rec-viewer-nav-active"
                  className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center bg-muted border border-border"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                  <MoreHorizontal size={18} strokeWidth={2} />
                </motion.div>
              ) : (
                <MoreHorizontal size={18} strokeWidth={1.5} className="text-muted-foreground" />
              )}
              <span className="text-[9px] font-semibold"
                style={{ color: moreOpen ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))", marginTop: moreOpen ? "1.25rem" : "0.125rem" }}>
                More
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="h-full overflow-y-auto no-scrollbar pb-24 lg:pb-0 lg:ml-60 xl:mr-72 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={tab} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" className="h-full">
            <Suspense fallback={<TabFallback />}>
              {tab === "home"     && <SplashSection data={data} />}
              {tab === "couple"   && <CoupleReveal data={data} />}
              {tab === "gallery"  && <GallerySection data={data} />}
              {tab === "location" && <LocationSection data={data} />}
              {tab === "blessings" && (
                <BlessingsContent data={data}
                  blessingName={blessingName} blessingMsg={blessingMsg}
                  setBlessingName={setBlessingName} setBlessingMsg={setBlessingMsg}
                  onSubmit={submitBlessing} loading={blessingLoading} done={blessingDone}
                />
              )}
              {tab === "create" && (
                <CreateSection data={data} onStart={handleStartCreating} />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile share button */}
      <div className="fixed top-3 right-3 z-40 lg:hidden">
        <button onClick={handleShare}
          className="p-2.5 rounded-xl text-muted-foreground bg-card/85 border border-border"
          style={{ backdropFilter: "blur(12px)" }}>
          {copied ? <Check size={16} style={{ color: "#C9A84C" }} /> : <Copy size={16} />}
        </button>
      </div>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
        )}
      </AnimatePresence>

      {/* Inline Create Sheet */}
      <AnimatePresence>
        {showCreateSheet && (
          <InlineCreateSheet
            accessToken={accessToken}
            onClose={() => setShowCreateSheet(false)}
            onOpenInEditor={(prefill) => { setShowCreateSheet(false); handleOpenInEditor(prefill); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Couple avatar helper ───────────────────────────────────────────────────────
function CoupleAvatar({ name, photo, role }: { name: string; photo: string; role: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center text-lg"
        style={{ borderColor: "#C9A84C", background: AMBER_GRADIENT }}>
        {photo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photo} alt={name} className="w-full h-full object-cover" />
          : <span className="text-white">{role === "Bride" ? "👰" : "🤵"}</span>
        }
      </div>
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{name || role}</span>
    </div>
  );
}

// ── Blessings wall ────────────────────────────────────────────────────────────
function BlessingsContent({ data, blessingName, blessingMsg, setBlessingName, setBlessingMsg, onSubmit, loading, done }: {
  data: ReceptionData;
  blessingName: string; blessingMsg: string;
  setBlessingName: (v: string) => void; setBlessingMsg: (v: string) => void;
  onSubmit: () => void; loading: boolean; done: boolean;
}) {
  const CARD_COLORS = [
    "from-amber-500/10 to-yellow-500/5 border-amber-500/20",
    "from-rose-500/10 to-pink-500/5 border-rose-500/20",
    "from-violet-500/10 to-purple-500/5 border-violet-500/20",
    "from-emerald-500/10 to-green-500/5 border-emerald-500/20",
  ];
  return (
    <div className="min-h-screen p-5 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">🙏</p>
          <h2 className="text-2xl font-bold mb-1">Blessings Wall</h2>
          <p className="text-sm text-muted-foreground">
            Leave your heartfelt blessings for {data.brideName} &amp; {data.groomName}
          </p>
        </div>
        <div className="rounded-2xl p-5 mb-8 bg-card border border-border">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span style={{ color: "#C9A84C" }}>✨</span> Add Your Blessing
          </h3>
          <div className="space-y-3">
            <input value={blessingName} onChange={(e) => setBlessingName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm" />
            <textarea value={blessingMsg} onChange={(e) => setBlessingMsg(e.target.value)}
              placeholder="Write your heartfelt blessing for the couple… 💕"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none text-sm resize-none" />
            <button onClick={onSubmit} disabled={loading || !blessingName.trim() || !blessingMsg.trim()}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              style={{ background: AMBER_GRADIENT }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                : done ? <><Check size={16} /> Blessing Sent! 🎊</>
                  : "Send Blessing 🙏"}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">
          {data.wishes.length} Blessing{data.wishes.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-3">
          {data.wishes.map((wish, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl bg-gradient-to-br border ${CARD_COLORS[i % CARD_COLORS.length]}`}>
              <p className="text-sm leading-relaxed mb-2">{wish.message}</p>
              <p className="text-xs font-bold text-muted-foreground">— {wish.name}</p>
            </motion.div>
          ))}
          {data.wishes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-3xl mb-3">🙏</p>
              <p className="text-sm">Be the first to leave a blessing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Map raw DB data → ReceptionData ──────────────────────────────────────────
function mapData(d: Record<string, unknown>): ReceptionData {
  const blessings = (d.blessings as { name: string; message: string }[] | undefined) || [];
  const dbWishes = (d.wishes as { name: string; message: string }[] | undefined) || [];
  const allWishes = blessings.length > 0 ? blessings : dbWishes;

  return {
    brideName: (d.brideName as string) || DEMO_DATA.brideName,
    groomName: (d.groomName as string) || DEMO_DATA.groomName,
    receptionDate: (d.receptionDate as string) || DEMO_DATA.receptionDate,
    venue: (d.venue as string) || DEMO_DATA.venue,
    venueAddress: (d.venueAddress as string) || DEMO_DATA.venueAddress,
    venueMapQuery: (d.venueMapQuery as string) || DEMO_DATA.venueMapQuery,
    venueTimings: (d.venueTimings as string) || DEMO_DATA.venueTimings,
    tagline: (d.tagline as string) || DEMO_DATA.tagline,
    heroImage: (d.heroImage as string) || DEMO_DATA.heroImage,
    bride: {
      name: (d.bride as Record<string, string>)?.name || DEMO_DATA.bride.name,
      role: (d.bride as Record<string, string>)?.role || "The Bride",
      description: (d.bride as Record<string, string>)?.description || DEMO_DATA.bride.description,
      photo: (d.bride as Record<string, string>)?.photo || "",
      tags: (d.bride as Record<string, unknown>)?.tags as { emoji: string; label: string }[] || DEMO_DATA.bride.tags,
    },
    groom: {
      name: (d.groom as Record<string, string>)?.name || DEMO_DATA.groom.name,
      role: (d.groom as Record<string, string>)?.role || "The Groom",
      description: (d.groom as Record<string, string>)?.description || DEMO_DATA.groom.description,
      photo: (d.groom as Record<string, string>)?.photo || "",
      tags: (d.groom as Record<string, unknown>)?.tags as { emoji: string; label: string }[] || DEMO_DATA.groom.tags,
    },
    families: {
      bride: (d.families as Record<string, string>)?.bride || DEMO_DATA.families.bride,
      groom: (d.families as Record<string, string>)?.groom || DEMO_DATA.families.groom,
    },
    galleryImages: (d.galleryImages as { src: string; alt: string; span: string; category: string }[]) || DEMO_DATA.galleryImages,
    wishes: allWishes.map((b) => ({ name: b.name, message: b.message })),
  };
}
