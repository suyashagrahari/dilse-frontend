"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL, IS_NGROK } from "@/lib/config";
import HomeSection from "@/app/(templates)/love-gf/components/HomeSection";
import WishSection from "@/app/(templates)/love-gf/components/WishSection";
import BottomNav from "@/app/(templates)/love-gf/components/BottomNav";
import DesktopSidebar from "@/app/(templates)/love-gf/components/DesktopSidebar";
import ScrapbookBg from "@/app/(templates)/love-gf/components/ScrapbookBg";
import LoveWelcomeOverlay from "@/app/(templates)/love-gf/components/LoveWelcomeOverlay";
import LoveBackgroundMusic from "@/app/(templates)/love-gf/components/LoveBackgroundMusic";
import {
  type ContentData,
  type TabId,
  type PhotoItem,
  type QuizQuestion,
  type TruthDareItem,
  DEMO_CONTENT,
  EMPTY_HOME_COVER,
  clampHomeCoverCrop,
  normalizeHomePhoto,
} from "@/app/(templates)/love-gf/components/types";
import type { ServerGameResponse } from "@/app/(templates)/love-gf/components/GamesSection";

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
  if (typeof p === "string") return { url: p, letter: "", cropX: 50, cropY: 50, scale: 100 };
  const obj = p as Record<string, unknown>;
  return {
    url:    String(obj.url    ?? ""),
    letter: String(obj.letter ?? ""),
    cropX:  Number(obj.cropX  ?? 50),
    cropY:  Number(obj.cropY  ?? 50),
    scale:  Number.isFinite(Number(obj.scale)) ? Math.min(200, Math.max(100, Number(obj.scale))) : 100,
  };
}

function normalizeHomeCoverRaw(raw: unknown) {
  if (!raw || typeof raw !== "object") return { ...EMPTY_HOME_COVER };
  const o = raw as Record<string, unknown>;
  return clampHomeCoverCrop({
    url: String(o.url ?? ""),
    cropX: Number(o.cropX ?? 50),
    cropY: Number(o.cropY ?? 50),
    scale: Number(o.scale ?? 100),
  });
}

function rawToContentData(raw: Record<string, unknown>): ContentData {
  return {
    ...DEMO_CONTENT,
    recipientName:      String(raw.recipientName   ?? ""),
    senderName:         String(raw.senderName      ?? ""),
    personalMessage:    String(raw.personalMessage ?? DEMO_CONTENT.personalMessage),
    wishMessage:        String(raw.wishMessage     ?? DEMO_CONTENT.wishMessage),
    loveDate:           String(raw.loveDate        ?? ""),
    homeCoverPhoto:     normalizeHomeCoverRaw(raw.homeCoverPhoto),
    homePhotos:         ((raw.homePhotos as unknown[]) ?? []).map(normalizeHomePhoto),
    galleryPhotos:      ((raw.galleryPhotos     as unknown[]        | undefined) ?? []).map(normalizePhoto),
    quizQuestions:      (raw.quizQuestions      as QuizQuestion[]   | undefined) ?? [],
    truthDareQuestions: (raw.truthDareQuestions as TruthDareItem[]  | undefined) ?? [],
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

// ── Password Gate ─────────────────────────────────────────────────────────────

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
              fontFamily: CURSIVE, fontSize: 15, color: WARM, outline: "none",
              boxSizing: "border-box",
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
        <button onClick={handleVerify} disabled={!pw.trim() || loading} style={{
          width: "100%", padding: "13px 0", borderRadius: 50, border: "none",
          background: pw.trim()
            ? "linear-gradient(135deg, rgb(158,126,97), rgb(120,85,55))"
            : "rgba(158,126,97,0.3)",
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


// ── Main Viewer ───────────────────────────────────────────────────────────────

interface Props {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}

export default function LoveGfViewer({ rawData, hasPassword, shareId }: Props) {
  const router  = useRouter();
  const [unlocked,       setUnlocked]       = useState(!hasPassword);
  const [tab,            setTab]            = useState<TabId>("home");
  const [welcomed,       setWelcomed]       = useState(false);
  const [playMusic,      setPlayMusic]      = useState(false);
  const [playlistActive, setPlaylistActive] = useState(false);

  const content      = rawToContentData(rawData);
  const quizAttempts: QuizAttemptRecord[] =
    (rawData.quizAttempts as QuizAttemptRecord[] | undefined) ?? [];
  const gameResponses: ServerGameResponse[] =
    (rawData.gameResponses as ServerGameResponse[] | undefined) ?? [];

  const handleTabChange    = useCallback((id: TabId) => setTab(id), []);
  const handleWelcomeEnter = useCallback((withMusic: boolean) => {
    setPlayMusic(withMusic);
    setWelcomed(true);
  }, []);

  // Background music pauses while user is actively playing the playlist
  const bgPaused = tab === "music" && playlistActive;

  if (!unlocked) {
    return <PasswordGate shareId={shareId} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div style={{
      minHeight: "100dvh", width: "100%", overflow: "hidden", position: "relative",
      background: `radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.28) 100%), url(/love/image18.webp) center / cover no-repeat`,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');
        body, html { margin: 0; padding: 0; background: #faf6f0; }
        * { box-sizing: border-box; }
        @media (max-width: 1023px) { body { overflow: hidden; } }
      `}</style>

      {/* Welcome overlay — shown until user taps enter */}
      {!welcomed && (
        <LoveWelcomeOverlay
          senderName={content.senderName}
          recipientName={content.recipientName}
          onEnter={handleWelcomeEnter}
        />
      )}

      {/* Ambient background music */}
      <LoveBackgroundMusic shouldPlay={playMusic} paused={bgPaused} />

      {/* Desktop sidebar */}
      <DesktopSidebar
        tab={tab}
        onTabChange={handleTabChange}
        coupleNames={{ person1: content.senderName, person2: content.recipientName }}
        onBack={() => router.push("/templates")}
        onEdit={() => router.push("/love-gf")}
        showPublish={false}
        showShare={false}
      />

      {/* Main content */}
      <main className="lg:ml-56" style={{ height: "100dvh", overflow: "hidden" }}>
        {tab === "home" && (
          <HomeSection data={content} isPersonalized={true} onEditClick={() => router.push("/love-gf")} />
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
        {tab === "notes" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <NotesSection shareId={shareId} />
            </Suspense>
          </ScrapbookBg>
        )}

        {/*
          Music & Games sections stay MOUNTED once first rendered (display:none preserves
          React state so playlist position and game history survive tab switches).
        */}
        <div style={{ display: tab === "music" ? "block" : "none" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <MusicSection
                data={content}
                onPlayStateChange={setPlaylistActive}
              />
            </Suspense>
          </ScrapbookBg>
        </div>

        <div style={{ display: tab === "games" ? "block" : "none" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection
                data={content}
                shareId={shareId}
                quizAttempts={quizAttempts}
                initialGameResponses={gameResponses}
              />
            </Suspense>
          </ScrapbookBg>
        </div>
      </main>

      <BottomNav
        mode="viewer"
        tab={tab}
        onTabChange={handleTabChange}
        onEdit={() => router.push("/love-gf")}
        showPublish={false}
        showShare={false}
        shareLabel=""
        onPublish={() => {}}
        onShare={() => {}}
        onBack={() => router.push("/templates")}
        onCreateYours={() => router.push("/love-gf")}
      />
    </div>
  );
}
