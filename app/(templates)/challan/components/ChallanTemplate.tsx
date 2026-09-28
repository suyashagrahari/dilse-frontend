"use client";

// ─── Challan — the screen orchestrator ───────────────────────────────────────
//
// A challan is not a document you read, it is one you SETTLE. This component
// owns the whole arc:
//
//   lookup → notice → (payment | contest) → evidence → order
//
//   lookup    the Heart Traffic e-challan portal ("1 challan found.")
//   notice    the e-challan itself, with a live countdown
//   payment   settle it (receipt + PAID stamp + the sincere paid message)
//   contest   fight it (verdict + OBJECTION UPHELD + the contest message)
//   evidence  the CCTV control room: the sender's photos as camera footage,
//             each opening an evidence file with the officer's observation
//   order     the court order: the main letter as the officer's personal
//             remarks, sealed behind one question, stamped LOVE WINS
//
// Evidence and order are skipped when there are no photos / no letter, so an
// old page (made before the love kit) plays exactly the flow it always did.
//
// ── THE COUNTDOWN ────────────────────────────────────────────────────────────
//   1. It never goes negative — past the due date it stops at zero: OVERDUE.
//   2. Crossing zero live flips to OVERDUE without a refresh.
//   3. It is computed on the client only (first paint prints an em dash), so
//      the server and the browser never disagree on it.
// The interval stops while the tab is hidden.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { BrandBadge, GradText, GROTESK, ITALIC, LOVE_CSS, LoveSky, LoveThemeContext, Sticker, ThemeDock } from "../../_love/LoveKit";
import { V, pickTheme, themeVars } from "../../_love/theme";
import { ChallanNotice } from "./ChallanNotice";
import ContestFlow from "./ContestFlow";
import CourtOrder from "./CourtOrder";
import EvidenceRoom from "./EvidenceRoom";
import { useReducedMotion, type NextAction } from "./flowKit";
import { LookupScreen } from "./LookupScreen";
import PaymentFlow from "./PaymentFlow";
import { CH_SCANLINES } from "./theme";
import { CHALLAN_THEMES, challanVars } from "./themes";
import type { ChallanData, ChallanScreen } from "./types";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, "0");

function formatRemaining(ms: number): string {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / DAY);
  const h = Math.floor((clamped % DAY) / HOUR);
  const m = Math.floor((clamped % HOUR) / MIN);
  const s = Math.floor((clamped % MIN) / SEC);
  const clock = `${pad(h)}:${pad(m)}:${pad(s)}`;
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ${clock} remaining`;
  return `${clock} remaining`;
}

const firstName = (n: string): string => {
  const w = n.trim().split(/\s+/)[0] ?? "";
  return w ? w[0].toUpperCase() + w.slice(1) : "";
};

/** Layout + the template's own little animations. Every one stops under reduced motion. */
const CH_CSS = `
.ch-wrap { position: relative; width: 100%; margin: 0 auto; padding-left: 16px; padding-right: 16px; box-sizing: border-box; }
.ch-wall { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ch-tile { grid-column: span var(--ms); aspect-ratio: var(--ma); }
@media (min-width: 820px) {
  .ch-wall { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .ch-tile { grid-column: span var(--ds); aspect-ratio: var(--da); }
}
.ch-feed-img { transition: filter .5s ease, transform .5s ease !important; }
.ch-tile:hover .ch-feed-img { filter: none !important; }
.ch-scan { background: ${CH_SCANLINES.replace(/\.04/g, ".22")}; mix-blend-mode: multiply; pointer-events: none; }
.ch-scan-soft { opacity: .45; }
@keyframes ch-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: .15 } }
.ch-rec { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ff2e4a; box-shadow: 0 0 8px #ff2e4a; animation: ch-blink 1.2s steps(1) infinite; }
@keyframes ch-siren { 0%, 100% { background: var(--ch-siren-a); box-shadow: 0 0 10px var(--ch-siren-a) } 50% { background: var(--ch-siren-b); box-shadow: 0 0 10px var(--ch-siren-b) } }
.ch-siren-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; animation: ch-siren 1s steps(1) infinite; }
@keyframes ch-bar-a { 0%, 100% { opacity: 1 } 50% { opacity: .15 } }
@keyframes ch-bar-b { 0%, 100% { opacity: .15 } 50% { opacity: 1 } }
.ch-siren-a { animation: ch-bar-a 1.1s ease-in-out infinite; }
.ch-siren-b { animation: ch-bar-b 1.1s ease-in-out infinite; }
@keyframes ch-scanbar { from { width: 4% } to { width: 100% } }
.ch-scanbar { width: 100%; animation: ch-scanbar 1.6s cubic-bezier(.3,.7,.4,1) both; }
@keyframes ch-spin { to { transform: rotate(360deg) } }
.ch-spin { animation: ch-spin .9s linear infinite; transform-origin: 50% 50%; }
.ch-stripe { background: repeating-linear-gradient(135deg, var(--ch-siren-a) 0 14px, var(--lv-paper) 14px 20px, var(--ch-siren-b) 20px 34px, var(--lv-paper) 34px 40px); }
@keyframes ch-line { from { opacity: 0; transform: translateY(12px); filter: blur(3px) } to { opacity: 1; transform: none; filter: none } }
.ch-line { animation: ch-line .7s cubic-bezier(.2,.9,.3,1) both; }
@media (prefers-reduced-motion: reduce) {
  .ch-rec, .ch-siren-dot, .ch-siren-a, .ch-siren-b, .ch-scanbar, .ch-spin, .ch-line { animation: none !important; opacity: 1 !important; }
}
`;

/** The police-light strip across the very top of the page. */
function SirenBar() {
  return (
    <div aria-hidden style={{ position: "fixed", left: 0, right: 0, top: 0, height: 4, zIndex: 110, display: "flex", pointerEvents: "none" }}>
      <span className="ch-siren-a" style={{ flex: 1, background: "var(--ch-siren-a)", boxShadow: "0 0 18px 3px var(--ch-siren-a)" }} />
      <span className="ch-siren-b" style={{ flex: 1, background: "var(--ch-siren-b)", boxShadow: "0 0 18px 3px var(--ch-siren-b)" }} />
    </div>
  );
}

export function ChallanTemplate({
  data,
  capture = false,
  mode = "preview",
  onThemeChange,
}: {
  data: ChallanData;
  /** Export mode: no lookup screen, no animation, the notice only. */
  capture?: boolean;
  mode?: "preview" | "live";
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}) {
  const live = mode === "live";
  const theme = pickTheme(CHALLAN_THEMES, data.theme);
  const reduceMotion = useReducedMotion();
  const [screen, setScreen] = useState<ChallanScreen>(capture ? "notice" : "lookup");
  const [settled, setSettled] = useState<null | "paid" | "contested">(null);

  const dueMs = useMemo(() => {
    const t = Date.parse(data.dueAt);
    return Number.isFinite(t) ? t : null;
  }, [data.dueAt]);

  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (dueMs === null || capture) return;
    const tick = () => setRemainingMs(dueMs - Date.now());
    const start = () => {
      if (timerRef.current !== null) return;
      tick();
      timerRef.current = setInterval(tick, SEC);
    };
    const stop = () => {
      if (timerRef.current === null) return;
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [dueMs, capture]);

  const overdue = dueMs !== null && remainingMs !== null && remainingMs <= 0;
  const remaining = remainingMs === null ? "—" : formatRemaining(remainingMs);

  // Every act starts at the top of the page.
  const go = useCallback((s: ChallanScreen) => {
    setScreen(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const hasPhotos = data.photos.length > 0;
  const hasLetter = data.letter.trim().length > 0;
  const replay: NextAction = { label: "↺ Replay the whole case", onClick: () => { setSettled(null); go("lookup"); } };
  const toOrder: NextAction | null = hasLetter ? { label: "⚖️ Hear the final order", onClick: () => go("order") } : null;
  const afterSettle: NextAction = hasPhotos ? { label: "📹 Review the CCTV footage", onClick: () => go("evidence") } : toOrder ?? replay;
  const afterEvidence: NextAction = toOrder ?? replay;

  const onFound = useCallback(() => go("notice"), [go]);
  const onPay = useCallback(() => go("payment"), [go]);
  const onContest = useCallback(() => go("contest"), [go]);
  const onBack = useCallback(() => go("notice"), [go]);
  const onPaid = useCallback(() => setSettled("paid"), []);
  const onContested = useCallback(() => setSettled("contested"), []);

  const first = firstName(data.accused.name);

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        className={`${DATE_FONT_VARS} lv-root`}
        style={{ ...themeVars(theme), ...challanVars(theme), minHeight: "100dvh", position: "relative", isolation: "isolate", overflowX: "clip", color: V.ink, background: theme.colors.base, fontFamily: GROTESK }}
      >
        <style>{LOVE_CSS + CH_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduceMotion} />
        {!capture && <SirenBar />}

        {live && <BrandBadge />}
        {!live && onThemeChange && <ThemeDock themes={CHALLAN_THEMES} value={theme.id} onChange={onThemeChange} />}

        <main style={{ position: "relative", zIndex: 1, paddingTop: capture ? 16 : "calc(76px + env(safe-area-inset-top, 0px))", paddingBottom: 56 }}>
          {screen === "lookup" && <LookupScreen challanNo={data.challanNo} vehicleNo={data.accused.vehicleNo} onFound={onFound} />}

          {screen === "notice" && (
            <div className="ch-wrap" style={{ maxWidth: 520 }}>
              {!capture && (
                <header className="lv-pop" style={{ textAlign: "center", marginBottom: 18 }}>
                  <Sticker tilt={-3} style={{ background: "var(--ch-red)", color: "#fff" }}>
                    🚨 {settled ? "case settled" : overdue ? "overdue" : "1 challan found"}
                  </Sticker>
                  <h1 style={{ margin: "14px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(32px, 8.6vw, 54px)", lineHeight: 0.98, letterSpacing: "-0.045em", color: V.ink }}>
                    {first ? <>{first}, you&apos;ve been </> : <>You&apos;ve been </>}
                    <GradText>caught</GradText> 📸
                  </h1>
                  <p style={{ margin: "10px auto 0", maxWidth: 400, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.3, color: V.soft }}>
                    {data.offences.length} offence{data.offences.length === 1 ? "" : "s"} on record
                    {hasPhotos ? `, ${data.photos.length} CCTV frame${data.photos.length === 1 ? "" : "s"} on file` : ""}. Pay it, or fight it.
                  </p>
                </header>
              )}
              <ChallanNotice data={data} overdue={overdue} remaining={remaining} onPay={onPay} onContest={onContest} paid={settled === "paid"} capture={capture} />
              {settled && (
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                  <button type="button" onClick={afterSettle.onClick} className="lv-focus" style={{ minHeight: 48, padding: "0 20px", borderRadius: 999, border: `1.5px solid ${V.edge}`, background: V.glass, color: V.ink, fontFamily: GROTESK, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                    {afterSettle.label} →
                  </button>
                </div>
              )}
            </div>
          )}

          {screen === "payment" && <PaymentFlow data={data} onDone={onPaid} onBack={onBack} next={afterSettle} gif={data.gifs[0]} />}
          {screen === "contest" && <ContestFlow data={data} onDone={onContested} onBack={onBack} next={afterSettle} gif={data.gifs[0]} />}
          {screen === "evidence" && <EvidenceRoom data={data} gif={data.gifs[1]} next={afterEvidence} reduceMotion={reduceMotion} />}
          {screen === "order" && <CourtOrder data={data} gif={data.gifs[2] ?? data.gifs[0]} next={replay} reduceMotion={reduceMotion} />}
        </main>
      </div>
    </LoveThemeContext.Provider>
  );
}

export default ChallanTemplate;
