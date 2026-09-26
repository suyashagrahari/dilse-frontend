"use client";

// ─── Dedication — the radio ──────────────────────────────────────────────────
//
// One chassis, four states. The chassis NEVER unmounts, which is the whole
// reason this file is shaped the way it is: the YouTube player lives in a slot
// set into its face, and re-parenting that slot would destroy the player
// instance whose playback was authorised by the tune-in gesture. There is no
// second gesture coming, so there is no second chance.
//
//   tuning   the dial fills the lower half; the player slot shows NO SIGNAL
//   playing  the dial collapses to a locked readout; controls take its place
//   signoff  the face dims and the request slip comes up over it
//
// `mode: "demo"` is the gallery preview, `mode: "live"` the recipient's
// published page. They differ only in footer chrome — the show itself is
// identical, because a preview that behaves differently from the real thing is
// a preview of nothing.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RadioTower } from "lucide-react";

import {
  BODY_FACE,
  BRAND_PLATE,
  DISPLAY_FACE,
  PALETTE,
  TAP_TARGET_PX,
  TIMING,
  resolveDecoys,
  type RadioShow,
} from "./types";
import {
  amberGlow,
  bodyBackground,
  displayBackground,
  grilleBackground,
  KEYFRAMES,
  lampStyle,
  wearShapes,
} from "./radioStyles";
import { targetFrequency } from "./showData";
import { ShowMachine } from "./showMachine";
import { loadYouTubeApi } from "./ytPlayer";
import Tuner from "./Tuner";
import VuMeters from "./VuMeters";
import { Controls, Marquee, SegmentDots, VOLUME_CSS } from "./BroadcastChrome";
import Screen from "./Screen";
import PhotoReel, { REEL_KEYFRAMES } from "./PhotoReel";
import LoveLetter from "./LoveLetter";
import { ExportableSlip } from "./RequestSlip";
import SignOffActions from "./SignOffActions";

declare global {
  interface Window {
    /** Development handle for manual and automated verification. */
    __dedicationMachine?: ShowMachine;
  }
}

export interface DedicationTemplateProps {
  data: RadioShow;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

export default function DedicationTemplate({ data, mode, shareId }: DedicationTemplateProps) {
  const reducedRaw = useReducedMotion();
  const reduced = reducedRaw ?? false;

  const target = useMemo(() => targetFrequency(data.station.frequency), [data.station.frequency]);
  const decoys = useMemo(() => resolveDecoys(target), [target]);
  const seed = `${data.station.name}|${data.station.frequency}|${data.recipient.name}`;

  // The machine outlives every render. `data` is captured at construction; the
  // editor remounts this component (via a key) whenever the show changes, which
  // is the only correct way to swap a show that owns an unlocked audio session.
  const [machine] = useState(() => new ShowMachine({ show: data, targetFreq: target, decoys, seed }));
  const snap = useSyncExternalStore(machine.subscribe, machine.getSnapshot, machine.getServerSnapshot);

  // `attach()` is not optional and must stay paired with `destroy()` — Strict
  // Mode runs setup → cleanup → setup on mount, and a destroy with no matching
  // attach leaves the machine torn down before the user ever sees the dial.
  useEffect(() => {
    machine.attach();
    return () => machine.destroy();
  }, [machine]);

  /**
   * Pre-load the IFrame API on MOUNT, not on the lock.
   *
   * `new YT.Player(...)` has to run synchronously inside the tune-in handler.
   * If the 60kB of API script were still in flight at that moment there would
   * be nothing to construct, and by the time it landed the user activation
   * would be spent. Fetching it while they are still dragging the needle costs
   * nothing and is the difference between working and silently not working.
   */
  useEffect(() => {
    if (machine.hasSongs) void loadYouTubeApi();
  }, [machine]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    window.__dedicationMachine = machine;
    return () => {
      // Identity-checked: a keyed remount tears down the old instance around
      // the same commit that sets up the new one, and an unconditional delete
      // here can leave the handle pointing at a destroyed machine.
      if (window.__dedicationMachine === machine) delete window.__dedicationMachine;
    };
  }, [machine]);

  const handleLock = useCallback(() => machine.tuneIn(), [machine]);
  const handlePrime = useCallback(() => machine.primeTuner(), [machine]);
  const handleNeedle = useCallback((f: number) => machine.setNeedle(f), [machine]);

  const wear = useMemo(() => wearShapes(seed), [seed]);
  const kinds = useMemo(() => data.segments.map((s) => s.kind), [data.segments]);

  const tuning = snap.phase === "tuning";
  const signoff = snap.phase === "signoff";
  const seg = snap.index >= 0 ? data.segments[snap.index] : undefined;
  const hasLetter = Boolean(data.letter.trim());

  return (
    <div
      className="relative w-full flex flex-col items-center"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(60% 40% at 50% 8%, rgba(240,166,60,.13) 0%, rgba(240,166,60,0) 70%), radial-gradient(120% 70% at 50% 0%, #2a120a 0%, #0d0604 60%, #070302 100%)",
        padding: "14px 12px 36px",
      }}
    >
      <style>{KEYFRAMES + VOLUME_CSS + REEL_KEYFRAMES + LAYOUT_CSS}</style>

      <p
        className="text-center text-[10px] font-bold uppercase mb-3 px-4"
        style={{ fontFamily: BODY_FACE, letterSpacing: ".34em", color: "rgba(232,220,192,.55)" }}
      >
        tonight&apos;s dedication{data.recipient.name ? ` · for ${data.recipient.name}` : ""}
      </p>

      <div
        className={`ded-layout w-full${hasLetter ? " ded-has-letter" : ""}`}
      >
      {/* ══ THE CHASSIS. Never unmounts. ══════════════════════════════════ */}
      <div className="w-full mx-auto" style={{ maxWidth: 500 }}>
      <div
        className="relative w-full rounded-[22px] overflow-hidden"
        style={{
          padding: "14px 14px 16px",
          opacity: signoff ? 0.3 : 1,
          filter: signoff ? "saturate(.5)" : "none",
          transition: reduced ? "none" : "opacity 900ms ease, filter 900ms ease",
          ...bodyBackground(),
        }}
      >
        {/* Wear. Seeded off the station, so a given radio always ages the same. */}
        {wear.map((s) => (
          <span
            key={s.key}
            aria-hidden
            className="absolute rounded-[50%] pointer-events-none"
            style={{
              left: s.left,
              top: s.top,
              width: s.width,
              height: s.height,
              transform: `rotate(${s.rotate})`,
              background: "radial-gradient(closest-side, rgba(255,255,255,.9), rgba(255,255,255,0))",
              opacity: s.opacity,
              filter: "blur(1.5px)",
            }}
          />
        ))}

        {/* ── Brand plate ────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between mb-2.5 px-0.5">
          <span
            className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-[2px]"
            style={{
              fontFamily: BODY_FACE,
              letterSpacing: "0.22em",
              color: "rgba(29,22,16,.72)",
              background: `linear-gradient(180deg, ${PALETTE.chrome}, ${PALETTE.chromeDark})`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.4)",
            }}
          >
            {BRAND_PLATE}
          </span>
          <span
            className="text-[8px] font-bold uppercase"
            style={{ fontFamily: BODY_FACE, letterSpacing: "0.24em", color: "rgba(255,255,255,.28)" }}
          >
            FM · MW
          </span>
        </div>

        {/* ── The illuminated display ────────────────────────────────── */}
        <div className="relative rounded-[8px] px-3 py-2.5 mb-3" style={displayBackground()}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className="text-[11px] font-bold uppercase truncate"
                style={{
                  fontFamily: BODY_FACE,
                  letterSpacing: "0.15em",
                  color: tuning ? PALETTE.amberDim : PALETTE.amber,
                  textShadow: tuning ? "none" : amberGlow(0.85),
                }}
              >
                {tuning ? "—— · ——" : data.station.name}
              </p>
              <p
                className="tabular-nums leading-none mt-1"
                style={{
                  fontFamily: DISPLAY_FACE,
                  fontSize: 30,
                  fontWeight: 700,
                  color: tuning ? PALETTE.amberDim : PALETTE.amber,
                  textShadow: tuning ? "none" : amberGlow(1.1),
                }}
              >
                {data.station.frequency}
                <span className="text-[11px] ml-1.5 align-top">MHz</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={lampStyle(PALETTE.red, snap.onAir)} />
                <span
                  className="text-[8px] font-bold uppercase"
                  style={{
                    fontFamily: BODY_FACE,
                    letterSpacing: "0.18em",
                    color: snap.onAir ? PALETTE.red : "rgba(226,69,46,.3)",
                  }}
                >
                  On air
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={lampStyle(PALETTE.green, !tuning)} />
                <span
                  className="text-[8px] font-bold uppercase"
                  style={{
                    fontFamily: BODY_FACE,
                    letterSpacing: "0.18em",
                    color: !tuning ? PALETTE.green : "rgba(79,208,122,.3)",
                  }}
                >
                  Tuned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── The photo reel — little cards drifting past a film window ── */}
        {data.photos.length > 0 && (
          <div className="relative mb-3">
            <PhotoReel photos={data.photos} lit={!tuning && !signoff} reduced={reduced} />
          </div>
        )}

        {/* ── NOW PLAYING ────────────────────────────────────────────── */}
        <div
          className="relative rounded-[6px] mb-3 py-1.5"
          style={{ background: "rgba(0,0,0,.5)", boxShadow: "inset 0 1px 4px rgba(0,0,0,.7)" }}
        >
          <Marquee text={tuning ? "TUNE IN — FIND THE STATION" : snap.marquee} reduced={reduced} />
        </div>

        {/* ── The screen. COMPLIANCE: the official player, full size, visible. ── */}
        <div className="relative mb-3">
          <Screen
            onHost={machine.attachPlayerHost}
            onClipEl={machine.attachClipEl}
            onPlayBlocked={() => machine.playBlockedClip()}
            photos={data.photos}
            phase={snap.phase}
            kind={snap.kind}
            songActive={snap.songActive}
            clipActive={snap.clipActive}
            clipBlocked={snap.clipBlocked}
            bridging={snap.bridging}
            songHasVideo={seg?.kind === "song" && Boolean(seg.youtubeId)}
            songTitle={seg?.kind === "song" ? seg.title : ""}
            songArtist={seg?.kind === "song" ? seg.artist : ""}
            clipPoster={seg?.kind === "clip" ? seg.posterUrl : undefined}
            senderName={data.sender.name}
            caption={snap.caption}
            reduced={reduced}
          />
        </div>

        {/* ── Speaker + VU meters ────────────────────────────────────── */}
        <div className="relative mb-2 flex items-stretch gap-2">
          <div className="w-10 sm:w-14 rounded-[6px] shrink-0" style={grilleBackground()} aria-hidden />
          <div className="flex-1 min-w-0">
            <VuMeters machine={machine} reduced={reduced} />
          </div>
          <div className="w-10 sm:w-14 rounded-[6px] shrink-0" style={grilleBackground()} aria-hidden />
        </div>

        {/* ── The lower zone ─────────────────────────────────────────── */}
        <div className="relative">
          {tuning ? (
            <Tuner
              target={target}
              decoys={decoys}
              stationName={data.station.name}
              onPrime={handlePrime}
              onNeedle={handleNeedle}
              onLock={handleLock}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <Controls
                playing={snap.playing}
                volume={snap.volume}
                onToggle={() => machine.togglePlay()}
                onVolume={(v) => machine.setVolume(v)}
                onSkipBack={() => machine.skipBack()}
                onSkipForward={() => machine.skipForward()}
                disabled={signoff}
              />
              <SegmentDots passed={snap.passed} current={snap.index} kinds={kinds} />
            </div>
          )}
        </div>
      </div>

      {snap.suspended && !tuning && !signoff && (
        <p className="text-center text-[10px] mt-3" style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.4)" }}>
          paused — the show waits for you
        </p>
      )}

      {/* Keyboard users who never touch the dial. Same handler, same gesture rules. */}
      {tuning && (
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleLock}
            className="mt-4 rounded-full px-6 text-[13px] font-bold"
            style={{
              minHeight: TAP_TARGET_PX,
              fontFamily: BODY_FACE,
              background: "linear-gradient(180deg, rgba(240,166,60,.22), rgba(240,166,60,.1))",
              color: PALETTE.amber,
              border: "1px solid rgba(240,166,60,.4)",
              boxShadow: "0 10px 24px -12px rgba(240,166,60,.6)",
            }}
          >
            ▶ skip the dial — just play it
          </button>
          {mode === "demo" && (
            <p
              className="text-center text-[10px] mt-3 px-6"
              style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.38)", maxWidth: 380 }}
            >
              The static is generated live in your browser. Tap Create to add your photos, videos, songs, voice
              and a love letter.
            </p>
          )}
        </div>
      )}
      </div>

      {/* ══ The love letter — beside the radio on desktop, under it on phones ══ */}
      {hasLetter && (
        <div className="ded-letter-col w-full mx-auto" style={{ maxWidth: 500 }}>
          <LoveLetter
            letter={data.letter}
            recipient={data.recipient.name}
            sender={data.sender.name}
            photo={data.photos[0]}
            stationLine={`${data.station.name} · ${data.station.frequency} MHz`}
            tuned={!tuning}
            reduced={reduced}
          />
        </div>
      )}
      </div>

      {/* ══ The dedication card. The screenshot moment. ═══════════════════ */}
      <AnimatePresence>
        {snap.dedicationCard && (
          <motion.div
            key="ded-card"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "110%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: "110%" }}
            transition={{ duration: TIMING.dedicationSlideMs / 1000, ease: [0.16, 1, 0.3, 1] }}
            className={`ded-card-pos fixed left-0 right-0 z-[60] px-4 pointer-events-none${hasLetter ? " ded-card-left" : ""}`}
            style={{ bottom: "8%" }}
          >
            <div
              className="mx-auto rounded-2xl px-5 py-4"
              style={{
                maxWidth: 400,
                background: "linear-gradient(180deg,#f2e9d2,#e2d5b6)",
                boxShadow: "0 22px 50px -18px rgba(0,0,0,.85)",
                borderLeft: `4px solid ${PALETTE.red}`,
              }}
            >
              <p
                className="text-[8px] font-bold uppercase mb-1.5"
                style={{ fontFamily: BODY_FACE, letterSpacing: "0.26em", color: "#6b5a45" }}
              >
                Dedication
              </p>
              <p className="text-[15px] leading-snug" style={{ fontFamily: DISPLAY_FACE, color: "#241a10" }}>
                {snap.dedicationCard}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ A dead video. One warm card, never a raw error code. ══════════ */}
      <AnimatePresence>
        {snap.errorCard && (
          <motion.div
            key="ded-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`ded-card-pos fixed left-0 right-0 z-[60] px-4 pointer-events-none${hasLetter ? " ded-card-left" : ""}`}
            style={{ bottom: "8%" }}
          >
            <div
              className="mx-auto rounded-2xl px-5 py-3.5 flex items-center gap-3"
              style={{
                maxWidth: 400,
                background: "rgba(20,10,6,.94)",
                border: "1px solid rgba(240,166,60,.3)",
              }}
            >
              <RadioTower size={18} style={{ color: PALETTE.amber }} className="shrink-0" />
              <p className="text-[13px]" style={{ fontFamily: BODY_FACE, color: PALETTE.cream }}>
                {snap.errorCard}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Sign-off ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {signoff && (
          <motion.div
            key="ded-signoff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-[80] overflow-y-auto"
            style={{ background: "linear-gradient(180deg, rgba(10,4,2,.86), rgba(6,3,2,.98))" }}
          >
            {/* 76px of head room: the editor's floating Back/Create bar sits at
                the top of the viewport and would otherwise cut the sign-off in
                half on the one screen the sender is most likely to screenshot. */}
            <div
              className="min-h-full flex flex-col items-center justify-start gap-5 px-4"
              style={{ paddingTop: "calc(76px + env(safe-area-inset-top, 0px))", paddingBottom: 40 }}
            >
              <p
                className="text-center text-[16px] leading-relaxed max-w-sm"
                style={{ fontFamily: BODY_FACE, color: PALETTE.cream }}
              >
                {data.signOff}
              </p>
              <p
                className="text-[9px] uppercase"
                style={{ fontFamily: BODY_FACE, letterSpacing: "0.3em", color: PALETTE.amberDim }}
              >
                {data.station.name} · {data.station.frequency} MHz
              </p>

              <ExportableSlip show={data} reduced={reduced} />
              <SignOffActions show={data} shareId={shareId} mode={mode} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/** Radio + letter side by side from 1024px; stacked on phones and tablets. */
const LAYOUT_CSS = `
.ded-layout { display: grid; grid-template-columns: minmax(0, 500px); gap: 32px; justify-content: center; align-items: start; }
@media (min-width: 1024px) {
  .ded-layout.ded-has-letter { grid-template-columns: minmax(0, 500px) minmax(0, 440px); gap: 48px; }
  .ded-letter-col { position: sticky; top: 80px; }
  /* Cards float over the radio column, not the gap between the columns. */
  .ded-card-pos.ded-card-left { right: auto; left: calc(50% - 494px); width: 500px; }
}
`;
