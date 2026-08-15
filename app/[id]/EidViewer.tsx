"use client";

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home, Heart, Music, BookOpen, Gift,
  MoreHorizontal, ArrowLeft, Sun, Moon,
  Sparkles, PenLine, Lock, Eye, EyeOff,
  ShieldAlert, Loader2, Wand2, Shield, Share2,
  ChevronRight, Star, Check, X, Edit3, Zap, User,
} from "lucide-react";

import StarField from "@/app/(templates)/eid-mubarak/components/StarField";
import HomeSection from "@/app/(templates)/eid-mubarak/components/HomeSection";
import EidWelcomeOverlay from "@/app/(templates)/eid-mubarak/components/EidWelcomeOverlay";
import EidBackgroundMusic from "@/app/(templates)/eid-mubarak/components/EidBackgroundMusic";
import { DEMO_DATA, type EidData, type TabId, TABS } from "@/app/(templates)/eid-mubarak/components/types";
import AuthModal from "@/components/AuthModal";
import { useAppSelector } from "@/store/hooks";

const WishSection      = lazy(() => import("@/app/(templates)/eid-mubarak/components/WishSection"));
const GreetingsSection = lazy(() => import("@/app/(templates)/eid-mubarak/components/GreetingsSection"));
const PlaylistSection  = lazy(() => import("@/app/(templates)/eid-mubarak/components/PlaylistSection"));
const DuaSection       = lazy(() => import("@/app/(templates)/eid-mubarak/components/DuaSection"));

import { API_URL, IS_NGROK } from "@/lib/config";

type ViewerTabId = TabId | "create";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home, wish: Gift, greetings: Heart, playlist: Music, dua: BookOpen,
};

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
} as const;

const FEATURES = [
  { icon: Wand2,   color: "var(--eid-gold)",      bg: "rgba(197,160,63,0.12)",  label: "AI Magic",         desc: "Generate wishes instantly" },
  { icon: Shield,  color: "var(--eid-teal)",       bg: "rgba(58,143,125,0.12)", label: "Password Protect", desc: "Keep it private" },
  { icon: Share2,  color: "#E0C96E",               bg: "rgba(224,201,110,0.12)",label: "Instant Share",    desc: "One link, anyone" },
  { icon: Music,   color: "var(--eid-teal)",       bg: "rgba(58,143,125,0.12)", label: "Eid Nasheeds",     desc: "Background music" },
  { icon: Heart,   color: "var(--eid-gold)",       bg: "rgba(197,160,63,0.12)", label: "Duas & Greetings", desc: "Islamic blessings" },
  { icon: Star,    color: "#E0C96E",               bg: "rgba(224,201,110,0.12)",label: "Always Free",      desc: "No cost, ever" },
];

const EID_SYMBOLS = [
  { emoji: "🌙", name: "Crescent Moon",  meaning: "New Beginnings",     color: "var(--eid-gold)" },
  { emoji: "⭐", name: "Star",           meaning: "Divine Guidance",    color: "#E0C96E" },
  { emoji: "🕌", name: "Mosque",         meaning: "Spiritual Prayer",   color: "var(--eid-teal)" },
  { emoji: "🤲", name: "Dua",            meaning: "Seeking Blessings",  color: "var(--eid-gold)" },
  { emoji: "🌸", name: "Blossoms",       meaning: "Celebration",        color: "#A8D5C9" },
  { emoji: "💛", name: "Gold",           meaning: "Prosperity",         color: "#E0C96E" },
];

function TabFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--eid-gold)", borderTopColor: "transparent" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Password Gate
───────────────────────────────────────── */
function EidPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/eid-pages/share/${shareId}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`eid_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: "hsl(var(--eid-bg))" }}>
      <StarField count={15} />
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "hsl(var(--eid-card))", border: "1px solid hsl(var(--eid-border))" }}>
          <div className="h-1" style={{ background: "var(--eid-gradient-gold)" }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{ background: "var(--eid-gradient-gold)" }}
              >
                <Lock size={28} style={{ color: "hsl(var(--eid-bg))" }} />
              </motion.div>
              <motion.div className="text-3xl mb-2">🌙</motion.div>
              <h2 className="text-xl font-bold text-center mb-1"
                style={{ color: "var(--eid-gold)", fontFamily: "'Cormorant Garamond', serif" }}>
                This Card is Private
              </h2>
              <p className="text-xs text-center leading-relaxed"
                style={{ color: "hsl(var(--eid-muted-fg))" }}>
                Enter the password to view<br />this Eid Mubarak card
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-3.5 pr-11 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: "hsl(var(--eid-input))",
                  border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "hsl(var(--eid-border))"}`,
                  color: "hsl(var(--eid-fg))",
                  boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "hsl(var(--eid-muted-fg))" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs mb-4"
                  style={{ color: "rgb(239,68,68)" }}>
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={loading || !pw.trim()}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))", boxShadow: "0 8px 24px rgba(197,160,63,0.35)" }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Open Card</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Create Section (full-page, mobile-first)
───────────────────────────────────────── */
function CreateSection({ data, onStart }: { data: EidData; onStart: () => void }) {
  const senderName = data.senderName;

  const CtaCard = (
    <div className="rounded-3xl overflow-hidden sticky top-8"
      style={{ background: "hsl(var(--eid-card))", border: "1px solid hsl(var(--eid-border))", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
      <div className="h-1" style={{ background: "var(--eid-gradient-gold)" }} />
      <div className="p-6">
        <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--eid-gradient-gold)", boxShadow: "0 8px 28px rgba(197,160,63,0.35)" }}
          animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <span className="text-3xl">🌙</span>
        </motion.div>

        <h3 className="text-lg font-bold text-center mb-1"
          style={{ color: "hsl(var(--eid-fg))", fontFamily: "'Cormorant Garamond', serif" }}>
          Your Turn!
        </h3>
        <p className="text-xs text-center mb-5 leading-relaxed" style={{ color: "hsl(var(--eid-muted-fg))" }}>
          {senderName ? `Inspired by ${senderName}'s card?` : "Inspired by this card?"}<br />
          Create one for someone you love.
        </p>

        <div className="space-y-2 mb-5">
          {["AI-generated Eid wishes", "Custom countdown to Eid", "Password protection", "Free shareable link"].map(f => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(197,160,63,0.15)" }}>
                <Check size={10} style={{ color: "var(--eid-gold)" }} />
              </div>
              <span className="text-xs" style={{ color: "hsl(var(--eid-muted-fg))" }}>{f}</span>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
          style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))", boxShadow: "0 8px 28px rgba(197,160,63,0.4)" }}>
          <motion.div className="absolute inset-0 opacity-25"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
          <Wand2 size={16} /> Create My Card
          <ChevronRight size={14} strokeWidth={2.5} />
        </motion.button>
        <p className="text-center text-[10px] mt-2" style={{ color: "hsl(var(--eid-muted-fg))" }}>
          🌙 Free · No sign-up cost · 2 minutes
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop: 2-col */}
      <div className="hidden lg:flex gap-10 px-10 pt-12 pb-16 items-start max-w-5xl mx-auto">
        {/* Left col */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 rounded-full" style={{ background: "hsl(var(--eid-border))" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "hsl(var(--eid-muted-fg))" }}>For You</span>
              <div className="h-px flex-1 rounded-full" style={{ background: "hsl(var(--eid-border))" }} />
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2"
              style={{ color: "hsl(var(--eid-fg))", fontFamily: "'Cormorant Garamond', serif" }}>
              Create Your Own<br />
              <span style={{ color: "var(--eid-gold)" }}>Eid Mubarak Card</span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--eid-muted-fg))" }}>
              Send a personalized Eid Mubarak surprise with duas, nasheeds, and your own photo.
            </p>
          </div>

          {/* Inspiration strip */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--eid-border))" }}>
            <div className="h-0.5" style={{ background: "var(--eid-gradient-gold)" }} />
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "hsl(var(--eid-surface))" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(58,143,125,0.3), rgba(197,160,63,0.2))" }}>🌙</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: "hsl(var(--eid-fg))" }}>
                  You just received a card from{" "}
                  <span style={{ color: "var(--eid-gold)" }}>{senderName || "someone"}</span>
                </p>
                <p className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                  Spread Eid blessings — create yours for someone you love
                </p>
              </div>
              <ChevronRight size={14} style={{ color: "hsl(var(--eid-muted-fg))" }} />
            </div>
          </div>

          {/* Feature grid */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-0.5"
              style={{ color: "hsl(var(--eid-muted-fg))" }}>Everything included</p>
            <div className="grid grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
                <motion.div key={label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{ background: "hsl(var(--eid-card))", border: "1px solid hsl(var(--eid-border))" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                    <Icon size={17} style={{ color }} strokeWidth={1.8} />
                  </div>
                  <p className="text-xs font-bold mb-1" style={{ color: "hsl(var(--eid-fg))" }}>{label}</p>
                  <p className="text-[10px] leading-snug" style={{ color: "hsl(var(--eid-muted-fg))" }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Eid Symbols */}
          <div className="rounded-2xl p-4"
            style={{ background: "hsl(var(--eid-card))", border: "1px solid hsl(var(--eid-border))" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3"
              style={{ color: "hsl(var(--eid-muted-fg))" }}>Symbols of Eid</p>
            <div className="flex flex-wrap gap-2">
              {EID_SYMBOLS.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(197,160,63,0.08)", border: "1px solid rgba(197,160,63,0.2)" }}>
                  <span className="text-sm">{s.emoji}</span>
                  <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.name}</span>
                  <span className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>· {s.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sticky CTA */}
        <div className="w-72 shrink-0">{CtaCard}</div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden pb-28">
        <div className="relative px-5 pt-10 pb-6 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 30%, rgba(197,160,63,0.08) 0%, transparent 70%)" }} />
          <motion.div className="inline-flex items-center justify-center mb-5"
            animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
              style={{ background: "var(--eid-gradient-gold)", boxShadow: "0 12px 40px rgba(197,160,63,0.4)" }}>
              <span className="text-4xl">🌙</span>
            </div>
          </motion.div>
          <div className="h-0.5 w-16 mx-auto rounded-full mb-4" style={{ background: "var(--eid-gradient-gold)" }} />
          <h1 className="text-2xl font-bold mb-2"
            style={{ color: "hsl(var(--eid-fg))", fontFamily: "'Cormorant Garamond', serif" }}>
            Create Your Own<br /><span style={{ color: "var(--eid-gold)" }}>Eid Card</span>
          </h1>
          <p className="text-sm leading-relaxed mx-auto max-w-[260px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
            Loved {senderName ? `${senderName}'s card` : "this card"}? Make one for someone special.
          </p>
        </div>

        <div className="px-5 mb-5">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--eid-border))" }}>
            <div className="h-0.5" style={{ background: "var(--eid-gradient-gold)" }} />
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: "hsl(var(--eid-surface))" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(58,143,125,0.3), rgba(197,160,63,0.2))" }}>🌙</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "hsl(var(--eid-fg))" }}>
                  From <span style={{ color: "var(--eid-gold)" }}>{senderName || "someone"}</span> — now your turn
                </p>
                <p className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>Create one for your loved ones →</p>
              </div>
              <ChevronRight size={14} style={{ color: "hsl(var(--eid-muted-fg))" }} />
            </div>
          </div>
        </div>

        <div className="px-5 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-0.5" style={{ color: "hsl(var(--eid-muted-fg))" }}>
            Everything included
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
              <div key={label} className="rounded-2xl p-3.5"
                style={{ background: "hsl(var(--eid-card))", border: "1px solid hsl(var(--eid-border))" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold mb-0.5" style={{ color: "hsl(var(--eid-fg))" }}>{label}</p>
                <p className="text-[10px] leading-snug" style={{ color: "hsl(var(--eid-muted-fg))" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 relative overflow-hidden"
            style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))", boxShadow: "0 12px 40px rgba(197,160,63,0.4)" }}>
            <motion.div className="absolute inset-0 opacity-20"
              style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
              animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
            <Wand2 size={19} strokeWidth={2} /> Start Creating Now <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
          <p className="text-center text-[11px] mt-2.5" style={{ color: "hsl(var(--eid-muted-fg))" }}>
            🌙 Free · No credit card · Ready in 2 minutes
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

interface InlineCreateSheetProps {
  accessToken: string | null;
  onClose: () => void;
  onOpenInEditor: (prefill?: Partial<EidData>) => void;
}

function InlineCreateSheet({ accessToken, onClose, onOpenInEditor }: InlineCreateSheetProps) {
  const [step, setStep] = useState<SheetStep>("choose");
  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Partial<EidData> | null>(null);
  const [genError, setGenError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "ai") setTimeout(() => nameRef.current?.focus(), 300);
  }, [step]);

  const handleGenerate = useCallback(async () => {
    if (!aiSender.trim() || !aiPrompt.trim()) return;
    setAiLoading(true); setGenError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          prompt: aiName.trim()
            ? `Eid Mubarak greeting from ${aiSender.trim()} to ${aiName.trim()}. ${aiPrompt}`
            : `Eid Mubarak general greeting from ${aiSender.trim()}. ${aiPrompt}`,
          templateId: "eid-mubarak",
          templateType: "eid",
        }),
      });
      const d = await res.json();
      const result: Partial<EidData> = {
        recipientName: aiName.trim(),
        senderName: aiSender.trim() || d.senderName || "",
        urduTitle: d.urduTitle || DEMO_DATA.urduTitle,
        englishSubtitle: d.englishSubtitle || d.body || DEMO_DATA.englishSubtitle,
        homeWishMessage: d.homeWishMessage || d.body || DEMO_DATA.homeWishMessage,
        congratsMessage: d.congratsMessage || d.body || DEMO_DATA.congratsMessage,
      };
      setAiResult(result);
      setStep("ai-result");
    } catch {
      setGenError("Generation failed. Please try again!");
    } finally {
      setAiLoading(false);
    }
  }, [aiName, aiSender, aiPrompt, accessToken]);

  const inputStyle: React.CSSProperties = {
    background: "hsl(var(--eid-input))",
    border: "1px solid hsl(var(--eid-border))",
    color: "hsl(var(--eid-fg))",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end lg:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />

      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative w-full max-w-lg lg:rounded-3xl rounded-t-3xl overflow-hidden"
        style={{
          background: "hsl(var(--eid-card))",
          border: "1px solid hsl(var(--eid-border))",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.35)",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
        }}>

        {/* Gold top strip */}
        <div className="h-1 shrink-0" style={{ background: "var(--eid-gradient-gold)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {step !== "choose" && (
              <button onClick={() => setStep(step === "ai-result" ? "ai" : "choose")}
                className="p-1.5 rounded-xl hover:opacity-70 transition-opacity mr-1"
                style={{ color: "hsl(var(--eid-muted-fg))", background: "hsl(var(--eid-surface))" }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold"
                style={{ color: "hsl(var(--eid-fg))", fontFamily: "'Cormorant Garamond', serif" }}>
                {step === "choose" && "🌙 Create Your Eid Card"}
                {step === "ai" && "✨ AI Magic"}
                {step === "ai-result" && "🎉 Your Wishes Are Ready!"}
              </h2>
              <p className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                {step === "choose" && "Free · 2 minutes · No credit card"}
                {step === "ai" && "Tell AI who to wish and how"}
                {step === "ai-result" && "Preview & open in the editor"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:opacity-70 transition-opacity"
            style={{ color: "hsl(var(--eid-muted-fg))", background: "hsl(var(--eid-surface))" }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto no-scrollbar flex-1">
          <AnimatePresence mode="wait">

            {/* Choose */}
            {step === "choose" && (
              <motion.div key="choose"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="px-5 pb-6 space-y-3 pt-1">

                {/* AI option */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("ai")}
                  className="w-full text-left rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: "var(--eid-gradient-gold)", boxShadow: "0 8px 28px rgba(197,160,63,0.4)" }}>
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.7) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.2)" }}>
                      <Wand2 size={20} style={{ color: "#fff" }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white">AI Magic</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>RECOMMENDED</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Describe the vibe — AI writes personalized Eid wishes in seconds
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.7)" }} className="shrink-0 mt-0.5" />
                  </div>
                </motion.button>

                {/* Manual option */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenInEditor()}
                  className="w-full text-left rounded-2xl p-4"
                  style={{ background: "hsl(var(--eid-surface))", border: "1px solid hsl(var(--eid-border))" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(58,143,125,0.15)" }}>
                      <Edit3 size={20} style={{ color: "var(--eid-teal)" }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1" style={{ color: "hsl(var(--eid-fg))" }}>Write Manually</p>
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                        Craft every word yourself — full control over the message
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "hsl(var(--eid-muted-fg))" }} className="shrink-0 mt-0.5" />
                  </div>
                </motion.button>

                <p className="text-center text-[10px] pt-1" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                  🌙 Both are completely free
                </p>
              </motion.div>
            )}

            {/* AI Form */}
            {step === "ai" && (
              <motion.div key="ai"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="px-5 pb-6 pt-1 space-y-3">

                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: "hsl(var(--eid-muted-fg))" }}>
                    <User size={11} /> Your name *
                  </label>
                  <input ref={nameRef} value={aiSender} onChange={e => setAiSender(e.target.value)}
                    placeholder="e.g. Hassan…" style={inputStyle} />
                </div>

                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: "hsl(var(--eid-muted-fg))" }}>
                    <User size={11} /> Who are you wishing? <span style={{ color: "hsl(var(--eid-muted-fg))", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input value={aiName} onChange={e => setAiName(e.target.value)}
                    placeholder="e.g. Ahmed, Fatima, Mom… or leave empty for a general card" style={inputStyle} />
                </div>

                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: "hsl(var(--eid-muted-fg))" }}>
                    <Sparkles size={11} /> What&apos;s the vibe? *
                  </label>
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="e.g. Warm, heartfelt Eid wish for my best friend with blessings…"
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
                  disabled={aiLoading || !aiSender.trim() || !aiPrompt.trim()}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50"
                  style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))", boxShadow: "0 8px 24px rgba(197,160,63,0.3)" }}>
                  {!aiLoading && (
                    <motion.div className="absolute inset-0 opacity-20"
                      style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
                  )}
                  {aiLoading
                    ? <><Loader2 size={16} className="animate-spin" />Generating wishes…</>
                    : <><Zap size={16} />Generate Eid Wishes</>}
                </motion.button>
                <p className="text-center text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                  ✨ Powered by AI · Takes ~5 seconds
                </p>
              </motion.div>
            )}

            {/* AI Result */}
            {step === "ai-result" && aiResult && (
              <motion.div key="ai-result"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="px-5 pb-6 pt-1 space-y-3">

                <div className="rounded-2xl overflow-hidden"
                  style={{ background: "hsl(var(--eid-surface))", border: "1px solid hsl(var(--eid-border))" }}>
                  <div className="h-0.5" style={{ background: "var(--eid-gradient-gold)" }} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "var(--eid-gradient-gold)" }}>
                        <span className="text-sm">🌙</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: "hsl(var(--eid-muted-fg))" }}>AI generated for</p>
                        <p className="text-xs font-bold" style={{ color: "hsl(var(--eid-fg))" }}>{aiResult.recipientName}</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed italic"
                      style={{ color: "hsl(var(--eid-fg))", borderLeft: "2px solid var(--eid-gold)", paddingLeft: "10px" }}>
                      &ldquo;{aiResult.homeWishMessage?.slice(0, 160)}{(aiResult.homeWishMessage?.length ?? 0) > 160 ? "…" : ""}&rdquo;
                    </p>
                    {aiResult.senderName && (
                      <p className="text-[10px] mt-2 text-right" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                        — {aiResult.senderName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-3"
                  style={{ background: "rgba(197,160,63,0.06)", border: "1px solid rgba(197,160,63,0.18)" }}>
                  <p className="text-[11px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                    <span className="font-semibold" style={{ color: "var(--eid-gold)" }}>Next:</span>
                    {" "}Add your photo, family members, password, and publish a shareable link — all in the editor.
                  </p>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={() => onOpenInEditor(aiResult)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))", boxShadow: "0 8px 28px rgba(197,160,63,0.4)" }}>
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }} />
                  <Edit3 size={15} /> Edit &amp; Save in Editor
                  <ChevronRight size={14} strokeWidth={2.5} />
                </motion.button>

                <button onClick={() => { setStep("ai"); setAiResult(null); }}
                  className="w-full py-2.5 rounded-xl text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "hsl(var(--eid-muted-fg))", background: "hsl(var(--eid-surface))" }}>
                  ↩ Regenerate with different prompt
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
   Desktop Left Sidebar
───────────────────────────────────────── */
function ViewerSidebar({ tab, onTabChange, darkMode, toggleDark, data, onStart }: {
  tab: ViewerTabId; onTabChange: (id: ViewerTabId) => void;
  darkMode: boolean; toggleDark: () => void;
  data: EidData; onStart: () => void;
}) {
  const router = useRouter();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 flex-col z-50"
      style={{ background: "hsl(var(--eid-card))", borderRight: "1px solid hsl(var(--eid-border))" }}>

      {/* Hero header */}
      <div className="relative h-32 overflow-hidden shrink-0">
        <Image src="https://cdn.subhsandesh.in/gifts-media/assets/Eid/eid_mubarak.webp" alt="" fill
          className="object-cover object-center" sizes="224px" style={{ opacity: 0.2 }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(58,143,125,0.6) 0%, rgba(197,160,63,0.4) 100%)" }} />
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "var(--eid-gradient-gold)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <motion.div className="text-3xl mb-1"
            animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            🌙
          </motion.div>
          <h1 className="text-lg font-bold drop-shadow-lg"
            style={{ color: "var(--eid-gold)", fontFamily: "'Cormorant Garamond', serif" }}>
            Eid Mubarak
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(224,201,110,0.8)", fontFamily: "'DM Sans', sans-serif" }}>
            Festival of Blessings
          </p>
        </div>
      </div>

      {/* Sender info card */}
      {data.senderName && (
        <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid hsl(var(--eid-border))" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: "var(--eid-gradient-gold)" }}>
              {data.senderPhoto ? (
                <img src={data.senderPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-sm" style={{ color: "hsl(var(--eid-bg))" }}>
                  {data.senderName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium" style={{ color: "hsl(var(--eid-muted-fg))" }}>Card from</p>
              <p className="text-xs font-bold truncate" style={{ color: "hsl(var(--eid-fg))" }}>{data.senderName}</p>
            </div>
            <motion.div className="text-base"
              animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>🌙</motion.div>
          </div>
          {/* For label */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-px flex-1" style={{ background: "hsl(var(--eid-border))" }} />
            <p className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: data.recipientName ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))" }}>
              {data.recipientName ? `For ${data.recipientName}` : "For Everyone 🌙"}
            </p>
            <div className="h-px flex-1" style={{ background: "hsl(var(--eid-border))" }} />
          </div>
        </div>
      )}

      {/* Nav tabs */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          const active = tab === id;
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
              style={{
                background: active ? "rgba(197,160,63,0.12)" : "transparent",
                color: active ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))",
                fontWeight: active ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: active ? "0 0 20px rgba(197,160,63,0.12)" : "none",
              }}>
              <Icon size={17} strokeWidth={active ? 2 : 1.5} />
              <span className="text-sm">{label}</span>
              {active && (
                <motion.div layoutId="eid-sidebar-active-dot" className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--eid-gold)" }} />
              )}
            </button>
          );
        })}

        <div className="h-px mx-2 my-2" style={{ background: "hsl(var(--eid-border))" }} />

        {/* Create CTA tab */}
        <motion.button onClick={() => onTabChange("create")} whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left relative overflow-hidden"
          style={{
            background: tab === "create" ? "var(--eid-gradient-gold)" : "rgba(197,160,63,0.10)",
            color: tab === "create" ? "hsl(var(--eid-bg))" : "var(--eid-gold)",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            border: `1px solid ${tab === "create" ? "transparent" : "rgba(197,160,63,0.22)"}`,
            boxShadow: tab === "create" ? "0 4px 20px rgba(197,160,63,0.35)" : "none",
          }}>
          {tab !== "create" && (
            <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: "1px solid rgba(197,160,63,0.4)" }}
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          )}
          <Wand2 size={17} strokeWidth={2} />
          <span className="text-sm">Create Yours</span>
          {tab !== "create" && (
            <motion.span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))" }}
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              FREE
            </motion.span>
          )}
        </motion.button>
      </nav>

      {/* Footer */}
      <div className="p-3 shrink-0" style={{ borderTop: "1px solid hsl(var(--eid-border))" }}>
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium hover:opacity-80 transition-all"
            style={{ color: "hsl(var(--eid-muted-fg))", background: "hsl(var(--eid-surface))" }}>
            <ArrowLeft size={13} /> Back
          </button>
          <button onClick={toggleDark} className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ color: "hsl(var(--eid-muted-fg))" }}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Desktop Right Panel (xl+)
───────────────────────────────────────── */
function ViewerRightPanel({ data, onCreateTab, onStart }: {
  data: EidData; onCreateTab: () => void; onStart: () => void;
}) {
  return (
    <aside className="hidden xl:flex fixed right-0 top-0 h-full w-72 flex-col z-50 overflow-y-auto no-scrollbar"
      style={{ background: "hsl(var(--eid-card))", borderLeft: "1px solid hsl(var(--eid-border))" }}>

      <div className="h-1 shrink-0" style={{ background: "var(--eid-gradient-gold)" }} />

      {/* Create CTA */}
      <div className="p-5 shrink-0" style={{ borderBottom: "1px solid hsl(var(--eid-border))" }}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--eid-gradient-gold)" }}>
            <span className="text-base">🌙</span>
          </motion.div>
          <div>
            <p className="text-xs font-bold" style={{ color: "hsl(var(--eid-fg))" }}>Create Your Card</p>
            <p className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>Free · 2 minutes</p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed mb-4" style={{ color: "hsl(var(--eid-muted-fg))" }}>
          {data.senderName
            ? `Loved ${data.senderName}'s Eid card?`
            : "Love this Eid card?"
          } Make a personalised one for someone special with AI-generated wishes and music.
        </p>

        <div className="space-y-1.5 mb-4">
          {["AI-generated wishes", "Your photo + family name", "Password protection", "Shareable link"].map(f => (
            <div key={f} className="flex items-center gap-2">
              <Sparkles size={10} style={{ color: "var(--eid-gold)", flexShrink: 0 }} />
              <span className="text-[11px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>{f}</span>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
          style={{ background: "var(--eid-gradient-gold)", color: "hsl(var(--eid-bg))", boxShadow: "0 6px 20px rgba(197,160,63,0.35)" }}>
          <motion.div className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2 }} />
          <Wand2 size={14} /> Start Creating
        </motion.button>

        <button onClick={onCreateTab}
          className="w-full mt-2 py-1.5 text-[11px] font-medium hover:opacity-80 transition-all"
          style={{ color: "hsl(var(--eid-muted-fg))" }}>
          See what&apos;s included →
        </button>
      </div>

      {/* Eid Symbols */}
      <div className="p-5 shrink-0" style={{ borderBottom: "1px solid hsl(var(--eid-border))" }}>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3"
          style={{ color: "hsl(var(--eid-muted-fg))" }}>
          Symbols of Eid
        </p>
        <div className="space-y-2">
          {EID_SYMBOLS.map(s => (
            <div key={s.name} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
                style={{ background: "rgba(197,160,63,0.10)" }}>{s.emoji}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: s.color }}>{s.name}</p>
                <p className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>{s.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Eid */}
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "hsl(var(--eid-muted-fg))" }}>
          Next Eid
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "hsl(var(--eid-surface))" }}>
          <span className="text-lg">🗓️</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "hsl(var(--eid-fg))" }}>
              {new Date(data.eidDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-[10px]" style={{ color: "hsl(var(--eid-muted-fg))" }}>Festival of Blessings</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Viewer Mobile Bottom Nav
───────────────────────────────────────── */
function ViewerBottomNav({ tab, onTabChange, darkMode, toggleDark, onStart }: {
  tab: ViewerTabId; onTabChange: (id: ViewerTabId) => void;
  darkMode: boolean; toggleDark: () => void; onStart: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();

  const moreItems = [
    { icon: Wand2,          label: "Create",            color: "var(--eid-gold)",           bg: "rgba(197,160,63,0.15)", action: () => { setMoreOpen(false); onStart(); } },
    { icon: darkMode ? Sun : Moon, label: darkMode ? "Light" : "Dark", color: "#E0C96E", bg: "rgba(224,201,110,0.12)", action: () => { toggleDark(); setMoreOpen(false); } },
    { icon: ArrowLeft,      label: "Back",              color: "hsl(var(--eid-muted-fg))",  bg: "rgba(255,255,255,0.05)", action: () => { setMoreOpen(false); router.back(); } },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
      <div className="flex justify-center mb-3 pointer-events-auto">
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[3px] -z-10" />
              <motion.div className="absolute bottom-full mb-3 flex gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                {moreItems.map((item, i) => (
                  <motion.button key={item.label}
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }} transition={{ delay: i * 0.04 }}
                    onClick={item.action} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                      style={{ background: item.bg, border: `1px solid ${item.bg}` }}>
                      <item.icon size={17} style={{ color: item.color }} strokeWidth={1.8} />
                    </div>
                    <span className="text-[8px] font-medium" style={{ color: "hsl(var(--eid-muted-fg))" }}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl"
          style={{
            background: "var(--eid-nav-bg)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid var(--eid-nav-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}>

          {TABS.map(({ id, label }) => {
            const Icon = TAB_ICONS[id];
            const active = tab === id && !moreOpen;
            return (
              <button key={id} onClick={() => { onTabChange(id); setMoreOpen(false); }}
                className="relative flex flex-col items-center py-1 px-2.5">
                {active ? (
                  <motion.div layoutId="eid-viewer-nav-active"
                    className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--eid-gradient-gold)", boxShadow: "0 4px 16px rgba(197,160,63,0.4)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                    <Icon size={18} style={{ color: "hsl(var(--eid-bg))" }} strokeWidth={2} />
                  </motion.div>
                ) : (
                  <Icon size={18} strokeWidth={1.5} style={{ color: "hsl(var(--eid-muted-fg))" }} />
                )}
                <span className="text-[9px] font-semibold"
                  style={{ color: active ? "var(--eid-gold)" : "hsl(var(--eid-muted-fg))", marginTop: active ? "1.25rem" : "0.125rem", fontFamily: "'DM Sans', sans-serif" }}>
                  {label}
                </span>
              </button>
            );
          })}

          <div className="w-px h-7 mx-0.5" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Create tab */}
          <button onClick={() => { onTabChange("create"); setMoreOpen(false); }}
            className="relative flex flex-col items-center py-1 px-2">
            {tab === "create" && !moreOpen ? (
              <motion.div layoutId="eid-viewer-nav-active"
                className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--eid-gradient-gold)", boxShadow: "0 4px 16px rgba(197,160,63,0.5)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                <Wand2 size={18} style={{ color: "hsl(var(--eid-bg))" }} strokeWidth={2} />
              </motion.div>
            ) : (
              <div className="relative">
                <Wand2 size={18} strokeWidth={1.5} style={{ color: "var(--eid-gold)" }} />
                <motion.div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "var(--eid-gold)" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }} />
              </div>
            )}
            <span className="text-[9px] font-bold"
              style={{ color: "var(--eid-gold)", marginTop: tab === "create" && !moreOpen ? "1.25rem" : "0.125rem", fontFamily: "'DM Sans', sans-serif" }}>
              Create
            </span>
          </button>

          <div className="w-px h-7 mx-0.5" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* More */}
          <button onClick={() => setMoreOpen(o => !o)}
            className="relative flex flex-col items-center py-1 px-2">
            {moreOpen ? (
              <motion.div layoutId="eid-viewer-nav-active"
                className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--eid-surface))", border: "1px solid hsl(var(--eid-border))" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                <MoreHorizontal size={18} style={{ color: "hsl(var(--eid-fg))" }} strokeWidth={2} />
              </motion.div>
            ) : (
              <MoreHorizontal size={18} strokeWidth={1.5} style={{ color: "hsl(var(--eid-muted-fg))" }} />
            )}
            <span className="text-[9px] font-semibold"
              style={{ color: moreOpen ? "hsl(var(--eid-fg))" : "hsl(var(--eid-muted-fg))", marginTop: moreOpen ? "1.25rem" : "0.125rem" }}>
              More
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main EidViewer
───────────────────────────────────────── */
interface EidViewerProps {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}

export default function EidViewer({ rawData, hasPassword, shareId }: EidViewerProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const data: EidData = {
    ...DEMO_DATA,
    senderName:      (rawData.senderName as string)      || "",
    senderFamily:    (rawData.senderFamily as string)    || "Family",
    senderMembers:   (rawData.senderMembers as EidData["senderMembers"]) || [],
    senderPhoto:     (rawData.senderPhoto as string)     || "",
    recipientName:   (rawData.recipientName as string)   || "",
    homeWishMessage: (rawData.homeWishMessage as string) || DEMO_DATA.homeWishMessage,
    congratsMessage: (rawData.congratsMessage as string) || DEMO_DATA.congratsMessage,
    urduTitle:       (rawData.urduTitle as string)       || DEMO_DATA.urduTitle,
    urduSubtitle:    (rawData.urduSubtitle as string)    || DEMO_DATA.urduSubtitle,
    englishSubtitle: (rawData.englishSubtitle as string) || DEMO_DATA.englishSubtitle,
    eidDate:         (rawData.eidDate as string)         || DEMO_DATA.eidDate,
  };

  // Dark mode
  const [darkMode, setDarkMode] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    const saved = localStorage.getItem("eid-theme");
    if (saved === "light") setDarkMode(false);
    else setDarkMode(true);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("eid-light");
      localStorage.setItem("eid-theme", "dark");
    } else {
      root.classList.add("eid-light");
      localStorage.setItem("eid-theme", "light");
    }
  }, [darkMode, themeReady]);

  // Password gate
  const [unlocked, setUnlocked] = useState(() => {
    if (!hasPassword) return true;
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`eid_unlocked_${shareId}`) === "true";
  });

  // Welcome overlay
  const [welcomed, setWelcomed] = useState(false);
  const [playMusic, setPlayMusic] = useState(false);
  const [playlistActive, setPlaylistActive] = useState(false);

  const handleWelcomeEnter = useCallback((withMusic: boolean) => {
    setPlayMusic(withMusic);
    setWelcomed(true);
  }, []);

  // Tab nav
  const [tab, setTab] = useState<ViewerTabId>("home");
  const handleTabChange = useCallback((id: ViewerTabId) => setTab(id), []);

  useEffect(() => {
    if (tab !== "playlist") setPlaylistActive(false);
  }, [tab]);

  // Auth + create flow
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const handleStartCreating = useCallback(() => {
    if (!isAuthenticated) { setShowAuthModal(true); }
    else { setShowCreateSheet(true); }
  }, [isAuthenticated]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setShowCreateSheet(true);
  }, []);

  const handleOpenInEditor = useCallback((prefill?: Partial<EidData>) => {
    if (prefill) sessionStorage.setItem("eid_prefill", JSON.stringify(prefill));
    router.push("/eid-mubarak");
  }, [router]);

  if (!themeReady) return null;

  if (!unlocked) {
    return <EidPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  return (
    <div className="h-screen relative overflow-hidden"
      style={{ background: "hsl(var(--eid-bg))", color: "hsl(var(--eid-fg))" }}>

      {!welcomed && (
        <EidWelcomeOverlay
          senderName={data.senderName}
          recipientName={data.recipientName}
          onEnter={handleWelcomeEnter}
        />
      )}

      <StarField count={20} />

      {/* Left sidebar */}
      <ViewerSidebar
        tab={tab}
        onTabChange={handleTabChange}
        darkMode={darkMode}
        toggleDark={toggleDark}
        data={data}
        onStart={handleStartCreating}
      />

      {/* Right panel (xl+) */}
      <ViewerRightPanel
        data={data}
        onCreateTab={() => handleTabChange("create")}
        onStart={handleStartCreating}
      />

      <ViewerBottomNav
        tab={tab}
        onTabChange={handleTabChange}
        darkMode={darkMode}
        toggleDark={toggleDark}
        onStart={handleStartCreating}
      />

      {/* Main content — offset left sidebar (lg) + right panel (xl) */}
      <main className="h-full overflow-y-auto no-scrollbar pb-24 lg:pb-0 lg:ml-56 xl:mr-72">
        <AnimatePresence mode="wait">
          {tab === "home" && (
            <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <HomeSection data={data} />
            </motion.div>
          )}
          {tab === "wish" && (
            <motion.div key="wish" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <WishSection data={data} onGoGreetings={() => handleTabChange("greetings")} />
              </Suspense>
            </motion.div>
          )}
          {tab === "greetings" && (
            <motion.div key="greetings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <GreetingsSection data={data} />
              </Suspense>
            </motion.div>
          )}
          {tab === "playlist" && (
            <motion.div key="playlist" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <PlaylistSection data={data} onPlayStateChange={setPlaylistActive} />
              </Suspense>
            </motion.div>
          )}
          {tab === "dua" && (
            <motion.div key="dua" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback />}>
                <DuaSection data={data} />
              </Suspense>
            </motion.div>
          )}
          {tab === "create" && (
            <motion.div key="create" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <CreateSection data={data} onStart={handleStartCreating} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <EidBackgroundMusic shouldPlay={playMusic} paused={playlistActive} />

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
      )}

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
