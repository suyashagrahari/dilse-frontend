"use client";

// ─── Kundli Milan — the whole template ───────────────────────────────────────
//
// Three screens: birth particulars → the computation → the report (with the
// 9:16 share card as a second view of the same data).
//
// `computeKundliReport` is called ONCE per data object and memoised. Nothing in
// this tree derives a score, calls Math.random, or reads the clock; every
// visual imperfection comes from `@/lib/seededRandom` keyed off the report
// seed, so the screen and the exported PNG always agree.
//
// The report is paper. All six animated assets live in the surrounding UI and
// none of them is ever inside a node passed to `exportNodeToPng`.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Loader2 } from "lucide-react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { templateMediaBase } from "@/lib/templateMedia";
import ComputationSequence from "./ComputationSequence";
import InputScreen from "./InputScreen";
import ReportPaper, { type HouseTap } from "./ReportPaper";
import ShareCard from "./ShareCard";
import {
  computeKundliReport,
  type KundliData,
  type KundliMilanTemplateProps,
  type Person,
} from "./types";
import {
  CARD_H,
  CARD_W,
  ChipText,
  DOC_W,
  FloatingChip,
  INK,
  MAROON,
  MONO,
  PAPER,
  SAFFRON,
  SERIF,
  SOFT_INK,
  UIFONT,
  plainButton,
  usePrefersReducedMotion,
  type ChipAnchor,
} from "./ui";

const ASSET = templateMediaBase("kundli-milan");

type Phase = "input" | "computing" | "report";
type View = "report" | "card";

/** Gutter needed before a chip can sit beside the block that triggered it. */
const GUTTER = 118;

export default function KundliMilanTemplate({ data, mode, shareId, hasPassword }: KundliMilanTemplateProps) {
  void shareId;
  void hasPassword;

  const reduced = usePrefersReducedMotion();

  // ── data ───────────────────────────────────────────────────────────────────
  // The input screen may override the two people locally; everything else
  // (readings, remedies, astrologer, issue date) always comes from the sender.
  const [override, setOverride] = useState<{ groom: Person; bride: Person } | null>(null);
  const effective: KundliData = useMemo(
    () => (override ? { ...data, ...override } : data),
    [data, override],
  );
  /** The single call. Everything rendered below is read off this object. */
  const report = useMemo(() => computeKundliReport(effective), [effective]);

  // ── screens ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>(mode === "live" ? "computing" : "input");
  const [view, setView] = useState<View>("report");

  // When the sender saves new data, drop any local override and replay the
  // computation so the preview lands on the new report. Adjusting state during
  // render (rather than in an effect) is the documented pattern for this and
  // avoids a wasted paint of the stale report.
  const dataKey = JSON.stringify(data);
  const [seenDataKey, setSeenDataKey] = useState(dataKey);
  if (dataKey !== seenDataKey) {
    setSeenDataKey(dataKey);
    setOverride(null);
    setView("report");
    setPhase("computing");
  }

  // ── fit-to-viewport scaling. Fixed pixel width, scaled — never reflowed. ───
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const cardExportRef = useRef<HTMLDivElement | null>(null);
  const mangalRef = useRef<HTMLDivElement | null>(null);
  const remediesRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [cardScale, setCardScale] = useState(1);
  const [docH, setDocH] = useState(1200);

  useEffect(() => {
    const calc = () => {
      const avail = Math.min(window.innerWidth - 24, 560);
      setScale(Math.max(0.5, Math.min(avail / DOC_W, 1.15)));
      const cw = Math.min(window.innerWidth - 32, 420);
      const ch = window.innerHeight - 210;
      setCardScale(Math.max(0.42, Math.min(cw / CARD_W, ch / CARD_H, 1)));
    };
    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("orientationchange", calc);
    };
  }, []);

  // The report grows with the remedies list, so measure rather than guess —
  // the exported PNG height has to match what is on screen exactly.
  useEffect(() => {
    if (phase !== "report" || view !== "report") return;
    const el = reportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDocH(el.offsetHeight));
    ro.observe(el);
    setDocH(el.offsetHeight);
    return () => ro.disconnect();
  }, [phase, view, report.seed]);

  // ── surrounding-UI reactions ───────────────────────────────────────────────
  const [houseTap, setHouseTap] = useState<HouseTap | null>(null);
  const [yoniOpen, setYoniOpen] = useState(false);
  const [relief, setRelief] = useState<{ anchor: ChipAnchor | null } | null>(null);
  const [chai, setChai] = useState<{ anchor: ChipAnchor | null } | null>(null);
  // Each chip fires once per report. Storing the seed rather than a boolean
  // means a re-match re-arms them without anyone having to remember to reset.
  const reliefSeen = useRef<string | null>(null);
  const chaiSeen = useRef<string | null>(null);

  useEffect(() => {
    if (!houseTap) return;
    const t = setTimeout(() => setHouseTap(null), 3800);
    return () => clearTimeout(t);
  }, [houseTap]);

  const anchorFor = useCallback((el: HTMLElement): ChipAnchor | null => {
    const root = rootRef.current;
    if (!root) return null;
    const r = el.getBoundingClientRect();
    if (window.innerWidth - r.right < GUTTER) return null; // phone — use the corner
    const rr = root.getBoundingClientRect();
    return { top: r.top - rr.top, left: r.right - rr.left + 12 };
  }, []);

  // Both chips fire the first time their block scrolls into view, then retire.
  useEffect(() => {
    if (phase !== "report" || view !== "report") return;
    const seed = report.seed;
    const watch = (
      el: HTMLElement | null,
      seen: React.RefObject<string | null>,
      show: (v: { anchor: ChipAnchor | null } | null) => void,
    ) => {
      if (!el || seen.current === seed) return () => {};
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting) || seen.current === seed) return;
          seen.current = seed;
          show({ anchor: anchorFor(el) });
          setTimeout(() => show(null), 5200);
          io.disconnect();
        },
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch(mangalRef.current, reliefSeen, setRelief);
    const b = watch(remediesRef.current, chaiSeen, setChai);
    return () => {
      a();
      b();
    };
  }, [phase, view, anchorFor, report.seed]);

  // ── exports ────────────────────────────────────────────────────────────────
  const [busy, setBusy] = useState<null | View>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [cardStaging, setCardStaging] = useState(false);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2800);
    return () => clearTimeout(t);
  }, [status]);

  const slug = fileSlug(report.reportNo, "report");

  const downloadReport = useCallback(async () => {
    if (busy) return;
    setBusy("report");
    const node = reportRef.current;
    const res = await exportNodeToPng(node, {
      width: DOC_W,
      height: node ? node.offsetHeight : docH,
      filename: `kundli-${slug}.png`,
      backgroundColor: PAPER,
    });
    setStatus(res.message);
    setBusy(null);
  }, [busy, docH, slug]);

  const downloadCard = useCallback(async () => {
    if (busy) return;
    setBusy("card");
    // Stage a copy with the looping asset removed — a <video> inside the
    // captured node serialises as a blank box.
    setCardStaging(true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const res = await exportNodeToPng(cardExportRef.current, {
      width: CARD_W,
      height: CARD_H,
      filename: `kundli-card-${slug}.png`,
      backgroundColor: PAPER,
    });
    setCardStaging(false);
    setStatus(res.message);
    setBusy(null);
  }, [busy, slug]);

  // ── render ─────────────────────────────────────────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: SERIF,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    padding: "0 16px",
    minHeight: 44,
    background: active ? INK : "transparent",
    color: active ? PAPER : INK,
    border: `1px solid ${INK}`,
    borderRadius: 0,
    cursor: "pointer",
  });

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        minHeight: "100dvh",
        background:
          "radial-gradient(120% 80% at 50% -8%, #f3ece0 0%, #ebe3d5 46%, #ded5c4 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "68px 8px 86px",
        boxSizing: "border-box",
      }}
    >
      {/* The recipient's "create your own" path — fixed top-right, per the flow contract. */}
      {mode === "live" && (
        <Link
          href="/templates"
          className="fixed top-3 right-3 z-[120] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
          style={{
            background: "rgba(255,255,255,.92)",
            color: "#5646C9",
            border: "1px solid #ECEAE3",
            backdropFilter: "blur(8px)",
          }}
        >
          <Image src="/logo.webp" alt="" width={18} height={18} style={{ borderRadius: 5 }} />
          SubhSandesh
        </Link>
      )}

      {phase === "input" && (
        <InputScreen
          initialGroom={effective.groom}
          initialBride={effective.bride}
          reduced={reduced}
          onSubmit={(groom, bride) => {
            setOverride({ groom, bride });
            setView("report");
            setPhase("computing");
          }}
        />
      )}

      {phase === "computing" && (
        <ComputationSequence report={report} reduced={reduced} onDone={() => setPhase("report")} />
      )}

      {phase === "report" && (
        <>
          {view === "report" ? (
            <div style={{ width: DOC_W * scale, height: docH * scale, position: "relative" }}>
              <div
                style={{
                  width: DOC_W,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  // A printed sheet sits on something. Outside the export node.
                  boxShadow: "0 18px 44px -20px rgba(46,38,20,.5), 0 2px 6px rgba(46,38,20,.14)",
                }}
              >
                <div ref={reportRef} style={{ width: DOC_W }}>
                  <ReportPaper
                    data={effective}
                    report={report}
                    uid="km"
                    mangalRef={mangalRef}
                    remediesRef={remediesRef}
                    onHouseTap={setHouseTap}
                    onYoniTap={() => setYoniOpen(true)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ width: CARD_W * cardScale, height: CARD_H * cardScale, position: "relative" }}>
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  transform: `scale(${cardScale})`,
                  transformOrigin: "top left",
                  boxShadow: "0 18px 44px -20px rgba(46,38,20,.5), 0 2px 6px rgba(46,38,20,.14)",
                }}
              >
                <ShareCard data={effective} report={report} withMedia={!reduced} />
              </div>
            </div>
          )}

          {/* Controls — never on the paper. */}
          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            <button type="button" onClick={() => setView("report")} style={tabStyle(view === "report")}>
              Report
            </button>
            <button type="button" onClick={() => setView("card")} style={tabStyle(view === "card")}>
              Share card
            </button>
            <button
              type="button"
              onClick={view === "report" ? downloadReport : downloadCard}
              disabled={busy !== null}
              style={{
                ...plainButton,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                letterSpacing: 1.6,
                padding: "0 16px",
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {busy ? "Preparing" : view === "report" ? "Download report" : "Download card"}
            </button>
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {mode === "demo" && (
              <button
                type="button"
                onClick={() => setPhase("input")}
                style={{
                  fontFamily: SERIF,
                  fontSize: 11.5,
                  color: SOFT_INK,
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  minHeight: 44,
                  cursor: "pointer",
                }}
              >
                ← Change the birth details
              </button>
            )}
            {mode === "live" && (
              <Link
                href="/templates"
                style={{
                  fontFamily: UIFONT,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#5B5B66",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  lineHeight: "44px",
                }}
              >
                Match your own kundli →
              </Link>
            )}
          </div>

          {status && (
            <div style={{ marginTop: 6, fontFamily: SERIF, fontSize: 11, color: SOFT_INK }}>{status}</div>
          )}
        </>
      )}

      {/* ── floating reactions: surrounding UI, never on the paper ───────────── */}

      {relief && (
        <FloatingChip anchor={relief.anchor}>
          {reduced ? (
            <span aria-hidden style={{ fontSize: 22, lineHeight: 1, width: 30, textAlign: "center" }}>
              😮‍💨
            </span>
          ) : (
            // Animated WebP — will not play inside a <video> tag.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${ASSET}/relief.webp`} alt="" width={34} height={34} style={{ width: 34, height: 34 }} />
          )}
          <ChipText>Dosha cancelled. Everyone exhale.</ChipText>
        </FloatingChip>
      )}

      {chai && (
        <FloatingChip anchor={chai.anchor} offset={relief ? 62 : 0}>
          {reduced ? (
            <span aria-hidden style={{ fontSize: 22, lineHeight: 1, width: 30, textAlign: "center" }}>
              ☕
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${ASSET}/remedy-chai.webp`} alt="" width={34} height={34} style={{ width: 34, height: 34 }} />
          )}
          <ChipText>Upaya no. 1 begins with chai.</ChipText>
        </FloatingChip>
      )}

      {houseTap && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 18,
            transform: "translateX(-50%)",
            zIndex: 130,
            maxWidth: "calc(100vw - 24px)",
            background: PAPER,
            border: `1px solid ${INK}`,
            padding: "8px 14px",
            fontFamily: SERIF,
            fontSize: 12,
            lineHeight: 1.35,
            boxShadow: "0 10px 26px -14px rgba(46,38,20,.6)",
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11 }}>{houseTap.who}</span> · House{" "}
          <span style={{ fontFamily: MONO, fontSize: 11 }}>{houseTap.house}</span> — {houseTap.meaning}
          {houseTap.planets.length > 0 && (
            <>
              {" · "}
              <span style={{ fontFamily: MONO, fontSize: 11 }}>{houseTap.planets.join(" ")}</span>
            </>
          )}
        </div>
      )}

      {yoniOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Yoni Koota"
          onClick={() => setYoniOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 140,
            background: "rgba(30,24,14,.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 320,
              background: PAPER,
              border: `1px solid ${INK}`,
              padding: 16,
              textAlign: "center",
            }}
          >
            {reduced ? (
              <div aria-hidden style={{ fontSize: 40, lineHeight: 1 }}>
                🐒
              </div>
            ) : (
              <video
                src={`${ASSET}/yoni-clash.webm`}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden
                style={{ width: 132, height: 132, objectFit: "contain", margin: "0 auto", display: "block" }}
              />
            )}
            {(() => {
              const y = report.kootas.find((k) => k.name === "yoni");
              if (!y) return null;
              return (
                <>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 12,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      marginTop: 8,
                    }}
                  >
                    Yoni Koota · {y.obtained} / {y.max}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 15, marginTop: 6 }}>
                    {y.groomAttr} &nbsp;·&nbsp; {y.brideAttr}
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      marginTop: 8,
                      color: "#6b4a2a",
                    }}
                  >
                    {y.reading}
                  </div>
                </>
              );
            })()}
            <button
              type="button"
              onClick={() => setYoniOpen(false)}
              style={{ ...plainButton, marginTop: 14, fontSize: 12, width: "100%" }}
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* Off-screen capture copy of the card: identical, minus the looping asset. */}
      {cardStaging && (
        <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }} aria-hidden>
          <div ref={cardExportRef}>
            <ShareCard data={effective} report={report} withMedia={false} />
          </div>
        </div>
      )}

      {/* A quiet mark of the issuing office, for the demo preview only. */}
      {mode === "demo" && phase !== "input" && (
        <div
          style={{
            position: "fixed",
            left: 12,
            bottom: 12,
            fontFamily: SERIF,
            fontSize: 9.5,
            letterSpacing: 1,
            color: SAFFRON,
            opacity: 0.75,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span style={{ color: MAROON }}>·</span> Registrar of Hearts
        </div>
      )}
    </div>
  );
}
