"use client";

// ─── Capsule — the orchestrator ──────────────────────────────────────────────
//
// Takes a `CapsuleView`, not a `data` blob. That is deliberate and it is the
// single most important line in this template: the sealed/open distinction is
// visible IN THE TYPE at the component boundary, so the sealed branch cannot
// render prediction text — there is no prediction text on a `SealedCapsuleView`
// to render.
//
// The phase is driven by the SHAPE OF THE PAYLOAD, never by the device clock.
// Someone who moves their phone forward a year gets a countdown that reads zero
// and a screen that still says "sealed", because the server is still sending a
// `SealedCapsuleView`. The clock only draws the countdown and the wear stage.

import { useCallback, useMemo, useState } from "react";
import { Camera, Play, RotateCcw } from "lucide-react";
import { BrandBadge } from "../../_love/LoveKit";
import {
  COPY,
  MONO,
  PALETTE,
  type Capsule,
  type CapsuleView,
  type OpeningPhase,
  type Side,
  type Verdict,
  resolve,
} from "./types";
import { DEMO_CAPSULE, DEMO_SEALED_ON } from "./capsuleData";
import { projectSealed } from "./coerce";
import CapsuleStyles from "./capsuleStyles";
import SealedScreen from "./SealedScreen";
import OpeningCeremony from "./OpeningCeremony";
import JudgingScreen from "./JudgingScreen";
import ScorecardScreen from "./ScorecardScreen";
import { DeclinedScreen, SoloScreen } from "./SoloScreen";
import KeepsakesScreen, { hasKeepsakes } from "./Keepsakes";
import { CapsuleScope, Frame, PreviewBar, PreviewButton } from "./ui";

type Phase = OpeningPhase | "keepsakes";

export interface CapsuleTemplateProps {
  view: CapsuleView;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** The sender's live theme pick in the editor preview. Wins over the view's. */
  themeOverride?: string;
  /** Set by the editor when its own preview bar is showing; the demo bar hides. */
  hideDemoBar?: boolean;
  /** Where the opened flow starts. The editor's "jump to the keepsakes" uses it. */
  startAt?: "ceremony" | "keepsakes";
}

export default function CapsuleTemplate({ view, mode, themeOverride, hideDemoBar, startAt = "ceremony" }: CapsuleTemplateProps) {
  // Demo-only: reveal the gallery fixture as though the date had arrived. The
  // real path cannot do this and must not be able to — the content is on the
  // server and the server will not send it early.
  const [demoSkipped, setDemoSkipped] = useState<false | "ceremony" | "keepsakes">(false);

  const isDemoFixture = mode === "demo" && view.state === "sealed" && view.sealedOn === DEMO_SEALED_ON;

  const effective: CapsuleView = useMemo(() => {
    if (isDemoFixture && demoSkipped) {
      return { state: "open", capsule: { ...DEMO_CAPSULE, theme: themeOverride || DEMO_CAPSULE.theme } };
    }
    return view;
  }, [isDemoFixture, demoSkipped, view, themeOverride]);

  const themeId = themeOverride || (effective.state === "sealed" ? effective.theme : effective.capsule.theme);

  const demoBar =
    isDemoFixture && !hideDemoBar ? (
      <PreviewBar>
        {demoSkipped ? (
          <PreviewButton label="back to sealed" icon={<RotateCcw size={14} />} onClick={() => setDemoSkipped(false)} />
        ) : (
          <>
            <PreviewButton primary label="play opening day" icon={<Play size={14} />} onClick={() => setDemoSkipped("ceremony")} />
            <PreviewButton label="jump to the keepsakes" icon={<Camera size={14} />} onClick={() => setDemoSkipped("keepsakes")} />
          </>
        )}
      </PreviewBar>
    ) : null;

  const start = demoSkipped || startAt;

  return (
    <CapsuleScope themeId={themeId}>
      <CapsuleStyles />
      {mode === "live" && <BrandBadge />}
      {effective.state === "sealed" ? (
        <SealedScreen view={effective} footer={isDemoFixture ? <div style={{ height: 70 }} /> : undefined} />
      ) : (
        <OpenFlow
          key={`${effective.capsule.sealedOn}-${start}`}
          capsule={effective.capsule}
          mode={mode}
          initialPhase={start === "keepsakes" && hasKeepsakes(effective.capsule) ? "keepsakes" : "waiting"}
        />
      )}
      {demoBar}
    </CapsuleScope>
  );
}

/**
 * Everything after the server has agreed the capsule may open.
 *
 * The verdicts live here, in state. Progress survives an abandoned session
 * within the tab — `firstOpenStep` resumes on whichever card was unfinished.
 *
 * TODO(server): persist verdicts through a `PATCH /capsule-pages/share/:id/verdict`
 * so that judging survives a reload and, more importantly, so that two PHONES
 * can judge the same capsule. Right now both verdicts are entered on one device.
 * No storage fallback is used on purpose: a capsule's contents must not sit in
 * localStorage where any other tab can read them.
 */
function OpenFlow({ capsule: initial, mode, initialPhase }: { capsule: Capsule; mode: "demo" | "live"; initialPhase: Phase }) {
  const [capsule, setCapsule] = useState<Capsule>(initial);
  const [phase, setPhase] = useState<Phase>(initialPhase);
  /** Where "back" from the keepsakes goes: whichever screen sent them there. */
  const [cameFrom, setCameFrom] = useState<Phase>(initialPhase === "keepsakes" ? "waiting" : "scorecard");
  const [viewer, setViewer] = useState<Side | null>(null);

  const onVote = useCallback((ids: string[], side: Side, verdict: Verdict) => {
    setCapsule((c) => {
      const predictions = c.predictions.map((p) => {
        if (!ids.includes(p.id)) return p;
        const next = { ...p, [side === "a" ? "verdictA" : "verdictB"]: verdict };
        const r = resolve(next);
        return r ? { ...next, resolved: r } : next;
      });
      return { ...c, predictions };
    });
  }, []);

  const toJudging = useCallback(() => setPhase("judging"), []);
  const toScorecard = useCallback(() => {
    const openedAt = new Date().toISOString();
    setCapsule((c) => (c.openedAt ? c : { ...c, openedAt, status: "judged" }));
    setPhase("scorecard");
  }, []);
  const toSolo = useCallback(() => setPhase("solo"), []);
  const toDeclined = useCallback(() => setPhase("declined"), []);
  const toKeepsakes = useCallback((from: Phase) => {
    setCameFrom(from);
    setPhase("keepsakes");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);
  const more = hasKeepsakes(capsule);

  const stake = capsule.stake;
  const sealAnother = useCallback(() => {
    // The retention loop. The new capsule starts pre-filled with the stake that
    // was just settled, which is the whole reason anyone seals a second one.
    const params = new URLSearchParams({ new: "1", stake });
    window.location.assign(`/capsule?${params.toString()}`);
  }, [stake]);

  const footer =
    mode === "demo" ? (
      <p className="mt-8 pb-16 text-center" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkFaint }}>
        demo preview
      </p>
    ) : null;

  if (phase === "declined") return <DeclinedScreen footer={footer} />;

  if (phase === "keepsakes") {
    const back: Record<string, string> = { scorecard: "back to the scorecard", solo: "back to the predictions", waiting: "play the opening ceremony" };
    return (
      <KeepsakesScreen
        capsule={capsule}
        onBack={back[cameFrom] ? () => setPhase(cameFrom) : undefined}
        backLabel={back[cameFrom]}
        footer={footer}
      />
    );
  }

  // Opened alone. No scorecard, no stake, no score, no competitive framing —
  // and no route from here to any of them. The keepsakes ARE reachable: they
  // keep no score.
  if (phase === "solo") {
    return <SoloScreen capsule={capsule} onDecline={toDeclined} onKeepsakes={more ? () => toKeepsakes("solo") : undefined} footer={footer} />;
  }

  if (phase === "scorecard") {
    return (
      <ScorecardScreen
        capsule={capsule}
        onSealAnother={sealAnother}
        onKeepsakes={more ? () => toKeepsakes("scorecard") : undefined}
        footer={footer}
      />
    );
  }

  if (phase === "judging") {
    return <JudgingScreen capsule={capsule} onVote={onVote} onDone={toScorecard} />;
  }

  return (
    <OpeningCeremony
      capsule={capsule}
      mode={mode}
      viewer={viewer}
      setViewer={setViewer}
      onJudging={toJudging}
      onSolo={toSolo}
      onDecline={toDeclined}
    />
  );
}

/**
 * A capsule whose payload arrived unreadable. Never a 404 and never a stack
 * trace — somebody may have waited a year for this screen.
 */
export function CapsuleUnavailable() {
  return (
    <CapsuleScope themeId={null}>
    <Frame seed="unavailable">
      <div className="flex min-h-[100dvh] items-center justify-center px-8 text-center">
        <p style={{ fontFamily: MONO, fontSize: 13, color: PALETTE.inkSoft, lineHeight: 1.7 }}>
          {COPY.declined}
        </p>
      </div>
    </Frame>
    </CapsuleScope>
  );
}

export { projectSealed };
