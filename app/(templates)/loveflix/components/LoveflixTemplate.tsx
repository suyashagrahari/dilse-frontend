"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BrowseScreen from "./BrowseScreen";
import CreditsScreen from "./CreditsScreen";
import DevErrorPanel from "./DevErrorPanel";
import EpisodePlayer from "./EpisodePlayer";
import FinaleScreen from "./FinaleScreen";
import IntroScreen from "./IntroScreen";
import MuteToggle from "./MuteToggle";
import ProfileGate from "./ProfileGate";
import { BG, FONT_BODY, TEXT, Z } from "./theme";
import { assertBrandSafe, type LoveflixTemplateProps, type PathEntry } from "./types";
import { useReducedMotion } from "./useReducedMotion";
import { useSceneGraph } from "./useSceneGraph";

/**
 * The state machine for the whole template.
 *
 * intro → profiles → browse → player → finale → credits → (autoplay) → browse
 *
 * Two things are deliberately owned HERE rather than by any screen:
 *
 *   1. THE VALIDATOR. `useSceneGraph` runs before the player is ever mounted,
 *      so a dead-ended branch surfaces as a named error in a developer panel
 *      instead of a blank screen, and a recipient silently gets the demo
 *      episode instead of a broken page. Nothing downstream has to defend
 *      against a missing scene — by the time `EpisodePlayer` mounts, the graph
 *      it is handed has been proven to terminate.
 *
 *   2. HISTORY. Entering the player pushes a history entry so the hardware/
 *      browser back button returns to browse rather than leaving the site
 *      mid-episode. State survives, because browse is remounted from data and
 *      the path list lives up here.
 */
export type Phase = "intro" | "profiles" | "browse" | "player" | "finale" | "credits";

export default function LoveflixTemplate({ data, mode }: LoveflixTemplateProps) {
  const reducedMotion = useReducedMotion();
  const graph = useSceneGraph(data.scenes, data.startSceneId);

  const [phase, setPhase] = useState<Phase>("intro");
  const [path, setPath] = useState<PathEntry[]>([]);
  /** Bumped on replay so the player remounts clean rather than reusing state. */
  const [runId, setRunId] = useState(0);

  // Brand safety runs at mount in development and its output is logged. The one
  // mistake in this template that would be genuinely expensive is shipping
  // somebody else's trade dress, so it is checked rather than assumed.
  const brandHits = useMemo(() => assertBrandSafe(data), [data]);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (brandHits.length) console.error("[loveflix] brand safety:", brandHits);
    else console.info("[loveflix] brand safety: clean");
    if (!graph.report.ok) console.error("[loveflix] scene graph:", graph.report.errors);
    else if (graph.report.warnings.length) console.warn("[loveflix] scene graph:", graph.report.warnings);
  }, [brandHits, graph.report]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const startEpisode = useCallback(() => {
    setPath([]);
    setRunId((n) => n + 1);
    setPhase("player");
  }, []);

  const finishEpisode = useCallback((taken: PathEntry[]) => {
    setPath(taken);
    setPhase("finale");
  }, []);

  const backToBrowse = useCallback(() => setPhase("browse"), []);

  // Browser back mid-episode returns to browse instead of leaving the page.
  // The marker entry is pushed on entry and consumed by the listener, so a
  // second back press behaves normally and leaves the site.
  useEffect(() => {
    if (phase !== "player" && phase !== "finale" && phase !== "credits") return;
    if (typeof window === "undefined") return;

    window.history.pushState({ loveflixPhase: phase }, "");
    const onPop = () => setPhase("browse");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [phase]);

  // ── Audio ───────────────────────────────────────────────────────────────────
  // The context can only be created inside a real gesture. Every entry point to
  // the template routes its first tap through here.
  const unlockedRef = useRef(false);
  const handleFirstGesture = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    void import("@/lib/webAudio").then((m) => m.unlockAudio());
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: BG,
        color: TEXT,
        fontFamily: FONT_BODY,
        overflowX: "hidden",
      }}
    >
      {/* The logo IS the recipient's "create your own" path. */}
      {mode === "live" && (
        <Link
          href="/templates"
          style={{
            position: "fixed",
            top: "calc(10px + env(safe-area-inset-top, 0px))",
            right: 10,
            zIndex: Z.brand,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 34,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(22,22,22,0.72)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            color: TEXT,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.02em",
            textDecoration: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" width={16} height={16} style={{ width: 16, height: 16 }} />
          SubhSandesh
        </Link>
      )}

      <MuteToggle offsetRight={mode === "live" ? 132 : 10} onFirstGesture={handleFirstGesture} />

      {phase === "intro" && (
        <IntroScreen
          reducedMotion={reducedMotion}
          onFirstGesture={handleFirstGesture}
          onDone={() => setPhase("profiles")}
        />
      )}

      {phase === "profiles" && (
        <ProfileGate
          data={data}
          reducedMotion={reducedMotion}
          onFirstGesture={handleFirstGesture}
          onSelect={backToBrowse}
        />
      )}

      {phase === "browse" && (
        <BrowseScreen data={data} reducedMotion={reducedMotion} onPlay={startEpisode} />
      )}

      {phase === "player" && (
        <EpisodePlayer
          key={runId}
          data={data}
          scenes={graph.scenes}
          startSceneId={graph.startSceneId}
          denom={graph.denom}
          reducedMotion={reducedMotion}
          onFinish={finishEpisode}
          onExit={backToBrowse}
        />
      )}

      {phase === "finale" && (
        <FinaleScreen
          data={data}
          path={path}
          reducedMotion={reducedMotion}
          onCredits={() => setPhase("credits")}
        />
      )}

      {phase === "credits" && (
        <CreditsScreen data={data} reducedMotion={reducedMotion} onReplay={backToBrowse} />
      )}

      <DevErrorPanel report={graph.report} usedFallback={graph.usedFallback} brandHits={brandHits} />
    </div>
  );
}
