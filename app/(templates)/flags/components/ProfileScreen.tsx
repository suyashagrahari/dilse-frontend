"use client";

// ─── Screen 1 — the profile ──────────────────────────────────────────────────
//
// The memories ARE the profile. A dating-app photo carousel (story bars, tap
// the sides to flip, every photo wearing a green / beige / red flag sticker),
// the name + tagline over it, little "vitals" chips, then one prompt card per
// photo — "the moment I knew…" answered by that photo's memory note. Tap any
// photo or prompt to open it big.
//
// Old pages with no photos fall back to the pre-love-kit `photoUrl`, and then
// to a gradient initial card — never a broken image.

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { FlagSticker, Initials, Photo, isTyping } from "./bits";
import { GROTESK, ITALIC, PHOTO_FLAG_LABEL, PHOTO_FLAG_VAR, PROMPTS, photoFlag } from "./flagsTheme";

interface ProfileScreenProps {
  name: string;
  age: number;
  tagline: string;
  photos: LovePhoto[];
  cardCount: number;
  reduced: boolean;
  onBegin: () => void;
}

const PROFILE_CSS = `
.fl-prof { position: relative; z-index: 1; width: 100%; max-width: 460px; margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 66px) 16px calc(env(safe-area-inset-bottom, 0px) + 120px); display: grid; gap: 16px; }
.fl-prof-side { display: grid; gap: 14px; align-content: start; min-width: 0; }
.fl-prof-hero { min-width: 0; }
@media (min-width: 1024px) {
  .fl-prof { max-width: 980px; grid-template-columns: 430px minmax(0, 1fr); gap: 36px; padding-top: 84px; align-items: start; }
  .fl-prof-hero { position: sticky; top: 84px; }
}
.fl-seg { flex: 1; height: 3px; border-radius: 3px; background: rgba(255,255,255,.38); overflow: hidden; }
.fl-seg > i { display: block; height: 100%; background: #fff; transition: width .3s ease; }
.fl-prompt { text-align: left; width: 100%; cursor: pointer; transition: transform .2s cubic-bezier(.2,.9,.3,1.3); }
.fl-prompt:hover { transform: translateY(-3px) rotate(-.4deg); }
.fl-prompt:active { transform: scale(.985); }
.fl-prompt:focus-visible, .fl-hero-tap:focus-visible { outline: 3px solid var(--lv-a2); outline-offset: 3px; }
@keyframes fl-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
.fl-bob { display: inline-block; animation: fl-bob 1.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fl-bob { animation: none; } .fl-prompt, .fl-seg > i { transition: none; } }
`;

export default function ProfileScreen({ name, age, tagline, photos, cardCount, reduced, onBegin }: ProfileScreenProps) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const n = photos.length;
  const first = (name || "they").trim().split(/\s+/)[0] || "they";

  const go = useCallback((d: number) => setI((x) => (n ? (x + d + n) % n : 0)), [n]);

  // Keyboard: Enter / ↑ begins, ← → flip photos. Ignored while typing in the
  // edit sheet or while the big photo is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || open !== null) return;
      if (e.key === "Enter" || e.key === "ArrowUp") {
        e.preventDefault();
        onBegin();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBegin, go, open]);

  // Horizontal swipe on the carousel; a tap picks a side.
  const down = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const s = down.current;
    down.current = null;
    if (!s || n < 2) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      go(e.clientX - r.left < r.width * 0.35 ? -1 : 1);
    }
  };

  const cur = photos[i];
  const flag = photoFlag(i);

  return (
    <div style={{ flex: 1, width: "100%", position: "relative" }}>
      <style>{PROFILE_CSS}</style>
      <div className="fl-prof">
        {/* ── hero carousel ─────────────────────────────────────────────── */}
        <div className="fl-prof-hero">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontFamily: GROTESK, fontSize: 12.5, fontWeight: 700, color: V.ink }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: "var(--fl-green)", boxShadow: "0 0 10px var(--fl-green)" }} />
              1 profile near you
            </span>
            <span style={{ fontFamily: GROTESK, fontSize: 12, fontWeight: 700, color: V.soft }}>0.0 km away 📍</span>
          </div>

          <div
            onPointerDown={onDown}
            onPointerUp={onUp}
            style={{
              position: "relative",
              aspectRatio: "4 / 5",
              borderRadius: 30,
              overflow: "hidden",
              background: V.paper,
              boxShadow: `0 30px 70px -30px ${V.shadow}, 0 0 0 1px ${V.edge}`,
              touchAction: "pan-y",
              userSelect: "none",
              WebkitUserSelect: "none",
              cursor: n > 1 ? "pointer" : "default",
            }}
          >
            {cur ? (
              <div key={i} className={reduced ? undefined : "lv-pop"} style={{ position: "absolute", inset: 0 }}>
                <Photo photo={cur} alt={cur.caption || `${first}'s photo ${i + 1}`} eager={i === 0} />
              </div>
            ) : (
              <Initials name={name} />
            )}

            {/* scrims */}
            <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 50%, rgba(0,0,0,.78) 100%)", pointerEvents: "none" }} />

            {/* story bars */}
            {n > 1 && (
              <div aria-hidden style={{ position: "absolute", top: 12, left: 14, right: 14, display: "flex", gap: 5 }}>
                {photos.map((_, k) => (
                  <span key={k} className="fl-seg">
                    <i style={{ width: k <= i ? "100%" : "0%" }} />
                  </span>
                ))}
              </div>
            )}

            {cur && (
              <FlagSticker color={PHOTO_FLAG_VAR[flag]} rotate={flag === "red" ? 5 : -5} size={13} style={{ position: "absolute", top: 32, left: 16 }}>
                {PHOTO_FLAG_LABEL[flag]}
              </FlagSticker>
            )}

            {cur && (
              <button
                type="button"
                className="fl-hero-tap"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={() => setOpen(i)}
                aria-label="Open this memory"
                style={{ position: "absolute", top: 26, right: 12, width: 40, height: 40, borderRadius: 99, border: "none", display: "grid", placeItems: "center", background: "rgba(0,0,0,.38)", color: "#fff", cursor: "pointer" }}
              >
                <Expand size={17} />
              </button>
            )}

            <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, color: "#fff", pointerEvents: "none" }}>
              <h1 style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(32px, 9vw, 42px)", lineHeight: 1, letterSpacing: "-0.035em", textShadow: "0 4px 24px rgba(0,0,0,.35)" }}>
                {name || "Someone"}
                <span style={{ fontWeight: 500, opacity: 0.86 }}>, {age}</span>
                <span aria-label="verified" style={{ display: "inline-grid", placeItems: "center", width: 24, height: 24, marginLeft: 8, verticalAlign: "middle", borderRadius: 99, background: "var(--fl-green)", color: "var(--fl-on)", fontSize: 14, fontWeight: 900, letterSpacing: 0 }}>
                  ✓
                </span>
              </h1>
              {cur?.caption && (
                <p style={{ margin: "9px 0 0", display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(255,255,255,.22)", fontFamily: GROTESK, fontSize: 13, fontWeight: 700, maxWidth: "100%" }}>
                  📸 {cur.caption}
                </p>
              )}
            </div>
          </div>

          {n > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="lv-ghost lv-focus" style={roundBtn}>
                <ChevronLeft size={18} />
              </button>
              <span style={{ alignSelf: "center", fontFamily: GROTESK, fontSize: 12.5, fontWeight: 700, color: V.soft, minWidth: 64, textAlign: "center" }}>
                {i + 1} of {n} pics
              </span>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className="lv-ghost lv-focus" style={roundBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── about + prompts ───────────────────────────────────────────── */}
        <div className="fl-prof-side">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[`🎂 ${age}`, "📍 near you", `🚩 ${cardCount} flags to judge`, n ? `📸 ${n} memories` : "💌 1 letter"].map((c) => (
              <span key={c} style={{ padding: "8px 13px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, fontFamily: GROTESK, fontSize: 13, fontWeight: 700, color: V.ink }}>
                {c}
              </span>
            ))}
          </div>

          {tagline && (
            <div style={{ ...card, padding: "18px 20px 20px" }}>
              <p style={eyebrow}>about me</p>
              <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(23px, 6vw, 28px)", lineHeight: 1.15, color: V.paperInk, overflowWrap: "anywhere" }}>{tagline}</p>
            </div>
          )}

          <div style={{ ...card, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
            <span aria-hidden style={{ fontSize: 28 }} className={reduced ? undefined : "fl-bob"}>
              👆
            </span>
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 14.5, lineHeight: 1.4, color: V.paperInk }}>
              <b>how this works:</b> {first} wrote {cardCount} cards about their own habits. swipe <b style={{ color: "var(--fl-red)" }}>← red flag</b>, <b style={{ color: "var(--fl-green)" }}>green flag →</b> or <b style={{ color: "var(--fl-beige)" }}>↑ beige</b>. every swipe gets a reply.
            </p>
          </div>

          {photos.map((p, k) => {
            if (!p.note && !p.caption) return null;
            const f = photoFlag(k);
            return (
              <button key={k} type="button" className="fl-prompt" onClick={() => setOpen(k)} aria-label={`Open memory ${k + 1}`} style={{ ...card, padding: 0, overflow: "hidden", border: `1px solid ${V.edge}`, display: "block" }}>
                <div style={{ padding: "18px 20px 16px" }}>
                  <p style={eyebrow}>{PROMPTS[k % PROMPTS.length]}</p>
                  <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(21px, 5.4vw, 25px)", lineHeight: 1.18, color: V.paperInk, overflowWrap: "anywhere" }}>
                    {p.note || p.caption}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px 12px", borderTop: `1px dashed ${V.edge}` }}>
                  <span style={{ position: "relative", width: 40, height: 50, borderRadius: 10, overflow: "hidden", flex: "0 0 auto", background: V.edge }}>
                    <Photo photo={p} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: GROTESK, fontSize: 13, fontWeight: 700, color: V.paperSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.caption || `memory #${k + 1}`}
                  </span>
                  <FlagSticker color={PHOTO_FLAG_VAR[f]} rotate={0} size={11}>
                    {PHOTO_FLAG_LABEL[f]}
                  </FlagSticker>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── the CTA, always in reach ────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          padding: "30px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
          background: `linear-gradient(180deg, transparent, color-mix(in srgb, ${V.base} 94%, transparent) 50%)`,
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          onClick={onBegin}
          className="lv-cta lv-focus"
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            maxWidth: 430,
            margin: "0 auto",
            minHeight: 58,
            borderRadius: 999,
            border: "none",
            background: V.grad,
            color: "#fff",
            fontFamily: GROTESK,
            fontWeight: 800,
            fontSize: 17.5,
            letterSpacing: "-0.01em",
            cursor: "pointer",
            boxShadow: `0 18px 40px -16px color-mix(in srgb, ${V.a1} 85%, transparent), inset 0 -3px 0 rgba(0,0,0,.14)`,
          }}
        >
          start judging {first} <span aria-hidden>🚩💚</span>
        </button>
      </div>

      {open !== null && photos[open] && <MemoryLightbox photos={photos} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

const roundBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 99,
  border: `1px solid ${V.edge}`,
  background: V.glass,
  color: V.ink,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const card: React.CSSProperties = {
  background: V.paper,
  borderRadius: 24,
  boxShadow: `0 18px 44px -28px ${V.shadow}`,
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: GROTESK,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: V.a1,
};

// ─── The big photo ───────────────────────────────────────────────────────────

export function MemoryLightbox({ photos, start, onClose }: { photos: LovePhoto[]; start: number; onClose: () => void }) {
  const [k, setK] = useState(start);
  const n = photos.length;
  const go = useCallback((d: number) => setK((x) => (x + d + n) % n), [n]);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const sx = useRef<number | null>(null);
  const p = photos[k];
  const f = photoFlag(k);
  const ghost: React.CSSProperties = { ...roundBtn, background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", width: 48, height: 48 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Memory"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(8,6,14,.88)", display: "grid", placeItems: "center", padding: "calc(env(safe-area-inset-top, 0px) + 64px) 16px calc(env(safe-area-inset-bottom, 0px) + 20px)", overflowY: "auto" }}
    >
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="lv-focus" style={{ position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 12px)", right: 14, width: 44, height: 44, borderRadius: 99, border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.12)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 2 }}>
        <X size={20} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => (sx.current = e.clientX)}
        onPointerUp={(e) => {
          if (sx.current === null || n < 2) return;
          const dx = e.clientX - sx.current;
          sx.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
        className="lv-pop"
        key={k}
        style={{ width: "100%", maxWidth: 440, display: "grid", gap: 12, touchAction: "pan-y" }}
      >
        <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 26, overflow: "hidden", background: "#111", boxShadow: "0 30px 80px -20px rgba(0,0,0,.8)", justifySelf: "center", width: "min(100%, calc(60dvh * 0.8))" }}>
          <Photo photo={p} alt={p.caption || `Memory ${k + 1}`} eager />
          <FlagSticker color={PHOTO_FLAG_VAR[f]} rotate={-6} size={14} style={{ position: "absolute", top: 14, left: 14 }}>
            {PHOTO_FLAG_LABEL[f]}
          </FlagSticker>
          {n > 1 && (
            <span style={{ position: "absolute", top: 14, right: 14, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,.5)", color: "#fff", fontFamily: GROTESK, fontSize: 12, fontWeight: 800 }}>
              {k + 1}/{n}
            </span>
          )}
        </div>

        <div style={{ background: V.paper, borderRadius: 22, padding: "16px 18px 18px" }}>
          <p style={eyebrow}>{PROMPTS[k % PROMPTS.length]}</p>
          <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 24, lineHeight: 1.18, color: V.paperInk, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {p.note || p.caption || "no caption needed. look at us."}
          </p>
          {p.caption && p.note && <p style={{ margin: "10px 0 0", fontFamily: GROTESK, fontSize: 13, fontWeight: 700, color: V.paperSoft }}>📸 {p.caption}</p>}
        </div>

        {n > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button type="button" onClick={() => go(-1)} aria-label="Previous memory" className="lv-focus" style={ghost}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next memory" className="lv-focus" style={ghost}>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
