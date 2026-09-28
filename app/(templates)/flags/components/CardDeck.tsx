"use client";

// ─── The deck ────────────────────────────────────────────────────────────────
//
// Owns the reveal sequence and the stack. Three cards are rendered at a time —
// the front one is interactive, the two behind are scenery.
//
// The card window is `index-1 .. index+2` and is rendered in ascending order
// with stable keys, so advancing the deck only changes each card's `depth` prop.
// Nothing is unmounted mid-animation and no DOM node is reordered.
//
// Under the card: the three dating-app buttons (🚩 · 🫠 · 💚) that commit
// exactly like a swipe does — a phone user who never discovers the drag still
// plays the whole deck — and, once a card has flipped, one big "next" button.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfxFlip, sfxPaperSlide, sfxStamp } from "@/lib/webAudio";

import { V } from "../../_love/theme";
import { CHOICE_EMOJI, FLAG_VAR, REVEAL, type FlagCard, type SwipeChoice, type SwipeResult } from "./types";
import { isTyping } from "./bits";
import { CARD_H, CARD_W, EXIT_MS, GROTESK, MONO } from "./flagsTheme";
import SwipeCard, { type RevealState } from "./SwipeCard";
import { useElementSize } from "./useEnv";

interface CardDeckProps {
  deck: FlagCard[];
  senderName: string;
  reduced: boolean;
  sound: boolean;
  onToggleSound: () => void;
  /** The sincere card's GIF sticker. */
  sincereGif?: string;
  onComplete: (results: SwipeResult[]) => void;
}

const DECK_CSS = `
.fl-act { transition: transform .16s cubic-bezier(.2,.9,.3,1.4), box-shadow .2s ease; }
.fl-act:hover:not(:disabled) { transform: translateY(-3px) scale(1.05); }
.fl-act:active:not(:disabled) { transform: scale(.92); }
.fl-act:focus-visible { outline: 3px solid var(--lv-a2); outline-offset: 3px; }
.fl-act:disabled { opacity: .35; cursor: default; }
@keyframes fl-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
.fl-in { animation: fl-in .28s cubic-bezier(.2,.9,.3,1.2) both; }
@media (prefers-reduced-motion: reduce) { .fl-act, .fl-in { transition: none; animation: none; } }
`;

export default function CardDeck({ deck, senderName, reduced, sound, onToggleSound, sincereGif, onComplete }: CardDeckProps) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState<RevealState | null>(null);
  /** Settled reveals, so a card sliding off keeps showing the face she earned. */
  const [revealed, setRevealed] = useState<Record<string, RevealState>>({});
  const [results, setResults] = useState<SwipeResult[]>([]);

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
      return `${pad(n)}/${pad(numbered.length)}`;
    },
    [numbered],
  );

  // ── Commit → fly out → HOLD → return → flip ───────────────────────────────
  const commit = useCallback(
    (choice: SwipeChoice, dx: number, dy: number) => {
      const card = deck[index];
      if (!card || card.kind === "sincere" || locked.current) return;

      locked.current = true;
      sfxPaperSlide();
      setReveal({ choice, from: { dx, dy }, phase: "flyout", showNext: false });
      setResults((prev) => [...prev.filter((r) => r.cardId !== card.id), { cardId: card.id, choice }]);
      try {
        navigator.vibrate?.(12);
      } catch {}

      const at = (ms: number, fn: () => void) => {
        timers.current.push(window.setTimeout(fn, ms));
      };
      at(REVEAL.flyOutMs, () => setReveal((r) => (r ? { ...r, phase: "hold" } : r)));
      at(REVEAL.flyOutMs + REVEAL.holdMs, () => setReveal((r) => (r ? { ...r, phase: "return" } : r)));
      at(REVEAL.flipStartMs, () => {
        setReveal((r) => (r ? { ...r, phase: "flip" } : r));
        sfxFlip();
      });
      if (choice !== card.truth) at(REVEAL.flipStartMs + Math.round(REVEAL.flipMs * 0.55), () => sfxStamp());
      at(REVEAL.nextAffordanceMs, () => setReveal((r) => (r ? { ...r, showNext: true } : r)));
      at(REVEAL.lockMs, () => {
        setReveal((r) => (r ? { ...r, phase: "settled" } : r));
        locked.current = false;
      });
    },
    [deck, index],
  );

  /** The buttons commit from the card's own position, like a key press. */
  const commitFromButton = useCallback(
    (choice: SwipeChoice) => {
      const w = size.width || 320;
      const h = size.height || 440;
      commit(choice, choice === "red" ? -w * 0.42 : choice === "green" ? w * 0.42 : 0, choice === "complicated" ? -h * 0.34 : 0);
    },
    [commit, size.width, size.height],
  );

  // ── Tap to continue ───────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (locked.current) return;
    const card = deck[index];
    if (!card) return;
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

  // ── Keys ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const card = deck[index];
      if (!card) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp") {
        if (card.kind === "sincere" || reveal || locked.current) return;
        e.preventDefault();
        commitFromButton(e.key === "ArrowLeft" ? "red" : e.key === "ArrowRight" ? "green" : "complicated");
      } else if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        if (locked.current) return;
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck, index, reveal, commitFromButton, advance]);

  const from = Math.max(0, index - 1);
  const to = Math.min(deck.length, index + 3);
  const window_: FlagCard[] = deck.slice(from, to);

  const current = deck[index];
  const answered = results.length;
  const canSwipe = !!current && current.kind === "flag" && !reveal;
  const showNext = !!current && (current.kind === "sincere" || !!reveal?.showNext);
  const lastCard = index === deck.length - 1;

  return (
    <div style={{ position: "relative", zIndex: 1, width: "100%", flex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: "calc(env(safe-area-inset-top, 0px) + 66px) 20px calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
      <style>{DECK_CSS}</style>

      {/* ── progress ──────────────────────────────────────────────────── */}
      <div style={{ width: CARD_W, display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div aria-hidden style={{ flex: 1, display: "flex", gap: 4 }}>
          {deck.map((c, k) => {
            const r = results.find((x) => x.cardId === c.id);
            return (
              <span
                key={c.id}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 5,
                  background: r ? FLAG_VAR[r.choice] : k < index ? V.a1 : k === index ? V.soft : V.edge,
                  opacity: k === index && !r ? 0.7 : 1,
                  transition: "background-color .3s ease",
                }}
              />
            );
          })}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: V.soft, minWidth: 40, textAlign: "right" }} aria-live="polite">
          {Math.min(answered, numbered.length)}/{numbered.length}
        </span>
        <button type="button" onClick={onToggleSound} aria-pressed={sound} aria-label={sound ? "Sound on" : "Sound off"} className="fl-act" style={{ width: 36, height: 36, borderRadius: 99, border: `1px solid ${V.edge}`, background: V.glass, color: V.ink, display: "grid", placeItems: "center", cursor: "pointer" }}>
          {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* ── the stack ─────────────────────────────────────────────────── */}
      <div ref={areaRef} style={{ position: "relative", width: CARD_W, height: CARD_H, flex: "0 0 auto" }}>
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
              gif={sincereGif}
              onCommit={commit}
              onTap={advance}
            />
          );
        })}
      </div>

      {/* ── controls ──────────────────────────────────────────────────── */}
      <div style={{ width: CARD_W, marginTop: 26, minHeight: 96, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 10 }}>
        {showNext ? (
          <button
            key={`next-${index}`}
            type="button"
            onClick={advance}
            className="lv-cta lv-focus fl-in"
            style={{ width: "100%", minHeight: 58, borderRadius: 999, border: "none", background: V.grad, color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: `0 16px 34px -14px color-mix(in srgb, ${V.a1} 80%, transparent)` }}
          >
            {lastCard ? "see my verdict ✨" : current?.kind === "sincere" ? "okay. next card →" : "next card →"}
          </button>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
              <ActionButton choice="red" label="Red flag" size={66} disabled={!canSwipe} onClick={() => commitFromButton("red")} />
              <ActionButton choice="complicated" label="Beige flag" size={52} disabled={!canSwipe} onClick={() => commitFromButton("complicated")} />
              <ActionButton choice="green" label="Green flag" size={66} disabled={!canSwipe} onClick={() => commitFromButton("green")} />
            </div>
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 12.5, fontWeight: 700, color: V.soft, textAlign: "center" }}>
              swipe ← red · ↑ beige · green → &nbsp;or tap
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ActionButton({ choice, label, size, disabled, onClick }: { choice: SwipeChoice; label: string; size: number; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="fl-act"
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        border: `2.5px solid ${FLAG_VAR[choice]}`,
        background: V.paper,
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.42,
        cursor: "pointer",
        boxShadow: `0 12px 28px -12px ${FLAG_VAR[choice]}, inset 0 0 0 4px color-mix(in srgb, ${FLAG_VAR[choice]} 14%, transparent)`,
      }}
    >
      <span aria-hidden>{CHOICE_EMOJI[choice]}</span>
    </button>
  );
}
