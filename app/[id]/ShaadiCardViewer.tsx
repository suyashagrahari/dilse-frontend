"use client";

import { useState, useCallback, useEffect, useRef, lazy, Suspense, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Home, Heart, Calendar, Camera, HandHeart,
  Lock, Eye, EyeOff, ShieldAlert, Loader2,
  Share2, Check, Wand2, PenLine, ChevronRight,
  Sparkles, User, X, Edit3, Zap, Send, ArrowLeft,
} from "lucide-react";
import { type ShaadiData, type TabId, TABS, DEMO_DATA } from "@/app/(templates)/shaadi-card/components/types";
import AuthModal from "@/components/AuthModal";
import { useAppSelector } from "@/store/hooks";
import { API_URL, IS_NGROK, SITE_URL } from "@/lib/config";

const ShaadiBackgroundMusic = lazy(() => import("@/app/(templates)/shaadi-card/components/ShaadiBackgroundMusic"));
const HomeSection    = lazy(() => import("@/app/(templates)/shaadi-card/components/HomeSection"));
const CoupleSection  = lazy(() => import("@/app/(templates)/shaadi-card/components/CoupleSection"));
const EventsSection  = lazy(() => import("@/app/(templates)/shaadi-card/components/EventsSection"));
const GallerySection = lazy(() => import("@/app/(templates)/shaadi-card/components/GallerySection"));
const WishesSection  = lazy(() => import("@/app/(templates)/shaadi-card/components/WishesSection"));

const C_ACCENT = "#AB1C3E";
const C_MED    = "#CB6B82";
const C_DARK   = "#6D2B3B";
const C_BG     = "#FDF5F0";
const C_CARD   = "#FFFAF8";
const ROSE_CTA = `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`;
const ROSE_SOFT = `linear-gradient(135deg, ${C_MED}, #E8829A)`;

type ViewerTabId = TabId | "create";

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
} as const;

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home, couple: Heart, events: Calendar, gallery: Camera, blessings: HandHeart,
};

const SHAADI_FEATURES = [
  { icon: Wand2,     color: C_ACCENT, bg: `${C_ACCENT}15`, label: "AI Creation",      desc: "Generate invite instantly" },
  { icon: Camera,    color: C_MED,    bg: `${C_MED}15`,    label: "Couple Photos",    desc: "Bride & groom portraits" },
  { icon: Lock,      color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Password Protect", desc: "Keep it private" },
  { icon: Share2,    color: "#38BDF8", bg: "rgba(56,189,248,0.12)", label: "Instant Share",    desc: "One link, anyone" },
  { icon: HandHeart, color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Blessings Wall",   desc: "Collect wishes" },
  { icon: Sparkles,  color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Always Free",      desc: "No cost, ever" },
];

function TabFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: C_BG }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: C_ACCENT, borderTopColor: "transparent" }} />
    </div>
  );
}

// ── Map raw DB data → ShaadiData ──────────────────────────────────────────────
function mapData(d: Record<string, unknown>): ShaadiData {
  return {
    ...DEMO_DATA,
    brideName: (d.brideName as string) || DEMO_DATA.brideName,
    groomName: (d.groomName as string) || DEMO_DATA.groomName,
    weddingDate: (d.weddingDate as string) || DEMO_DATA.weddingDate,
    venue: (d.venue as string) || DEMO_DATA.venue,
    blessing: (d.blessing as string) || DEMO_DATA.blessing,
    bride: {
      ...DEMO_DATA.bride,
      name: (d.brideName as string) || DEMO_DATA.bride.name,
      photo: (d.bridePhoto as string) || "",
      description: (d.brideDescription as string) || DEMO_DATA.bride.description,
      tags: (d.brideTags as { emoji: string; label: string }[]) || DEMO_DATA.bride.tags,
    },
    groom: {
      ...DEMO_DATA.groom,
      name: (d.groomName as string) || DEMO_DATA.groom.name,
      photo: (d.groomPhoto as string) || "",
      description: (d.groomDescription as string) || DEMO_DATA.groom.description,
      tags: (d.groomTags as { emoji: string; label: string }[]) || DEMO_DATA.groom.tags,
    },
    brideFamily: {
      title: "Bride's Family",
      parents: (d.brideFamilyParents as string) || DEMO_DATA.brideFamily.parents,
      grandparents: (d.brideFamilyGrandparents as string) || DEMO_DATA.brideFamily.grandparents,
    },
    groomFamily: {
      title: "Groom's Family",
      parents: (d.groomFamilyParents as string) || DEMO_DATA.groomFamily.parents,
      grandparents: (d.groomFamilyGrandparents as string) || DEMO_DATA.groomFamily.grandparents,
    },
    events: ((d.events as ShaadiData["events"]) || DEMO_DATA.events).map((ev) => ({
      ...ev,
      disabled: Boolean(ev.disabled),
      details: typeof ev.details === "string" ? ev.details : "",
    })),
    galleryImages: ((d.galleryImages as { src: string; alt: string }[]) || []).map((g, i) => ({
      src: g.src,
      alt: g.alt || `Photo ${i + 1}`,
      span: i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : "",
    })),
    wishes: ((d.blessings as { name: string; message: string; voiceUrl?: string }[]) || []).map((b) => ({
      name: b.name,
      message: b.message || "",
      ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}),
    })),
    sharePhoto: (d.sharePhoto as string) || "",
  };
}

// ── Create Section ────────────────────────────────────────────────────────────
function CreateSection({ data, onStart }: { data: ShaadiData; onStart: () => void }) {
  const CtaCard = (
    <div className="rounded-3xl overflow-hidden sticky top-8"
      style={{ background: C_CARD, border: `1px solid ${C_MED}30`, boxShadow: "0 20px 60px rgba(109,43,59,0.1)" }}>
      <div className="h-1.5" style={{ background: ROSE_CTA }} />
      <div className="p-6">
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"
          style={{ background: ROSE_CTA, boxShadow: `0 8px 28px ${C_ACCENT}40` }}
          animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Wand2 size={28} strokeWidth={1.8} />
        </motion.div>
        <h3 className="text-lg font-bold text-center mb-1" style={{ color: C_DARK }}>Create Your Card</h3>
        <p className="text-xs text-center mb-5 leading-relaxed" style={{ color: C_MED }}>Free · 2 minutes · No credit card</p>
        <div className="space-y-2 mb-5">
          {["Animated invitation card", "Bride & groom photos", "Password protection", "Shareable link"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C_ACCENT}15` }}>
                <Check size={10} style={{ color: C_ACCENT }} />
              </div>
              <span className="text-xs" style={{ color: C_MED }}>{f}</span>
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden text-white"
          style={{ background: ROSE_CTA, boxShadow: `0 8px 28px ${C_ACCENT}40` }}>
          <motion.div className="absolute inset-0 opacity-25"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
          <Wand2 size={16} /> Create My Invitation
          <ChevronRight size={14} strokeWidth={2.5} />
        </motion.button>
        <p className="text-center text-[10px] mt-2" style={{ color: C_MED }}>
          💍 Free · No sign-up cost · 2 minutes
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${C_BG} 0%, #FAE8E8 100%)` }}>
      <div className="hidden lg:flex gap-10 px-10 pt-12 pb-16 items-start max-w-5xl mx-auto">
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold leading-tight mb-2" style={{ color: C_DARK }}>
              Create Your Own<br />
              <span style={{ background: ROSE_SOFT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Wedding Invitation
              </span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: C_MED }}>
              Inspired by {data.brideName} &amp; {data.groomName}&apos;s invitation? Create one for your special day.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SHAADI_FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
              <motion.div key={label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="rounded-2xl p-4"
                style={{ background: C_CARD, border: `1px solid ${C_MED}25` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold mb-1" style={{ color: C_DARK }}>{label}</p>
                <p className="text-[10px] leading-snug" style={{ color: C_MED }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="w-72 shrink-0">{CtaCard}</div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden pb-28 px-5 pt-10 text-center">
        <motion.div className="inline-flex items-center justify-center mb-5 text-white w-20 h-20 rounded-3xl"
          style={{ background: ROSE_CTA, boxShadow: `0 12px 40px ${C_ACCENT}40` }}
          animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Wand2 size={36} strokeWidth={1.8} />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: C_DARK }}>
          Create Your Own<br />
          <span style={{ background: ROSE_SOFT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Wedding Invitation
          </span>
        </h1>
        <p className="text-sm leading-relaxed mx-auto max-w-[260px] mb-6" style={{ color: C_MED }}>
          Inspired by this invitation? Make one for your special day.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          {SHAADI_FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
            <div key={label} className="rounded-2xl p-3.5" style={{ background: C_CARD, border: `1px solid ${C_MED}25` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: bg }}>
                <Icon size={17} style={{ color }} strokeWidth={1.8} />
              </div>
              <p className="text-xs font-bold mb-0.5" style={{ color: C_DARK }}>{label}</p>
              <p className="text-[10px] leading-snug" style={{ color: C_MED }}>{desc}</p>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 relative overflow-hidden text-white"
          style={{ background: ROSE_CTA, boxShadow: `0 12px 40px ${C_ACCENT}40` }}>
          <motion.div className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
          <Wand2 size={19} strokeWidth={2} /> Start Creating Now <ChevronRight size={16} strokeWidth={2.5} />
        </motion.button>
        <p className="text-center text-[11px] mt-2.5" style={{ color: C_MED }}>
          💍 Free · No credit card · Ready in 2 minutes
        </p>
      </div>
    </div>
  );
}

// ── Inline Create Sheet ───────────────────────────────────────────────────────
type SheetStep = "choose" | "ai" | "ai-result";

function InlineCreateSheet({ accessToken, onClose, onOpenInEditor }: {
  accessToken: string | null;
  onClose: () => void;
  onOpenInEditor: (prefill?: { brideName?: string; groomName?: string; aiPrompt?: string }) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<SheetStep>("choose");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ blessing: string; brideDesc: string; groomDesc: string } | null>(null);
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
          prompt: `Wedding invitation for ${brideName.trim() || "the bride"} & ${groomName.trim() || "the groom"}. ${aiPrompt}`,
          templateId: "shaadi-card",
          templateType: "shaadi",
        }),
      });
      const d = await res.json();
      setAiResult({
        blessing: d.blessing || "ॐ शुभ विवाह",
        brideDesc: d.brideDescription || d.body || "",
        groomDesc: d.groomDescription || d.body || "",
      });
      setStep("ai-result");
    } catch {
      setGenError("Generation failed. Please try again!");
    } finally {
      setAiLoading(false);
    }
  }, [brideName, groomName, aiPrompt, accessToken]);

  const inputStyle: React.CSSProperties = {
    background: "#FDF5F0",
    border: `1px solid ${C_MED}30`,
    color: C_DARK,
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
        className="relative w-full max-w-lg lg:rounded-3xl rounded-t-3xl overflow-hidden"
        style={{ background: C_CARD, border: `1px solid ${C_MED}30`, boxShadow: `0 -20px 80px rgba(109,43,59,0.2)`, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        <div className="h-1 shrink-0" style={{ background: ROSE_CTA }} />

        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {step !== "choose" && (
              <button onClick={() => setStep(step === "ai-result" ? "ai" : "choose")}
                className="p-1.5 rounded-xl hover:opacity-70 transition-opacity mr-1"
                style={{ color: C_MED, background: `${C_ACCENT}10` }}>
                <ChevronRight size={15} style={{ transform: "rotate(180deg)" }} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold" style={{ color: C_DARK }}>
                {step === "choose" && "💍 Create Your Wedding Invitation"}
                {step === "ai" && "✨ AI Wedding Generator"}
                {step === "ai-result" && "🎊 Invitation Preview Ready!"}
              </h2>
              <p className="text-[10px]" style={{ color: C_MED }}>
                {step === "choose" && "Free · 2 minutes · No credit card"}
                {step === "ai" && "Tell AI about the couple & wedding"}
                {step === "ai-result" && "Preview & open in the editor"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:opacity-70 transition-opacity"
            style={{ color: C_MED, background: `${C_ACCENT}10` }}>
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1">
          <AnimatePresence mode="wait">
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }} className="px-5 pb-6 space-y-3 pt-1">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("ai")}
                  className="w-full text-left rounded-2xl p-4 relative overflow-hidden text-white"
                  style={{ background: ROSE_CTA, boxShadow: `0 8px 28px ${C_ACCENT}40` }}>
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
                      <p className="text-xs text-white/80 leading-relaxed">AI writes a personalised invitation for the couple in seconds</p>
                    </div>
                    <ChevronRight size={16} className="text-white/70 shrink-0 mt-0.5" />
                  </div>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { onClose(); router.push("/shaadi-card"); }}
                  className="w-full text-left rounded-2xl p-4"
                  style={{ background: C_BG, border: `1px solid ${C_MED}30` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.12)" }}>
                      <PenLine size={20} style={{ color: "#6366F1" }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1" style={{ color: C_DARK }}>Fill Manually</p>
                      <p className="text-xs leading-relaxed" style={{ color: C_MED }}>
                        Add photos, upload shaadi card, set events & gallery yourself
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: C_MED }} className="shrink-0 mt-0.5" />
                  </div>
                </motion.button>

                <p className="text-center text-[10px] pt-1" style={{ color: C_MED }}>
                  💍 Both options are completely free
                </p>
              </motion.div>
            )}

            {step === "ai" && (
              <motion.div key="ai" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }} className="px-5 pb-6 pt-1 space-y-3">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: C_MED }}>
                      <User size={11} /> Bride Name *
                    </label>
                    <input ref={nameRef} value={brideName} onChange={(e) => setBrideName(e.target.value)}
                      placeholder="e.g. Ananya…" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: C_MED }}>
                      <User size={11} /> Groom Name *
                    </label>
                    <input value={groomName} onChange={(e) => setGroomName(e.target.value)}
                      placeholder="e.g. Arjun…" style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: C_MED }}>
                    <Sparkles size={11} /> Describe the wedding (optional)
                  </label>
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A royal Rajasthani wedding in Udaipur with traditional ceremonies and elegant floral decor…"
                    rows={3} style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }} />
                </div>

                <AnimatePresence>
                  {genError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs flex items-center gap-1.5 text-red-500">
                      <ShieldAlert size={12} />{genError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerate}
                  disabled={aiLoading || (!brideName.trim() && !groomName.trim())}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 text-white"
                  style={{ background: ROSE_CTA, boxShadow: `0 8px 24px ${C_ACCENT}30` }}>
                  {!aiLoading && (
                    <motion.div className="absolute inset-0 opacity-20"
                      style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
                  )}
                  {aiLoading
                    ? <><Loader2 size={16} className="animate-spin" />Generating invitation…</>
                    : <><Zap size={16} />Generate Wedding Invitation</>}
                </motion.button>
                <p className="text-center text-[10px]" style={{ color: C_MED }}>
                  ✨ Powered by AI · Takes ~5 seconds
                </p>
              </motion.div>
            )}

            {step === "ai-result" && aiResult && (
              <motion.div key="ai-result" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }} className="px-5 pb-6 pt-1 space-y-3">

                <div className="rounded-2xl overflow-hidden" style={{ background: C_BG, border: `1px solid ${C_MED}30` }}>
                  <div className="h-0.5" style={{ background: ROSE_CTA }} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: ROSE_CTA }}>
                        <Sparkles size={13} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: C_MED }}>AI generated for</p>
                        <p className="text-xs font-bold" style={{ color: C_DARK }}>{brideName} &amp; {groomName}</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold mb-1" style={{ color: C_ACCENT }}>Blessing</p>
                    <p className="text-xs leading-relaxed italic mb-3"
                      style={{ color: C_DARK, borderLeft: `2px solid ${C_ACCENT}`, paddingLeft: "10px" }}>
                      &ldquo;{aiResult.blessing}&rdquo;
                    </p>
                    {aiResult.brideDesc && (
                      <>
                        <p className="text-xs font-semibold mb-1" style={{ color: C_MED }}>About the Bride</p>
                        <p className="text-xs leading-relaxed" style={{ color: C_MED }}>
                          {aiResult.brideDesc.slice(0, 120)}{aiResult.brideDesc.length > 120 ? "…" : ""}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => onOpenInEditor({ brideName, groomName, aiPrompt })}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden text-white"
                  style={{ background: ROSE_CTA, boxShadow: `0 8px 28px ${C_ACCENT}40` }}>
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
                  <Edit3 size={15} /> Edit &amp; Save in Editor
                  <ChevronRight size={14} strokeWidth={2.5} />
                </motion.button>

                <button onClick={() => { setStep("ai"); setAiResult(null); }}
                  className="w-full py-2.5 rounded-xl text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: C_MED, background: C_BG }}>
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

type WishRow = { name: string; message: string; voiceUrl?: string };

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// ── BlessingsWall form (text + optional voice record / upload) ────────────────
function BlessingsInput({
  shareId,
  onUpdated,
}: {
  shareId: string;
  onUpdated: (wishes: WishRow[]) => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceLabel, setVoiceLabel] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearVoice = useCallback(() => {
    setVoiceBlob(null);
    setVoiceLabel(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const toggleRecord = useCallback(async () => {
    if (recording && mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || mime });
        if (blob.size > 0) {
          setVoiceBlob(blob);
          setVoiceLabel("Voice note recorded");
        }
        mediaRef.current = null;
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      /* mic denied or unavailable */
    }
  }, [recording]);

  const onPickFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("audio/")) {
      e.target.value = "";
      return;
    }
    setVoiceBlob(f);
    setVoiceLabel(f.name);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (!message.trim() && !voiceBlob) return;
    setLoading(true);
    try {
      let voiceDataUrl: string | undefined;
      if (voiceBlob) {
        voiceDataUrl = await blobToDataUrl(voiceBlob);
      }
      const res = await fetch(`${API_URL}/shaadi-card-pages/share/${shareId}/blessings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          ...(voiceDataUrl ? { voiceDataUrl } : {}),
        }),
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const wishes: WishRow[] = result.data.map((b: { name: string; message: string; voiceUrl?: string }) => ({
          name: b.name,
          message: b.message || "",
          ...(b.voiceUrl ? { voiceUrl: b.voiceUrl } : {}),
        }));
        onUpdated(wishes);
        setDone(true);
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl p-4 text-center" style={{ background: `${C_ACCENT}10`, border: `1px solid ${C_ACCENT}25` }}>
        <p className="text-sm font-bold" style={{ color: C_ACCENT }}>🙏 Blessing sent!</p>
        <p className="text-xs mt-1" style={{ color: C_MED }}>May the couple be blessed with joy always.</p>
      </div>
    );
  }

  const canSend = name.trim() && (message.trim() || voiceBlob);

  return (
    <div className="rounded-2xl p-4" style={{ background: C_CARD, border: `1px solid ${C_MED}25` }}>
      <p className="text-sm font-bold mb-3" style={{ color: C_DARK }}>Leave a Blessing 🙏</p>
      <p className="text-[11px] mb-3 leading-relaxed" style={{ color: C_MED }}>
        Write a message, record a short voice note, or upload an audio file (MP3, WAV, WebM — max ~20 MB).
      </p>
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2.5 rounded-xl text-sm border border-border/50 bg-background outline-none focus:border-rose-300 transition-colors"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your heartfelt message (optional if you send voice)"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm border border-border/50 bg-background outline-none focus:border-rose-300 resize-none transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRecord}
            className="flex-1 min-w-[120px] py-2 rounded-xl text-xs font-bold border"
            style={{
              borderColor: recording ? "#ef4444" : `${C_MED}40`,
              color: recording ? "#ef4444" : C_DARK,
              background: recording ? "rgba(239,68,68,0.08)" : "transparent",
            }}
          >
            {recording ? "Stop recording" : "Record voice"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[120px] py-2 rounded-xl text-xs font-bold border"
            style={{ borderColor: `${C_MED}40`, color: C_DARK }}
          >
            Upload audio
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={onPickFile}
          />
        </div>
        {voiceLabel && (
          <div className="flex items-center justify-between gap-2 text-xs px-2 py-1.5 rounded-lg" style={{ background: `${C_ACCENT}08` }}>
            <span className="truncate" style={{ color: C_DARK }}>{voiceLabel}</span>
            <button type="button" onClick={clearVoice} className="shrink-0 font-semibold" style={{ color: C_ACCENT }}>
              Remove
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !canSend}
          className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white disabled:opacity-50"
          style={{ background: ROSE_CTA }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? "Sending…" : "Send Blessing"}
        </button>
      </div>
    </div>
  );
}

// ── Main Viewer ───────────────────────────────────────────────────────────────
interface ShaadiCardViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

export default function ShaadiCardViewer({ rawData, shareId, hasPassword }: ShaadiCardViewerProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState<ViewerTabId>("home");
  const [data, setData] = useState<ShaadiData>(mapData(rawData));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  // Password gate
  const [locked, setLocked] = useState(hasPassword);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `${SITE_URL}/${shareId}`;

  const verifyPassword = useCallback(async () => {
    if (!pw.trim()) return;
    setPwLoading(true); setPwError("");
    try {
      const res = await fetch(`${API_URL}/shaadi-card-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        setLocked(false);
      } else {
        setPwError("Wrong password. Please try again!");
      }
    } catch {
      setPwError("Something went wrong");
    } finally {
      setPwLoading(false);
    }
  }, [pw, shareId]);

  const handleCreateStart = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowCreateSheet(true);
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setShowCreateSheet(true);
  }, []);

  const handleOpenInEditor = useCallback((prefill?: { brideName?: string; groomName?: string; aiPrompt?: string }) => {
    if (prefill) {
      try {
        sessionStorage.setItem("shaadi_card_prefill", JSON.stringify({
          brideName: prefill.brideName || "",
          groomName: prefill.groomName || "",
        }));
      } catch {}
    }
    router.push("/shaadi-card");
  }, [router]);

  const handleBlessingsUpdated = useCallback((wishes: WishRow[]) => {
    setData((prev) => ({ ...prev, wishes }));
  }, []);

  // Password gate screen
  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5"
        style={{ background: `linear-gradient(135deg, ${C_BG} 0%, #FAE8E8 100%)` }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: C_CARD, border: `1px solid ${C_MED}30` }}
        >
          <div className="h-1.5" style={{ background: ROSE_CTA }} />
          <div className="px-6 pt-7 pb-6">
            <div className="flex flex-col items-center mb-6">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xl"
                style={{ background: ROSE_CTA, boxShadow: `0 12px 28px ${C_ACCENT}30` }}
              >
                <Lock size={26} />
              </motion.div>
              <h3 className="text-lg font-bold text-center" style={{ color: C_DARK }}>This Invitation is Locked</h3>
              <p className="text-[11px] mt-1.5 text-center leading-relaxed" style={{ color: C_MED }}>
                Enter the password to view this wedding invitation
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setPwError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") verifyPassword(); }}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-3.5 pr-11 rounded-2xl border focus:outline-none text-sm transition-all"
                style={{ background: C_BG, borderColor: pwError ? "#ef4444" : `${C_MED}30`, color: C_DARK }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: C_MED }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {pwError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="flex items-center justify-center gap-1.5 text-red-500 text-xs mb-4">
                  <ShieldAlert size={12} />
                  <span>{pwError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={verifyPassword} disabled={pwLoading || !pw.trim()}
              className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: ROSE_CTA, boxShadow: `0 6px 20px ${C_ACCENT}25` }}>
              {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
              {pwLoading ? "Verifying..." : "Unlock Invitation"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const allTabs: { id: ViewerTabId; label: string }[] = [
    ...TABS,
    { id: "create", label: "Create" },
  ];

  const F_DANCING = "var(--font-dancing), cursive";
  const F_CINZEL  = "var(--font-cinzel), serif";

  return (
    <div className="min-h-screen relative flex" style={{ background: C_BG }}>

      <Suspense fallback={null}>
        <ShaadiBackgroundMusic shouldPlay={true} />
      </Suspense>

      {/* ── Desktop left sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30 select-none"
        style={{
          width: 224,
          background: "rgba(255,252,250,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: `1px solid rgba(171,28,62,0.10)`,
          boxShadow: "4px 0 24px rgba(109,43,59,0.06)",
        }}>
        {/* Sidebar header */}
        <div className="px-5 pt-6 pb-4 border-b" style={{ borderColor: `rgba(171,28,62,0.08)` }}>
          {/* Ring icon */}
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `linear-gradient(135deg, ${C_ACCENT}18, ${C_MED}14)`, border: `1px solid ${C_ACCENT}22` }}>
              💍
            </div>
          </div>
          <p className="text-center font-bold leading-tight mb-0.5"
            style={{ fontFamily: F_DANCING, fontSize: 20, color: C_DARK }}>
            {data.brideName}&nbsp;&amp;&nbsp;{data.groomName}
          </p>
          <p className="text-center text-[10px]" style={{ fontFamily: F_CINZEL, color: C_MED, opacity: 0.8 }}>
            {data.blessing || "शुभ विवाह ✦"}
          </p>
        </div>

        {/* Sidebar nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {allTabs.map(({ id, label }) => {
            const active = tab === id;
            const isCreate = id === "create";
            const Icon = !isCreate ? TAB_ICONS[id as TabId] : Sparkles;
            return (
              <button
                key={id}
                onClick={() => setTab(id as ViewerTabId)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left relative"
                style={{
                  background: active
                    ? isCreate ? `linear-gradient(135deg, ${C_ACCENT}ee, ${C_MED}cc)` : `${C_ACCENT}12`
                    : "transparent",
                  color: active ? (isCreate ? "white" : C_ACCENT) : C_DARK,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {isCreate && !active && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ boxShadow: [`0 0 0px ${C_ACCENT}00`, `0 0 8px 2px ${C_ACCENT}44`, `0 0 0px ${C_ACCENT}00`], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ background: `linear-gradient(135deg, ${C_ACCENT}15, ${C_MED}18)`, border: `1px solid ${C_ACCENT}35` }}
                  />
                )}
                <Icon size={17} strokeWidth={active ? 2.2 : 1.6} className="shrink-0 relative z-10"
                  style={{ color: active ? (isCreate ? "white" : C_ACCENT) : C_MED }} />
                <span className="text-sm relative z-10" style={{ fontFamily: F_CINZEL, letterSpacing: "0.04em" }}>{label}</span>
                {active && !isCreate && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C_ACCENT }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer — Back + Share */}
        <div className="px-3 pb-5 pt-3 border-t space-y-2" style={{ borderColor: `rgba(171,28,62,0.08)` }}>
          <button
            onClick={() => router.back()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ color: C_MED, fontFamily: F_CINZEL, letterSpacing: "0.04em" }}
          >
            <ArrowLeft size={15} strokeWidth={1.6} />
            Back
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(shareUrl); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors text-white"
            style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`, boxShadow: `0 4px 16px ${C_ACCENT}35` }}
          >
            <Share2 size={15} />
            Share Invitation
          </button>
        </div>
      </aside>

      {/* ── Main content (offset on desktop) ──────────────────── */}
      <div className="flex-1 min-w-0 lg:ml-56">

        {/* Mobile — centered Share pill, above bottom nav */}
        <div
          className="lg:hidden fixed z-[50]"
          style={{
            bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 22 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              const title = `${data.brideName} & ${data.groomName}'s Wedding Invitation 💍`;
              const text = `You're invited! Open to view the full wedding invitation.`;
              try {
                if (data.sharePhoto && navigator.share) {
                  const res = await fetch(data.sharePhoto);
                  const blob = await res.blob();
                  const ext = blob.type.includes("png") ? "png" : "jpg";
                  const file = new File([blob], `invitation.${ext}`, { type: blob.type || "image/jpeg" });
                  if (navigator.canShare?.({ files: [file] })) {
                    await navigator.share({ files: [file], title, text, url: shareUrl });
                    return;
                  }
                }
                if (navigator.share) {
                  await navigator.share({ title, text, url: shareUrl });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                }
              } catch {
                navigator.clipboard?.writeText(shareUrl);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              borderRadius: 50,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid rgba(171,28,62,0.18)`,
              boxShadow: "0 6px 24px rgba(109,43,59,0.16), 0 2px 6px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <Share2 size={15} style={{ color: C_ACCENT }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C_DARK, letterSpacing: "0.01em" }}>
              Share Invitation
            </span>
          </motion.button>
        </div>

        {/* Mobile — SubhSandesh logo top-right, links to home */}
        <div className="lg:hidden fixed top-3 right-3 z-50">
          <motion.a
            href="/"
            aria-label="SubhSandesh home"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#FFFAF8",
              border: "1px solid rgba(171,28,62,0.12)",
              boxShadow: "0 2px 10px rgba(109,43,59,0.15)",
              overflow: "hidden",
              textDecoration: "none",
            }}
          >
            <img src="/logo.png" alt="SubhSandesh" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </motion.a>
        </div>

        {/* Tab content */}
        <div className="pb-24 lg:pb-0">
          <AnimatePresence mode="wait">
            {tab === "home" && (
              <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <HomeSection data={data} />
                </Suspense>
              </motion.div>
            )}
            {tab === "couple" && (
              <motion.div key="couple" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <CoupleSection data={data} />
                </Suspense>
              </motion.div>
            )}
            {tab === "events" && (
              <motion.div key="events" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <EventsSection data={data} />
                </Suspense>
              </motion.div>
            )}
            {tab === "gallery" && (
              <motion.div key="gallery" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <GallerySection data={data} />
                </Suspense>
              </motion.div>
            )}
            {tab === "blessings" && (
              <motion.div key="blessings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <WishesSection data={data} shareId={shareId} />
                </Suspense>
              </motion.div>
            )}
            {tab === "create" && (
              <motion.div key="create" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <CreateSection data={data} onStart={handleCreateStart} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="w-full mb-3 px-2 pointer-events-auto">
          <div className="relative rounded-2xl shadow-lg overflow-hidden"
            style={{
              background: "rgba(253,245,240,0.95)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: `1px solid ${C_MED}25`,
              boxShadow: `0 8px 32px rgba(171,28,62,0.12)`,
            }}>
            <div className="flex items-stretch px-1 py-1">
              {allTabs.map(({ id, label }) => {
                const active = tab === id;
                const isCreate = id === "create";
                const Icon = !isCreate ? TAB_ICONS[id as TabId] : Sparkles;
                return (
                  <button key={id} onClick={() => setTab(id as ViewerTabId)} className="flex-1 relative">
                    {/* Glow ring for Create button */}
                    {isCreate && !active && (
                      <motion.div
                        className="absolute inset-0.5 rounded-xl pointer-events-none"
                        animate={{
                          boxShadow: [
                            `0 0 0px 0px ${C_ACCENT}00`,
                            `0 0 10px 3px ${C_ACCENT}55`,
                            `0 0 0px 0px ${C_ACCENT}00`,
                          ],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                          background: `linear-gradient(135deg, ${C_ACCENT}18, ${C_MED}22)`,
                          border: `1px solid ${C_ACCENT}40`,
                        }}
                      />
                    )}
                    <div className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl transition-all duration-200">
                      {active && (
                        <motion.div
                          layoutId="sv-nav-bg"
                          className="absolute inset-0.5 rounded-xl"
                          style={{
                            background: isCreate
                              ? `linear-gradient(135deg, ${C_ACCENT}ee, ${C_MED}dd)`
                              : "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,245,248,0.98))",
                            border: `1px solid ${C_ACCENT}38`,
                            boxShadow: isCreate
                              ? `0 4px 16px ${C_ACCENT}55, inset 0 1px 0 rgba(255,255,255,0.25)`
                              : `0 2px 10px rgba(171,28,62,0.12), inset 0 1px 0 rgba(255,255,255,0.9)`,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon size={isCreate ? 18 : 19}
                        strokeWidth={active ? 2.35 : (isCreate ? 1.8 : 1.5)}
                        className="relative z-10"
                        style={{ color: active && isCreate ? "white" : active ? C_ACCENT : isCreate ? C_ACCENT : C_MED }} />
                      <span className={`text-[10px] font-bold relative z-10 tracking-tight ${active ? "" : "opacity-65"}`}
                        style={{ color: active && isCreate ? "white" : active ? C_ACCENT : isCreate ? C_ACCENT : C_MED, fontWeight: isCreate ? 700 : undefined }}>
                        {label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
            onOpenInEditor={handleOpenInEditor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
