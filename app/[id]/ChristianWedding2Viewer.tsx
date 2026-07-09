"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Eye, EyeOff, ShieldAlert, Loader2,
  Sparkles, Music2, VolumeX,
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { Cinzel, Great_Vibes, DM_Sans, Lora, Playfair_Display } from "next/font/google";
import { type ShaadiData, CHRISTIAN_DEMO_DATA } from "@/app/(templates)/christian-wedding/components/types";
import { ChristianPageChrome } from "@/app/(templates)/christian-wedding/components/ChristianPageChrome";
import HomeHero from "@/app/(templates)/christian-wedding-2/components/HomeHero";
import { API_URL, IS_NGROK } from "@/lib/config";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cinzel" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: ["400"], variable: "--font-great-vibes" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lora" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair" });

const FONT_VARS = `${cinzel.variable} ${greatVibes.variable} ${dmSans.variable} ${lora.variable} ${playfair.variable}`;

const ChristianBackgroundMusic = lazy(() => import("@/app/(templates)/christian-wedding/components/ChristianBackgroundMusic"));
const CoupleSection = lazy(() => import("@/app/(templates)/christian-wedding-2/components/CoupleSection"));
const EventsSection = lazy(() => import("@/app/(templates)/christian-wedding-2/components/EventsSection"));
const GallerySection = lazy(() => import("@/app/(templates)/christian-wedding/components/GallerySection"));
const WishesSection = lazy(() => import("@/app/(templates)/christian-wedding/components/WishesSection"));

const C_ACCENT = "#546B57";
const C_MED = "#7A9B7E";
const C_DARK = "#2D3E32";

const F_DANCING = "var(--font-great-vibes), cursive";
const F_CINZEL = "var(--font-cinzel), serif";

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function SectionFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: C_ACCENT, borderTopColor: "transparent" }}
      />
    </div>
  );
}

function SectionAnchor({
  id,
  children,
  first = false,
}: {
  id: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <motion.section
      id={`cw2-${id}`}
      initial={first ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={SECTION_VARIANTS}
      className="relative w-full"
    >
      {children}
    </motion.section>
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

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col items-center text-center"
        style={{ maxWidth: 340 }}
      >
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

        <span style={{ fontFamily: F_DANCING, fontSize: "4.5rem", color: "#3D5441", lineHeight: 1.0, display: "block" }}>
          {brideName || "Jane"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 4px" }}>
          <div style={{ height: 1, width: 44, background: "linear-gradient(90deg, transparent, #A8C4AC)" }} aria-hidden />
          <span style={{ fontFamily: F_DANCING, fontSize: "1.8rem", color: "#7A9B7E", lineHeight: 1 }}>&amp;</span>
          <div style={{ height: 1, width: 44, background: "linear-gradient(90deg, #A8C4AC, transparent)" }} aria-hidden />
        </div>
        <span style={{ fontFamily: F_DANCING, fontSize: "4.5rem", color: "#3D5441", lineHeight: 1.0, display: "block", marginBottom: 24 }}>
          {groomName || "Andrew"}
        </span>

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
      </motion.div>
    </motion.div>
  );
}

interface ChristianWedding2ViewerProps {
  rawData: Record<string, unknown>;
  shareId: string;
  hasPassword: boolean;
}

export default function ChristianWedding2Viewer({ rawData, shareId, hasPassword }: ChristianWedding2ViewerProps) {
  const [data] = useState<ShaadiData>(mapData(rawData));

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
        <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "#fcfcfa" }}>
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
      <div className="relative min-h-[100dvh] w-full" style={{ background: "#fcfcfa" }}>
        <Suspense fallback={null}>
          <ChristianBackgroundMusic shouldPlay={musicEnabled} />
        </Suspense>

        {/* SubhSandesh branding — top right */}
        <Link
          href="/templates"
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
            <NextImage src="/logo.webp" alt="SubhSandesh" width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
          <span
            style={{
              fontFamily: F_CINZEL,
              fontSize: 7,
              fontWeight: 700,
              color: C_DARK,
              letterSpacing: "0.08em",
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            SubhSandesh
          </span>
        </Link>

        {/* Fixed watercolor chrome — pinned to viewport */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <ChristianPageChrome />
        </div>

        {/* Scrollable content stack */}
        <main className="relative z-10 flex w-full flex-col">
          <SectionAnchor id="home" first>
            <HomeHero data={data} />
          </SectionAnchor>

          <SectionAnchor id="couple">
            <Suspense fallback={<SectionFallback />}>
              <CoupleSection data={data} />
            </Suspense>
          </SectionAnchor>

          <SectionAnchor id="events">
            <Suspense fallback={<SectionFallback />}>
              <EventsSection data={data} />
            </Suspense>
          </SectionAnchor>

          <SectionAnchor id="gallery">
            <Suspense fallback={<SectionFallback />}>
              <GallerySection data={data} />
            </Suspense>
          </SectionAnchor>

          <SectionAnchor id="blessings">
            <Suspense fallback={<SectionFallback />}>
              <WishesSection data={data} shareId={shareId} />
            </Suspense>
          </SectionAnchor>

          <div aria-hidden className="h-24 lg:h-28" />
        </main>

        {/* Floating "Create Your Own" pill — bottom center */}
        <Link
          href="/christian-wedding-2"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold text-white shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`,
            fontFamily: F_CINZEL,
            letterSpacing: "0.08em",
            boxShadow: `0 10px 28px ${C_ACCENT}40`,
          }}
        >
          <Sparkles size={13} />
          Create Your Own
        </Link>
      </div>
    </div>
  );
}
