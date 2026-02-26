"use client";

import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home, Heart, Music, Info, Gift, MoreHorizontal,
  ArrowLeft, Sun, Moon, Sparkles, Lock, Eye, EyeOff,
  ShieldAlert, Loader2, Wand2, Palette, Shield, Share2,
  ChevronRight, Star, Check, X, Edit3, Zap, User,
} from "lucide-react";

import ColorBlobs from "@/app/(templates)/holi/components/ColorBlobs";
import ParticleRain from "@/app/(templates)/holi/components/ParticleRain";
import HomeSection from "@/app/(templates)/holi/components/HomeSection";
import WelcomeOverlay from "@/app/(templates)/holi/components/WelcomeOverlay";
import BackgroundMusic from "@/app/(templates)/holi/components/BackgroundMusic";
import { DEMO_DATA, type HoliData, type TabId, TABS } from "@/app/(templates)/holi/components/types";
import AuthModal from "@/components/AuthModal";
import { useAppSelector } from "@/store/hooks";

const WishSection     = lazy(() => import("@/app/(templates)/holi/components/WishSection"));
const GreetingsSection = lazy(() => import("@/app/(templates)/holi/components/GreetingsSection"));
const PlaylistSection  = lazy(() => import("@/app/(templates)/holi/components/PlaylistSection"));
const MoreSection      = lazy(() => import("@/app/(templates)/holi/components/MoreSection"));

import { API_URL, IS_NGROK } from "@/lib/config";

type ViewerTabId = TabId | "create";

const VIEWER_TABS: { id: ViewerTabId; label: string }[] = [
  ...TABS,
  { id: "create", label: "Create" },
];

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home, wish: Gift, greetings: Heart, playlist: Music, more: Info,
};
const TAB_COLORS: Record<TabId, string> = {
  home: "var(--holi-orange)", wish: "var(--holi-pink)",
  greetings: "var(--holi-purple)", playlist: "var(--holi-blue)", more: "var(--holi-green)",
};

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
} as const;

const FEATURES = [
  { icon: Wand2,   color: "#E91E63", bg: "rgba(233,30,99,0.12)",  label: "AI Magic",         desc: "Generate wishes instantly" },
  { icon: Palette, color: "#FF8C42", bg: "rgba(255,140,66,0.12)", label: "Beautiful Design",  desc: "Stunning Holi themes" },
  { icon: Shield,  color: "#A855F7", bg: "rgba(168,85,247,0.12)", label: "Password Protect",  desc: "Keep it private" },
  { icon: Share2,  color: "#38BDF8", bg: "rgba(56,189,248,0.12)", label: "Instant Share",     desc: "One link, anyone" },
  { icon: Music,   color: "#4CAF50", bg: "rgba(76,175,80,0.12)",  label: "Holi Music",        desc: "Background songs" },
  { icon: Star,    color: "#FFD700", bg: "rgba(255,215,0,0.12)",  label: "Always Free",       desc: "No cost, ever" },
];

function TabFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--holi-pink)", borderTopColor: "transparent" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   Password Gate
───────────────────────────────────────── */
function PasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/holi-pages/share/${shareId}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`holi_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: "hsl(var(--holi-bg))" }}>
      {[["#FF6B9D","10%","15%",160],["#A855F7","78%","10%",130],["#FF8C42","6%","72%",120],["#38BDF8","82%","68%",140],["#FFD700","48%","5%",100]].map(([c,x,y,s],i) => (
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{ width:+s, height:+s, left:x as string, top:y as string,
            background:`radial-gradient(circle,${c}35 0%,transparent 70%)`, filter:"blur(35px)" }} />
      ))}
      <motion.div initial={{ opacity:0, y:30, scale:0.93 }} animate={{ opacity:1, y:0, scale:1 }}
        transition={{ type:"spring", stiffness:260, damping:22 }} className="w-full max-w-sm">
        <div className="rounded-3xl overflow-hidden" style={{
          background:"hsl(var(--holi-card))", border:"1px solid hsl(var(--holi-border))",
          boxShadow:"0 24px 80px rgba(0,0,0,0.18)"}}>
          <div className="h-1.5" style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }} />
          <div className="px-6 pt-7 pb-7">
            <motion.div animate={{ rotate:[0,-8,8,0] }} transition={{ duration:2.5, repeat:Infinity, repeatDelay:2 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background:"var(--holi-gradient-cta)", boxShadow:"0 8px 28px rgba(233,30,99,0.35)" }}>
              <Lock size={28} style={{ color:"#fff" }} />
            </motion.div>
            <h2 className="text-xl font-bold text-center mb-1.5" style={{ color:"hsl(var(--holi-fg))" }}>🎨 Holi Surprise!</h2>
            <p className="text-xs text-center mb-6" style={{ color:"hsl(var(--holi-muted-fg))" }}>
              This Holi card is password protected.<br/>Enter the password to view it.
            </p>
            <div className="relative mb-4">
              <input type={showPw?"text":"password"} value={pw}
                onChange={e=>{setPw(e.target.value);setError("");}}
                onKeyDown={e=>{if(e.key==="Enter")handleVerify();}}
                placeholder="Enter password..." autoFocus
                className="w-full px-4 py-3.5 pr-11 rounded-2xl text-sm outline-none transition-all"
                style={{ background:"hsl(var(--holi-input))",
                  border:`1px solid ${error?"rgba(239,68,68,0.6)":"hsl(var(--holi-border))"}`,
                  color:"hsl(var(--holi-fg))",
                  boxShadow:error?"0 0 0 3px rgba(239,68,68,0.12)":"none" }} />
              <button type="button" onClick={()=>setShowPw(v=>!v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color:"hsl(var(--holi-muted-fg))" }}>
                {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
            <AnimatePresence>
              {error&&<motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="flex items-center justify-center gap-1.5 mb-4 text-xs" style={{color:"rgb(239,68,68)"}}>
                <ShieldAlert size={13}/>{error}
              </motion.div>}
            </AnimatePresence>
            <motion.button whileTap={{scale:0.97}} onClick={handleVerify} disabled={loading||!pw.trim()}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background:"var(--holi-gradient-cta)", color:"#fff", boxShadow:"0 8px 24px rgba(233,30,99,0.3)" }}>
              {loading?<><Loader2 size={16} className="animate-spin"/>Verifying...</>:<><Lock size={15}/>Unlock Holi Card</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Create Section
───────────────────────────────────────── */
function CreateSection({ data, onStart }: { data: HoliData; onStart: () => void }) {
  const senderName = data.senderName;

  const CtaCard = (
    <div className="rounded-3xl overflow-hidden sticky top-8"
      style={{ background:"hsl(var(--holi-card))", border:"1px solid hsl(var(--holi-border))",
        boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
      <div className="h-1.5" style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }} />
      <div className="p-6">
        <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background:"var(--holi-gradient-cta)", boxShadow:"0 8px 28px rgba(233,30,99,0.35)" }}
          animate={{ y:[0,-4,0] }} transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}>
          <Wand2 size={28} style={{ color:"#fff" }} strokeWidth={1.8}/>
        </motion.div>

        <h3 className="text-lg font-bold text-center mb-1" style={{ color:"hsl(var(--holi-fg))", fontFamily:"'DM Sans',sans-serif" }}>
          Your Turn!
        </h3>
        <p className="text-xs text-center mb-5 leading-relaxed" style={{ color:"hsl(var(--holi-muted-fg))" }}>
          {senderName ? `Inspired by ${senderName}'s card?` : "Inspired by this card?"}<br/>
          Send one to someone you love.
        </p>

        {/* Feature checklist */}
        <div className="space-y-2 mb-5">
          {["AI-generated wishes","Custom Holi date countdown","Password protection","Free shareable link"].map(f=>(
            <div key={f} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background:"rgba(233,30,99,0.15)" }}>
                <Check size={10} style={{ color:"var(--holi-pink)" }}/>
              </div>
              <span className="text-xs" style={{ color:"hsl(var(--holi-muted-fg))" }}>{f}</span>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale:0.97 }} onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
          style={{ background:"var(--holi-gradient-cta)", color:"#fff", boxShadow:"0 8px 28px rgba(233,30,99,0.4)" }}>
          <motion.div className="absolute inset-0 opacity-25"
            style={{ background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x:["-100%","200%"] }} transition={{ duration:2.2, repeat:Infinity, repeatDelay:1.5 }}/>
          <Wand2 size={16}/> Create My Card
          <ChevronRight size={14} strokeWidth={2.5}/>
        </motion.button>
        <p className="text-center text-[10px] mt-2" style={{ color:"hsl(var(--holi-muted-fg))" }}>
          ✨ Free · No sign-up cost · 2 minutes
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ── Desktop: 2-col ── */}
      <div className="hidden lg:flex gap-10 px-10 pt-12 pb-16 items-start max-w-5xl mx-auto">
        {/* Left column */}
        <div className="flex-1 space-y-6">
          {/* Hero */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 rounded-full" style={{ background:"hsl(var(--holi-border))" }}/>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color:"hsl(var(--holi-muted-fg))" }}>For You</span>
              <div className="h-px flex-1 rounded-full" style={{ background:"hsl(var(--holi-border))" }}/>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2" style={{ color:"hsl(var(--holi-fg))", fontFamily:"'DM Sans',sans-serif" }}>
              Create Your Own<br/><span className="holi-text-gradient">Holi Card</span>
            </h1>
            <p className="text-sm leading-relaxed" style={{ color:"hsl(var(--holi-muted-fg))" }}>
              Send a personalised Holi surprise to someone special — with music, wishes, and your own photo.
            </p>
          </div>

          {/* Sender inspiration strip */}
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid hsl(var(--holi-border))" }}>
            <div className="h-0.5" style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>
            <div className="flex items-center gap-3 px-4 py-3" style={{ background:"hsl(var(--holi-surface))" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background:"var(--holi-gradient-primary)" }}>🎨</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color:"hsl(var(--holi-fg))" }}>
                  You just received a card from <span style={{ color:"var(--holi-pink)" }}>{senderName || "someone"}</span>
                </p>
                <p className="text-[10px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>
                  Now spread the colors — create yours for someone you love
                </p>
              </div>
              <ChevronRight size={14} style={{ color:"hsl(var(--holi-muted-fg))" }}/>
            </div>
          </div>

          {/* Feature grid 3×2 */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-0.5" style={{ color:"hsl(var(--holi-muted-fg))" }}>
              Everything included
            </p>
            <div className="grid grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, color, bg, label, desc }) => (
                <motion.div key={label} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{ background:"hsl(var(--holi-card))", border:"1px solid hsl(var(--holi-border))" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background:bg }}>
                    <Icon size={17} style={{ color }} strokeWidth={1.8}/>
                  </div>
                  <p className="text-xs font-bold mb-1" style={{ color:"hsl(var(--holi-fg))" }}>{label}</p>
                  <p className="text-[10px] leading-snug" style={{ color:"hsl(var(--holi-muted-fg))" }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Color meanings row */}
          <div className="rounded-2xl p-4" style={{ background:"hsl(var(--holi-card))", border:"1px solid hsl(var(--holi-border))" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color:"hsl(var(--holi-muted-fg))" }}>
              Colors of Holi
            </p>
            <div className="flex flex-wrap gap-2">
              {data.colorMeanings.map(cm=>(
                <div key={cm.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background:`${cm.color}18`, border:`1px solid ${cm.color}40` }}>
                  <span className="text-sm">{cm.emoji}</span>
                  <span className="text-[11px] font-semibold" style={{ color:cm.color }}>{cm.name}</span>
                  <span className="text-[10px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>· {cm.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — sticky CTA card */}
        <div className="w-72 shrink-0">{CtaCard}</div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden pb-28">
        {/* Hero */}
        <div className="relative px-5 pt-10 pb-6 text-center overflow-hidden">
          {[["#FF6B9D","5%","10%",140],["#A855F7","75%","5%",120],["#38BDF8","80%","60%",100],["#FFD700","10%","65%",110]].map(([c,x,y,s],i)=>(
            <div key={i} className="absolute pointer-events-none rounded-full"
              style={{ width:+s,height:+s,left:x as string,top:y as string,
                background:`radial-gradient(circle,${c}30 0%,transparent 70%)`,filter:"blur(28px)" }}/>
          ))}
          <motion.div className="inline-flex items-center justify-center mb-5"
            animate={{ y:[0,-6,0] }} transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
              style={{ background:"var(--holi-gradient-cta)", boxShadow:"0 12px 40px rgba(233,30,99,0.4)" }}>
              <Wand2 size={36} style={{ color:"#fff" }} strokeWidth={1.8}/>
              {[["-6px","-6px",0],["4px","-10px",0.3],["-4px","2px",0.6]].map(([t,r,d],i)=>(
                <motion.span key={i} className="absolute text-sm" style={{top:t as string, right:r as string}}
                  animate={{scale:[0.8,1.3,0.8],opacity:[0.5,1,0.5]}}
                  transition={{duration:1.8,repeat:Infinity,delay:d as number}}>✨</motion.span>
              ))}
            </div>
          </motion.div>
          <div className="h-0.5 w-16 mx-auto rounded-full mb-4"
            style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>
          <h1 className="text-2xl font-bold mb-2" style={{ color:"hsl(var(--holi-fg))", fontFamily:"'DM Sans',sans-serif" }}>
            Create Your Own<br/><span className="holi-text-gradient">Holi Card</span>
          </h1>
          <p className="text-sm leading-relaxed mx-auto max-w-[260px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>
            Loved {senderName?`${senderName}'s card`:"this card"}? Make one for someone special.
          </p>
        </div>

        {/* Inspiration card */}
        <div className="px-5 mb-5">
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid hsl(var(--holi-border))" }}>
            <div className="h-0.5" style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background:"hsl(var(--holi-surface))" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background:"var(--holi-gradient-primary)" }}>🎨</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color:"hsl(var(--holi-fg))" }}>
                  From <span style={{ color:"var(--holi-pink)" }}>{senderName||"someone"}</span> — now your turn
                </p>
                <p className="text-[10px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>Create one for your loved ones →</p>
              </div>
              <ChevronRight size={14} style={{ color:"hsl(var(--holi-muted-fg))" }}/>
            </div>
          </div>
        </div>

        {/* Feature grid 2×3 */}
        <div className="px-5 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-0.5" style={{ color:"hsl(var(--holi-muted-fg))" }}>
            Everything included
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon:Icon, color, bg, label, desc })=>(
              <div key={label} className="rounded-2xl p-3.5"
                style={{ background:"hsl(var(--holi-card))", border:"1px solid hsl(var(--holi-border))" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background:bg }}>
                  <Icon size={17} style={{ color }} strokeWidth={1.8}/>
                </div>
                <p className="text-xs font-bold mb-0.5" style={{ color:"hsl(var(--holi-fg))" }}>{label}</p>
                <p className="text-[10px] leading-snug" style={{ color:"hsl(var(--holi-muted-fg))" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="px-5">
          <motion.button whileTap={{ scale:0.97 }} onClick={onStart}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 relative overflow-hidden"
            style={{ background:"var(--holi-gradient-cta)", color:"#fff", boxShadow:"0 12px 40px rgba(233,30,99,0.4)" }}>
            <motion.div className="absolute inset-0 opacity-20"
              style={{ background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
              animate={{ x:["-100%","200%"] }} transition={{ duration:2.2, repeat:Infinity, repeatDelay:1.5 }}/>
            <Wand2 size={19} strokeWidth={2}/> Start Creating Now <ChevronRight size={16} strokeWidth={2.5}/>
          </motion.button>
          <p className="text-center text-[11px] mt-2.5" style={{ color:"hsl(var(--holi-muted-fg))" }}>
            ✨ Free · No credit card · Ready in 2 minutes
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
  onOpenInEditor: (prefill?: Partial<HoliData>) => void;
}

function InlineCreateSheet({ accessToken, onClose, onOpenInEditor }: InlineCreateSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<SheetStep>("choose");
  const [aiName, setAiName] = useState("");
  const [aiSender, setAiSender] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Partial<HoliData> | null>(null);
  const [genError, setGenError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

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
            ? `Happy Holi greeting from ${aiSender.trim()} to ${aiName.trim()}. ${aiPrompt}`
            : `Happy Holi general greeting from ${aiSender.trim()}. ${aiPrompt}`,
          templateId: "holi",
          templateType: "festival",
        }),
      });
      const d = await res.json();
      const result: Partial<HoliData> = {
        recipientName: aiName.trim(),
        senderName: aiSender.trim() || d.senderName || "",
        hindiTitle: d.hindiTitle || DEMO_DATA.hindiTitle,
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
    background: "hsl(var(--holi-input))",
    border: "1px solid hsl(var(--holi-border))",
    color: "hsl(var(--holi-fg))",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    fontFamily: "'DM Sans',sans-serif",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end lg:items-center justify-center"
      style={{ padding: "0" }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}/>

      {/* Sheet panel */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="relative w-full max-w-lg lg:rounded-3xl rounded-t-3xl overflow-hidden"
        style={{
          background: "hsl(var(--holi-card))",
          border: "1px solid hsl(var(--holi-border))",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.35)",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
        }}>
        {/* Rainbow top strip */}
        <div className="h-1 shrink-0" style={{ background: "linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {step !== "choose" && (
              <button onClick={() => setStep(step === "ai-result" ? "ai" : "choose")}
                className="p-1.5 rounded-xl hover:opacity-70 transition-opacity mr-1"
                style={{ color: "hsl(var(--holi-muted-fg))", background: "hsl(var(--holi-surface))" }}>
                <ArrowLeft size={15}/>
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold" style={{ color: "hsl(var(--holi-fg))", fontFamily: "'DM Sans',sans-serif" }}>
                {step === "choose" && "✨ Create Your Holi Card"}
                {step === "ai" && "🤖 AI Magic"}
                {step === "ai-result" && "🎉 Your Wishes Are Ready!"}
              </h2>
              <p className="text-[10px]" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                {step === "choose" && "Free · 2 minutes · No credit card"}
                {step === "ai" && "Tell AI who to wish and how"}
                {step === "ai-result" && "Preview & open in the editor"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:opacity-70 transition-opacity"
            style={{ color: "hsl(var(--holi-muted-fg))", background: "hsl(var(--holi-surface))" }}>
            <X size={16}/>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto no-scrollbar flex-1">
          <AnimatePresence mode="wait">

            {/* ── Choose step ── */}
            {step === "choose" && (
              <motion.div key="choose"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="px-5 pb-6 space-y-3 pt-1">

                {/* AI card */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("ai")}
                  className="w-full text-left rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: "var(--holi-gradient-cta)", boxShadow: "0 8px 28px rgba(233,30,99,0.4)" }}>
                  {/* shimmer */}
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.7) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%","200%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}/>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.2)" }}>
                      <Wand2 size={20} style={{ color: "#fff" }} strokeWidth={2}/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white">AI Magic</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>RECOMMENDED</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        Describe the vibe — AI writes personalised Holi wishes in seconds
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.7)" }} className="shrink-0 mt-0.5"/>
                  </div>
                </motion.button>

                {/* Manual card */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenInEditor()}
                  className="w-full text-left rounded-2xl p-4"
                  style={{ background: "hsl(var(--holi-surface))", border: "1px solid hsl(var(--holi-border))" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(99,102,241,0.15)" }}>
                      <Edit3 size={20} style={{ color: "#6366F1" }} strokeWidth={2}/>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1" style={{ color: "hsl(var(--holi-fg))" }}>Write Manually</p>
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                        Craft every word yourself — full control over the message
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "hsl(var(--holi-muted-fg))" }} className="shrink-0 mt-0.5"/>
                  </div>
                </motion.button>

                <p className="text-center text-[10px] pt-1" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                  🎨 Both are completely free
                </p>
              </motion.div>
            )}

            {/* ── AI Form step ── */}
            {step === "ai" && (
              <motion.div key="ai"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="px-5 pb-6 pt-1 space-y-3">

                {/* Sender */}
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: "hsl(var(--holi-muted-fg))" }}>
                    <User size={11}/> Your name *
                  </label>
                  <input ref={nameRef} value={aiSender} onChange={e => setAiSender(e.target.value)}
                    placeholder="e.g. Rohan…"
                    style={inputStyle}/>
                </div>

                {/* Recipient */}
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: "hsl(var(--holi-muted-fg))" }}>
                    <User size={11}/> Who are you wishing? <span style={{ color: "hsl(var(--holi-muted-fg))", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input value={aiName} onChange={e => setAiName(e.target.value)}
                    placeholder="e.g. Priya, Rahul, Mom… or leave empty for a general card"
                    style={inputStyle}/>
                </div>

                {/* Prompt */}
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5"
                    style={{ color: "hsl(var(--holi-muted-fg))" }}>
                    <Sparkles size={11}/> What&apos;s the vibe? *
                  </label>
                  <textarea ref={promptRef} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="e.g. Warm, family-style wish with a little humor for my best friend…"
                    rows={3}
                    style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }}/>
                </div>

                <AnimatePresence>
                  {genError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs flex items-center gap-1.5" style={{ color: "rgb(239,68,68)" }}>
                      <ShieldAlert size={12}/>{genError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerate}
                  disabled={aiLoading || !aiSender.trim() || !aiPrompt.trim()}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50"
                  style={{ background: "var(--holi-gradient-cta)", color: "#fff", boxShadow: "0 8px 24px rgba(233,30,99,0.3)" }}>
                  {!aiLoading && (
                    <motion.div className="absolute inset-0 opacity-20"
                      style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                      animate={{ x: ["-100%","200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }}/>
                  )}
                  {aiLoading
                    ? <><Loader2 size={16} className="animate-spin"/>Generating wishes…</>
                    : <><Zap size={16}/>Generate Holi Wishes</>}
                </motion.button>
                <p className="text-center text-[10px]" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                  ✨ Powered by AI · Takes ~5 seconds
                </p>
              </motion.div>
            )}

            {/* ── AI Result step ── */}
            {step === "ai-result" && aiResult && (
              <motion.div key="ai-result"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="px-5 pb-6 pt-1 space-y-3">

                {/* Preview card */}
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: "hsl(var(--holi-surface))", border: "1px solid hsl(var(--holi-border))" }}>
                  <div className="h-0.5" style={{ background: "linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "var(--holi-gradient-cta)" }}>
                        <Sparkles size={13} style={{ color: "#fff" }}/>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: "hsl(var(--holi-muted-fg))" }}>AI generated for</p>
                        <p className="text-xs font-bold" style={{ color: "hsl(var(--holi-fg))" }}>{aiResult.recipientName}</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed italic"
                      style={{ color: "hsl(var(--holi-fg))", borderLeft: "2px solid var(--holi-pink)", paddingLeft: "10px" }}>
                      &ldquo;{aiResult.homeWishMessage?.slice(0, 160)}{(aiResult.homeWishMessage?.length ?? 0) > 160 ? "…" : ""}&rdquo;
                    </p>
                    {aiResult.senderName && (
                      <p className="text-[10px] mt-2 text-right" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                        — {aiResult.senderName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-3" style={{ background: "rgba(233,30,99,0.08)", border: "1px solid rgba(233,30,99,0.2)" }}>
                  <p className="text-[11px]" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                    <span className="font-semibold" style={{ color: "var(--holi-pink)" }}>Next:</span>
                    {" "}You can add your photo, family members, set a password, and publish a shareable link — all in the editor.
                  </p>
                </div>

                <motion.button whileTap={{ scale: 0.97 }} onClick={() => onOpenInEditor(aiResult)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{ background: "var(--holi-gradient-cta)", color: "#fff", boxShadow: "0 8px 28px rgba(233,30,99,0.4)" }}>
                  <motion.div className="absolute inset-0 opacity-20"
                    style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
                    animate={{ x: ["-100%","200%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }}/>
                  <Edit3 size={15}/> Edit &amp; Save in Editor
                  <ChevronRight size={14} strokeWidth={2.5}/>
                </motion.button>

                <button onClick={() => { setStep("ai"); setAiResult(null); }}
                  className="w-full py-2.5 rounded-xl text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "hsl(var(--holi-muted-fg))", background: "hsl(var(--holi-surface))" }}>
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
   Desktop Sidebar (enriched)
───────────────────────────────────────── */
interface SidebarProps {
  tab: ViewerTabId;
  onTabChange: (id: ViewerTabId) => void;
  darkMode: boolean;
  toggleDark: () => void;
  data: HoliData;
}

function ViewerSidebar({ tab, onTabChange, darkMode, toggleDark, data }: SidebarProps) {
  const router = useRouter();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col z-50"
      style={{ background:"hsl(var(--holi-card))", borderRight:"1px solid hsl(var(--holi-border))" }}>

      {/* Hero header with image */}
      <div className="relative h-36 overflow-hidden shrink-0">
        <Image src="/assets/Holi/hero_holi.png" alt="" fill className="object-cover object-center" sizes="240px" style={{ opacity:0.18 }}/>
        <div className="absolute inset-0" style={{ background:"var(--holi-gradient-primary)", opacity:0.75 }}/>
        {/* Rainbow strip at very top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <motion.div className="text-3xl mb-1"
            animate={{ rotate:[0,10,-10,0] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}>
            🎨
          </motion.div>
          <h1 className="text-lg font-bold text-white drop-shadow-lg" style={{ fontFamily:"'Noto Serif Devanagari',serif" }}>
            होली है!
          </h1>
          <p className="text-[11px] text-white/70 mt-0.5" style={{ fontFamily:"'DM Sans',sans-serif" }}>
            Festival of Colors
          </p>
        </div>
      </div>

      {/* Sender info card */}
      {data.senderName && (
        <div className="px-4 py-3 shrink-0" style={{ borderBottom:"1px solid hsl(var(--holi-border))" }}>
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background:"var(--holi-gradient-cta)" }}>
              {data.senderPhoto ? (
                <img src={data.senderPhoto} alt="" className="w-full h-full object-cover"/>
              ) : (
                <span className="text-white text-sm font-bold">
                  {data.senderName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium" style={{ color:"hsl(var(--holi-muted-fg))" }}>Card from</p>
              <p className="text-xs font-bold truncate" style={{ color:"hsl(var(--holi-fg))" }}>{data.senderName}</p>
            </div>
            <motion.div className="text-base" animate={{ rotate:[0,15,-15,0] }}
              transition={{ duration:2, repeat:Infinity, repeatDelay:3 }}>🎨</motion.div>
          </div>
          {/* For label */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-px flex-1" style={{ background:"hsl(var(--holi-border))" }}/>
            <p className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: data.recipientName ? "var(--holi-pink)" : "hsl(var(--holi-muted-fg))" }}>
              {data.recipientName ? `For ${data.recipientName}` : "For Everyone 🌈"}
            </p>
            <div className="h-px flex-1" style={{ background:"hsl(var(--holi-border))" }}/>
          </div>
        </div>
      )}

      {/* Nav tabs */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {TABS.map(({ id, label }) => {
          const Icon = TAB_ICONS[id];
          const color = TAB_COLORS[id];
          const active = tab === id;
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
              style={{
                background: active ? `${color}18` : "transparent",
                color: active ? color : "hsl(var(--holi-muted-fg))",
                fontWeight: active ? 600 : 400,
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: active ? `0 0 20px ${color}15` : "none",
              }}>
              <Icon size={17} strokeWidth={active ? 2 : 1.5}/>
              <span className="text-sm">{label}</span>
              {active && <motion.div layoutId="sidebar-active-dot" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:color }}/>}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px mx-2 my-2" style={{ background:"hsl(var(--holi-border))" }}/>

        {/* Create tab — gradient CTA */}
        <motion.button onClick={() => onTabChange("create")} whileTap={{ scale:0.97 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left relative overflow-hidden"
          style={{
            background: tab==="create" ? "var(--holi-gradient-cta)" : "rgba(233,30,99,0.10)",
            color: tab==="create" ? "#fff" : "var(--holi-pink)",
            fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif",
            border: `1px solid ${tab==="create"?"transparent":"rgba(233,30,99,0.22)"}`,
            boxShadow: tab==="create" ? "0 4px 20px rgba(233,30,99,0.35)" : "none",
          }}>
          {tab !== "create" && (
            <motion.div className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border:"1px solid rgba(233,30,99,0.4)" }}
              animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:2, repeat:Infinity }}/>
          )}
          <Wand2 size={17} strokeWidth={2}/>
          <span className="text-sm">Create Yours</span>
          {tab !== "create" && (
            <motion.span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background:"var(--holi-gradient-cta)", color:"#fff" }}
              animate={{ scale:[1,1.1,1] }} transition={{ duration:1.5, repeat:Infinity }}>
              FREE
            </motion.span>
          )}
        </motion.button>
      </nav>

      {/* Footer */}
      <div className="p-3 shrink-0" style={{ borderTop:"1px solid hsl(var(--holi-border))" }}>
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium hover:opacity-80 transition-all"
            style={{ color:"hsl(var(--holi-muted-fg))", background:"hsl(var(--holi-surface))" }}>
            <ArrowLeft size={13}/> Back
          </button>
          <button onClick={toggleDark} className="p-2 rounded-lg hover:opacity-80 transition-all"
            style={{ color:"hsl(var(--holi-muted-fg))" }}>
            {darkMode ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Desktop Right Panel (xl+)
───────────────────────────────────────── */
function ViewerRightPanel({ data, onCreateTab, onStart }: { data: HoliData; onCreateTab: () => void; onStart: () => void }) {
  return (
    <aside className="hidden xl:flex fixed right-0 top-0 h-full w-72 flex-col z-50 overflow-y-auto no-scrollbar"
      style={{ background:"hsl(var(--holi-card))", borderLeft:"1px solid hsl(var(--holi-border))" }}>

      {/* Top rainbow strip */}
      <div className="h-1 shrink-0" style={{ background:"linear-gradient(90deg,#FF6B9D,#FF8C42,#FFD700,#4CAF50,#38BDF8,#A855F7)" }}/>

      {/* Create CTA section */}
      <div className="p-5 shrink-0" style={{ borderBottom:"1px solid hsl(var(--holi-border))" }}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div animate={{ rotate:[0,-8,8,0] }} transition={{ duration:2.5, repeat:Infinity, repeatDelay:2 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:"var(--holi-gradient-cta)" }}>
            <Wand2 size={15} style={{ color:"#fff" }}/>
          </motion.div>
          <div>
            <p className="text-xs font-bold" style={{ color:"hsl(var(--holi-fg))" }}>Create Your Card</p>
            <p className="text-[10px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>Free · 2 minutes</p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed mb-4" style={{ color:"hsl(var(--holi-muted-fg))" }}>
          {data.senderName ? `Loved ${data.senderName}'s Holi card?` : "Love this Holi card?"} Make a personalised one for someone special with AI-generated wishes and music.
        </p>

        {/* Mini feature list */}
        <div className="space-y-1.5 mb-4">
          {["AI-generated wishes","Your photo + family name","Password protection","Shareable link"].map(f=>(
            <div key={f} className="flex items-center gap-2">
              <Sparkles size={10} style={{ color:"var(--holi-pink)", flexShrink:0 }}/>
              <span className="text-[11px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>{f}</span>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale:0.97 }} onClick={onStart}
          className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
          style={{ background:"var(--holi-gradient-cta)", color:"#fff", boxShadow:"0 6px 20px rgba(233,30,99,0.35)" }}>
          <motion.div className="absolute inset-0 opacity-20"
            style={{ background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.6) 50%,transparent 60%)" }}
            animate={{ x:["-100%","200%"] }} transition={{ duration:2.2, repeat:Infinity, repeatDelay:2 }}/>
          <Wand2 size={14}/> Start Creating
        </motion.button>

        <button onClick={onCreateTab}
          className="w-full mt-2 py-1.5 text-[11px] font-medium hover:opacity-80 transition-all"
          style={{ color:"hsl(var(--holi-muted-fg))" }}>
          See what&apos;s included →
        </button>
      </div>

      {/* Colors of Holi */}
      <div className="p-5 shrink-0" style={{ borderBottom:"1px solid hsl(var(--holi-border))" }}>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color:"hsl(var(--holi-muted-fg))" }}>
          Colors of Holi
        </p>
        <div className="space-y-2">
          {data.colorMeanings.map(cm => (
            <div key={cm.name} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
                style={{ background:`${cm.color}22` }}>{cm.emoji}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color:cm.color }}>{cm.name}</p>
                <p className="text-[10px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>{cm.meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holi date */}
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:"hsl(var(--holi-muted-fg))" }}>
          Next Holi
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background:"hsl(var(--holi-surface))" }}>
          <span className="text-lg">🗓️</span>
          <div>
            <p className="text-xs font-semibold" style={{ color:"hsl(var(--holi-fg))" }}>
              {new Date(data.holiDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
            </p>
            <p className="text-[10px]" style={{ color:"hsl(var(--holi-muted-fg))" }}>Festival of Colors</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   Main Viewer
───────────────────────────────────────── */
interface HoliViewerProps {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}

export default function HoliViewer({ rawData, hasPassword, shareId }: HoliViewerProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const data: HoliData = {
    ...DEMO_DATA,
    senderName:      (rawData.senderName as string)      || DEMO_DATA.senderName,
    senderFamily:    (rawData.senderFamily as string)    || DEMO_DATA.senderFamily,
    senderMembers:   (rawData.senderMembers as HoliData["senderMembers"]) || [],
    senderPhoto:     (rawData.senderPhoto as string)     || "",
    recipientName:   (rawData.recipientName as string)   || "",
    homeWishMessage: (rawData.homeWishMessage as string) || DEMO_DATA.homeWishMessage,
    congratsMessage: (rawData.congratsMessage as string) || DEMO_DATA.congratsMessage,
    hindiTitle:      (rawData.hindiTitle as string)      || DEMO_DATA.hindiTitle,
    hindiSubtitle:   (rawData.hindiSubtitle as string)   || DEMO_DATA.hindiSubtitle,
    englishSubtitle: (rawData.englishSubtitle as string) || DEMO_DATA.englishSubtitle,
    holiDate:        (rawData.holiDate as string)        || DEMO_DATA.holiDate,
  };

  const [tab, setTab]                   = useState<ViewerTabId>("home");
  const [welcomed, setWelcomed]         = useState(false);
  const [playMusic, setPlayMusic]       = useState(false);
  const [playlistActive, setPlaylistActive] = useState(false);
  const [darkMode, setDarkMode]         = useState(false);
  const [themeReady, setThemeReady]     = useState(false);
  const [moreOpen, setMoreOpen]         = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined")
      return sessionStorage.getItem(`holi_unlocked_${shareId}`) === "true";
    return false;
  });
  const needsPassword = hasPassword && !isUnlocked;

  useEffect(() => {
    const saved = localStorage.getItem("holi-theme");
    setDarkMode(saved === "dark");
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const root = document.documentElement;
    if (darkMode) { root.classList.add("holi-dark");    localStorage.setItem("holi-theme","dark"); }
    else           { root.classList.remove("holi-dark"); localStorage.setItem("holi-theme","light"); }
  }, [darkMode, themeReady]);

  useEffect(() => { if (tab !== "playlist") setPlaylistActive(false); }, [tab]);

  const handleTabChange = useCallback((id: ViewerTabId) => { setTab(id); setMoreOpen(false); }, []);
  const handleWelcomeEnter = useCallback((withMusic: boolean) => { setPlayMusic(withMusic); setWelcomed(true); }, []);
  const handlePlaylistStateChange = useCallback((playing: boolean) => { setPlaylistActive(playing); }, []);
  const toggleDark = useCallback(() => setDarkMode(d => !d), []);

  // ── Create CTA handler ──
  const handleStartCreating = useCallback(() => {
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

  const handleOpenInEditor = useCallback((prefill?: Partial<HoliData>) => {
    if (prefill) {
      sessionStorage.setItem("holi_prefill", JSON.stringify(prefill));
    }
    router.push("/holi");
  }, [router]);

  if (!themeReady) return null;

  if (needsPassword) {
    return (
      <div style={{ background:"hsl(var(--holi-bg))" }} className="min-h-screen">
        <PasswordGate shareId={shareId} onUnlocked={() => setIsUnlocked(true)} />
      </div>
    );
  }

  const moreItems = [
    { icon: darkMode ? Sun : Moon, label: darkMode?"Light":"Dark",
      color: darkMode?"var(--holi-yellow)":"var(--holi-purple)",
      bg: darkMode?"rgba(255,235,59,0.12)":"rgba(156,39,176,0.12)",
      action: () => { toggleDark(); setMoreOpen(false); } },
    { icon: ArrowLeft, label:"Back", color:"hsl(var(--holi-muted-fg))", bg:"rgba(0,0,0,0.05)",
      action: () => { setMoreOpen(false); router.back(); } },
  ];

  return (
    <div className="h-screen relative overflow-hidden"
      style={{ background:"hsl(var(--holi-bg))", color:"hsl(var(--holi-fg))" }}>

      {!welcomed && (
        <WelcomeOverlay senderName={data.senderName} recipientName={data.recipientName} onEnter={handleWelcomeEnter} />
      )}

      {tab !== "home" && tab !== "create" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image src="/assets/Holi/hero_holi.png" alt="" fill className="object-cover object-center" sizes="100vw" priority style={{ opacity:0.08 }}/>
          <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,hsl(var(--holi-bg)/0.4) 0%,hsl(var(--holi-bg)/0.65) 40%,hsl(var(--holi-bg)/0.5) 70%,hsl(var(--holi-bg)/0.4) 100%)" }}/>
        </div>
      )}

      <ColorBlobs count={8}/>
      <ParticleRain count={14}/>

      {/* Left sidebar */}
      <ViewerSidebar tab={tab} onTabChange={handleTabChange} darkMode={darkMode} toggleDark={toggleDark} data={data}/>

      {/* Right panel (xl+) */}
      <ViewerRightPanel data={data} onCreateTab={() => handleTabChange("create")} onStart={handleStartCreating}/>

      {/* ─── Mobile bottom nav ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none lg:hidden">
        <div className="flex justify-center mb-3 pointer-events-auto">
          <AnimatePresence>
            {moreOpen && (
              <>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  onClick={()=>setMoreOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-[3px] -z-10"/>
                <motion.div className="absolute bottom-full mb-3 flex gap-3"
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}>
                  {moreItems.map((item,i)=>(
                    <motion.button key={item.label}
                      initial={{opacity:0,scale:0.7}} animate={{opacity:1,scale:1}}
                      exit={{opacity:0,scale:0.7}} transition={{delay:i*0.04}}
                      onClick={item.action} className="flex flex-col items-center gap-1">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{background:item.bg,border:`1px solid ${item.bg}`}}>
                        <item.icon size={17} style={{color:item.color}} strokeWidth={1.8}/>
                      </div>
                      <span className="text-[8px] font-medium" style={{color:"hsl(var(--holi-muted-fg))"}}>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl"
            style={{ background:"var(--holi-nav-bg)", backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)",
              border:"1px solid var(--holi-nav-border)", boxShadow:"var(--holi-glass-shadow)" }}>

            {TABS.map(({ id, label }) => {
              const Icon = TAB_ICONS[id];
              const color = TAB_COLORS[id];
              const active = tab === id && !moreOpen;
              return (
                <button key={id} onClick={()=>handleTabChange(id)} className="relative flex flex-col items-center py-1 px-2.5">
                  {active ? (
                    <motion.div layoutId="holi-viewer-nav-active"
                      className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{background:color,boxShadow:`0 4px 16px ${color}66`}}
                      transition={{type:"spring",stiffness:400,damping:30}}>
                      <Icon size={18} style={{color:"#fff"}} strokeWidth={2}/>
                    </motion.div>
                  ) : (
                    <Icon size={18} strokeWidth={1.5} style={{color:"hsl(var(--holi-muted-fg))"}}/>
                  )}
                  <span className="text-[9px] font-semibold" style={{
                    color: active?color:"hsl(var(--holi-muted-fg))",
                    marginTop: active?"1.25rem":"0.125rem",
                    fontFamily:"'DM Sans',sans-serif"
                  }}>{label}</span>
                </button>
              );
            })}

            <div className="w-px h-7 mx-0.5" style={{background:"hsl(var(--holi-border))"}}/>

            {/* Create tab */}
            <button onClick={()=>handleTabChange("create")} className="relative flex flex-col items-center py-1 px-2">
              {tab==="create" && !moreOpen ? (
                <motion.div layoutId="holi-viewer-nav-active"
                  className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{background:"var(--holi-gradient-cta)",boxShadow:"0 4px 16px rgba(233,30,99,0.5)"}}
                  transition={{type:"spring",stiffness:400,damping:30}}>
                  <Wand2 size={18} style={{color:"#fff"}} strokeWidth={2}/>
                </motion.div>
              ) : (
                <div className="relative">
                  <Wand2 size={18} strokeWidth={1.5} style={{color:"var(--holi-pink)"}}/>
                  <motion.div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{background:"var(--holi-pink)"}}
                    animate={{scale:[1,1.5,1],opacity:[1,0.4,1]}}
                    transition={{duration:1.6,repeat:Infinity}}/>
                </div>
              )}
              <span className="text-[9px] font-bold" style={{
                color:"var(--holi-pink)",
                marginTop: tab==="create"&&!moreOpen?"1.25rem":"0.125rem",
                fontFamily:"'DM Sans',sans-serif"
              }}>Create</span>
            </button>

            <div className="w-px h-7 mx-0.5" style={{background:"hsl(var(--holi-border))"}}/>

            {/* More */}
            <button onClick={()=>setMoreOpen(o=>!o)} className="relative flex flex-col items-center py-1 px-2">
              {moreOpen ? (
                <motion.div layoutId="holi-viewer-nav-active"
                  className="absolute -top-4 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{background:"hsl(var(--holi-surface))",border:"1px solid hsl(var(--holi-border))"}}
                  transition={{type:"spring",stiffness:400,damping:30}}>
                  <MoreHorizontal size={18} style={{color:"hsl(var(--holi-fg))"}} strokeWidth={2}/>
                </motion.div>
              ) : (
                <MoreHorizontal size={18} strokeWidth={1.5} style={{color:"hsl(var(--holi-muted-fg))"}}/>
              )}
              <span className="text-[9px] font-semibold" style={{
                color: moreOpen?"hsl(var(--holi-fg))":"hsl(var(--holi-muted-fg))",
                marginTop: moreOpen?"1.25rem":"0.125rem"
              }}>More</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main content ─── */}
      {/* lg: offset left sidebar 240px | xl: also offset right panel 288px */}
      <main className="h-full overflow-y-auto no-scrollbar pb-24 lg:pb-0 lg:ml-60 xl:mr-72">
        <AnimatePresence mode="wait">
          {tab==="home" && (
            <motion.div key="home" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <HomeSection data={data}/>
            </motion.div>
          )}
          {tab==="wish" && (
            <motion.div key="wish" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback/>}>
                <WishSection data={data} onGoGreetings={()=>handleTabChange("greetings")}/>
              </Suspense>
            </motion.div>
          )}
          {tab==="greetings" && (
            <motion.div key="greetings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback/>}>
                <GreetingsSection data={data}/>
              </Suspense>
            </motion.div>
          )}
          {tab==="playlist" && (
            <motion.div key="playlist" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback/>}>
                <PlaylistSection data={data} onPlayStateChange={handlePlaylistStateChange}/>
              </Suspense>
            </motion.div>
          )}
          {tab==="more" && (
            <motion.div key="more" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Suspense fallback={<TabFallback/>}>
                <MoreSection data={data}/>
              </Suspense>
            </motion.div>
          )}
          {tab==="create" && (
            <motion.div key="create" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <CreateSection data={data} onStart={handleStartCreating}/>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BackgroundMusic shouldPlay={playMusic} paused={playlistActive}/>

      {/* Auth modal (for unauthenticated users) */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Inline Create Sheet (for authenticated users) */}
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
