"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL, IS_NGROK } from "@/lib/config";
import HomeSection from "@/app/(templates)/darling/components/HomeSection";
import WishSection from "@/app/(templates)/darling/components/WishSection";
import BottomNav from "@/app/(templates)/darling/components/BottomNav";
import DesktopSidebar from "@/app/(templates)/darling/components/DesktopSidebar";
import DarlingBg from "@/app/(templates)/darling/components/DarlingBg";
import DarlingWelcomeOverlay from "@/app/(templates)/darling/components/WelcomeOverlay";
import DarlingBackgroundMusic from "@/app/(templates)/darling/components/BackgroundMusic";
import {
  type ContentData,
  type TabId,
  type PhotoItem,
  type QuizQuestion,
  type TruthDareItem,
  DEMO_CONTENT,
  EMPTY_HOME_COVER,
  clampHomeCoverCrop,
} from "@/app/(templates)/darling/components/types";
import type { ServerGameResponse } from "@/app/(templates)/darling/components/GamesSection";

const GallerySection = lazy(() => import("@/app/(templates)/darling/components/GallerySection"));
const MusicSection   = lazy(() => import("@/app/(templates)/darling/components/MusicSection"));
const GamesSection   = lazy(() => import("@/app/(templates)/darling/components/GamesSection"));
const NotesSection   = lazy(() => import("@/app/(templates)/darling/components/NotesSection"));

const CURSIVE = "system-ui, sans-serif";
const ROSE    = "#ff3d6b";
const GRAD    = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";

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
    homePhotos:         (raw.homePhotos         as string[]         | undefined) ?? [],
    galleryPhotos:      ((raw.galleryPhotos     as unknown[]        | undefined) ?? []).map(normalizePhoto),
    quizQuestions:      (raw.quizQuestions      as QuizQuestion[]   | undefined) ?? [],
    truthDareQuestions: (raw.truthDareQuestions as TruthDareItem[]  | undefined) ?? [],
    sharePhoto:         String(raw.sharePhoto ?? ""),
  };
}

type QuizAttemptRecord = { score: number; total: number; playedAt: string };

function SectionLoader() {
  return (
    <DarlingBg>
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: CURSIVE, fontSize: 20, color: ROSE, opacity: 0.6 }}>loading...</p>
      </div>
    </DarlingBg>
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
      const res = await fetch(`${API_URL}/darling-pages/share/${shareId}/verify`, {
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
      background: "#0d0b18",
      padding: "24px 20px",
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          maxWidth: 340, width: "100%", borderRadius: 24,
          background: "rgba(10, 5, 20, 0.97)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,61,107,0.20)",
          padding: "32px 28px", textAlign: "center",
        }}
      >
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <Lock size={32} style={{ color: ROSE, margin: "0 auto 16px", display: "block" }} />
        </motion.div>
        <h2 style={{ fontFamily: CURSIVE, fontSize: 22, fontWeight: 700, color: ROSE, marginBottom: 6 }}>
          This page is private ♡
        </h2>
        <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(255,61,107,0.60)", marginBottom: 24, lineHeight: 1.6 }}>
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
              border: `1.5px solid ${error ? "rgba(180,60,50,0.45)" : "rgba(255,61,107,0.28)"}`,
              background: "rgba(13, 11, 24, 0.85)",
              fontFamily: CURSIVE, fontSize: 15, color: "#fff", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button onClick={() => setShow((v) => !v)} style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            border: "none", background: "transparent", cursor: "pointer", color: ROSE, opacity: 0.5,
            display: "flex", alignItems: "center",
          }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(220,80,70,0.85)", marginBottom: 10 }}>{error}</p>
        )}
        <button onClick={handleVerify} disabled={!pw.trim() || loading} style={{
          width: "100%", padding: "13px 0", borderRadius: 50, border: "none",
          background: pw.trim()
            ? "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)"
            : "rgba(255,61,107,0.20)",
          fontFamily: CURSIVE, fontSize: 16, fontWeight: 700, color: "#fff",
          cursor: pw.trim() ? "pointer" : "not-allowed",
          boxShadow: pw.trim() ? "0 6px 20px rgba(255,61,107,0.35)" : "none",
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

export default function DarlingViewer({ rawData, hasPassword, shareId }: Props) {
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
      background: "#0d0b18",
    }}>
      <style>{`
        body, html { margin: 0; padding: 0; background: #0d0b18; }
        * { box-sizing: border-box; }
        @media (max-width: 1023px) { body { overflow: hidden; } }
      `}</style>

      {/* Welcome overlay — shown until user taps enter */}
      {!welcomed && (
        <DarlingWelcomeOverlay
          senderName={content.senderName}
          recipientName={content.recipientName}
          sharePhoto={content.sharePhoto || undefined}
          onEnter={handleWelcomeEnter}
        />
      )}

      {/* Ambient background music */}
      <DarlingBackgroundMusic shouldPlay={playMusic} paused={bgPaused} />

      {/* Desktop sidebar */}
      <DesktopSidebar
        tab={tab}
        onTabChange={handleTabChange}
        coupleNames={{ person1: content.senderName, person2: content.recipientName }}
        onBack={() => router.push("/templates")}
        onEdit={() => router.push("/darling")}
        showPublish={false}
        showShare={false}
      />

      {/* Main content */}
      <main className="lg:ml-56" style={{ height: "100dvh", overflow: "hidden" }}>
        {tab === "home" && (
          <HomeSection data={content} isPersonalized={true} onEditClick={() => router.push("/darling")} onTabChange={handleTabChange} />
        )}
        {tab === "wish" && (
          <WishSection data={content} isPersonalized={true} />
        )}
        {tab === "gallery" && (
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={content} />
            </Suspense>
          </DarlingBg>
        )}
        {tab === "notes" && (
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <NotesSection shareId={shareId} />
            </Suspense>
          </DarlingBg>
        )}

        {/*
          Music & Games sections stay MOUNTED once first rendered (display:none preserves
          React state so playlist position and game history survive tab switches).
        */}
        <div style={{ display: tab === "music" ? "block" : "none" }}>
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <MusicSection
                data={content}
                onPlayStateChange={setPlaylistActive}
              />
            </Suspense>
          </DarlingBg>
        </div>

        <div style={{ display: tab === "games" ? "block" : "none" }}>
          <DarlingBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection
                data={content}
                shareId={shareId}
                quizAttempts={quizAttempts}
                initialGameResponses={gameResponses}
              />
            </Suspense>
          </DarlingBg>
        </div>
      </main>

      <BottomNav
        mode="viewer"
        tab={tab}
        onTabChange={handleTabChange}
        onEdit={() => router.push("/darling")}
        showPublish={false}
        showShare={false}
        shareLabel=""
        onPublish={() => {}}
        onShare={() => {}}
        onBack={() => router.push("/templates")}
        onCreateYours={() => router.push("/darling")}
      />
    </div>
  );
}
