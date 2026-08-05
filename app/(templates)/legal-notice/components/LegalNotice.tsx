"use client";

// ─── The shell around the artifact ───────────────────────────────────────────
// Everything that is NOT paper lives here: the scale wrapper, the response
// docket, the download button, the brand badge, and every animated asset. Not
// one of them is inside the node handed to html-to-image.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_URL, IS_NGROK } from "@/lib/config";
import NoticePaper, { DOC_W, type RespondFn } from "./NoticePaper";
import {
  type Demand,
  type NoticeData,
  GROUNDS_MAX,
  isFinalState,
} from "./types";

const SERIF = "var(--font-tinos), 'Times New Roman', Times, serif";
const TYPE = "var(--font-courier-prime), 'Courier New', Courier, monospace";
const INK = "#141414";
const RED = "#b02020";
const PAPER = "#fdfcf8";
const DESK = "#e6e3da";

const ASSET = "/templates/legal-notice";

/**
 * Base rules are the FINAL state of each mark; the animation only runs while the
 * transient `.ln-draw` class is present. That ordering is what makes the PNG
 * export safe — html-to-image clones an element mid-animation and restarts it,
 * so a mark whose resting state lived in the keyframes would export blank.
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

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

/** A looping asset, or nothing at all when the reader has asked for less motion. */
function Motion({ src, poster, alt, size }: { src: string; poster?: string; alt: string; size: number }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return poster
      ? <Image src={poster} alt={alt} width={size} height={size} style={{ width: size, height: "auto" }} unoptimized />
      : null;
  }
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      width={size}
      height={size}
      style={{ width: size, height: "auto", display: "block" }}
      aria-hidden
    />
  );
}

/* ── Docket controls — the accessible, un-scaled interaction surface ──────── */

const BTN: React.CSSProperties = {
  flex: "1 1 0", minHeight: 44, padding: "0 10px",
  fontFamily: TYPE, fontSize: 11, letterSpacing: 1.2,
  border: `1px solid ${INK}`, background: "transparent", color: INK,
  cursor: "pointer", borderRadius: 0,
};
const BTN_ON: React.CSSProperties = { ...BTN, background: INK, color: PAPER };

function DocketRow({
  demand, index, onRespond,
}: { demand: Demand; index: number; onRespond: RespondFn }) {
  const [grounds, setGrounds] = useState(demand.grounds);
  useEffect(() => { setGrounds(demand.grounds); }, [demand.grounds]);

  const accepted = demand.response === "accepted";
  const contested = demand.response === "contested";

  return (
    <li style={{ borderTop: `1px solid #cfcabb`, padding: "11px 0 13px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontFamily: TYPE, fontSize: 12, color: INK, flex: "0 0 auto" }}>{index + 1}.</span>
        <span style={{ fontFamily: TYPE, fontSize: 12, lineHeight: 1.5, color: INK, flex: "1 1 auto" }}>
          {demand.text}
        </span>
      </div>

      <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
        <button
          type="button"
          aria-pressed={accepted}
          onClick={() => onRespond(demand.id, { response: accepted ? "pending" : "accepted" })}
          style={accepted ? BTN_ON : BTN}
        >
          ACCEPT
        </button>
        <button
          type="button"
          aria-pressed={contested}
          onClick={() => onRespond(demand.id, { response: contested ? "pending" : "contested" })}
          style={contested ? BTN_ON : BTN}
        >
          CONTEST
        </button>
      </div>

      {accepted && (
        <button
          type="button"
          aria-pressed={demand.complied}
          onClick={() => onRespond(demand.id, { complied: !demand.complied })}
          style={{ ...(demand.complied ? BTN_ON : BTN), width: "100%", flex: "none", marginTop: 7 }}
        >
          {demand.complied ? "COMPLIED ✓" : "MARK COMPLIED"}
        </button>
      )}

      {contested && (
        <div style={{ marginTop: 8 }}>
          <label
            style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${INK}`, minHeight: 44, padding: "0 9px" }}
          >
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: RED, flex: "0 0 auto" }}>
              Grounds:
            </span>
            <input
              value={grounds}
              maxLength={GROUNDS_MAX}
              onChange={(e) => setGrounds(e.target.value.slice(0, GROUNDS_MAX))}
              onBlur={() => { if (grounds !== demand.grounds) onRespond(demand.id, { grounds }); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              placeholder="one line. make it count."
              style={{
                flex: "1 1 auto", minWidth: 0, border: "none", outline: "none", background: "transparent",
                fontFamily: TYPE, fontSize: 12, color: INK, height: 42,
              }}
            />
          </label>
          <div style={{ fontFamily: TYPE, fontSize: 9, color: "#6a6a6a", marginTop: 3, textAlign: "right" }}>
            {grounds.length}/{GROUNDS_MAX}
          </div>
        </div>
      )}
    </li>
  );
}

/* ── The template ─────────────────────────────────────────────────────────── */

export interface LegalNoticeProps {
  data: NoticeData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

export default function LegalNotice({ data, mode, shareId }: LegalNoticeProps) {
  const live = mode === "live";
  const reduced = useReducedMotion();

  /** Local mirror so a response paints instantly; the POST reconciles behind it. */
  const [demands, setDemands] = useState<Demand[]>(data.demands);
  useEffect(() => { setDemands(data.demands); }, [data.demands]);

  /** `null` until mounted — the clock must never differ between SSR and hydration. */
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    setNowMs(Date.now());
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const [drawing, setDrawing] = useState<Set<string>>(() => new Set());
  const [opened, setOpened] = useState(!live);
  const [downloading, setDownloading] = useState(false);
  /** Held true only across the capture, so the printed copy carries the marks
   *  but not the buttons that produced them. */
  const [exporting, setExporting] = useState(false);
  const [flash, setFlash] = useState<null | "accepted" | "contested">(null);
  const [fearing, setFearing] = useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [paperH, setPaperH] = useState(900);

  const view: NoticeData = useMemo(() => ({ ...data, demands }), [data, demands]);
  const isFinal = isFinalState(view, nowMs);

  // ── Scale, never reflow. The document is one fixed-width page at every viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const avail = el.clientWidth;
      if (avail > 0) setScale(Math.min(Math.max(avail / DOC_W, 0.28), 1.45));
    };
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

  // ── The self-firing escalation. Only overlay on a live crossing, never on a
  //    page that was already lapsed when it loaded (spec: render FINAL cleanly).
  const wasFinal = useRef<boolean | null>(null);
  useEffect(() => {
    if (wasFinal.current === null) { wasFinal.current = isFinal; return; }
    if (isFinal && !wasFinal.current && !reduced) {
      setFearing(true);
      const t = setTimeout(() => setFearing(false), 1400);
      wasFinal.current = isFinal;
      return () => clearTimeout(t);
    }
    wasFinal.current = isFinal;
  }, [isFinal, reduced]);

  // ── Recording a response ───────────────────────────────────────────────────
  const respond = useCallback<RespondFn>((demandId, patch) => {
    let becameAccepted = false;
    let becameContested = false;

    setDemands((prev) => prev.map((d) => {
      if (d.id !== demandId) return d;
      const merged: Demand = { ...d, ...patch };
      if (patch.response !== undefined) {
        if (merged.response !== "contested") merged.grounds = "";
        if (merged.response !== "accepted") { merged.complied = false; merged.compliedOn = ""; }
        becameAccepted = merged.response === "accepted" && d.response !== "accepted";
        becameContested = merged.response === "contested" && d.response !== "contested";
      }
      if (patch.complied !== undefined) {
        merged.complied = merged.response === "accepted" && patch.complied === true;
        merged.compliedOn = merged.complied ? (d.compliedOn || new Date().toISOString()) : "";
      }
      return merged;
    }));

    if (becameAccepted || becameContested) {
      setDrawing((prev) => new Set(prev).add(demandId));
      window.setTimeout(() => {
        setDrawing((prev) => { const n = new Set(prev); n.delete(demandId); return n; });
      }, 400);
      if (!reduced) {
        setFlash(becameAccepted ? "accepted" : "contested");
        window.setTimeout(() => setFlash(null), becameAccepted ? 2000 : 1800);
      }
    }

    // Persist. The addressee is not logged in and never will be — the shareId is
    // the capability, and the state has to survive a refresh on another device.
    if (live && shareId) {
      fetch(`${API_URL}/legal-notice-pages/share/${shareId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ demandId, ...patch }),
      }).catch(() => { /* optimistic — the local mark stands, the next load reconciles */ });
    }
  }, [live, shareId, reduced]);

  const download = useCallback(async () => {
    const node = paperRef.current;
    if (!node || downloading) return;
    setDownloading(true);
    // Drop the in-document affordances, let React paint that frame, and only
    // then capture. The ticks, strikethroughs, margin stamps and the FINAL
    // overprint are all rendered from state and stay exactly where they are.
    setExporting(true);
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    try {
      const { downloadNoticePng } = await import("./noticeExport");
      await downloadNoticePng(node, data.refNo);
    } catch {
      /* nothing to say that the missing file does not already say */
    } finally {
      setExporting(false);
      setDownloading(false);
    }
  }, [data.refNo, downloading]);

  const answered = demands.filter((d) => d.response !== "pending").length;

  return (
    <div style={{ minHeight: "100dvh", background: DESK, position: "relative", overflowX: "clip" }}>
      <style>{MARK_CSS}</style>

      {/* Brand badge — on the served page this logo IS the recipient's "make your own". */}
      {live && (
        <Link
          href="/templates"
          style={{
            position: "fixed", top: 12, right: 12, zIndex: 90,
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.92)", border: "1px solid #cfcabb",
            padding: "6px 10px", textDecoration: "none",
          }}
        >
          <Image src="/logo.webp" alt="SubhSandesh" width={18} height={18} style={{ width: 18, height: 18 }} />
          <span style={{ fontFamily: SERIF, fontSize: 11, letterSpacing: 0.6, color: INK }}>SubhSandesh</span>
        </Link>
      )}

      {/* "You've been served." The landing card before the notice is opened. */}
      {live && !opened && (
        <div style={{ position: "fixed", inset: 0, zIndex: 120, background: DESK, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: PAPER, border: `1px solid ${INK}`, padding: "26px 22px", maxWidth: 340, width: "100%", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Motion src={`${ASSET}/unblinking.webm`} poster={`${ASSET}/fear.webp`} alt="" size={132} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, letterSpacing: 3, color: INK }}>
              YOU&rsquo;VE BEEN SERVED
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.65, color: "#3b3b3b", marginTop: 8 }}>
              A legal notice has been issued against you in the matter of one (1) relationship.
              You are called upon to respond to each demand.
            </p>
            <button
              type="button"
              onClick={() => setOpened(true)}
              style={{ ...BTN, width: "100%", flex: "none", marginTop: 16, background: INK, color: PAPER }}
            >
              OPEN THE NOTICE
            </button>
            <p style={{ fontFamily: SERIF, fontSize: 9, color: "#6a6a6a", marginTop: 10, fontStyle: "italic" }}>
              This notice has no legal effect and is not a substitute for a conversation.
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: `${live ? 54 : 66}px 12px 40px` }}>
        {/* The scale wrapper. The page inside never reflows — it is one fixed
            layout at every viewport, only larger or smaller. */}
        <div ref={wrapRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ width: DOC_W * scale, height: paperH * scale }}>
            <div ref={paperRef} style={{ width: DOC_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <NoticePaper data={view} nowMs={nowMs} drawing={drawing} onRespond={respond} exporting={exporting} />
            </div>
          </div>
        </div>

        {/* ── RESPONSE DOCKET ────────────────────────────────────────────────
            The in-document ACCEPT / CONTEST boxes are the affordance, but at a
            380px viewport the whole page is scaled to ~0.7 and they land well
            under a 40px tap target. Rather than inflate the type on the document
            (which would immediately read as a web page, not a notice), the same
            three actions live here at full size, unscaled, on continuation paper.
            This is also where the counter-notice docket will attach. */}
        {demands.length > 0 && (
          <section
            style={{
              marginTop: 22, background: PAPER, border: `1px solid ${INK}`,
              padding: "14px 16px 6px", maxWidth: DOC_W * Math.max(scale, 1), marginInline: "auto",
            }}
          >
            <h2 style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700, letterSpacing: 3, color: INK, margin: 0 }}>
              RESPONSE — FORM B
            </h2>
            <p style={{ fontFamily: SERIF, fontSize: 10.5, color: "#3b3b3b", marginTop: 4, lineHeight: 1.6 }}>
              You are required to record a response against each demand. Accept it, or contest it and
              state your grounds in one line.
            </p>
            <div style={{ fontFamily: TYPE, fontSize: 10, color: isFinal ? RED : "#3b3b3b", marginTop: 6, letterSpacing: 0.5 }}>
              {answered} of {demands.length} answered{isFinal ? " · PERIOD LAPSED" : ""}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
              {demands.map((d, i) => (
                <DocketRow key={d.id} demand={d} index={i} onRespond={respond} />
              ))}
            </ul>
          </section>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            style={{ ...BTN, flex: "none", minWidth: 190, background: PAPER }}
          >
            {downloading ? "PREPARING…" : "DOWNLOAD CERTIFIED COPY"}
          </button>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 10, fontStyle: "italic", color: "#5f5c55", textAlign: "center", marginTop: 8 }}>
          This notice has no legal effect and is not a substitute for a conversation.
        </p>
      </div>

      {/* ── Animated assets. All of them outside the document, always. ─────── */}

      {/* A tick just finished drawing. Smug satisfaction. */}
      {flash === "accepted" && (
        <div style={{ position: "fixed", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 130, display: "flex", alignItems: "center", gap: 10, background: PAPER, border: `1px solid ${INK}`, padding: "8px 12px", maxWidth: "92vw" }}>
          <Motion src={`${ASSET}/head-pat.webm`} poster={`${ASSET}/fighting.webp`} alt="" size={54} />
          <span style={{ fontFamily: TYPE, fontSize: 11, color: INK }}>Demand accepted. Noted for the record.</span>
        </div>
      )}

      {/* A demand was contested. */}
      {flash === "contested" && (
        <div style={{ position: "fixed", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 130, display: "flex", alignItems: "center", gap: 10, background: PAPER, border: `1px solid ${RED}`, padding: "8px 12px", maxWidth: "92vw" }}>
          <Image src={`${ASSET}/fighting.webp`} alt="" width={54} height={54} style={{ width: 54, height: "auto" }} unoptimized />
          <span style={{ fontFamily: TYPE, fontSize: 11, color: RED }}>Contested. State your grounds below.</span>
        </div>
      )}

      {/* The period lapsed while they were reading. */}
      {fearing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(20,20,20,.86)", display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ textAlign: "center" }}>
            <Image src={`${ASSET}/fear.webp`} alt="" width={190} height={190} style={{ width: 190, height: "auto", margin: "0 auto" }} unoptimized />
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, letterSpacing: 6, color: RED, marginTop: 12 }}>
              FINAL NOTICE
            </div>
            <div style={{ fontFamily: TYPE, fontSize: 12, color: "#e8e5dd", marginTop: 6 }}>
              The stipulated period has lapsed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
