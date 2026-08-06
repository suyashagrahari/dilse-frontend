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
import { DebugBar, DebugButton, Frame } from "./ui";

export interface CapsuleTemplateProps {
  view: CapsuleView;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

export default function CapsuleTemplate({ view, mode }: CapsuleTemplateProps) {
  // Demo-only: reveal the gallery fixture as though the date had arrived. The
  // real path cannot do this and must not be able to — the content is on the
  // server and the server will not send it early.
  const [demoSkipped, setDemoSkipped] = useState(false);

  const canDemoSkip =
    mode === "demo" && view.state === "sealed" && view.sealedOn === DEMO_SEALED_ON && !demoSkipped;

  const effective: CapsuleView = useMemo(() => {
    if (mode === "demo" && demoSkipped && view.state === "sealed" && view.sealedOn === DEMO_SEALED_ON) {
      return { state: "open", capsule: DEMO_CAPSULE };
    }
    return view;
  }, [mode, demoSkipped, view]);

  const debug =
    mode === "demo" && (canDemoSkip || demoSkipped) ? (
      <DebugBar>
        {canDemoSkip && <DebugButton label="DEBUG: skip to opening date" onClick={() => setDemoSkipped(true)} />}
        {demoSkipped && <DebugButton label="DEBUG: re-seal" onClick={() => setDemoSkipped(false)} />}
      </DebugBar>
    ) : null;

  return (
    <>
      <CapsuleStyles />
      {debug}
      {effective.state === "sealed" ? (
        <SealedScreen view={effective} />
      ) : (
        <OpenFlow key={effective.capsule.sealedOn} capsule={effective.capsule} mode={mode} />
      )}
    </>
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
function OpenFlow({ capsule: initial, mode }: { capsule: Capsule; mode: "demo" | "live" }) {
  const [capsule, setCapsule] = useState<Capsule>(initial);
  const [phase, setPhase] = useState<OpeningPhase>("waiting");
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

  const stake = capsule.stake;
  const sealAnother = useCallback(() => {
    // The retention loop. The new capsule starts pre-filled with the stake that
    // was just settled, which is the whole reason anyone seals a second one.
    const params = new URLSearchParams({ new: "1", stake });
    window.location.assign(`/capsule?${params.toString()}`);
  }, [stake]);

  const footer =
    mode === "demo" ? (
      <p className="mt-8 text-center" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkFaint }}>
        demo preview
      </p>
    ) : null;

  if (phase === "declined") return <DeclinedScreen footer={footer} />;

  // Opened alone. No scorecard, no stake, no score, no competitive framing —
  // and no route from here to any of them.
  if (phase === "solo") return <SoloScreen capsule={capsule} onDecline={toDeclined} footer={footer} />;

  if (phase === "scorecard") {
    return <ScorecardScreen capsule={capsule} onSealAnother={sealAnother} footer={footer} />;
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
    <Frame seed="unavailable">
      <div className="flex min-h-[100dvh] items-center justify-center px-8 text-center">
        <p style={{ fontFamily: MONO, fontSize: 13, color: PALETTE.inkSoft, lineHeight: 1.7 }}>
          {COPY.declined}
        </p>
      </div>
    </Frame>
  );
}

export { projectSealed };
