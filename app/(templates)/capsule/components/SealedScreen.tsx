"use client";

// ─── SCREEN 3 — sealed / waiting ─────────────────────────────────────────────
//
// This screen gets visited over and over across a year, so it has to reward the
// visit without giving anything away. What it may show is fixed by the type it
// receives: `SealedCapsuleView` HAS NO PREDICTION TEXT ON IT. There is no field
// to accidentally render, no flag to get wrong, and nothing in the JSON that
// paid for this page.
//
// Counts, authorship, the sealed date and the stake. That is the whole budget.

import { useCallback, useState } from "react";
import {
  COPY,
  MONO,
  PALETTE,
  canAmend,
  fmtSealDate,
  wearFor,
  type SealedCapsuleView,
} from "./types";
import { writtenLine } from "./capsuleData";
import { useCountdown, useNow, fmtCountdown } from "./useTick";
import CapsuleObject from "./CapsuleObject";
import { DotRow, Frame, Mono, Rule, Serif, TapButton } from "./ui";
import { tone, unlockAudio } from "@/lib/webAudio";

export default function SealedScreen({
  view,
  onAmend,
  footer,
}: {
  view: SealedCapsuleView;
  /** Only offered while `canAmend` is true. Absent otherwise — not disabled. */
  onAmend?: () => void;
  footer?: React.ReactNode;
}) {
  const now = useNow();
  const countdown = useCountdown(view.opensOn);
  const [peeked, setPeeked] = useState(false);

  // Before hydration `now` is 0; showing "fresh" then correcting is better than
  // rendering a wear stage computed from the server's clock.
  const wear = now === 0 ? "fresh" : wearFor(view.opensOn, now);

  const amendable = now !== 0 && canAmend({ sealedOn: view.sealedOn, opensOn: view.opensOn }, now);
  const amendLeft = view.amendUntil ? Math.max(0, Date.parse(view.amendUntil) - now) : 0;

  const peek = useCallback(() => {
    unlockAudio();
    // A short, flat, unrewarding note. It is meant to sound like a locked door.
    tone({ freq: 190, toFreq: 150, ms: 130, type: "triangle", gain: 0.12 });
    setPeeked(true);
  }, []);

  const initials = `${view.pair.a.name.charAt(0)}${view.pair.b.name.charAt(0)}`;
  const sealDate = fmtSealDate(view.opensOn, view.timezone);

  return (
    <Frame seed={`sealed-${view.sealedOn}`}>
      <div className="flex flex-col items-center px-5 pb-10 pt-8">
        <Mono size={11}>SEALED</Mono>
        <h1 className="mt-1 text-center" style={{ fontFamily: MONO, fontSize: 13, letterSpacing: 2, color: PALETTE.ink }}>
          {view.pair.a.name.toUpperCase()} &nbsp;·&nbsp; {view.pair.b.name.toUpperCase()}
        </h1>

        <div className="mt-7">
          <CapsuleObject seed={`obj-${view.sealedOn}`} wear={wear} initials={initials} />
        </div>

        {/* The countdown. `useSyncExternalStore` over one shared 1s tick — never
            a setInterval writing state, and never negative. */}
        <div className="mt-7 text-center">
          {countdown.ready && !countdown.done ? (
            <p style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 1, color: PALETTE.ink }}>
              {fmtCountdown(countdown)}
            </p>
          ) : (
            <p style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 1, color: PALETTE.ink }}>
              {countdown.done ? "0 days · 00:00:00" : sealDate}
            </p>
          )}
          <p className="mt-1.5">
            <Serif size={15} colour={PALETTE.inkSoft} style={{ fontStyle: "italic" }}>
              {COPY.sealedUntil(sealDate)}
            </Serif>
          </p>
        </div>

        {/* Visible metadata. Counts, not contents. */}
        <div className="mt-8 w-full" style={{ maxWidth: 300 }}>
          <Rule />
          <div className="flex flex-col gap-2 py-3">
            <DotRow label={view.pair.a.name.toLowerCase()} value={`${view.counts.a} written`} />
            <DotRow label={view.pair.b.name.toLowerCase()} value={`${view.counts.b} written`} />
            <DotRow label="sealed" value={fmtSealDate(view.sealedOn, view.timezone)} />
          </div>
          <Rule />
          <div className="py-3">
            <Mono size={10}>THE STAKE</Mono>
            <p className="mt-1">
              <Serif size={16}>{view.stake || "—"}</Serif>
            </p>
          </div>
          <Rule />
          <p className="pt-3" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, lineHeight: 1.6 }}>
            {writtenLine(view.pair.a.name, view.counts.a)}
            <br />
            {writtenLine(view.pair.b.name, view.counts.b)}
          </p>
        </div>

        {/* The peek button. It does nothing, on purpose, and the refusal is the
            best thing on this screen. */}
        <div className="mt-8 flex w-full flex-col items-center gap-2" style={{ maxWidth: 300 }}>
          <TapButton onClick={peek} tone="quiet" full ariaLabel="Try to peek inside the capsule">
            peek
          </TapButton>
          {peeked && (
            <p className="capsule-card-in" style={{ fontFamily: MONO, fontSize: 13, color: PALETTE.wax }}>
              {COPY.peek}
            </p>
          )}
        </div>

        {/* The amend window. Shown as remaining time while it is open; as a flat
            statement of fact once it is not. There is no third state. */}
        <div className="mt-7 w-full text-center" style={{ maxWidth: 300 }}>
          {amendable ? (
            <>
              <p style={{ fontFamily: MONO, fontSize: 12, color: PALETTE.amber }}>
                {COPY.amendOpen}
                {amendLeft > 0 && ` ${fmtWindow(amendLeft)} left.`}
              </p>
              {onAmend && (
                <div className="mt-2">
                  <TapButton onClick={onAmend} tone="amber" full>
                    change mine
                  </TapButton>
                </div>
              )}
            </>
          ) : (
            <p style={{ fontFamily: MONO, fontSize: 12, color: PALETTE.inkSoft }}>{COPY.amendClosed}</p>
          )}
        </div>

        {/*
          TODO(reminders): schedule push/email nudges at 30, 7 and 1 days before
          `opensOn`, in the pair's timezone, to both people independently. The
          wear stages on this screen are the in-app half of that; without the
          out-of-app half, a capsule opens on a day nobody was told about. Needs:
          a server-side scheduler keyed on `opensOn`, per-person opt-out, and a
          hard rule that the notification body carries NO prediction text.
        */}
        <p className="mt-6 text-center" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkFaint }}>
          reminders at 30, 7 and 1 days are not built yet.
        </p>

        {footer}
      </div>
    </Frame>
  );
}

/** "23h 41m" / "41m". Never negative — the caller clamps first. */
function fmtWindow(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor(ms / 60_000) % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
