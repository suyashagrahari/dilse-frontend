"use client";

// ─── SCREEN 4 — the opening ──────────────────────────────────────────────────
//
// Requires both people. Then 3-2-1, the seal cracks, and — BEFORE a single
// prediction — the context snapshot. The gap between the city they wrote from
// and wherever they are now is the emotional payload of this whole template;
// rushing past it to get to the funny cards throws away the year.
//
// The safety valve is not optional. After fifteen minutes alone, `COPY.openAlone`
// appears. Nobody waits a year and then gets stuck on a spinner because the
// other person's phone is off.

import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  COPY,
  MONO,
  PALETTE,
  SERIF,
  TIMING,
  UI,
  fmtSealDate,
  type Capsule,
  type Side,
} from "./types";
import CapsuleObject from "./CapsuleObject";
import { PaperTexture, WaxShards, paperFill, wornEdgeStyle } from "./paper";
import { Frame, Kicker, Mono, TapButton } from "./ui";
import { useNow, usePoll, useStepTimer } from "./useTick";
import { tone, sfxThunk, burst, unlockAudio } from "@/lib/webAudio";

type Beat = "seat" | "waiting" | "countdown" | "cracking" | "context";

export default function OpeningCeremony({
  capsule,
  mode,
  viewer,
  setViewer,
  onJudging,
  onSolo,
  onDecline,
}: {
  capsule: Capsule;
  mode: "demo" | "live";
  viewer: Side | null;
  setViewer: (s: Side) => void;
  onJudging: () => void;
  onSolo: () => void;
  onDecline: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const now = useNow();

  const [beat, setBeat] = useState<Beat>(viewer ? "waiting" : "seat");
  const [partnerHere, setPartnerHere] = useState(false);
  const [count, setCount] = useState(3);
  const [splitPx, setSplitPx] = useState(0);
  const [contextHeld, setContextHeld] = useState(false);

  // Captured once, in a lazy initialiser. Not rendered directly — only compared
  // against the ticking clock — so the server/client difference never shows.
  const [waitStart] = useState(() => Date.now());
  const elapsed = now === 0 ? 0 : Math.max(0, now - waitStart);
  const valveOpen = elapsed >= TIMING.aloneValveMs;

  const otherName = viewer === "a" ? capsule.pair.b.name : capsule.pair.a.name;

  /**
   * TODO(realtime): this is a stub. Presence should come off a socket (or a
   * server-side `openingSession` row both clients heartbeat into), not a poll,
   * and certainly not off the client asserting it. Until then the poll is here
   * so the shape of the code is right, and `[DEBUG: partner joins]` stands in
   * for the other phone.
   */
  const checkPresence = useCallback(() => {
    // no-op until there is a presence endpoint to ask.
  }, []);
  usePoll(beat === "waiting" && !partnerHere, TIMING.presencePollMs, checkPresence);

  const beginCountdown = useCallback(() => {
    unlockAudio();
    setPartnerHere(true);
    setCount(3);
    setBeat("countdown");
  }, []);

  const tickCountdown = useCallback(() => {
    setCount((c) => {
      const next = c - 1;
      if (next > 0) {
        tone({ freq: 300 + next * 40, ms: 90, type: "triangle", gain: 0.16 });
      }
      return next;
    });
  }, []);

  const beginCrack = useCallback(() => {
    sfxThunk();
    // A dry splitting sound under the thunk — wax breaking, not a door closing.
    burst({ ms: 260, cutoff: 700, toCutoff: 2600, gain: 0.32, attack: 0 });
    setBeat("cracking");
    setSplitPx(reduce ? 46 : 0);
  }, [reduce]);

  useStepTimer(beat === "countdown" && count > 0 ? `count-${count}` : null, reduce ? 200 : 800, tickCountdown);
  useStepTimer(beat === "countdown" && count === 0 ? "go" : null, reduce ? 60 : 260, beginCrack);
  // One frame after the crack starts, drive the halves apart. The transition on
  // the seal halves does the rest.
  useStepTimer(beat === "cracking" && splitPx === 0 ? "split" : null, 30, () => setSplitPx(46));
  useStepTimer(beat === "cracking" ? "crack" : null, reduce ? 200 : TIMING.crackMs, () => setBeat("context"));
  // THE BEAT. The context has to sit there before anything else is offered.
  useStepTimer(beat === "context" && !contextHeld ? "hold" : null, reduce ? 900 : 3400, () => setContextHeld(true));

  const initials = `${capsule.pair.a.name.charAt(0)}${capsule.pair.b.name.charAt(0)}`;

  // ── who is holding the phone ──────────────────────────────────────────────
  if (beat === "seat" || viewer === null) {
    return (
      <Frame seed="opening-seat">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6">
          <CapsuleObject seed={`obj-${capsule.sealedOn}`} wear="ready" initials={initials} width={150} reduced={reduce} />
          <Kicker colour="var(--lv-a1)" style={{ marginTop: 18 }}>it&apos;s time</Kicker>
          <p className="text-center" style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 32, letterSpacing: "-0.04em", color: PALETTE.ink, lineHeight: 1.05 }}>
            who&apos;s holding <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }}>the phone?</span>
          </p>
          <div className="flex w-full flex-col gap-2.5">
            {(["a", "b"] as Side[]).map((s) => (
              <TapButton
                key={s}
                full
                tone="quiet"
                onClick={() => {
                  unlockAudio();
                  setViewer(s);
                  setBeat("waiting");
                }}
              >
                {capsule.pair[s].name || (s === "a" ? "the first" : "the second")}
              </TapButton>
            ))}
          </div>
          <button
            type="button"
            onClick={onDecline}
            className="mt-2"
            style={{ minHeight: 48, fontFamily: MONO, fontSize: 12, color: PALETTE.inkSoft, touchAction: "manipulation" }}
          >
            {COPY.decline}
          </button>
        </div>
      </Frame>
    );
  }

  // ── waiting for the other person ──────────────────────────────────────────
  if (beat === "waiting") {
    return (
      <Frame seed="opening-wait">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-7 px-6">
          <CapsuleObject seed={`obj-${capsule.sealedOn}`} wear="ready" initials={initials} width={180} reduced={reduce} />

          <p className="capsule-wait text-center" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: PALETTE.ink }}>
            {COPY.waitingFor(otherName)}
          </p>
          <Mono size={11}>{fmtSealDate(capsule.opensOn, capsule.timezone)}</Mono>

          {/* Both people, one phone — which is how judging works today. The
              presence poll above is the stub for two phones; until it is real,
              saying "we're both here" IS the presence signal. */}
          <div className="flex w-full flex-col gap-2.5">
            <TapButton full tone="wax" onClick={beginCountdown}>
              we&apos;re both here — open it
            </TapButton>
          </div>

          {/* The valve. Fifteen minutes, then a real way out. */}
          {valveOpen && (
            <div className="capsule-card-in flex w-full flex-col gap-2.5">
              <TapButton full tone="wax" onClick={onSolo}>
                {COPY.openAlone}
              </TapButton>
            </div>
          )}

          <button
            type="button"
            onClick={onDecline}
            style={{ minHeight: 48, fontFamily: MONO, fontSize: 12, color: PALETTE.inkSoft, touchAction: "manipulation" }}
          >
            {COPY.decline}
          </button>

          {mode === "demo" && <div style={{ height: 60 }} />}
        </div>
      </Frame>
    );
  }

  // ── 3 · 2 · 1 ─────────────────────────────────────────────────────────────
  if (beat === "countdown") {
    return (
      <Frame seed="opening-count">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6">
          <p
            key={count}
            className="capsule-count"
            style={{ fontFamily: UI, fontWeight: 800, fontSize: 132, letterSpacing: "-0.06em", lineHeight: 1, background: "linear-gradient(100deg, var(--lv-a1), var(--lv-a2) 55%, var(--lv-a3))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
          >
            {count > 0 ? count : "·"}
          </p>
        </div>
      </Frame>
    );
  }

  // ── the crack ─────────────────────────────────────────────────────────────
  if (beat === "cracking") {
    return (
      <Frame seed="opening-crack">
        <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6">
          <div className="relative">
            <CapsuleObject
              seed={`obj-${capsule.sealedOn}`}
              wear="ready"
              initials={initials}
              splitPx={splitPx}
              reduced={reduce}
              names={[capsule.pair.a.name, capsule.pair.b.name].filter(Boolean).join(" & ")}
              dateLabel={fmtSealDate(capsule.opensOn, capsule.timezone)}
            />
            <WaxShards seed={`shards-${capsule.sealedOn}`} reduced={reduce} />
          </div>
        </div>
      </Frame>
    );
  }

  // ── the context, held ─────────────────────────────────────────────────────
  return (
    <Frame seed="opening-context">
      <div className="flex min-h-[100dvh] flex-col justify-center gap-7 px-6 py-12">
        <div className="capsule-unfurl text-center">
          <Kicker colour="var(--lv-a1)">then</Kicker>
          <p style={{ margin: "6px 0 0", fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: "-0.04em", color: PALETTE.ink }}>
            {fmtSealDate(capsule.sealedOn, capsule.timezone)}
          </p>
        </div>

        {(["a", "b"] as Side[]).map((s, i) => {
          const ctx = capsule.context[s];
          if (!ctx.city && !ctx.oneLineAboutNow) return null;
          return (
            <div
              key={s}
              className="capsule-card-in"
              style={{ animationDelay: reduce ? undefined : `${400 + i * 700}ms`, opacity: reduce ? 1 : 0 }}
            >
              <div
                className="relative overflow-hidden px-5 py-5"
                style={{ ...paperFill(`ctx-${s}`), ...wornEdgeStyle(`ctx-${s}`), border: `1px solid ${PALETTE.edge}`, transform: `rotate(${i ? 1.2 : -1.2}deg)` }}
              >
                <PaperTexture seed={`ctx-g-${s}`} opacity={0.06} />
                <div className="relative flex items-center justify-between">
                  <Mono size={10}>{(capsule.pair[s].name || "").toUpperCase()}</Mono>
                  <span aria-hidden>📍</span>
                </div>
                <p className="relative mt-2" style={{ fontFamily: SERIF, fontSize: 21, color: PALETTE.ink, lineHeight: 1.4 }}>
                  {COPY.contextLead(ctx.city || "—", ctx.oneLineAboutNow || "—")}
                </p>
              </div>
            </div>
          );
        })}

        {contextHeld && (
          <div className="capsule-card-in mt-4">
            <TapButton full tone="wax" onClick={onJudging}>
              read it
            </TapButton>
          </div>
        )}
      </div>
    </Frame>
  );
}
