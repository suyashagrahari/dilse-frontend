"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import HomeSection from "@/app/(templates)/love-gf/components/HomeSection";
import WishSection from "@/app/(templates)/love-gf/components/WishSection";
import BottomNav from "@/app/(templates)/love-gf/components/BottomNav";
import ScrapbookBg from "@/app/(templates)/love-gf/components/ScrapbookBg";
import {
  type ContentData, type TabId, type PhotoItem, type QuizQuestion,
  type TruthDareItem, DEMO_CONTENT,
} from "@/app/(templates)/love-gf/components/types";

const GallerySection = lazy(() => import("@/app/(templates)/love-gf/components/GallerySection"));
const MusicSection   = lazy(() => import("@/app/(templates)/love-gf/components/MusicSection"));
const GamesSection   = lazy(() => import("@/app/(templates)/love-gf/components/GamesSection"));
const NotesSection   = lazy(() => import("@/app/(templates)/love-gf/components/NotesSection"));

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const WARM    = "rgb(108, 74, 46)";

function apiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return IS_NGROK ? { "ngrok-skip-browser-warning": "true", ...extra } : extra;
}

function normalizePhoto(p: unknown): PhotoItem {
  if (typeof p === "string") return { url: p, letter: "", cropX: 50, cropY: 50 };
  const obj = p as Record<string, unknown>;
  return {
    url:    String(obj.url    ?? ""),
    letter: String(obj.letter ?? ""),
    cropX:  Number(obj.cropX  ?? 50),
    cropY:  Number(obj.cropY  ?? 50),
  };
}

function rawToContentData(raw: Record<string, unknown>): ContentData {
  return {
    ...DEMO_CONTENT,
    recipientName:      String(raw.recipientName   ?? ""),
    senderName:         String(raw.senderName      ?? ""),
    personalMessage:    String(raw.personalMessage ?? DEMO_CONTENT.personalMessage),
    wishMessage:        String(raw.wishMessage     ?? DEMO_CONTENT.wishMessage),
    loveDate:           String(raw.loveDate        ?? ""),
    homePhotos:         (raw.homePhotos as string[]          | undefined) ?? [],
    galleryPhotos:      ((raw.galleryPhotos as unknown[]     | undefined) ?? []).map(normalizePhoto),
    quizQuestions:      (raw.quizQuestions    as QuizQuestion[]    | undefined) ?? [],
    truthDareQuestions: (raw.truthDareQuestions as TruthDareItem[] | undefined) ?? [],
  };
}

type QuizAttemptRecord = { score: number; total: number; playedAt: string };

function SectionLoader() {
  return (
    <ScrapbookBg>
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: CURSIVE, fontSize: 20, color: WARM, opacity: 0.6 }}>loading...</p>
      </div>
    </ScrapbookBg>
  );
}

// ── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ shareId, onUnlock }: { shareId: string; onUnlock: () => void }) {
  const [pw, setPw]           = useState("");
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/love-gf-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        onUnlock();
      } else {
        setError("Wrong password. Try again 💔");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.28) 100%), url(/love/image18.webp) center / cover no-repeat`,
      padding: "24px 20px",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');`}</style>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          maxWidth: 340, width: "100%", borderRadius: 24,
          background: "rgba(250,246,240,0.97)",
          boxShadow: "0 30px 80px rgba(40,22,8,0.35)",
          padding: "32px 28px", textAlign: "center",
        }}
      >
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Lock size={32} color={WARM} style={{ margin: "0 auto 16px" }} />
        </motion.div>
        <h2 style={{ fontFamily: CURSIVE, fontSize: 22, fontWeight: 700, color: WARM, marginBottom: 6 }}>
          This page is private ♡
        </h2>
        <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(108,74,46,0.65)", marginBottom: 24, lineHeight: 1.6 }}>
          Enter the password to open your surprise
        </p>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="Enter password..."
            autoFocus
            style={{
              width: "100%", padding: "12px 48px 12px 16px", borderRadius: 12,
              border: `1.5px solid ${error ? "rgba(180,60,50,0.45)" : "rgba(158,126,97,0.35)"}`,
              background: "rgba(255,252,246,0.9)",
              fontFamily: CURSIVE, fontSize: 15, color: WARM, outline: "none", boxSizing: "border-box",
            }}
          />
          <button onClick={() => setShow((v) => !v)} style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            border: "none", background: "transparent", cursor: "pointer", color: WARM, opacity: 0.5,
            display: "flex", alignItems: "center",
          }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(180,60,50,0.8)", marginBottom: 10 }}>{error}</p>
        )}
        <button onClick={handleVerify} disabled={!pw.trim() || loading}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 50, border: "none",
            background: pw.trim() ? "linear-gradient(135deg, rgb(158,126,97), rgb(120,85,55))" : "rgba(158,126,97,0.3)",
            fontFamily: CURSIVE, fontSize: 16, fontWeight: 700, color: "#fff",
            cursor: pw.trim() ? "pointer" : "not-allowed",
            boxShadow: pw.trim() ? "0 6px 20px rgba(108,74,46,0.35)" : "none",
          }}>
          {loading ? "Opening..." : "Open ♡"}
        </button>
      </motion.div>
    </div>
  );
}

// ── Share Sheet ──────────────────────────────────────────────────────────────

function ShareSheet({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`A love page just for you ♡ ${url}`)}`, "_blank");
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: "A love page for you ♡", url }).catch(() => {});
    }
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(40,22,8,0.50)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: "100%", maxWidth: 480, borderRadius: "20px 20px 0 0",
          background: "rgba(250,246,240,0.98)",
          padding: "28px 24px 40px",
          boxShadow: "0 -20px 60px rgba(80,50,20,0.25)",
        }}
        onClick={stopProp}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color: WARM, margin: 0 }}>
            Share this love page ♡
          </h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", opacity: 0.6, display: "flex", alignItems: "center" }}>
            <X size={20} color={WARM} />
          </button>
        </div>

        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 20,
          background: "rgba(158,126,97,0.08)", border: "1px solid rgba(158,126,97,0.22)",
          fontFamily: CURSIVE, fontSize: 13, color: "rgb(108,74,46)",
          wordBreak: "break-all", lineHeight: 1.6,
        }}>
          {url}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={copy} style={{
            padding: "14px 20px", borderRadius: 14, border: "none",
            background: copied
              ? "rgba(80,140,80,0.12)"
              : "linear-gradient(135deg, rgb(158,126,97), rgb(120,85,55))",
            fontFamily: CURSIVE, fontSize: 15, fontWeight: 700,
            color: copied ? "rgb(60,120,60)" : "#fff",
            cursor: "pointer", textAlign: "left",
            boxShadow: copied ? "none" : "0 4px 16px rgba(108,74,46,0.25)",
            transition: "all 0.2s",
          }}>
            {copied ? "✓  Link Copied!" : "🔗  Copy Link"}
          </button>

          <button onClick={whatsapp} style={{
            padding: "14px 20px", borderRadius: 14,
            border: "1.5px solid rgba(37,211,102,0.40)",
            background: "rgba(37,211,102,0.07)",
            fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: "rgb(30,150,70)",
            cursor: "pointer", textAlign: "left",
          }}>
            💬  Share on WhatsApp
          </button>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button onClick={nativeShare} style={{
              padding: "14px 20px", borderRadius: 14,
              border: "1.5px solid rgba(158,126,97,0.30)",
              background: "rgba(158,126,97,0.06)",
              fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: WARM,
              cursor: "pointer", textAlign: "left",
            }}>
              ↗  More options...
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Viewer ──────────────────────────────────────────────────────────────

interface Props {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}

export default function LoveGfViewer({ rawData, hasPassword, shareId }: Props) {
  const [unlocked, setUnlocked] = useState(!hasPassword);
  const [tab, setTab]           = useState<TabId>("home");
  const [showShareSheet, setShowShareSheet] = useState(false);

  const content = rawToContentData(rawData);
  const quizAttempts: QuizAttemptRecord[] =
    (rawData.quizAttempts as QuizAttemptRecord[] | undefined) ?? [];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const handleTabChange = useCallback((id: TabId) => setTab(id), []);

  if (!unlocked) {
    return <PasswordGate shareId={shareId} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div
      style={{
        minHeight: "100dvh", width: "100%", overflow: "hidden", position: "relative",
        background: `radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.28) 100%), url(/love/image18.webp) center / cover no-repeat`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');
        body, html { margin: 0; padding: 0; background: #faf6f0; }
        * { box-sizing: border-box; }
        @media (max-width: 1023px) { body { overflow: hidden; } }
      `}</style>

      {/* Top bar */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed", top: 12, left: 0, right: 0, zIndex: 101,
          paddingTop: "env(safe-area-inset-top, 16px)",
          paddingLeft: 16, paddingRight: 16, pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          {content.senderName ? (
            <span style={{
              padding: "7px 12px", borderRadius: 12,
              border: "1px solid rgba(158,126,97,0.20)",
              background: "rgba(250,246,240,0.88)", backdropFilter: "blur(10px)",
              fontFamily: CURSIVE, fontSize: 13, color: WARM, opacity: 0.85,
            }}>
              from {content.senderName} ♡
            </span>
          ) : <div />}

          <button
            onClick={() => setShowShareSheet(true)}
            style={{
              padding: "8px 16px", borderRadius: 999,
              border: "none",
              background: "rgba(250,246,240,0.88)", backdropFilter: "blur(10px)",
              fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: WARM, cursor: "pointer",
            }}
          >
            Share ♡
          </button>
        </div>
      </div>

      {/* Main content */}
      <main style={{ height: "100dvh", overflow: "hidden" }}>
        {tab === "home" && (
          <HomeSection data={content} isPersonalized={true} onEditClick={() => {}} />
        )}
        {tab === "wish" && (
          <WishSection data={content} isPersonalized={true} />
        )}
        {tab === "gallery" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={content} />
            </Suspense>
          </ScrapbookBg>
        )}
        {tab === "music" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <MusicSection data={content} onPlayStateChange={() => {}} />
            </Suspense>
          </ScrapbookBg>
        )}
        {tab === "games" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection data={content} shareId={shareId} quizAttempts={quizAttempts} />
            </Suspense>
          </ScrapbookBg>
        )}
        {tab === "notes" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <NotesSection />
            </Suspense>
          </ScrapbookBg>
        )}
      </main>

      <BottomNav
        mode="viewer"
        tab={tab}
        onTabChange={handleTabChange}
        onEdit={() => {}}
        showPublish={false}
        showShare={false}
        shareLabel="Share"
        onPublish={() => {}}
        onShare={() => setShowShareSheet(true)}
        onBack={() => {}}
      />

      <AnimatePresence>
        {showShareSheet && (
          <ShareSheet url={shareUrl} onClose={() => setShowShareSheet(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
