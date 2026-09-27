"use client";

// ─── Legal Notice — served by the lawyer of love ─────────────────────────────
//
// A funny, romantic legal notice, told as a little show:
//
//   served    (landing) a stamp slaps down — "YOU'VE BEEN SERVED" — with the
//             stare GIF, and one button to open the notice.
//   story     then full-screen chapters that move on by themselves once each
//             is done: the notice (lifecycle stamp + countdown) → the facts,
//             one card at a time → the demands (accept / object) → the evidence
//             (a photo deck) → the letter, locked behind a question → the
//             verdict with the certified copy to download. Each sender GIF is
//             used once, as a reaction at one of those moments.
//
// Colours come from the chosen theme (./themes) as CSS variables. The paper
// document itself (NoticePaper) is untouched and lives in the verdict chapter,
// because that is the node exported to PNG.
//
// Responses: the addressee answers each demand (accept / contest with grounds /
// mark complied). A response paints instantly and is POSTed to
// `/legal-notice-pages/share/:shareId/respond` on the served page; the preview
// keeps it local.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { API_URL, IS_NGROK } from "@/lib/config";
import { templateMediaBase } from "@/lib/templateMedia";
import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import useReducedMotion from "../../date-invitation/components/useReducedMotion";
import {
  BrandBadge,
  CandyButton,
  Eyebrow,
  GhostButton,
  Glass,
  GradText,
  GROTESK,
  HeartBurst,
  ITALIC,
  LOVE_CSS,
  LoveSky,
  LoveThemeContext,
  Sticker,
  ThemeDock,
  ThemeScope,
} from "../../_love/LoveKit";
import LoveStory, { ChapterHead, GifMoment, type Chapter, type StoryApi } from "../../_love/Story";
import PhotoDeck from "../../_love/PhotoDeck";
import LockedLetter from "../../_love/LockedLetter";
import { V, pickTheme, themeVars } from "../../_love/theme";
import NoticePaper, { DOC_W, type RespondFn } from "./NoticePaper";
import { LEGAL_THEMES } from "./themes";
import {
  type Demand,
  type NoticeData,
  GROUNDS_MAX,
  complianceSummary,
  deriveLifecycle,
  escalatedClause,
  fmtDate,
  formatRemaining,
  isFinalState,
  numeralize,
} from "./types";

const ASSET = templateMediaBase("legal-notice");
const GIF_CDN = "https://cdn.subhsandesh.in/gifts-media";
const STARE_GIF = `${GIF_CDN}/templates/legal-notice/unblinking.gif`;
const PAT_GIF = `${GIF_CDN}/templates/legal-notice/head-pat.gif`;
/** The landing's own GIF — the lawyer drafting. Never one of the sender's. */
const DRAFTING_GIF = `${GIF_CDN}/templates/legal-notice/focus-typing.gif`;

/**
 * The paper's ink marks (used inside NoticePaper). Base rules are the FINAL
 * state of each mark; the animation only runs while `.ln-draw` is present, so an
 * html-to-image clone taken mid-animation still exports the finished mark.
 */
const MARK_CSS = `
.ln-tick path { stroke-dasharray: 100; stroke-dashoffset: 0; }
.ln-tick.ln-draw path { animation: ln-draw 220ms ease-out; }
@keyframes ln-draw { from { stroke-dashoffset: 100; } }
.ln-struck {
  background-image: linear-gradient(to bottom,
    transparent calc(50% - 0.6px), #141414 calc(50% - 0.6px),
    #141414 calc(50% + 0.6px), transparent calc(50% + 0.6px));
  background-repeat: no-repeat;
  background-size: 100% 100%;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.ln-struck.ln-draw { animation: ln-strike 300ms ease-out; }
@keyframes ln-strike { from { background-size: 0% 100%; } }
@media (prefers-reduced-motion: reduce) {
  .ln-tick.ln-draw path, .ln-struck.ln-draw { animation: none !important; }
}
`;

const LAYOUT_CSS = `
.ln-wrap { position: relative; z-index: 1; width: 100%; max-width: 1080px; margin: 0 auto; padding: 0 16px; }
.ln-hero { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; align-items: center; }
@media (min-width: 960px) { .ln-hero { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 44px; } }
.ln-deck { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@media (min-width: 768px) { .ln-deck { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ln-stamp-demo { animation: lv-slap .55s cubic-bezier(.2,.9,.3,1.3) both; }
@media (prefers-reduced-motion: reduce) { .ln-stamp-demo { animation: none; } }
`;

export interface LegalNoticeProps {
  data: NoticeData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}

type Flash = null | "accepted" | "contested" | "complied";

export default function LegalNotice({ data, mode, shareId, onThemeChange }: LegalNoticeProps) {
  const live = mode === "live";
  const reduced = useReducedMotion();
  const theme = pickTheme(LEGAL_THEMES, data.theme);

  /** Local mirror so a response paints instantly; the POST reconciles behind it. */
  const [demands, setDemands] = useState<Demand[]>(data.demands);
  // New demands from the parent (a fresh save / a server refresh) replace the
  // local mirror — adjusted during render, not in an effect.
  const [demandsSrc, setDemandsSrc] = useState(data.demands);
  if (demandsSrc !== data.demands) {
    setDemandsSrc(data.demands);
    setDemands(data.demands);
  }

  /** `null` until mounted — the clock must never differ between SSR and hydration. */
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    const first = window.setTimeout(() => setNowMs(Date.now()), 0);
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => {
      window.clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const [opened, setOpened] = useState(false);
  const [drawing, setDrawing] = useState<Set<string>>(() => new Set());
  const [flash, setFlash] = useState<Flash>(null);
  const [fearing, setFearing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const view: NoticeData = useMemo(() => ({ ...data, demands }), [data, demands]);
  const isFinal = isFinalState(view, nowMs);
  const lifecycle = deriveLifecycle(view, nowMs);
  const summary = complianceSummary(demands);
  const answered = demands.filter((d) => d.response !== "pending").length;
  const remaining = formatRemaining(view.complianceDeadline, nowMs);

  // ── The self-firing escalation — only on a live crossing, never on a page
  //    that was already lapsed when it loaded.
  const wasFinal = useRef<boolean | null>(null);
  useEffect(() => {
    if (nowMs === null) return;
    if (wasFinal.current === null) {
      wasFinal.current = isFinal;
      return;
    }
    if (isFinal && !wasFinal.current && !reduced) {
      wasFinal.current = isFinal;
      const on = setTimeout(() => setFearing(true), 0);
      const off = setTimeout(() => setFearing(false), 1600);
      return () => {
        clearTimeout(on);
        clearTimeout(off);
      };
    }
    wasFinal.current = isFinal;
  }, [isFinal, reduced, nowMs]);

  // ── Recording a response ───────────────────────────────────────────────────
  const respond = useCallback<RespondFn>(
    (demandId, patch) => {
      let becameAccepted = false;
      let becameContested = false;
      let becameComplied = false;

      setDemands((prev) => {
        const next = prev.map((d) => {
          if (d.id !== demandId) return d;
          const merged: Demand = { ...d, ...patch };
          if (patch.response !== undefined) {
            if (merged.response !== "contested") merged.grounds = "";
            if (merged.response !== "accepted") {
              merged.complied = false;
              merged.compliedOn = "";
            }
            becameAccepted = merged.response === "accepted" && d.response !== "accepted";
            becameContested = merged.response === "contested" && d.response !== "contested";
          }
          if (patch.complied !== undefined) {
            merged.complied = merged.response === "accepted" && patch.complied === true;
            merged.compliedOn = merged.complied ? d.compliedOn || new Date().toISOString() : "";
            becameComplied = merged.complied && !d.complied;
          }
          return merged;
        });
        const allResolved =
          next.length > 0 && next.every((d) => d.response === "contested" || (d.response === "accepted" && d.complied));
        const wasResolved =
          prev.length > 0 && prev.every((d) => d.response === "contested" || (d.response === "accepted" && d.complied));
        if (allResolved && !wasResolved) window.setTimeout(() => setCelebrate(true), 0);
        return next;
      });

      if (becameAccepted || becameContested || becameComplied) {
        setDrawing((prev) => new Set(prev).add(demandId));
        window.setTimeout(() => {
          setDrawing((prev) => {
            const n = new Set(prev);
            n.delete(demandId);
            return n;
          });
        }, 400);
        setFlash(becameComplied ? "complied" : becameAccepted ? "accepted" : "contested");
        window.setTimeout(() => setFlash(null), 2200);
      }

      // Persist. The addressee is not logged in and never will be — the shareId
      // is the capability, and the state has to survive a refresh elsewhere.
      if (live && shareId) {
        fetch(`${API_URL}/legal-notice-pages/share/${shareId}/respond`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
          },
          body: JSON.stringify({
            demandId,
            ...patch,
            // Empty when the notice has no password — the server only demands a
            // token for gated notices.
            unlockToken:
              (typeof sessionStorage !== "undefined" && sessionStorage.getItem(`legal-notice_unlock_token_${shareId}`)) || "",
          }),
        }).catch(() => {
          /* optimistic — the local mark stands, the next load reconciles */
        });
      }
    },
    [live, shareId],
  );

  useEffect(() => {
    if (!celebrate) return;
    const t = window.setTimeout(() => setCelebrate(false), 2600);
    return () => window.clearTimeout(t);
  }, [celebrate]);

  const from = data.senderName || "Your person";
  const to = data.addresseeName || "you";

  // Each GIF is used once, at one moment: the notice lands, the evidence is
  // accepted, the letter unlocks.
  const gif = (i: number) => data.gifs[i];
  const hasPhotos = data.photos.length > 0;
  const hasLetter = data.letter.trim().length > 0;

  const chapters: Chapter[] = [
    {
      id: "notice",
      emoji: "📨",
      title: "you've been served",
      kicker: "the notice",
      render: (api) => (
        <NoticeChapter
          data={view}
          from={from}
          to={to}
          answered={answered}
          summary={summary}
          lifecycle={lifecycle}
          isFinal={isFinal}
          remaining={remaining}
          celebrate={celebrate}
          gif={gif(0)}
          reduced={reduced}
          onLanded={api.complete}
        />
      ),
    },
    {
      id: "facts",
      emoji: "📜",
      title: "the facts",
      render: (api) => <FactsChapter data={view} isFinal={isFinal} reduced={reduced} onDone={() => api.done(3400)} />,
    },
    {
      id: "demands",
      emoji: "✍️",
      title: "the demands",
      render: (api) => (
        <DemandsChapter demands={demands} to={to} onRespond={respond} lifecycle={lifecycle} remaining={remaining} onAllAnswered={() => api.done(3000)} onAlreadyAnswered={api.complete} />
      ),
    },
    ...(hasPhotos
      ? [
          {
            id: "evidence",
            emoji: "📸",
            title: "the evidence",
            render: (api: StoryApi) => <EvidenceChapter photos={data.photos} gif={gif(1)} reduced={reduced} onDone={() => api.done(2800)} />,
          },
        ]
      : []),
    ...(hasLetter
      ? [
          {
            id: "letter",
            emoji: "💌",
            title: "off the record",
            gated: true,
            render: (api: StoryApi) => (
              <>
                <ChapterHead kicker="off the record" title="One more thing, counsel…" />
                <LockedLetter
                  letter={data.letter}
                  from={from}
                  to={to}
                  question={data.lockQuestion.trim() || `${to}, do you accept these terms and conditions? ⚖️`}
                  answer={data.lockAnswer.trim() || "I accept, counsel 💖"}
                  gif={gif(2)}
                  gifCaption="motion granted 🥹"
                  reduceMotion={reduced}
                  onOpened={api.complete}
                />
              </>
            ),
          },
        ]
      : []),
    {
      id: "verdict",
      emoji: "⚖️",
      title: "the verdict",
      render: () => (
        <>
          <ChapterHead
            kicker="the verdict"
            title={lifecycle === "complied" ? "Case closed 💖" : isFinal ? "Final notice 😱" : "Certified copy 🖨️"}
            note={
              lifecycle === "complied"
                ? "All demands resolved. Love wins. Save it for the family WhatsApp group."
                : isFinal
                  ? "The stipulated period has lapsed. Your mother has been informed."
                  : "Save the notice, stamped with your answers. The court keeps a copy too."
            }
          />
          <CertifiedCopy view={view} nowMs={nowMs} drawing={drawing} onRespond={respond} />
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <GhostButton onClick={() => setOpened(false)} style={{ width: "auto", minWidth: 220 }}>
              ↺ get served again
            </GhostButton>
            <p style={{ margin: 0, fontSize: 12, color: V.faint, textAlign: "center", maxWidth: 360 }}>
              This notice has no legal effect and is not a substitute for a conversation. 💌
            </p>
          </div>
        </>
      ),
    },
  ];

  return (
    <LoveThemeContext.Provider value={theme}>
      <div
        className={`${DATE_FONT_VARS} lv-root`}
        style={{
          ...themeVars(theme),
          minHeight: "100dvh",
          position: "relative",
          isolation: "isolate",
          overflowX: "clip",
          color: V.ink,
          background: theme.colors.base,
          fontFamily: GROTESK,
        }}
      >
        <style>{LOVE_CSS + MARK_CSS + LAYOUT_CSS}</style>
        <LoveSky theme={theme} reduceMotion={reduced} />

        {live && <BrandBadge />}
        {!live && onThemeChange && <ThemeDock themes={LEGAL_THEMES} value={theme.id} onChange={onThemeChange} />}

        {!opened ? <Served data={data} onOpen={() => setOpened(true)} reduced={reduced} live={live} /> : <LoveStory chapters={chapters} reduceMotion={reduced} />}

        <Overlays flash={flash} fearing={fearing} celebrate={celebrate} reduced={reduced} />
      </div>
    </LoveThemeContext.Provider>
  );
}

// ─── Chapter 1: the notice ───────────────────────────────────────────────────

function NoticeChapter({
  data,
  from,
  to,
  answered,
  summary,
  lifecycle,
  isFinal,
  remaining,
  celebrate,
  gif,
  reduced,
  onLanded,
}: {
  data: NoticeData;
  from: string;
  to: string;
  answered: number;
  summary: ReturnType<typeof complianceSummary>;
  lifecycle: ReturnType<typeof deriveLifecycle>;
  isFinal: boolean;
  remaining: string | null;
  celebrate: boolean;
  gif?: string;
  reduced: boolean;
  onLanded: () => void;
}) {
  // The stamp slaps down, then the GIF reacts.
  const [landed, setLanded] = useState(reduced);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setLanded(true);
      onLanded();
    }, reduced ? 0 : 1300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="ln-hero">
      <div className={reduced ? "" : "lv-pop"}>
        <Sticker>⚖️ legal notice · {data.refNo || "LN/2026"}</Sticker>
        <h1 style={{ margin: "16px 0 0", fontWeight: 800, fontSize: "clamp(36px, 9vw, 70px)", lineHeight: 0.95, letterSpacing: "-0.045em" }}>
          {to},
          <br />
          <GradText>you&apos;ve been served.</GradText>
        </h1>
        <p style={{ margin: "14px 0 0", maxWidth: 520, fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, lineHeight: 1.35, color: V.soft }}>
          On behalf of {from}, through the lawyer of love, in the matter of one (1) extremely serious relationship.
        </p>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Stat label="demands" value={String(data.demands.length)} />
          <Stat label="answered" value={`${answered}/${data.demands.length}`} />
          <Stat label="objections" value={String(summary.contested)} />
          {data.relationshipSince && <Stat label="together since" value={fmtDate(data.relationshipSince)} />}
        </div>
        <Glass style={{ marginTop: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span aria-hidden className={reduced ? "" : "lv-pulse"} style={{ width: 12, height: 12, borderRadius: "50%", background: isFinal ? V.a1 : V.chip, flexShrink: 0 }} />
          <span style={{ minWidth: 0 }}>
            <Eyebrow>compliance deadline{data.complianceDeadline ? ` · ${fmtDate(data.complianceDeadline)}` : ""}</Eyebrow>
            <span style={{ display: "block", marginTop: 3, fontWeight: 800, fontSize: 17, fontVariantNumeric: "tabular-nums" }}>
              {lifecycle === "complied" ? "case closed — all demands resolved 💖" : isFinal ? "period lapsed — escalated to your mother 😱" : remaining ?? "…"}
            </span>
          </span>
        </Glass>
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {celebrate && !reduced && <HeartBurst glyphs={["💖", "⚖️", "✨", "🩷", "💘"]} />}
        <LifecycleStamp key={lifecycle} lifecycle={lifecycle} reduced={reduced} />
        <div style={{ minHeight: gif ? 120 : 0 }}>
          <GifMoment src={gif} caption="the court is watching 👀" show={landed} size={104} side="left" />
        </div>
      </div>
    </section>
  );
}

// ─── Chapter 2: the facts, one at a time ─────────────────────────────────────

function FactsChapter({ data, isFinal, reduced, onDone }: { data: NoticeData; isFinal: boolean; reduced: boolean; onDone: () => void }) {
  const facts = data.recitals.filter((r) => r.trim());
  const n = facts.length;
  const [i, setI] = useState(0);
  const [stamped, setStamped] = useState(false);
  const [finished, setFinished] = useState(n === 0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && window.clearTimeout(timer.current)), []);
  useEffect(() => {
    if (n === 0) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agree = () => {
    if (stamped || finished) return;
    setStamped(true);
    timer.current = window.setTimeout(
      () => {
        setStamped(false);
        if (i + 1 >= n) {
          setFinished(true);
          onDone();
        } else setI(i + 1);
      },
      reduced ? 150 : 850,
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: 620, margin: "0 auto" }}>
      <ChapterHead kicker={`facts of the case · under instructions from ${data.senderName || "my client"}`} title="Do you dispute these? 🧐" note={finished ? undefined : "tap “undisputed” — you know they're true"} />

      {!finished ? (
        <>
          <div style={{ position: "relative", minHeight: 250 }}>
            {/* The pile behind the current fact */}
            {[2, 1].map((d) =>
              i + d < n ? (
                <span key={d} aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 24, background: V.paper, opacity: 0.5 - d * 0.12, transform: `translateY(${d * 10}px) rotate(${d % 2 ? 2.5 : -2.5}deg) scale(${1 - d * 0.03})` }} />
              ) : null,
            )}
            <AnimatePresence mode="wait">
              <motion.article
                key={i}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 60, rotate: 4 }}
                animate={{ opacity: 1, x: 0, rotate: -1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -80, rotate: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                style={{ position: "relative", minHeight: 250, borderRadius: 24, padding: "22px 22px 20px", background: V.paper, color: V.paperInk, boxShadow: `0 30px 60px -30px ${V.shadow}`, display: "flex", flexDirection: "column" }}
              >
                <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: V.a1 }}>
                  fact no. {i + 1} of {n}
                </p>
                <p style={{ margin: "14px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(22px, 5.4vw, 28px)", lineHeight: 1.3, overflowWrap: "anywhere" }}>{numeralize(facts[i])}</p>
                {stamped && (
                  <span
                    className="lv-slap"
                    aria-hidden
                    style={{ position: "absolute", right: 16, bottom: 18, padding: "6px 14px", border: `3px solid ${V.a1}`, color: V.a1, borderRadius: 10, fontWeight: 800, fontSize: 18, letterSpacing: ".14em", background: "color-mix(in srgb, var(--lv-paper) 70%, transparent)" }}
                  >
                    UNDISPUTED
                  </span>
                )}
              </motion.article>
            </AnimatePresence>
          </div>
          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            <CandyButton onClick={agree} disabled={stamped} style={{ width: "auto", minWidth: 240 }}>
              undisputed ✓
            </CandyButton>
          </div>
          <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12.5, color: V.faint }}>(there is no “disputed” button. the court has seen the evidence.)</p>
        </>
      ) : (
        <motion.div initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Glass style={{ padding: "16px 18px" }}>
            <Eyebrow color={isFinal ? V.a1 : V.soft}>{isFinal ? "escalation — in effect" : "all facts admitted · escalation clause"}</Eyebrow>
            <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.5 }}>{numeralize(isFinal ? escalatedClause(data.complianceDeadline) : data.escalationClause)}</p>
          </Glass>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {data.finePrint.map((l, k) => (
              <span key={k} style={{ fontSize: 12, padding: "6px 11px", borderRadius: 999, background: V.glass, border: `1px solid ${V.edge}`, color: V.soft }}>
                {l}
              </span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: V.soft, textAlign: "center" }}>
            {data.advocateName ? `Adv. ${data.advocateName}` : "The advocate"}
            {data.advocateEnrollment ? ` · ${data.advocateEnrollment}` : ""}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Chapter 3: the demands ──────────────────────────────────────────────────

function DemandsChapter({
  demands,
  to,
  onRespond,
  lifecycle,
  remaining,
  onAllAnswered,
  onAlreadyAnswered,
}: {
  demands: Demand[];
  to: string;
  onRespond: RespondFn;
  lifecycle: ReturnType<typeof deriveLifecycle>;
  remaining: string | null;
  onAllAnswered: () => void;
  onAlreadyAnswered: () => void;
}) {
  // Answered = every demand accepted or contested WITH grounds (the grounds
  // commit on blur, so the story never moves on while they are still typing).
  const complete = demands.length > 0 && demands.every((d) => d.response === "accepted" || (d.response === "contested" && d.grounds.trim()));
  // First render: a notice that was already answered (a revisit) only unlocks
  // "next". Afterwards, the moment it becomes complete, the story moves on.
  const prev = useRef<boolean | null>(null);
  useEffect(() => {
    if (prev.current === null) {
      if (complete || demands.length === 0) onAlreadyAnswered();
    } else if (complete && !prev.current) {
      onAllAnswered();
    }
    prev.current = complete;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);
  return (
    <div style={{ width: "100%" }}>
      <ChapterHead kicker={`demands for ${to}`} title="Accept or object ✍️" />
      <DemandDeck demands={demands} onRespond={onRespond} lifecycle={lifecycle} remaining={remaining} />
    </div>
  );
}

// ─── Chapter 4: the evidence ─────────────────────────────────────────────────

const EXHIBIT = "ABCDEFGH";

function EvidenceChapter({ photos, gif, reduced, onDone }: { photos: NoticeData["photos"]; gif?: string; reduced: boolean; onDone: () => void }) {
  const [all, setAll] = useState(false);
  const exhibits = useMemo(
    () => photos.map((p, i) => ({ ...p, caption: /^exhibit/i.test(p.caption ?? "") ? p.caption : `Exhibit ${EXHIBIT[i] ?? i + 1}${p.caption ? `: ${p.caption}` : ""}` })),
    [photos],
  );
  return (
    <>
      <ChapterHead kicker="the evidence" title="Exhibits for the court 📸" />
      <PhotoDeck
        photos={exhibits}
        reduceMotion={reduced}
        backLabel="counsel's note"
        onAllSeen={() => {
          setAll(true);
          onDone();
        }}
      />
      <div style={{ marginTop: 14, minHeight: gif ? 100 : 0 }}>
        <GifMoment src={gif} caption="evidence accepted, your honour 🥹" show={all} size={96} />
      </div>
    </>
  );
}

// ─── Served (landing) ────────────────────────────────────────────────────────

function Served({ data, onOpen, reduced, live }: { data: NoticeData; onOpen: () => void; reduced: boolean; live: boolean }) {
  const gif = DRAFTING_GIF;
  return (
    <main
      className="ln-wrap"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 88, paddingBottom: live ? 40 : 100, textAlign: "center" }}
    >
      <div style={{ position: "relative", width: "min(86vw, 380px)" }}>
        <div
          className={reduced ? "" : "lv-pop"}
          style={{
            position: "relative",
            background: V.paper,
            color: V.paperInk,
            borderRadius: 22,
            padding: "26px 22px 22px",
            boxShadow: `0 40px 80px -34px ${V.shadow}`,
            transform: "rotate(-1.5deg)",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: V.a1 }}>
            ref · {data.refNo || "LN/2026"}
          </p>
          <div style={{ margin: "14px auto 0", width: 132, height: 132, borderRadius: 26, overflow: "hidden", background: "#fff", border: "4px solid #fff", boxShadow: "0 14px 26px -14px rgba(0,0,0,.4)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gif} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <p style={{ margin: "14px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.35, color: V.paperSoft }}>
            Dear {data.addresseeName || "you"}, a notice has been issued against you by {data.senderName || "someone who loves you"}.
          </p>
        </div>
        <span
          className={reduced ? "" : "ln-stamp-demo"}
          aria-hidden
          style={{
            position: "absolute",
            right: -8,
            top: -18,
            padding: "8px 14px",
            border: `3px solid ${V.a1}`,
            color: V.a1,
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            transform: "rotate(-8deg)",
            background: "color-mix(in srgb, var(--lv-paper) 70%, transparent)",
            animationDelay: "350ms",
          }}
        >
          served
        </span>
      </div>

      <h1 style={{ margin: "28px 0 0", fontWeight: 800, fontSize: "clamp(40px, 11vw, 76px)", lineHeight: 0.95, letterSpacing: "-0.045em" }}>
        you&apos;ve been
        <br />
        <GradText>served</GradText> <span aria-hidden>💌</span>
      </h1>
      <p style={{ margin: "12px 0 0", maxWidth: 380, fontSize: 15, lineHeight: 1.5, color: V.soft }}>
        In the matter of one (1) relationship. You are called upon to respond to each demand. Resistance is cute but futile.
      </p>
      <div style={{ marginTop: 22, width: "100%", maxWidth: 360 }}>
        <CandyButton onClick={onOpen}>
          open the notice <span aria-hidden>📜</span>
        </CandyButton>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12, color: V.faint }}>no lawyers were paid. several were bribed with chai.</p>
    </main>
  );
}

// ─── The big lifecycle stamp ─────────────────────────────────────────────────

function LifecycleStamp({ lifecycle, reduced }: { lifecycle: ReturnType<typeof deriveLifecycle>; reduced: boolean }) {
  const cfg = {
    served: { top: "notice", big: "SERVED", sub: "awaiting your response", emoji: "📨" },
    responded: { top: "status", big: "IN REVIEW", sub: "the court is judging you", emoji: "🧐" },
    complied: { top: "verdict", big: "CASE CLOSED", sub: "love wins · no further action", emoji: "💖" },
    final: { top: "warning", big: "FINAL NOTICE", sub: "escalated to your mother", emoji: "😱" },
  }[lifecycle];
  return (
    <div
      className={reduced ? "" : "lv-slap"}
      role="status"
      aria-label={`Notice status: ${cfg.big.toLowerCase()}`}
      style={{
        width: "min(60vw, 290px)",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        border: `5px solid ${V.a1}`,
        outline: `2px dashed ${V.a1}`,
        outlineOffset: -18,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        color: V.a1,
        background: "color-mix(in srgb, var(--lv-a1) 8%, transparent)",
        boxShadow: `0 0 60px -10px color-mix(in srgb, var(--lv-a1) 45%, transparent)`,
      }}
    >
      <div style={{ padding: "0 22px" }}>
        <div style={{ fontSize: "clamp(32px, 9vw, 44px)", lineHeight: 1 }} aria-hidden>
          {cfg.emoji}
        </div>
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 800, letterSpacing: ".3em", textTransform: "uppercase" }}>{cfg.top}</div>
        <div style={{ marginTop: 2, fontSize: "clamp(24px, 7vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.95 }}>{cfg.big}</div>
        <div style={{ marginTop: 6, fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: V.soft }}>{cfg.sub}</div>
      </div>
    </div>
  );
}

// ─── The demands deck ────────────────────────────────────────────────────────

function DemandDeck({
  demands,
  onRespond,
  lifecycle,
  remaining,
}: {
  demands: Demand[];
  onRespond: RespondFn;
  lifecycle: ReturnType<typeof deriveLifecycle>;
  remaining: string | null;
}) {
  const answered = demands.filter((d) => d.response !== "pending").length;
  if (!demands.length) return <p style={{ textAlign: "center", color: V.soft }}>No demands on file. Suspiciously peaceful. 🕊️</p>;
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 14, color: V.soft, maxWidth: 460 }}>
          Accept it, or object and state your grounds in one line. Accepted ones can be marked done. {lifecycle === "complied" ? "💖" : ""}
        </p>
        <span style={{ fontWeight: 800, fontSize: 13, padding: "6px 12px", borderRadius: 999, background: V.chip, color: V.chipInk, whiteSpace: "nowrap" }}>
          {answered}/{demands.length} answered{remaining && lifecycle !== "complied" ? ` · ${remaining}` : ""}
        </span>
      </div>
      <ol className="ln-deck" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {demands.map((d, i) => (
          <DemandCard key={d.id} demand={d} index={i} onRespond={onRespond} />
        ))}
      </ol>
    </div>
  );
}

function DemandCard({ demand, index, onRespond }: { demand: Demand; index: number; onRespond: RespondFn }) {
  const [grounds, setGrounds] = useState(demand.grounds);
  const [groundsSrc, setGroundsSrc] = useState(demand.grounds);
  if (groundsSrc !== demand.grounds) {
    setGroundsSrc(demand.grounds);
    setGrounds(demand.grounds);
  }

  const accepted = demand.response === "accepted";
  const contested = demand.response === "contested";
  const stamp = demand.complied ? { t: "done 💖", c: V.a3 } : accepted ? { t: "accepted", c: V.a2 } : contested ? { t: "objection!", c: V.a1 } : null;

  return (
    <li
      style={{
        position: "relative",
        borderRadius: 22,
        padding: "16px 16px 14px",
        background: V.paper,
        color: V.paperInk,
        boxShadow: `0 18px 36px -24px ${V.shadow}`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 11, background: V.grad, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14 }}>
          {index + 1}
        </span>
        <p
          style={{
            margin: 0,
            paddingTop: 4,
            paddingRight: stamp ? 70 : 0,
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.35,
            textDecoration: demand.complied ? "line-through" : "none",
            textDecorationThickness: 2,
            opacity: demand.complied ? 0.7 : 1,
            overflowWrap: "anywhere",
          }}
        >
          {numeralize(demand.text)}
        </p>
      </div>

      {stamp && (
        <span
          key={stamp.t}
          className="lv-slap"
          aria-hidden
          style={{
            position: "absolute",
            right: 10,
            top: 12,
            padding: "3px 9px",
            border: `2.5px solid ${stamp.c}`,
            color: stamp.c,
            borderRadius: 8,
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            background: "var(--lv-paper)",
          }}
        >
          {stamp.t}
        </span>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Choice on={accepted} onClick={() => onRespond(demand.id, { response: accepted ? "pending" : "accepted" })} label={`Accept demand ${index + 1}`}>
          ✓ accept
        </Choice>
        <Choice on={contested} danger onClick={() => onRespond(demand.id, { response: contested ? "pending" : "contested" })} label={`Contest demand ${index + 1}`}>
          ✋ object
        </Choice>
      </div>

      {accepted && (
        <button
          type="button"
          aria-pressed={demand.complied}
          onClick={() => onRespond(demand.id, { complied: !demand.complied })}
          className="lv-focus"
          style={{
            marginTop: 8,
            width: "100%",
            minHeight: 44,
            borderRadius: 999,
            border: `1.5px dashed ${demand.complied ? "transparent" : "color-mix(in srgb, var(--lv-paper-ink) 30%, transparent)"}`,
            background: demand.complied ? V.chip : "transparent",
            color: demand.complied ? V.chipInk : V.paperInk,
            fontFamily: GROTESK,
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {demand.complied ? "done ✓ (the court is pleased)" : "mark as done"}
        </button>
      )}

      {contested && (
        <label style={{ display: "block", marginTop: 8 }}>
          <span style={{ display: "block", fontFamily: ITALIC, fontStyle: "italic", fontSize: 16, color: V.a1 }}>your grounds, counsel:</span>
          <input
            value={grounds}
            maxLength={GROUNDS_MAX}
            onChange={(e) => setGrounds(e.target.value.slice(0, GROUNDS_MAX))}
            onBlur={() => {
              if (grounds !== demand.grounds) onRespond(demand.id, { grounds });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            placeholder="one line. make it count."
            aria-label={`Grounds for contesting demand ${index + 1}`}
            style={{
              marginTop: 4,
              width: "100%",
              minHeight: 44,
              padding: "0 14px",
              borderRadius: 14,
              border: `1.5px solid color-mix(in srgb, var(--lv-paper-ink) 18%, transparent)`,
              background: "color-mix(in srgb, var(--lv-paper-ink) 4%, var(--lv-paper))",
              color: V.paperInk,
              fontFamily: GROTESK,
              fontSize: 16,
              outline: "none",
            }}
          />
          <span style={{ display: "block", marginTop: 3, textAlign: "right", fontSize: 11, color: V.paperSoft }}>
            {grounds.length}/{GROUNDS_MAX}
          </span>
        </label>
      )}
    </li>
  );
}

function Choice({ on, danger, onClick, label, children }: { on: boolean; danger?: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      onClick={onClick}
      className="lv-focus"
      style={{
        flex: 1,
        minHeight: 46,
        borderRadius: 999,
        border: on ? "none" : `1.5px solid color-mix(in srgb, var(--lv-paper-ink) 22%, transparent)`,
        background: on ? (danger ? V.a1 : V.grad) : "transparent",
        color: on ? "#fff" : V.paperInk,
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 15,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}

// ─── Certified copy (the paper, exportable) ──────────────────────────────────

function CertifiedCopy({
  view,
  nowMs,
  drawing,
  onRespond,
}: {
  view: NoticeData;
  nowMs: number | null;
  drawing: Set<string>;
  onRespond: RespondFn;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [paperH, setPaperH] = useState(900);
  const [exporting, setExporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Scale, never reflow: the document is one fixed-width page.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => el.clientWidth > 0 && setScale(Math.min(el.clientWidth / DOC_W, 1.25));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const measure = () => setPaperH(el.offsetHeight || el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const download = async () => {
    const node = paperRef.current;
    if (!node || busy) return;
    setBusy(true);
    setMsg("");
    // Drop the in-document affordances for the one captured frame.
    setExporting(true);
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    try {
      const { downloadNoticePng } = await import("./noticeExport");
      await downloadNoticePng(node, view.refNo);
      setMsg("Saved to your downloads 📥");
    } catch {
      setMsg("Couldn't save it — try a screenshot 📸");
    } finally {
      setExporting(false);
      setBusy(false);
    }
  };

  return (
    <div>
      <div ref={wrapRef} style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ width: DOC_W * scale, height: paperH * scale, margin: "0 auto", boxShadow: `0 26px 50px -26px ${V.shadow}` }}>
          <div ref={paperRef} style={{ width: DOC_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <NoticePaper data={view} nowMs={nowMs} drawing={drawing} onRespond={onRespond} exporting={exporting} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <CandyButton onClick={() => void download()} disabled={busy} style={{ width: "auto", minWidth: 250 }}>
          {busy ? "stamping…" : "download certified copy ⬇️"}
        </CandyButton>
        <p role="status" aria-live="polite" style={{ margin: 0, minHeight: 16, fontSize: 12.5, color: V.soft }}>
          {msg}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", padding: "8px 14px", borderRadius: 16, background: V.glass, border: `1px solid ${V.edge}`, textAlign: "left" }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: V.faint }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{value}</span>
    </span>
  );
}

// ─── Toasts + overlays (portalled above the sheets) ──────────────────────────

const noopSubscribe = () => () => {};

function Overlays({ flash, fearing, celebrate, reduced }: { flash: Flash; fearing: boolean; celebrate: boolean; reduced: boolean }) {
  // No portal on the server or the first client render, so hydration matches.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!hydrated) return null;
  const toast = flash
    ? {
        accepted: { gif: PAT_GIF, text: "Demand accepted. Noted for the record ✓" },
        contested: { gif: STARE_GIF, text: "OBJECTION! State your grounds, counsel ✋" },
        complied: { gif: PAT_GIF, text: "Done! The court is extremely pleased 💖" },
      }[flash]
    : null;
  return createPortal(
    <ThemeScope>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={flash}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            role="status"
            style={{
              position: "fixed",
              left: "50%",
              bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
              x: "-50%",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 16px 6px 6px",
              borderRadius: 999,
              background: V.paper,
              color: V.paperInk,
              boxShadow: "0 20px 40px -16px rgba(0,0,0,.6)",
              maxWidth: "calc(100vw - 32px)",
              fontFamily: GROTESK,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={toast.gif} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", background: "#fff", flexShrink: 0 }} />
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(fearing || (celebrate && !reduced)) && (
          <motion.div
            key={fearing ? "fear" : "yay"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="assertive"
            style={{ position: "fixed", inset: 0, zIndex: 220, display: "grid", placeItems: "center", padding: 20, background: "rgba(10,5,15,.82)", pointerEvents: "none" }}
          >
            <div style={{ textAlign: "center", color: "#fff", fontFamily: GROTESK }}>
              {fearing ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${ASSET}/fear.webp`} alt="" width={190} height={190} style={{ width: 190, height: "auto", margin: "0 auto" }} />
              ) : (
                <div style={{ fontSize: 90, lineHeight: 1 }}>💖</div>
              )}
              <div className="lv-slap" style={{ marginTop: 14, fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", color: fearing ? "#ff5a6e" : "#fff" }}>
                {fearing ? "FINAL NOTICE 😱" : "CASE CLOSED 💖"}
              </div>
              <div style={{ marginTop: 6, fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, opacity: 0.85 }}>
                {fearing ? "the stipulated period has lapsed" : "all demands resolved. love wins."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeScope>,
    document.body,
  );
}
