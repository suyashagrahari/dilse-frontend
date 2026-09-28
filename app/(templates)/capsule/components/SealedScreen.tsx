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
import { useReducedMotion } from "framer-motion";
import { Sticker } from "../../_love/LoveKit";
import {
  COPY,
  HAND,
  MONO,
  PALETTE,
  SERIF,
  UI,
  canAmend,
  fmtSealDate,
  wearFor,
  type SealedCapsuleView,
} from "./types";
import { WAITING_GIF, writtenLine } from "./capsuleData";
import { useCountdown, useNow, fmtCountdown } from "./useTick";
import CapsuleObject from "./CapsuleObject";
import { PaperTexture, paperFill, wornEdgeStyle } from "./paper";
import { Frame, Kicker, Mono, Serif, TapButton } from "./ui";
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
  const reduce = useReducedMotion() ?? false;
  const countdown = useCountdown(view.opensOn);
  const [peeks, setPeeks] = useState(0);

  // Before hydration `now` is 0; showing "fresh" then correcting is better than
  // rendering a wear stage computed from the server's clock.
  const wear = now === 0 ? "fresh" : wearFor(view.opensOn, now);

  const amendable = now !== 0 && canAmend({ sealedOn: view.sealedOn, opensOn: view.opensOn }, now);
  const amendLeft = view.amendUntil ? Math.max(0, Date.parse(view.amendUntil) - now) : 0;

  const peek = useCallback(() => {
    unlockAudio();
    // A short, flat, unrewarding note. It is meant to sound like a locked door.
    tone({ freq: 190, toFreq: 150, ms: 130, type: "triangle", gain: 0.12 });
    setPeeks((n) => n + 1);
  }, []);

  const initials = `${view.pair.a.name.charAt(0)}${view.pair.b.name.charAt(0)}`;
  const sealDate = fmtSealDate(view.opensOn, view.timezone);
  const names = [view.pair.a.name, view.pair.b.name].filter(Boolean).join(" & ");
  const k = view.keepsakes;

  const pad = (n: number) => String(n).padStart(2, "0");
  const tiles: Array<[string, string]> = countdown.ready
    ? [
        [String(countdown.days), countdown.days === 1 ? "day" : "days"],
        [pad(countdown.hours), "hrs"],
        [pad(countdown.minutes), "min"],
        [pad(countdown.seconds), "sec"],
      ]
    : [
        ["—", "days"],
        ["—", "hrs"],
        ["—", "min"],
        ["—", "sec"],
      ];

  const inside: Array<{ icon: string; text: string }> = [
    { icon: "✍️", text: writtenLine(view.pair.a.name || "one of you", view.counts.a) },
    { icon: "✍️", text: writtenLine(view.pair.b.name || "the other", view.counts.b) },
  ];
  if (k.photos > 0) inside.push({ icon: "📸", text: `${k.photos} keepsake${k.photos === 1 ? "" : "s"}, notes on the back` });
  if (k.gifs > 0) inside.push({ icon: "🎞️", text: `${k.gifs} moving picture${k.gifs === 1 ? "" : "s"}` });
  if (k.letter) inside.push({ icon: "💌", text: "a letter, to be read last" });

  return (
    <Frame seed={`sealed-${view.sealedOn}`}>
      <div className="flex flex-col items-center px-5 pb-12 pt-14">
        <Sticker tilt={-3}>🔒 sealed</Sticker>
        <h1
          className="mt-4 text-center"
          style={{ fontFamily: UI, fontWeight: 800, fontSize: "clamp(32px, 9vw, 44px)", lineHeight: 1, letterSpacing: "-0.045em", color: PALETTE.ink, overflowWrap: "anywhere" }}
        >
          {view.pair.a.name || "one of you"}{" "}
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: "var(--lv-a1)" }}>&amp;</span>{" "}
          {view.pair.b.name || "the other"}
        </h1>
        <p className="mt-2" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1.2, color: PALETTE.inkSoft }}>
          sealed {fmtSealDate(view.sealedOn, view.timezone)}
        </p>

        {/* The object, and the wait. */}
        <div className="relative mt-12 mb-4">
          <div key={peeks} className={peeks > 0 ? "cp-nope" : undefined}>
            <div className={reduce ? undefined : "cp-float"} style={{ ["--tilt" as string]: "0deg" }}>
              <CapsuleObject seed={`obj-${view.sealedOn}`} wear={wear} initials={initials} width={210} names={names} dateLabel={sealDate} reduced={reduce} />
            </div>
          </div>
          {WAITING_GIF && (
            <div
              className="absolute"
              style={{ right: -58, bottom: -18, width: 92, transform: "rotate(7deg)", background: "#fdfcf7", padding: "5px 5px 0", borderRadius: 3, boxShadow: "0 12px 22px -12px rgba(0,0,0,.6)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WAITING_GIF} alt="" width={82} height={82} style={{ width: 82, height: 82, objectFit: "cover", display: "block" }} />
              <p style={{ margin: 0, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 15, lineHeight: "22px", color: "#2a2420" }}>the wait</p>
            </div>
          )}
        </div>

        {/* The countdown — one shared 1s tick, never negative. */}
        <div className="mt-10 grid w-full grid-cols-4 gap-2" style={{ maxWidth: 360 }} aria-label={countdown.ready ? fmtCountdown(countdown) : sealDate}>
          {tiles.map(([n, label]) => (
            <div key={label} className="rounded-[18px] py-3 text-center" style={{ background: PALETTE.quiet, border: `1px solid ${PALETTE.edge}` }}>
              <p style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color: PALETTE.ink }}>{n}</p>
              <p style={{ margin: "4px 0 0", fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: PALETTE.inkSoft }}>{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center">
          <Serif size={19} colour={PALETTE.inkSoft} style={{ fontStyle: "italic" }}>
            {countdown.done ? "it's time." : COPY.sealedUntil(sealDate)}
          </Serif>
        </p>

        {/* What's inside — counts, never contents. */}
        <div className="mt-9 w-full rounded-[24px] px-4 py-4" style={{ maxWidth: 380, background: PALETTE.quiet, border: `1px solid ${PALETTE.edge}` }}>
          <Kicker>what&apos;s inside</Kicker>
          <ul className="mt-3 flex flex-col gap-2.5" style={{ listStyle: "none", margin: "12px 0 0", padding: 0 }}>
            {inside.map((row, i) => (
              <li key={i} className="flex items-center gap-3">
                <span aria-hidden className="grid shrink-0 place-items-center rounded-full" style={{ width: 34, height: 34, background: PALETTE.paper, border: `1px solid ${PALETTE.edge}`, fontSize: 16 }}>
                  {row.icon}
                </span>
                <span style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, color: PALETTE.ink, lineHeight: 1.3 }}>{row.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The stake — a ticket, torn off. */}
        <div className="relative mt-4 w-full overflow-hidden px-5 py-4" style={{ maxWidth: 380, ...paperFill("stake"), ...wornEdgeStyle("stake"), border: `1px dashed ${PALETTE.edge}` }}>
          <PaperTexture seed="stake-g" opacity={0.06} />
          <div className="relative">
            <Mono size={10}>THE STAKE, AGREED</Mono>
            <p className="mt-1.5">
              <Serif size={20}>{view.stake || "—"}</Serif>
            </p>
          </div>
        </div>

        {/* The peek button. It does nothing, on purpose, and the refusal is the
            best thing on this screen. */}
        <div className="mt-8 flex w-full flex-col items-center gap-2" style={{ maxWidth: 300 }}>
          <TapButton onClick={peek} tone="quiet" full ariaLabel="Try to peek inside the capsule">
            👀 peek
          </TapButton>
          {peeks > 0 && (
            <p key={peeks} className="capsule-card-in" style={{ fontFamily: HAND, fontWeight: 700, fontSize: 24, color: PALETTE.wax }}>
              {COPY.peek}
            </p>
          )}
        </div>

        {/* The amend window. Shown as remaining time while it is open; as a flat
            statement of fact once it is not. There is no third state. */}
        <div className="mt-6 w-full text-center" style={{ maxWidth: 300 }}>
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
