"use client";

// ─── The deck ────────────────────────────────────────────────────────────────
//
// Owns the reveal sequence and the stack. Three cards are rendered at a time —
// the front one is interactive, the two behind are scenery.
//
// The card window is `index-1 .. index+2` and is rendered in ascending order
// with stable keys, so advancing the deck only changes each card's `depth` prop.
// Nothing is unmounted mid-animation and no DOM node is reordered, which is what
// keeps the "behind cards move up one position" transition from restarting.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfxFlip, sfxPaperSlide, sfxStamp } from "@/lib/webAudio";

import { REVEAL, type FlagCard, type SwipeChoice, type SwipeResult } from "./types";
import { CARD_H, CARD_W, EXIT_MS, INK_SOFT, MONO, STACK_SHADOW } from "./flagsTheme";
import SwipeCard, { type RevealState } from "./SwipeCard";
import { useElementSize } from "./useEnv";

interface CardDeckProps {
  deck: FlagCard[];
  senderName: string;
  reduced: boolean;
  finePointer: boolean;
  onComplete: (results: SwipeResult[]) => void;
}

export default function CardDeck({ deck, senderName, reduced, finePointer, onComplete }: CardDeckProps) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState<RevealState | null>(null);
  /** Settled reveals, so a card sliding off keeps showing the face she earned. */
  const [revealed, setRevealed] = useState<Record<string, RevealState>>({});
  const [results, setResults] = useState<SwipeResult[]>([]);
  const [hintDismissed, setHintDismissed] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(areaRef);

  /** Input lock for the whole reveal sequence — mashing cannot skip a card. */
  const locked = useRef(false);
  const timers = useRef<number[]>([]);
  const resultsRef = useRef<SwipeResult[]>([]);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    },
    [],
  );

  /** Total is the number of NUMBERED cards; the sincere card carries no number. */
  const numbered = useMemo(() => deck.filter((c) => c.kind === "flag"), [deck]);
  const numberOf = useCallback(
    (card: FlagCard): string | null => {
      if (card.kind === "sincere") return null;
      const n = numbered.findIndex((c) => c.id === card.id) + 1;
      const pad = (v: number) => String(v).padStart(2, "0");
      return `${pad(n)} / ${pad(numbered.length)}`;
    },
    [numbered],
  );

  // ── Commit → fly out → HOLD → return → flip ───────────────────────────────
  const commit = useCallback(
    (choice: SwipeChoice, dx: number, dy: number) => {
      const card = deck[index];
      if (!card || card.kind === "sincere" || locked.current) return;

      locked.current = true;
      setHintDismissed(true);
      sfxPaperSlide();
      setReveal({ choice, from: { dx, dy }, phase: "flyout", showNext: false });
      setResults((prev) => [...prev.filter((r) => r.cardId !== card.id), { cardId: card.id, choice }]);

      const at = (ms: number, fn: () => void) => {
        timers.current.push(window.setTimeout(fn, ms));
      };
      at(REVEAL.flyOutMs, () => setReveal((r) => (r ? { ...r, phase: "hold" } : r)));
      // The 120ms hold. The pause is what registers as a decision.
      at(REVEAL.flyOutMs + REVEAL.holdMs, () => setReveal((r) => (r ? { ...r, phase: "return" } : r)));
      at(REVEAL.flipStartMs, () => {
        setReveal((r) => (r ? { ...r, phase: "flip" } : r));
        sfxFlip();
      });
      if (choice !== card.truth) {
        at(REVEAL.flipStartMs + Math.round(REVEAL.flipMs * 0.55), () => sfxStamp());
      }
      at(REVEAL.nextAffordanceMs, () => setReveal((r) => (r ? { ...r, showNext: true } : r)));
      at(REVEAL.lockMs, () => {
        setReveal((r) => (r ? { ...r, phase: "settled" } : r));
        locked.current = false;
      });
    },
    [deck, index],
  );

  // ── Tap to continue ───────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (locked.current) return;
    const card = deck[index];
    if (!card) return;
    // A flag card has to be answered before it can leave.
    if (card.kind === "flag" && !reveal) return;

    if (reveal) {
      const settled: RevealState = { ...reveal, showNext: false, phase: "settled" };
      setRevealed((prev) => ({ ...prev, [card.id]: settled }));
    }
    setReveal(null);
    setIndex((i) => i + 1);
  }, [deck, index, reveal]);

  // ── Deck finished ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (index < deck.length) return;
    const t = window.setTimeout(() => onCompleteRef.current(resultsRef.current), EXIT_MS + 90);
    return () => window.clearTimeout(t);
  }, [index, deck.length]);

  // ── Desktop keys ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const card = deck[index];
      if (!card) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp") {
        if (card.kind === "sincere" || reveal || locked.current) return;
        e.preventDefault();
        const choice: SwipeChoice =
          e.key === "ArrowLeft" ? "red" : e.key === "ArrowRight" ? "green" : "complicated";
        const w = size.width || 320;
        const h = size.height || 440;
        commit(
          choice,
          choice === "red" ? -w * 0.42 : choice === "green" ? w * 0.42 : 0,
          choice === "complicated" ? -h * 0.34 : 0,
        );
      } else if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        if (locked.current) return;
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck, index, reveal, commit, advance, size.width, size.height]);

  const from = Math.max(0, index - 1);
  const to = Math.min(deck.length, index + 3);
  const window_: FlagCard[] = deck.slice(from, to);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minHeight: 0,
        padding: "8px 0 76px",
      }}
    >
      <div
        ref={areaRef}
        style={{
          position: "relative",
          width: CARD_W,
          height: CARD_H,
        }}
      >
        {/* the one ambient shadow the palette allows */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            top: 22,
            bottom: -6,
            borderRadius: 2,
            boxShadow: STACK_SHADOW,
            zIndex: 0,
          }}
        />

        {window_.map((card, k) => {
          const i = from + k;
          const depth = i - index;
          return (
            <SwipeCard
              key={card.id}
              card={card}
              numberLabel={numberOf(card)}
              senderName={senderName}
              depth={depth}
              interactive={depth === 0}
              width={size.width}
              height={size.height}
              reduced={reduced}
              reveal={depth === 0 ? reveal : (revealed[card.id] ?? null)}
              onCommit={commit}
              onTap={advance}
            />
          );
        })}
      </div>

      {finePointer && !hintDismissed && (
        <p
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 22,
            margin: 0,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            color: INK_SOFT,
          }}
        >
          drag the card — or use ← → ↑
        </p>
      )}
    </div>
  );
}
