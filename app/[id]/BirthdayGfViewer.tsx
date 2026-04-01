"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { API_URL, IS_NGROK } from "@/lib/config";
import HomeSection from "@/app/(templates)/birthday-gf/components/HomeSection";
import SongsSection from "@/app/(templates)/birthday-gf/components/SongsSection";
import BottomNav from "@/app/(templates)/birthday-gf/components/BottomNav";
import DesktopSidebar from "@/app/(templates)/birthday-gf/components/DesktopSidebar";
import ScrapbookBg from "@/app/(templates)/birthday-gf/components/ScrapbookBg";
import BirthdayBgMusic from "@/app/(templates)/birthday-gf/components/BirthdayBgMusic";
import {
  type BirthdayData,
  type TabId,
  type PhotoItem,
  type HomeCoverPhoto,
  DEMO_DATA,
  EMPTY_HOME_COVER,
  clampHomeCoverCrop,
} from "@/app/(templates)/birthday-gf/components/types";
import type {
  QuizAttemptRecord,
  ServerGameResponse,
} from "@/app/(templates)/birthday-gf/components/GamesSection";

const GallerySection = lazy(
  () => import("@/app/(templates)/birthday-gf/components/GallerySection")
);
const GamesSection = lazy(
  () => import("@/app/(templates)/birthday-gf/components/GamesSection")
);
const SurpriseSection = lazy(
  () => import("@/app/(templates)/birthday-gf/components/SurpriseSection")
);

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const WARM = "rgb(108, 74, 46)";
const BG = "#F5EDE0";

function apiHeaders(
  extra: Record<string, string> = {}
): Record<string, string> {
  return IS_NGROK
    ? { "ngrok-skip-browser-warning": "true", ...extra }
    : extra;
}

function normalizePhoto(p: unknown): PhotoItem {
  if (typeof p === "string")
    return { url: p, caption: "", cropX: 50, cropY: 50 };
  const obj = p as Record<string, unknown>;
  return {
    url: String(obj.url ?? ""),
    caption: String(obj.caption ?? ""),
    cropX: Number(obj.cropX ?? 50),
    cropY: Number(obj.cropY ?? 50),
  };
}

function normalizeHomeCover(raw: unknown): HomeCoverPhoto {
  if (!raw || typeof raw !== "object") return { ...EMPTY_HOME_COVER };
  const o = raw as Record<string, unknown>;
  return clampHomeCoverCrop({
    url: String(o.url ?? ""),
    cropX: Number(o.cropX ?? 50),
    cropY: Number(o.cropY ?? 50),
    scale: Number(o.scale ?? 100),
  });
}

function rawToBirthdayData(raw: Record<string, unknown>): BirthdayData {
  return {
    ...DEMO_DATA,
    recipientName: String(raw.recipientName ?? ""),
    senderName: String(raw.senderName ?? ""),
    birthdayDate: String(raw.birthdayDate ?? ""),
    birthdayWish: String(raw.birthdayWish ?? DEMO_DATA.birthdayWish),
    personalMessage: String(
      raw.personalMessage ?? DEMO_DATA.personalMessage
    ),
    homeCoverPhoto: normalizeHomeCover(raw.homeCoverPhoto),
    homePhoto1: String(raw.homePhoto1 ?? ""),
    homePhoto2: String(raw.homePhoto2 ?? ""),
    galleryPhotos: (
      (raw.galleryPhotos as unknown[] | undefined) ?? []
    ).map(normalizePhoto),
    musicTracks:
      (raw.musicTracks as BirthdayData["musicTracks"] | undefined) ?? [],
    quizQuestions:
      (raw.quizQuestions as BirthdayData["quizQuestions"] | undefined) ?? [],
    truthDareQuestions:
      (raw.truthDareQuestions as BirthdayData["truthDareQuestions"] | undefined) ??
      [],
    surprisePhoto: String(raw.surprisePhoto ?? ""),
    surpriseAudioUrl: String(raw.surpriseAudioUrl ?? ""),
  };
}

function SectionLoader() {
  return (
    <ScrapbookBg>
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: CURSIVE,
            fontSize: 20,
            color: WARM,
            opacity: 0.6,
          }}
        >
          loading...
        </p>
      </div>
    </ScrapbookBg>
  );
}

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({
  shareId,
  onUnlock,
  onVerifyPassword,
}: {
  shareId: string;
  onUnlock: () => void;
  onVerifyPassword?: (pw: string) => Promise<boolean>;
}) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      let verified = false;
      if (onVerifyPassword) {
        verified = await onVerifyPassword(pw);
      } else {
        const res = await fetch(
          `${API_URL}/birthday-gf-pages/share/${shareId}/verify`,
          {
            method: "POST",
            headers: apiHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ password: pw }),
          }
        );
        const result = await res.json();
        verified = result.success && result.verified;
      }
      if (verified) {
        onUnlock();
      } else {
        setError("Wrong password. Try again 🎂");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
        padding: "24px 20px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');`}</style>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          maxWidth: 340,
          width: "100%",
          borderRadius: 24,
          background: "rgba(255,252,246,0.97)",
          boxShadow: "0 30px 80px rgba(40,22,8,0.25)",
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Lock size={32} color={WARM} style={{ margin: "0 auto 16px" }} />
        </motion.div>
        <h2
          style={{
            fontFamily: CURSIVE,
            fontSize: 22,
            fontWeight: 700,
            color: WARM,
            marginBottom: 6,
          }}
        >
          This page is private 🎂
        </h2>
        <p
          style={{
            fontFamily: CURSIVE,
            fontSize: 14,
            color: "rgba(108,74,46,0.65)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Enter the password to open your birthday surprise
        </p>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="Enter password..."
            autoFocus
            style={{
              width: "100%",
              padding: "12px 48px 12px 16px",
              borderRadius: 12,
              border: `1.5px solid ${
                error ? "rgba(180,60,50,0.45)" : "rgba(158,126,97,0.35)"
              }`,
              background: "rgba(255,252,246,0.9)",
              fontFamily: CURSIVE,
              fontSize: 15,
              color: WARM,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => setShow((v) => !v)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: WARM,
              opacity: 0.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && (
          <p
            style={{
              fontFamily: CURSIVE,
              fontSize: 13,
              color: "rgba(180,60,50,0.8)",
              marginBottom: 10,
            }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleVerify}
          disabled={!pw.trim() || loading}
          style={{
            width: "100%",
            padding: "13px 0",
            borderRadius: 50,
            border: "none",
            background: pw.trim()
              ? "linear-gradient(135deg, #AD684A, #5D3F31)"
              : "rgba(158,126,97,0.3)",
            fontFamily: CURSIVE,
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            cursor: pw.trim() ? "pointer" : "not-allowed",
            boxShadow: pw.trim() ? "0 6px 20px rgba(108,74,46,0.35)" : "none",
          }}
        >
          {loading ? "Opening..." : "Open 🎂"}
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
  onVerifyPassword?: (pw: string) => Promise<boolean>;
  isAuthenticated?: boolean;
  onCreateYours?: () => void;
  editorRoute?: string;
  onEdit?: () => void;
}

export default function BirthdayGfViewer({
  rawData,
  hasPassword,
  shareId,
  onVerifyPassword,
  onCreateYours,
  editorRoute = "/birthday-gf",
}: Props) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(!hasPassword);
  const [tab, setTab] = useState<TabId>("home");

  const data = rawToBirthdayData(rawData);
  const quizAttempts: QuizAttemptRecord[] =
    (rawData.quizAttempts as QuizAttemptRecord[] | undefined) ?? [];
  const gameResponses: ServerGameResponse[] =
    (rawData.gameResponses as ServerGameResponse[] | undefined) ?? [];

  const hasSurprise = !!(data.surprisePhoto || data.surpriseAudioUrl);
  const hiddenTabs: TabId[] = hasSurprise ? [] : ["surprise"];

  const [songPlaying, setSongPlaying] = useState(false);
  const handleSongPlayingChange = useCallback((v: boolean) => setSongPlaying(v), []);

  const handleTabChange = useCallback((id: TabId) => setTab(id), []);
  const handleCreateYours = useCallback(() => {
    if (onCreateYours) {
      onCreateYours();
    } else {
      router.push(editorRoute);
    }
  }, [onCreateYours, editorRoute, router]);

  if (!unlocked) {
    return (
      <PasswordGate
        shareId={shareId}
        onUnlock={() => setUnlocked(true)}
        onVerifyPassword={onVerifyPassword}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        position: "relative",
        background: BG,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');
        body, html { margin: 0; padding: 0; background: ${BG}; }
        * { box-sizing: border-box; }
        @media (max-width: 1023px) { body { overflow: hidden; } }
      `}</style>

      {/* Brand icon top-right */}
      <Link
        href="/templates"
        style={{
          position: "fixed", top: 14, right: 14, zIndex: 200,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 2, textDecoration: "none", cursor: "pointer",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, overflow: "hidden",
          background: "rgba(245,237,224,0.85)", backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(93,63,49,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(40,20,10,0.15)",
        }}>
          <NextImage src="/logo.png" alt="SubhSandesh" width={28} height={28} style={{ objectFit: "contain" }} />
        </div>
        <span style={{
          fontFamily: CURSIVE, fontSize: 7, fontWeight: 700,
          color: WARM, letterSpacing: "0.08em",
          opacity: 0.8, textAlign: "center", lineHeight: 1,
        }}>
          SubhSandesh
        </span>
      </Link>

      {/* Desktop sidebar */}
      <DesktopSidebar
        tab={tab}
        onTabChange={handleTabChange}
        recipientName={data.recipientName}
        senderName={data.senderName}
        onBack={() => router.push("/templates")}
        onEdit={() => router.push(editorRoute)}
        showPublish={false}
        showShare={false}
        shareLabel=""
        onPublish={() => {}}
        onShare={() => {}}
        hiddenTabs={hiddenTabs}
        showCreateYours
        onCreateYours={handleCreateYours}
      />

      {/* Main content */}
      <main className="lg:ml-56" style={{ height: "100dvh", overflow: "hidden" }}>
        {tab === "home" && (
          <HomeSection data={data} isPersonalized={true} onEditClick={() => router.push(editorRoute)} />
        )}

        {tab === "gallery" && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GallerySection data={data} />
            </Suspense>
          </ScrapbookBg>
        )}

        {/* Songs: keep mounted once visited to preserve playlist state */}
        <div style={{ display: tab === "songs" ? "block" : "none" }}>
          <ScrapbookBg>
            <SongsSection data={data} onPlayingChange={handleSongPlayingChange} />
          </ScrapbookBg>
        </div>

        {/* Games: keep mounted once visited to preserve game state */}
        <div style={{ display: tab === "games" ? "block" : "none" }}>
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <GamesSection
                data={data}
                shareId={shareId}
                quizAttempts={quizAttempts}
                initialGameResponses={gameResponses}
              />
            </Suspense>
          </ScrapbookBg>
        </div>

        {tab === "surprise" && hasSurprise && (
          <ScrapbookBg>
            <Suspense fallback={<SectionLoader />}>
              <SurpriseSection data={data} />
            </Suspense>
          </ScrapbookBg>
        )}
      </main>

      <BirthdayBgMusic paused={songPlaying} />

      <BottomNav
        mode="viewer"
        tab={tab}
        onTabChange={handleTabChange}
        onEdit={() => router.push(editorRoute)}
        showPublish={false}
        showShare={false}
        shareLabel=""
        onPublish={() => {}}
        onShare={() => {}}
        onCreateYours={handleCreateYours}
        hiddenTabs={hiddenTabs}
      />
    </div>
  );
}
