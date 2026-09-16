"use client";

// ─── Proposal — the template ──────────────────────────────────────────────────
// Four acts, one page, no routing: act transitions are internal state with an
// AnimatePresence cross-fade. The gate click is the single user gesture that
// unlocks audio, so nothing plays before it and everything plays after it.
//
// Every keyframe used anywhere in the template is declared once here, under a
// `ps-` prefix, and reduced-motion is honoured in one place at the bottom of the
// block — with the deliberate exception of the dodging "No" button, whose
// movement is the mechanic rather than decoration.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { ProposalData } from "./types";
import { BODY, DISPLAY, INK, INK_SOFT, PAGE_BG, PINK_DEEP } from "./theme";
import { usePrefersReducedMotion } from "./motion";
import { useProposalAudio } from "./useProposalAudio";
import MusicDock from "./MusicDock";
import FloatingHearts from "./FloatingHearts";
import GateScreen from "./GateScreen";
import MemoryLane from "./MemoryLane";
import TheAsk from "./TheAsk";
import Celebration from "./Celebration";

type Act = "gate" | "memories" | "ask" | "celebration";

export default function ProposalTemplate({
  data,
  mode,
  shareId,
}: {
  data: ProposalData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}) {
  const [act, setAct] = useState<Act>("gate");
  /** Remembered across acts — Act 4 teases the recipient with this number. */
  const [dodges, setDodges] = useState(0);
  const reduced = usePrefersReducedMotion();
  // Destructured, not held as an object: `react-hooks/refs` treats the hook's
  // whole return value as ref-bearing because it carries callback refs, and
  // reading a field off it during render is an error.
  const { mode: musicMode, track: musicTrackInfo, fileSrc, started, muted, start, toggleMute, attachAudio, attachYouTube } =
    useProposalAudio(data.musicUrl, data.musicTrack);

  // Each act is its own full-height screen, so always begin at the top of it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [act, reduced]);

  const openGate = useCallback(() => {
    // Order matters: the audio call must happen inside the click handler's own
    // task to still count as a user gesture.
    start();
    setAct("memories");
  }, [start]);

  // ── Going back ──────────────────────────────────────────────────────────
  //
  // Every act after the gate can step back one. The gate is deliberately not a
  // destination: returning to it would offer to start music that is already
  // playing, and re-opening it is the one thing nobody wants to redo.
  //
  // Dodges are NOT reset. Somebody who fought the No button eleven times and
  // then went back to re-read the scrapbook has earned the callback on the
  // celebration screen, and zeroing it would quietly delete the joke.
  //
  // This used to be drawn here, as a pill fixed to the top-left corner. It is
  // now passed to the acts that have somewhere to go and rendered in their
  // flow: the corner belongs to the builder's own Back and Create in preview,
  // and two floating chips in one corner means one of them is unreachable.
  const backTo: Record<Act, Act | null> = {
    gate: null,
    memories: null,
    ask: "memories",
    celebration: "ask",
  };
  const goBack = useCallback(() => {
    setAct((a) => backTo[a] ?? a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bumpDodges = useCallback(() => setDodges((d) => d + 1), []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        overflowX: "hidden",
        background: PAGE_BG,
        // Deliberately NOT background-attachment:fixed. It janks while scrolling on
        // iOS Safari, and it sizes the wash to the viewport instead of the element —
        // so anything below the fold falls back to the app's cream body colour. The
        // celebration screen invites people to screenshot it, so a full-page capture
        // has to stay pink to the last pixel.
        color: INK,
        fontFamily: BODY,
      }}
    >
      <style>{`
        @keyframes psHRise { from { transform: translate3d(0,12vh,0) } to { transform: translate3d(0,-108vh,0) } }
        @keyframes psHSway { 0% { transform: translateX(-15px) rotate(-14deg) } 100% { transform: translateX(15px) rotate(14deg) } }
        @keyframes psOrb { 0%,100% { transform: translate3d(0,0,0) scale(1) } 33% { transform: translate3d(4vw,-3vh,0) scale(1.1) } 66% { transform: translate3d(-3vw,3vh,0) scale(.94) } }
        @keyframes psBob { 0%,100% { transform: translateY(0) rotate(-1.4deg) } 50% { transform: translateY(-9px) rotate(1.4deg) } }
        @keyframes psPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.055) } }
        @keyframes psHalo { 0%,100% { transform: scale(.94); opacity: .5 } 50% { transform: scale(1.14); opacity: .95 } }
        @keyframes psPop { 0% { transform: scale(.6) translateY(14px); opacity: 0 } 100% { transform: scale(1) translateY(0); opacity: 1 } }
        @keyframes psRise { 0% { transform: translateY(16px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }

        .ps-h-out { position: absolute; bottom: 0; animation-name: psHRise; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform }
        .ps-h-in { display: block; animation-name: psHSway; animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; will-change: transform }
        .ps-orb { position: absolute; border-radius: 999px; filter: blur(6px); animation-name: psOrb; animation-timing-function: ease-in-out; animation-iteration-count: infinite; will-change: transform }
        .ps-bob { animation: psBob 3.4s ease-in-out infinite }
        .ps-pulse { animation: psPulse 1.7s ease-in-out infinite }
        .ps-halo { animation: psHalo 1.7s ease-in-out infinite }
        .ps-pop { animation: psPop .46s cubic-bezier(.18,1.4,.4,1) both }
        .ps-rise { animation: psRise .62s cubic-bezier(.2,.8,.2,1) both }

        .ps-btn { -webkit-tap-highlight-color: transparent; transition: transform .18s cubic-bezier(.2,1.4,.4,1), box-shadow .18s ease }
        .ps-btn:active { transform: scale(.955) }
        .ps-btn:focus-visible { outline: 3px solid ${PINK_DEEP}; outline-offset: 3px }

        /* Polaroids: the tilt + straighten lives on the inner element so it never
           fights the outer element's filled entrance animation. */
        .ps-pola-in { transition: transform .28s cubic-bezier(.2,1.2,.4,1), box-shadow .28s ease; will-change: transform }
        .ps-pola:hover, .ps-pola:focus-within { z-index: 6 }
        /* Hint copy follows the pointer type, not the motion preference. */
        .ps-hint-tap { display: none }
        @media (hover: none) {
          .ps-hint-hover { display: none }
          .ps-hint-tap { display: inline }
        }
        .ps-pola:hover .ps-pola-in, .ps-pola:focus-within .ps-pola-in, .ps-pola:active .ps-pola-in {
          transform: rotate(0deg) scale(1.06) !important;
          box-shadow: 0 26px 46px -18px rgba(150,80,110,.6) !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .ps-h-out, .ps-h-in, .ps-orb, .ps-bob, .ps-pulse, .ps-halo { animation: none !important }
          .ps-pop, .ps-rise { animation-duration: .01ms !important; animation-delay: 0ms !important }
        }
      `}</style>

      {/* The sender's own file, when they gave one. Never autoplays: the gate's
          click handler is what calls play(). A YouTube link is NOT played here
          — it goes through the visible IFrame player in MusicDock. */}
      {musicMode === "file" && fileSrc ? (
        <audio ref={attachAudio} src={fileSrc} loop preload="none" style={{ display: "none" }} />
      ) : null}

      <FloatingHearts />

      {/* Music lives bottom-right now — see MusicDock for why, and for the
          id TheAsk uses to keep the dodging No button out from under it. */}
      <MusicDock
        started={started}
        muted={muted}
        mode={musicMode}
        track={musicTrackInfo}
        onToggleMute={toggleMute}
        attachYouTube={attachYouTube}
      />

      {/* SubhSandesh brand badge — recipient view only. */}
      {mode === "live" && (
        <Link
          href="/templates"
          aria-label="SubhSandesh"
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            zIndex: 46,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              overflow: "hidden",
              background: "rgba(255,250,252,.9)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid #ffd6e2",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 6px 18px -6px rgba(239,83,125,.45)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="SubhSandesh" width={30} height={30} style={{ objectFit: "contain" }} />
          </span>
          <span
            style={{
              fontFamily: DISPLAY,
              fontSize: 8,
              fontWeight: 700,
              color: PINK_DEEP,
              letterSpacing: ".04em",
              opacity: 0.85,
              lineHeight: 1,
            }}
          >
            SubhSandesh
          </span>
        </Link>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={act}
            initial={{ opacity: 0, y: reduced ? 0 : 20, scale: reduced ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -16, scale: reduced ? 1 : 0.99 }}
            transition={{ duration: reduced ? 0.18 : 0.45, ease: "easeOut" }}
            style={{ width: "100%" }}
          >
            {act === "gate" && <GateScreen data={data} onOpen={openGate} reduced={reduced} />}
            {act === "memories" && (
              <MemoryLane data={data} onNext={() => setAct("ask")} reduced={reduced} />
            )}
            {act === "ask" && (
              <TheAsk
                data={data}
                dodges={dodges}
                onDodge={bumpDodges}
                onYes={() => setAct("celebration")}
                onBack={goBack}
                reduced={reduced}
              />
            )}
            {act === "celebration" && (
              <Celebration
                data={data}
                dodges={dodges}
                shareId={shareId}
                onBack={goBack}
                reduced={reduced}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* A quiet footer credit that never competes with the moment. */}
      <p
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          fontSize: 10.5,
          color: INK_SOFT,
          opacity: 0.55,
          padding: "0 16px 18px",
          margin: 0,
        }}
      >
        made with far too much love
      </p>
    </div>
  );
}
