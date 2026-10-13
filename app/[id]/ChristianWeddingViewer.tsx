"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Heart, CalendarDays, Image as ImageIcon, Flower2,
  Lock, Eye, EyeOff, ShieldAlert, Loader2,
  Sparkles, Music2, VolumeX,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import localFont from "next/font/local";
import { type ShaadiData, type TabId, TABS, CHRISTIAN_DEMO_DATA } from "@/app/(templates)/christian-wedding/components/types";
import { ChristianPageChrome } from "@/app/(templates)/christian-wedding/components/ChristianPageChrome";
import { API_URL, IS_NGROK } from "@/lib/config";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

const cinzel = localFont({
  src: [
    { path: "../../assets/fonts/cinzel-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/cinzel-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-cinzel" });
const greatVibes = localFont({
  src: [
    { path: "../../assets/fonts/great-vibes-400-normal.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-great-vibes" });
const dmSans = localFont({
  src: [
    { path: "../../assets/fonts/dm-sans-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/dm-sans-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../assets/fonts/dm-sans-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans" });
const lora = localFont({
  src: [
    { path: "../../assets/fonts/lora-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/lora-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-lora" });
const playfair = localFont({
  src: [
    { path: "../../assets/fonts/playfair-display-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/playfair-display-700-normal.woff2", weight: "700", style: "normal" },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-playfair" });

const FONT_VARS = `${cinzel.variable} ${greatVibes.variable} ${dmSans.variable} ${lora.variable} ${playfair.variable}`;

const ChristianBackgroundMusic = lazy(() => import("@/app/(templates)/christian-wedding/components/ChristianBackgroundMusic"));
const HomeSection = lazy(() => import("@/app/(templates)/christian-wedding/components/HomeSection"));
const CoupleSection = lazy(() => import("@/app/(templates)/christian-wedding/components/CoupleSection"));
const EventsSection = lazy(() => import("@/app/(templates)/christian-wedding/components/EventsSection"));
const GallerySection = lazy(() => import("@/app/(templates)/christian-wedding/components/GallerySection"));
const WishesSection = lazy(() => import("@/app/(templates)/christian-wedding/components/WishesSection"));

const C_ACCENT = "#546B57";
const C_MED = "#7A9B7E";
const C_DARK = "#2D3E32";

const F_DANCING = "var(--font-great-vibes), cursive";
const F_CINZEL = "var(--font-cinzel), serif";

const TAB_ICONS: Record<TabId, typeof Home> = {
  home: Home, couple: Heart, events: CalendarDays, gallery: ImageIcon, blessings: Flower2,
};

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
} as const;

function TabFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fcfcfa" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: C_ACCENT, borderTopColor: "transparent" }} />
    </div>
  );
}

function mapData(d: Record<string, unknown>): ShaadiData {
  return {
    ...CHRISTIAN_DEMO_DATA,
    brideName: (d.brideName as string) || CHRISTIAN_DEMO_DATA.brideName,
    groomName: (d.groomName as string) || CHRISTIAN_DEMO_DATA.groomName,
    weddingDate: (d.weddingDate as string) || CHRISTIAN_DEMO_DATA.weddingDate,
    venue: (d.venue as string) || CHRISTIAN_DEMO_DATA.venue,
    blessing: (d.blessing as string) || CHRISTIAN_DEMO_DATA.blessing,
    bride: {
      ...CHRISTIAN_DEMO_DATA.bride,
      name: (d.brideName as string) || CHRISTIAN_DEMO_DATA.bride.name,
      photo: (d.bridePhoto as string) || "",
      description: (d.brideDescription as string) || CHRISTIAN_DEMO_DATA.bride.description,
      tags: (d.brideTags as { emoji: string; label: string }[]) || CHRISTIAN_DEMO_DATA.bride.tags,
    },
    groom: {
      ...CHRISTIAN_DEMO_DATA.groom,
      name: (d.groomName as string) || CHRISTIAN_DEMO_DATA.groom.name,
      photo: (d.groomPhoto as string) || "",
      description: (d.groomDescription as string) || CHRISTIAN_DEMO_DATA.groom.description,
      tags: (d.groomTags as { emoji: string; label: string }[]) || CHRISTIAN_DEMO_DATA.groom.tags,
    },
    brideFamily: {
      title: "Bride's Family",
      parents: (d.brideFamilyParents as string) || CHRISTIAN_DEMO_DATA.brideFamily.parents,
      grandparents: (d.brideFamilyGrandparents as string) || CHRISTIAN_DEMO_DATA.brideFamily.grandparents,
    },
    groomFamily: {
      title: "Groom's Family",
      parents: (d.groomFamilyParents as string) || CHRISTIAN_DEMO_DATA.groomFamily.parents,
      grandparents: (d.groomFamilyGrandparents as string) || CHRISTIAN_DEMO_DATA.groomFamily.grandparents,
    },
    events: ((d.events as ShaadiData["events"]) || CHRISTIAN_DEMO_DATA.events).map((ev) => ({
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

/* ─── Audio Entry Gate ─────────────────────────────────────────────────── */
function AudioEntryGate({
  brideName,
  groomName,
  weddingDate,
  venue,
  onEnter,
}: {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  onEnter: (withMusic: boolean) => void;
}) {
  const date = (() => {
    try {
      const d = new Date(weddingDate);
      if (isNaN(d.getTime())) throw new Error();
      return {
        day: d.getDate(),
        month: d.toLocaleString("en-US", { month: "long" }),
        year: d.getFullYear(),
        weekday: d.toLocaleString("en-US", { weekday: "long" }),
      };
    } catch {
      return { day: 22, month: "July", year: 2026, weekday: "Saturday" };
    }
  })();
  const venueLine = (venue || "").split(",")[0].trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center px-5"
      style={{ background: "linear-gradient(160deg, #f5f3ee 0%, #eceae3 60%, #e8e6de 100%)" }}
    >
      {/* Faint corner brackets */}
      {[
        { top: 20, left: 20, rotate: "0deg" },
        { top: 20, right: 20, rotate: "90deg" },
        { bottom: 20, right: 20, rotate: "180deg" },
        { bottom: 20, left: 20, rotate: "270deg" },
      ].map((pos, i) => (
        <svg key={i} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden
          style={{ position: "absolute", ...pos, opacity: 0.18 }}>
          <path d="M2 30 L2 2 L30 2" stroke="#546B57" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col items-center text-center"
        style={{ maxWidth: 340 }}
      >
        {/* Top ornament */}
        <svg width="100" height="24" viewBox="0 0 100 24" fill="none" aria-hidden style={{ marginBottom: 20, opacity: 0.6 }}>
          <path d="M50 12 C40 5 28 3 16 7" stroke="#7A9B7E" strokeWidth="1" strokeLinecap="round" />
          <path d="M50 12 C60 5 72 3 84 7" stroke="#7A9B7E" strokeWidth="1" strokeLinecap="round" />
          <ellipse cx="20" cy="6" rx="5" ry="3" transform="rotate(-20 20 6)" fill="#A8C4AC" opacity="0.6" />
          <ellipse cx="80" cy="6" rx="5" ry="3" transform="rotate(20 80 6)" fill="#A8C4AC" opacity="0.6" />
          <circle cx="50" cy="12" r="2" fill="#7A9B7E" opacity="0.8" />
        </svg>

        {/* "You're invited" label */}
        <span style={{
          fontFamily: F_CINZEL,
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: "#7A9B7E",
          marginBottom: 18,
          display: "block",
        }}>
          You&apos;re Invited
        </span>

        {/* Names */}
        <span style={{
          fontFamily: F_DANCING,
          fontSize: "4.5rem",
          color: "#3D5441",
          lineHeight: 1.0,
          display: "block",
        }}>
          {brideName || "Jane"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 4px" }}>
          <div style={{ height: 1, width: 44, background: "linear-gradient(90deg, transparent, #A8C4AC)" }} aria-hidden />
          <span style={{ fontFamily: F_DANCING, fontSize: "1.8rem", color: "#7A9B7E", lineHeight: 1 }}>&amp;</span>
          <div style={{ height: 1, width: 44, background: "linear-gradient(90deg, #A8C4AC, transparent)" }} aria-hidden />
        </div>
        <span style={{
          fontFamily: F_DANCING,
          fontSize: "4.5rem",
          color: "#3D5441",
          lineHeight: 1.0,
          display: "block",
          marginBottom: 24,
        }}>
          {groomName || "Andrew"}
        </span>

        {/* Ornament divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 22, width: "100%" }}>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, #A8C4AC60)" }} aria-hidden />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#A8C4AC" }} aria-hidden />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#546B57", opacity: 0.5 }} aria-hidden />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#A8C4AC" }} aria-hidden />
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, #A8C4AC60, transparent)" }} aria-hidden />
        </div>

        {/* Date + venue */}
        <span style={{
          fontFamily: F_CINZEL,
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#7A9B7E",
          marginBottom: 4,
          display: "block",
        }}>
          {date.weekday}, {date.month} {date.day}, {date.year}
        </span>
        {venueLine && (
          <span style={{
            fontFamily: "var(--font-lora), Lora, serif",
            fontSize: "0.85rem",
            color: "#546B57",
            opacity: 0.75,
            marginBottom: 36,
            display: "block",
          }}>
            {venueLine}
          </span>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onEnter(true)}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm"
            style={{
              background: "linear-gradient(135deg, #546B57, #7A9B7E)",
              fontFamily: F_CINZEL,
              letterSpacing: "0.08em",
              boxShadow: "0 8px 24px #546B5730",
            }}
          >
            <Music2 size={16} />
            Enter with Music
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onEnter(false)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
            style={{
              background: "transparent",
              border: "1px solid #A8C4AC80",
              fontFamily: F_CINZEL,
              letterSpacing: "0.08em",
              color: "#7A9B7E",
            }}
          >
            <VolumeX size={15} />
            Continue without Music
          </motion.button>
        </div>

        {/* Bottom ornament */}
        <svg width="80" height="16" viewBox="0 0 80 16" fill="none" aria-hidden style={{ marginTop: 28, opacity: 0.35 }}>
          <line x1="0" y1="8" x2="32" y2="8" stroke="#7A9B7E" strokeWidth="0.8" />
          <circle cx="40" cy="8" r="3" fill="none" stroke="#7A9B7E" strokeWidth="1" />
          <line x1="48" y1="8" x2="80" y2="8" stroke="#7A9B7E" strokeWidth="0.8" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

interface ChristianWeddingViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

export default function ChristianWeddingViewer({ rawData, shareId, hasPassword }: ChristianWeddingViewerProps) {
  const [tab, setTab] = useState<TabId>("home");
  const [data, setData] = useState<ShaadiData>(mapData(rawData));

  const [entered, setEntered] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const handleEnter = useCallback((withMusic: boolean) => {
    setMusicEnabled(withMusic);
    setEntered(true);
  }, []);

  const [locked, setLocked] = useState(hasPassword);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const verifyPassword = useCallback(async () => {
    if (!pw.trim()) return;
    setPwLoading(true); setPwError("");
    try {
      const res = await fetch(`${API_URL}/christian-wedding-pages/share/${shareId}/verify`, {
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

  const handleBlessingsUpdated = useCallback((wishes: { name: string; message: string; voiceUrl?: string }[]) => {
    setData((prev) => ({ ...prev, wishes }));
  }, []);


  if (!entered) {
    return (
      <div className={FONT_VARS}>
        <AnimatePresence>
          <AudioEntryGate
            brideName={data.brideName}
            groomName={data.groomName}
            weddingDate={data.weddingDate}
            venue={data.venue}
            onEnter={handleEnter}
          />
        </AnimatePresence>
      </div>
    );
  }

  if (locked) {
    return (
      <div className={FONT_VARS}>
        <div className="min-h-screen flex items-center justify-center px-5"
          style={{ background: "#fcfcfa" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "#fafbf9", border: `1px solid ${C_MED}30` }}
          >
            <div className="h-1.5" style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})` }} />
            <div className="px-6 pt-7 pb-6">
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`, boxShadow: `0 12px 28px ${C_ACCENT}30` }}
                >
                  <Lock size={26} />
                </motion.div>
                <h3 className="text-lg font-bold text-center" style={{ fontFamily: F_CINZEL, color: C_DARK }}>
                  This Invitation is Locked
                </h3>
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
                  style={{ background: "#f5f7f4", borderColor: pwError ? "#ef4444" : `${C_MED}30`, color: C_DARK }}
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
                style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`, fontFamily: F_CINZEL, boxShadow: `0 6px 20px ${C_ACCENT}25` }}>
                {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                {pwLoading ? "Verifying..." : "Unlock Invitation"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={FONT_VARS}>
      <style>{`
        @keyframes cw-create-blink {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes cw-star-spin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(12deg) scale(1.12); }
        }
      `}</style>
      <div className="relative overflow-hidden" style={{ background: "#fcfcfa", height: "100dvh" }}>

        <Suspense fallback={null}>
          <ChristianBackgroundMusic shouldPlay={musicEnabled} />
        </Suspense>

        {/* Company branding — top right */}
        <Link
          href="/templates"
          onClick={() =>
            track(EVENTS.CREATE_CTA_CLICKED, {
              template: "christian-wedding",
              source: "viewer_logo",
            })
          }
          style={{
            position: "fixed",
            top: 14,
            right: 14,
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              overflow: "hidden",
              background: "transparent",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${C_MED}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NextImage
              src="/logo.webp"
              alt="SubhSandesh"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </div>
          <span
            style={{
              fontFamily: F_CINZEL,
              fontSize: 7,
              fontWeight: 700,
              color: C_DARK,
              letterSpacing: "0.08em",
              opacity: 1,
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            SubhSandesh
          </span>
        </Link>

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30 select-none"
          style={{
            width: 256,
            background: "rgba(252,252,250,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRight: `1px solid ${C_MED}18`,
            boxShadow: `4px 0 24px ${C_ACCENT}08`,
          }}
        >
          <div className="px-5 pt-6 pb-4 border-b" style={{ borderColor: `${C_MED}15` }}>
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
              {data.blessing || "Wedding Invitation"}
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {TABS.map(({ id, label }) => {
              const active = tab === id;
              const Icon = TAB_ICONS[id];
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left relative"
                  style={{
                    background: active ? `${C_ACCENT}12` : "transparent",
                    color: active ? C_ACCENT : C_DARK,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.6} className="shrink-0"
                    style={{ color: active ? C_ACCENT : C_MED }} />
                  <span className="text-sm" style={{ fontFamily: F_CINZEL, letterSpacing: "0.04em" }}>{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C_ACCENT }} />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-5 pt-3 border-t" style={{ borderColor: `${C_MED}15` }}>
            <Link href="/christian-wedding"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`, fontFamily: F_CINZEL, boxShadow: `0 4px 16px ${C_ACCENT}35` }}
            >
              <Sparkles size={15} />
              Create Your Own
            </Link>
          </div>
        </aside>

        {/* Fixed page chrome for non-home tabs */}
        {tab !== "home" && (
          <div className="pointer-events-none absolute inset-0 z-[1] lg:ml-64" aria-hidden>
            <div className="relative h-full w-full">
              <ChristianPageChrome />
            </div>
          </div>
        )}


        {/* Scrollable content */}
        <div className="no-scrollbar relative z-[2] h-full overflow-y-auto lg:ml-64">
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
              <motion.div key="events" className="pb-20 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <EventsSection data={data} />
                </Suspense>
              </motion.div>
            )}
            {tab === "gallery" && (
              <motion.div key="gallery" className="pb-20 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <GallerySection data={data} />
                </Suspense>
              </motion.div>
            )}
            {tab === "blessings" && (
              <motion.div key="blessings" className="pb-20 lg:pb-0" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
                <Suspense fallback={<TabFallback />}>
                  <WishesSection data={data} shareId={shareId} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom navigation — mobile only */}
        <nav
          className="lg:hidden"
          style={{
            position: "fixed",
            bottom: 10,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              width: "calc(100% - 16px)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {/* Navbar container */}
            <div
              className="relative overflow-visible"
              style={{
                flex: 1,
                background: "rgba(252,252,248,0.94)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: `1px solid ${C_MED}22`,
                borderRadius: "16px 0 0 16px",
                borderRight: "none",
              }}
            >
              <div className="flex items-stretch" style={{ padding: "2px 4px" }}>
                {TABS.map(({ id, label }) => {
                  const Icon = TAB_ICONS[id];
                  const active = tab === id;
                  return (
                    <button key={id} onClick={() => setTab(id)} className="flex-1 relative" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                      <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200" style={{ padding: "7px 2px 6px" }}>
                        {active && (
                          <motion.div
                            layoutId="cw-nav-bg"
                            className="absolute rounded-xl"
                            style={{
                              inset: 2,
                              background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(245,250,245,0.95))",
                              border: `1px solid ${C_ACCENT}30`,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon
                          size={20}
                          strokeWidth={active ? 2.2 : 1.6}
                          className="relative z-10"
                          style={{ color: active ? C_ACCENT : C_MED }}
                        />
                        <span
                          className="relative z-10"
                          style={{
                            fontFamily: F_DANCING,
                            fontSize: 11,
                            fontWeight: active ? 700 : 400,
                            color: active ? C_DARK : C_MED,
                            letterSpacing: "0.02em",
                            lineHeight: 1.1,
                            textAlign: "center",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create button — extends from right side of navbar */}
            <Link
              href="/christian-wedding"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                width: 54,
                alignSelf: "stretch",
                borderRadius: "0 16px 16px 0",
                background: `linear-gradient(145deg, ${C_ACCENT}, ${C_MED})`,
                cursor: "pointer",
                textDecoration: "none",
                animation: "cw-create-blink 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  lineHeight: 1,
                  color: "#fff",
                  animation: "cw-star-spin 2.5s ease-in-out infinite",
                  display: "inline-block",
                }}
              >
                ✦
              </span>
              <span
                style={{
                  fontFamily: F_DANCING,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                Create ♡
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
