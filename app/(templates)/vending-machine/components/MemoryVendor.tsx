"use client";

// ─── The Card-O-Matic: limited-edition memory cards ──────────────────────────
//
// The machine's little sibling. Every photo the sender added is a sealed foil
// pack behind the glass, coded M1…M10, with the photo only just visible through
// the foil. Tap a pack (or "surprise me"): the LED spells the code, the pack
// wobbles on its hook, falls with the same gravity easing as the big machine,
// thunks into the tray — and opens as a holo trading card with the memory
// note on the back. Collected cards go into the binder underneath; the full set
// warms up the receipt printer below.
//
// Reduced motion skips the fall and opens the card straight away.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { V } from "../../_love/theme";
import { CandyButton, GhostButton, GROTESK, HeartBurst, ITALIC, SectionHead, GradText } from "../../_love/LoveKit";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { LovePhoto } from "../../_love/types";
import { motor, sfxBuzzer, sfxFlip, sfxThunk } from "@/lib/webAudio";
import DotMatrixDisplay from "./DotMatrixDisplay";
import MemoryCard from "./MemoryCard";
import { C, PIXEL, alpha } from "./machine";
import { VEND, cardCode, cardRarity } from "./types";

interface Props {
  photos: LovePhoto[];
  gifs: string[];
  senderName: string;
  recipientName: string;
  ledColor: string;
  ledDim: string;
  pulledOn: string;
  reducedMotion: boolean;
  collected: number[];
  onCollect: (index: number) => void;
}

const WOBBLE_MS = 380;

export default function MemoryVendor({
  photos,
  gifs,
  senderName,
  recipientName,
  ledColor,
  ledDim,
  pulledOn,
  reducedMotion,
  collected,
  onCollect,
}: Props) {
  const total = photos.length;
  const [busy, setBusy] = useState<number | null>(null);
  const [tray, setTray] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [fresh, setFresh] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [led, setLed] = useState<string | null>(null);
  const [ledW, setLedW] = useState(300);

  const caseRef = useRef<HTMLDivElement>(null);
  const ledBox = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const packs = useRef<Map<number, HTMLElement>>(new Map());
  const timers = useRef<number[]>([]);
  const stopMotor = useRef<(() => void) | null>(null);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      stopMotor.current?.();
    },
    [],
  );

  useEffect(() => {
    const el = ledBox.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLedW(Math.max(120, Math.floor(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const have = useMemo(() => new Set(collected), [collected]);
  const remaining = useMemo(() => photos.map((_, i) => i).filter((i) => !have.has(i)), [photos, have]);
  const complete = total > 0 && remaining.length === 0;

  const reveal = useCallback(
    (i: number, isNew: boolean) => {
      setOpen(i);
      setFlipped(false);
      setFresh(isNew);
      if (isNew) onCollect(i);
    },
    [onCollect],
  );

  const vend = useCallback(
    (i: number) => {
      if (busy !== null) return;
      if (have.has(i)) {
        reveal(i, false);
        return;
      }
      const code = cardCode(i);
      setBusy(i);
      setLed(`${code}  VENDING`);
      const el = packs.current.get(i);
      const box = caseRef.current;

      if (reducedMotion || !el || !box) {
        setLed(`${code}  ENJOY`);
        setBusy(null);
        reveal(i, true);
        later(1800, () => setLed(null));
        return;
      }

      stopMotor.current?.();
      stopMotor.current = motor({ freq: 92, gain: 0.1 });
      el.animate(
        [
          { transform: "translate3d(0,0,0) rotate(0deg)" },
          { transform: "translate3d(-3px,0,0) rotate(-3deg)", offset: 0.25 },
          { transform: "translate3d(3px,-2px,0) rotate(3deg)", offset: 0.6 },
          { transform: "translate3d(0,0,0) rotate(0deg)" },
        ],
        { duration: WOBBLE_MS, easing: "ease-in-out" },
      );

      later(WOBBLE_MS, () => {
        stopMotor.current?.();
        stopMotor.current = null;
        const a = el.getBoundingClientRect();
        const b = box.getBoundingClientRect();
        const dy = Math.max(60, b.bottom - a.top + 12);
        el.animate(
          [
            { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
            { transform: `translate3d(0,${dy}px,0) rotate(${i % 2 ? 24 : -22}deg)`, opacity: 1 },
          ],
          { duration: VEND.fallMs + 90, easing: VEND.fallEasing, fill: "forwards" },
        );
      });

      const impactAt = WOBBLE_MS + VEND.fallMs + 90;
      later(impactAt, () => {
        sfxThunk();
        setTray(i);
        setLed(`${code}  PLEASE COLLECT`);
        flapRef.current?.animate(
          [{ transform: "rotateX(0deg)" }, { transform: "rotateX(-34deg)", offset: 0.35 }, { transform: "rotateX(4deg)", offset: 0.75 }, { transform: "rotateX(0deg)" }],
          { duration: 260, easing: "cubic-bezier(.3,0,.35,1)" },
        );
        box.animate([{ transform: "translateY(0)" }, { transform: "translateY(2px)", offset: 0.4 }, { transform: "translateY(0)" }], { duration: 110 });
      });
      later(impactAt + 520, () => {
        sfxFlip();
        setTray(null);
        setBusy(null);
        reveal(i, true);
        el.getAnimations().forEach((an) => an.cancel());
      });
      later(impactAt + 2600, () => setLed(null));
    },
    [busy, have, reveal, reducedMotion, later],
  );

  const surprise = useCallback(() => {
    if (busy !== null) return;
    if (remaining.length === 0) {
      sfxBuzzer();
      setLed("SOLD OUT  FULL SET");
      later(1800, () => setLed(null));
      return;
    }
    // Deterministic-ish: the next remaining card after a rotating offset, so
    // "surprise me" is never the same order as tapping left to right.
    const pick = remaining[(collected.length * 3 + 1) % remaining.length];
    vend(pick);
  }, [busy, remaining, collected.length, vend, later]);

  const close = useCallback(() => {
    setOpen(null);
    setFresh(false);
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (total === 0) return null;

  const idle = complete
    ? "FULL SET COLLECTED  ·  THE PRINTER IS WARMING UP"
    : `LIMITED EDITION MEMORY CARDS  ·  ${total} IN THE SET  ·  1 OF 1 EACH  ·  TAP A PACK`;

  return (
    <section aria-label="Limited-edition memory cards" style={{ position: "relative" }}>
      <SectionHead
        eyebrow={`vol. 01 · ${total} card${total === 1 ? "" : "s"} · no duplicates`}
        title={
          <>
            Limited-edition <GradText style={{ fontFamily: ITALIC, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em" }}>memories</GradText>
          </>
        }
        note={`Every photo is a 1-of-1 card, ${recipientName}. Tap a pack to vend it.`}
      />

      {/* ── the vendor ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          borderRadius: 26,
          padding: 10,
          background: `linear-gradient(90deg, ${C.bodyDark} 0%, ${C.body} 16%, ${C.bodyLight} 44%, ${C.body} 70%, ${C.bodyDark} 100%)`,
          border: `1px solid ${C.edge}`,
          boxShadow: `0 26px 50px -22px ${V.shadow}, inset 0 1px 0 rgba(255,255,255,.25)`,
        }}
      >
        {/* marquee */}
        <div
          style={{
            borderRadius: 16,
            padding: "9px 10px 8px",
            background: `linear-gradient(180deg, ${C.plateHi} 0%, ${C.plateLo} 100%)`,
            border: `1px solid ${C.edge}`,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
            <span
              style={{
                fontFamily: PIXEL,
                fontSize: 15,
                letterSpacing: ".06em",
                color: C.sign,
                textShadow: `0 0 10px ${C.signGlow}, 0 0 2px ${C.signGlow}`,
              }}
            >
              CARD-O-MATIC
            </span>
            <span style={{ fontFamily: PIXEL, fontSize: 9, letterSpacing: ".1em", color: C.sign, opacity: 0.7 }}>
              {collected.length}/{total} PULLED
            </span>
          </div>
          <div ref={ledBox}>
            <DotMatrixDisplay idleText={idle} text={led} width={ledW} height={22} color={ledColor} dimColor={ledDim} />
          </div>
        </div>

        {/* glass case */}
        <div
          ref={caseRef}
          style={{
            position: "relative",
            borderRadius: 16,
            padding: "12px 10px 4px",
            background: `radial-gradient(120% 90% at 50% 0%, ${C.glassHi} 0%, ${C.glass} 80%)`,
            border: `4px solid ${C.well2}`,
            overflow: "hidden",
          }}
        >
          <div className="vm-pack-grid">
            {photos.map((p, i) => {
              const got = have.has(i);
              const code = cardCode(i);
              const r = cardRarity(i, total);
              return (
                <div key={`${code}-${p.url.slice(-24)}`} style={{ position: "relative" }}>
                  {got ? (
                    <button
                      type="button"
                      onClick={() => vend(i)}
                      aria-label={`${code} collected — open it again`}
                      className="lv-focus"
                      style={{
                        width: "100%",
                        aspectRatio: "3 / 4",
                        borderRadius: 10,
                        border: `1.5px dashed ${alpha(C.sign, 35)}`,
                        background: "rgba(255,255,255,.03)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        color: C.sign,
                      }}
                    >
                      <span style={{ fontFamily: PIXEL, fontSize: 9, letterSpacing: ".08em", lineHeight: 1.5, textAlign: "center", opacity: 0.75 }}>
                        ♥<br />PULLED
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) packs.current.set(i, el);
                        else packs.current.delete(i);
                      }}
                      onClick={() => vend(i)}
                      disabled={busy !== null && busy !== i}
                      aria-label={`Vend ${code}, a ${r.label.toLowerCase()} memory card`}
                      className="vm-pack lv-focus"
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3 / 4",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,.4)",
                        cursor: busy === null ? "pointer" : "default",
                        background: "#222",
                        boxShadow: "0 6px 12px -4px rgba(0,0,0,.6)",
                        transformOrigin: "50% 0%",
                        zIndex: busy === i ? 5 : 1,
                      }}
                    >
                      {/* the photo, only just visible through the foil */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt=""
                        draggable={false}
                        loading="lazy"
                        style={{ ...cropStyle(photoCrop(p)), position: "absolute", inset: 0, filter: "blur(5px) saturate(1.3)", transform: "scale(1.15)" }}
                      />
                      <span aria-hidden className="vm-foil" style={{ position: "absolute", inset: 0, background: V.grad, opacity: 0.78, mixBlendMode: "hard-light" }} />
                      <span aria-hidden className="vm-foil-shine" />
                      {/* crimp at the top of the pack */}
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          height: 9,
                          background: "repeating-linear-gradient(90deg, rgba(255,255,255,.55) 0 2px, rgba(0,0,0,.18) 2px 4px)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: "14px 6px 6px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "#fff",
                          textShadow: "0 1px 2px rgba(0,0,0,.45)",
                        }}
                      >
                        <span style={{ fontFamily: PIXEL, fontSize: 8, letterSpacing: ".1em", opacity: 0.9 }}>LTD</span>
                        <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>
                          ♥
                        </span>
                        <span style={{ fontFamily: PIXEL, fontSize: 14, letterSpacing: ".04em" }}>{code}</span>
                      </span>
                    </button>
                  )}
                  {/* shelf lip */}
                  <div
                    style={{
                      marginTop: 6,
                      marginBottom: 8,
                      height: 12,
                      borderRadius: 3,
                      background: "linear-gradient(180deg,#141414 0%,#000 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      fontFamily: PIXEL,
                      fontSize: 7.5,
                      color: "#eee",
                      letterSpacing: ".06em",
                    }}
                  >
                    {code}
                    <span style={{ color: got ? C.red : "#ffd35a" }}>{got ? "GONE" : "★".repeat(Math.min(3, r.stars))}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* glass glare */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "linear-gradient(112deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.07) 32%, rgba(255,255,255,0) 44%)",
            }}
          />
        </div>

        {/* controls + tray */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "stretch" }}>
          <button
            type="button"
            onClick={surprise}
            disabled={busy !== null}
            className="vm-key lv-focus"
            style={{
              flex: "0 0 auto",
              minHeight: 54,
              padding: "0 14px",
              borderRadius: 14,
              background: `linear-gradient(180deg, ${C.keyHi} 0%, ${C.keyLo} 100%)`,
              border: `1px solid ${C.edge}`,
              color: C.keyInk,
              fontFamily: PIXEL,
              fontSize: 11,
              letterSpacing: ".06em",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 2px 0 rgba(0,0,0,.35)",
              cursor: busy === null ? "pointer" : "default",
              opacity: complete ? 0.6 : 1,
            }}
          >
            🎲 SURPRISE
            <br />
            ME
          </button>
          <div
            style={{
              position: "relative",
              flex: 1,
              minHeight: 54,
              borderRadius: 14,
              background: "linear-gradient(180deg,#07090a 0%,#0e1213 100%)",
              border: `1px solid ${C.edge}`,
              boxShadow: "inset 0 6px 12px rgba(0,0,0,.85)",
              overflow: "hidden",
              perspective: 400,
            }}
          >
            {tray !== null && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 6,
                  width: 30,
                  height: 40,
                  marginLeft: -15,
                  borderRadius: 5,
                  background: V.grad,
                  transform: `rotate(${tray % 2 ? 76 : -78}deg)`,
                  boxShadow: "0 2px 4px rgba(0,0,0,.6)",
                }}
              />
            )}
            <div
              ref={flapRef}
              style={{
                position: "absolute",
                inset: "0 0 34% 0",
                transformOrigin: "50% 0%",
                background: `linear-gradient(180deg, ${alpha(C.bodyDarker, 94)} 0%, ${alpha(C.bodyDarker, 70)} 100%)`,
                borderBottom: `1px solid ${C.edge}`,
                display: "grid",
                placeItems: "center",
                fontFamily: PIXEL,
                fontSize: 9,
                letterSpacing: ".18em",
                color: alpha(C.ink, 70),
              }}
            >
              PUSH
            </div>
          </div>
        </div>
      </div>

      {/* ── the binder ───────────────────────────────────────────────────── */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <p style={{ margin: 0, fontFamily: PIXEL, fontSize: 11, letterSpacing: ".1em", color: V.soft }}>YOUR BINDER</p>
          <p style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: 14, color: V.ink }}>
            {collected.length}
            <span style={{ color: V.faint }}>/{total}</span> collected
          </p>
        </div>
        <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${(collected.length / total) * 100}%`,
              background: V.grad,
              borderRadius: 999,
              transition: "width .6s cubic-bezier(.2,.9,.3,1)",
            }}
          />
        </div>
        <div className="vm-binder">
          {photos.map((p, i) => {
            const got = have.has(i);
            return (
              <button
                key={`b-${i}`}
                type="button"
                disabled={!got}
                onClick={() => got && reveal(i, false)}
                aria-label={got ? `Open ${cardCode(i)}: ${p.caption || "memory"}` : `${cardCode(i)} not collected yet`}
                className={got ? "lv-tile lv-focus" : undefined}
                style={{
                  position: "relative",
                  aspectRatio: "5 / 7",
                  borderRadius: 9,
                  padding: got ? 2.5 : 0,
                  background: got ? V.grad : "transparent",
                  border: got ? "none" : `1.5px dashed ${V.edge}`,
                  cursor: got ? "pointer" : "default",
                  overflow: "hidden",
                }}
              >
                {got ? (
                  <span style={{ display: "block", width: "100%", height: "100%", borderRadius: 7, overflow: "hidden", background: "#111" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" draggable={false} style={cropStyle(photoCrop(p))} />
                  </span>
                ) : (
                  <span style={{ fontFamily: PIXEL, fontSize: 10, color: V.faint }}>{cardCode(i)}</span>
                )}
              </button>
            );
          })}
        </div>
        {complete && (
          <p className="lv-pop" style={{ margin: "14px 0 0", textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 14, color: V.ink }}>
            ✦ Full set. You own every single one. Now scroll — something is printing. ✦
          </p>
        )}
      </div>

      {open !== null && photos[open] && (
        <CardReveal
          photo={photos[open]}
          index={open}
          total={total}
          flipped={flipped}
          onFlip={() => {
            sfxFlip();
            setFlipped((f) => !f);
          }}
          onClose={close}
          fresh={fresh}
          senderName={senderName}
          gif={gifs.length ? gifs[open % gifs.length] : undefined}
          pulledOn={pulledOn}
          reducedMotion={reducedMotion}
          left={total - collected.length}
        />
      )}
    </section>
  );
}

function CardReveal({
  photo,
  index,
  total,
  flipped,
  onFlip,
  onClose,
  fresh,
  senderName,
  gif,
  pulledOn,
  reducedMotion,
  left,
}: {
  photo: LovePhoto;
  index: number;
  total: number;
  flipped: boolean;
  onFlip: () => void;
  onClose: () => void;
  fresh: boolean;
  senderName: string;
  gif?: string;
  pulledOn: string;
  reducedMotion: boolean;
  left: number;
}) {
  const r = cardRarity(index, total);
  const root = typeof document !== "undefined" ? document.querySelector<HTMLElement>(".vm-root") : null;
  const body = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Memory card ${cardCode(index)}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 170,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "calc(16px + env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px))",
        background: "radial-gradient(90% 70% at 50% 40%, rgba(20,10,30,.78) 0%, rgba(6,3,10,.94) 100%)",
        overflowY: "auto",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "min(86vw, 340px, calc((100dvh - 190px) * 5 / 7))" }}>
        <p style={{ margin: 0, fontFamily: PIXEL, fontSize: 11, letterSpacing: ".14em", color: "#fff", opacity: 0.85, textAlign: "center" }}>
          {fresh ? `YOU PULLED A ${r.label}!` : `${cardCode(index)} · FROM YOUR BINDER`}
        </p>
        <div className={reducedMotion ? undefined : "vm-card-in"} style={{ position: "relative", width: "100%" }}>
          {fresh && !reducedMotion && <HeartBurst glyphs={["✦", "💖", "⭐", "🩷", "✨"]} />}
          <MemoryCard
            photo={photo}
            index={index}
            total={total}
            flipped={flipped}
            onFlip={onFlip}
            senderName={senderName}
            gif={gif}
            pulledOn={pulledOn}
            reducedMotion={reducedMotion}
          />
          {fresh && (
            <span
              className="lv-slap"
              style={{
                position: "absolute",
                top: -12,
                right: -10,
                zIndex: 4,
                padding: "6px 11px",
                borderRadius: 999,
                background: V.chip,
                color: V.chipInk,
                fontFamily: PIXEL,
                fontSize: 12,
                letterSpacing: ".06em",
                boxShadow: "0 8px 18px -8px rgba(0,0,0,.6)",
              }}
            >
              NEW!
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 12.5, color: "rgba(255,255,255,.7)", textAlign: "center" }}>
          {flipped ? "Tap the card to see the photo again" : "Tap the card to read the back ↻"}
        </p>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <GhostButton onClick={onFlip} style={{ flex: 1, minHeight: 50, color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
            {flipped ? "Front" : "Flip ↻"}
          </GhostButton>
          <CandyButton onClick={onClose} style={{ flex: 1.4, minHeight: 50, fontSize: 15.5 }}>
            {fresh ? (left > 0 ? `Keep it ♥ (${left} left)` : "Keep it ♥ full set!") : "Back to binder"}
          </CandyButton>
        </div>
      </div>
    </div>
  );
  // Portalled into the template root so the theme variables still apply but
  // no transformed ancestor can trap the fixed overlay.
  return root ? createPortal(body, root) : body;
}
